<template>
  <view class="mobile-page help-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="nav-title">帮助中心</text>
      <view class="placeholder"></view>
    </view>

    <view class="search-wrap">
      <view class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="搜索您的问题" placeholder-class="search-placeholder" />
      </view>
    </view>

    <view class="faq-section">
      <text class="section-title">常见问题</text>
      
      <view class="faq-list">
        <view class="faq-item" v-for="(item, index) in faqList" :key="index" @click="toggleFaq(index)">
          <view class="faq-question">
            <text class="q-text">{{ item.q }}</text>
            <svg class="arrow-icon" :class="{ 'is-open': item.isOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </view>
          <view class="faq-answer" v-if="item.isOpen">
            <text class="a-text">{{ item.a }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="contact-section">
      <view class="contact-card">
        <view class="contact-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </view>
        <view class="contact-info">
          <text class="contact-title">在线客服</text>
          <text class="contact-desc">工作日 9:00 - 18:00</text>
        </view>
        <button class="contact-btn" @click="handleContact">咨询</button>
      </view>
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

const faqList = ref([
  {
    q: '如何查看我的健康报告？',
    a: '您可以在底部的“我的”页面中，点击“我的报告”即可查看基于您最新体检数据生成的智能健康报告。',
    isOpen: false
  },
  {
    q: '健康评分是如何计算的？',
    a: '健康评分是由AI系统综合您的InBody体成分数据、睡眠监测数据、压力神经数据以及生化指标等，进行多维度联动分析后得出的综合分数。',
    isOpen: false
  },
  {
    q: '我的数据安全吗？',
    a: '我们非常重视您的隐私。您的所有健康数据均经过加密传输和存储，除为您提供健康分析外，不会用于任何其他商业用途。',
    isOpen: false
  },
  {
    q: '如何更新我的健康档案？',
    a: '当您在体检中心完成新的检测（如InBody、睡眠监测等）后，数据会自动同步到您的云端档案中，您的报告和评分也会随之更新。',
    isOpen: false
  }
]);

const toggleFaq = (index) => {
  faqList.value[index].isOpen = !faqList.value[index].isOpen;
};

const handleContact = () => {
  uni.showToast({ title: '正在接入人工客服...', icon: 'none' });
};
</script>

<style scoped>
@import '../settings/common.scss';

.search-wrap {
  padding: 0 20px 20px;
}

.search-box {
  height: 44px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 100%);
  backdrop-filter: blur(16px);
  border-radius: 22px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.7);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.03), inset 0 2px 4px rgba(255, 255, 255, 0.4);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
  margin-right: 8px;
}

.search-box input {
  flex: 1;
  font-size: 15px;
  color: #1a233a;
}

.search-placeholder {
  color: #64748b;
}

.faq-section {
  padding: 0 20px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 12px;
  display: block;
}

.faq-list {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 100%);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.7);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.03), inset 0 2px 4px rgba(255, 255, 255, 0.4);
}

.faq-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.q-text {
  font-size: 15px;
  font-weight: 600;
  color: #1a233a;
  flex: 1;
  padding-right: 16px;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: #94a3b8;
  transition: transform 0.3s;
}

.arrow-icon.is-open {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 20px 16px;
}

.a-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

.contact-section {
  padding: 0 20px;
}

.contact-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.05);
}

.contact-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.contact-icon-box svg {
  width: 24px;
  height: 24px;
  color: #5a67d8;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contact-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.contact-desc {
  font-size: 12px;
  color: #94a3b8;
}

.contact-btn {
  background: #5a67d8;
  color: #ffffff;
  font-size: 14px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  margin: 0;
  border: none;
}

.contact-btn::after {
  border: none;
}

.contact-btn:active {
  opacity: 0.8;
}
</style>