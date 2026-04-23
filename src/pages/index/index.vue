<template>
  <view class="dashboard-wrapper">
    <view class="bg-canvas"></view>
    
    <div class="scale-container" :style="scaleStyle">
      <div class="head">
        <div class="head-meta">
          <div class="time" id="showTime">{{ currentTime }}</div>
        </div>
        <h1><a href="javascript:void(0)">心身康养管理集成平台</a></h1>
        <div class="manage-enter-btn" v-if="!isEmbedMode" @click="goToUpload">
          进入管理后台
        </div>
        <div class="fullscreen-btn" v-if="!isEmbedMode" @click="toggleFullScreen" :title="isFullScreen ? '退出全屏' : '全屏播放'">
          <img :src="isFullScreen ? '/static/images/icon6.png' : '/static/images/icon1.png'" style="filter: brightness(0) invert(1); width: 0.2rem; opacity: 0.8;" />
        </div>
      </div>

    <div class="mainbox">
      <ul class="clearfix">
        <!-- Column 1 -->
        <li style="width: 28%;">
          <div class="boxall" style="height: calc(15% - .15rem)">
            <ul class="row h100 row1">
              <li class="col-6">
                <div class="bar1"><img src="/static/images/icon1.png" style="filter: brightness(0) invert(1); width: .3rem;">
                  <div style="text-align: left;"><span>总管理人数</span><h3>{{ dashboardSummary.totalPatients }}</h3></div>
                </div>
              </li>
              <li class="col-6">
                <div class="bar1"><img src="/static/images/icon5.png" style="filter: brightness(0) invert(1); width: .3rem;">
                  <div style="text-align: left;"><span>今日新增</span><h3>{{ dashboardSummary.todayNew }}</h3></div>
                </div>
              </li>
            </ul>
          </div>
          <div class="boxall" style="height: calc(43% - .15rem)">
            <div class="alltitle">健康问题分布</div>
            <ul class="sec h100">
              <li v-for="item in dashboardSummary.issueDistribution" :key="item.label">
                <div>
                  <p><img :src="item.icon" style="filter: brightness(0) invert(1);">{{ item.label }}</p>
                  <div class="barnav"><div class="bar2"><span :style="{ width: `${item.percent}%` }"></span></div> <span style="font-size: .18rem;">{{ item.percent }}%</span></div>
                </div>
                <div>
                  <div class="zaf">
                    <p style="color: rgba(255,255,255,0.9); font-weight: bold; margin-bottom: 2px;">人数</p>
                    <p style="margin-top: 2px; display: flex; align-items: center; justify-content: center;"><span>{{ item.count }}<i>人</i></span></p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="boxall" style="height: calc(42% - .15rem)">
            <div class="alltitle">设备使用情况 (日均)</div>
            <div class="boxnav" id="echarts3"></div>
          </div>
        </li>

        <!-- Column 2 -->
        <li style="width: 44%;">
          <div class="boxall" style="height: calc(20% - .15rem)">
            <ul class="row h100 clearfix">
              <li class="col-4">
                <div class="sqzs h100">
                  <p>总服务人次</p>
                  <h1>{{ dashboardSummary.totalVisits }}</h1>
                </div>
              </li>
              <li class="col-8">
                <ul class="row h100 clearfix">
                  <li class="col-4">
                    <div class="tit01">男/女比例</div>
                    <div class="piebox" id="pe01" style="height: calc(100% - .45rem);"></div>
                  </li>
                  <li class="col-4">
                    <div class="tit01">年龄段(55+)</div>
                    <div class="piebox" id="pe02" style="height: calc(100% - .45rem);"></div>
                  </li>
                  <li class="col-4">
                    <div class="tit01">企业体检</div>
                    <div class="piebox" id="pe03" style="height: calc(100% - .45rem);"></div>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div class="boxall" style="height: calc(38% - .15rem)">
            <div class="alltitle">睡眠改善效果评估</div>
            <div class="boxnav h100" id="echarts1"></div>
          </div>
          <div class="boxall" style="height: calc(42% - .15rem)">
            <div class="alltitle">每日评价/治疗趋势</div>
            <div class="boxnav" id="echarts2"></div>
          </div>
        </li>

        <!-- Column 3 -->
        <li style="width: 28%;">
          <div class="boxall" style="height: calc(33% - .15rem)">
            <div class="alltitle" style="color: #fff; font-size: .18rem;">四色人群风险评估</div>
            <div class="boxnav" id="risk-assessment-chart"></div>
          </div>
          <div class="boxall" style="height: calc(34% - .15rem)">
            <div class="alltitle" style="color: #fff; font-size: .18rem;">慢病风险预警(高血压/血糖/血脂)</div>
            <div class="boxnav" id="three-donuts-chart"></div>
          </div>
          <div class="boxall" style="height: calc(33% - .15rem)">
            <div class="alltitle" style="color: #fff; font-size: .18rem;">机构来源画像</div>
            <div class="boxnav" id="lastecharts"></div>
          </div>
        </li>
      </ul>
    </div>
    </div>
  </view>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import * as echarts from 'echarts';
import { listPatients } from '@/utils/patientApi';

const currentTime = ref('');
let timer = null;
const isFullScreen = ref(false);
const isEmbedMode = ref(false);
const scaleStyle = ref({
  transform: 'scale(1)',
  width: '1920px',
  height: '1080px'
});

const createSourceEntry = (name, color, value = 0) => ({
  name,
  value,
  itemStyle: { color }
});

