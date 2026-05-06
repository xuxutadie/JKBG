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
      <text class="title">饮食指南</text>
      <view class="right-btn"></view>
    </view>

    <view class="content">
      <view class="section-title">今日推荐食谱</view>

      <view class="diet-list">
        <!-- Breakfast -->
        <view class="diet-card">
          <view class="meal-header">
            <text class="meal-name">早餐</text>
            <text class="meal-cal">400 kcal</text>
          </view>
          <view class="meal-items">
            <text class="m-item">• 燕麦粥 (1碗)</text>
            <text class="m-item">• 水煮蛋 (1个)</text>
            <text class="m-item">• 新鲜水果 (适量)</text>
          </view>
        </view>

        <!-- Lunch -->
        <view class="diet-card">
          <view class="meal-header">
            <text class="meal-name">午餐</text>
            <text class="meal-cal">700 kcal</text>
          </view>
          <view class="meal-items">
            <text class="m-item">• 糙米饭 (1小碗)</text>
            <text class="m-item">• 香煎鸡胸肉 (150g)</text>
            <text class="m-item">• 清炒时蔬 (200g)</text>
          </view>
        </view>

        <!-- Dinner -->
        <view class="diet-card">
          <view class="meal-header">
            <text class="meal-name">晚餐</text>
            <text class="meal-cal">500 kcal</text>
          </view>
          <view class="meal-items">
            <text class="m-item">• 清蒸鱼 (150g)</text>
            <text class="m-item">• 凉拌黄瓜 (适量)</text>
            <text class="m-item">• 紫菜蛋花汤 (1碗)</text>
          </view>
        </view>
      </view>

      <view class="tips-card">
        <text class="tips-title">饮食建议</text>
        <text class="tips-text">1. 每天保证摄入1.5L-2L水分。</text>
        <text class="tips-text">2. 减少高糖、高盐、高脂肪食物的摄入。</text>
        <text class="tips-text">3. 细嚼慢咽，每餐八分饱即可。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
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

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 16px;
  margin-top: 10px;
}

.diet-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.diet-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(24px);
  border-radius: 20px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 32px rgba(31, 38, 135, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.8);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.meal-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a233a;
}

.meal-cal {
  font-size: 14px;
  color: #F59E0B;
  font-weight: 500;
}

.meal-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.m-item {
  font-size: 14px;
  color: #64748b;
}

.tips-card {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.6) 0%, rgba(254, 243, 199, 0.2) 100%);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.7);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.03), inset 0 2px 4px rgba(255, 255, 255, 0.4);
}

.tips-title {
  font-size: 15px;
  font-weight: 600;
  color: #D97706;
  display: block;
  margin-bottom: 10px;
}

.tips-text {
  font-size: 13px;
  color: #92400E;
  display: block;
  line-height: 1.6;
  margin-bottom: 4px;
}
</style>