<template>
  <view class="mobile-page plan-page">
    <!-- 动态背景层 -->
    <view class="bg-animation">
      <view class="blob blob-1"></view>
      <view class="blob blob-2"></view>
      <view class="blob blob-3"></view>
    </view>

    <view class="nav-header">健康方案</view>
    
    <scroll-view scroll-y class="content-scroll">
      <view class="content">
        <!-- Tab 切换 -->
        <view class="tabs-container">
          <view class="tab-item" :class="{ active: currentTab === 'treatment' }" @click="currentTab = 'treatment'">
            我的治疗方案
          </view>
          <view class="tab-item" :class="{ active: currentTab === 'packages' }" @click="currentTab = 'packages'">
            优选套餐
          </view>
        </view>

        <!-- 治疗方案 -->
        <view class="tab-content" v-if="currentTab === 'treatment'">
          <view class="section-title-bar">
            <view class="title-indicator"></view>
            <view class="section-title">当前调理阶段</view>
          </view>
          
          <view class="treatment-card active-card">
            <view class="plan-header">
              <view class="plan-title">第一阶段：睡眠与神经平衡</view>
              <view class="plan-status active">进行中</view>
            </view>
            <view class="plan-desc">通过调节作息和基础物理理疗，恢复自主神经系统平衡，改善深睡时长与整体睡眠质量。</view>
            
            <view class="progress-bar-wrap">
              <view class="progress-text">
                <text>本阶段进度</text>
                <text class="pct">60%</text>
              </view>
              <view class="progress-bg"><view class="progress-fill" style="width: 60%"></view></view>
            </view>

            <view class="task-list">
              <view class="task-item">
                <view class="task-dot done">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="check-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </view>
                <view class="task-info">
                  <text class="task-name">光照理疗 (20分钟/次)</text>
                  <text class="task-freq">本周已完成 3/3 次</text>
                </view>
              </view>
              <view class="task-item">
                <view class="task-dot active"></view>
                <view class="task-info">
                  <text class="task-name">经颅微电流刺激调理</text>
                  <text class="task-freq">待进行，建议明日下午</text>
                </view>
              </view>
              <view class="task-item">
                <view class="task-dot pending"></view>
                <view class="task-info">
                  <text class="task-name">助眠中药足浴</text>
                  <text class="task-freq">每日睡前进行</text>
                </view>
              </view>
            </view>
          </view>

          <view class="treatment-card locked">
            <view class="plan-header">
              <view class="plan-title">第二阶段：心肺与机能提升</view>
              <view class="plan-status pending">未开始</view>
            </view>
            <view class="plan-desc">在基础恢复后，引入有氧心肺功能训练与针对性营养干预，全面提升身体机能与免疫力。</view>
          </view>
        </view>

        <!-- 套餐选购 -->
        <view class="tab-content" v-if="currentTab === 'packages'">
          
          <view class="package-card premium">
            <view class="pkg-badge">专家推荐</view>
            <view class="pkg-header">
              <text class="pkg-title">身心综合平衡套餐</text>
              <text class="pkg-price"><text class="currency">¥</text>2999</text>
            </view>
            <view class="pkg-tags">
              <text class="pkg-tag">自主神经失调</text>
              <text class="pkg-tag">周期90天</text>
            </view>
            <view class="pkg-features">
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 专家1对1深度问诊 3次</view>
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 经颅微电流刺激调理 10次</view>
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 定制周期营养膳食方案</view>
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 24小时专属健康管家答疑</view>
            </view>
            <button class="buy-btn primary" @click="handleBuy">立即选购</button>
          </view>

          <view class="package-card standard">
            <view class="pkg-header">
              <text class="pkg-title">基础睡眠调理包</text>
              <text class="pkg-price"><text class="currency">¥</text>999</text>
            </view>
            <view class="pkg-tags">
              <text class="pkg-tag">适合轻度失眠</text>
              <text class="pkg-tag">周期30天</text>
            </view>
            <view class="pkg-features">
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 睡眠医生1对1评估 1次</view>
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 光照理疗 4次</view>
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 详细睡眠监测评估报告</view>
            </view>
            <button class="buy-btn" @click="handleBuy">立即选购</button>
          </view>
          
          <view class="package-card vip">
            <view class="pkg-header">
              <text class="pkg-title">全方位尊享康养年卡</text>
              <text class="pkg-price"><text class="currency">¥</text>9999</text>
            </view>
            <view class="pkg-tags">
              <text class="pkg-tag">亚健康全面改善</text>
              <text class="pkg-tag">周期365天</text>
            </view>
            <view class="pkg-features">
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 全年不限次基础物理理疗</view>
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 每月深度身体机能全项评估</view>
              <view class="feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="feature-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 私人医生团队多对一持续服务</view>
            </view>
            <button class="buy-btn vip-btn" @click="handleBuy">立即选购</button>
          </view>

        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const currentTab = ref('treatment');

