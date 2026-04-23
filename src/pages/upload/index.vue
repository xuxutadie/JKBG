<template>
  <view class="upload-wrapper">
    <view class="bg-canvas"></view>

    <!-- 顶部导航栏 -->
    <div class="head">
      <div class="head-left">
        <div class="back-btn" @click="goToDashboard">
          <img src="/static/images/icon6.png" style="filter: brightness(0) invert(1); width: 18px; transform: rotate(90deg);" />
        </div>
        <h1><a href="javascript:void(0)">内部管理系统 - 数据采集与AI解析</a></h1>
      </div>
      <div class="nav-links">
        <div class="nav-btn" @click="goToDashboard">独立展开看板</div>
        <div class="nav-btn active">数据采集</div>
        <div class="nav-btn" @click="goToReport">智能报告</div>
      </div>
      <div class="user-info">
        <img src="/static/images/icon2.png" style="filter: brightness(0) invert(1); width: 24px;" />
        <span>管理员</span>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧：上传区 -->
      <div class="left-panel boxall">
        <div class="panel-title">PDF 报告批量上传</div>
        
        <div class="upload-area" @click="triggerUpload" :class="{ 'is-dragging': isDragging }" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">
          <div class="upload-icon">
            <img src="/static/images/icon1.png" alt="upload" style="filter: brightness(0) invert(1); width: 40px; opacity: 0.8;" />
          </div>
          <h3>点击或拖拽 PDF 文件到此处</h3>
          <p>支持 InBody 报告、精神压力报告等多文件批量上传解析</p>
          <input type="file" ref="fileInput" style="display: none" multiple accept=".pdf" @change="handleFileChange" />
        </div>

        <div class="file-list" v-if="files.length > 0">
          <div class="file-item" v-for="(file, index) in files" :key="index">
            <div class="file-info">
              <div class="file-main">
                <img src="/static/images/icon4.png" style="width: 20px; filter: brightness(0) invert(1); margin-right: 10px;" />
                <span class="file-name">{{ file.name }}</span>
              </div>
              <span class="file-status" :class="file.status">{{ getStatusText(file.status) }}</span>
            </div>
            <div class="progress-bar" v-if="file.status === 'parsing'">
              <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
            </div>
            <div class="file-actions" v-if="file.status === 'ready'">
              <span class="delete-btn" @click.stop="removeFile(index)">移除</span>
            </div>
          </div>
        </div>

        <div class="action-btn-group" v-if="files.length > 0">
          <button class="primary-btn" @click="startParsing" :disabled="isParsing">
            <span v-if="!isParsing">开始 AI 智能解析</span>
            <span v-else>解析中... {{ totalProgress }}%</span>
          </button>
          <button class="secondary-btn" @click="resetData" v-if="!isParsing">全部清空</button>
        </div>
      </div>

      <!-- 右侧：解析结果预览区 -->
      <div class="right-panel boxall">
        <div class="panel-title">AI 解析数据核验区</div>
        
        <div class="empty-state" v-if="parsedReports.length === 0">
          <div class="empty-content">
            <img src="/static/images/icon1.png" style="width: 60px; opacity: 0.2; filter: brightness(0) invert(1);" />
            <p>暂无解析数据，请先上传并解析报告</p>
          </div>
        </div>

        <div class="parsed-content" v-else>
          <div class="report-block" v-for="(report, reportIndex) in parsedReports" :key="`${report.fileName}-${reportIndex}`">
          <div class="report-file-title">{{ report.fileName }}</div>

          <div class="data-section anim-slide-up" style="margin-top: 20px; animation-delay: 0.1s;" v-if="report.inbodyProfile">
            <h4 class="section-title"><span class="indicator"></span>InBody 基础资料</h4>
            <div class="profile-grid">
              <div class="data-card" v-for="item in report.inbodyProfile" :key="item.label">
                <span class="label">{{ item.label }}</span>
                <div class="value-wrapper">
                  <input class="value-input" v-model="item.value" />
                  <small class="unit">{{ item.unit || '' }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- 人体成分数据 -->
          <div class="data-section anim-slide-up" v-if="report.inbody && report.inbody.length">
            <h4 class="section-title"><span class="indicator"></span>人体成分分析 (InBody)</h4>
            <div class="data-grid">
              <div class="data-card" v-for="item in report.inbody" :key="item.label" :class="{ 'warning': item.isWarning }">
                <span class="label">{{ item.label }}</span>
                <div class="value-wrapper">
                  <input class="value-input" v-model="item.value" @input="checkWarning(item, 'inbody')" />
                  <small class="unit">{{ item.unit }}</small>
                </div>
                <span class="status-badge" v-if="item.isWarning">异常预警</span>
              </div>
            </div>
            <div class="stress-table-wrapper" v-if="report.inbodyTable && report.inbodyTable.length">
              <table class="stress-table">
                <thead>
                  <tr>
                    <th>分类</th>
                    <th>项目</th>
                    <th>数值</th>
                    <th>单位</th>
                    <th>标准范围</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in report.inbodyTable" :key="`${row.metric}-${index}`">
                    <td><input class="table-input" v-model="row.category" /></td>
                    <td><input class="table-input" v-model="row.metric" /></td>
                    <td><input class="table-input" v-model="row.value" /></td>
                    <td><input class="table-input" v-model="row.unit" /></td>
                    <td><input class="table-input" v-model="row.range" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px; animation-delay: 0.12s;" v-if="report.muscleFatAnalysis && report.muscleFatAnalysis.length">
            <h4 class="section-title"><span class="indicator"></span>肌肉脂肪分析图</h4>
            <div class="chart-metric-list">
              <div class="chart-metric-card" v-for="item in report.muscleFatAnalysis" :key="item.metric">
                <div class="chart-metric-head">
                  <span>{{ item.metric }}</span>
                  <span class="chart-metric-value">{{ item.value }} {{ item.unit }}</span>
                </div>
                <div class="chart-track">
                  <div class="chart-fill" :style="{ width: getChartWidth(item.value, item.metric) }"></div>
                </div>
                <div class="chart-status">{{ item.status || '未标注' }}</div>
              </div>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px; animation-delay: 0.14s;" v-if="report.obesityAnalysis && report.obesityAnalysis.length">
            <h4 class="section-title"><span class="indicator"></span>肥胖分析图</h4>
            <div class="chart-metric-list">
              <div class="chart-metric-card" v-for="item in report.obesityAnalysis" :key="item.metric">
                <div class="chart-metric-head">
                  <span>{{ item.metric }}</span>
                  <span class="chart-metric-value">{{ item.value }} {{ item.unit }}</span>
                </div>
                <div class="chart-track">
                  <div class="chart-fill warning" :style="{ width: getChartWidth(item.value, item.metric) }"></div>
                </div>
                <div class="chart-status">{{ item.status || '未标注' }}</div>
              </div>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px;" v-if="report.sleepProfile && report.sleepProfile.length">
            <h4 class="section-title"><span class="indicator"></span>睡眠报告基础信息</h4>
            <div class="profile-grid">
              <div class="data-card" v-for="item in report.sleepProfile" :key="item.label">
                <span class="label">{{ item.label }}</span>
                <div class="value-wrapper">
                  <input class="value-input" v-model="item.value" />
                  <small class="unit">{{ item.unit || '' }}</small>
                </div>
              </div>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px;" v-if="report.sleepMonitorInfo && report.sleepMonitorInfo.length">
            <h4 class="section-title"><span class="indicator"></span>监测信息</h4>
            <div class="profile-grid">
              <div class="data-card" v-for="item in report.sleepMonitorInfo" :key="item.label">
                <span class="label">{{ item.label }}</span>
                <div class="value-wrapper">
                  <input class="value-input" v-model="item.value" />
                </div>
              </div>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px;" v-if="report.sleepMonitorParams && report.sleepMonitorParams.length">
            <h4 class="section-title"><span class="indicator"></span>监测参数</h4>
            <div class="profile-grid">
              <div class="data-card" v-for="item in report.sleepMonitorParams" :key="item.label">
                <span class="label">{{ item.label }}</span>
                <div class="value-wrapper">
                  <input class="value-input" v-model="item.value" />
                </div>
              </div>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px;" v-if="report.sleepMetricsTable && report.sleepMetricsTable.length">
            <h4 class="section-title"><span class="indicator"></span>睡眠指标摘要</h4>
            <div class="stress-table-wrapper">
              <table class="stress-table">
                <thead>
                  <tr>
                    <th>指标</th>
                    <th>数值</th>
                    <th>单位</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in report.sleepMetricsTable" :key="`${row.metric}-${index}`">
                    <td><input class="table-input" v-model="row.metric" /></td>
                    <td><input class="table-input" v-model="row.value" /></td>
                    <td><input class="table-input" v-model="row.unit" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px;" v-if="hasDynamicTableData(report.sleepStatistics)">
            <h4 class="section-title"><span class="indicator"></span>{{ report.sleepStatistics.title || '睡眠数据统计' }}</h4>
            <div class="stress-table-wrapper">
              <table class="stress-table">
                <thead>
                  <tr>
                    <th v-for="(header, headerIndex) in report.sleepStatistics.headers" :key="`sleep-stat-header-${headerIndex}`">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in report.sleepStatistics.rows" :key="`sleep-stat-row-${rowIndex}`">
                    <td v-for="(_, cellIndex) in report.sleepStatistics.headers" :key="`sleep-stat-cell-${rowIndex}-${cellIndex}`">
                      <input class="table-input" v-model="row[cellIndex]" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px;" v-if="hasDynamicTableData(report.dailyStatistics)">
            <h4 class="section-title"><span class="indicator"></span>{{ report.dailyStatistics.title || '每日统计' }}</h4>
            <div class="stress-table-wrapper">
              <table class="stress-table">
                <thead>
                  <tr>
                    <th v-for="(header, headerIndex) in report.dailyStatistics.headers" :key="`daily-stat-header-${headerIndex}`">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in report.dailyStatistics.rows" :key="`daily-stat-row-${rowIndex}`">
                    <td v-for="(_, cellIndex) in report.dailyStatistics.headers" :key="`daily-stat-cell-${rowIndex}-${cellIndex}`">
                      <input class="table-input" v-model="row[cellIndex]" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px;" v-if="report.sleepSummaryText">
            <h4 class="section-title"><span class="indicator"></span>睡眠总结</h4>
            <div class="text-block-card">
              <textarea class="text-block-input" v-model="report.sleepSummaryText"></textarea>
            </div>
          </div>

          <div class="data-section anim-slide-up" style="margin-top: 20px; animation-delay: 0.15s;" v-if="report.profile">
            <h4 class="section-title"><span class="indicator"></span>HRV 基础资料</h4>
            <div class="profile-grid">
              <div class="data-card" v-for="item in report.profile" :key="item.label">
                <span class="label">{{ item.label }}</span>
                <div class="value-wrapper">
                  <input class="value-input" v-model="item.value" />
                  <small class="unit">{{ item.unit || '' }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- HRV 数据 -->
          <div class="data-section anim-slide-up" style="margin-top: 20px; animation-delay: 0.2s;" v-if="report.stress || report.stressTable">
            <h4 class="section-title"><span class="indicator"></span>精神压力/自主神经分析</h4>
            <div class="data-grid" v-if="report.stress && report.stress.length">
              <div class="data-card" v-for="item in report.stress" :key="item.label" :class="{ 'warning': item.isWarning }">
                <span class="label">{{ item.label }}</span>
                <div class="value-wrapper">
                  <input class="value-input" v-model="item.value" @input="checkWarning(item, 'stress')" />
                  <small class="unit">{{ item.unit }}</small>
                </div>
                <span class="status-badge" v-if="item.isWarning">异常预警</span>
              </div>
            </div>
            <div class="stress-table-wrapper" v-if="report.stressTable && report.stressTable.length">
              <table class="stress-table">
                <thead>
                  <tr>
                    <th>项目</th>
                    <th>检测数值</th>
                    <th>结果说明</th>
                    <th>标准范围</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in report.stressTable" :key="`${row.item}-${index}`">
                    <td><input class="table-input" v-model="row.item" /></td>
                    <td><input class="table-input" v-model="row.value" /></td>
                    <td><input class="table-input" v-model="row.result" /></td>
                    <td><input class="table-input" v-model="row.standard" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </div>

          <div class="action-btn-group" style="margin-top: 40px;">
            <button class="secondary-btn" @click="resetData">重新上传</button>
            <button class="primary-btn save-btn" @click="saveToDatabase">确认无误，存入档案</button>
          </div>
        </div>
      </div>
    </div>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { parseHealthReport, extractContentFromPDF } from '@/utils/aiService.js';
import { createPatientRecord } from '@/utils/patientApi';

const isDragging = ref(false);
const files = ref([]);
const isParsing = ref(false);
const parsedData = ref(null);
const parsedReports = ref([]);
const fileInput = ref(null);

const totalProgress = computed(() => {
  if (files.value.length === 0) return 0;
  const sum = files.value.reduce((acc, f) => acc + (f.progress || 0), 0);
  return Math.round(sum / files.value.length);
});

const openDashboardScreen = () => {
  // #ifdef H5
  const url = `${window.location.origin}/#/pages/index/index?mode=display`;
  window.open(url, '_blank');
  // #endif

  // #ifndef H5
  uni.navigateTo({ url: '/pages/index/index?mode=display' });
  // #endif
};

const goToDashboard = () => {
  openDashboardScreen();
};
const goToReport = () => { uni.navigateTo({ url: '/pages/report/index' }); };

const triggerUpload = () => {
  // 统一使用 uni.chooseFile，支持 H5 和其他平台
  uni.chooseFile({
    count: 10,
    type: 'all',
    extension: ['.pdf'],
    success: (res) => {
      addFiles(res.tempFiles.map(f => ({
        name: f.name,
        size: f.size,
        path: f.path,
        raw: f.file || f // H5 端原生 File 对象在 f.file 里，或者就是 f 本身
      })));
    },
    fail: (err) => {
      console.error('选择文件失败:', err);
    }
  });
};

const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  addFiles(selectedFiles);
};

const addFiles = (selectedFiles) => {
  selectedFiles.forEach(file => {
    files.value.push({
      name: file.name,
      size: file.size,
      status: 'ready',
      progress: 0,
      raw: file
    });
  });
};

const removeFile = (index) => {
  files.value.splice(index, 1);
};

const onDragOver = () => { isDragging.value = true; };
const onDragLeave = () => { isDragging.value = false; };
const onDrop = (e) => {
  isDragging.value = false;
  if (e.dataTransfer && e.dataTransfer.files) {
    addFiles(Array.from(e.dataTransfer.files));
  }
};

const getStatusText = (status) => {
  const map = {
    'ready': '等待解析',
    'parsing': 'AI 解析中...',
    'success': '解析完成',
    'error': '解析失败'
  };
  return map[status] || '未知状态';
};

const detectReportType = (fileName) => {
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('inbody') || fileName.includes('体成分')) return 'inbody';
  if (
    fileName.includes('睡眠') ||
    fileName.includes('生理参数') ||
    fileName.includes('监测报告') ||
    fileName.includes('昼夜') ||
    fileName.includes('节律') ||
    fileName.includes('活动计数') ||
    lowerName.includes('sleep') ||
    lowerName.includes('act')
  ) return 'sleep';
  return 'generic';
};

