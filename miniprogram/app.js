// app.js
wx.cloud.init({
  env: 'cloud1-6gqnwpyte094c95c', // 你的实际环境ID
  traceUser: true
})

App({
  onLaunch: function () {
    console.log('小程序启动');
  },
  globalData: {
    userInfo: null
  }
})