const handleBuy = () => {
  uni.showToast({
    title: '正在开发中，敬请期待',
    icon: 'none'
  });
};
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #c7d2fe 100%);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.nav-header {
  height: 88px;
  background: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 14px;
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
  flex-shrink: 0;
}
.content-scroll {
  flex: 1;
  height: 0; /* Let flex control height */
}
.content {
  padding: 16px 20px 80px;
}

/* Tabs */
.tabs-container {
  display: flex;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 4px;
  margin-bottom: 24px;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.6), 0 4px 12px rgba(31,38,135,0.05);
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  border-radius: 20px;
  transition: all 0.3s ease;
}
.tab-item.active {
  background: #ffffff;
  color: #6272FF;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Section Title */
.section-title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
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

/* Treatment Cards */
.treatment-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 24px rgba(31, 38, 135, 0.05);
}
.treatment-card.locked {
  opacity: 0.7;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%);
}
.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.plan-title {
  font-size: 16px;
  font-weight: 800;
  color: #1a233a;
}
.plan-status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}
.plan-status.active {
  background: #Eef0FF;
  color: #6272FF;
}
.plan-status.pending {
  background: #f1f5f9;
  color: #94a3b8;
}
.plan-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* Progress Bar */
.progress-bar-wrap {
  margin-bottom: 24px;
}
.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 600;
}
.progress-text .pct {
  color: #6272FF;
}
.progress-bg {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #818cf8 0%, #6272FF 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Task List in Treatment */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.task-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.task-dot.done {
  background: #10b981;
}
.check-icon {
  width: 12px;
  height: 12px;
  color: white;
}
.task-dot.active {
  border: 2px solid #6272FF;
  background: #ffffff;
  position: relative;
}
.task-dot.active::after {
  content: '';
  width: 8px;
  height: 8px;
  background: #6272FF;
  border-radius: 50%;
  position: absolute;
}
.task-dot.pending {
  border: 2px solid #cbd5e1;
  background: #f8fafc;
}
.task-info {
  display: flex;
  flex-direction: column;
}
.task-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 4px;
}
.task-freq {
  font-size: 12px;
  color: #94a3b8;
}

/* Package Cards */
.package-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 24px rgba(31, 38, 135, 0.05);
}
.package-card.premium {
  border: 2px solid #a5b4fc;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  transform: scale(1.02);
  z-index: 2;
  box-shadow: 0 16px 32px rgba(98, 114, 255, 0.15);
}
.package-card.vip {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
}
.pkg-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(90deg, #818cf8 0%, #6272FF 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 0 20px 0 12px;
}
.pkg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.pkg-title {
  font-size: 18px;
  font-weight: 800;
  color: #1a233a;
}
.pkg-price {
  font-size: 24px;
  font-weight: 800;
  color: #ef4444;
}
.currency {
  font-size: 14px;
  margin-right: 2px;
}
.pkg-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.pkg-tag {
  font-size: 11px;
  padding: 4px 10px;
  background: rgba(98, 114, 255, 0.1);
  color: #6272FF;
  border-radius: 12px;
  font-weight: 600;
}
.vip .pkg-tag {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
.pkg-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}
.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}
.feature-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
}
.buy-btn {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: #f1f5f9;
  color: #475569;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.2s;
}
.buy-btn.primary {
  background: linear-gradient(90deg, #818cf8 0%, #6272FF 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(98, 114, 255, 0.3);
}
.buy-btn.vip-btn {
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
.buy-btn:active {
  transform: scale(0.98);
}
.buy-btn::after {
  border: none;
}
</style>