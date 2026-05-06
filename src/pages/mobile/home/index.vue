<template>
  <view class="mobile-page home-page">
    <!-- 动态背景层 -->
    <view class="bg-animation">
      <view class="blob blob-1"></view>
      <view class="blob blob-2"></view>
      <view class="blob blob-3"></view>
      
      <!-- 右上角装饰线条与悬浮物 -->
      <view class="bg-decoration-line"></view>
      <view class="bg-decoration-line-2"></view>
    </view>

    <view class="home-header">
      <view class="user-greeting">
        <text class="greeting-title">Hi, {{ currentUser.name || 'SJY' }}</text>
        <text class="greeting-subtitle">关注身心，来让身心健康每一天</text>
      </view>
      <view class="avatar-wrapper">
        <image class="user-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" mode="aspectFill"></image>
        <view class="scan-icon-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="scan-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v-2a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0h-2a2 2 0 01-2-2v-2m4-5h8"/></svg>
        </view>
      </view>
    </view>

    <view class="section-title-bar">
      <view class="section-title-wrapper">
        <view class="title-indicator"></view>
        <view class="section-title">健康概览</view>
      </view>
    </view>
    <view class="health-overview-card">
        <view class="score-circle-wrapper">
          <view class="score-circle">
            <svg viewBox="0 0 100 100" class="progress-ring">
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#6272FF" />
                  <stop offset="100%" stop-color="#9B8BFF" />
                </linearGradient>
              </defs>
              <circle class="progress-ring__circle bg" stroke-width="10" cx="50" cy="50" r="38" fill="transparent" stroke-dasharray="179 238.7" />
              <circle class="progress-ring__circle progress" stroke-width="10" cx="50" cy="50" r="38" fill="transparent" stroke-dasharray="238.7" :stroke-dashoffset="scoreDashoffset" stroke="url(#scoreGrad)" />
            </svg>
            <view class="score-text-box">
              <text class="score-number">{{ getScore }}</text>
              <text class="score-label">健康评分</text>
            </view>
          </view>
          <view class="score-badge">良好</view>
        </view>

      <view class="overview-stats">
        <view class="stat-item">
          <view class="stat-icon-wrap bg-purple-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="stat-icon-svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </view>
          <view class="stat-info">
            <text class="stat-name">睡眠质量</text>
            <text class="stat-value">{{ sleepQuality }}</text>
          </view>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" class="stat-arrow"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </view>
        <view class="stat-item">
          <view class="stat-icon-wrap bg-green-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="stat-icon-svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </view>
          <view class="stat-info">
            <text class="stat-name">身心平衡</text>
            <text class="stat-value">{{ bodyBalance }}</text>
          </view>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" class="stat-arrow"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </view>
        <view class="stat-item">
          <view class="stat-icon-wrap bg-yellow-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="stat-icon-svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </view>
          <view class="stat-info">
            <text class="stat-name">身体状态</text>
            <text class="stat-value">{{ bodyState }}</text>
          </view>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" class="stat-arrow"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </view>
      </view>
    </view>

    <view class="section-title-bar">
      <view class="section-title-wrapper">
        <view class="title-indicator"></view>
        <view class="section-title">今日任务</view>
      </view>
      <view class="section-more" @click="goToTab('/pages/mobile/plan/index')">全部任务 ></view>
    </view>
    <view class="task-list">
      <view class="task-item" @click="goTo('/pages/mobile/health/sleep')">
        <view class="task-icon bg-pink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l-2 2M19 5l-2 2" />
          </svg>
        </view>
        <view class="task-content">
          <text class="task-name">睡眠记录</text>
          <text class="task-desc">记录昨晚睡眠情况</text>
          <view class="task-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="time-icon"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg>
            <text>建议睡前完成</text>
          </view>
        </view>
        <view class="task-btn btn-done">
          已完成
          <view class="done-check-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="check-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
          </view>
        </view>
      </view>

      <view class="task-item" @click="goTo('/pages/mobile/health/autonomic')">
        <view class="task-icon bg-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12v3" />
          </svg>
        </view>
        <view class="task-content">
          <text class="task-name">自主神经检测</text>
          <text class="task-desc">进行心率变异性检测</text>
          <view class="task-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="time-icon"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg>
            <text>约 2 分钟</text>
          </view>
        </view>
        <view class="task-btn btn-action">
          去检测
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="btn-icon-right"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </view>
      </view>

      <view class="task-item" @click="goTo('/pages/mobile/health/exercise')">
        <view class="task-icon bg-green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
        </view>
        <view class="task-content">
          <text class="task-name">运动计划</text>
          <text class="task-desc">30分钟有氧运动</text>
          <view class="task-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="time-icon"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg>
            <text>约 30 分钟</text>
          </view>
        </view>
        <view class="task-btn btn-action">
          去完成
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="btn-icon-right"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </view>
      </view>
    </view>

    <!-- 小贴士卡片 -->
    <view class="tips-card-wrapper">
      <view class="tips-card">
        <view class="tips-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="tips-star-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <text class="tips-title">小贴士</text>
        </view>
        <text class="tips-content">保持规律作息与适度运动，可以帮助提升睡眠质量哦～</text>
        
        <!-- 卡通插图 -->
        <image class="tips-illustration" src="@/static/小贴士.png" mode="aspectFit"></image>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getReportMetric } from '@/utils/reportHelper';
