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
        
        <view class="card-body">
          <view class="data-item">
            <text class="label">建档日期</text>
            <text class="value">{{ formatDate(currentUser.createdAt) }}</text>
          </view>
          <view class="data-item">
            <text class="label">健康评分</text>
            <text class="value score" :class="getScoreClass(currentUser.score)">{{ currentUser.score !== null ? currentUser.score : '--' }}</text>
          </view>
          <view class="data-item">
            <text class="label">报告状态</text>
            <text class="value status">{{ currentUser.statusText || '未知' }}</text>
          </view>
          <view class="data-item" v-if="currentUser.sourceLabels && currentUser.sourceLabels.length">
            <text class="label">数据来源</text>
            <view class="tags-list">
              <text class="tag" v-for="(tag, idx) in currentUser.sourceLabels" :key="idx">{{ tag }}</text>
            </view>
          </view>
        </view>

        <!-- Temporary raw data view for debugging/designing -->
        <view class="raw-data-section">
          <view class="raw-title">原始报告数据 (ReportData)</view>
          <scroll-view scroll-y class="raw-content">
            <text class="json-text">{{ JSON.stringify(currentUser.reportData, null, 2) }}</text>
          </scroll-view>
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

const formatDate = (isoString) => {
  if (!isoString) return '--';
  try {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } catch (e) {
    return '--';
  }
};

const getScoreClass = (score) => {
  if (score === null || score === undefined) return '';
  if (score >= 80) return 'text-green';
  if (score >= 60) return 'text-orange';
  return 'text-red';
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
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
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

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.label {
  color: #64748b;
}

.value {
  color: #1e293b;
  font-weight: 500;
}

.value.score {
  font-size: 16px;
  font-weight: 700;
}

.text-green { color: #10b981; }
.text-orange { color: #f59e0b; }
.text-red { color: #ef4444; }

.status {
  background: #f0fdf4;
  color: #10b981;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tags-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tag {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.raw-data-section {
  margin-top: 20px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border: 1px dashed #e2e8f0;
}

.raw-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.raw-content {
  height: 200px;
  background: #1e293b;
  border-radius: 6px;
  padding: 10px;
}

.json-text {
  font-family: monospace;
  font-size: 11px;
  color: #a7f3d0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #94a3b8;
  font-size: 15px;
}
</style>