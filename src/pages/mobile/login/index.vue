<template>
  <view class="mobile-page login-page">
    <view class="login-header">
      <view class="logo-box">
        <!-- 还原设计图中的莲花/花瓣Logo -->
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C12 22 7.5 16.5 7.5 10.5C7.5 6.5 10.5 4 12 2C13.5 4 16.5 6.5 16.5 10.5C16.5 16.5 12 22 12 22Z" fill="url(#paint0_linear)" opacity="0.9"/>
          <path d="M12 22C12 22 5 18 3 11.5C1 5 7 4 7 4C7 4 9 8 12 11.5" fill="url(#paint1_linear)" opacity="0.7"/>
          <path d="M12 22C12 22 19 18 21 11.5C23 5 17 4 17 4C17 4 15 8 12 11.5" fill="url(#paint2_linear)" opacity="0.7"/>
          <defs>
            <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="1" stop-color="#e0e8ff"/>
            </linearGradient>
            <linearGradient id="paint1_linear" x1="3" y1="4" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="1" stop-color="#d0ddff"/>
            </linearGradient>
            <linearGradient id="paint2_linear" x1="21" y1="4" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="1" stop-color="#d0ddff"/>
            </linearGradient>
          </defs>
        </svg>
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
    
    <!-- 底部装饰倒影 -->
    <view class="bottom-decoration">
      <text class="deco-text">身心健康平台</text>
      <text class="deco-sub">关注身心 · 享受健康生活</text>
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

/* 还原设计图：深蓝紫到浅蓝的柔和渐变 */
.login-page {
  background: linear-gradient(180deg, #7A88FF 0%, #9DA7FF 40%, #E8F0FE 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 36px 0;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
}

.logo-box {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(122, 136, 255, 0.3);
  margin-bottom: 20px;
}

.logo-icon {
  width: 50px;
  height: 50px;
}

.login-title {
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.login-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1px;
}

.login-form {
  width: 100%;
  z-index: 10;
}

.input-group {
  width: 100%;
  height: 54px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border-radius: 27px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.input-icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
  margin-right: 12px;
  opacity: 0.9;
}

.input-control {
  flex: 1;
  height: 100%;
  font-size: 15px;
  color: #ffffff;
}

.input-placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.get-code-text {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
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
  color: rgba(255, 255, 255, 0.8);
}

.link {
  color: #ffffff;
}

/* 还原设计图：渐变紫色按钮，白色文字 */
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
}
.login-btn::after {
  border: none;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 底部倒影效果 */
.bottom-decoration {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.15;
  transform: scaleY(-1);
}

.deco-text {
  font-size: 24px;
  font-weight: bold;
  color: #6272ff;
  margin-bottom: 8px;
}

.deco-sub {
  font-size: 12px;
  color: #6272ff;
}
</style>