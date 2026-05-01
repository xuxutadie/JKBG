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
  background-color: #f7f9fd;
  padding-bottom: 80px;
}
.nav-header {
  height: 88px;
  background: #fff;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
.content {
  padding: 20px;
}
.placeholder-card {
  background: #fff;
  border-radius: 16px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}
</style>