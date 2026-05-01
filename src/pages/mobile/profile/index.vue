<template>
  <view class="mobile-page profile-page">
    <view class="nav-header">
      <text class="nav-title">我的</text>
      <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    </view>

    <view class="profile-card">
      <image class="avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" mode="aspectFill"></image>
      <view class="user-info">
        <text class="user-name">{{ currentUser.name || '用户' }}</text>
        <text class="user-bio">关注身心健康每一天</text>
      </view>
      <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </view>

    <view class="menu-list">
      <view class="menu-item" v-for="(item, index) in menuItems" :key="index">
        <view class="menu-icon-box">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.iconPath" />
          </svg>
        </view>
        <text class="menu-text">{{ item.label }}</text>
        <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </view>
    </view>

    <view class="logout-btn-wrap">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const currentUser = ref({
  name: '张小明'
});

onShow(() => {
  const user = uni.getStorageSync('current_user');
  if (user) {
    currentUser.value = user;
  }
});

const menuItems = [
  { label: '健康数据', iconPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6' },
  { label: '我的报告', iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
  { label: '我的方案', iconPath: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { label: '我的订单', iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.29 5.17c-.22.5.21 1.08.73 1.08h13.1M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  { label: '设置', iconPath: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' },
  { label: '帮助中心', iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01' }
];

const handleLogout = () => {
  uni.reLaunch({
    url: '/pages/mobile/login/index'
  });
};
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #c7d2fe 100%);
  padding-bottom: 80px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.nav-header {
  height: 88px;
  background: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 24px 14px;
  margin-bottom: 16px;
}

.nav-title {
  font-size: 20px;
  font-weight: 800;
  color: #1a233a;
  flex: 1;
  text-align: center;
  padding-left: 24px; /* Offset the icon width for centering */
}

.header-icon {
  width: 24px;
  height: 24px;
  color: #1a233a;
}

.profile-card {
  margin: 0 20px 24px;
  padding: 24px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 40px rgba(31, 38, 135, 0.06), 0 2px 10px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.profile-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: #e2e8f0;
  margin-right: 16px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 20px;
  font-weight: 800;
  color: #1a233a;
  margin-bottom: 4px;
}

.user-bio {
  font-size: 13px;
  color: #64748b;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

.menu-list {
  margin: 0 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 8px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 40px rgba(31, 38, 135, 0.06), 0 2px 10px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.6);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
}

.menu-item:active {
  background-color: rgba(255, 255, 255, 0.3);
}

.menu-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.menu-icon {
  width: 16px;
  height: 16px;
  color: #4a8cff;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #1a233a;
}

.logout-btn-wrap {
  margin: 30px 20px 40px;
}

.logout-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(20px);
  color: #f43f5e;
  font-size: 16px;
  font-weight: 600;
  height: 54px;
  border-radius: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 40px rgba(31, 38, 135, 0.06), 0 2px 10px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.6);
  border: none;
  transition: all 0.2s ease;
}
.logout-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background: rgba(255, 241, 242, 0.8);
}
.logout-btn::after {
  border: none;
}
</style>