<template>
  <view class="mobile-page settings-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="nav-title">设置</text>
      <view class="placeholder"></view>
    </view>

    <view class="settings-list">
      <view class="settings-group">
        <view class="settings-item" @click="handleItemClick('/pages/mobile/settings/profile')">
          <text class="item-text">个人信息</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
        <view class="settings-item" @click="handleItemClick('/pages/mobile/settings/security')">
          <text class="item-text">账号与安全</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item">
          <text class="item-text">消息通知</text>
          <switch checked color="#5a67d8" style="transform:scale(0.8)" />
        </view>
        <view class="settings-item" @click="handleItemClick('/pages/mobile/settings/privacy')">
          <text class="item-text">隐私设置</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
        <view class="settings-item" @click="handleItemClick('/pages/mobile/settings/general')">
          <text class="item-text">通用</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item" @click="clearCache">
          <text class="item-text">清除缓存</text>
          <text class="item-value">12.5 MB</text>
        </view>
        <view class="settings-item" @click="handleItemClick('/pages/mobile/settings/about')">
          <text class="item-text">关于我们</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
      </view>
    </view>

    <view class="logout-btn-wrap">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.switchTab({ url: '/pages/mobile/profile/index' });
  }
};

const handleItemClick = (path) => {
  if (path.startsWith('/')) {
    uni.navigateTo({ url: path });
  } else {
    uni.showToast({ title: `${path}功能开发中`, icon: 'none' });
  }
};

const clearCache = () => {
  uni.showLoading({ title: '清理中...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '缓存已清理', icon: 'success' });
  }, 800);
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('current_role');
        uni.removeStorageSync('current_user');
        uni.reLaunch({ url: '/pages/mobile/login/index' });
      }
    }
  });
};
</script>

<style scoped>
@import './common.scss';

.logout-btn-wrap {
  padding: 24px 20px;
}

.logout-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(16px);
  color: #ef4444;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.05);
}

.logout-btn::after {
  border: none;
}

.logout-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>