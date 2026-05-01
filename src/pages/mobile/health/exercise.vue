<template>
  <view class="mobile-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-back">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="title">运动建议</text>
      <view class="right-btn"></view>
    </view>

    <view class="content">
      <view class="section-title">为您推荐</view>

      <!-- Plan Card -->
      <view class="plan-card">
        <view class="plan-info">
          <text class="plan-title">有氧运动计划</text>
          <text class="plan-sub">每周3-5次，每次30-60分钟</text>
          <view class="plan-tags">
            <text class="tag"><view class="tag-dot"></view>燃脂</text>
            <text class="tag"><view class="tag-dot"></view>增强心肺</text>
          </view>
        </view>
        <view class="plan-image">
          <svg viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" fill="#E8F0FE" />
            <path d="M50 25 A10 10 0 1 1 50 25.01 Z" fill="#A1C4FD"/>
            <path d="M40 45 Q50 35 60 45 L55 75 L45 75 Z" fill="#A1C4FD"/>
          </svg>
        </view>
      </view>

      <!-- Details List -->
      <view class="details-list">
        <view class="detail-item">
          <text class="d-title">运动类型</text>
          <text class="d-desc">快走、慢跑、游泳、骑自行车</text>
        </view>
        <view class="detail-item">
          <text class="d-title">运动强度</text>
          <text class="d-desc">中等强度（最大心率的60-70%）</text>
        </view>
        <view class="detail-item">
          <text class="d-title">运动目标</text>
          <text class="d-desc">减脂燃脂，提升心肺功能</text>
        </view>
        <view class="detail-item">
          <text class="d-title">注意事项</text>
          <text class="d-desc">运动前后做好热身和拉伸</text>
        </view>
      </view>

      <view class="bottom-btn-container">
        <button class="start-btn">开始运动计划</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  background-color: #f4f7fb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  padding-bottom: 100px;
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

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 16px;
  margin-top: 10px;
}

.plan-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 30px rgba(98, 114, 255, 0.08);
  margin-bottom: 24px;
  border: 1px solid #eef2f6;
}

.plan-info {
  flex: 1;
}

.plan-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
  display: block;
  margin-bottom: 8px;
}

.plan-sub {
  font-size: 13px;
  color: #64748b;
  display: block;
  margin-bottom: 16px;
}

.plan-tags {
  display: flex;
  gap: 12px;
}

.tag {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6272FF;
  background: rgba(98, 114, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.tag-dot {
  width: 4px;
  height: 4px;
  background: #6272FF;
  border-radius: 50%;
  margin-right: 4px;
}

.plan-image {
  width: 80px;
  height: 80px;
  margin-left: 16px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.d-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a233a;
  margin-bottom: 6px;
}

.d-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.bottom-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 32px;
  background: linear-gradient(0deg, #ffffff 80%, rgba(255,255,255,0) 100%);
}

.start-btn {
  background: #6272FF;
  color: #fff;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  line-height: 48px;
  border: none;
  box-shadow: 0 8px 20px rgba(98, 114, 255, 0.3);
}

.start-btn:active {
  opacity: 0.9;
}
</style>