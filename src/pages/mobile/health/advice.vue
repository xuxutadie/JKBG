<template>
  <view class="mobile-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-back">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="title">健康建议</text>
      <view class="right-btn"></view>
    </view>

    <view class="content">
      <view class="advice-list">
        <!-- Card 1 -->
        <view class="advice-card">
          <view class="card-text">
            <text class="card-title">睡眠建议</text>
            <text class="card-desc">保持规律作息，创造良好的睡眠环境</text>
          </view>
          <view class="card-icon bg-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          </view>
        </view>

        <!-- Card 2 -->
        <view class="advice-card">
          <view class="card-text">
            <text class="card-title">压力管理</text>
            <text class="card-desc">学习放松技巧，保持心情愉悦</text>
          </view>
          <view class="card-icon bg-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </view>
        </view>

        <!-- Card 3 -->
        <view class="advice-card">
          <view class="card-text">
            <text class="card-title">生活习惯</text>
            <text class="card-desc">戒烟限酒，均衡饮食，保证多饮水</text>
          </view>
          <view class="card-icon bg-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
          </view>
        </view>

        <!-- Card 4 -->
        <view class="advice-card">
          <view class="card-text">
            <text class="card-title">心理健康</text>
            <text class="card-desc">保持积极心态，必要时寻求专业帮助</text>
          </view>
          <view class="card-icon bg-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </view>
        </view>
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
  padding: 20px;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.advice-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.card-text {
  flex: 1;
  padding-right: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a;
  display: block;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-svg {
  width: 24px;
  height: 24px;
  color: #fff;
}

.bg-purple { background: linear-gradient(135deg, #9B8BFF 0%, #B8AFFF 100%); }
.bg-green { background: linear-gradient(135deg, #34D399 0%, #6EE7B7 100%); }
.bg-blue { background: linear-gradient(135deg, #6272FF 0%, #8A96FF 100%); }
.bg-red { background: linear-gradient(135deg, #F87171 0%, #FCA5A5 100%); }
</style>