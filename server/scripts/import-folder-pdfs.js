import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { prisma } from '../src/lib/prisma.js';
import { createPatientWithReport } from '../src/services/patientService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_DIR = path.resolve(__dirname, '..');
const DEFAULT_IMPORT_DIR = 'C:\\Users\\6\\Downloads\\目诊仪';
const STORAGE_DIR = path.join(SERVER_DIR, 'storage', 'imported-pdfs');

const normalizeWhitespace = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const normalizeFileStem = (value) => {
  return String(value || '')
    .replace(/\.[^.]+$/, '')
    .replace(/[（(][^)）]*[)）]$/g, '')
    .replace(/\d+$/g, '')
    .trim();
};

const toLabeledItems = (pairs) => {
  return pairs
    .filter(([_, value]) => normalizeWhitespace(value))
    .map(([label, value]) => ({ label, value: normalizeWhitespace(value), unit: '' }));
};

const getSourceMeta = (relativePath) => {
  const normalized = relativePath.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  if (segments.includes('心率变异性')) {
    return { type: 'stress', label: '压力检测', folder: '心率变异性' };
  }
  if (segments.includes('目诊仪')) {
    return { type: 'eye', label: '眼象检测', folder: '目诊仪' };
  }
  return { type: 'combined', label: '综合档案', folder: '导入目录' };
};

const collectPdfFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectPdfFiles(fullPath));
      continue;
    }
    if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
};

const extractPdfText = async (filePath) => {
  const data = await fs.readFile(filePath);
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(data)
  });
  const pdf = await loadingTask.promise;
  const pageTexts = [];
  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    const text = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) {
      pageTexts.push(text);
    }
  }
  return {
    pageCount: pdf.numPages,
    text: pageTexts.join('\n\n')
  };
};

const pickFieldValue = (text, labels, options = {}) => {
  const source = String(text || '');
  for (const label of labels) {
    const pattern = options.greedy
      ? new RegExp(`${label}\\s*[:：]?\\s*([\\s\\S]{1,200})`, 'i')
      : new RegExp(`${label}\\s*[:：]?\\s*([^\\n\\r]{1,80})`, 'i');
    const matched = source.match(pattern);
    if (matched?.[1]) {
      return normalizeWhitespace(matched[1]);
    }
  }
  return '';
};

const pickName = (text, fallbackName) => {
  const fallback = normalizeFileStem(fallbackName);
  const matched = pickFieldValue(text, ['姓名', '名字', '受检者', '客户姓名']);
  if (matched) {
    const cleaned = matched.match(/^[\u4e00-\u9fa5A-Za-z·]{1,20}/)?.[0] || matched;
    if (cleaned && cleaned.length >= 2) return cleaned;
  }
  return fallback;
};

const pickGender = (text) => {
  const direct = pickFieldValue(text, ['性别']);
  if (/(男|male)/i.test(direct)) return '男';
  if (/(女|female)/i.test(direct)) return '女';
  const loose = text.match(/性别\s*[:：]?\s*(男|女)/);
  return loose?.[1] || '';
};

const pickAge = (text) => {
  const direct = pickFieldValue(text, ['年龄']);
  const matched = direct.match(/\d{1,3}/) || text.match(/年龄\s*[:：]?\s*(\d{1,3})/);
  return matched?.[1] || matched?.[0] || '';
};

const normalizeDateText = (value) => {
  const text = normalizeWhitespace(value);
  if (!text) return '';
  const digits = text.replace(/\D/g, '');
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return text;
};

const pickBirthDate = (text) => {
  const direct = pickFieldValue(text, ['出生日期', '生日']);
  return normalizeDateText(direct);
};