const createDynamicTable = (title = '') => ({
  title,
  headers: [],
  rows: []
});

const normalizeDynamicTable = (table, fallbackTitle = '') => {
  let headers = Array.isArray(table?.headers)
    ? table.headers.map(header => String(header ?? '').trim())
    : [];

  const rows = Array.isArray(table?.rows)
    ? table.rows
        .filter(row => Array.isArray(row))
        .map(row => row.map(cell => String(cell ?? '').trim()))
    : [];

  if (!headers.length && rows.length) {
    headers = rows[0].map((_, index) => `列${index + 1}`);
  }

  return {
    title: table?.title || fallbackTitle,
    headers,
    rows
  };
};

const hasDynamicTableData = (table) => {
  return !!(
    table &&
    ((Array.isArray(table.headers) && table.headers.length) ||
      (Array.isArray(table.rows) && table.rows.length))
  );
};

const startParsing = async () => {
  if (files.value.length === 0) return;
  isParsing.value = true;
  parsedData.value = null;
  parsedReports.value = [];
  
  try {
    for (const file of files.value) {
      if (file.status === 'success') continue;
      file.status = 'parsing';
      file.progress = 10;
      
      const initialReportType = detectReportType(file.name);

      // 1. 提取内容（自动识别文本或转图片）
      file.progress = 30;
      const contentObj = await extractContentFromPDF(file, initialReportType);
      const reportType = contentObj.reportType || initialReportType || 'stress';
      
      // 2. 调用 AI 进行解析（支持视觉 OCR 解析）
      file.progress = 60;
      const result = await parseHealthReport(contentObj, reportType);
      
      // 3. 将结果映射到 UI
      const reportData = applyAIResult(result, reportType, file.name);
      parsedReports.value.push(reportData);
      
      file.progress = 100;
      file.status = 'success';
    }
    isParsing.value = false;
  } catch (error) {
    console.error(error);
    uni.showModal({
      title: '解析失败',
      content: error.message || 'AI 解析过程中出现错误。',
      showCancel: false
    });
    isParsing.value = false;
  }
};

