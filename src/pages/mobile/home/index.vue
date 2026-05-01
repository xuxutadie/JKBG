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
            <circle class="progress-ring__circle bg" stroke-width="8" cx="50" cy="50" r="40" fill="transparent" />
            <circle class="progress-ring__circle progress" stroke-width="8" cx="50" cy="50" r="40" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="55" />
          </svg>
          <view class="score-text-box">
            <text class="score-number">78</text>
            <text class="score-label">健康评分</text>
          </view>
        </view>
      </view>
      
      <view class="overview-stats">
        <view class="stat-item">
          <view class="stat-dot dot-blue"></view>
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
          <view class="stat-dot dot-red"></view>
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
        <view class="task-icon bg-orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
  background-color: #f7f9fd;
  padding: 24px 20px 80px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
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
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #e2e8f0;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 16px;
}

.health-overview-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
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
  stroke: #4a8cff;
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
  color: #7b8a9e;
}

.overview-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.dot-blue { background-color: #4a8cff; }
.dot-green { background-color: #10b981; }
.dot-red { background-color: #f43f5e; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-name {
  font-size: 12px;
  color: #7b8a9e;
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
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

.task-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex: 0 0 auto;
}

.icon-svg {
  width: 22px;
  height: 22px;
  color: #ffffff;
}

.bg-orange { background: linear-gradient(135deg, #fbb672 0%, #f68e4a 100%); }
.bg-blue { background: linear-gradient(135deg, #7db3ff 0%, #4a8cff 100%); }
.bg-green { background: linear-gradient(135deg, #6ee7b7 0%, #10b981 100%); }

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.task-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 4px;
}

.task-desc {
  font-size: 12px;
  color: #7b8a9e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-btn {
  padding: 6px 14px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 10px;
}

.btn-done {
  background-color: #f1f5f9;
  color: #94a3b8;
}

.btn-action {
  background-color: #eef4ff;
  color: #4a8cff;
}
</style>