const createDefaultSummary = () => ({
  totalPatients: 0,
  todayNew: 0,
  totalVisits: 0,
  maleRatio: 0,
  femaleRatio: 0,
  seniorRatio: 0,
  topReportLabel: '暂无资料',
  topReportPercent: 0,
  issueDistribution: [
    { label: '睡眠问题', percent: 0, count: 0, icon: '/static/images/icon4.png' },
    { label: '压力异常', percent: 0, count: 0, icon: '/static/images/icon5.png' },
    { label: '体脂偏高', percent: 0, count: 0, icon: '/static/images/icon6.png' }
  ],
  sourceData: [
    createSourceEntry('InBody', '#395ee6', 0),
    createSourceEntry('睡眠', '#03b48e', 0),
    createSourceEntry('压力', '#f78c44', 0)
  ],
  radarIndicators: [
    { text: 'InBody', max: 100 },
    { text: '睡眠', max: 100 },
    { text: '压力', max: 100 },
    { text: '综合档案', max: 100 },
    { text: '多报告', max: 100 }
  ],
  radarValues: [0, 0, 0, 0, 0],
  riskData: [
    { value: 0, name: '极高风险', pct: '0%', itemStyle: { color: '#ed405d' } },
    { value: 0, name: '高风险', pct: '0%', itemStyle: { color: '#f78c44' } },
    { value: 0, name: '中风险', pct: '0%', itemStyle: { color: '#fef000' } },
    { value: 0, name: '低风险', pct: '0%', itemStyle: { color: '#49bcf7' } }
  ],
  deviceCategories: ['InBody', '睡眠', '压力', '综合档案', '多报告', '总档案'],
  deviceUsage: [0, 0, 0, 0, 0, 0],
  indicatorCategories: ['BMI偏高', '体脂偏高', '睡眠偏低', '压力偏高'],
  normalCounts: [0, 0, 0, 0],
  warningCounts: [0, 0, 0, 0],
  trendLabels: [],
  archiveTrend: [],
  reportTrend: [],
  chronicRisk: {
    bmi: [0, 0, 0],
    fat: [0, 0, 0],
    stress: [0, 0, 0]
  }
});

const dashboardSummary = ref(createDefaultSummary());

let myChartPe01 = null;
let myChartPe02 = null;
let myChartPe03 = null;
let myChartEcharts1 = null;
let myChartEcharts2 = null;
let myChartEcharts3 = null;
let myChartEcharts4 = null;
let myChartRisk = null;
let myChartThreeDonuts = null;

const fullscreenChangeHandler = () => {
  if (typeof document !== 'undefined') {
    isFullScreen.value = !!document.fullscreenElement;
  }
};

const syncPageMode = () => {
  // #ifdef H5
  const hash = window.location.hash || '';
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const params = new URLSearchParams(queryString);
  isEmbedMode.value = params.get('embed') === '1';
  // #endif

  // #ifndef H5
  isEmbedMode.value = false;
  // #endif
};

const goToUpload = () => {
  uni.navigateTo({ url: '/pages/upload/index' });
};

const toggleFullScreen = () => {
  if (typeof document === 'undefined') return;

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
    isFullScreen.value = true;
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
    isFullScreen.value = false;
  }
};

const updateTime = () => {
  const dt = new Date();
  const y = dt.getFullYear();
  const mt = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  const h = String(dt.getHours()).padStart(2, '0');
  const m = String(dt.getMinutes()).padStart(2, '0');
  const s = String(dt.getSeconds()).padStart(2, '0');
  currentTime.value = `${y}年${mt}月${day}日 ${h}时${m}分${s}秒`;
};

const resizeCharts = () => {
  [
    myChartPe01,
    myChartPe02,
    myChartPe03,
    myChartEcharts1,
    myChartEcharts2,
    myChartEcharts3,
    myChartEcharts4,
    myChartRisk,
    myChartThreeDonuts
  ].forEach(chart => chart && chart.resize());
};