import { getPatientDetail } from '@/utils/patientApi';

const currentUser = ref({
  name: '张小明',
  score: 78,
  reportData: {}
});

onShow(async () => {
  const user = uni.getStorageSync('current_user');
  if (user) {
    currentUser.value = user;
    // Fetch latest data from API/storage to keep it synced with Management side
    if (user.id) {
      try {
        const latestUser = await getPatientDetail(user.id);
        if (latestUser) {
          currentUser.value = latestUser;
          uni.setStorageSync('current_user', latestUser);
        }
      } catch (err) {
        console.error('Failed to fetch latest user data:', err);
      }
    }
  }
});

const goTo = (url) => {
  uni.navigateTo({ url });
};

const goToTab = (url) => {
  uni.switchTab({ url });
};

const getScore = computed(() => {
  if (currentUser.value.score) {
    return parseFloat(currentUser.value.score);
  }
  const rd = currentUser.value.reportData;
  const inbodyScore = getReportMetric(rd, ['InBody评分', '综合评分']);
  if (inbodyScore && !isNaN(parseFloat(inbodyScore))) {
    return parseFloat(inbodyScore);
  }
  return 0;
});

// Calculate dash offset for the progress ring (max 238.7 for r=38)
// The ring is a 3/4 circle (270 degrees) so max dasharray is 238.7 * 0.75
const scoreDashoffset = computed(() => {
  const score = getScore.value;
  const max = 238.7;
  const target = max * 0.75; // 75% of the circle is the actual track
  // Offset formula: start from max offset (empty) and subtract the filled portion
  // The empty part is `max`, and we subtract `target * (score/100)` to fill it.
  return max - target * (score / 100);
});

const sleepQuality = computed(() => {
  const rd = currentUser.value.reportData;
  const sleepIndex = rd?.sleepIndex || getReportMetric(rd, ['睡眠质量评分', '睡眠效率 SE']);
  const val = parseFloat(sleepIndex) || 80;
  if (val >= 80) return '良好';
  if (val >= 60) return '一般';
  return '需要改善';
});

const bodyBalance = computed(() => {
  const rd = currentUser.value.reportData;
  const val = parseFloat(rd?.fatigueIndex || getReportMetric(rd, ['抗压能力', '疲劳度'])) || 80;
  if (val >= 80) return '良好';
  if (val >= 60) return '一般';
  return '需要改善';
});

const bodyState = computed(() => {
  const rd = currentUser.value.reportData;
  const bmiStr = getReportMetric(rd, ['身体质量指数(BMI)', 'BMI']);
  const val = parseFloat(bmiStr) || rd?.bmi || 22;
  if (val >= 18.5 && val <= 24) return '良好';
  return '需要改善';
});
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #c7d2fe 100%);
  padding: 50px 16px 80px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.user-greeting {
  display: flex;
  flex-direction: column;
}

.greeting-title {
  font-size: 24px;
  font-weight: 800;
  color: #1a233a;
  margin-bottom: 4px;
}

