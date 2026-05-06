<template>
  <view class="mobile-page sub-settings-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </view>
      <text class="nav-title">个人信息</text>
      <view class="placeholder"></view>
    </view>

    <view class="settings-list">
      <view class="settings-group">
        <view class="settings-item avatar-item" @click="changeAvatar">
          <text class="item-text">头像</text>
          <view class="item-right">
            <image class="avatar" :src="userInfo.avatar || defaultAvatar" mode="aspectFill"></image>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
        <view class="settings-item" @click="openEditModal('name')">
          <text class="item-text">昵称</text>
          <view class="item-right">
            <text class="item-value">{{ userInfo.name }}</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
        <view class="settings-item" @click="openEditModal('gender')">
          <text class="item-text">性别</text>
          <view class="item-right">
            <text class="item-value">{{ userInfo.gender }}</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
        <view class="settings-item" @click="openEditModal('age')">
          <text class="item-text">年龄</text>
          <view class="item-right">
            <text class="item-value">{{ userInfo.age }}岁</text>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </view>
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item">
          <text class="item-text">档案编号</text>
          <text class="item-value">{{ userInfo.id || '暂无' }}</text>
        </view>
        <view class="settings-item">
          <text class="item-text">注册时间</text>
          <text class="item-value">2024-01-01</text>
        </view>
      </view>
    </view>

    <!-- Edit Modal -->
    <view class="modal-mask" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">修改{{ currentEditLabel }}</text>
        
        <input 
          v-if="currentEditField === 'name'"
          class="modal-input" 
          v-model="editValue" 
          type="text" 
          placeholder="请输入昵称" 
        />
        
        <input 
          v-if="currentEditField === 'age'"
          class="modal-input" 
          v-model="editValue" 
          type="number" 
          placeholder="请输入年龄" 
        />

        <view class="gender-options" v-if="currentEditField === 'gender'">
          <view class="gender-btn" :class="{'active': editValue === '男'}" @click="editValue = '男'">男</view>
          <view class="gender-btn" :class="{'active': editValue === '女'}" @click="editValue = '女'">女</view>
        </view>

        <view class="modal-actions">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="saveEdit">保存</button>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { updatePatientRecord } from '@/utils/patientApi';

const userInfo = ref({
  name: '张小明',
  gender: '男',
  age: 30,
  id: '',
  avatar: ''
});

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

onShow(() => {
  const user = uni.getStorageSync('current_user');
  if (user) {
    userInfo.value = {
      ...user,
      name: user.name || '张小明',
      gender: user.gender || '未知',
      age: user.age || 30,
      id: user.id || '',
      avatar: user.avatar || ''
    };
  }
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.redirectTo({ url: '/pages/mobile/settings/index' });
  }
};

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      uni.showLoading({ title: '正在上传...' });
      
      // 模拟上传延迟
      setTimeout(async () => {
        userInfo.value.avatar = tempFilePath;
        
        // 更新本地缓存
        const user = uni.getStorageSync('current_user') || {};
        const updatedUser = { ...user, avatar: tempFilePath };
        uni.setStorageSync('current_user', updatedUser);
        
        // 同步到 API（如果有有效 ID）
        if (updatedUser.id) {
          try {
            await updatePatientRecord(updatedUser.id, { avatar: tempFilePath });
          } catch (e) {
            console.error('头像同步服务器失败', e);
          }
        }
        
        uni.hideLoading();
        uni.showToast({ title: '头像更换成功', icon: 'success' });
      }, 800);
    },
    fail: (err) => {
      console.log('选择图片失败', err);
    }
  });
};

const showModal = ref(false);
const currentEditField = ref('');
const currentEditLabel = ref('');
const editValue = ref('');

const fieldLabels = {
  name: '昵称',
  gender: '性别',
  age: '年龄'
};

const openEditModal = (field) => {
  currentEditField.value = field;
  currentEditLabel.value = fieldLabels[field];
  editValue.value = userInfo.value[field];
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveEdit = async () => {
  if (!editValue.value && currentEditField.value !== 'gender') {
    return uni.showToast({ title: '内容不能为空', icon: 'none' });
  }

  uni.showLoading({ title: '保存中...' });
  const newValue = currentEditField.value === 'age' ? parseInt(editValue.value) : editValue.value;
  
  userInfo.value[currentEditField.value] = newValue;
  
  // Update local storage
  const user = uni.getStorageSync('current_user') || {};
  const updatedUser = { ...user, ...userInfo.value };
  uni.setStorageSync('current_user', updatedUser);

  // Sync to API if valid ID exists
  if (updatedUser.id) {
    try {
      await updatePatientRecord(updatedUser.id, { [currentEditField.value]: newValue });
    } catch (e) {
      console.error('Failed to sync update to server', e);
    }
  }

  uni.hideLoading();
  uni.showToast({ title: '修改成功', icon: 'success' });
  closeModal();
};
</script>

<style scoped>
@import './common.scss';

.avatar-item {
  padding: 12px 20px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #f1f5f9;
  margin-right: 8px;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 80%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a233a;
  margin-bottom: 20px;
  text-align: center;
  display: block;
}

.modal-input {
  width: 100%;
  height: 44px;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 15px;
  color: #1a233a;
  box-sizing: border-box;
  margin-bottom: 24px;
}

.gender-options {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.gender-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #64748b;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.gender-btn.active {
  background: #eff6ff;
  color: #5a67d8;
  border-color: #c7d2fe;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 16px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-confirm {
  background: #5a67d8;
  color: #ffffff;
}

.btn-cancel::after, .btn-confirm::after {
  border: none;
}
</style>