const applyAIResult = (result, type, fileName) => {
  const reportData = generateMockData(type, fileName);

  if (type === 'inbody') {
    const summary = result.summary || result;
    const bodyComposition = Array.isArray(result.bodyComposition) ? result.bodyComposition : [];
    const muscleFatAnalysis = Array.isArray(result.muscleFatAnalysis) ? result.muscleFatAnalysis : [];
    const obesityAnalysis = Array.isArray(result.obesityAnalysis) ? result.obesityAnalysis : [];
    const summaryMapping = {
      weight: '体重',
      muscle: '骨骼肌',
      fat: '体脂肪',
      bmi: 'BMI',
      fatRate: '体脂率',
      visceralFat: '内脏脂肪等级',
      ffm: '去脂体重',
      bmr: '基础代谢率',
      tbw: '身体总水分',
      protein: '蛋白质',
      minerals: '无机盐'
    };

    const pickMetricValue = (metricNames, rows) => {
      const names = Array.isArray(metricNames) ? metricNames : [metricNames];
      const row = rows.find(item => names.some(name => item.metric === name || item.metric?.includes(name)));
      return row?.value;
    };

    const summaryFallback = {
      weight: summary.weight || pickMetricValue('体重', muscleFatAnalysis) || pickMetricValue('体重', bodyComposition),
      muscle: summary.muscle || pickMetricValue(['骨骼肌', '骨骼肌量'], muscleFatAnalysis),
      fat: summary.fat || pickMetricValue('体脂肪', muscleFatAnalysis) || pickMetricValue('体脂肪', bodyComposition),
      bmi: summary.bmi || pickMetricValue(['身体质量指数(BMI)', 'BMI'], obesityAnalysis),
      fatRate: summary.fatRate || pickMetricValue(['体脂百分比', '体脂率'], obesityAnalysis),
      ffm: summary.ffm || pickMetricValue('去脂体重', bodyComposition),
      tbw: summary.tbw || pickMetricValue('身体总水分', bodyComposition),
      protein: summary.protein || pickMetricValue('蛋白质', bodyComposition),
      minerals: summary.minerals || pickMetricValue('无机盐', bodyComposition),
      visceralFat: summary.visceralFat || '',
      bmr: summary.bmr || ''
    };

    (reportData.inbody || []).forEach(item => {
      for (const [key, label] of Object.entries(summaryMapping)) {
        if (item.label === label && summaryFallback[key] !== undefined) {
          item.value = summaryFallback[key] || '--';
          checkWarning(item, 'inbody');
        }
      }
    });

    if (result.profile) {
      const profileMapping = {
        id: 'ID',
        height: '身高',
        age: '年龄',
        gender: '性别',
        testDateTime: '测试日期',
        score: 'InBody评分'
      };
      (reportData.inbodyProfile || []).forEach(item => {
        for (const [key, label] of Object.entries(profileMapping)) {
          if (item.label === label && result.profile[key] !== undefined) {
            item.value = result.profile[key] || '--';
          }
        }
      });
    }

    if (bodyComposition.length) {
      reportData.inbodyTable = bodyComposition.map(row => ({
        category: row.category || '人体成分分析',
        metric: row.metric || '--',
        value: row.value || '--',
        unit: row.unit || '',
        range: row.range || ''
      }));
    }

    if (muscleFatAnalysis.length) {
      reportData.muscleFatAnalysis = muscleFatAnalysis.map(row => ({
        metric: row.metric || '--',
        value: row.value || '--',
        unit: row.unit || '',
        status: row.status || ''
      }));
    }

    if (obesityAnalysis.length) {
      reportData.obesityAnalysis = obesityAnalysis.map(row => ({
        metric: row.metric || '--',
        value: row.value || '--',
        unit: row.unit || '',
        status: row.status || ''
      }));
    }
  } else if (type === 'sleep') {
    const sleepProfileMapping = {
      name: '姓名',
      gender: '性别',
      birthDate: '出生日期',
      age: '年龄',
      height: '身高',
      weight: '体重',
      bmi: 'BMI',
      code: '编码',
      phone: '手机号',
      address: '住址',
      chiefComplaint: '主诉'
    };

    if (result.profile) {
      (reportData.sleepProfile || []).forEach(item => {
        for (const [key, label] of Object.entries(sleepProfileMapping)) {
          if (item.label === label && result.profile[key] !== undefined) {
            item.value = result.profile[key] || '--';
          }
        }
      });
    }

    const monitorInfoMapping = {
      dataId: '数据ID',
      device: '监测设备',
      wearPosition: '佩戴位置',
      startTime: '开始时间',
      endTime: '结束时间',
      duration: '监测时长'
    };

    if (result.monitorInfo) {
      (reportData.sleepMonitorInfo || []).forEach(item => {
        for (const [key, label] of Object.entries(monitorInfoMapping)) {
          if (item.label === label && result.monitorInfo[key] !== undefined) {
            item.value = result.monitorInfo[key] || '--';
          }
        }
      });
    }

    const monitorParamMapping = {
      acceleration: '加速度',
      environment: '环境光',
      pressure: '气压',
      skinTemp: '皮温',
      algorithm: '活动计数算法'
    };

    if (result.monitorParams) {
      (reportData.sleepMonitorParams || []).forEach(item => {
        for (const [key, label] of Object.entries(monitorParamMapping)) {
          if (item.label === label && result.monitorParams[key] !== undefined) {
            item.value = result.monitorParams[key] || '--';
          }
        }
      });
    }

    if (Array.isArray(result.sleepMetrics)) {
      reportData.sleepMetricsTable = result.sleepMetrics.map(metric => ({
        metric: metric.metric || '--',
        value: metric.value || '--',
        unit: metric.unit || ''
      }));
    }

    reportData.sleepStatistics = normalizeDynamicTable(result.sleepStatistics, '睡眠数据统计');
    reportData.dailyStatistics = normalizeDynamicTable(result.dailyStatistics, '每日统计');
    reportData.sleepSummaryText = result.summary || reportData.sleepSummaryText;
  } else {
    const profileMapping = {
      name: '姓名',
      gender: '性别',
      birthDate: '出生日期',
      age: '年龄',
      idCard: '身份证号码',
      reportTime: '报告时间'
    };

    if (result.profile) {
      (reportData.profile || []).forEach(item => {
        for (const [key, label] of Object.entries(profileMapping)) {
          if (item.label === label && result.profile[key] !== undefined) {
            item.value = result.profile[key] || '--';
          }
        }
      });
    }

    if (Array.isArray(result.stressMetrics) && result.stressMetrics.length) {
      reportData.stressTable = result.stressMetrics.map(metric => ({
        item: metric.item || '--',
        value: metric.value || '--',
        result: metric.result || '--',
        standard: metric.standard || '--'
      }));

      const keywordMap = {
        '自律神经年龄': '自律神经年龄',
        '自律神经偏向': '偏向值(Balance)',
        'Balance': '偏向值(Balance)',
        '交感神经功能': '交感神经功能',
        '副交感神经功能': '副交感神经功能',
        '睡眠指数': '睡眠指数',
        '情绪指数': '情绪指数',
        '活力指数': '活力指数',
        '抗压力指数': '抗压力指数'
      };

      (reportData.stress || []).forEach(item => {
        const row = result.stressMetrics.find(metric =>
          Object.keys(keywordMap).some(key => metric.item?.includes(key) && item.label === keywordMap[key])
        );
        if (row) {
          item.value = row.value || item.value;
          item.isWarning = !!(row.result && /(异常|过高|过低|警示|偏高|偏低|超重|严重)/.test(row.result));
        }
      });
    }
  }

  return reportData;
};

