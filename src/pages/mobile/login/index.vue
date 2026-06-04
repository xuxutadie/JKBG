<template>
  <view class="mobile-page login-page">
    <!-- 动态背景层 -->
    <view class="bg-animation">
      <view class="blob blob-1"></view>
      <view class="blob blob-2"></view>
      <view class="blob blob-3"></view>
    </view>

    <view class="login-card-wrapper">
      <view class="login-header">
        <view class="logo-box">
          <image class="logo-icon" src="@/static/登录页.png" mode="aspectFit"></image>
        </view>
        <text class="login-title">身心健康平台</text>
        <text class="login-subtitle">关注身心 · 享受健康生活</text>
      </view>
      
      <view class="login-form">
        <view class="input-group">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 14c2.761 0 5 2.239 5 5v1H3v-1c0-2.761 2.239-5 5-5h8z" />
            <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <input type="text" v-model="name" placeholder="请输入姓名" placeholder-class="input-placeholder" class="input-control" />
        </view>
        
        <view class="input-group">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <input type="password" v-model="reportDate" placeholder="请输入报告生成日期" placeholder-class="input-placeholder" class="input-control" />
        </view>
        
        <view class="agreement-box">
          <radio color="#8192fb" style="transform:scale(0.65)" :checked="true" />
          <text class="agreement-text">我已阅读并同意<text class="link">《用户协议》</text>和<text class="link">《隐私政策》</text></text>
        </view>
        
        <button class="login-btn" @click="handleLogin">登录</button>
        <view class="login-link">输入姓名和报告生成日期即可查看对应报告</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { listPatients } from '@/utils/patientApi';

const name = ref('');
const reportDate = ref('');

const normalizeName = (value) => String(value || '').trim().replace(/\s+/g, '').toLowerCase();
const normalizeDateText = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';
  const digits = text.replace(/\D/g, '');
  if (digits.length === 8) return digits;
  return text
    .replace(/[年/.]/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
};

const getPatientReportDate = (patient) => {
  const sources = ['profile', 'sleepProfile', 'inbodyProfile', 'eyeProfile', 'sleepMonitorInfo', 'sleepMonitorParams'];
  const labels = ['报告生成日期', '报告时间', '测试日期', '开始时间', '结束时间'];
  const reportData = patient?.reportData || patient?.latestReport?.reportData || {};

  for (const source of sources) {
    const items = Array.isArray(reportData?.[source]) ? reportData[source] : [];
    for (const item of items) {
      const label = String(item?.label || '').trim();
      if (labels.includes(label) && item?.value) {
        return normalizeDateText(item.value);
      }
    }
  }

  return normalizeDateText(patient?.date || patient?.reportDate || patient?.latestReport?.reportDate);
};

const handleLogin = async () => {
  if (!name.value) {
    return uni.showToast({ title: '请输入姓名', icon: 'none' });
  }

  if (!reportDate.value) {
    return uni.showToast({ title: '请输入报告生成日期', icon: 'none' });
  }

  if (!normalizeDateText(reportDate.value)) {
    return uni.showToast({ title: '请输入正确的报告生成日期', icon: 'none' });
  }

  // 1. Check if it's an admin account
  let adminAccounts = uni.getStorageSync('admin_accounts');
  if (!adminAccounts || !Array.isArray(adminAccounts) || adminAccounts.length === 0) {
    adminAccounts = [{ username: 'admin', password: '123' }];
    uni.setStorageSync('admin_accounts', adminAccounts);
  }

  const isAdmin = adminAccounts.find(a => a.username === name.value && a.password === reportDate.value);
  if (isAdmin) {
    uni.showLoading({ title: '管理员登录中...' });
    uni.setStorageSync('current_role', 'admin');
    uni.setStorageSync('current_user', { name: isAdmin.username, role: 'admin' });
    setTimeout(() => {
      uni.hideLoading();
      uni.redirectTo({ url: '/pages/index/index' });
    }, 500);
    return;
  }

  // 2. Mobile User Login
  try {
    uni.showLoading({ title: '登录中...' });
    const patients = await listPatients();

    if (!patients || !patients.length) {
      throw new Error('暂无可查看的健康报告');
    }

    const inputName = normalizeName(name.value);
    const inputReportDate = normalizeDateText(reportDate.value);
    const matched = patients.find(patient => {
      return normalizeName(patient?.name) === inputName && getPatientReportDate(patient) === inputReportDate;
    });

    if (!matched) {
      throw new Error('未找到对应姓名和报告生成日期的报告');
    }

    uni.setStorageSync('current_role', 'user');
    uni.setStorageSync('current_user', matched);
    uni.hideLoading();
    uni.switchTab({
      url: '/pages/mobile/home/index'
    });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: error?.message || '登录失败', icon: 'none' });
  }
};
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* 统一轻盈浅色背景 */
.login-page {
  background: #eff6ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.login-card-wrapper {
  width: 100%;
  max-width: 480px;
  padding: 40px 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 30px;
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 60px rgba(31, 38, 135, 0.08), 0 2px 10px rgba(0, 0, 0, 0.02), inset 0 2px 4px rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  position: relative; /* 确保 z-index 生效 */
  z-index: 10;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.logo-box {
  width: 130px;
  height: 130px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 50%;
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(31, 38, 135, 0.06), inset 0 2px 6px rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.logo-icon {
  width: 130px;
  height: 130px;
}

.login-title {
  font-size: 26px;
  font-weight: 800;
  color: #1a233a;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.login-subtitle {
  font-size: 14px;
  color: #64748b;
  letter-spacing: 1px;
}

.login-form {
  width: 100%;
  z-index: 10;
}

.input-group {
  width: 100%;
  height: 54px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 27px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 20px;
  box-sizing: border-box;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(31, 38, 135, 0.03);
}

.input-icon {
  width: 20px;
  height: 20px;
  color: #64748b;
  margin-right: 12px;
}

.input-control {
  flex: 1;
  height: 100%;
  font-size: 15px;
  color: #1a233a;
}

.input-placeholder {
  color: #94a3b8;
}

.agreement-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 30px;
  padding-left: 10px;
}

.agreement-text {
  font-size: 12px;
  color: #64748b;
}

.link {
  color: #5a67d8;
}

.login-btn {
  width: 100%;
  height: 54px;
  background: linear-gradient(90deg, #8192fb 0%, #6272ff 100%);
  color: #ffffff;
  border-radius: 27px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 20px rgba(98, 114, 255, 0.3);
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.login-btn:active {
  transform: scale(0.96);
  box-shadow: 0 4px 10px rgba(98, 114, 255, 0.2);
  opacity: 0.9;
}
.login-btn::after {
  border: none;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #64748b;
  padding: 8px;
  margin-top: 10px;
}
.login-link:active {
  opacity: 0.7;
}

/* PC端额外间距调整 */
@media (min-width: 768px) {
  .login-card-wrapper {
    padding: 50px 40px;
  }
}
</style>
