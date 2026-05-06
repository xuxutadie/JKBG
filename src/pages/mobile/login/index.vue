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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <input type="text" v-model="phone" placeholder="请输入手机号/姓名" placeholder-class="input-placeholder" class="input-control" />
        </view>
        
        <view class="input-group">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <input type="password" v-model="password" placeholder="请输入验证码/密码" placeholder-class="input-placeholder" class="input-control" />
          <text class="get-code-text">获取</text>
        </view>
        
        <view class="agreement-box">
          <radio color="#8192fb" style="transform:scale(0.65)" :checked="true" />
          <text class="agreement-text">我已阅读并同意<text class="link">《用户协议》</text>和<text class="link">《隐私政策》</text></text>
        </view>
        
        <button class="login-btn" @click="handleLogin">登录</button>
        <view class="login-link">密码登录</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { listPatients } from '@/utils/patientApi';

const phone = ref('');
const password = ref('');

const handleLogin = async () => {
  if (!phone.value) {
    return uni.showToast({ title: '请输入账号', icon: 'none' });
  }

  // 1. Check if it's an admin account
  let adminAccounts = uni.getStorageSync('admin_accounts');
  if (!adminAccounts || !Array.isArray(adminAccounts) || adminAccounts.length === 0) {
    adminAccounts = [{ username: 'admin', password: '123' }];
    uni.setStorageSync('admin_accounts', adminAccounts);
  }

  const isAdmin = adminAccounts.find(a => a.username === phone.value && a.password === password.value);
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
    // Fetch patients from the backend
    const patients = await listPatients();
    if (patients && patients.length > 0) {
      // For demo purposes, if the user enters a phone number that matches a patient's name or phone, we log them in.
      // Otherwise, we just pick the first patient as the logged-in user.
      let currentUser = patients[0];
      if (phone.value) {
        const matched = patients.find(p => p.phone === phone.value || p.name === phone.value);
        if (matched) currentUser = matched;
      }
      uni.setStorageSync('current_role', 'user');
      uni.setStorageSync('current_user', currentUser);
    } else {
      // If no patients exist, we create a mock one or clear it
      uni.setStorageSync('current_role', 'user');
      uni.setStorageSync('current_user', {
        name: '测试用户',
        score: 100,
        gender: '男',
        age: 30
      });
    }
    uni.hideLoading();
    uni.switchTab({
      url: '/pages/mobile/home/index'
    });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: '登录失败', icon: 'none' });
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

.get-code-text {
  font-size: 14px;
  color: #5a67d8;
  font-weight: 600;
  padding-left: 16px;
  border-left: 1px solid #cbd5e1;
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