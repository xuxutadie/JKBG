import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { requestPatientGuidance } from './patientApi';

// 使用 Vite 的 ?url 方式让 worker 作为静态资源被正确打包
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
const PDF_JS_VERSION = pdfjsLib.version;

// 豆包 (Doubao) API 配置
const CONFIG = {
  API_KEY: '514aeade-bdda-41ee-9d41-fa096a3af597', 
  BASE_URL: 'https://ark.cn-beijing.volces.com/api/v3',
  MODEL: 'ep-20260415184716-swgsg'
};

const createRenderCanvas = (width, height) => {
  if (typeof globalThis !== 'undefined' && globalThis.document?.createElement) {
    const canvas = globalThis.document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.OffscreenCanvas !== 'undefined') {
    return new globalThis.OffscreenCanvas(width, height);
  }

  throw new Error('当前运行环境不支持 Canvas 渲染');
};

const canvasToBase64 = async (canvas) => {
  if (typeof canvas.toDataURL === 'function') {
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  if (typeof canvas.convertToBlob === 'function') {
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  throw new Error('当前 Canvas 对象不支持导出图片');
};

const getCropPreset = (reportType, width, height) => {
  if (reportType === 'inbody') {
    return {
      x: Math.round(width * 0.03),
      y: Math.round(height * 0.11),
      width: Math.round(width * 0.73),
      height: Math.round(height * 0.82)
    };
  }

  if (reportType === 'stress') {
    return {
      x: Math.round(width * 0.03),
      y: Math.round(height * 0.10),
      width: Math.round(width * 0.62),
      height: Math.round(height * 0.72)
    };
  }

  if (reportType === 'sleep') {
    return {
      x: Math.round(width * 0.02),
      y: Math.round(height * 0.03),
      width: Math.round(width * 0.94),
      height: Math.round(height * 0.90)
    };
  }

  if (reportType === 'eye') {
    return {
      x: Math.round(width * 0.04),
      y: Math.round(height * 0.04),
      width: Math.round(width * 0.92),
      height: Math.round(height * 0.90)
    };
  }

  return { x: 0, y: 0, width, height };
};

const getInbodyCropPresets = (width, height) => {
  return [
    {
      // 整体红框区域
      x: Math.round(width * 0.03),
      y: Math.round(height * 0.11),
      width: Math.round(width * 0.73),
      height: Math.round(height * 0.82)
    },
    {
      // 顶部身份信息区
      x: Math.round(width * 0.03),
      y: Math.round(height * 0.11),
      width: Math.round(width * 0.73),
      height: Math.round(height * 0.12)
    },
    {
      // 左侧三块分析区
      x: Math.round(width * 0.03),
      y: Math.round(height * 0.22),
      width: Math.round(width * 0.40),
      height: Math.round(height * 0.71)
    }
  ];
};

const cropCanvas = (sourceCanvas, crop) => {
  const targetCanvas = createRenderCanvas(crop.width, crop.height);
  const targetContext = targetCanvas.getContext('2d');
  if (!targetContext) throw new Error('无法创建裁剪 Canvas 上下文');

  targetContext.drawImage(
    sourceCanvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return targetCanvas;
};

const getSleepPageCropPreset = (pageIndex, width, height) => {
  if (pageIndex === 1) {
    return {
      x: Math.round(width * 0.02),
      y: Math.round(height * 0.05),
      width: Math.round(width * 0.94),
      height: Math.round(height * 0.82)
    };
  }

  return {
    x: Math.round(width * 0.02),
    y: Math.round(height * 0.03),
    width: Math.round(width * 0.94),
    height: Math.round(height * 0.92)
  };
};

const getEyeImageCropPresets = (width, height) => {
  const zoneChart = {
    // 扩大首张“眼象分区图示”的截取范围，避免两侧与标题说明被裁掉
    x: Math.round(width * 0.06),
    y: Math.round(height * 0.10),
    width: Math.round(width * 0.88),
    height: Math.round(height * 0.20)
  };

  const captureResult = {
    // 将“眼象采集结果图片”整体下移并放宽，尽量保留完整眼部图片及下方说明
    x: Math.round(width * 0.06),
    y: Math.round(height * 0.27),
    width: Math.round(width * 0.88),
    height: Math.round(height * 0.30)
  };

  const pageOverviewTop = Math.round(height * 0.28);
  const pageOverviewBottom = Math.round(height * 0.72);

  return {
    pageOverview: {
      // 第一页顶部裁切轻微下移，兼顾眼象分区图示与采集结果区域
      x: Math.round(width * 0.05),
      y: pageOverviewTop,
      width: Math.round(width * 0.90),
      height: pageOverviewBottom - pageOverviewTop
    },
    zoneChart,
    captureResult
  };
};

const getEyeTextDetailCrop = (width, height) => {
  return {
    // 放大正文密集区，优先覆盖中下部建议、调理、注意事项等文字内容。
    x: Math.round(width * 0.05),
    y: Math.round(height * 0.42),
    width: Math.round(width * 0.90),
    height: Math.round(height * 0.52)
  };
};

const readBlobAsArrayBuffer = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

const readUniFileAsArrayBuffer = (filePath) => {
  if (typeof uni === 'undefined' || typeof uni.getFileSystemManager !== 'function') {
    return Promise.reject(new Error('当前环境不支持读取本地临时文件'));
  }

  return new Promise((resolve, reject) => {
    const fs = uni.getFileSystemManager();
    fs.readFile({
      filePath,
      success: (res) => resolve(res.data),
      fail: reject
    });
  });
};

const resolvePdfArrayBuffer = async (fileObj) => {
  const source = fileObj?.raw ?? fileObj;

  if (!source) {
    throw new Error('未获取到可解析的文件对象');
  }

  if (source instanceof ArrayBuffer) {
    return source;
  }

  if (ArrayBuffer.isView(source)) {
    return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  }

  if (typeof source.arrayBuffer === 'function') {
    return await source.arrayBuffer();
  }

  if (typeof Blob !== 'undefined' && source instanceof Blob) {
    return await readBlobAsArrayBuffer(source);
  }

  const nestedFile = source.file || fileObj?.file;
  if (nestedFile) {
    return await resolvePdfArrayBuffer(nestedFile);
  }

  const filePath = source.path || source.tempFilePath || fileObj?.path || fileObj?.tempFilePath;
  if (filePath) {
    if (/^https?:\/\//i.test(filePath) || /^blob:/i.test(filePath) || /^data:/i.test(filePath)) {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`读取文件失败: ${response.status}`);
      }
      return await response.arrayBuffer();
    }

    return await readUniFileAsArrayBuffer(filePath);
  }

  throw new Error('当前文件对象无法读取 PDF 数据');
};

const extractJsonPayload = (str) => {
  const cleaned = String(str || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const start = cleaned.search(/[\{\[]/);
  if (start === -1) {
    return '';
  }

  const openChar = cleaned[start];
  const closeChar = openChar === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return cleaned.slice(start, index + 1);
      }
    }
  }

  return '';
};

const repairJsonString = (str) => {
  let jsonString = extractJsonPayload(str);
  if (!jsonString) return '';

  jsonString = jsonString
    .replace(/^\uFEFF/, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*)'/g, ': "$1"')
    .replace(/}\s*{/g, '},{')
    .replace(/]\s*\[/g, '],[');

  // 补常见缺失逗号: value 后面直接跟下一个 key
  jsonString = jsonString.replace(
    /(["\d}\]eE.truefalsenull])\s+("([A-Za-z0-9_]+)"\s*:)/g,
    '$1,$2'
  );

  return jsonString.trim();
};

const tryParseWithFunction = (str) => {
  try {
    return Function(`"use strict"; return (${str});`)();
  } catch (error) {
    return null;
  }
};

const parseAiJson = (content) => {
  const candidates = [];
  const repaired = repairJsonString(content);

  if (repaired) {
    candidates.push(repaired);
    candidates.push(repaired.replace(/,\s*([}\]])/g, '$1'));
    candidates.push(repaired.replace(/([\]}"])\s+("([A-Za-z0-9_]+)"\s*:)/g, '$1,$2'));
  }

  const rawPayload = extractJsonPayload(content);
  if (rawPayload && !candidates.includes(rawPayload)) {
    candidates.push(rawPayload);
  }

  let lastError = null;

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
      const literalResult = tryParseWithFunction(candidate);
      if (literalResult && typeof literalResult === 'object') {
        return literalResult;
      }
    }
  }

  if (candidates.length) {
    console.error('JSON Parse Error String:', candidates[0]);
  }

  throw lastError || new Error('AI 返回数据格式错误');
};

const detectReportTypeFromText = (rawText = '') => {
  const text = normalizePdfText(rawText);

  if (
    text.includes('InBody') ||
    text.includes('人体成分分析') ||
    text.includes('肌肉脂肪分析') ||
    text.includes('肥胖分析')
  ) {
    return 'inbody';
  }

  if (
    text.includes('眼象健康评估报告') ||
    text.includes('眼象采集结果') ||
    text.includes('眼象分区图示') ||
    text.includes('目测仪') ||
    text.includes('眼象')
  ) {
    return 'eye';
  }

  if (
    text.includes('睡眠') ||
    text.includes('睡眠数据统计') ||
    text.includes('每日统计') ||
    text.includes('指标摘要')
  ) {
    return 'sleep';
  }

  if (
    text.includes('心率变异分析') ||
    text.includes('自主神经') ||
    text.includes('抗压力指数') ||
    text.includes('睡眠指数')
  ) {
    return 'stress';
  }

  return '';
};

const normalizePdfText = (text) => {
  return String(text || '')
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/[：]/g, ':')
    .replace(/\s+/g, ' ')
    .trim();
};

const getSectionText = (text, startLabel, endLabel = '') => {
  const startIndex = text.indexOf(startLabel);
  if (startIndex === -1) return '';
  const fromStart = text.slice(startIndex);

  if (!endLabel) return fromStart;

  const endIndex = fromStart.indexOf(endLabel);
  return endIndex === -1 ? fromStart : fromStart.slice(0, endIndex);
};

const extractFirstNumber = (text) => {
  const match = String(text || '').match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : '';
};

const extractLastNumber = (text) => {
  const matches = String(text || '').match(/-?\d+(?:\.\d+)?/g);
  return matches?.length ? matches[matches.length - 1] : '';
};

const extractRange = (text) => {
  const match = String(text || '').match(/\(([^()]*\d[^()]*)\)/);
  return match ? match[1].trim() : '';
};

const extractFieldValue = (text, label, nextLabels = []) => {
  const startIndex = text.indexOf(label);
  if (startIndex === -1) return '';

  let endIndex = text.length;
  const source = text.slice(startIndex + label.length);
  nextLabels.forEach((nextLabel) => {
    const nextIndex = source.indexOf(nextLabel);
    if (nextIndex !== -1) {
      endIndex = Math.min(endIndex, nextIndex);
    }
  });

  return source.slice(0, endIndex).trim();
};

const extractBodyCompositionMetric = (sectionText, metric, nextMetric = '') => {
  const chunk = getSectionText(sectionText, metric, nextMetric);
  if (!chunk) {
    return null;
  }

  return {
    category: '人体成分分析',
    metric,
    value: extractFirstNumber(chunk),
    unit: metric === '身体总水分' ? 'L' : 'kg',
    range: extractRange(chunk)
  };
};

const extractChartMetric = (sectionText, metric, nextMetric = '', unit = '') => {
  const chunk = getSectionText(sectionText, metric, nextMetric);
  if (!chunk) {
    return null;
  }

  return {
    metric,
    value: extractLastNumber(chunk),
    unit,
    status: ''
  };
};

const parseInbodyFromText = (rawText) => {
  const text = normalizePdfText(rawText);
  if (!text.includes('InBody')) {
    return null;
  }

  const profile = {
    id: extractFieldValue(text, 'ID', ['身高', '年龄']).split(' ')[0] || '',
    height: extractFirstNumber(extractFieldValue(text, '身高', ['年龄', '性别'])) || '',
    age: extractFirstNumber(extractFieldValue(text, '年龄', ['性别', '测试日期/时间'])) || '',
    gender: extractFieldValue(text, '性别', ['测试日期/时间', '人体成分分析']).split(' ')[0] || '',
    testDateTime: extractFieldValue(text, '测试日期/时间', ['人体成分分析', '身体总水分']).trim(),
    score: extractFirstNumber(extractFieldValue(text, 'InBody评分', ['人体成分分析', '身体总水分'])) || ''
  };

  const bodySection = getSectionText(text, '人体成分分析', '肌肉脂肪分析');
  const muscleSection = getSectionText(text, '肌肉脂肪分析', '肥胖分析');
  const obesitySection = getSectionText(text, '肥胖分析');

  const bodyComposition = [
    extractBodyCompositionMetric(bodySection, '身体总水分', '蛋白质'),
    extractBodyCompositionMetric(bodySection, '蛋白质', '无机盐'),
    extractBodyCompositionMetric(bodySection, '无机盐', '体脂肪'),
    extractBodyCompositionMetric(bodySection, '体脂肪', '去脂体重'),
    extractBodyCompositionMetric(bodySection, '体重')
  ].filter(Boolean);

  const muscleFatAnalysis = [
    extractChartMetric(muscleSection, '体重', '骨骼肌', 'kg'),
    extractChartMetric(muscleSection, '骨骼肌', '体脂肪', 'kg'),
    extractChartMetric(muscleSection, '体脂肪', '', 'kg')
  ].filter(Boolean);

  const obesityAnalysis = [
    extractChartMetric(obesitySection, '身体质量指数', '体脂百分比', 'kg/m2'),
    extractChartMetric(obesitySection, '体脂百分比', '', '%')
  ].filter(Boolean).map((item) => ({
    ...item,
    metric: item.metric === '身体质量指数' ? '身体质量指数(BMI)' : item.metric
  }));

  const findMetricValue = (rows, metricNames) => {
    const names = Array.isArray(metricNames) ? metricNames : [metricNames];
    return rows.find((row) => names.some((name) => row.metric.includes(name)))?.value || '';
  };

  const summary = {
    weight: findMetricValue(muscleFatAnalysis, '体重') || findMetricValue(bodyComposition, '体重'),
    muscle: findMetricValue(muscleFatAnalysis, ['骨骼肌', '骨骼肌量']),
    fat: findMetricValue(muscleFatAnalysis, '体脂肪') || findMetricValue(bodyComposition, '体脂肪'),
    bmi: findMetricValue(obesityAnalysis, ['身体质量指数', 'BMI']),
    fatRate: findMetricValue(obesityAnalysis, ['体脂百分比', '体脂率']),
    visceralFat: '',
    ffm: extractFirstNumber(getSectionText(bodySection, '去脂体重', '体重')),
    bmr: '',
    tbw: findMetricValue(bodyComposition, '身体总水分'),
    protein: findMetricValue(bodyComposition, '蛋白质'),
    minerals: findMetricValue(bodyComposition, '无机盐')
  };

  const extractedCount =
    bodyComposition.filter(item => item.value).length +
    muscleFatAnalysis.filter(item => item.value).length +
    obesityAnalysis.filter(item => item.value).length;

  if (extractedCount < 5) {
    return null;
  }

  return {
    profile,
    summary,
    bodyComposition,
    muscleFatAnalysis,
    obesityAnalysis
  };
};

/**
 * 增强版的 PDF 解析函数：支持文本提取 + 扫描件转图片 OCR
 */
export const extractContentFromPDF = async (fileObj, reportType = 'generic') => {
  try {
    const arrayBuffer = await resolvePdfArrayBuffer(fileObj);

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/cmaps/`,
      cMapPacked: true,
      // 增加自动处理空密码逻辑，防止某些 PDF 因权限限制报错
      stopAtErrors: false,
    });
    
    // 监听密码请求事件
    loadingTask.onPassword = (updatePassword, reason) => {
      console.warn('PDF 需要密码:', reason);
      updatePassword(''); // 尝试空密码
    };

    let pdf;
    try {
      pdf = await loadingTask.promise;
    } catch (err) {
      if (err.name === 'PasswordException') {
        throw new Error('该 PDF 文件受密码保护，请先解除密码后再上传。');
      } else if (err.name === 'InvalidPDFException') {
        throw new Error('无效的 PDF 文件格式，请检查文件是否损坏。');
      } else {
        throw err;
      }
    }

    let fullText = '';
    let hasText = false;
    
    // 1. 先尝试提取文本
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        if (textContent.items.length > 0) {
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
          hasText = true;
        }
      } catch (pageErr) {
        console.warn(`第 ${i} 页提取失败:`, pageErr);
      }
    }

    const resolvedReportType = detectReportTypeFromText(fullText) || reportType;

    if (resolvedReportType === 'inbody' && fullText.trim()) {
      const parsedInbody = parseInbodyFromText(fullText);
      if (parsedInbody) {
        return { type: 'structured', data: parsedInbody, reportType: resolvedReportType };
      }
    }
    
    // 2. InBody 固定走图片识别；眼象优先尝试图片识别，失败时降级为文本解析
    if (resolvedReportType === 'inbody' || resolvedReportType === 'eye' || !hasText || fullText.trim().length < 20) {
      console.log('检测到扫描件或特殊编码 PDF，正在进行视觉化渲染...');
      try {
        if (resolvedReportType === 'eye') {
          const images = [];
          // 眼象报告正文常位于后续页面，至少覆盖前 6 页，避免图片页正文漏采。
          const pageCount = Math.min(pdf.numPages, 6);
          let preservedImages = {
            pageOverview: '',
            zoneChart: '',
            captureResult: ''
          };

          for (let pageIndex = 1; pageIndex <= pageCount; pageIndex++) {
            const page = await pdf.getPage(pageIndex);
            const viewport = page.getViewport({ scale: 1.3 });
            const canvas = createRenderCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');
            if (!context) {
              throw new Error('无法创建 Canvas 上下文');
            }

            await page.render({ canvasContext: context, viewport }).promise;
            const base64Image = await canvasToBase64(canvas);
            images.push(base64Image);

            if (pageIndex >= 2) {
              const textDetailCrop = getEyeTextDetailCrop(canvas.width, canvas.height);
              const textDetailCanvas = cropCanvas(canvas, textDetailCrop);
              images.push(await canvasToBase64(textDetailCanvas));
            }

            if (pageIndex === 1) {
              const cropPresets = getEyeImageCropPresets(canvas.width, canvas.height);
              const overviewCanvas = cropCanvas(canvas, cropPresets.pageOverview);
              const zoneCanvas = cropCanvas(canvas, cropPresets.zoneChart);
              const captureCanvas = cropCanvas(canvas, cropPresets.captureResult);
              preservedImages = {
                pageOverview: await canvasToBase64(overviewCanvas),
                zoneChart: await canvasToBase64(zoneCanvas),
                captureResult: await canvasToBase64(captureCanvas)
              };
            }
          }

          return {
            type: 'image',
            data: images,
            reportType: resolvedReportType,
            preservedImages,
            rawText: fullText
          };
        }

        if (resolvedReportType === 'sleep') {
          const images = [];
          const pageCount = Math.min(pdf.numPages, 3);

          for (let pageIndex = 1; pageIndex <= pageCount; pageIndex++) {
            const page = await pdf.getPage(pageIndex);
            const viewport = page.getViewport({ scale: 1.2 });
            const canvas = createRenderCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');
            if (!context) {
              throw new Error('无法创建 Canvas 上下文');
            }

            await page.render({ canvasContext: context, viewport }).promise;
            const crop = getSleepPageCropPreset(pageIndex, canvas.width, canvas.height);
            const croppedCanvas = cropCanvas(canvas, crop);
            const base64Image = await canvasToBase64(croppedCanvas);
            images.push(base64Image);
          }

          return { type: 'image', data: images };
        }

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.35 });
        const canvas = createRenderCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('无法创建 Canvas 上下文');
        }

        await page.render({ canvasContext: context, viewport }).promise;

        if (resolvedReportType === 'inbody') {
          const images = [];
          const cropPresets = getInbodyCropPresets(canvas.width, canvas.height);

          for (const crop of cropPresets) {
            const croppedCanvas = cropCanvas(canvas, crop);
            const base64Image = await canvasToBase64(croppedCanvas);
            images.push(base64Image);
          }

          return { type: 'image', data: images, reportType: resolvedReportType };
        }

        const crop = getCropPreset(resolvedReportType, canvas.width, canvas.height);
        const croppedCanvas = cropCanvas(canvas, crop);
        const base64Image = await canvasToBase64(croppedCanvas);
        return { type: 'image', data: base64Image, reportType: resolvedReportType };
      } catch (renderErr) {
        console.error('Canvas 渲染失败:', renderErr);

        // 眼象报告即使原图提取失败，也尽量继续走文本表格解析，避免整份档案无法生成。
        if (resolvedReportType === 'eye' && fullText.trim().length >= 20) {
          console.warn('眼象报告原图提取失败，已自动降级为文本解析。');
          return {
            type: 'text',
            data: fullText,
            reportType: resolvedReportType,
            preservedImages: {
              pageOverview: '',
              zoneChart: '',
              captureResult: ''
            },
            imageExtractionFailed: true
          };
        }

        throw new Error('PDF 页面转图片失败，当前文件仍可尝试通过文本内容解析。');
      }
    }
    
    return { type: 'text', data: fullText, reportType: resolvedReportType };
  } catch (error) {
    console.error('PDF 核心处理异常:', error);
    // 返回更准确的错误描述
    throw new Error(error.message.includes('PDF') ? error.message : `解析失败: ${error.message}`);
  }
};

/**
 * 统一的解析接口：支持文本或图片输入
 */
export const parseHealthReport = async (contentObj, type) => {
  if (!CONFIG.API_KEY) throw new Error('请配置 API_KEY');

  if (contentObj.type === 'structured') {
    return contentObj.data;
  }

  let messages = [];
  const systemPrompt = "你是一个精确的医疗报告数据提取助手。请严格按要求返回标准 JSON，不要解释，不要 markdown，不要遗漏字段；如果某字段不存在则返回空字符串。";
  const userPrompt = type === 'inbody' 
    ? `请提取 InBody 报告中“红框标注”的内容，只提取红框内字段，并返回如下 JSON：
{
  "profile": {
    "id": "",
    "height": "",
    "age": "",
    "gender": "",
    "testDateTime": "",
    "score": ""
  },
  "summary": {
    "weight": "",
    "muscle": "",
    "fat": "",
    "bmi": "",
    "fatRate": "",
    "visceralFat": "",
    "ffm": "",
    "bmr": "",
    "tbw": "",
    "protein": "",
    "minerals": ""
  },
  "bodyComposition": [
    { "category": "人体成分分析", "metric": "身体总水分", "value": "", "unit": "", "range": "" },
    { "category": "人体成分分析", "metric": "蛋白质", "value": "", "unit": "", "range": "" },
    { "category": "人体成分分析", "metric": "无机盐", "value": "", "unit": "", "range": "" },
    { "category": "人体成分分析", "metric": "体脂肪", "value": "", "unit": "", "range": "" },
    { "category": "人体成分分析", "metric": "体重", "value": "", "unit": "", "range": "" }
  ],
  "muscleFatAnalysis": [
    { "metric": "体重", "value": "", "unit": "kg", "status": "" },
    { "metric": "骨骼肌", "value": "", "unit": "kg", "status": "" },
    { "metric": "体脂肪", "value": "", "unit": "kg", "status": "" }
  ],
  "obesityAnalysis": [
    { "metric": "身体质量指数(BMI)", "value": "", "unit": "kg/m2", "status": "" },
    { "metric": "体脂百分比", "value": "", "unit": "%", "status": "" }
  ]
}
要求：
1. 顶部红框必须提取 6 个字段：ID、身高、年龄、性别、测试日期/时间、InBody评分。如红框内没有 InBody评分，则 profile.score 返回空字符串。
2. 左侧大红框中必须完整提取 3 个区域，不允许遗漏：
   - 人体成分分析：身体总水分、蛋白质、无机盐、体脂肪、体重
   - 肌肉脂肪分析：体重、骨骼肌、体脂肪
   - 肥胖分析：身体质量指数(BMI)、体脂百分比
3. 每个项目的 value 必须填写图中展示的实际数值；unit 必须填写单位；range/status 尽量根据红框内文字或刻度区间填写。
4. summary 字段必须优先从红框中的 10 个项目回填：
   - weight=体重
   - muscle=骨骼肌
   - fat=体脂肪
   - bmi=身体质量指数(BMI)
   - fatRate=体脂百分比
   - tbw=身体总水分
   - protein=蛋白质
   - minerals=无机盐
   - ffm=去脂体重
   其余 red frame 中未明确出现的 summary 字段可返回空字符串。
5. 如果你收到多张图片：第1张是整体红框区域，第2张是顶部身份信息区，第3张是左侧三块分析区。请综合三张图片结果输出一个 JSON。
6. 只返回合法 JSON，不要输出解释文字。`
    : type === 'sleep'
    ? `请提取睡眠监测报告图片中展示的关键信息，并返回如下 JSON：
{
  "profile": {
    "name": "",
    "gender": "",
    "birthDate": "",
    "age": "",
    "height": "",
    "weight": "",
    "bmi": "",
    "code": "",
    "phone": "",
    "address": "",
    "chiefComplaint": ""
  },
  "monitorInfo": {
    "dataId": "",
    "device": "",
    "wearPosition": "",
    "startTime": "",
    "endTime": "",
    "duration": ""
  },
  "monitorParams": {
    "acceleration": "",
    "environment": "",
    "pressure": "",
    "skinTemp": "",
    "algorithm": ""
  },
  "sleepMetrics": [
    { "metric": "关灯时间", "value": "", "unit": "h:min" },
    { "metric": "开灯时间", "value": "", "unit": "h:min" },
    { "metric": "总睡眠时间 TST", "value": "", "unit": "min" },
    { "metric": "总卧床时间 TIB", "value": "", "unit": "min" },
    { "metric": "睡眠潜伏期 SL", "value": "", "unit": "min" },
    { "metric": "入睡后觉醒时间 WASO", "value": "", "unit": "min" },
    { "metric": "睡眠效率 SE", "value": "", "unit": "%" },
    { "metric": "觉醒次数 NWAL", "value": "", "unit": "次" },
    { "metric": "觉醒指数 ArI", "value": "", "unit": "" },
    { "metric": "睡眠碎片指数 SFI", "value": "", "unit": "" },
    { "metric": "最长连续睡眠时长", "value": "", "unit": "min" },
    { "metric": "R期睡眠潜伏期", "value": "", "unit": "min" },
    { "metric": "浅睡时间", "value": "", "unit": "min" },
    { "metric": "浅睡占比", "value": "", "unit": "%" },
    { "metric": "深睡时间", "value": "", "unit": "min" },
    { "metric": "深睡占比", "value": "", "unit": "%" },
    { "metric": "R期睡眠时间", "value": "", "unit": "min" },
    { "metric": "R期睡眠占比", "value": "", "unit": "%" },
    { "metric": "睡眠中心点", "value": "", "unit": "h:min" },
    { "metric": "小睡时长", "value": "", "unit": "min" },
    { "metric": "睡眠规律性指数 SRI", "value": "", "unit": "" }
  ],
  "sleepStatistics": {
    "title": "睡眠数据统计",
    "headers": [],
    "rows": []
  },
  "dailyStatistics": {
    "title": "每日统计",
    "headers": [],
    "rows": []
  },
  "summary": ""
}
要求：
1. 第1张图重点提取“被试者信息”“监测信息”“监测参数”“总结”。
2. 第2张图重点提取“1.1 指标摘要”表格和“1.2 睡眠分析解读”。
3. 第3张图或后续页面如果出现“睡眠数据统计”“每日统计”两张表，必须完整提取到对应字段。
4. sleepStatistics.headers 和 dailyStatistics.headers 必须按表头原顺序返回；rows 必须按原表行顺序返回，格式为二维数组。
5. 必须提取“1.1 指标摘要”表格里的所有指标，不允许遗漏。
6. 总结部分返回完整自然语言段落。请极其注意：所有字符串（尤其是 summary）内部若有换行或引号，必须使用 \\n 和 \\" 进行严格转义，确保最终输出的是合法的 JSON 字符串！若某张统计表不存在，请返回空数组。`
    : type === 'eye'
    ? `请提取“眼象健康评估报告 / 目测仪检测报告”中的关键信息，并返回如下 JSON：
{
  "profile": {
    "name": "",
    "gender": "",
    "age": "",
    "birthDate": "",
    "phone": "",
    "idCard": ""
  },
  "eyeFindings": [
    { "item": "", "left": "", "right": "" }
  ],
  "summary": "",
  "healthAdvice": "",
  "dietAdvice": "",
  "lifestyleAdvice": "",
  "detailSections": [
    { "title": "", "content": "" }
  ]
}
要求：
1. 只提取与用户健康评估有关的信息，不要返回审核者、审核日期、报告生成日期、签字信息。
2. 基础资料仅保留姓名、性别、年龄、出生日期、手机号、身份证号；没有就返回空字符串。
3. 必须提取“眼象采集结果”表格，按原顺序返回 item、left、right；如果表格某列是“左/右”或“左眼/右眼”，都统一映射成 left、right。
4. 必须提取“综合分析结论”并写入 summary。
5. 如果报告中还有“健康干预要点 / 食疗指导 / 生活起居 / 情志调适”等建议内容，请优先汇总到 healthAdvice、dietAdvice、lifestyleAdvice；没有则返回空字符串。
6. 除 summary 和 advice 外，还要尽量完整提取正文中的其他有效章节，例如“综合分析结论”“健康干预指导”“饮食调理”“生活起居”“运动建议”“调养方案”等，按原文标题和正文写入 detailSections，不要拆成过短碎句。
7. 必须逐页识别图片中可见文字，不能只提取首页或局部截图；后续页面中的正文、条目、分点、调理建议、注意事项都要纳入提取。
8. 如果图片里出现长段文字，请优先按原文标题归类到 detailSections，正文尽量保留原句，不要只压缩成一句摘要。
9. 若同时提供了“图片内容”和“可提取文本”，请交叉校对，优先补齐图片中的遗漏信息。
10. 输入图片可能包含“整页图 + 下半页文字放大图”，请把它们视为同一份报告的互补视角，优先利用放大图补齐下方密集文字。
11. 只返回合法 JSON，不要输出解释文字。`
    : `请提取“心率变异分析(自主神经)报告”中的两类数据，并返回如下 JSON：
{
  "profile": {
    "name": "",
    "gender": "",
    "birthDate": "",
    "age": "",
    "idCard": "",
    "reportTime": ""
  },
  "stressMetrics": [
    { "item": "正常R-R间距变化(RRIV)", "value": "", "result": "", "standard": "" },
    { "item": "体质量指数(BMI)", "value": "", "result": "", "standard": "" },
    { "item": "心跳速度(Heart Rate)", "value": "", "result": "", "standard": "" },
    { "item": "自律神经年龄(ANS Age)", "value": "", "result": "", "standard": "" },
    { "item": "自律神经偏向(Balance)", "value": "", "result": "", "standard": "" },
    { "item": "自律神经总体功能(ANS)", "value": "", "result": "", "standard": "" },
    { "item": "交感神经功能(SYM)", "value": "", "result": "", "standard": "" },
    { "item": "副交感神经功能(VAG)", "value": "", "result": "", "standard": "" },
    { "item": "NN间距标准偏差(SDNN)", "value": "", "result": "", "standard": "" },
    { "item": "交感调控(SYM Modulation)", "value": "", "result": "", "standard": "" },
    { "item": "R波校度(R Wave Validity)", "value": "", "result": "", "standard": "" },
    { "item": "睡眠指数", "value": "", "result": "", "standard": "" },
    { "item": "情绪指数", "value": "", "result": "", "standard": "" },
    { "item": "活力指数", "value": "", "result": "", "standard": "" },
    { "item": "抗压力指数", "value": "", "result": "", "standard": "" }
  ]
}
重点要求：
1. 必须提取基础数据中的姓名、性别、出生日期、年龄、身份证号。
2. 必须优先提取“检测数据”表格中项目、检测数值(单位)、结果说明、标准范围四列。
3. 不允许遗漏红框区域里的任何一行。`;

  if (contentObj.type === 'text') {
    messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${userPrompt}\n文本内容如下：\n${contentObj.data}` }
    ];
  } else {
    // 视觉模型调用 (豆包多模态接口)
    const imageContents = Array.isArray(contentObj.data)
      ? contentObj.data.map((url) => ({ type: "image_url", image_url: { url } }))
      : [{ type: "image_url", image_url: { url: contentObj.data } }];
    const supplementalText = type === 'eye' && contentObj.rawText
      ? `\n以下是从 PDF 中额外提取到的文本，可用于补充校对图片识别结果，但不能忽略图片里独有的正文内容：\n${contentObj.rawText}`
      : '';

    messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: `${userPrompt}${supplementalText}` },
          ...imageContents
        ]
      }
    ];
  }

  try {
    if (typeof fetch !== 'undefined') {
      const response = await fetch(`${CONFIG.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: CONFIG.MODEL,
          messages: messages,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI 服务异常: ${errorData.error?.message || errorData.msg || response.statusText}`);
      }

      const responseData = await response.json();
      const content = responseData?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`AI 返回为空: ${JSON.stringify(responseData)}`);
    }

    return parseAiJson(content);
  }

    const responseTuple = await uni.request({
      url: `${CONFIG.BASE_URL}/chat/completions`,
      method: 'POST',
      timeout: 600000,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.API_KEY}`
      },
      data: {
        model: CONFIG.MODEL,
        messages: messages,
        temperature: 0.1
      }
    });

    const requestError = Array.isArray(responseTuple) ? responseTuple[0] : null;
    const response = Array.isArray(responseTuple) ? responseTuple[1] : responseTuple;

    if (requestError) {
      throw new Error(requestError.errMsg || '请求豆包接口失败');
    }

    if (!response || response.statusCode !== 200) {
      const errorMessage =
        response?.data?.error?.message ||
        response?.data?.msg ||
        response?.errMsg ||
        '状态异常';
      throw new Error(`AI 服务异常: ${errorMessage}`);
    }

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`AI 返回为空: ${JSON.stringify(response.data || {})}`);
    }

    return parseAiJson(content);
  } catch (error) {
    console.error('AI 解析失败:', error);
    const message = error?.message || JSON.stringify(error);

    if (contentObj.type === 'image' && /image|vision|multimodal|content/i.test(message)) {
      throw new Error('当前豆包接入点可能不支持图片/OCR 解析，请更换为支持视觉能力的豆包模型接入点。');
    }

    throw new Error(message);
  }
};

export const generateHealthGuidance = async (patientPayload) => {
  try {
    const response = await requestPatientGuidance({
      patientId: patientPayload?.patient?.id || 'temp-patient',
      payload: patientPayload
    });
    return response?.result || {};
  } catch (error) {
    console.error('AI 建议生成失败:', error);
    throw new Error(error?.message || 'AI 建议生成失败');
  }
};
