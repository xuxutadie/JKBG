<template>
  <view class="mobile-page login-page">
    <view class="login-header">
      <view class="logo-box">
        <!-- Shield icon -->
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </view>
      <text class="login-title">身心健康平台</text>
      <text class="login-subtitle">关注身心 · 享受健康生活</text>
    </view>
    
    <view class="login-form">
      <view class="input-group">
        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <input type="text" placeholder="请输入手机号" placeholder-class="input-placeholder" class="input-control" />
      </view>
      
      <view class="input-group">
        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <input type="password" placeholder="请输入密码" placeholder-class="input-placeholder" class="input-control" />
      </view>
      
      <view class="agreement-box">
        <radio color="#fff" style="transform:scale(0.7)" />
        <text class="agreement-text">我已阅读并同意<text class="link">《用户协议》</text>和<text class="link">《隐私政策》</text></text>
      </view>
      
      <button class="login-btn" @click="handleLogin">登录</button>
      <view class="login-link">验证码登录</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const handleLogin = () => {
  uni.switchTab({
    url: '/pages/mobile/home/index'
  });
};
</script>

<style scoped>
.mobile-page {
  min-height: 100vh;
  box-sizing: border-box;
}

.login-page {
  background: linear-gradient(180deg, #99c0ff 0%, #b2cfff 30%, #e0ecff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 32px 0;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
}

.logo-box {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #ffffff 0%, #e8f0fe 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(85, 145, 255, 0.2);
  margin-bottom: 16px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  color: #4a8cff;
}

.login-title {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.login-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
}

.login-form {
  width: 100%;
}

.input-group {
  width: 100%;
  height: 52px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.input-icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
  margin-right: 12px;
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

.agreement-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.agreement-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.link {
  color: #ffffff;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 52px;
  background: #ffffff;
  color: #4a8cff;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 16px rgba(74, 140, 255, 0.2);
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #ffffff;
}
</style>