<template>
  <view class="mobile-page">
    <!-- 动态背景层 -->
    <view class="bg-animation">
      <view class="blob blob-1"></view>
      <view class="blob blob-2"></view>
      <view class="blob blob-3"></view>
    </view>

    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-back">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="title">自主神经检测结果</text>
      <view class="right-btn"></view>
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

      <!-- Main Overview Card -->
      <view class="overview-card">
        <view class="overview-header">
          <view class="overview-item">
            <text class="overview-label">平衡时长</text>
            <view class="overview-val">
              <text class="num">{{ balanceScore }}</text><text class="unit">%</text>
            </view>
            <text class="overview-sub">较昨晚提升9分</text>
          </view>
          <view class="overview-item align-right">
            <text class="overview-label">神经状态</text>
            <view class="status-emoji">😀</view>
          </view>
        </view>

        <!-- Gradient Bar -->
        <view class="gradient-bar-section">
          <view class="gradient-bar">
            <view class="gradient-track"></view>
            <view class="gradient-pointer" :style="{ left: balanceScore + '%' }">
              <view class="pointer-dot"></view>
            </view>
          </view>
          <view class="gradient-labels">
            <text>失调</text>
            <text>平衡</text>
            <text>良好</text>
          </view>
        </view>

        <view class="overview-advice">
          您的自主神经平衡状况良好，请继续保持健康的生活方式。
        </view>
      </view>

      <!-- Detailed Metrics -->
      <view class="details-card">
        <view class="details-title">详细指标</view>
        <view class="details-list">
          <view class="detail-row">
            <text class="detail-label">交感神经活性</text>
            <view class="detail-right">
              <text class="detail-val">{{ sympActivity }}</text>
              <text class="detail-status text-green">正常</text>
            </view>
          </view>
          <view class="detail-row">
            <text class="detail-label">副交感神经活性</text>
            <view class="detail-right">
              <text class="detail-val">{{ parasympActivity }}</text>
              <text class="detail-status text-green">正常</text>
            </view>
          </view>
          <view class="detail-row">
            <text class="detail-label">自主神经平衡度</text>
            <view class="detail-right">
              <text class="detail-val">{{ balanceScore }}</text>
              <text class="detail-status text-green">良好</text>
            </view>
          </view>
          <view class="detail-row">
            <text class="detail-label">压力指数</text>
            <view class="detail-right">
              <text class="detail-val">{{ stressIndex }}</text>
              <text class="detail-status text-green">正常</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Final Advice -->
      <view class="final-advice">
        <text>建议：适当放松，保持规律作息和适量运动</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getReportMetric } from '@/utils/reportHelper';

const balanceScore = ref(76);
const sympActivity = ref(45);
const parasympActivity = ref(55);
const stressIndex = ref(38);

onShow(() => {
  const user = uni.getStorageSync('current_user');
  if (user && user.reportData) {
    const rd = user.reportData;
    
    const bs = getReportMetric(rd, ['自主神经平衡度', '抗压能力', '自主神经活性']);
    if (bs) balanceScore.value = parseFloat(bs);
    
    const sa = getReportMetric(rd, ['交感神经活性', '交感神经']);
    if (sa) sympActivity.value = parseFloat(sa);
    
    const pa = getReportMetric(rd, ['副交感神经活性', '副交感神经']);
    if (pa) parasympActivity.value = parseFloat(pa);

    const si = getReportMetric(rd, ['压力指数', '疲劳度', '精神压力']);
    if (si) stressIndex.value = parseFloat(si);

    // Fallback if some aren't available but we have fatigueIndex
    if (!bs && rd.fatigueIndex) {
      balanceScore.value = rd.fatigueIndex;
      sympActivity.value = Math.round(rd.fatigueIndex * 0.6);
      parasympActivity.value = Math.round(rd.fatigueIndex * 0.4);
      stressIndex.value = Math.max(0, 100 - rd.fatigueIndex);
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
  background: linear-gradient(135deg, #eff6ff 0%, #c7d2fe 100%);
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

.icon-back {
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

.overview-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(31, 38, 135, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.overview-item {
  display: flex;
  flex-direction: column;
}

.overview-item.align-right {
  align-items: flex-end;
}

.overview-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.overview-val {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.overview-val .num {
  font-size: 42px;
  font-weight: 800;
  color: #1a233a;
  line-height: 1;
}

.overview-val .unit {
  font-size: 16px;
  color: #1a233a;
  font-weight: 600;
  margin-left: 2px;
}

.overview-sub {
  font-size: 12px;
  color: #64748b;
}

.status-emoji {
  font-size: 42px;
  line-height: 1;
  margin-top: 4px;
}

.gradient-bar-section {
  margin-bottom: 24px;
}

.gradient-bar {
  position: relative;
  height: 12px;
  margin-bottom: 8px;
  padding: 0 6px;
}

.gradient-track {
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%);
  border-radius: 3px;
  position: absolute;
  top: 3px;
  left: 0;
}

.gradient-pointer {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pointer-dot {
  width: 6px;
  height: 6px;
  background: #10B981;
  border-radius: 50%;
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
}

.overview-advice {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.details-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.7);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.03), inset 0 2px 4px rgba(255, 255, 255, 0.4);
  margin-bottom: 20px;
}

.details-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 16px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 14px;
  color: #64748b;
}

.detail-right {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 80px;
  justify-content: flex-end;
}

.detail-val {
  font-size: 16px;
  font-weight: 600;
  color: #1a233a;
}

.detail-status {
  font-size: 14px;
  width: 32px;
  text-align: right;
}

.text-green { color: #10b981; }

.final-advice {
  font-size: 14px;
  color: #64748b;
  padding: 0 8px;
}
</style>