const generateMockData = (type, fileName = '') => {
  const hasInBody = type === 'inbody';
  const hasStress = type === 'stress';
  const hasSleep = type === 'sleep';

  return {
    fileName,
    type,
    inbodyProfile: hasInBody ? [
      { label: 'ID', value: '--', unit: '' },
      { label: '身高', value: '--', unit: 'cm' },
      { label: '年龄', value: '--', unit: '岁' },
      { label: '性别', value: '--', unit: '' },
      { label: '测试日期', value: '--', unit: '' },
      { label: 'InBody评分', value: '--', unit: '/100分' }
    ] : null,
    profile: hasStress ? [
      { label: '姓名', value: '--', unit: '' },
      { label: '性别', value: '--', unit: '' },
      { label: '出生日期', value: '--', unit: '' },
      { label: '年龄', value: '--', unit: '岁' },
      { label: '身份证号码', value: '--', unit: '' },
      { label: '报告时间', value: '--', unit: '' }
    ] : null,
    sleepProfile: hasSleep ? [
      { label: '姓名', value: '--', unit: '' },
      { label: '性别', value: '--', unit: '' },
      { label: '出生日期', value: '--', unit: '' },
      { label: '年龄', value: '--', unit: '岁' },
      { label: '身高', value: '--', unit: 'cm' },
      { label: '体重', value: '--', unit: 'kg' },
      { label: 'BMI', value: '--', unit: '' },
      { label: '编码', value: '--', unit: '' },
      { label: '手机号', value: '--', unit: '' },
      { label: '住址', value: '--', unit: '' },
      { label: '主诉', value: '--', unit: '' }
    ] : null,
    sleepMonitorInfo: hasSleep ? [
      { label: '数据ID', value: '--' },
      { label: '监测设备', value: '--' },
      { label: '佩戴位置', value: '--' },
      { label: '开始时间', value: '--' },
      { label: '结束时间', value: '--' },
      { label: '监测时长', value: '--' }
    ] : null,
    sleepMonitorParams: hasSleep ? [
      { label: '加速度', value: '--' },
      { label: '环境光', value: '--' },
      { label: '气压', value: '--' },
      { label: '皮温', value: '--' },
      { label: '活动计数算法', value: '--' }
    ] : null,
    sleepMetricsTable: [],
    sleepStatistics: createDynamicTable(hasSleep ? '睡眠数据统计' : ''),
    dailyStatistics: createDynamicTable(hasSleep ? '每日统计' : ''),
    sleepSummaryText: '',
    inbody: hasInBody ? [
      { label: '体重', value: '--', unit: 'kg', isWarning: false },
      { label: '骨骼肌', value: '--', unit: 'kg', isWarning: false },
      { label: '体脂肪', value: '--', unit: 'kg', isWarning: false },
      { label: 'BMI', value: '--', unit: '', isWarning: false },
      { label: '体脂率', value: '--', unit: '%', isWarning: false },
      { label: '内脏脂肪等级', value: '--', unit: '级', isWarning: false },
      { label: '去脂体重', value: '--', unit: 'kg', isWarning: false },
      { label: '基础代谢率', value: '--', unit: 'kcal', isWarning: false },
      { label: '身体总水分', value: '--', unit: 'L', isWarning: false },
      { label: '蛋白质', value: '--', unit: 'kg', isWarning: false },
      { label: '无机盐', value: '--', unit: 'kg', isWarning: false }
    ] : null,
    inbodyTable: [],
    muscleFatAnalysis: [],
    obesityAnalysis: [],
    stress: hasStress ? [
      { label: '自律神经年龄', value: '--', unit: '岁', isWarning: false },
      { label: '偏向值(Balance)', value: '--', unit: '', isWarning: false },
      { label: '交感神经功能', value: '--', unit: 'nu', isWarning: false },
      { label: '副交感神经功能', value: '--', unit: 'nu', isWarning: false },
      { label: '睡眠指数', value: '--', unit: '分', isWarning: false },
      { label: '情绪指数', value: '--', unit: '分', isWarning: false },
      { label: '活力指数', value: '--', unit: '分', isWarning: false },
      { label: '抗压力指数', value: '--', unit: '分', isWarning: false }
    ] : null,
    stressTable: []
  };
};

