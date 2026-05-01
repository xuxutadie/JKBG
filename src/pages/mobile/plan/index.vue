<template>
  <view class="mobile-page">
    <view class="nav-header">健康方案</view>
    <view class="content">
      <view class="placeholder-card">为您推荐的方案</view>
    </view>
  </view>
</template>

<style scoped>
.mobile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #c7d2fe 100%);
  padding-bottom: 80px;
}
.nav-header {
  height: 88px;
  background: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
}
.content {
  padding: 20px;
}
.placeholder-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-top: 1px solid rgba(255, 255, 255, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 40px rgba(31, 38, 135, 0.06), 0 2px 10px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.6);
}
</style>