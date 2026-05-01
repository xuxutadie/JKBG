<template>
  <view class="mobile-page">
    <view class="nav-header">健康数据</view>
    <view class="content">
      <view class="patient-card" v-if="currentUser">
        <view class="card-header">
          <view class="avatar">
            <image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" mode="aspectFill" />
          </view>
          <view class="user-info">
            <text class="name">{{ currentUser.name || '未知客户' }}</text>
            <text class="tags">
              {{ currentUser.age || '--' }}岁 | {{ currentUser.gender || '--' }} | 档案编号: {{ currentUser.id || '--' }}
            </text>
          </view>
        </view>
      </view>

      <view class="modules-grid" v-if="currentUser">
        <view class="module-item" @click="goTo('/pages/mobile/health/sleep')">
          <view class="module-icon bg-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          </view>
          <text class="module-name">睡眠情况</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/autonomic')">
          <view class="module-icon bg-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12h-4l-3 8-4-16-3 8H3" /></svg>
          </view>
          <text class="module-name">自主神经</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/body')">
          <view class="module-icon bg-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </view>
          <text class="module-name">人体成分</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/exercise')">
          <view class="module-icon bg-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </view>
          <text class="module-name">运动建议</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/advice')">
          <view class="module-icon bg-teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </view>
          <text class="module-name">健康建议</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/diet')">
          <view class="module-icon bg-yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </view>
          <text class="module-name">饮食指南</text>
        </view>
      </view>

      <view class="empty-state" v-else>
        <text>未获取到客户数据，请先登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const currentUser = ref(null);

onShow(() => {
  const user = uni.getStorageSync('current_user');
  if (user) {
    currentUser.value = user;
  }
});

const goTo = (url) => {
  uni.navigateTo({ url });
};
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  background-color: #f7f9fd;
  padding-bottom: 80px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.nav-header {
  height: 88px;
  background: #fff;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 14px;
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
.content {
  padding: 20px;
}

.patient-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: #e2e8f0;
  margin-right: 14px;
  overflow: hidden;
}

.avatar image {
  width: 100%;
  height: 100%;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 4px;
}

.tags {
  font-size: 12px;
  color: #94a3b8;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.module-item {
  background: #fff;
  border-radius: 16px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.module-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.icon-svg {
  width: 24px;
  height: 24px;
  color: #fff;
}

.bg-purple { background: linear-gradient(135deg, #9B8BFF 0%, #B8AFFF 100%); }
.bg-blue { background: linear-gradient(135deg, #6272FF 0%, #8A96FF 100%); }
.bg-green { background: linear-gradient(135deg, #34D399 0%, #6EE7B7 100%); }
.bg-orange { background: linear-gradient(135deg, #FBBF24 0%, #FCD34D 100%); }
.bg-teal { background: linear-gradient(135deg, #2DD4BF 0%, #6EE7B7 100%); }
.bg-yellow { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }

.module-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a233a;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #94a3b8;
  font-size: 15px;
}
</style>