const getChartWidth = (value, metric) => {
  const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  if (Number.isNaN(num)) return '0%';
  const maxMap = {
    '体重': 200,
    '骨骼肌': 80,
    '体脂肪': 60,
    '身体质量指数(BMI)': 55,
    '体脂百分比': 50
  };
  const max = maxMap[metric] || 100;
  return `${Math.min((num / max) * 100, 100)}%`;
};

const checkWarning = (item, type) => {
  const val = parseFloat(item.value);
  if (isNaN(val)) return;

  if (item.min !== undefined && val < item.min) item.isWarning = true;
  else if (item.max !== undefined && val > item.max) item.isWarning = true;
  else item.isWarning = false;
};

const resetData = () => {
  files.value = [];
  parsedData.value = null;
  parsedReports.value = [];
  isParsing.value = false;
};

const hasMeaningfulValue = (value) => {
  if (value === undefined || value === null) return false;
  const text = String(value).trim();
  return text !== '' && text !== '--' && text !== '未知' && text !== '未知客户';
};

const pickFirstMeaningfulValue = (values, fallback = '') => {
  const matched = values.find(hasMeaningfulValue);
  return matched ?? fallback;
};

const getProfileItemValue = (items, label) => {
  return Array.isArray(items) ? items.find(item => item.label === label)?.value : '';
};

