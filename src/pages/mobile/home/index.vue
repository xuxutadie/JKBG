<template>
  <view class="mobile-page home-page">
    <view class="home-header">
      <view class="user-greeting">
        <text class="greeting-title">Hi, 张小明</text>
        <text class="greeting-subtitle">关注身心，来让身心健康每一天</text>
      </view>
      <image class="user-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" mode="aspectFill"></image>
    </view>

    <view class="section-title">健康概览</view>
    <view class="health-overview-card">
      <view class="score-circle-wrapper">
        <view class="score-circle">
          <svg viewBox="0 0 100 100" class="progress-ring">
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#9B8BFF" />
                <stop offset="100%" stop-color="#6272FF" />
              </linearGradient>
            </defs>
            <circle class="progress-ring__circle bg" stroke-width="8" cx="50" cy="50" r="40" fill="transparent" />
            <circle class="progress-ring__circle progress" stroke-width="8" cx="50" cy="50" r="40" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="55" stroke="url(#scoreGrad)" />
          </svg>
          <view class="score-text-box">
            <text class="score-number">78</text>
            <text class="score-label">健康评分</text>
          </view>
        </view>
      </view>
      
      <view class="overview-stats">
        <view class="stat-item">
          <view class="stat-dot dot-purple"></view>
          <view class="stat-info">
            <text class="stat-name">睡眠质量</text>
            <text class="stat-value">良好</text>
          </view>
        </view>
        <view class="stat-item">
          <view class="stat-dot dot-green"></view>
          <view class="stat-info">
            <text class="stat-name">身心平衡</text>
            <text class="stat-value">良好</text>
          </view>
        </view>
        <view class="stat-item">
          <view class="stat-dot dot-yellow"></view>
          <view class="stat-info">
            <text class="stat-name">身体状态</text>
            <text class="stat-value">需要改善</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section-title">今日任务</view>
    <view class="task-list">
      <view class="task-item">
        <view class="task-icon bg-pink">
          <!-- 睡眠图标 -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </view>
        <view class="task-content">
          <text class="task-name">睡眠记录</text>
          <text class="task-desc">记录昨晚睡眠情况</text>
        </view>
        <view class="task-btn btn-done">已完成</view>
      </view>

      <view class="task-item">
        <view class="task-icon bg-blue">
          <!-- 自律神经图标 -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12h-4l-3 8-4-16-3 8H3" />
          </svg>
        </view>
        <view class="task-content">
          <text class="task-name">自主神经检测</text>
          <text class="task-desc">进行心率变异性检测</text>
        </view>
        <view class="task-btn btn-action">去检测</view>
      </view>

      <view class="task-item">
        <view class="task-icon bg-green">
          <!-- 运动图标 -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </view>
        <view class="task-content">
          <text class="task-name">运动计划</text>
          <text class="task-desc">30分钟有氧运动</text>
        </view>
        <view class="task-btn btn-action">去完成</view>
      </view>
    </view>
  </view>
</template>

<script setup>
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  background-color: #F4F7FB;
  padding: 44px 20px 80px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.user-greeting {
  display: flex;
  flex-direction: column;
}

.greeting-title {
  font-size: 24px;
  font-weight: 800;
  color: #1a233a;
  margin-bottom: 6px;
}

.greeting-subtitle {
  font-size: 13px;
  color: #7b8a9e;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #e2e8f0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 16px;
}

.health-overview-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  margin-bottom: 32px;
}

.score-circle-wrapper {
  flex: 0 0 110px;
  margin-right: 24px;
}

.score-circle {
  position: relative;
  width: 110px;
  height: 110px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform-origin: 50% 50%;
}

.progress-ring__circle.bg {
  stroke: #f0f4ff;
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
  line-height: 1.1;
}

.score-label {
  font-size: 11px;
  color: #94a3b8;
}

.overview-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-top: 5px;
}

.dot-purple { background-color: #9B8BFF; }
.dot-green { background-color: #34D399; }
.dot-yellow { background-color: #FBBF24; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-name {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a233a;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.task-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex: 0 0 auto;
}

.icon-svg {
  width: 24px;
  height: 24px;
  color: #ffffff;
}

/* 还原图标背景色 */
.bg-pink { background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); }
.bg-blue { background: linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%); }
.bg-green { background: linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%); }

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
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-btn {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  margin-left: 10px;
}

.btn-done {
  background-color: #F1F5F9;
  color: #A0AEC0;
}

.btn-action {
  background-color: #F0F4FF;
  color: #7A88FF;
}
</style>