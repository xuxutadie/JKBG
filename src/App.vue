<script>
export default {
  onLaunch: function () {
    console.log('App Launch');
  },
  onShow: function () {
    console.log('App Show');
  },
  onHide: function () {
    console.log('App Hide');
  }
};
</script>

<style lang="scss">
/* 全局样式 */
html,
body,
#app,
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #061121;
  min-height: 100vh;
}

/* 毛玻璃卡片全局通用类 */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 32rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.08);
  padding: 32rpx;
  position: relative;
  overflow: hidden;
}

/* 毛玻璃通透感底座（用于图表区） */
.glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 40rpx;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
}
</style>
