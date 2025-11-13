// app.js
App({
  onLaunch: function () {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        // 
        env: 'cloud1-6gqnwpyte094c95c', // 需要替换为实际的云环境ID
        traceUser: true
      });
      console.log('云开发初始化成功');
    }
  },
  
  globalData: {
    userInfo: null
  }
})