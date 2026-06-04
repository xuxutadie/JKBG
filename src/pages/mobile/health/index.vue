<template>
  <view class="mobile-page">
    <!-- 动态背景层 -->
    <view class="bg-animation">
      <view class="blob blob-1"></view>
      <view class="blob blob-2"></view>
      <view class="blob blob-3"></view>
    </view>

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
          <view class="module-image-wrap">
            <image src="@/static/睡眠情况.png" mode="aspectFit" class="module-img" />
          </view>
          <text class="module-name">睡眠情况</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/autonomic')">
          <view class="module-image-wrap">
            <image src="@/static/自主神经.png" mode="aspectFit" class="module-img" />
          </view>
          <text class="module-name">自主神经</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/body')">
          <view class="module-image-wrap">
            <image src="@/static/人体成分.png" mode="aspectFit" class="module-img" />
          </view>
          <text class="module-name">人体成分</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/exercise')">
          <view class="module-image-wrap">
            <image src="@/static/运动建议.png" mode="aspectFit" class="module-img" />
          </view>
          <text class="module-name">运动建议</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/advice')">
          <view class="module-image-wrap">
            <image src="@/static/健康建议.png" mode="aspectFit" class="module-img" />
          </view>
          <text class="module-name">健康建议</text>
        </view>

        <view class="module-item" @click="goTo('/pages/mobile/health/diet')">
          <view class="module-image-wrap">
            <image src="@/static/饮食指南.png" mode="aspectFit" class="module-img" />
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
import { getPatientDetail } from '@/utils/patientApi';

const shouldSkipImmediateRefresh = () => {
  const cooldownUntil = Number(uni.getStorageSync('user_refresh_cooldown_until') || 0);
  return cooldownUntil && Date.now() < cooldownUntil;
};

const currentUser = ref(null);

onShow(async () => {
  const user = uni.getStorageSync('current_user');
  if (user) {
    currentUser.value = user;
    if (shouldSkipImmediateRefresh()) {
      return;
    }
    if (user.id) {
      try {
        const latestUser = await getPatientDetail(user.id);
        if (latestUser) {
          currentUser.value = latestUser;
          uni.setStorageSync('current_user', latestUser);
        }
      } catch (err) {}
    }
  }
});

const goTo = (url) => {
  uni.navigateTo({ url });
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
  justify-content: center;
  padding-bottom: 14px;
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
}
.content {
  padding: 20px;
}

.patient-card {
  background: linear-gradient(135deg, #ffffff 0%, #f4f6f9 100%);
  border-radius: 20px;
  padding: 20px;
  border: 2px solid #ffffff;
  box-shadow: 0 10px 24px rgba(112, 128, 150, 0.1), inset 0 4px 10px rgba(255, 255, 255, 1), inset 0 -4px 10px rgba(220, 226, 236, 0.5);
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.7);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.03), inset 0 2px 4px rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.module-item:active {
  transform: scale(0.96);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.25) 100%);
  box-shadow: 0 2px 8px rgba(31, 38, 135, 0.02), inset 0 2px 4px rgba(255, 255, 255, 0.5);
}

.module-image-wrap {
  width: 100px;
  height: 100px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-img {
  width: 100%;
  height: 100%;
}

.module-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a233a;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #64748b;
  font-size: 15px;
}
</style>
