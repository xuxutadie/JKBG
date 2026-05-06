<template>
  <view class="mobile-page sub-settings-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="nav-title">关于我们</text>
      <view class="placeholder"></view>
    </view>

    <view class="about-content">
      <view class="logo-box">
        <image class="logo-icon" src="@/static/登录页.png" mode="aspectFit"></image>
      </view>
      <text class="app-name">身心健康平台</text>
      <text class="app-version">Version 1.0.0</text>
    </view>

    <view class="settings-list">
      <view class="settings-group">
        <view class="settings-item" @click="checkUpdate">
          <text class="item-text">版本更新</text>
          <view class="item-right">
            <text class="item-value">已是最新版</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
        <view class="settings-item" @click="handleAction('功能介绍')">
          <text class="item-text">功能介绍</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
      </view>
    </view>

    <view class="copyright">
      <text>Copyright © 2024-2025</text>
      <text>身心健康管理平台 版权所有</text>
    </view>
  </view>
</template>

<script setup>
const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.redirectTo({ url: '/pages/mobile/settings/index' });
  }
};

const checkUpdate = () => {
  uni.showLoading({ title: '检查更新中...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '当前已是最新版本', icon: 'none' });
  }, 1000);
};

const handleAction = (action) => {
  uni.showToast({ title: `${action}页面开发中`, icon: 'none' });
};
</script>

<style scoped>
@import './common.scss';

.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.logo-box {
  width: 80px;
  height: 80px;
  background: #ffffff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 16px;
}

.logo-icon {
  width: 60px;
  height: 60px;
}

.app-name {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.app-version {
  font-size: 14px;
  color: #94a3b8;
}

.copyright {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.8;
}
</style>