const pickReportDate = (text, fileStats) => {
  const direct = pickFieldValue(text, ['报告生成日期', '报告时间', '测试日期', '日期']);
  const normalized = normalizeDateText(direct);
  if (normalized) return normalized;
  const date = fileStats?.birthtime || fileStats?.mtime || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const copyToStorage = async (sourceFilePath, relativePath) => {
  const safeRelativePath = relativePath.replace(/^([\\/]+)/, '');
  const targetPath = path.join(STORAGE_DIR, safeRelativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourceFilePath, targetPath);
  return targetPath;
};

const buildImportedReportData = ({ sourceType, fileName, name, gender, age, birthDate, reportDate, text, relativePath, storedRelativePath }) => {
  const commonMeta = {
    fileName,
    type: sourceType,
    sourceTypes: [sourceType],
    importedText: text || '',
    importMeta: {
      relativePath,
      storedRelativePath,
      importedFrom: 'folder-batch-import'
    }
  };

  if (sourceType === 'eye') {
    return {
      ...commonMeta,
      eyeProfile: toLabeledItems([
        ['姓名', name],
        ['性别', gender],
        ['年龄', age],
        ['出生日期', birthDate],
        ['报告生成日期', reportDate]
      ]),
      eyeSummaryText: '',
      eyeAdviceText: '',
      eyeDetailSections: text ? [{ title: '导入原文', content: text }] : []
    };
  }

  if (sourceType === 'stress') {
    return {
      ...commonMeta,
      profile: toLabeledItems([
        ['姓名', name],
        ['性别', gender],
        ['年龄', age],
        ['出生日期', birthDate],
        ['报告生成日期', reportDate]
      ]),
      stressTable: text
        ? [{
            category: '批量导入',
            metric: '原文长度',
            value: String(text.length),
            unit: '字符',
            range: ''
          }]
        : [],
      stress: []
    };
  }

  return {
    ...commonMeta,
    profile: toLabeledItems([
      ['姓名', name],
      ['性别', gender],
      ['年龄', age],
      ['出生日期', birthDate],
      ['报告生成日期', reportDate]
    ])
  };
};

const main = async () => {
  const importDir = path.resolve(process.argv[2] || DEFAULT_IMPORT_DIR);
  console.log(`开始导入目录: ${importDir}`);

  const sourceStats = await fs.stat(importDir).catch(() => null);
  if (!sourceStats?.isDirectory()) {
    throw new Error(`导入目录不存在: ${importDir}`);
  }

  const files = await collectPdfFiles(importDir);
  if (!files.length) {
    console.log('未发现可导入的 PDF 文件。');
    return;
  }

  const existingReports = await prisma.report.findMany({
    select: {
      fileName: true,
      rawRecord: true
    }
  });
  const importedKeys = new Set(
    existingReports
      .map(report => report?.rawRecord?.importSourceKey)
      .filter(Boolean)
  );

  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const filePath of files) {
    const relativePath = path.relative(importDir, filePath);
    const importSourceKey = relativePath.replace(/\\/g, '/').toLowerCase();
    if (importedKeys.has(importSourceKey)) {
      skippedCount += 1;
      console.log(`跳过已导入: ${relativePath}`);
      continue;
    }

    try {
      const fileName = path.basename(filePath);
      const fileStats = await fs.stat(filePath);
      const sourceMeta = getSourceMeta(relativePath);
      const { text, pageCount } = await extractPdfText(filePath);
      const name = pickName(text, fileName);
      const gender = pickGender(text);
      const age = pickAge(text);
      const birthDate = pickBirthDate(text);
      const reportDate = pickReportDate(text, fileStats);
      const storedPath = await copyToStorage(filePath, relativePath);
      const storedRelativePath = path.relative(SERVER_DIR, storedPath).replace(/\\/g, '/');

      const payload = {
        name,
        gender,
        age,
        status: 'ready',
        statusText: '待出报告',
        date: reportDate,
        sourceLabels: [sourceMeta.type],
        rawRecord: {
          importSourceKey,
          originalFilePath: filePath,
          storedRelativePath,
          originalFolder: sourceMeta.folder,
          pageCount,
          importedAt: new Date().toISOString()
        },
        reportData: buildImportedReportData({
          sourceType: sourceMeta.type,
          fileName,
          name,
          gender,
          age,
          birthDate,
          reportDate,
          text,
          relativePath: relativePath.replace(/\\/g, '/'),
          storedRelativePath
        })
      };

      const result = await createPatientWithReport(payload);
      importedKeys.add(importSourceKey);
      importedCount += 1;
      console.log(`已导入: ${relativePath} -> ${result.name} (${sourceMeta.label})`);
    } catch (error) {
      failedCount += 1;
      console.error(`导入失败: ${relativePath}`);
      console.error(error);
    }
  }

  console.log('');
  console.log(`导入完成: 成功 ${importedCount}，跳过 ${skippedCount}，失败 ${failedCount}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