const hasTableContent = (table) => {
  return !!(
    table &&
    ((Array.isArray(table.headers) && table.headers.length > 0) ||
      (Array.isArray(table.rows) && table.rows.length > 0))
  );
};

const sanitizeLabeledItems = (items) => {
  if (!Array.isArray(items)) return null;

  const sanitized = items
    .map(item => ({
      ...item,
      label: String(item?.label ?? '').trim(),
      value: hasMeaningfulValue(item?.value) ? String(item.value).trim() : '',
      unit: hasMeaningfulValue(item?.unit) ? String(item.unit).trim() : '',
      status: hasMeaningfulValue(item?.status) ? String(item.status).trim() : '',
      isWarning: !!item?.isWarning
    }))
    .filter(item => item.label && hasMeaningfulValue(item.value));

  return sanitized.length ? sanitized : null;
};

const sanitizeTableRows = (rows, fields) => {
  if (!Array.isArray(rows)) return [];

  return rows
    .map(row => {
      const nextRow = {};
      fields.forEach(field => {
        nextRow[field] = hasMeaningfulValue(row?.[field]) ? String(row[field]).trim() : '';
      });
      return nextRow;
    })
    .filter(row => fields.some(field => hasMeaningfulValue(row[field])));
};

const sanitizeDynamicTable = (table, fallbackTitle = '') => {
  const normalized = normalizeDynamicTable(table, fallbackTitle);
  const headers = normalized.headers.filter(hasMeaningfulValue);
  const rows = normalized.rows
    .map(row => row.map(cell => (hasMeaningfulValue(cell) ? String(cell).trim() : '')))
    .filter(row => row.some(hasMeaningfulValue));

  if (!headers.length && !rows.length) {
    return createDynamicTable(fallbackTitle);
  }

  return {
    title: normalized.title || fallbackTitle,
    headers,
    rows
  };
};

const sanitizeMergedReport = (report) => {
  return {
    ...report,
    inbodyProfile: sanitizeLabeledItems(report.inbodyProfile),
    profile: sanitizeLabeledItems(report.profile),
    sleepProfile: sanitizeLabeledItems(report.sleepProfile),
    sleepMonitorInfo: sanitizeLabeledItems(report.sleepMonitorInfo),
    sleepMonitorParams: sanitizeLabeledItems(report.sleepMonitorParams),
    sleepMetricsTable: sanitizeTableRows(report.sleepMetricsTable, ['metric', 'value', 'unit']),
    sleepStatistics: sanitizeDynamicTable(report.sleepStatistics, '睡眠数据统计'),
    dailyStatistics: sanitizeDynamicTable(report.dailyStatistics, '每日统计'),
    sleepSummaryText: hasMeaningfulValue(report.sleepSummaryText) ? String(report.sleepSummaryText).trim() : '',
    inbody: sanitizeLabeledItems(report.inbody),
    inbodyTable: sanitizeTableRows(report.inbodyTable, ['category', 'metric', 'value', 'unit', 'range']),
    muscleFatAnalysis: sanitizeTableRows(report.muscleFatAnalysis, ['metric', 'value', 'unit', 'status']),
    obesityAnalysis: sanitizeTableRows(report.obesityAnalysis, ['metric', 'value', 'unit', 'status']),
    stress: sanitizeLabeledItems(report.stress),
    stressTable: sanitizeTableRows(report.stressTable, ['item', 'value', 'result', 'standard'])
  };
};

const getMergedReportValue = (mergedReport, labels, sources = ['profile', 'sleepProfile', 'inbodyProfile', 'sleepMonitorInfo']) => {
  const labelList = Array.isArray(labels) ? labels : [labels];

  for (const source of sources) {
    const items = mergedReport?.[source];
    for (const label of labelList) {
      const value = getProfileItemValue(items, label);
      if (hasMeaningfulValue(value)) {
        return String(value).trim();
      }
    }
  }

  return '';
};

const parseScoreValue = (value) => {
  const matched = String(value || '').match(/\d+/);
  return matched ? Number(matched[0]) : null;
};