.greeting-subtitle {
  font-size: 12px;
  color: #64748b;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #e2e8f0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.avatar-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
}

.scan-icon-overlay {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.scan-svg {
  width: 12px;
  height: 12px;
  color: white;
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-indicator {
  width: 6px;
  height: 18px;
  background: #6272FF;
  border-radius: 3px;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #1a233a;
}

.section-more {
  font-size: 12px;
  color: #6272FF;
}

.health-overview-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.85) 100%); /* Made the main card whiter and less transparent */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 16px 40px rgba(31, 38, 135, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05), inset 0 2px 4px rgba(255, 255, 255, 1); /* Deeper shadows for more contrast against background */
  margin-bottom: 24px;
}

.score-circle-wrapper {
  flex: 0 0 110px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-circle {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(135deg); /* Adjusted to match the image where the gap is at the bottom left */
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform-origin: 50% 50%;
}

.progress-ring__circle.bg {
  stroke: rgba(98, 114, 255, 0.15); /* Light purple background */
}

.progress-ring__circle.progress {
  stroke-linecap: round;
}

.score-text-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-number {
  font-size: 32px;
  font-weight: 800;
  color: #1a233a;
  line-height: 1;
}

.score-label {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.score-badge {
  margin-top: 12px;
  padding: 4px 16px;
  background: #Eef0FF;
  color: #6272FF;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.overview-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #eaf0ff 0%, #dbeafe 100%); /* Medium-light blue, between the two previous versions */
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(98, 114, 255, 0.1); /* Adjusted shadow to match */
}

.stat-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-svg {
  width: 18px;
  height: 18px;
}

.bg-purple-light { background: #ffffff; color: #6272FF; box-shadow: 0 2px 8px rgba(98, 114, 255, 0.1); }
.bg-green-light { background: #ffffff; color: #10b981; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1); }
.bg-yellow-light { background: #ffffff; color: #f59e0b; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1); }

.stat-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-name {
  font-size: 11px;
  color: #7B8CB5; /* slightly deeper text to contrast with blue background */
  margin-bottom: 2px;
}

.stat-value {
  font-size: 15px;
  font-weight: 800;
  color: #2D3748;
}

.stat-arrow {
  width: 16px;
  height: 16px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 24px rgba(31, 38, 135, 0.05), inset 0 2px 4px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.task-item:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.6) 100%);
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.03), inset 0 2px 4px rgba(255, 255, 255, 0.6);
}

.task-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex: 0 0 auto;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.icon-svg {
  width: 24px;
  height: 24px;
  color: #ffffff;
}

.bg-pink { background: linear-gradient(135deg, #fbcfe8 0%, #f43f5e 100%); }
.bg-blue { background: linear-gradient(135deg, #bfdbfe 0%, #3b82f6 100%); }
.bg-green { background: linear-gradient(135deg, #a7f3d0 0%, #10b981 100%); }

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.task-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 4px;
}

.task-desc {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}

.task-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
}

.time-icon {
  width: 12px;
  height: 12px;
}

.task-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-left: 10px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.btn-icon-right {
  width: 14px;
  height: 14px;
}

.task-btn:active {
  opacity: 0.7;
}

.btn-done {
  background-color: #Edfdf5;
  color: #10b981;
}

.done-check-circle {
  width: 14px;
  height: 14px;
  background-color: #10b981;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}

.check-icon {
  width: 10px;
  height: 10px;
  color: white;
}

.btn-action {
  background-color: #Eef0FF;
  color: #6272FF;
}

.tips-card-wrapper {
  margin-top: 20px;
}

.tips-card {
  position: relative;
  background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
  border-radius: 16px;
  padding: 16px 80px 16px 16px; /* Right padding to make room for illustration */
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.tips-star-icon {
  width: 16px;
  height: 16px;
  color: #a855f7;
  fill: #a855f7;
}

.tips-title {
  font-size: 15px;
  font-weight: 700;
  color: #9333ea;
}

.tips-content {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  display: block;
}

.tips-illustration {
  position: absolute;
  bottom: 4px;
  right: 15px;
  width: 70px;
  height: 70px;
}
</style>