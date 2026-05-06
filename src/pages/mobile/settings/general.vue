<template>
  <view class="mobile-page sub-settings-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="nav-title">通用</text>
      <view class="placeholder"></view>
    </view>

    <view class="settings-list">
      <view class="settings-group">
        <view class="settings-item" @click="handleAction('深色模式')">
          <text class="item-text">深色模式</text>
          <view class="item-right">
            <text class="item-value">跟随系统</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
        <view class="settings-item" @click="handleAction('字体大小')">
          <text class="item-text">字体大小</text>
          <view class="item-right">
            <text class="item-value">标准</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
        <view class="settings-item" @click="handleAction('多语言')">
          <text class="item-text">多语言</text>
          <view class="item-right">
            <text class="item-value">简体中文</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
      </view>
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

const handleAction = (action) => {
  uni.showToast({ title: `${action}功能开发中`, icon: 'none' });
};
</script>

<style scoped>
@import './common.scss';
</style>