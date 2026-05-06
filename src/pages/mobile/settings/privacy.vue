<template>
  <view class="mobile-page sub-settings-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="nav-title">隐私设置</text>
      <view class="placeholder"></view>
    </view>

    <view class="settings-list">
      <view class="settings-group">
        <view class="settings-item">
          <text class="item-text">允许系统收集健康数据</text>
          <switch checked color="#5a67d8" style="transform:scale(0.8)" />
        </view>
        <view class="settings-item">
          <text class="item-text">允许机构医师查看档案</text>
          <switch checked color="#5a67d8" style="transform:scale(0.8)" />
        </view>
        <view class="settings-item">
          <text class="item-text">参与AI评估优化计划</text>
          <switch checked color="#5a67d8" style="transform:scale(0.8)" />
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item" @click="handleAction('系统权限管理')">
          <text class="item-text">系统权限管理</text>
          <view class="item-right">
            <text class="item-value">相机/存储等</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item" @click="handleAction('隐私政策')">
          <text class="item-text">隐私政策</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
        <view class="settings-item" @click="handleAction('用户协议')">
          <text class="item-text">用户协议</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
        <view class="settings-item" @click="handleAction('个人信息收集清单')">
          <text class="item-text">个人信息收集清单</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
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
  uni.showToast({ title: `${action}文档准备中`, icon: 'none' });
};
</script>

<style scoped>
@import './common.scss';
</style>