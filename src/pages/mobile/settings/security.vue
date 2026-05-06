<template>
  <view class="mobile-page sub-settings-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="nav-title">账号与安全</text>
      <view class="placeholder"></view>
    </view>

    <view class="settings-list">
      <view class="settings-group">
        <view class="settings-item" @click="handleAction('修改密码')">
          <text class="item-text">修改密码</text>
          <view class="item-right">
            <text class="item-value">已设置</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
        <view class="settings-item" @click="handleAction('手机号绑定')">
          <text class="item-text">手机号绑定</text>
          <view class="item-right">
            <text class="item-value">138****8888</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
        <view class="settings-item" @click="handleAction('微信绑定')">
          <text class="item-text">微信绑定</text>
          <view class="item-right">
            <text class="item-value">未绑定</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item" @click="handleAction('设备管理')">
          <text class="item-text">设备管理</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item danger-item" @click="handleDeleteAccount">
          <text class="item-text danger-text">注销账号</text>
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
  uni.showToast({ title: `${action}功能开发中`, icon: 'none' });
};

const handleDeleteAccount = () => {
  uni.showModal({
    title: '危险操作',
    content: '注销后您的所有健康档案、检测数据将被永久删除且无法恢复。是否继续？',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '请联系客服进行注销审核', icon: 'none', duration: 2000 });
      }
    }
  });
};
</script>

<style scoped>
@import './common.scss';

.danger-text {
  color: #ef4444 !important;
}
</style>