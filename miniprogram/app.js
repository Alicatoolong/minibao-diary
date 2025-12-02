// app.js
wx.cloud.init({
  env: 'cloud1-6gqnwpyte094c95c',
  traceUser: true
})

App({
  onLaunch: function () {
    console.log('小程序启动');
    
    // 不再强制跳转，让首页处理协议逻辑
    this.checkLoginStatus();
  },
  
  // 检查登录状态
  checkLoginStatus: function() {
    const hasAgreed = wx.getStorageSync('user_agreed');
    console.log('协议状态:', hasAgreed);
    
    if (!hasAgreed) {
      console.log('用户未同意协议，将在首页显示协议弹窗');
    } else {
      console.log('用户已同意协议，正常启动');
    }
  },
  
  globalData: {
    userInfo: null
  }
})