const handleResize = () => {
  const whei = window.innerWidth;
  if (whei < 1024) {
    document.documentElement.style.fontSize = (whei / 7.5) + 'px';
    scaleStyle.value = {
      transform: 'none',
      width: '100%',
      height: 'auto'
    };
  } else {
    const baseWidth = 1920;
    const baseHeight = 1080;
    const ratioX = window.innerWidth / baseWidth;
    const ratioY = window.innerHeight / baseHeight;
    const ratio = Math.min(ratioX, ratioY);

    scaleStyle.value = {
      width: `${baseWidth}px`,
      height: `${baseHeight}px`,
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) scale(${ratio})`,
      transformOrigin: 'center center'
    };

    document.documentElement.style.fontSize = baseWidth / 20 + 'px';
  }

  nextTick(() => resizeCharts());
};

const safeNumber = (value) => {
  const num = parseFloat(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(num) ? num : null;
};

const safePercent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const getMetricValue = (reportData, labels, groups = ['inbody', 'obesityAnalysis', 'stress', 'sleepMetricsTable', 'stressTable']) => {
  const names = Array.isArray(labels) ? labels : [labels];
  for (const group of groups) {
    const rows = Array.isArray(reportData?.[group]) ? reportData[group] : [];
    const matched = rows.find(item =>
      names.some(name => String(item.label || item.metric || item.item || '').includes(name))
    );
    const num = safeNumber(matched?.value);
    if (num !== null) return num;
  }
  return null;
};

const getRecordSourceTypes = (record) => {
  const sourceTypes = Array.isArray(record?.reportData?.sourceTypes) ? record.reportData.sourceTypes.filter(Boolean) : [];
  if (sourceTypes.length) return [...new Set(sourceTypes)];
  if (record?.reportData?.type && record.reportData.type !== 'combined') return [record.reportData.type];
  return [];
};

const getLastSevenDates = () => {
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const label = `${date.getMonth() + 1}/${date.getDate()}`;
    dates.push({ iso, label });
  }
  return dates;
};

const getBmiRiskLevel = bmi => {
  if (bmi === null) return 0;
  if (bmi >= 28) return 3;
  if (bmi >= 24) return 2;
  return 0;
};

const getFatRiskLevel = fatRate => {
  if (fatRate === null) return 0;
  if (fatRate >= 30) return 3;
  if (fatRate >= 25) return 2;
  return 0;
};

const getSleepRiskLevel = sleepScore => {
  if (sleepScore === null) return 0;
  if (sleepScore < 50) return 3;
  if (sleepScore < 60) return 2;
  if (sleepScore < 70) return 1;
  return 0;
};

const getStressRiskLevel = stressScore => {
  if (stressScore === null) return 0;
  if (stressScore < 50) return 3;
  if (stressScore < 60) return 2;
  if (stressScore < 70) return 1;
  return 0;
};

const buildRiskBuckets = (records) => {
  const total = records.length;
  const buckets = {
    highPlus: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  records.forEach(record => {
    const data = record.reportData || {};
    const bmi = getMetricValue(data, ['身体质量指数(BMI)', '体质量指数(BMI)', 'BMI']);
    const fatRate = getMetricValue(data, ['体脂百分比', '体脂率']);
    const sleepScore = getMetricValue(data, '睡眠指数');
    const stressScore = getMetricValue(data, '抗压力指数');

    const level = Math.max(
      getBmiRiskLevel(bmi),
      getFatRiskLevel(fatRate),
      getSleepRiskLevel(sleepScore),
      getStressRiskLevel(stressScore)
    );

    if (level >= 3) buckets.highPlus += 1;
    else if (level === 2) buckets.high += 1;
    else if (level === 1) buckets.medium += 1;
    else buckets.low += 1;
  });

  return [
    { value: buckets.highPlus, name: '极高风险', pct: `${safePercent(buckets.highPlus, total)}%`, itemStyle: { color: '#ed405d' } },
    { value: buckets.high, name: '高风险', pct: `${safePercent(buckets.high, total)}%`, itemStyle: { color: '#f78c44' } },
    { value: buckets.medium, name: '中风险', pct: `${safePercent(buckets.medium, total)}%`, itemStyle: { color: '#fef000' } },
    { value: buckets.low, name: '低风险', pct: `${safePercent(buckets.low, total)}%`, itemStyle: { color: '#49bcf7' } }
  ];
};

const loadDashboardData = async () => {
  const apiPatients = await listPatients();
  const records = apiPatients.map(record => ({
    ...record,
    reportData: record.latestReport?.reportData || record.reportData || {}
  }));
  const totalPatients = records.length;
  const today = new Date().toISOString().split('T')[0];
  const todayNew = records.filter(record => record.date === today).length;
  const maleCount = records.filter(record => String(record.gender || '').includes('男')).length;
  const femaleCount = records.filter(record => String(record.gender || '').includes('女')).length;
  const seniorCount = records.filter(record => (safeNumber(record.age) ?? 0) >= 55).length;

  const sourceTypeCounter = {
    inbody: 0,
    sleep: 0,
    stress: 0,
    combined: 0,
    multi: 0
  };

  let totalVisits = 0;
  let sleepIssueCount = 0;
  let stressIssueCount = 0;
  let fatIssueCount = 0;
  let bmiNormal = 0;
  let bmiWarning = 0;
  let fatNormal = 0;
  let fatWarning = 0;
  let sleepNormal = 0;
  let sleepWarning = 0;
  let stressNormal = 0;
  let stressWarning = 0;

  const chronicRisk = {
    bmi: [0, 0, 0],
    fat: [0, 0, 0],
    stress: [0, 0, 0]
  };

  const lastSevenDays = getLastSevenDates();
  const archiveTrend = lastSevenDays.map(() => 0);
  const reportTrend = lastSevenDays.map(() => 0);

  records.forEach(record => {
    const data = record.reportData || {};
    const sourceTypes = getRecordSourceTypes(record);
    totalVisits += 1;

    if (sourceTypes.includes('inbody')) sourceTypeCounter.inbody += 1;
    if (sourceTypes.includes('sleep')) sourceTypeCounter.sleep += 1;
    if (sourceTypes.includes('stress')) sourceTypeCounter.stress += 1;
    if (data.type === 'combined' || sourceTypes.length > 1) sourceTypeCounter.combined += 1;
    if (sourceTypes.length > 1) sourceTypeCounter.multi += 1;

    const dayIndex = lastSevenDays.findIndex(item => item.iso === record.date);
    if (dayIndex !== -1) {
      archiveTrend[dayIndex] += 1;
    }

    const bmi = getMetricValue(data, ['身体质量指数(BMI)', '体质量指数(BMI)', 'BMI']);
    const fatRate = getMetricValue(data, ['体脂百分比', '体脂率']);
    const sleepScore = getMetricValue(data, '睡眠指数');
    const stressScore = getMetricValue(data, '抗压力指数');

    if (sleepScore !== null && sleepScore < 60) {
      sleepIssueCount += 1;
    }
    if (stressScore !== null && stressScore < 60) {
      stressIssueCount += 1;
    }
    if ((bmi !== null && bmi >= 24) || (fatRate !== null && fatRate >= 25)) {
      fatIssueCount += 1;
    }

    if (bmi !== null) {
      if (bmi >= 28) chronicRisk.bmi[0] += 1;
      else if (bmi >= 24) chronicRisk.bmi[1] += 1;
      else chronicRisk.bmi[2] += 1;
      if (bmi >= 24) bmiWarning += 1;
      else bmiNormal += 1;
    }

    if (fatRate !== null) {
      if (fatRate >= 30) chronicRisk.fat[0] += 1;
      else if (fatRate >= 25) chronicRisk.fat[1] += 1;
      else chronicRisk.fat[2] += 1;
      if (fatRate >= 25) fatWarning += 1;
      else fatNormal += 1;
    }

    if (sleepScore !== null) {
      if (sleepScore < 60) sleepWarning += 1;
      else sleepNormal += 1;
    }

    if (stressScore !== null) {
      if (stressScore < 50) chronicRisk.stress[0] += 1;
      else if (stressScore < 70) chronicRisk.stress[1] += 1;
      else chronicRisk.stress[2] += 1;
      if (stressScore < 60) stressWarning += 1;
      else stressNormal += 1;
    }
  });

  const sourceData = [
    createSourceEntry('InBody', '#395ee6', safePercent(sourceTypeCounter.inbody, totalPatients)),
    createSourceEntry('睡眠', '#03b48e', safePercent(sourceTypeCounter.sleep, totalPatients)),
    createSourceEntry('压力', '#f78c44', safePercent(sourceTypeCounter.stress, totalPatients))
  ];
  const topReport = sourceData.reduce((prev, current) => (current.value > prev.value ? current : prev), sourceData[0]);

  dashboardSummary.value = {
    totalPatients,
    todayNew,
    totalVisits,
    maleRatio: safePercent(maleCount, totalPatients),
    femaleRatio: safePercent(femaleCount, totalPatients),
    seniorRatio: safePercent(seniorCount, totalPatients),
    topReportLabel: topReport?.name || '暂无资料',
    topReportPercent: topReport?.value || 0,
    issueDistribution: [
      { label: '睡眠问题', percent: safePercent(sleepIssueCount, totalPatients), count: sleepIssueCount, icon: '/static/images/icon4.png' },
      { label: '压力异常', percent: safePercent(stressIssueCount, totalPatients), count: stressIssueCount, icon: '/static/images/icon5.png' },
      { label: '体脂偏高', percent: safePercent(fatIssueCount, totalPatients), count: fatIssueCount, icon: '/static/images/icon6.png' }
    ],
    sourceData,
    radarIndicators: [
      { text: 'InBody', max: 100 },
      { text: '睡眠', max: 100 },
      { text: '压力', max: 100 },
      { text: '综合档案', max: 100 },
      { text: '多报告', max: 100 }
    ],
    radarValues: [
      safePercent(sourceTypeCounter.inbody, totalPatients),
      safePercent(sourceTypeCounter.sleep, totalPatients),
      safePercent(sourceTypeCounter.stress, totalPatients),
      safePercent(sourceTypeCounter.combined, totalPatients),
      safePercent(sourceTypeCounter.multi, totalPatients)
    ],
    riskData: buildRiskBuckets(records),
    deviceCategories: ['InBody', '睡眠', '压力', '综合档案', '多报告', '总档案'],
    deviceUsage: [
      sourceTypeCounter.inbody,
      sourceTypeCounter.sleep,
      sourceTypeCounter.stress,
      sourceTypeCounter.combined,
      sourceTypeCounter.multi,
      totalPatients
    ],
    indicatorCategories: ['BMI偏高', '体脂偏高', '睡眠偏低', '压力偏高'],
    normalCounts: [
      bmiNormal,
      fatNormal,
      sleepNormal,
      stressNormal
    ],
    warningCounts: [bmiWarning, fatWarning, sleepWarning, stressWarning],
    trendLabels: lastSevenDays.map(item => item.label),
    archiveTrend,
    reportTrend: [],
    chronicRisk
  };
};

const initChart = (id, chartInstance) => {
  const dom = document.getElementById(id);
  if (!dom) return null;
  if (chartInstance) return chartInstance;
  return echarts.init(dom);
};

const initEcharts1 = () => {
  myChartEcharts1 = initChart('echarts1', myChartEcharts1);
  if (!myChartEcharts1) return;

  myChartEcharts1.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, confine: true, appendToBody: true },
    legend: {
      data: ['正常人数', '风险人数'],
      right: 'center',
      top: 0,
      textStyle: { color: 'rgba(255,255,255,.9)', fontWeight: 'bold', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 8,
      icon: 'circle'
    },
    grid: { left: '0', top: '30', right: '15', bottom: '35', containLabel: true },
    xAxis: {
      type: 'category',
      data: dashboardSummary.value.indicatorCategories,
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,.1)' } },
      axisLabel: { color: 'rgba(255,255,255,.9)', fontSize: 10, fontWeight: 'bold', interval: 0 }
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,.9)', fontSize: 10, fontWeight: 'bold' }
    },
    series: [
      {
        name: '正常人数',
        type: 'bar',
        barWidth: '15%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#14b6ff' }, { offset: 1, color: '#9cefff' }]),
          borderRadius: 11
        },
        data: dashboardSummary.value.normalCounts
      },
      {
        name: '风险人数',
        type: 'bar',
        barWidth: '15%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#f78c44' }, { offset: 1, color: '#fef000' }]),
          borderRadius: 11
        },
        data: dashboardSummary.value.warningCounts
      }
    ]
  }, true);
};

const initEcharts2 = () => {
  myChartEcharts2 = initChart('echarts2', myChartEcharts2);
  if (!myChartEcharts2) return;

  myChartEcharts2.setOption({
    tooltip: { trigger: 'axis', axisPointer: { lineStyle: { color: '#dddc6b' } }, confine: true, appendToBody: true },
    grid: { left: '0', top: '30', right: '20', bottom: '25', containLabel: true },
    legend: {
      data: ['建档人数'],
      right: 'center',
      top: 0,
      textStyle: { color: 'rgba(255,255,255,.9)', fontWeight: 'bold', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 8,
      icon: 'circle'
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      axisLabel: { color: 'rgba(255,255,255,.9)', fontSize: 10, fontWeight: 'bold' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } },
      data: dashboardSummary.value.trendLabels
    }],
    yAxis: [{
      type: 'value',
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } },
      axisLabel: { color: 'rgba(255,255,255,.9)', fontSize: 10, fontWeight: 'bold' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } }
    }],
    series: [
      {
        name: '建档人数',
        type: 'line',
        smooth: true,
        symbolSize: 5,
        showSymbol: true,
        lineStyle: { color: 'rgba(247, 140, 68, 1)', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(247, 140, 68, .8)' }, { offset: 0.8, color: 'rgba(247, 140, 68, 0.1)' }])
        },
        data: dashboardSummary.value.archiveTrend
      }
    ]
  }, true);
};

const initEcharts3 = () => {
  myChartEcharts3 = initChart('echarts3', myChartEcharts3);
  if (!myChartEcharts3) return;

  myChartEcharts3.setOption({
    tooltip: { trigger: 'axis', axisPointer: { lineStyle: { color: '#dddc6b' } }, confine: true, appendToBody: true },
    grid: { left: '0', top: '30', right: '20', bottom: '0', containLabel: true },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      axisLabel: { color: 'rgba(255,255,255,.9)', fontSize: 10, fontWeight: 'bold', interval: 0 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } },
      data: dashboardSummary.value.deviceCategories
    }],
    yAxis: [{
      type: 'value',
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } },
      axisLabel: { color: 'rgba(255,255,255,.9)', fontSize: 10, fontWeight: 'bold' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } }
    }],
    series: [{
      name: '累计档案',
      type: 'line',
      smooth: true,
      symbolSize: 10,
      showSymbol: true,
      lineStyle: { color: 'rgba(228, 228, 126, 1)', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(228, 228, 126, .8)' }, { offset: 0.8, color: 'rgba(228, 228, 126, 0.1)' }])
      },
      itemStyle: { color: '#dddc6b', borderColor: 'rgba(221, 220, 107, .2)', borderWidth: 8 },
      data: dashboardSummary.value.deviceUsage
    }]
  }, true);
};

const initLastecharts = () => {
  myChartEcharts4 = initChart('lastecharts', myChartEcharts4);
  if (!myChartEcharts4) return;

  myChartEcharts4.setOption({
    tooltip: { trigger: 'axis', confine: true, appendToBody: true },
    radar: [{
      indicator: dashboardSummary.value.radarIndicators,
      center: ['50%', '50%'],
      radius: '60%',
      startAngle: 90,
      splitNumber: 4,
      shape: 'circle',
      name: { formatter: '{value}', textStyle: { fontSize: 12, color: 'rgba(255,255,255,.9)', fontWeight: 'bold' } },
      splitArea: { areaStyle: { color: 'rgba(255,255,255,.05)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,.05)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.05)' } }
    }],
    series: [{
      name: '资料画像',
      type: 'radar',
      tooltip: { trigger: 'item' },
      data: [{
        name: '占比',
        value: dashboardSummary.value.radarValues,
        lineStyle: { color: '#03b48e', width: 2 },
        areaStyle: { color: '#03b48e', opacity: 0.4 },
        symbolSize: 0
      }]
    }]
  }, true);
};

const initRiskAssessmentChart = () => {
  myChartRisk = initChart('risk-assessment-chart', myChartRisk);
  if (!myChartRisk) return;

  const pyramidOrder = ['极高风险', '高风险', '中风险', '低风险'];
  const pyramidShapeValueMap = {
    极高风险: 25,
    高风险: 50,
    中风险: 75,
    低风险: 100
  };
  const pyramidData = pyramidOrder
    .map(name => dashboardSummary.value.riskData.find(item => item.name === name))
    .filter(Boolean)
    .map(item => ({
      ...item,
      value: pyramidShapeValueMap[item.name],
      actualValue: item.value
    }));

  myChartRisk.setOption({
    tooltip: {
      trigger: 'item',
      confine: true,
      appendToBody: true,
      formatter: params => `${params.name} : ${params.data.pct} (${params.data.actualValue || 0}人)`
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#fff', fontSize: 10 },
      data: ['极高风险', '高风险', '中风险', '低风险']
    },
    series: [{
      name: '风险评估',
      type: 'funnel',
      left: '8%',
      top: '18%',
      bottom: '18%',
      width: '46%',
      minSize: '18%',
      maxSize: '88%',
      sort: 'ascending',
      gap: 5,
      label: {
        show: true,
        position: 'inside',
        formatter: params => `${params.name}\n${params.data.pct}`,
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textShadowBlur: 2,
        textShadowColor: 'rgba(0,0,0,0.5)'
      },
      labelLine: {
        show: false,
        length: 15,
        lineStyle: {
          width: 1,
          type: 'solid',
          color: 'rgba(255,255,255,0.5)'
        }
      },
      itemStyle: {
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        shadowBlur: 5,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      emphasis: {
        label: {
          fontSize: 12
        }
      },
      data: pyramidData
    }]
  }, true);
};

const initThreeDonutsChart = () => {
  myChartThreeDonuts = initChart('three-donuts-chart', myChartThreeDonuts);
  if (!myChartThreeDonuts) return;

  myChartThreeDonuts.setOption({
    tooltip: { trigger: 'item', confine: true, appendToBody: true },
    legend: {
      data: ['高风险', '中风险', '低风险'],
      left: 'center',
      bottom: '0',
      textStyle: { color: 'rgba(255,255,255,.9)', fontSize: 10, fontWeight: 'bold' },
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 5,
      icon: 'circle'
    },
    title: [
      { text: 'BMI风险', left: '16.67%', top: '75%', textAlign: 'center', textStyle: { color: '#fff', fontSize: 12, fontWeight: 'bold' } },
      { text: '体脂风险', left: '50%', top: '75%', textAlign: 'center', textStyle: { color: '#fff', fontSize: 12, fontWeight: 'bold' } },
      { text: '压力风险', left: '83.33%', top: '75%', textAlign: 'center', textStyle: { color: '#fff', fontSize: 12, fontWeight: 'bold' } }
    ],
    series: [
      {
        type: 'pie',
        radius: ['40%', '55%'],
        center: ['16.67%', '40%'],
        label: { show: false },
        data: [
          { value: dashboardSummary.value.chronicRisk.bmi[0], name: '高风险', itemStyle: { color: '#ed405d' } },
          { value: dashboardSummary.value.chronicRisk.bmi[1], name: '中风险', itemStyle: { color: '#f78c44' } },
          { value: dashboardSummary.value.chronicRisk.bmi[2], name: '低风险', itemStyle: { color: '#49bcf7' } }
        ]
      },
      {
        type: 'pie',
        radius: ['40%', '55%'],
        center: ['50%', '40%'],
        label: { show: false },
        data: [
          { value: dashboardSummary.value.chronicRisk.fat[0], name: '高风险', itemStyle: { color: '#ed405d' } },
          { value: dashboardSummary.value.chronicRisk.fat[1], name: '中风险', itemStyle: { color: '#f78c44' } },
          { value: dashboardSummary.value.chronicRisk.fat[2], name: '低风险', itemStyle: { color: '#49bcf7' } }
        ]
      },
      {
        type: 'pie',
        radius: ['40%', '55%'],
        center: ['83.33%', '40%'],
        label: { show: false },
        data: [
          { value: dashboardSummary.value.chronicRisk.stress[0], name: '高风险', itemStyle: { color: '#ed405d' } },
          { value: dashboardSummary.value.chronicRisk.stress[1], name: '中风险', itemStyle: { color: '#f78c44' } },
          { value: dashboardSummary.value.chronicRisk.stress[2], name: '低风险', itemStyle: { color: '#49bcf7' } }
        ]
      }
    ]
  }, true);
};

const initPe01 = () => {
  myChartPe01 = initChart('pe01', myChartPe01);
  if (!myChartPe01) return;

  myChartPe01.setOption({
    title: { text: `${dashboardSummary.value.maleRatio}%`, x: 'center', y: 'center', textStyle: { fontWeight: 'bold', color: '#fff', fontSize: '16' } },
    series: [{
      type: 'pie',
      clockWise: true,
      radius: ['65%', '85%'],
      hoverAnimation: false,
      label: {
        show: true,
        position: 'outside',
        color: '#fff',
        fontSize: 12,
        formatter: '{b}',
        distanceToLabelLine: 0,
        padding: [0, -25]
      },
      labelLine: { show: false },
      data: [
        { value: dashboardSummary.value.maleRatio, name: '男', itemStyle: { color: '#fef000' } },
        { value: dashboardSummary.value.femaleRatio, name: '女', itemStyle: { color: '#49bcf7' } }
      ]
    }]
  }, true);
};

const initPe02 = () => {
  myChartPe02 = initChart('pe02', myChartPe02);
  if (!myChartPe02) return;

  myChartPe02.setOption({
    title: { text: `${dashboardSummary.value.seniorRatio}%`, x: 'center', y: 'center', textStyle: { fontWeight: 'bold', color: '#fff', fontSize: '16' } },
    series: [{
      type: 'pie',
      clockWise: true,
      radius: ['65%', '85%'],
      hoverAnimation: false,
      data: [
        { value: dashboardSummary.value.seniorRatio, itemStyle: { color: '#ea4d4d' }, label: { show: false }, labelLine: { show: false } },
        { value: Math.max(100 - dashboardSummary.value.seniorRatio, 0), itemStyle: { color: 'rgba(255,255,255,0.1)' }, label: { show: false }, labelLine: { show: false } }
      ]
    }]
  }, true);
};

const initPe03 = () => {
  myChartPe03 = initChart('pe03', myChartPe03);
  if (!myChartPe03) return;

  const topSource = dashboardSummary.value.sourceData.reduce(
    (prev, current) => (current.value > prev.value ? current : prev),
    dashboardSummary.value.sourceData[0]
  );

  myChartPe03.setOption({
    title: { text: `${topSource?.value || 0}%`, x: 'center', y: 'center', textStyle: { fontWeight: 'bold', color: '#fff', fontSize: '16' } },
    series: [{
      type: 'pie',
      clockWise: true,
      radius: ['65%', '85%'],
      hoverAnimation: false,
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: topSource?.value || 0, itemStyle: { color: topSource?.itemStyle?.color || '#395ee6' } },
        { value: Math.max(100 - (topSource?.value || 0), 0), itemStyle: { color: 'rgba(255,255,255,0.1)' } }
      ]
    }]
  }, true);
};

const renderDashboard = () => {
  nextTick(() => {
    initEcharts1();
    initEcharts2();
    initEcharts3();
    initLastecharts();
    initPe01();
    initPe02();
    initPe03();
    initRiskAssessmentChart();
    initThreeDonutsChart();
  });
};

onMounted(() => {
  syncPageMode();
  handleResize();
  window.addEventListener('resize', handleResize);
  document.addEventListener('fullscreenchange', fullscreenChangeHandler);

  updateTime();
  timer = setInterval(updateTime, 1000);

  loadDashboardData()
    .then(() => {
      renderDashboard();
    })
    .catch((error) => {
      console.error('加载看板数据失败:', error);
    });
});

onShow(() => {
  loadDashboardData()
    .then(() => {
      renderDashboard();
    })
    .catch((error) => {
      console.error('加载看板数据失败:', error);
    });
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
  [
    myChartPe01,
    myChartPe02,
    myChartPe03,
    myChartEcharts1,
    myChartEcharts2,
    myChartEcharts3,
    myChartEcharts4,
    myChartRisk,
    myChartThreeDonuts
  ].forEach(chart => chart && chart.dispose());
});
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

.dashboard-wrapper { position: relative; width: 100vw; height: 100vh; z-index: 1; overflow: hidden; background: #061121; }
.scale-container { transition: transform 0.2s ease-out; overflow: hidden; }

.fullscreen-btn {
  position: absolute;
  right: 0.5rem;
  top: 0.2rem;
  cursor: pointer;
  z-index: 1001;
  padding: 5px;
  background: rgba(20, 182, 255, 0.1);
  border: 1px solid rgba(20, 182, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.fullscreen-btn:hover {
  background: rgba(20, 182, 255, 0.3);
  border-color: rgba(20, 182, 255, 0.8);
  box-shadow: 0 0 15px rgba(20, 182, 255, 0.5);
}

.manage-enter-btn {
  position: absolute;
  right: 1.2rem;
  top: 0.22rem;
  cursor: pointer;
  z-index: 1001;
  padding: 0.05rem 0.15rem;
  background: rgba(20, 182, 255, 0.2);
  border: 1px solid rgba(20, 182, 255, 0.5);
  border-radius: 20px;
  color: #fff;
  font-size: 0.14rem;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(20, 182, 255, 0.8);
  transition: all 0.3s;
}
.manage-enter-btn:hover {
  background: rgba(20, 182, 255, 0.4);
  border-color: #fff;
  box-shadow: 0 0 20px rgba(20, 182, 255, 0.6);
  transform: scale(1.05);
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

/* 021 template CSS adapted */
li { list-style-type: none; }
i { margin: 0px; padding: 0px; text-indent: 0px; }
img { border: none; max-width: 100%; }
a { text-decoration: none; color: #399bff; }
a.active, a:focus { outline: none !important; text-decoration: none; }
ol, ul, p, h1, h2, h3, h4, h5, h6 { padding: 0; margin: 0; }
a:hover { color: #06c; text-decoration: none !important; }

.clearfix:after, .clearfix:before { display: table; content: " "; }
.clearfix:after { clear: both; }
.pulll_left { float: left; }
.pulll_right { float: right; }

.head { height: 1.05rem; background: url(/static/images/head_bg.png) no-repeat center center; background-size: 100% 100%; position: relative; z-index: 100; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 5px 20px rgba(20, 182, 255, 0.2); }
.head-meta { position: absolute; left: .18rem; top: .12rem; display: flex; align-items: center; z-index: 2; }
.head h1 { color: #fff; text-align: center; font-size: .38rem; line-height: .8rem; letter-spacing: 4px; font-weight: bold; }
.head h1 a { color: #fff; text-shadow: 0 0 15px rgba(20, 182, 255, 0.8), 0 0 30px rgba(20, 182, 255, 0.4), 0 4px 10px rgba(0,0,0,0.8); }
.head h1 img { width: 1.5rem; display: inline-block; vertical-align: middle; }
.time { line-height: .4rem; color: rgba(255,255,255,.9); font-size: .16rem; font-weight: 500; text-shadow: 0 1px 4px rgba(0,0,0,0.5); padding: 0 .14rem; border-radius: .2rem; border: 1px solid rgba(73, 188, 247, 0.35); background: rgba(6, 32, 72, 0.38); box-shadow: inset 0 0 12px rgba(20, 182, 255, 0.08); }

.mainbox { padding: 0 .2rem 0rem .2rem; height: calc(100% - 1.05rem); color: #fff; width: 100%; overflow: hidden; }
@media screen and (max-width: 1024px) {
  .mainbox { height: auto; overflow: visible; }
}
.mainbox>ul { margin-left: -.1rem; margin-right: -.1rem; height: 100%; width: 100%; display: flex; }
.mainbox>ul>li { padding: 0 .1rem; height: 100%; width: 35%; }
.mainbox>ul>li:nth-child(2) { width: 65%; }

.boxall { padding: 0 .2rem .2rem .2rem; background: rgba(6,48,109,.2); border: 1px solid rgba(20, 182, 255, 0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.1), inset 0 0 20px rgba(20, 182, 255, 0.1); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); position: relative; margin-bottom: .15rem; z-index: 10; border-radius: 12px; transition: all 0.3s ease; }
.boxall:hover { box-shadow: 0 4px 20px rgba(20, 182, 255, 0.4), inset 0 0 30px rgba(20, 182, 255, 0.2); border-color: rgba(20, 182, 255, 0.6); }
.alltitle { font-size: .18rem; color: #fff; line-height: .5rem; position: relative; padding-left: .15rem; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5); text-align: left; }
.alltitle:before { position: absolute; height: .2rem; width: 4px; background: #49bcf7; border-radius: 5px; content: ""; left: 0; top: 50%; margin-top: -.1rem; }
.boxnav { height: calc(100% - .5rem); }
.row>li { float: left; height: 100%; }
.col-6 { width: 50%; }
.col-4 { width: 33.33333%; }
.col-8 { width: 66.66667%; }
.h100 { height: 100%; }
.tit01 { text-align: center; color: white; font-size: .16rem; padding: .2rem 0 .05rem 0; font-weight: 500; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
.piebox { height: calc(100% - .4rem); position: relative; margin-top: -10px; }

.row1 .bar1 { height: 100%; background: url(/static/images/bg01.png) no-repeat; background-size: 100% 100%; position: relative; }
.bar1 img { width: .3rem; margin-right: .1rem; filter: brightness(1) invert(0); }
.bar1 { display: flex; justify-content: center; align-items: center; }
.bar1 span { color: rgba(255,255,255,0.9); font-size: .16rem; display: block; font-weight: 500; text-shadow: 0 1px 3px rgba(0,0,0,0.5); margin-bottom: 2px; }
.bar1 h3 { color: #fef000; font-size: .28rem; font-weight: bold; text-shadow: 0 2px 5px rgba(0,0,0,0.6); margin-top: 2px; margin-bottom: 0; line-height: 1; }
.row1 li { padding: .2rem .1rem 0 .1rem; }
.row1 { margin-left: -.1rem; margin-right: -.1rem; }
.row1 .bar2 { background: url(/static/images/bg02.png) no-repeat; background-size: 100% 100%; }
.row1 .bar2 h3 { text-align: right; }

.paim li>span { width: .35rem; height: .35rem; text-align: center; line-height: .35rem; background: #878787; border-radius: .05rem; margin-right: .15rem; font-size: .18rem; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.paim li:nth-child(1)>span { background: #ed405d; color: #fff; }
.paim li:nth-child(2)>span { background: #f78c44; }
.paim li:nth-child(3)>span { background: #49bcf7; }
.paim li { display: flex; align-items: center; height: 20%; }

.pmbar { position: relative; display: flex; align-items: center; }
.pmbar span { background: linear-gradient(to right, #14b6ff, #9cefff); display: inline-block; vertical-align: middle; height: .15rem; border-radius: .5rem; box-shadow: 0 0 8px rgba(20, 182, 255, 0.5); }
.pmbar i { line-height: .2rem; font-style: normal; padding-left: .1rem; color: #49bcf7; font-weight: bold; font-size: .16rem; }
.pmnav { width: calc(100% - .5rem); }
.pmnav p { color: #fff; font-size: .16rem; padding-bottom: .05rem; white-space: nowrap; overflow: visible; font-weight: 500; text-shadow: 0 1px 3px rgba(0,0,0,0.5); text-align: left; line-height: 1.2; width: 100%; display: block; }

.sqzs { margin-right: .2rem; }
.sqzs p { padding: .1rem 0; font-size: .22rem; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5); text-align: left; }
.sqzs h1 { height: calc(100% - .55rem); border-bottom: 1px solid rgba(255,255,255,.2); border-top: 1px solid rgba(255,255,255,.2); display: flex; align-items: center; color: #fef000; font-family: Gotham, "Helvetica Neue", Helvetica, Arial, "sans-serif"; font-weight: bold; letter-spacing: 2px; font-size: .55rem; justify-content: center; padding-bottom: .05rem; text-shadow: 0 4px 10px rgba(0,0,0,0.6); }

.sec { display: flex; flex-direction: column; justify-content: center; height: calc(100% - .5rem); gap: .15rem; }
.sec li { display: flex; align-items: center; justify-content: space-between; }
.sec li>div:nth-child(1) { width: 65%; }
.sec li>div:nth-child(2) { width: 35%; }
.sec .bar2 { width: 60%; margin: .1rem 0; display: inline-block; vertical-align: middle; border: 1px solid #00deff; height: .25rem; padding: .03rem; border-radius: 1rem; background: rgba(0,0,0,0.1); }
.sec .bar2 span { display: block; height: 100%; background: linear-gradient(to right, #14b6ff, #9cefff); border-radius: 1rem; box-shadow: 0 0 5px rgba(20, 182, 255, 0.5); }

.sec p { display: flex; align-items: center; font-size: .16rem; font-weight: 500; text-shadow: 0 1px 3px rgba(0,0,0,0.5); justify-content: flex-start; white-space: nowrap; overflow: visible; width: 100%; line-height: 1.2; margin-bottom: 2px; }
.sec p img { width: .35rem; margin-right: .1rem; vertical-align: middle; }
.barnav { display: flex; align-items: center; justify-content: flex-start; }
.barnav span { text-align: center; color: #f7e80d; font-size: .16rem; padding-left: .05rem; line-height: .25rem; font-weight: bold; text-shadow: 0 1px 3px rgba(0,0,0,0.5); width: 30px; }

.zaf { text-align: center; }
.zaf p { justify-content: center; font-size: .14rem; color: rgba(255,255,255,0.8); margin-bottom: 4px; }
.zaf span { color: #f7e80d; font-family: Impact; font-size: .22rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
.zaf span i { font-style: normal; font-size: .16rem; font-weight: bold; }

@media screen and (max-width: 1024px) {
  .dashboard-wrapper { min-height: 100vh; overflow: auto; }
  .mainbox { height: auto; overflow: visible; padding-bottom: .5rem; }
  .mainbox>ul { display: flex; flex-direction: column; margin: 0; }
  .mainbox>ul>li { width: 100% !important; padding: 0; }
  
  /* 卡片高度由固定改为自适应，图表区域分配固定高度 */
  .boxall { height: auto !important; min-height: auto !important; margin-bottom: .3rem !important; padding-bottom: .2rem !important; }
  .boxnav { height: 5rem !important; }
  
  .head { height: auto; padding: .2rem 0; border: none; box-shadow: none; animation: none; }
  .head-meta { position: relative; left: auto; top: auto; justify-content: center; margin-bottom: .08rem; }
  .head h1 { font-size: .45rem; line-height: 1.2; letter-spacing: 2px; }
  .time { text-align: center; line-height: 1.5; font-size: .25rem; }
  
  .row>li { width: 100% !important; float: none; height: auto; }
  .row1 { display: flex; flex-direction: column; gap: .2rem; }
  .row1 li { padding: 0 !important; }
  .col-6 { width: 100% !important; }
  .col-4, .col-8 { width: 100% !important; }
  
  .sqzs { margin-right: 0; text-align: center; margin-bottom: .3rem; }
  .sqzs h1 { border: none; padding: .2rem 0; font-size: .8rem; }
  .fullscreen-btn { display: none; }
  
  .piebox { height: 3rem !important; margin-top: .1rem; }
  .sec { height: auto; gap: .2rem; display: flex; flex-direction: column; }
  .sec li { height: auto; padding: .1rem 0; }
  
  /* 复杂卡片的弹性盒子竖排重置 */
  .boxall:has(.sqzs) > .row { flex-direction: column; }
  .boxall:has(.sqzs) .col-8 > .row { flex-direction: column; gap: .3rem; }
  .boxall:has(.sqzs) .col-8 > .row > .col-4 { margin-bottom: 0; }
}
</style>
