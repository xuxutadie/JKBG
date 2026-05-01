<template>
  <view class="mobile-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-back">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="title">人体成分分析</text>
      <view class="right-btn"></view>
    </view>

    <view class="content">
      <text class="date-text">2026-05-01 10:30</text>

      <!-- Main Body Card -->
      <view class="body-card">
        <view class="body-left">
          <view class="score-section">
            <text class="score-label">身体评分</text>
            <view class="score-val">
              <text class="num">{{ bodyScore }}</text><text class="unit">分</text>
            </view>
            <text class="score-status text-orange">需要改善</text>
          </view>

          <view class="metrics-list">
            <view class="metric-row">
              <text class="m-label">体重</text>
              <view class="m-val-box">
                <text class="m-val">{{ weight }} kg</text>
                <text class="m-trend up">↑</text>
              </view>
            </view>
            <view class="metric-row">
              <text class="m-label">体脂率</text>
              <view class="m-val-box">
                <text class="m-val">{{ bodyFat }} %</text>
                <text class="m-trend up">↑</text>
              </view>
            </view>
            <view class="metric-row">
              <text class="m-label">肌肉量</text>
              <view class="m-val-box">
                <text class="m-val">{{ muscleMass }} kg</text>
              </view>
            </view>
            <view class="metric-row">
              <text class="m-label">基础代谢</text>
              <view class="m-val-box">
                <text class="m-val">{{ bmr }} kcal</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="body-right">
          <!-- Placeholder for 3D body model -->
          <view class="body-model-placeholder">
            <svg viewBox="0 0 100 250" fill="none" stroke="#A1C4FD" stroke-width="2">
              <!-- A simple stick figure/silhouette outline -->
              <circle cx="50" cy="20" r="10" fill="#E8F0FE"/>
              <path d="M50 30 L50 100 M30 50 L70 50 M50 100 L30 180 M50 100 L70 180" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- Obesity Analysis Card -->
      <view class="obesity-card">
        <view class="card-title">肥胖分析</view>
        <view class="obesity-list">
          <view class="o-row">
            <text class="o-label">BMI</text>
            <text class="o-status text-red">{{ bmi }} 超重</text>
          </view>
          <view class="o-row">
            <text class="o-label">内脏脂肪等级</text>
            <text class="o-status text-orange">{{ vfat }}级偏高</text>
          </view>
          <view class="o-row">
            <text class="o-label">腰臀比</text>
            <text class="o-status text-red">{{ whr }} 偏高</text>
          </view>
        </view>
      </view>

      <view class="final-advice">
        <text>建议：控制体重，增加运动，改善饮食结构</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const bodyScore = ref(68);
const weight = ref(78.5);
const bodyFat = ref(28.6);
const muscleMass = ref(52.3);
const bmr = ref(1650);

const bmi = ref(26.5);
const vfat = ref(12);
const whr = ref(0.95);

onShow(() => {
  const user = uni.getStorageSync('current_user');
  if (user && user.reportData) {
    // Attempt to read from reportData.inbodyProfile if available
    const inbody = user.reportData.inbodyProfile;
    if (inbody && inbody.length) {
      const getVal = (label) => {
        const item = inbody.find(i => i.label === label);
        return item ? item.value : null;
      };
      
      const w = getVal('体重');
      if (w) weight.value = w;
      
      const bf = getVal('体脂率');
      if (bf) bodyFat.value = bf;

      const mm = getVal('骨骼肌');
      if (mm) muscleMass.value = mm;

      const bm = getVal('BMI');
      if (bm) bmi.value = bm;

      const vf = getVal('内脏脂肪面积') || getVal('内脏脂肪等级');
      if (vf) vfat.value = vf;
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
  background-color: #f4f7fb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  padding-bottom: 40px;
}

.nav-header {
  height: 88px;
  background: #f4f7fb;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 20px 14px;
}

.back-btn, .right-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.date-text {
  font-size: 12px;
  color: #94a3b8;
  display: block;
  text-align: right;
  margin-bottom: 12px;
}

.body-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.body-left {
  flex: 1;
}

.score-section {
  margin-bottom: 30px;
}

.score-label {
  font-size: 13px;
  color: #64748b;
  display: block;
  margin-bottom: 4px;
}

.score-val {
  display: flex;
  align-items: baseline;
}

.score-val .num {
  font-size: 42px;
  font-weight: 800;
  color: #1a233a;
  line-height: 1;
}

.score-val .unit {
  font-size: 14px;
  color: #1a233a;
  font-weight: 600;
  margin-left: 2px;
}

.score-status {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-top: 4px;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
}

.m-label {
  font-size: 14px;
  color: #1a233a;
  font-weight: 500;
}

.m-val-box {
  display: flex;
  align-items: center;
  gap: 4px;
}

.m-val {
  font-size: 14px;
  color: #64748b;
}

.m-trend {
  font-size: 12px;
}

.m-trend.up {
  color: #EF4444;
}

.body-right {
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.body-model-placeholder {
  width: 100px;
  height: 250px;
  opacity: 0.8;
}

.obesity-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 20px;
}

.obesity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.o-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.o-label {
  font-size: 14px;
  color: #1a233a;
  font-weight: 500;
}

.o-status {
  font-size: 14px;
  font-weight: 500;
}

.text-orange { color: #F59E0B; }
.text-red { color: #EF4444; }

.final-advice {
  font-size: 14px;
  color: #64748b;
  padding: 0 8px;
}
</style>