const mergeParsedReports = (reports) => {
  const merged = {
    fileName: reports.map(report => report.fileName).filter(Boolean).join(' / '),
    type: reports.length > 1 ? 'combined' : (reports[0]?.type || 'combined'),
    sourceTypes: [...new Set(reports.map(report => report.type).filter(Boolean))],
    inbodyProfile: null,
    profile: null,
    sleepProfile: null,
    sleepMonitorInfo: null,
    sleepMonitorParams: null,
    sleepMetricsTable: [],
    sleepStatistics: createDynamicTable('睡眠数据统计'),
    dailyStatistics: createDynamicTable('每日统计'),
    sleepSummaryText: '',
    inbody: null,
    inbodyTable: [],
    muscleFatAnalysis: [],
    obesityAnalysis: [],
    stress: null,
    stressTable: []
  };

  reports.forEach(report => {
    if (Array.isArray(report.inbodyProfile) && report.inbodyProfile.length) merged.inbodyProfile = report.inbodyProfile;
    if (Array.isArray(report.profile) && report.profile.length) merged.profile = report.profile;
    if (Array.isArray(report.sleepProfile) && report.sleepProfile.length) merged.sleepProfile = report.sleepProfile;
    if (Array.isArray(report.sleepMonitorInfo) && report.sleepMonitorInfo.length) merged.sleepMonitorInfo = report.sleepMonitorInfo;
    if (Array.isArray(report.sleepMonitorParams) && report.sleepMonitorParams.length) merged.sleepMonitorParams = report.sleepMonitorParams;
    if (Array.isArray(report.sleepMetricsTable) && report.sleepMetricsTable.length) merged.sleepMetricsTable = report.sleepMetricsTable;
    if (hasTableContent(report.sleepStatistics)) merged.sleepStatistics = report.sleepStatistics;
    if (hasTableContent(report.dailyStatistics)) merged.dailyStatistics = report.dailyStatistics;
    if (hasMeaningfulValue(report.sleepSummaryText)) merged.sleepSummaryText = report.sleepSummaryText;
    if (Array.isArray(report.inbody) && report.inbody.length) merged.inbody = report.inbody;
    if (Array.isArray(report.inbodyTable) && report.inbodyTable.length) merged.inbodyTable = report.inbodyTable;
    if (Array.isArray(report.muscleFatAnalysis) && report.muscleFatAnalysis.length) merged.muscleFatAnalysis = report.muscleFatAnalysis;
    if (Array.isArray(report.obesityAnalysis) && report.obesityAnalysis.length) merged.obesityAnalysis = report.obesityAnalysis;
    if (Array.isArray(report.stress) && report.stress.length) merged.stress = report.stress;
    if (Array.isArray(report.stressTable) && report.stressTable.length) merged.stressTable = report.stressTable;
  });

  return merged;
};

const saveToDatabase = () => {
  uni.showLoading({ title: '正在存入档案...' });
  const mergedReport = sanitizeMergedReport(mergeParsedReports(parsedReports.value));
  const getName = () => {
    return pickFirstMeaningfulValue([
      getMergedReportValue(mergedReport, '姓名'),
      getMergedReportValue(mergedReport, 'ID', ['inbodyProfile'])
    ], '');
  };
  const getGender = () => {
    return getMergedReportValue(mergedReport, '性别');
  };
  const getAge = () => {
    return getMergedReportValue(mergedReport, '年龄');
  };
  const getDate = () => {
    return getMergedReportValue(mergedReport, ['测试日期', '报告时间', '开始时间', '结束时间']);
  };
  const getScore = () => {
    const scoreValue = getMergedReportValue(mergedReport, 'InBody评分', ['inbodyProfile']);
    return parseScoreValue(scoreValue);
  };

  createPatientRecord({
    name: getName() || '未命名档案',
    gender: getGender(),
    age: getAge(),
    status: 'ready',
    statusText: '待出报告',
    date: getDate(),
    score: getScore(),
    sourceLabels: Array.isArray(mergedReport.sourceTypes) ? mergedReport.sourceTypes : [],
    reportData: mergedReport
  })
    .then(() => {
      uni.hideLoading();
      uni.showToast({
        title: '已存入客户档案库',
        icon: 'success'
      });
      setTimeout(() => {
        goToReport();
      }, 800);
    })
    .catch((error) => {
      uni.hideLoading();
      uni.showToast({
        title: error?.message || '档案保存失败',
        icon: 'none'
      });
    });
};
</script>

<style scoped>
.upload-wrapper {
  position: relative;
  min-height: 100vh;
  z-index: 1;
  overflow-x: hidden;
  background: #061121;
  color: #fff;
  font-family: "Helvetica Neue", Helvetica, Arial, "sans-serif";
}

.bg-canvas {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: -1;
  background: url(/static/images/bg.jpg) no-repeat center center;
  background-size: cover;
}

.head { 
  height: 100px; 
  background: url(/static/images/head_bg.png) no-repeat center center; 
  background-size: 100% 100%; 
  position: relative; 
  z-index: 100; 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 5px 20px rgba(20, 182, 255, 0.2); 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
}

.head-left { display: flex; align-items: center; gap: 20px; }
.back-btn { 
  cursor: pointer; 
  width: 40px; height: 40px; 
  background: rgba(255,255,255,0.1); 
  border-radius: 50%; 
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s;
}
.back-btn:hover { background: rgba(20, 182, 255, 0.2); border-color: #14b6ff; }

.head h1 { color: #fff; text-align: center; font-size: 28px; letter-spacing: 2px; font-weight: bold; margin: 0; }
.head h1 a { color: #fff; text-shadow: 0 0 15px rgba(20, 182, 255, 0.8), 0 0 30px rgba(20, 182, 255, 0.4), 0 4px 10px rgba(0,0,0,0.8); text-decoration: none;}

.nav-links {
  display: flex;
  gap: 20px;
}

.user-info { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.8); font-size: 14px; }
.user-info img { border-radius: 50%; border: 1px solid #14b6ff; padding: 2px; }

.nav-btn {
  color: rgba(255,255,255,0.7);
  font-size: 16px;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s;
  background: rgba(0,0,0,0.3);
}

.nav-btn:hover {
  color: #fff;
  border-color: #14b6ff;
  box-shadow: 0 0 10px rgba(20, 182, 255, 0.4);
}

.nav-btn.active {
  color: #fff;
  background: rgba(20, 182, 255, 0.2);
  border-color: #14b6ff;
  box-shadow: 0 0 15px rgba(20, 182, 255, 0.6);
  font-weight: bold;
}

.main-content {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  box-sizing: border-box;
}

.left-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  align-self: stretch;
  position: static;
  min-height: auto;
}
.right-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 60vh;
}


.boxall { 
  background: rgba(6,48,109,.3); 
  border: 1px solid rgba(20, 182, 255, 0.3); 
  box-shadow: 0 4px 15px rgba(0,0,0,0.1), inset 0 0 20px rgba(20, 182, 255, 0.1); 
  backdrop-filter: blur(10px); 
  -webkit-backdrop-filter: blur(10px); 
  border-radius: 12px; 
  padding: 25px;
}

.panel-title {
  font-size: 22px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}
.panel-title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 22px;
  background: #14b6ff;
  border-radius: 4px;
  margin-right: 10px;
  box-shadow: 0 0 8px #14b6ff;
}

