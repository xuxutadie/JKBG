<template>
  <view class="mobile-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-back">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="title">睡眠情况</text>
      <view class="right-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-history">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </view>
    </view>

    <view class="content">
      <!-- Tabs -->
      <view class="tabs">
        <view class="tab active">日</view>
        <view class="tab">周</view>
        <view class="tab">月</view>
      </view>

      <!-- Date Selector -->
      <view class="date-selector">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-arrow"><polyline points="15 18 9 12 15 6"></polyline></svg>
        <text class="date-text">2026年5月1日</text>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-arrow right"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </view>

      <!-- Main Card -->
      <view class="sleep-card">
        <view class="sleep-header">
          <view class="sleep-info">
            <text class="sleep-label">睡眠时长</text>
            <view class="sleep-time">
              <text class="num">{{ sleepHours }}</text><text class="unit">小时</text>
              <text class="num">{{ sleepMinutes }}</text><text class="unit">分</text>
            </view>
            <text class="sleep-quality">睡眠质量 {{ sleepQualityText }}</text>
          </view>
          <view class="moon-icon-wrapper">
            <view class="moon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="none" class="icon-moon">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#FCD34D" />
              </svg>
            </view>
          </view>
        </view>

        <!-- Chart Placeholder -->
        <view class="chart-section">
          <view class="time-labels">
            <text>22:30 入睡</text>
            <text>07:02 醒来</text>
          </view>
          <!-- Faux Chart Bars -->
          <view class="faux-chart">
            <view class="bar light" style="height: 40%; left: 10%;"></view>
            <view class="bar deep" style="height: 60%; left: 20%;"></view>
            <view class="bar rem" style="height: 30%; left: 30%;"></view>
            <view class="bar light" style="height: 50%; left: 40%;"></view>
            <view class="bar deep" style="height: 70%; left: 50%;"></view>
            <view class="bar awake" style="height: 20%; left: 60%;"></view>
            <view class="bar light" style="height: 45%; left: 70%;"></view>
            <view class="bar rem" style="height: 35%; left: 80%;"></view>
            <view class="bar light" style="height: 25%; left: 90%;"></view>
          </view>
          <!-- Legend -->
          <view class="chart-legend">
            <view class="legend-item"><view class="dot deep"></view>深睡</view>
            <view class="legend-item"><view class="dot light"></view>浅睡</view>
            <view class="legend-item"><view class="dot rem"></view>快速眼动</view>
            <view class="legend-item"><view class="dot awake"></view>清醒</view>
          </view>
        </view>

        <!-- Metrics -->
        <view class="metrics-grid">
          <view class="metric-item">
            <text class="metric-label">深睡时长</text>
            <view class="metric-val"><text class="num">{{ deepHours }}</text>小时<text class="num">{{ deepMinutes }}</text>分</view>
          </view>
          <view class="metric-item">
            <text class="metric-label">浅睡时长</text>
            <view class="metric-val"><text class="num">{{ lightHours }}</text>小时<text class="num">{{ lightMinutes }}</text>分</view>
          </view>
          <view class="metric-item">
            <text class="metric-label">清醒次数</text>
            <view class="metric-val"><text class="num">{{ awakeCount }}</text>次</view>
          </view>
        </view>
      </view>

      <!-- Advice -->
      <view class="advice-card">
        <view class="advice-header">
          <text class="advice-title">睡眠建议</text>
          <text class="advice-link">查看详情</text>
        </view>
        <text class="advice-desc">深睡阶段晚作息有助于提升睡眠质量，建议您今晚在 22:30 前入睡，并保持卧室通风与安静。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const sleepHours = ref(7);
const sleepMinutes = ref(32);
const sleepQualityText = ref('良好');

const deepHours = ref(2);
const deepMinutes = ref(15);
const lightHours = ref(4);
const lightMinutes = ref(25);
const awakeCount = ref(2);

onShow(() => {
  const user = uni.getStorageSync('current_user');
  if (user && user.reportData) {
    const sleepData = user.reportData.sleepIndex;
    if (sleepData) {
      if (sleepData >= 80) sleepQualityText.value = '良好';
      else if (sleepData >= 60) sleepQualityText.value = '一般';
      else sleepQualityText.value = '较差';
    }
  }
});

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4f7fb 0%, #e0e8ff 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
}

.nav-header {
  height: 88px;
  background: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 20px 14px;
}

.back-btn, .right-btn {
  width: 44px;
  height: 44px;
  margin: 0 -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.back-btn:active, .right-btn:active {
  opacity: 0.6;
}

.icon-back, .icon-history {
  width: 24px;
  height: 24px;
  color: #1a233a;
  stroke-width: 2;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
}

.content {
  padding: 0 20px;
}

.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.tab {
  font-size: 16px;
  color: #64748b;
  padding: 10px 20px;
  position: relative;
  transition: opacity 0.2s;
}

.tab:active {
  opacity: 0.7;
}

.tab.active {
  color: #6272FF;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #6272FF;
  border-radius: 2px;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.icon-arrow {
  width: 20px;
  height: 20px;
  color: #64748b;
  stroke-width: 2;
  padding: 10px;
  margin: -10px;
  transition: opacity 0.2s;
}

.icon-arrow:active {
  opacity: 0.5;
}

.icon-arrow.right {
  transform: rotate(180deg);
}

.date-text {
  font-size: 14px;
  color: #64748b;
}

.sleep-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
}

.sleep-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.sleep-info {
  display: flex;
  flex-direction: column;
}

.sleep-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.sleep-time {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.sleep-time .num {
  font-size: 36px;
  font-weight: 800;
  color: #1a233a;
  line-height: 1;
}

.sleep-time .unit {
  font-size: 14px;
  color: #1a233a;
  font-weight: 600;
  margin: 0 4px;
}

.sleep-quality {
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
}

.moon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-moon {
  width: 40px;
  height: 40px;
}

.chart-section {
  margin-bottom: 30px;
}

.time-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.faux-chart {
  height: 120px;
  position: relative;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
  background: repeating-linear-gradient(0deg, transparent, transparent 29px, #f8fafc 29px, #f8fafc 30px);
}

.bar {
  position: absolute;
  bottom: 0;
  width: 6%;
  border-radius: 4px 4px 0 0;
}

.bar.deep { background: #6272FF; }
.bar.light { background: #A1C4FD; }
.bar.rem { background: #FBBF24; }
.bar.awake { background: #F87171; }

.chart-legend {
  display: flex;
  justify-content: space-between;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #64748b;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.dot.deep { background: #6272FF; }
.dot.light { background: #A1C4FD; }
.dot.rem { background: #FBBF24; }
.dot.awake { background: #F87171; }

.metrics-grid {
  display: flex;
  justify-content: space-between;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.metric-val {
  font-size: 12px;
  color: #1a233a;
  font-weight: 500;
}

.metric-val .num {
  font-size: 16px;
  font-weight: 700;
}

.advice-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.advice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.advice-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a;
}

.advice-link {
  font-size: 13px;
  color: #6272FF;
}

.advice-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}
</style>