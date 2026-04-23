<template>
  <view class="report-wrapper">
    <view class="bg-canvas"></view>

    <div class="head">
      <div class="head-left">
        <div class="back-btn" @click="goToDashboard">
          <img src="/static/images/icon6.png" style="filter: brightness(0) invert(1); width: 18px; transform: rotate(90deg);" />
        </div>
        <h1><a href="javascript:void(0)">内部管理系统 - 智能报告生成</a></h1>
      </div>
      <div class="nav-links">
        <div class="nav-btn" @click="goToDashboard">大屏看板</div>
        <div class="nav-btn" @click="goToUpload">数据采集</div>
        <div class="nav-btn active">智能报告</div>
      </div>
      <div class="user-info">
        <img src="/static/images/icon2.png" style="filter: brightness(0) invert(1); width: 24px;" />
        <span>管理员</span>
      </div>
    </div>

    <div class="main-content">
      <div class="left-panel boxall">
        <div class="panel-title">待生成报告档案列表</div>

        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索姓名或编号..." />
          <div class="filter-tabs">
            <span
              v-for="tab in tabs"
              :key="tab.value"
              :class="{ active: activeTab === tab.value }"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </span>
          </div>
        </div>

        <div class="patient-list">
          <div
            class="patient-card"
            v-for="(patient, index) in filteredPatients"
            :key="patient.id"
            :class="{ active: activePatient && activePatient.id === patient.id }"
            @click="selectPatient(patient)"
          >
            <div class="avatar">
              <img :src="'/static/images/icon' + (index % 5 + 2) + '.png'" alt="avatar" style="filter: brightness(0) invert(1);" />
            </div>
            <div class="info">
              <div class="name-row">
                <span class="name">{{ patient.name }}</span>
                <span class="badge" :class="patient.status">{{ patient.statusText }}</span>
              </div>
              <div class="desc-row">
                <span>{{ getPatientMeta(patient) }}</span>
              </div>
            </div>
            <button class="delete-btn" @click.stop="deletePatient(patient)">删除</button>
          </div>
        </div>
      </div>

      <div class="right-panel boxall">
        <div class="panel-title">
          <span>综合效果评估报告预览</span>
          <div class="action-btns" v-if="activePatient">
            <button class="export-btn" :disabled="exportLoading" @click="exportReport">{{ exportLoading ? '导出中...' : '一键导出 PDF' }}</button>
          </div>
        </div>

        <div class="empty-state" v-if="!activePatient">
          <div class="empty-content">
            <img src="/static/images/icon6.png" style="width: 80px; opacity: 0.1; filter: brightness(0) invert(1);" />
            <p>请在左侧选择需要生成报告的客户档案</p>
          </div>
        </div>

        <div class="report-content anim-slide-up" v-else :key="activePatient.id">
          <div ref="reportPaperRef" class="report-paper">
            <div class="paper-watermark">HEALTH REPORT</div>
            <div class="reference-header" v-if="reportViewModel">
              <div class="reference-title-box">
                <div class="reference-title-icon" aria-hidden="true">
                  <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path v-for="(path, index) in getReportIconPaths('report')" :key="`brand-${index}`" :d="path" />
                  </svg>
                </div>
                <div class="reference-title-text">
                  <h2>健康报告</h2>
                  <p>科学评估 · 健康管理 · 美好生活</p>
                </div>
              </div>
              <div class="reference-patient-panel">
                <div class="reference-patient-grid">
                  <div class="reference-patient-item" v-for="item in reportViewModel.patientFields" :key="item.label">
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                </div>
                <div class="reference-badge-panel">
                  <div class="seal-icon-wrap">
                    <svg class="seal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path v-for="(path, index) in getReportIconPaths('score')" :key="`score-${index}`" :d="path" />
                    </svg>
                  </div>
                  <div v-if="activePatient.score !== null" class="reference-score" :style="{ color: getScoreColor(activePatient.score) }">{{ activePatient.score }}</div>
                  <div class="reference-score-label">{{ activePatient.score !== null ? '综合评分' : '真实档案' }}</div>
                  <div class="reference-score-note" v-if="activePatient.compositeAssessment?.note">{{ activePatient.compositeAssessment.note }}</div>
                  <div class="reference-score-sub" v-if="activePatient.inbodyScore !== null">参考 InBody: {{ activePatient.inbodyScore }}</div>
                </div>
              </div>
            </div>

            <div class="reference-report" v-if="reportViewModel && reportViewModel.hasContent">
              <div class="reference-row">
                <div class="reference-section reference-section-main">
                  <div class="reference-section-title tone-blue">1 睡眠分析</div>
                  <div class="reference-section-body">
                    <table class="reference-pairs-table" v-if="reportViewModel.sleepPairs.length">
                      <tbody>
                        <tr v-for="(row, index) in reportViewModel.sleepPairs" :key="`sleep-${index}`">
                          <th>{{ row.left.label }}</th>
                          <td>{{ row.left.value }}</td>
                          <th>{{ row.right ? row.right.label : '--' }}</th>
                          <td>{{ row.right ? row.right.value : '--' }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="reference-empty-block" v-else>暂无可展示的睡眠检测数据</div>
                  </div>
                </div>

                <div class="reference-section reference-section-side">
                  <div class="reference-section-title tone-yellow">1.2 睡眠分析解读</div>
                  <div class="reference-section-body">
                    <div class="insight-list" v-if="reportViewModel.sleepInsights.length">
                      <div class="insight-item" v-for="(item, index) in reportViewModel.sleepInsights" :key="`sleep-insight-${index}`">
                        <div class="insight-icon" :class="`tone-${item.tone}`" aria-hidden="true">
                          <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`sleep-insight-icon-${index}-${iconIndex}`" :d="path" />
                          </svg>
                        </div>
                        <div class="insight-content">
                          <h5>{{ item.title }}</h5>
                          <p>{{ item.text }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="reference-empty-block" v-else>暂无可展示的睡眠分析解读</div>
                  </div>
                </div>
              </div>

              <div class="reference-row">
                <div class="reference-section reference-section-main">
                  <div class="reference-section-title tone-blue">2 自律神经检测结果</div>
                  <div class="reference-section-body">
                    <table class="reference-data-table" v-if="reportViewModel.stressTable.rows.length">
                      <thead>
                        <tr>
                          <th v-for="column in reportViewModel.stressTable.columns" :key="`stress-col-${column.key}`">{{ column.label }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIndex) in reportViewModel.stressTable.rows" :key="`stress-row-${rowIndex}`">
                          <td v-for="column in reportViewModel.stressTable.columns" :key="`stress-${rowIndex}-${column.key}`">{{ row[column.key] || '--' }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="reference-empty-block" v-else>暂无可展示的自律神经检测数据</div>
                  </div>
                </div>

                <div class="reference-section reference-section-side">
                  <div class="reference-section-title tone-green">核心指标</div>
                  <div class="reference-section-body">
                    <div class="reference-stat-grid" v-if="reportViewModel.stressStats.length">
                      <div class="reference-stat-card" v-for="(item, index) in reportViewModel.stressStats" :key="`stress-stat-${index}`">
                        <div class="reference-stat-top">
                          <div class="reference-stat-icon" aria-hidden="true">
                            <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                              <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`stress-stat-icon-${index}-${iconIndex}`" :d="path" />
                            </svg>
                          </div>
                          <span>{{ item.label }}</span>
                        </div>
                        <div class="reference-stat-value">{{ item.value }}</div>
                        <div class="reference-stat-note" v-if="item.note">{{ item.note }}</div>
                      </div>
                    </div>
                    <div class="reference-balance-box" v-if="reportViewModel.stressMarkers.length">
                      <div class="reference-balance-title">自律神经平衡状态</div>
                      <div class="reference-balance-track">
                        <span v-for="(marker, index) in reportViewModel.stressMarkers" :key="`marker-${index}`" :class="`tone-${marker.tone}`" :style="{ width: `${marker.width}%` }"></span>
                      </div>
                      <div class="reference-balance-labels">
                        <span v-for="(marker, index) in reportViewModel.stressMarkers" :key="`marker-label-${index}`">{{ marker.label }}</span>
                      </div>
                    </div>
                    <div class="reference-empty-block" v-if="!reportViewModel.stressStats.length && !reportViewModel.stressMarkers.length">当前档案暂无可提取的核心指标摘要</div>
                  </div>
                </div>
              </div>

              <div class="reference-row">
                <div class="reference-section reference-section-main">
                  <div class="reference-section-title tone-blue">3 人体成分分析</div>
                  <div class="reference-section-body">
                    <table class="reference-pairs-table" v-if="reportViewModel.bodyPairs.length">
                      <tbody>
                        <tr v-for="(row, index) in reportViewModel.bodyPairs" :key="`body-${index}`">
                          <th>{{ row.left.label }}</th>
                          <td>{{ row.left.value }}</td>
                          <th>{{ row.right ? row.right.label : '--' }}</th>
                          <td>{{ row.right ? row.right.value : '--' }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="metric-bar-list" v-if="reportViewModel.bodyBars.length">
                      <div class="metric-bar-item" v-for="(item, index) in reportViewModel.bodyBars" :key="`body-bar-${index}`">
                        <div class="metric-bar-head">
                          <span>{{ item.label }}</span>
                          <strong>{{ item.value }}</strong>
                        </div>
                        <div class="metric-bar-track">
                          <span :style="{ width: `${item.percent}%` }"></span>
                        </div>
                        <div class="metric-bar-note">{{ item.note }}</div>
                      </div>
                    </div>
                    <div class="reference-empty-block" v-if="!reportViewModel.bodyPairs.length && !reportViewModel.bodyBars.length">暂无可展示的人体成分数据</div>
                  </div>
                </div>

                <div class="reference-section reference-section-side">
                  <div class="reference-section-title tone-blue">4 肥胖分析</div>
                  <div class="reference-section-body">
                    <div class="obesity-list" v-if="reportViewModel.obesityCards.length">
                      <div class="obesity-item" v-for="(item, index) in reportViewModel.obesityCards" :key="`obesity-${index}`">
                        <div class="obesity-head">
                          <span>{{ item.label }}</span>
                          <strong>{{ item.value }}</strong>
                        </div>
                        <div class="metric-bar-track obesity-track">
                          <span :style="{ width: `${item.percent}%` }"></span>
                        </div>
                        <div class="obesity-note">{{ item.note }}</div>
                      </div>
                    </div>
                    <div class="reference-empty-block" v-else>暂无可展示的肥胖分析数据</div>
                    <div class="exercise-advice-box" v-if="reportViewModel.exerciseAdvicePreview.length">
                      <div class="exercise-advice-title">AI运动建议</div>
                      <div class="exercise-advice-list">
                        <div class="exercise-advice-item" v-for="(item, index) in reportViewModel.exerciseAdvicePreview" :key="`exercise-advice-${index}`">
                          <div class="exercise-advice-icon" aria-hidden="true">
                            <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                              <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`exercise-icon-${index}-${iconIndex}`" :d="path" />
                            </svg>
                          </div>
                          <div class="exercise-advice-content">
                            <h5>{{ item.title }}</h5>
                            <p>{{ item.text }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="reference-row reference-row-bottom">
                <div class="reference-section reference-section-half">
                  <div class="reference-section-title tone-green">健康建议</div>
                  <div class="reference-section-body">
                    <div class="guidance-status" v-if="reportViewModel.aiGuidanceLoading">AI 正在结合当前档案生成更完整的个性化建议...</div>
                    <div class="guidance-status guidance-status-warning" v-else-if="reportViewModel.aiGuidanceError">AI 建议生成失败，当前展示本地分析建议</div>
                    <div class="guidance-summary" v-if="reportViewModel.guidanceSummary">{{ reportViewModel.guidanceSummary }}</div>
                    <div class="recommend-list" v-if="reportViewModel.healthAdvice.length">
                      <div class="recommend-item" v-for="(item, index) in reportViewModel.healthAdvice" :key="`health-advice-${index}`">
                        <div class="recommend-icon tone-green" aria-hidden="true">
                          <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`health-icon-${index}-${iconIndex}`" :d="path" />
                          </svg>
                        </div>
                        <div class="recommend-content">
                          <h5>{{ item.title }}</h5>
                          <p>{{ item.text }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="reference-empty-block" v-else>暂无可输出的健康建议</div>
                  </div>
                </div>

                <div class="reference-section reference-section-half">
                  <div class="reference-section-title tone-orange">饮食指南</div>
                  <div class="reference-section-body">
                    <div class="guidance-summary guidance-summary-diet" v-if="reportViewModel.guidanceSummary && reportViewModel.dietAdvice.length">{{ reportViewModel.guidanceSummary }}</div>
                    <div class="recommend-list" v-if="reportViewModel.dietAdvice.length">
                      <div class="recommend-item" v-for="(item, index) in reportViewModel.dietAdvice" :key="`diet-advice-${index}`">
                        <div class="recommend-icon tone-orange" aria-hidden="true">
                          <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`diet-icon-${index}-${iconIndex}`" :d="path" />
                          </svg>
                        </div>
                        <div class="recommend-content">
                          <h5>{{ item.title }}</h5>
                          <p>{{ item.text }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="reference-tag-row" v-if="reportViewModel.dietTags.length">
                      <span class="reference-tag" v-for="tag in reportViewModel.dietTags" :key="tag">{{ tag }}</span>
                    </div>
                    <div class="reference-empty-block" v-if="!reportViewModel.dietAdvice.length && !reportViewModel.dietTags.length">暂无可输出的饮食指南</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-report" v-else>
              当前档案暂无可展示的有效用户资料，请先在数据采集页完善真实数据后再生成最终报告。
            </div>

            <div class="paper-footer">
              <div class="paper-footer-note">
                报告内容严格基于用户档案中的已采集资料生成，未采集到的项目不补默认值。
              </div>
              <div class="paper-source-tags" v-if="activePatient.sourceLabels.length">
                <span class="paper-source-tag" v-for="source in activePatient.sourceLabels" :key="source">{{ source }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </view>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { generateHealthGuidance } from '@/utils/aiService';
import { deletePatientRecord, listPatients as fetchPatients } from '@/utils/patientApi';

const goToDashboard = () => {
  uni.showToast({ title: '看板已在独立窗口运行', icon: 'none' });
};

const goToUpload = () => {
  uni.navigateTo({ url: '/pages/upload/index' });
};

const searchQuery = ref('');
const activeTab = ref('all');
const activePatient = ref(null);
const patients = ref([]);
const aiGuidanceMap = ref({});
const aiGuidanceLoading = ref(false);
const aiGuidanceError = ref('');
const exportLoading = ref(false);
const reportPaperRef = ref(null);

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待生成', value: 'ready' },
  { label: '已完成', value: 'done' }
];

const sourceTypeLabelMap = {
  inbody: 'InBody',
  sleep: '睡眠监测',
  stress: '压力检测',
  combined: '综合档案'
};

const basicInfoLabels = [
  '姓名',
  'ID',
  '性别',
  '年龄',
  '出生日期',
  '身高',
  '体重',
  'BMI',
  '编码',
  '手机号',
  '身份证号码',
  '住址',
  '测试日期',
  '报告时间',
  '主诉'
];

const reportToneCycle = ['blue', 'green', 'purple', 'orange', 'teal', 'cyan'];

const reportIconPathMap = {
  report: ['M12 3l6 3v5c0 4.5-2.7 8.2-6 10-3.3-1.8-6-5.5-6-10V6l6-3z', 'M12 7v8', 'M8.5 11.5H15.5'],
  score: ['M12 3l7 3v5c0 5-3.1 9.1-7 11-3.9-1.9-7-6-7-11V6l7-3z', 'M9 12l2 2 4-4'],
  sleep: ['M15 4a7 7 0 1 0 5 12.5A8.5 8.5 0 0 1 15 4z', 'M7 4l.8 1.6L9.5 6l-1.7.4L7 8 6.2 6.4 4.5 6l1.7-.4L7 4z'],
  summary: ['M6 5h12', 'M6 10h12', 'M6 15h8', '17 14v5', '14.5 16.5H19.5'],
  stress: ['M13 2L6 14h5l-1 8 7-12h-5l1-8z'],
  body: ['M9 4V2', '15 4V2', '7 8a5 5 0 0 1 10 0v2a5 5 0 0 1-10 0V8z', '5 22a7 7 0 0 1 14 0'],
  obesity: ['M12 3a7 7 0 1 1 0 14a7 7 0 0 1 0-14z', '12 7v5l3 2', '6 20h12'],
  appendix: ['M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', '14 3v5h5', '9 13h6', '9 17h6'],
  'metric-score': ['M12 4l2.2 4.5 5 .7-3.6 3.5.8 5-4.4-2.3-4.4 2.3.8-5L4.8 9.2l5-.7L12 4z'],
  'metric-sleep': ['M15 4a7 7 0 1 0 5 12.5A8.5 8.5 0 0 1 15 4z'],
  'metric-stress': ['M13 3L7 13h4l-1 8 7-12h-4l1-6z'],
  'metric-body': ['M9 4V2', '15 4V2', '7 9a5 5 0 0 1 10 0', '8 13a4 4 0 0 0 8 0', '5 21a7 7 0 0 1 14 0'],
  'metric-obesity': ['M12 4a6 6 0 1 1 0 12a6 6 0 0 1 0-12z', '12 8v4l2.5 1.5'],
  'metric-default': ['M5 12h14', '12 5v14']
};

const getReportIconPaths = (key) => {
  return reportIconPathMap[key] || reportIconPathMap['metric-default'];
};

const getGroupIconKey = (groupKey) => {
  const iconMap = {
    sleep: 'sleep',
    summary: 'summary',
    stress: 'stress',
    body: 'body',
    obesity: 'obesity',
    appendix: 'appendix'
  };
  return iconMap[groupKey] || 'appendix';
};

const getMetricIconKey = (label) => {
  const text = String(label || '');
  if (text.includes('评分')) return 'metric-score';
  if (text.includes('睡眠')) return 'metric-sleep';
  if (text.includes('压力') || text.includes('神经')) return 'metric-stress';
  if (text.includes('BMI') || text.includes('体脂') || text.includes('体重') || text.includes('肌肉') || text.includes('水分')) return 'metric-body';
  if (text.includes('肥胖') || text.includes('腰臀') || text.includes('脂肪')) return 'metric-obesity';
  return 'metric-default';
};

const hasMeaningfulValue = (value) => {
  if (value === undefined || value === null) return false;
  const text = String(value).trim();
  return text !== '' && text !== '--' && text !== '未知' && text !== '未知客户' && text !== 'null' && text !== 'undefined';
};

const normalizeValue = (value) => {
  return hasMeaningfulValue(value) ? String(value).trim() : '';
};

const getArrayItemValue = (items, label) => {
  if (!Array.isArray(items)) return '';
  return items.find(item => item.label === label)?.value || '';
};

const getReportValue = (reportData, labels, sources = ['profile', 'sleepProfile', 'inbodyProfile', 'sleepMonitorInfo', 'sleepMonitorParams']) => {
  const labelList = Array.isArray(labels) ? labels : [labels];
  for (const source of sources) {
    const items = reportData?.[source];
    for (const label of labelList) {
      const value = getArrayItemValue(items, label);
      if (hasMeaningfulValue(value)) {
        return String(value).trim();
      }
    }
  }
  return '';
};

const buildUniqueItems = (groups, allowedLabels = null) => {
  const mapped = new Map();

  groups.forEach(group => {
    if (!Array.isArray(group)) return;
    group.forEach(item => {
      const label = String(item?.label || '').trim();
      const value = normalizeValue(item?.value);
      if (!label || !value) return;
      if (allowedLabels && !allowedLabels.includes(label)) return;
      if (!mapped.has(label)) {
        mapped.set(label, {
          label,
          value,
          unit: normalizeValue(item?.unit),
          status: normalizeValue(item?.status),
          isWarning: !!item?.isWarning
        });
      }
    });
  });

  return Array.from(mapped.values());
};

const buildTableSection = (key, title, rows, columns) => {
  if (!Array.isArray(rows) || !rows.length) return null;

  const normalizedRows = rows
    .map(row => {
      const nextRow = {};
      columns.forEach(column => {
        nextRow[column.key] = normalizeValue(row?.[column.key]);
      });
      return nextRow;
    })
    .filter(row => columns.some(column => hasMeaningfulValue(row[column.key])));

  if (!normalizedRows.length) return null;

  return {
    key,
    title,
    type: 'table',
    columns,
    rows: normalizedRows
  };
};

const buildDynamicTableSection = (key, table, fallbackTitle) => {
  const headers = Array.isArray(table?.headers)
    ? table.headers.map(header => normalizeValue(header)).filter(Boolean)
    : [];

  const rows = Array.isArray(table?.rows)
    ? table.rows
        .map(row => (Array.isArray(row) ? row.map(cell => normalizeValue(cell)) : []))
        .filter(row => row.some(hasMeaningfulValue))
    : [];

  if (!headers.length && !rows.length) return null;

  const normalizedHeaders = headers.length
    ? headers
    : (rows[0] || []).map((_, index) => `列${index + 1}`);

  return {
    key,
    title: normalizeValue(table?.title) || fallbackTitle,
    type: 'matrix',
    headers: normalizedHeaders,
    rows: rows.map(row => normalizedHeaders.map((_, index) => row[index] || ''))
  };
};

const buildTextSection = (key, title, text) => {
  const normalizedText = normalizeValue(text);
  if (!normalizedText) return null;
  return {
    key,
    title,
    type: 'text',
    text: normalizedText
  };
};

const buildCardItems = (items) => {
  return buildUniqueItems([items]);
};

const buildBasicInfo = (reportData) => {
  return buildUniqueItems(
    [reportData?.profile, reportData?.sleepProfile, reportData?.inbodyProfile],
    basicInfoLabels
  );
};

const buildHighlightMetrics = (reportData) => {
  const mapped = new Map();

  const pushMetric = (label, value, unit = '', source = '', status = '', isWarning = false) => {
    const normalizedLabel = normalizeValue(label);
    const normalizedValue = normalizeValue(value);
    if (!normalizedLabel || !normalizedValue || mapped.has(normalizedLabel)) return;

    mapped.set(normalizedLabel, {
      label: normalizedLabel,
      value: normalizedValue,
      unit: normalizeValue(unit),
      source,
      status: normalizeValue(status),
      isWarning: !!isWarning
    });
  };

  (reportData?.inbody || []).forEach(item => {
    pushMetric(item.label, item.value, item.unit, 'InBody', item.status, item.isWarning);
  });

  (reportData?.stress || []).forEach(item => {
    pushMetric(item.label, item.value, item.unit, '压力检测', item.status, item.isWarning);
  });

  (reportData?.sleepMetricsTable || []).forEach(item => {
    pushMetric(item.metric, item.value, item.unit, '睡眠监测');
  });

  return Array.from(mapped.values()).slice(0, 12);
};

const buildSections = (reportData) => {
  const sections = [];

  const pushSection = (section) => {
    if (section) sections.push(section);
  };

  const inbodyProfileItems = buildUniqueItems([reportData?.inbodyProfile]);
  const stressProfileItems = buildUniqueItems([reportData?.profile]);
  const sleepProfileItems = buildUniqueItems([reportData?.sleepProfile]);
  const sleepMonitorInfoItems = buildUniqueItems([reportData?.sleepMonitorInfo]);
  const sleepMonitorParamItems = buildUniqueItems([reportData?.sleepMonitorParams]);

  pushSection(inbodyProfileItems.length ? { key: 'inbody-profile', title: 'InBody基础资料', type: 'kv', items: inbodyProfileItems } : null);
  pushSection(buildCardItems(reportData?.inbody).length ? { key: 'inbody-metrics', title: 'InBody核心指标', type: 'cards', items: buildCardItems(reportData?.inbody) } : null);
  pushSection(buildTableSection('inbody-table', '人体成分分析', reportData?.inbodyTable, [
    { key: 'category', label: '分类' },
    { key: 'metric', label: '项目' },
    { key: 'value', label: '数值' },
    { key: 'unit', label: '单位' },
    { key: 'range', label: '标准范围' }
  ]));
  pushSection(buildTableSection('muscle-fat', '肌肉脂肪分析', reportData?.muscleFatAnalysis, [
    { key: 'metric', label: '项目' },
    { key: 'value', label: '数值' },
    { key: 'unit', label: '单位' },
    { key: 'status', label: '状态' }
  ]));
  pushSection(buildTableSection('obesity-analysis', '肥胖分析', reportData?.obesityAnalysis, [
    { key: 'metric', label: '项目' },
    { key: 'value', label: '数值' },
    { key: 'unit', label: '单位' },
    { key: 'status', label: '状态' }
  ]));

  pushSection(stressProfileItems.length ? { key: 'stress-profile', title: '压力报告基础资料', type: 'kv', items: stressProfileItems } : null);
  pushSection(buildCardItems(reportData?.stress).length ? { key: 'stress-metrics', title: '压力核心指标', type: 'cards', items: buildCardItems(reportData?.stress) } : null);
  pushSection(buildTableSection('stress-table', '压力检测明细', reportData?.stressTable, [
    { key: 'item', label: '项目' },
    { key: 'value', label: '数值' },
    { key: 'result', label: '结果' },
    { key: 'standard', label: '标准' }
  ]));

  pushSection(sleepProfileItems.length ? { key: 'sleep-profile', title: '睡眠基础资料', type: 'kv', items: sleepProfileItems } : null);
  pushSection(sleepMonitorInfoItems.length ? { key: 'sleep-monitor-info', title: '监测信息', type: 'kv', items: sleepMonitorInfoItems } : null);
  pushSection(sleepMonitorParamItems.length ? { key: 'sleep-monitor-params', title: '监测参数', type: 'kv', items: sleepMonitorParamItems } : null);
  pushSection(buildTableSection('sleep-metrics', '睡眠指标明细', reportData?.sleepMetricsTable, [
    { key: 'metric', label: '指标' },
    { key: 'value', label: '数值' },
    { key: 'unit', label: '单位' }
  ]));
  pushSection(buildDynamicTableSection('sleep-statistics', reportData?.sleepStatistics, '睡眠数据统计'));
  pushSection(buildDynamicTableSection('daily-statistics', reportData?.dailyStatistics, '每日统计'));
  pushSection(buildTextSection('sleep-summary', '睡眠总结', reportData?.sleepSummaryText));

  return sections;
};

const createSectionMap = (sections) => {
  return sections.reduce((acc, section) => {
    acc[section.key] = section;
    return acc;
  }, {});
};

const pickSections = (sectionMap, keys) => {
  return keys.map(key => sectionMap[key]).filter(Boolean);
};

const parseScore = (value) => {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : null;
};

const formatAge = (age) => {
  const normalizedAge = normalizeValue(age);
  if (!normalizedAge) return '';
  return /岁$/.test(normalizedAge) ? normalizedAge : `${normalizedAge}岁`;
};

const getValueByLabels = (items, labels) => {
  const labelList = Array.isArray(labels) ? labels : [labels];
  for (const label of labelList) {
    const matched = items.find(item => item.label === label && hasMeaningfulValue(item.value));
    if (matched) return matched.value;
  }
  return '';
};

const buildProfileSummary = (patient, basicInfo) => {
  return [
    { label: '姓名', value: patient.name },
    { label: '性别', value: patient.gender },
    { label: '出生日期', value: getValueByLabels(basicInfo, '出生日期') },
    { label: '年龄', value: formatAge(patient.age) },
    { label: '身份证号', value: getValueByLabels(basicInfo, ['身份证号码', '编码', 'ID']) },
    { label: '检测日期', value: patient.date }
  ].filter(item => hasMeaningfulValue(item.value));
};

const weightedAverage = (items) => {
  const validItems = items.filter(item => item && typeof item.value === 'number' && !Number.isNaN(item.value) && item.weight > 0);
  if (!validItems.length) return null;

  const totalWeight = validItems.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return null;

  return validItems.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
};

const clampScore = (score) => {
  if (score === null || score === undefined || Number.isNaN(score)) return null;
  return Math.max(45, Math.min(98, Math.round(score)));
};

const getSectionByKey = (sections, key) => {
  return sections.find(section => section.key === key) || null;
};

const scoreFromAssessmentText = (text) => {
  const normalizedText = String(text || '').trim();
  if (!normalizedText) return null;

  if (/(重度|严重|高风险|异常|失衡|紊乱|危险)/.test(normalizedText)) return 55;
  if (/(偏高|偏低|风险|不足|肥胖|超重|过高|过低|需关注|异常倾向)/.test(normalizedText)) return 68;
  if (/(轻度|略高|略低|临界)/.test(normalizedText)) return 76;
  if (/(优秀|很好|理想)/.test(normalizedText)) return 92;
  if (/(正常|标准|良好|平衡|达标|健康|正常体重)/.test(normalizedText)) return 86;

  return null;
};

const evaluateSleepMetricScore = (label, value) => {
  const numericValue = parseNumber(value);
  const text = String(label || '');
  if (numericValue === null) return null;

  if (text.includes('睡眠效率') || text.includes('SE')) {
    if (numericValue >= 85) return 90;
    if (numericValue >= 75) return 80;
    return 66;
  }

  if ((text.includes('总睡眠时间') || text.includes('睡眠时间')) && !text.includes('清醒')) {
    if (numericValue >= 420 && numericValue <= 540) return 90;
    if ((numericValue >= 360 && numericValue < 420) || (numericValue > 540 && numericValue <= 600)) return 80;
    return 68;
  }

  if (text.includes('清醒时间') || text.includes('WASO')) {
    if (numericValue <= 30) return 88;
    if (numericValue <= 60) return 78;
    return 65;
  }

  if (text.includes('入睡') || text.includes('潜伏')) {
    if (numericValue <= 30) return 88;
    if (numericValue <= 60) return 76;
    return 64;
  }

  if (text.includes('觉醒') || text.includes('醒来次数')) {
    if (numericValue <= 2) return 88;
    if (numericValue <= 4) return 76;
    return 62;
  }

  return null;
};

const buildCompositeAssessment = ({ sections, highlightMetrics, inbodyScore }) => {
  const sectionSignals = [];

  sections.forEach(section => {
    if (section.type === 'cards') {
      (section.items || []).forEach(item => {
        sectionSignals.push({
          label: item.label,
          value: item.value,
          text: item.status || item.value,
          isWarning: !!item.isWarning
        });
      });
    }

    if (section.type === 'table') {
      (section.rows || []).forEach(row => {
        sectionSignals.push({
          label: row.metric || row.item || row.category || '',
          value: row.value,
          text: row.status || row.result || row.standard || '',
          isWarning: false
        });
      });
    }
  });

  const keywordScores = sectionSignals
    .map(signal => scoreFromAssessmentText(signal.text))
    .filter(score => typeof score === 'number');

  const sleepSignals = [
    ...(getSectionByKey(sections, 'sleep-metrics')?.rows || []).map(row => ({ label: row.metric, value: row.value })),
    ...(getSectionByKey(sections, 'sleep-monitor-info')?.items || []).map(item => ({ label: item.label, value: item.value })),
    ...(getSectionByKey(sections, 'sleep-monitor-params')?.items || []).map(item => ({ label: item.label, value: item.value }))
  ];

  const sleepScores = sleepSignals
    .map(item => evaluateSleepMetricScore(item.label, item.value))
    .filter(score => typeof score === 'number');

  const bmiMetric = highlightMetrics.find(item => item.label.includes('BMI'));
  const bodyFatMetric = highlightMetrics.find(item => item.label.includes('体脂'));
  const warningCount = highlightMetrics.filter(item => item.isWarning).length;

  const bmiScore = (() => {
    const bmi = parseNumber(bmiMetric?.value);
    if (bmi === null) return null;
    if (bmi >= 18.5 && bmi <= 23.9) return 90;
    if (bmi >= 24 && bmi <= 27.9) return 76;
    return 62;
  })();

  const bodyFatScore = (() => {
    const bodyFat = parseNumber(bodyFatMetric?.value);
    if (bodyFat === null) return null;
    if (bodyFat <= 20) return 88;
    if (bodyFat <= 28) return 76;
    return 64;
  })();

  const warningScore = Math.max(52, 90 - warningCount * 6);
  const keywordScore = keywordScores.length
    ? keywordScores.reduce((sum, score) => sum + score, 0) / keywordScores.length
    : null;
  const sleepScore = sleepScores.length
    ? sleepScores.reduce((sum, score) => sum + score, 0) / sleepScores.length
    : null;

  const derivedScore = weightedAverage([
    { value: keywordScore, weight: 0.35 },
    { value: sleepScore, weight: 0.25 },
    { value: bmiScore, weight: 0.15 },
    { value: bodyFatScore, weight: 0.10 },
    { value: warningScore, weight: 0.15 }
  ]);

  const finalScore = clampScore(weightedAverage([
    { value: derivedScore, weight: inbodyScore !== null ? 0.65 : 1 },
    { value: inbodyScore, weight: inbodyScore !== null ? 0.35 : 0 }
  ]));

  const dataPoints =
    sectionSignals.filter(signal => hasMeaningfulValue(signal.label) && hasMeaningfulValue(signal.value)).length +
    sleepSignals.filter(signal => hasMeaningfulValue(signal.label) && hasMeaningfulValue(signal.value)).length;

  return {
    score: finalScore,
    note: dataPoints
      ? `基于 ${dataPoints} 项真实检测数据综合评估`
      : '基于当前已采集真实数据综合评估'
  };
};

const buildMetricSummary = (score, highlightMetrics, inbodyScore = null) => {
  const cards = [];

  if (score !== null) {
    cards.push({
      label: '综合评分',
      value: String(score),
      unit: '分',
      note: 'AI综合评估',
      tone: 'green',
      isWarning: false
    });
  }

  if (inbodyScore !== null) {
    cards.push({
      label: 'InBody评分',
      value: String(inbodyScore),
      unit: '分',
      note: '原始体成分评分',
      tone: 'blue',
      isWarning: false
    });
  }

  highlightMetrics.slice(0, inbodyScore !== null ? 4 : 5).forEach((metric, index) => {
    cards.push({
      label: metric.label,
      value: metric.value,
      unit: metric.unit,
      note: metric.status || metric.source || '',
      tone: reportToneCycle[index % reportToneCycle.length],
      isWarning: metric.isWarning
    });
  });

  return cards.slice(0, 6);
};

const buildReportGroups = (sections, metricSummary, profileSummary) => {
  const sectionMap = createSectionMap(sections);
  const usedKeys = new Set();
  const groups = [];

  const pushSectionGroup = (config) => {
    const groupSections = pickSections(sectionMap, config.keys);
    if (!groupSections.length) return;
    config.keys.forEach(key => {
      if (sectionMap[key]) usedKeys.add(key);
    });
    groups.push({
      key: config.key,
      index: config.index,
      title: config.title,
      subtitle: config.subtitle,
      tone: config.tone,
      layout: config.layout,
      kind: 'sections',
      sections: groupSections
    });
  };

  pushSectionGroup({
    key: 'sleep',
    index: '1',
    title: '睡眠分析',
    subtitle: '睡眠结构与监测结果',
    tone: 'blue',
    layout: 'wide',
    keys: ['sleep-profile', 'sleep-monitor-info', 'sleep-monitor-params', 'sleep-metrics', 'sleep-statistics', 'daily-statistics', 'sleep-summary']
  });

  if (metricSummary.length || profileSummary.length) {
    groups.push({
      key: 'summary',
      index: '1.2',
      title: '检测摘要',
      subtitle: '关键指标与用户资料',
      tone: 'cyan',
      layout: 'compact',
      kind: 'metrics',
      cards: metricSummary,
      info: profileSummary.slice(0, 4)
    });
  }

  pushSectionGroup({
    key: 'stress',
    index: '2',
    title: '自律神经检测结果',
    subtitle: '压力与神经调节指标',
    tone: 'purple',
    layout: 'normal',
    keys: ['stress-profile', 'stress-metrics', 'stress-table']
  });

  pushSectionGroup({
    key: 'body',
    index: '3',
    title: '人体成分分析',
    subtitle: '体成分与肌肉脂肪结果',
    tone: 'green',
    layout: 'wide',
    keys: ['inbody-profile', 'inbody-metrics', 'inbody-table', 'muscle-fat']
  });

  pushSectionGroup({
    key: 'obesity',
    index: '4',
    title: '肥胖分析',
    subtitle: '肥胖相关真实指标',
    tone: 'orange',
    layout: 'normal',
    keys: ['obesity-analysis']
  });

  const remainingSections = sections.filter(section => !usedKeys.has(section.key));
  if (remainingSections.length) {
    groups.push({
      key: 'appendix',
      index: String(groups.length + 1),
      title: '补充资料',
      subtitle: '其他已采集数据',
      tone: 'teal',
      layout: 'wide',
      kind: 'sections',
      sections: remainingSections
    });
  }

  return groups;
};

const getPatientMeta = (patient) => {
  const parts = [];
  if (hasMeaningfulValue(patient.age)) parts.push(formatAge(patient.age));
  if (hasMeaningfulValue(patient.gender)) parts.push(patient.gender);
  parts.push(`编号: ${patient.id}`);
  return parts.join(' | ');
};

const hasPatientReportContent = (patient) => {
  return !!(
    patient &&
    (
      patient.reportGroups.length ||
      patient.profileSummary.length ||
      patient.metricSummary.length
    )
  );
};

const getScoreColor = (score) => {
  if (score >= 90) return '#03b48e';
  if (score >= 80) return '#14b6ff';
  if (score >= 60) return '#fef000';
  return '#ed405d';
};

const buildPatientRecord = (record) => {
  const reportData = record.reportData || {};
  const name = getReportValue(reportData, ['姓名', 'ID'], ['profile', 'sleepProfile', 'inbodyProfile']) || normalizeValue(record.name) || '未命名档案';
  const gender = getReportValue(reportData, '性别') || normalizeValue(record.gender);
  const age = getReportValue(reportData, '年龄') || normalizeValue(record.age);
  const date = getReportValue(reportData, ['测试日期', '报告时间', '开始时间', '结束时间']) || normalizeValue(record.date);
  const inbodyScore = parseScore(getReportValue(reportData, 'InBody评分', ['inbodyProfile']));
  const sourceTypes = Array.isArray(reportData.sourceTypes)
    ? reportData.sourceTypes
    : [reportData.type].filter(Boolean);

  const basicInfo = buildBasicInfo(reportData);
  const highlightMetrics = buildHighlightMetrics(reportData);
  const sections = buildSections(reportData);
  const profileSummary = buildProfileSummary({ name, gender, age, date }, basicInfo);
  const compositeAssessment = buildCompositeAssessment({ sections, highlightMetrics, inbodyScore });
  const score = compositeAssessment.score;
  const metricSummary = buildMetricSummary(score, highlightMetrics, inbodyScore);

  return {
    ...record,
    name,
    gender,
    age,
    date,
    score,
    sourceLabels: [...new Set(sourceTypes.map(type => sourceTypeLabelMap[type] || type))],
    basicInfo,
    highlightMetrics,
    sections,
    profileSummary,
    compositeAssessment,
    inbodyScore,
    metricSummary,
    reportGroups: buildReportGroups(sections, metricSummary, profileSummary)
  };
};

const loadPatients = async () => {
  const currentActiveId = activePatient.value?.id;
  const records = await fetchPatients();
  patients.value = records.map(record => {
    const normalized = {
      ...record,
      id: record.id,
      reportData: record.latestReport?.reportData || record.reportData || {}
    };
    return buildPatientRecord(normalized);
  });

  activePatient.value =
    patients.value.find(patient => patient.id === currentActiveId) ||
    patients.value[0] ||
    null;
};

onShow(() => {
  loadPatients().catch((error) => {
    console.error('加载档案失败:', error);
    uni.showToast({
      title: error?.message || '加载档案失败',
      icon: 'none'
    });
  });
});

const filteredPatients = computed(() => {
  return patients.value.filter(patient => {
    const searchText = String(searchQuery.value || '').trim();
    const matchSearch =
      !searchText ||
      patient.name.includes(searchText) ||
      patient.id.includes(searchText);
    const matchTab = activeTab.value === 'all' || patient.status === activeTab.value;
    return matchSearch && matchTab;
  });
});

const joinItemValue = (item) => {
  if (!item || !hasMeaningfulValue(item.value)) return '--';
  return `${item.value}${item.unit ? ` ${item.unit}` : ''}`;
};

const toPairRows = (items) => {
  const normalized = items.filter(item => hasMeaningfulValue(item?.value));
  const rows = [];
  for (let index = 0; index < normalized.length; index += 2) {
    rows.push({
      left: normalized[index],
      right: normalized[index + 1] || null
    });
  }
  return rows;
};

const getPatientSection = (patient, key) => {
  return patient?.sections?.find(section => section.key === key) || null;
};

const pickMeaningfulItems = (items = [], labelKey = 'label') => {
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map(item => {
      const label = normalizeValue(item?.[labelKey]);
      const value = normalizeValue(item?.value);
      const unit = normalizeValue(item?.unit);
      const status = normalizeValue(item?.status || item?.result || item?.standard);
      return {
        label,
        value: value ? `${value}${unit ? ` ${unit}` : ''}`.trim() : '',
        status
      };
    })
    .filter(item => item.label && item.value);
};

const pickMeaningfulRows = (rows = []) => {
  return (Array.isArray(rows) ? rows : [])
    .filter(Boolean)
    .map(row => {
      const label = normalizeValue(row.metric || row.item || row.category);
      const value = normalizeValue(row.value);
      const unit = normalizeValue(row.unit);
      const status = normalizeValue(row.status || row.result || row.standard);
      return {
        label,
        value: value ? `${value}${unit ? ` ${unit}` : ''}`.trim() : '',
        status
      };
    })
    .filter(item => item.label && item.value);
};

const buildGuidancePayload = (patient) => {
  const sleepSummary = normalizeValue(getPatientSection(patient, 'sleep-summary')?.text);
  const stressTable = getPatientSection(patient, 'stress-table')?.rows || [];

  return {
    patient: {
      id: patient?.id || '',
      name: patient?.name || '',
      score: patient?.score || '',
      inbodyScore: patient?.inbodyScore || '',
      sourceLabels: patient?.sourceLabels || [],
      basicInfo: patient?.basicInfo || []
    },
    compositeAssessment: patient?.compositeAssessment || {},
    highlightMetrics: (patient?.highlightMetrics || []).filter(Boolean).map(item => ({
      label: item.label || '',
      value: item.value || '',
      unit: item.unit || '',
      status: item.status || '',
      isWarning: !!item.isWarning
    })),
    sleep: {
      profile: pickMeaningfulItems(getPatientSection(patient, 'sleep-profile')?.items),
      monitorInfo: pickMeaningfulItems(getPatientSection(patient, 'sleep-monitor-info')?.items),
      monitorParams: pickMeaningfulItems(getPatientSection(patient, 'sleep-monitor-params')?.items),
      metrics: pickMeaningfulRows(getPatientSection(patient, 'sleep-metrics')?.rows),
      summary: sleepSummary
    },
    stress: {
      profile: pickMeaningfulItems(getPatientSection(patient, 'stress-profile')?.items),
      metrics: pickMeaningfulItems(getPatientSection(patient, 'stress-metrics')?.items),
      table: pickMeaningfulRows(stressTable)
    },
    bodyComposition: {
      profile: pickMeaningfulItems(getPatientSection(patient, 'inbody-profile')?.items),
      metrics: pickMeaningfulItems(getPatientSection(patient, 'inbody-metrics')?.items),
      table: pickMeaningfulRows(getPatientSection(patient, 'inbody-table')?.rows),
      muscleFat: pickMeaningfulRows(getPatientSection(patient, 'muscle-fat')?.rows),
      obesity: pickMeaningfulRows(getPatientSection(patient, 'obesity-analysis')?.rows)
    }
  };
};

const buildSleepPairs = (patient) => {
  const sectionKeys = ['sleep-profile', 'sleep-monitor-info', 'sleep-monitor-params'];
  const items = sectionKeys
    .flatMap(key => getPatientSection(patient, key)?.items || [])
    .filter(Boolean)
    .map(item => ({
      label: item.label,
      value: joinItemValue(item)
    }));

  const metricRows = (getPatientSection(patient, 'sleep-metrics')?.rows || [])
    .filter(Boolean)
    .map(row => ({
      label: row.metric || row.item || row.category,
      value: `${row.value || '--'}${row.unit ? ` ${row.unit}` : ''}`.trim()
    }));

  return toPairRows([...items, ...metricRows].filter(item => hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value)).slice(0, 14));
};

const buildSleepInsights = (patient) => {
  const sleepSummary = getPatientSection(patient, 'sleep-summary')?.text || '';
  const summaryItems = String(sleepSummary)
    .split(/[。；\n]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((text, index) => ({
      title: `睡眠解读 ${index + 1}`,
      text,
      iconKey: 'sleep',
      tone: ['green', 'blue', 'purple'][index % 3]
    }));

  const metricItems = (getPatientSection(patient, 'sleep-metrics')?.rows || [])
    .filter(row => row && hasMeaningfulValue(row.metric) && hasMeaningfulValue(row.value))
    .slice(0, Math.max(0, 5 - summaryItems.length))
    .map((row, index) => ({
      title: row.metric,
      text: `${row.metric}为 ${row.value}${row.unit ? ` ${row.unit}` : ''}`.trim(),
      iconKey: 'metric-sleep',
      tone: ['blue', 'orange', 'green', 'purple'][index % 4]
    }));

  return [...summaryItems, ...metricItems].slice(0, 5);
};

const buildStressStats = (patient) => {
  const metricItems = (getPatientSection(patient, 'stress-metrics')?.items || [])
    .filter(item => item && hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value))
    .map(item => ({
      label: item.label,
      value: joinItemValue(item),
      note: item.status || '',
      iconKey: getMetricIconKey(item.label)
    }));

  if (metricItems.length) {
    return metricItems.slice(0, 4);
  }

  return (getPatientSection(patient, 'stress-table')?.rows || [])
    .filter(row => row && hasMeaningfulValue(row.item) && hasMeaningfulValue(row.value))
    .slice(0, 4)
    .map(row => ({
      label: row.item,
      value: row.value,
      note: row.result || row.standard || '',
      iconKey: getMetricIconKey(row.item)
    }));
};

const buildStressMarkers = (stressStats) => {
  if (!stressStats.length) return [];
  const width = Number((100 / stressStats.length).toFixed(2));
  const tones = ['green', 'blue', 'orange', 'purple'];
  return stressStats.slice(0, 4).map((item, index) => ({
    label: item.label,
    width,
    tone: tones[index % tones.length]
  }));
};

const buildBodyPairs = (patient) => {
  const profileItems = (getPatientSection(patient, 'inbody-profile')?.items || [])
    .filter(Boolean)
    .map(item => ({
      label: item.label,
      value: joinItemValue(item)
    }));

  const tableItems = (getPatientSection(patient, 'inbody-table')?.rows || [])
    .filter(Boolean)
    .map(row => ({
      label: row.metric || row.category || '指标',
      value: `${row.value || '--'}${row.unit ? ` ${row.unit}` : ''}`.trim()
    }));

  return toPairRows([...profileItems, ...tableItems].filter(item => hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value)).slice(0, 10));
};

const parseNumber = (value) => {
  const matched = String(value || '').match(/-?\d+(\.\d+)?/);
  return matched ? Number(matched[0]) : null;
};

const calcBarPercent = (value) => {
  const number = parseNumber(value);
  if (number === null) return 50;
  if (number <= 0) return 12;
  if (number >= 100) return 100;
  return Math.max(12, Math.min(100, number));
};

const buildBodyBars = (patient) => {
  const rows = getPatientSection(patient, 'muscle-fat')?.rows || [];
  const cards = rows.length
    ? rows
    : (getPatientSection(patient, 'inbody-metrics')?.items || []).filter(Boolean).map(item => ({
        metric: item.label,
        value: item.value,
        unit: item.unit,
        status: item.status
      }));

  return cards
    .filter(item => item && hasMeaningfulValue(item.metric) && hasMeaningfulValue(item.value))
    .slice(0, 3)
    .map(item => ({
      label: item.metric,
      value: `${item.value}${item.unit ? ` ${item.unit}` : ''}`.trim(),
      percent: calcBarPercent(item.value),
      note: item.status || '已采集真实指标'
    }));
};

const buildObesityCards = (patient) => {
  return (getPatientSection(patient, 'obesity-analysis')?.rows || [])
    .filter(item => item && hasMeaningfulValue(item.metric) && hasMeaningfulValue(item.value))
    .slice(0, 4)
    .map(item => ({
      label: item.metric,
      value: `${item.value}${item.unit ? ` ${item.unit}` : ''}`.trim(),
      percent: calcBarPercent(item.value),
      note: item.status || '来自真实档案'
    }));
};

const buildExerciseAdvice = (patient) => {
  const bmiMetric =
    (getPatientSection(patient, 'obesity-analysis')?.rows || []).find(item => item && String(item.metric || '').includes('BMI')) ||
    patient?.highlightMetrics?.find(item => item && String(item.label || '').includes('BMI')) ||
    null;
  const bodyFatMetric =
    (getPatientSection(patient, 'obesity-analysis')?.rows || []).find(item => item && String(item.metric || '').includes('体脂')) ||
    patient?.highlightMetrics?.find(item => item && String(item.label || '').includes('体脂')) ||
    null;
  const weightMetric =
    (getPatientSection(patient, 'inbody-metrics')?.items || []).find(item => item && String(item.label || '').includes('体重')) ||
    patient?.highlightMetrics?.find(item => item && String(item.label || '').includes('体重')) ||
    null;

  const bmi = parseNumber(bmiMetric?.value);
  const bodyFat = parseNumber(bodyFatMetric?.value);
  const weight = parseNumber(weightMetric?.value);
  const score = patient?.score;
  const suggestions = [];

  if (bmi !== null || bodyFat !== null) {
    if ((bmi !== null && bmi >= 28) || (bodyFat !== null && bodyFat >= 30)) {
      suggestions.push({
        title: '以减脂有氧为主',
        text: `当前${bmi !== null ? `BMI为 ${bmi}` : '体脂偏高'}，建议每周进行 5 次中低强度有氧运动，每次 40-60 分钟，可选择快走、椭圆机、骑行或游泳。`,
        iconKey: 'body'
      });
    } else if ((bmi !== null && bmi >= 24) || (bodyFat !== null && bodyFat >= 25)) {
      suggestions.push({
        title: '有氧结合力量训练',
        text: `当前${bmi !== null ? `BMI为 ${bmi}` : '体脂略高'}，建议每周 3-4 次有氧运动，每次 30-45 分钟，并增加 2 次基础力量训练以提升代谢。`,
        iconKey: 'body'
      });
    } else {
      suggestions.push({
        title: '保持规律运动',
        text: '当前体重控制整体尚可，建议每周保持 3 次以上中等强度运动，每次 30 分钟以上，重点维持心肺和肌肉状态。',
        iconKey: 'body'
      });
    }
  }

  if (score !== null && score < 75) {
    suggestions.push({
      title: '先稳住节奏再提强度',
      text: `当前综合评分为 ${score} 分，建议优先采用可持续的训练节奏，如快走、低冲击骑行、拉伸和基础力量训练，避免一开始就高强度冲刺。`,
      iconKey: 'stress'
    });
  } else {
    suggestions.push({
      title: '增加代谢型训练',
      text: '可在每周规律运动基础上，加入 1-2 次间歇性训练或循环抗阻训练，帮助提升基础代谢和体脂管理效率。',
      iconKey: 'stress'
    });
  }

  if (weight !== null) {
    suggestions.push({
      title: '关注周运动量',
      text: `当前体重约 ${weight} kg，建议将每周累计运动时间控制在 150-300 分钟之间，并保持日常步行活跃度，减少久坐时间。`,
      iconKey: 'obesity'
    });
  }

  const deduped = [];
  const seen = new Set();
  suggestions.forEach(item => {
    const key = `${item.title}-${item.text}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  });

  return deduped.slice(0, 3);
};

const normalizeAiAdviceItems = (items, fallbackIconKey) => {
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map(item => ({
      title: normalizeValue(item?.title) || '个性化建议',
      text: normalizeValue(item?.text),
      iconKey: item?.iconKey || fallbackIconKey
    }))
    .filter(item => item.text)
    .slice(0, 6);
};

const pushUniqueAdviceItem = (list, item, maxLength = 4) => {
  if (!item?.title || !item?.text || list.length >= maxLength) return;
  const key = `${item.title}-${item.text}`;
  if (!list.some(current => `${current.title}-${current.text}` === key)) {
    list.push(item);
  }
};

const buildAdviceItems = (patient, type) => {
  const healthAdvice = [];
  const dietAdvice = [];
  const warningMetrics = (patient?.highlightMetrics || []).filter(item => item.isWarning);
  const sleepSummary = getPatientSection(patient, 'sleep-summary')?.text || '';
  const obesityRows = getPatientSection(patient, 'obesity-analysis')?.rows || [];
  const bmiRow = obesityRows.find(item => String(item?.item || item?.metric || '').includes('BMI'));
  const bodyFatRow = obesityRows.find(item => {
    const label = String(item?.item || item?.metric || '');
    return label.includes('体脂') || label.includes('脂肪');
  });
  const weightMetric = (patient?.highlightMetrics || []).find(item => String(item?.label || '').includes('体重'));
  const score = patient?.score ?? null;

  if (hasMeaningfulValue(sleepSummary)) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '规律作息',
      text: String(sleepSummary).split(/[。；\n]/).map(item => item.trim()).filter(Boolean)[0],
      iconKey: 'sleep'
    });
    pushUniqueAdviceItem(dietAdvice, {
      title: '晚间饮食控制',
      text: '结合睡眠监测结果，建议晚间减少浓茶、咖啡及高糖夜宵摄入。',
      iconKey: 'sleep'
    });
  }

  warningMetrics.forEach(metric => {
    const valueText = `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`.trim();
    if ((metric.label.includes('压力') || metric.label.includes('神经')) && healthAdvice.length < 4) {
      pushUniqueAdviceItem(healthAdvice, {
        title: '减压恢复',
        text: `${metric.label}当前为 ${valueText}，建议增加轻运动、呼吸训练和规律休息。`,
        iconKey: 'stress'
      });
    }

    if ((metric.label.includes('BMI') || metric.label.includes('体脂') || metric.label.includes('脂肪') || metric.label.includes('体重')) && dietAdvice.length < 4) {
      pushUniqueAdviceItem(dietAdvice, {
        title: '饮食管理',
        text: `${metric.label}当前为 ${valueText}，建议减少油炸、精制糖和高热量零食摄入。`,
        iconKey: 'obesity'
      });
    }

    if ((metric.label.includes('肌肉') || metric.label.includes('水分')) && healthAdvice.length < 4) {
      pushUniqueAdviceItem(healthAdvice, {
        title: '体成分维护',
        text: `${metric.label}当前为 ${valueText}，建议保持规律训练并关注蛋白质和饮水摄入。`,
        iconKey: 'body'
      });
    }
  });

  if (healthAdvice.length < 4) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '固定作息节律',
      text: '建议尽量保持固定上床和起床时间，睡前 1 小时减少手机和高刺激内容，帮助睡眠质量逐步稳定。',
      iconKey: 'sleep'
    });
  }

  if (healthAdvice.length < 4 && score !== null) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '循序改善状态',
      text: `当前综合评分为 ${score} 分，建议先稳住作息、步行和拉伸等基础习惯，再逐步增加训练和生活管理强度。`,
      iconKey: 'summary'
    });
  }

  if (healthAdvice.length < 4) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '增加日间活动',
      text: '建议每工作 1 小时起身活动 3-5 分钟，并将步行、拉伸和轻量力量训练安排进日常节奏。',
      iconKey: 'body'
    });
  }

  if (healthAdvice.length < 4) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '重视恢复管理',
      text: '每周安排 1-2 天低强度恢复，配合补水、舒缓拉伸和呼吸放松，减少持续疲劳对状态的影响。',
      iconKey: 'stress'
    });
  }

  if (dietAdvice.length < 4 && bmiRow?.value) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '关注 BMI 管理',
      text: `当前 BMI 为 ${bmiRow.value}，建议主食定量、晚餐不过饱，并优先采用蒸煮炖等低油烹调方式。`,
      iconKey: 'obesity'
    });
  }

  if (dietAdvice.length < 4 && bodyFatRow?.value) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '优化体脂饮食结构',
      text: `当前${bodyFatRow.item || bodyFatRow.metric}为 ${bodyFatRow.value}${bodyFatRow.unit ? ` ${bodyFatRow.unit}` : ''}，建议减少含糖饮料和高油零食，提高蔬菜与蛋白质占比。`,
      iconKey: 'obesity'
    });
  }

  if (dietAdvice.length < 4 && weightMetric?.value) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '规律三餐摄入',
      text: `结合当前体重 ${weightMetric.value}${weightMetric.unit ? ` ${weightMetric.unit}` : ''}，建议保持规律三餐，避免长时间空腹后暴食或夜间加餐。`,
      iconKey: 'diet'
    });
  }

  if (dietAdvice.length < 4) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '优先高蛋白早餐',
      text: '早餐可优先选择鸡蛋、牛奶、无糖酸奶、豆制品等优质蛋白，帮助提升饱腹感并减少全天额外进食。',
      iconKey: 'diet'
    });
  }

  if (dietAdvice.length < 4) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '补充蔬果与饮水',
      text: '建议每日保证足量饮水，并在两餐中加入深色蔬菜、水果和粗杂粮，帮助控制总热量并改善代谢状态。',
      iconKey: 'diet'
    });
  }

  const deduped = (items) => {
    const seen = new Set();
    return items.filter(item => {
      const key = `${item.title}-${item.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
  };

  return type === 'diet' ? deduped(dietAdvice) : deduped(healthAdvice);
};

const buildDietTags = (dietAdvice) => {
  const tags = [];
  dietAdvice.forEach(item => {
    if (item.text.includes('高热量') || item.text.includes('精制糖')) tags.push('控糖控油');
    if (item.text.includes('蛋白质')) tags.push('优质蛋白');
    if (item.text.includes('夜宵')) tags.push('晚餐清淡');
  });
  return [...new Set(tags)].slice(0, 4);
};

const ensurePatientGuidance = async (patient) => {
  if (!patient?.id) return;
  if (aiGuidanceMap.value[patient.id]) return;

  aiGuidanceLoading.value = true;
  aiGuidanceError.value = '';

  try {
    const result = await generateHealthGuidance(buildGuidancePayload(patient));
    aiGuidanceMap.value = {
      ...aiGuidanceMap.value,
      [patient.id]: {
        summary: normalizeValue(result?.summary),
        healthAdvice: normalizeAiAdviceItems(result?.healthAdvice, 'summary'),
        dietAdvice: normalizeAiAdviceItems(result?.dietAdvice, 'obesity'),
        exerciseAdvice: normalizeAiAdviceItems(result?.exerciseAdvice, 'body'),
        dietTags: (Array.isArray(result?.dietTags) ? result.dietTags : []).map(tag => normalizeValue(tag)).filter(Boolean).slice(0, 6)
      }
    };
  } catch (error) {
    console.error('生成个性化建议失败:', error);
    aiGuidanceError.value = error?.message || 'AI 建议生成失败';
  } finally {
    aiGuidanceLoading.value = false;
  }
};

const reportViewModel = computed(() => {
  const patient = activePatient.value;
  if (!patient) return null;

  const stressTable = getPatientSection(patient, 'stress-table') || { columns: [], rows: [] };
  const stressStats = buildStressStats(patient);
  const fallbackDietAdvice = buildAdviceItems(patient, 'diet');
  const aiGuidance = aiGuidanceMap.value[patient.id] || null;
  const healthAdvice = aiGuidance?.healthAdvice?.length ? aiGuidance.healthAdvice : buildAdviceItems(patient, 'health');
  const dietAdvice = aiGuidance?.dietAdvice?.length ? aiGuidance.dietAdvice : fallbackDietAdvice;
  const exerciseAdvice = aiGuidance?.exerciseAdvice?.length ? aiGuidance.exerciseAdvice : buildExerciseAdvice(patient);
  const dietTags = aiGuidance?.dietTags?.length ? aiGuidance.dietTags : buildDietTags(dietAdvice);
  const exerciseAdvicePreview = exerciseAdvice.slice(0, 4);

  return {
    hasContent: hasPatientReportContent(patient),
    patientFields: buildProfileSummary(patient, patient.basicInfo).slice(0, 6),
    sleepPairs: buildSleepPairs(patient),
    sleepInsights: buildSleepInsights(patient),
    stressTable,
    stressStats,
    stressMarkers: buildStressMarkers(stressStats),
    bodyPairs: buildBodyPairs(patient),
    bodyBars: buildBodyBars(patient),
    obesityCards: buildObesityCards(patient),
    exerciseAdvice,
    exerciseAdvicePreview,
    healthAdvice,
    dietAdvice,
    dietTags,
    guidanceSummary: aiGuidance?.summary || '',
    aiGuidanceLoading: aiGuidanceLoading.value,
    aiGuidanceError: aiGuidanceError.value
  };
});

watch(
  () => activePatient.value?.id,
  () => {
    if (activePatient.value) {
      ensurePatientGuidance(activePatient.value);
    }
  },
  { immediate: true }
);

const selectPatient = (patient) => {
  activePatient.value = patient;
};

const deletePatient = (patient) => {
  uni.showModal({
    title: '删除确认',
    content: `确认删除 ${patient.name} 的档案吗？`,
    success: async (res) => {
      if (!res.confirm) return;

      try {
        await deletePatientRecord(patient.id);

        if (activePatient.value?.id === patient.id) {
          activePatient.value = null;
        }

        await loadPatients();
        uni.showToast({
          title: '已删除',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: error?.message || '删除失败',
          icon: 'none'
        });
      }
    }
  });
};

const buildReportFileName = () => {
  const patientName = activePatient.value?.name || '健康报告';
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${patientName}-健康报告-${datePart}-${timePart}.pdf`;
};

const buildReportGeneratedAt = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const getReportPaperElement = () => {
  const target = reportPaperRef.value;
  if (!target) return null;
  return target.$el || target;
};

// #ifdef H5
const exportReportForH5 = async () => {
  await nextTick();
  const element = getReportPaperElement();
  if (!(element instanceof HTMLElement)) {
    throw new Error('报告节点未找到');
  }
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) {
    throw new Error('打印窗口打开失败');
  }

  const styleText = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');
  const reportHtml = element.outerHTML;
  const generatedAt = buildReportGeneratedAt();
  const pdfDisclaimer = '声明：本报告仅供参考，不能作为疾病诊断的依据，如有不适，请及时就医。';

  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${buildReportFileName()}</title>
        ${styleText}
        <style>
          @page { size: 297mm 167.0625mm; margin: 0; }
          html, body { background: #dfe8f4 !important; }
          body {
            margin: 0;
            padding: 0;
            font-family: "Helvetica Neue", Helvetica, Arial, "sans-serif";
          }
          .print-shell {
            padding: 0;
            background: #dfe8f4;
          }
          .print-source {
            position: fixed;
            left: -99999px;
            top: 0;
            width: 297mm;
            visibility: hidden;
            pointer-events: none;
          }
          .print-pages {
            width: 297mm;
            margin: 0 auto;
          }
          .print-page {
            --page-scale: 1;
            width: 297mm;
            height: 167.0625mm;
            margin: 0 auto;
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
            overflow: hidden;
            background: #eef4fb;
          }
          .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .print-page-frame {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 14px 16px;
            overflow: hidden;
          }
          .print-page-scale {
            width: calc(100% / var(--page-scale));
            transform: scale(var(--page-scale));
            transform-origin: top left;
          }
          .print-page-surface {
            min-height: calc(167.0625mm - 28px);
            box-sizing: border-box;
            padding: 14px;
            border-radius: 18px;
            background: linear-gradient(180deg, #fefefe 0%, #f7fbff 100%);
            box-shadow: inset 0 0 0 1px #dce7f6;
          }
          .print-page-item + .print-page-item {
            margin-top: 10px;
          }
          .print-page.has-document-footer .print-page-surface {
            display: flex;
            flex-direction: column;
          }
          .print-page.has-document-footer .print-page-content {
            flex: 1 1 auto;
            min-height: 0;
          }
          .print-document-footer {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #dbe5f2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            color: #7a8ea9;
            font-size: 10px;
            line-height: 1.4;
          }
          .print-document-footer-left {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            flex: 1 1 auto;
          }
          .print-document-footer-icon {
            width: 18px;
            height: 18px;
            flex: 0 0 auto;
            color: #8ea3bf;
          }
          .print-document-footer-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .print-document-footer-date {
            flex: 0 0 auto;
            white-space: nowrap;
            color: #6b7f9a;
            font-weight: 600;
          }
          .print-page .reference-header,
          .print-page .reference-row,
          .print-page .reference-row-bottom {
            margin-bottom: 0;
          }
          .print-page .reference-report {
            gap: 10px;
          }
          .print-page .reference-header {
            gap: 10px;
            padding: 12px 14px;
          }
          .print-page .reference-title-text h2 {
            font-size: 28px;
          }
          .print-page .reference-title-text p {
            font-size: 12px;
          }
          .print-page .reference-patient-panel {
            grid-template-columns: minmax(0, 1fr) 112px;
            gap: 10px;
          }
          .print-page .reference-patient-grid {
            padding: 10px 12px;
          }
          .print-page .reference-patient-item {
            grid-template-columns: 64px minmax(0, 1fr);
            gap: 8px;
            padding: 3px 0;
            font-size: 12px;
          }
          .print-page .reference-badge-panel {
            padding: 10px 8px;
            border-radius: 16px;
          }
          .print-page .reference-score {
            margin-top: 8px;
            font-size: 26px;
          }
          .print-page .reference-score-label,
          .print-page .reference-score-note,
          .print-page .reference-score-sub {
            font-size: 11px;
          }
          .print-page .reference-row {
            grid-template-columns: minmax(0, 1.18fr) minmax(250px, 0.98fr);
            gap: 10px;
          }
          .print-page .reference-row-bottom {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .print-page .reference-section-body {
            padding: 9px 10px 10px;
          }
          .print-page .reference-section-title {
            min-height: 28px;
            padding: 0 12px;
            font-size: 14px;
          }
          .print-page .reference-pairs-table th,
          .print-page .reference-pairs-table td,
          .print-page .reference-data-table th,
          .print-page .reference-data-table td {
            padding: 6px 7px;
            font-size: 11px;
            line-height: 1.35;
          }
          .print-page .insight-item,
          .print-page .recommend-item,
          .print-page .exercise-advice-item,
          .print-page .metric-bar-item,
          .print-page .obesity-item,
          .print-page .reference-stat-card {
            padding: 8px 9px;
          }
          .print-page .insight-list,
          .print-page .recommend-list,
          .print-page .obesity-list,
          .print-page .metric-bar-list,
          .print-page .exercise-advice-list,
          .print-page .reference-stat-grid {
            gap: 7px;
          }
          .print-page .insight-content h5,
          .print-page .recommend-content h5,
          .print-page .exercise-advice-content h5 {
            font-size: 12px;
            margin-bottom: 3px;
          }
          .print-page .insight-content p,
          .print-page .recommend-content p,
          .print-page .exercise-advice-content p,
          .print-page .metric-bar-note,
          .print-page .obesity-note,
          .print-page .reference-stat-note,
          .print-page .paper-footer-note,
          .print-page .reference-score-note,
          .print-page .reference-score-sub {
            font-size: 10px;
            line-height: 1.5;
          }
          .print-page .guidance-summary,
          .print-page .guidance-status,
          .print-page .exercise-advice-box,
          .print-page .reference-balance-box {
            margin-bottom: 7px;
            padding: 8px 9px;
          }
          .print-page .reference-tag {
            min-height: 24px;
            padding: 0 10px;
            font-size: 10px;
          }
          .print-page .paper-source-tag {
            padding: 4px 8px;
            font-size: 10px;
          }
          .print-page .reference-stat-value {
            font-size: 24px;
          }
          .print-page .metric-bar-track,
          .print-page .reference-balance-track {
            margin-top: 5px;
          }
          .print-page .paper-footer {
            margin-top: 0;
            padding: 10px 12px;
          }
          .print-page .paper-source-tags,
          .print-page .reference-tag-row {
            gap: 6px;
            margin-top: 8px;
          }
          .print-page .paper-watermark,
          .print-page .empty-report {
            display: none !important;
          }
          .report-paper {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
        </style>
      </head>
      <body>
        <div class="print-shell">
          <div id="print-source" class="print-source">${reportHtml}</div>
          <div id="print-pages" class="print-pages"></div>
        </div>
        <script>
          (function() {
            const sourceRoot = document.querySelector('#print-source .report-paper');
            const pagesHost = document.getElementById('print-pages');

            if (!sourceRoot || !pagesHost) {
              window.__printReady = true;
              return;
            }

            const header = sourceRoot.querySelector('.reference-header');
            const report = sourceRoot.querySelector('.reference-report');
            const footer = sourceRoot.querySelector('.paper-footer');
            const rowNodes = report
              ? Array.from(report.children).filter((node) => node.classList && node.classList.contains('reference-row'))
              : [];
            const items = [header, ...rowNodes, footer].filter(Boolean).map((node) => node.cloneNode(true));

            const createPage = () => {
              const page = document.createElement('section');
              page.className = 'print-page';

              const frame = document.createElement('div');
              frame.className = 'print-page-frame';

              const scale = document.createElement('div');
              scale.className = 'print-page-scale';

              const surface = document.createElement('div');
              surface.className = 'print-page-surface';

              const content = document.createElement('div');
              content.className = 'print-page-content';

              surface.appendChild(content);
              scale.appendChild(surface);
              frame.appendChild(scale);
              page.appendChild(frame);
              pagesHost.appendChild(page);

              return { page, frame, scale, surface, content };
            };

            const finalizePage = (pageObj) => {
              const frameHeight = pageObj.frame.clientHeight;
              const contentHeight = pageObj.scale.scrollHeight;
              const scaleValue = contentHeight > 0 ? Math.min(1, frameHeight / contentHeight) : 1;
              pageObj.page.style.setProperty('--page-scale', scaleValue.toFixed(4));
            };

            let currentPage = createPage();

            items.forEach((item) => {
              const holder = document.createElement('div');
              holder.className = 'print-page-item';
              holder.appendChild(item);
              currentPage.content.appendChild(holder);

              const exceedsPage = currentPage.scale.scrollHeight > currentPage.frame.clientHeight + 2;
              if (exceedsPage && currentPage.content.children.length > 1) {
                currentPage.content.removeChild(holder);
                finalizePage(currentPage);
                currentPage = createPage();
                currentPage.content.appendChild(holder);
              }
            });

            Array.from(pagesHost.children).forEach((page) => {
              const frame = page.querySelector('.print-page-frame');
              const scale = page.querySelector('.print-page-scale');
              finalizePage({ page, frame, scale });
            });

            const pages = Array.from(pagesHost.children);
            const lastPage = pages[pages.length - 1];
            if (lastPage) {
              lastPage.classList.add('has-document-footer');
              const content = lastPage.querySelector('.print-page-content');
              const footerBar = document.createElement('div');
              footerBar.className = 'print-document-footer';
              footerBar.innerHTML = \`
                <div class="print-document-footer-left">
                  <svg class="print-document-footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z"></path>
                    <path d="M9.5 12.5l1.8 1.8 3.7-4"></path>
                  </svg>
                  <span class="print-document-footer-text">${pdfDisclaimer}</span>
                </div>
                <div class="print-document-footer-date">报告生成日期：${generatedAt}</div>
              \`;
              content?.insertAdjacentElement('afterend', footerBar);

              const frame = lastPage.querySelector('.print-page-frame');
              const scale = lastPage.querySelector('.print-page-scale');
              finalizePage({ page: lastPage, frame, scale });
            }

            document.getElementById('print-source')?.remove();
            window.__printReady = true;
          })();
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();

  await new Promise((resolve) => {
    const complete = () => {
      printWindow.focus();
      printWindow.print();
      resolve();
    };

    if (printWindow.document.readyState === 'complete') {
      complete();
      return;
    }

    printWindow.onload = complete;
    setTimeout(complete, 800);
  });
};
// #endif

const exportReport = async () => {
  if (!activePatient.value || exportLoading.value) return;

  exportLoading.value = true;
  uni.showLoading({ title: '正在生成 PDF...' });

  try {
    // #ifdef H5
    await exportReportForH5();
    uni.showToast({
      title: '请在打印窗口选择另存为 PDF',
      icon: 'none'
    });
    return;
    // #endif

    // #ifndef H5
    uni.showToast({
      title: '当前端暂不支持直接下载 PDF',
      icon: 'none'
    });
    // #endif
  } catch (error) {
    console.error('导出 PDF 失败', error);
    uni.showToast({
      title: 'PDF 导出失败，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
    exportLoading.value = false;
  }
};
</script>

<style scoped>
.report-wrapper {
  position: relative;
  min-height: 100vh;
  z-index: 1;
  overflow: hidden;
  font-family: "Helvetica Neue", Helvetica, Arial, "sans-serif";
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
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

.head-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  cursor: pointer;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(20, 182, 255, 0.2);
  border-color: #14b6ff;
}

.head h1 {
  color: #fff;
  text-align: center;
  font-size: 28px;
  letter-spacing: 2px;
  font-weight: bold;
  margin: 0;
}

.head h1 a {
  color: #fff;
  text-shadow: 0 0 15px rgba(20, 182, 255, 0.8), 0 0 30px rgba(20, 182, 255, 0.4), 0 4px 10px rgba(0, 0, 0, 0.8);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.user-info img {
  border-radius: 50%;
  border: 1px solid #14b6ff;
  padding: 2px;
}

.nav-btn {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  background: rgba(0, 0, 0, 0.3);
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
  padding: 20px;
  gap: 20px;
  height: calc(100vh - 100px);
  min-height: 0;
  align-items: stretch;
  box-sizing: border-box;
}

.left-panel {
  flex: 3;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  min-height: 0;
}

.right-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.boxall {
  background: rgba(6, 48, 109, 0.3);
  border: 1px solid rgba(20, 182, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(20, 182, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 25px;
}

.panel-title {
  font-size: 22px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title span::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 22px;
  background: #14b6ff;
  border-radius: 4px;
  margin-right: 10px;
  box-shadow: 0 0 8px #14b6ff;
  vertical-align: middle;
}

.search-box {
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-tabs span {
  flex: 1;
  text-align: center;
  font-size: 12px;
  padding: 6px 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s;
}

.filter-tabs span.active {
  background: rgba(20, 182, 255, 0.2);
  border-color: #14b6ff;
  color: #fff;
}

.patient-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 5px;
}

.patient-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.patient-card:hover,
.patient-card.active {
  background: rgba(20, 182, 255, 0.15);
  border-color: #14b6ff;
  box-shadow: 0 0 15px rgba(20, 182, 255, 0.3);
}

.avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.avatar img {
  width: 24px;
  opacity: 0.8;
}

.info {
  flex: 1;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.name {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.desc-row {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.delete-btn {
  margin-left: 12px;
  border: 1px solid rgba(237, 64, 93, 0.7);
  background: rgba(237, 64, 93, 0.12);
  color: #ff8da1;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: rgba(237, 64, 93, 0.2);
  color: #fff;
  box-shadow: 0 0 10px rgba(237, 64, 93, 0.25);
}

.badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.badge.ready {
  background: rgba(247, 140, 68, 0.2);
  color: #f78c44;
  border: 1px solid #f78c44;
}

.badge.processing {
  background: rgba(73, 188, 247, 0.2);
  color: #49bcf7;
  border: 1px solid #49bcf7;
}

.badge.done {
  background: rgba(3, 180, 142, 0.2);
  color: #03b48e;
  border: 1px solid #03b48e;
}

.export-btn {
  background: linear-gradient(90deg, #f78c44, #fef000);
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(247, 140, 68, 0.5);
  transition: all 0.3s;
}

.export-btn:disabled {
  cursor: not-allowed;
  opacity: 0.75;
  filter: saturate(0.85);
}

.export-btn:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(247, 140, 68, 0.8);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.empty-content {
  text-align: center;
}

.empty-content p {
  margin-top: 20px;
}

.report-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 15px;
}

.report-paper {
  position: relative;
  background: linear-gradient(180deg, #fefefe 0%, #f7fbff 100%);
  border-radius: 26px;
  padding: 28px;
  border: 1px solid rgba(126, 174, 255, 0.22);
  box-shadow: 0 18px 50px rgba(10, 35, 78, 0.25);
  overflow: visible;
  min-height: max-content;
}

.paper-watermark {
  position: absolute;
  top: 20px;
  right: 26px;
  font-size: 42px;
  font-weight: 800;
  color: rgba(31, 120, 255, 0.06);
  letter-spacing: 2px;
  pointer-events: none;
}

.paper-header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.9fr);
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  background: linear-gradient(135deg, #eef6ff 0%, #fdfefe 100%);
  border: 1px solid #dcecff;
  margin-bottom: 18px;
}

.paper-brand-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.paper-brand-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1f78ff 0%, #34b7ff 100%);
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(31, 120, 255, 0.3);
}

.report-inline-icon {
  width: 24px;
  height: 24px;
  display: block;
}

.paper-title-panel h2 {
  margin: 0;
  font-size: 38px;
  color: #1554c6;
  line-height: 1.1;
}

.paper-title-panel p {
  margin: 6px 0 0;
  color: #5a76a6;
  font-size: 14px;
  letter-spacing: 0.4px;
}

.paper-patient-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.paper-patient-line span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(31, 120, 255, 0.08);
  color: #31537d;
  font-size: 13px;
  border: 1px solid rgba(31, 120, 255, 0.14);
}

.paper-patient-name {
  background: linear-gradient(135deg, #1f78ff, #41b6ff) !important;
  color: #fff !important;
  font-weight: 700;
}

.paper-summary-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px;
  gap: 14px;
}

.profile-card,
.seal-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #dbe8fb;
  box-shadow: 0 10px 24px rgba(22, 74, 151, 0.08);
}

.profile-card {
  padding: 14px 16px;
}

.profile-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px dashed #e6eefb;
  font-size: 13px;
}

.profile-row:last-child {
  border-bottom: none;
}

.profile-label {
  color: #6880a7;
}

.profile-value {
  color: #21385e;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.seal-card {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.seal-icon-wrap {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(31, 120, 255, 0.12), rgba(39, 174, 96, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-icon {
  width: 42px;
  height: 42px;
  opacity: 0.88;
  color: #2163c2;
}

.seal-score {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.seal-label {
  margin-top: 8px;
  color: #6180a9;
  font-size: 12px;
}

.metric-chip-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.metric-chip {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid #dbe9fd;
  background: #fff;
  box-shadow: 0 8px 20px rgba(25, 76, 153, 0.08);
}

.metric-chip-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.metric-chip-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2767c0;
  background: rgba(31, 120, 255, 0.08);
  border: 1px solid rgba(31, 120, 255, 0.12);
  flex: 0 0 auto;
}

.metric-chip-label {
  color: #6d85ad;
  font-size: 12px;
  margin-bottom: 0;
}

.metric-chip-value {
  color: #1b4f9b;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.metric-chip-value small,
.summary-stat-value small,
.mini-kv-value small,
.mini-metric-value small {
  font-size: 12px;
  opacity: 0.7;
}

.metric-chip.warning .metric-chip-value,
.summary-stat-card.warning .summary-stat-value,
.mini-metric-value.warning {
  color: #e95454;
}

.metric-chip-note {
  margin-top: 6px;
  color: #88a0c0;
  font-size: 12px;
}

.paper-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: 16px;
  align-items: start;
}

.paper-card {
  background: #fff;
  border-radius: 22px;
  border: 1px solid #dbe8fb;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(20, 67, 139, 0.08);
  height: auto;
}

.paper-card.wide {
  grid-column: 1 / 2;
}

.paper-card.compact,
.paper-card.normal {
  grid-column: 2 / 3;
}

.paper-card.normal:nth-of-type(3),
.paper-card.wide:nth-of-type(4),
.paper-card.normal:nth-of-type(5),
.paper-card.wide:nth-of-type(n + 6) {
  grid-column: auto;
}

.paper-card.wide:nth-of-type(n + 3) {
  grid-column: 1 / span 2;
}

.paper-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.paper-card-index {
  min-width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2b66be;
  border: 1px solid rgba(31, 120, 255, 0.1);
  flex: 0 0 auto;
}

.paper-card-title-wrap h4 {
  margin: 0;
  font-size: 22px;
  color: #224770;
}

.paper-card-title-wrap p {
  margin: 4px 0 0;
  color: #7d93b4;
  font-size: 12px;
}

.summary-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.summary-stat-card {
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  border: 1px solid #e0ecfd;
}

.summary-stat-label {
  display: block;
  color: #758db0;
  font-size: 12px;
}

.summary-stat-value {
  display: block;
  margin-top: 8px;
  color: #1958a6;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.summary-stat-note {
  display: block;
  margin-top: 6px;
  color: #8fa3c0;
  font-size: 12px;
}

.summary-info-list {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #dbe6f6;
  display: grid;
  gap: 10px;
}

.summary-info-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #60789f;
  font-size: 13px;
}

.summary-info-item strong {
  color: #20395f;
  font-size: 13px;
  text-align: right;
}

.section-stack {
  display: grid;
  gap: 14px;
}

.mini-section {
  border-radius: 18px;
  background: #f9fbff;
  border: 1px solid #e2edfb;
  padding: 14px;
}

.mini-section-title {
  margin-bottom: 12px;
  color: #2c5c96;
  font-size: 16px;
  font-weight: 700;
}

.mini-kv-grid,
.mini-metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.mini-kv-card,
.mini-metric-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e3ebf8;
  padding: 12px;
}

.mini-kv-label {
  display: block;
  color: #7b91b3;
  font-size: 12px;
}

.mini-kv-value {
  display: block;
  margin-top: 7px;
  color: #244970;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  word-break: break-word;
}

.mini-metric-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #5d77a0;
  font-size: 12px;
}

.mini-metric-status {
  color: #f08a2a;
}

.mini-metric-value {
  margin-top: 8px;
  color: #1752a0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.mini-table-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e3ebf8;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

.data-table th,
.data-table td {
  padding: 11px 12px;
  border-bottom: 1px solid #eaf0f8;
  text-align: left;
  font-size: 12px;
  color: #2f4c74;
}

.data-table th {
  color: #2460af;
  background: #eef5ff;
  font-weight: 700;
}

.mini-text-block {
  padding: 14px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e3ebf8;
  color: #3b5375;
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
}

.paper-footer {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid #dce8f7;
  background: linear-gradient(180deg, #f9fcff 0%, #ffffff 100%);
}

.paper-footer-note {
  color: #56739e;
  font-size: 13px;
  line-height: 1.7;
}

.paper-source-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.paper-source-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(31, 120, 255, 0.08);
  border: 1px solid rgba(31, 120, 255, 0.14);
  color: #2f63ab;
  font-size: 12px;
}

.reference-header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.95fr);
  gap: 16px;
  padding: 20px 22px;
  margin-bottom: 16px;
  border-radius: 22px;
  border: 1px solid #dbe7fb;
  background:
    radial-gradient(circle at top right, rgba(74, 169, 255, 0.14), transparent 28%),
    radial-gradient(circle at left top, rgba(111, 205, 255, 0.18), transparent 22%),
    linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.reference-title-box {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.reference-title-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4d98ff 0%, #1f6df2 100%);
  box-shadow: 0 10px 20px rgba(31, 109, 242, 0.22);
}

.reference-title-text h2 {
  margin: 0;
  color: #1555c7;
  font-size: 36px;
  line-height: 1.1;
  font-weight: 800;
}

.reference-title-text p {
  margin: 6px 0 0;
  color: #5c76a4;
  font-size: 14px;
}

.reference-patient-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 134px;
  gap: 14px;
  align-items: stretch;
}

.reference-patient-grid {
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid #dce9fb;
  background: rgba(255, 255, 255, 0.88);
}

.reference-patient-item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 5px 0;
  color: #5e76a0;
  font-size: 13px;
}

.reference-patient-item strong {
  color: #24456f;
  font-weight: 700;
  word-break: break-word;
}

.reference-badge-panel {
  border-radius: 20px;
  border: 1px solid #dce9fb;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 14px 12px;
}

.reference-score {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.reference-score-label {
  margin-top: 8px;
  font-size: 12px;
  color: #6984b0;
}

.reference-score-note {
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: #6d84aa;
}

.reference-score-sub {
  margin-top: 6px;
  font-size: 11px;
  color: #97a9c4;
}

.reference-report {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reference-row {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 1fr);
  gap: 14px;
  align-items: stretch;
}

.reference-row-bottom {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.reference-section {
  border-radius: 18px;
  border: 1px solid #d9e6fb;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(28, 77, 151, 0.08);
  overflow: hidden;
}

.reference-section-body {
  padding: 12px 12px 14px;
}

.reference-section-title {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 16px;
  border-radius: 0 0 14px 0;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.reference-section-title.tone-blue {
  background: linear-gradient(135deg, #2979ff, #4fb2ff);
}

.reference-section-title.tone-yellow {
  background: linear-gradient(135deg, #f5a524, #ffc247);
}

.reference-section-title.tone-green {
  background: linear-gradient(135deg, #2bbd7e, #60d27d);
}

.reference-section-title.tone-orange {
  background: linear-gradient(135deg, #f28d35, #ffb347);
}

.reference-pairs-table,
.reference-data-table {
  width: 100%;
  border-collapse: collapse;
}

.reference-pairs-table th,
.reference-pairs-table td,
.reference-data-table th,
.reference-data-table td {
  border: 1px solid #dbe5f5;
  padding: 9px 10px;
  font-size: 12px;
  line-height: 1.45;
}

.reference-pairs-table th,
.reference-data-table th {
  background: #f3f7ff;
  color: #2d67bb;
  font-weight: 700;
}

.reference-pairs-table td,
.reference-data-table td {
  color: #35506f;
  background: #fff;
}

.insight-list,
.recommend-list,
.obesity-list,
.metric-bar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exercise-advice-box {
  margin-top: 12px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid #e3eaf8;
  background: linear-gradient(180deg, #fbfdff 0%, #f6faff 100%);
}

.exercise-advice-title {
  color: #2567c2;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.exercise-advice-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.exercise-advice-item {
  display: flex;
  gap: 7px;
  align-items: flex-start;
  padding: 7px 8px;
  border-radius: 10px;
  border: 1px solid #e1eaf9;
  background: #ffffff;
}

.exercise-advice-icon {
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #4aa8ff, #2b77ff);
}

.exercise-advice-content {
  min-width: 0;
}

.exercise-advice-content h5 {
  margin: 0 0 3px;
  font-size: 12px;
  line-height: 1.35;
  color: #285eaf;
}

.exercise-advice-content p {
  margin: 0;
  font-size: 10px;
  line-height: 1.45;
  color: #58729b;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.insight-item,
.recommend-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 10px 12px;
  border-radius: 14px;
  background: #f8fbff;
  border: 1px solid #e2eaf8;
}

.insight-icon,
.recommend-icon,
.reference-stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: #fff;
}

.insight-icon.tone-green,
.recommend-icon.tone-green {
  background: linear-gradient(135deg, #42c985, #63d56e);
}

.insight-icon.tone-blue {
  background: linear-gradient(135deg, #2d82ff, #56b9ff);
}

.insight-icon.tone-purple {
  background: linear-gradient(135deg, #8270ff, #b08cff);
}

.insight-icon.tone-orange,
.recommend-icon.tone-orange {
  background: linear-gradient(135deg, #f39d38, #ffba5c);
}

.insight-content,
.recommend-content {
  min-width: 0;
}

.insight-content h5,
.recommend-content h5 {
  margin: 0 0 6px;
  font-size: 14px;
  color: #2860b4;
}

.insight-content p,
.recommend-content p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #526c95;
  word-break: break-word;
}

.guidance-status,
.guidance-summary {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.7;
}

.guidance-status {
  color: #4b6e9f;
  background: #f5f9ff;
  border: 1px solid #dce9fb;
}

.guidance-status-warning {
  color: #9a6a24;
  background: #fff8ec;
  border-color: #ffe1b3;
}

.guidance-summary {
  color: #365887;
  background: linear-gradient(180deg, #f7fbff, #eef6ff);
  border: 1px solid #d9e8fb;
}

.guidance-summary-diet {
  background: linear-gradient(180deg, #fffaf4, #fff4e7);
  border-color: #ffe1bf;
}

.reference-stat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.reference-stat-card {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e0e8f7;
  background: #fafdff;
}

.reference-stat-top {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #58739c;
  font-size: 12px;
}

.reference-stat-icon {
  background: linear-gradient(135deg, #2d82ff, #4bb7ff);
}

.reference-stat-value {
  margin-top: 8px;
  color: #2f8e40;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
}

.reference-stat-note {
  margin-top: 4px;
  color: #7d91b2;
  font-size: 12px;
}

.reference-balance-box {
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e0e8f7;
  background: #fbfdff;
}

.reference-balance-title {
  color: #2b64b6;
  font-size: 13px;
  font-weight: 700;
}

.reference-balance-track {
  display: flex;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  margin-top: 10px;
  background: #eaf2fe;
}

.reference-balance-track span {
  display: block;
  height: 100%;
}

.reference-balance-track .tone-green {
  background: #61c96b;
}

.reference-balance-track .tone-blue {
  background: #559dff;
}

.reference-balance-track .tone-orange {
  background: #ffb14b;
}

.reference-balance-track .tone-purple {
  background: #a17df7;
}

.reference-balance-labels {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  color: #7488a7;
  font-size: 11px;
}

.metric-bar-item,
.obesity-item {
  padding: 9px 10px;
  border-radius: 12px;
  border: 1px solid #e1e9f8;
  background: #fbfdff;
}

.metric-bar-head,
.obesity-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #456183;
  font-size: 13px;
}

.metric-bar-head strong,
.obesity-head strong {
  color: #1d66c8;
}

.metric-bar-track {
  margin-top: 6px;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: linear-gradient(90deg, #edf3ff 0%, #dfe9fd 100%);
}

.metric-bar-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #74a8ff 0%, #2b76ff 100%);
}

.obesity-track span {
  background: linear-gradient(90deg, #ffc978 0%, #f28d35 100%);
}

.metric-bar-note,
.obesity-note {
  margin-top: 4px;
  font-size: 11px;
  color: #7890b1;
}

.reference-empty-block {
  padding: 18px 12px;
  text-align: center;
  font-size: 12px;
  color: #7f93b1;
  border: 1px dashed #d8e4f7;
  border-radius: 12px;
  background: #fbfdff;
}

.reference-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.reference-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #ffe0c0;
  background: #fff7ef;
  color: #d9842d;
  font-size: 12px;
  font-weight: 600;
}

.tone-blue .paper-card-index,
.metric-chip.tone-blue {
  background: linear-gradient(135deg, rgba(31, 120, 255, 0.12), rgba(52, 183, 255, 0.08));
}

.tone-green .paper-card-index,
.metric-chip.tone-green {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.12), rgba(99, 214, 143, 0.08));
}

.tone-purple .paper-card-index,
.metric-chip.tone-purple {
  background: linear-gradient(135deg, rgba(122, 93, 255, 0.12), rgba(173, 132, 255, 0.08));
}

.tone-orange .paper-card-index,
.metric-chip.tone-orange {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.14), rgba(255, 202, 102, 0.08));
}

.tone-teal .paper-card-index,
.metric-chip.tone-teal {
  background: linear-gradient(135deg, rgba(18, 181, 183, 0.14), rgba(125, 228, 230, 0.08));
}

.tone-cyan .paper-card-index,
.metric-chip.tone-cyan {
  background: linear-gradient(135deg, rgba(71, 197, 255, 0.14), rgba(180, 236, 255, 0.08));
}

.tone-blue .paper-card-index {
  background: linear-gradient(135deg, #1f78ff, #41b6ff);
}

.tone-green .paper-card-index {
  background: linear-gradient(135deg, #28b463, #57d68d);
}

.tone-purple .paper-card-index {
  background: linear-gradient(135deg, #7b5dff, #a78bfa);
}

.tone-orange .paper-card-index {
  background: linear-gradient(135deg, #f5a623, #ffc45b);
}

.tone-teal .paper-card-index {
  background: linear-gradient(135deg, #12b5b7, #58d4d6);
}

.tone-cyan .paper-card-index {
  background: linear-gradient(135deg, #35b7ff, #75d7ff);
}

.empty-report {
  padding: 28px 20px;
  text-align: center;
  color: #6f88ad;
  border: 1px dashed #d7e4f7;
  border-radius: 18px;
  background: #f8fbff;
}

.anim-slide-up {
  animation: slideUp 0.6s ease-out both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(20, 182, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(20, 182, 255, 0.6);
}

@media screen and (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }

  .head {
    flex-direction: column;
    height: auto;
    padding: 20px 0;
  }

  .nav-links {
    margin-top: 10px;
    justify-content: center;
  }

  .left-panel {
    min-height: 400px;
    flex: none;
  }

  .right-panel {
    min-height: 800px;
    flex: none;
  }

  .report-paper {
    padding: 18px;
  }

  .paper-watermark {
    display: none;
  }

  .reference-header,
  .reference-row,
  .reference-row-bottom,
  .paper-header,
  .paper-summary-panel,
  .paper-grid {
    grid-template-columns: 1fr;
  }

  .reference-patient-panel {
    grid-template-columns: 1fr;
  }

  .reference-title-text h2 {
    font-size: 30px;
  }

  .reference-patient-item {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .reference-section-body {
    overflow-x: auto;
  }

  .paper-card,
  .paper-card.wide,
  .paper-card.compact,
  .paper-card.normal,
  .paper-card.wide:nth-of-type(n + 3),
  .paper-card.normal:nth-of-type(3),
  .paper-card.wide:nth-of-type(4),
  .paper-card.normal:nth-of-type(5),
  .paper-card.wide:nth-of-type(n + 6) {
    grid-column: auto;
  }

  .paper-title-panel h2 {
    font-size: 30px;
  }

  .reference-stat-value {
    font-size: 24px;
  }

  .metric-chip-row,
  .summary-card-grid,
  .mini-kv-grid,
  .mini-metric-grid {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  }
}
</style>