.upload-area {
  border: 2px dashed rgba(20, 182, 255, 0.5);
  border-radius: 12px;
  background: rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 0;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover, .upload-area.is-dragging {
  border-color: #14b6ff;
  background: rgba(20, 182, 255, 0.1);
  box-shadow: 0 0 20px rgba(20, 182, 255, 0.2) inset;
}

.upload-area h3 {
  color: #fff;
  font-size: 20px;
  margin: 15px 0 10px;
}
.upload-area p {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
}

.file-list {
  margin-top: 20px;
  flex: none;
  min-height: auto;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 5px;
}

.file-item {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.file-main { display: flex; align-items: center; }
.file-name { color: #fff; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.file-status { font-size: 14px; font-weight: bold; padding: 2px 6px; border-radius: 3px; }
.file-status.ready { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.1); }
.file-status.parsing { color: #fef000; background: rgba(254, 240, 0, 0.1); }
.file-status.success { color: #03b48e; background: rgba(3, 180, 142, 0.1); }

.progress-bar {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #14b6ff, #9cefff);
  box-shadow: 0 0 10px #14b6ff;
  transition: width 0.3s ease;
}

.file-actions { margin-top: 8px; text-align: right; }
.delete-btn { color: #ed405d; font-size: 12px; cursor: pointer; text-decoration: underline; }

.action-btn-group {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.primary-btn, .secondary-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  border: none;
  transition: all 0.3s;
}

.primary-btn {
  background: linear-gradient(90deg, #0b72a6, #14b6ff);
  color: #fff;
  box-shadow: 0 4px 15px rgba(20, 182, 255, 0.4);
}
.primary-btn:hover:not(:disabled) {
  box-shadow: 0 6px 25px rgba(20, 182, 255, 0.6);
  filter: brightness(1.1);
  transform: translateY(-2px);
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-btn {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}
.secondary-btn:hover {
  background: rgba(255,255,255,0.2);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.5);
  font-size: 18px;
  border: 1px dashed rgba(255,255,255,0.2);
  border-radius: 12px;
}
.empty-content { text-align: center; }
.empty-content p { margin-top: 15px; }

.parsed-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.report-block {
  margin-bottom: 34px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(255,255,255,0.12);
}

.report-block:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.report-file-title {
  color: #9cefff;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.section-title {
  color: #fff;
  font-size: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.indicator {
  width: 8px;
  height: 8px;
  background: #fef000;
  border-radius: 50%;
  margin-right: 10px;
  box-shadow: 0 0 8px #fef000;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
}

.chart-metric-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.chart-metric-card {
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 8px 10px;
}

.chart-metric-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 13px;
  margin-bottom: 8px;
}

.chart-metric-value {
  color: #9cefff;
  font-weight: 600;
  white-space: nowrap;
}

.chart-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}

.chart-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #14b6ff, #62ddff);
}

.chart-fill.warning {
  background: linear-gradient(90deg, #f7b851, #ed405d);
}

.chart-status {
  margin-top: 10px;
  color: rgba(255,255,255,0.72);
  font-size: 13px;
}

.data-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 8px 10px;
  position: relative;
  overflow: hidden;
}

.data-card.warning {
  border-color: rgba(237, 64, 93, 0.5);
  background: rgba(237, 64, 93, 0.1);
}
.data-card.warning::before {
  content: "";
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: #ed405d;
  box-shadow: 0 0 10px #ed405d;
}

.label {
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  display: block;
  margin-bottom: 4px;
}

.value-wrapper { display: flex; align-items: baseline; gap: 4px; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); }
.value-input {
  background: transparent;
  border: none;
  color: #14b6ff;
  font-size: 14px;
  font-weight: bold;
  width: 100%;
  outline: none;
  text-shadow: 0 0 10px rgba(20, 182, 255, 0.4);
}
.data-card.warning .value-input {
  color: #ed405d;
  text-shadow: 0 0 10px rgba(237, 64, 93, 0.4);
}

.unit {
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  font-weight: normal;
}

.stress-table-wrapper {
  margin-top: 20px;
  overflow-x: auto;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  background: rgba(0,0,0,0.18);
}

.stress-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.stress-table th,
.stress-table td {
  border-bottom: 1px solid rgba(255,255,255,0.08);
  border-right: 1px solid rgba(255,255,255,0.08);
  padding: 10px 12px;
  text-align: left;
}

.stress-table th:last-child,
.stress-table td:last-child {
  border-right: none;
}

.stress-table th {
  color: #9cefff;
  font-size: 13px;
  background: rgba(20, 182, 255, 0.08);
  white-space: nowrap;
}

.table-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 13px;
}

.text-block-card {
  background: rgba(0,0,0,0.24);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 14px;
}

.text-block-input {
  width: 100%;
  min-height: 180px;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255,255,255,0.88);
  font-size: 13px;
  line-height: 1.8;
  resize: vertical;
}

.status-badge {
  position: absolute;
  right: 10px;
  top: 10px;
  background: #ed405d;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(237, 64, 93, 0.6);
}

.anim-slide-up { animation: slideUp 0.5s ease-out both; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
::-webkit-scrollbar-thumb { background: rgba(20, 182, 255, 0.3); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(20, 182, 255, 0.6); }

@media screen and (max-width: 1024px) {
  .main-content { flex-direction: column; height: auto; overflow-y: auto; }
  .nav-links { position: relative; right: auto; top: auto; transform: none; margin-top: 10px; justify-content: center; }
  .head { flex-direction: column; height: auto; padding: 20px 0; }
  .left-panel { min-width: 100%; }
}
</style>
