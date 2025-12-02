Page({
  data: {
    agreementType: 'all', // all: 全部协议, user: 用户协议, privacy: 隐私政策
    fromPage: '',
    showAgreeButton: true
  },

  onLoad(options) {
    const { type = 'all', from = '' } = options;
    
    console.log('用户协议页面加载', { type, from });
    
    this.setData({
      agreementType: type,
      fromPage: from,
      showAgreeButton: from === 'index' // 只有从首页来的才显示同意按钮
    });
    
    // 🆕 新增：设置页面标题
    this.setNavigationTitle(type);
  },

  // 🆕 新增：设置导航栏标题的方法
  setNavigationTitle(type) {
    let title = '';
    switch(type) {
      case 'user':
        title = '用户协议';
        break;
      case 'privacy':
        title = '隐私政策';
        break;
      case 'all':
      default:
        title = '用户协议与隐私政策';
        break;
    }
    
    wx.setNavigationBarTitle({
      title: title
    });
  },

  // 同意协议
  agreeProtocol() {
    console.log('用户同意了协议');
    
    try {
      // 存储同意状态
      wx.setStorageSync('user_agreed', true);
      wx.setStorageSync('agreement_time', new Date().getTime());
      
      console.log('协议同意状态已保存');
      
      // 显示成功提示
      wx.showToast({
        title: '已同意协议',
        icon: 'success',
        duration: 1200
      });
      
      // 延迟返回，让用户看到提示
      setTimeout(() => {
        this.handleReturn();
      }, 1200);
      
    } catch (error) {
      console.error('保存协议状态失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 🆕 新增：处理返回逻辑
  handleReturn() {
    const { fromPage } = this.data;
    
    if (fromPage === 'index') {
      // 从首页协议弹窗来的，返回首页
      wx.navigateBack();
    } else {
      // 其他情况，正常返回
      this.goBack();
    }
  },

  goBack: function() {
    const pages = getCurrentPages();
    
    if (pages.length > 1) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  onLoad(options) {
    const { type = 'all', from = '' } = options;
    
    console.log('用户协议页面加载', { type, from });
    
    this.setData({
      agreementType: type,
      fromPage: from,
      showAgreeButton: from === 'index' // 只有从首页来的才显示同意按钮
    });
    
    // 设置页面标题
    this.setNavigationTitle(type);
  },

  // 设置导航栏标题
  setNavigationTitle(type) {
    let title = '';
    switch(type) {
      case 'user':
        title = '用户协议';
        break;
      case 'privacy':
        title = '隐私政策';
        break;
      case 'all':
      default:
        title = '用户协议与隐私政策';
        break;
    }
    
    wx.setNavigationBarTitle({
      title: title
    });
  },

  // 同意协议
  agreeProtocol() {
    console.log('用户同意了协议');
    
    try {
      // 存储同意状态
      wx.setStorageSync('user_agreed', true);
      wx.setStorageSync('agreement_time', new Date().getTime());
      wx.setStorageSync('hasAgreedProtocol', true);
      wx.setStorageSync('agreementAgreedTime', new Date().getTime());
      
      console.log('协议同意状态已保存');
      
      // 显示成功提示
      wx.showToast({
        title: '已同意协议',
        icon: 'success',
        duration: 1200
      });
      
      // 延迟返回，让用户看到提示
      setTimeout(() => {
        this.handleReturn();
      }, 1200);
      
    } catch (error) {
      console.error('保存协议状态失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 处理返回逻辑
  handleReturn() {
    const { fromPage } = this.data;
    
    if (fromPage === 'index') {
      // 从首页协议弹窗来的，返回首页
      wx.navigateBack();
    } else {
      // 其他情况，正常返回
      this.goBack();
    }
  },

  // 页面显示时检查协议状态
  onShow() {
    console.log('协议页面显示');
    
    // 可以在这里添加页面显示统计等逻辑
  },

  onHide() {
    console.log('协议页面隐藏');
  },

  onUnload: function() {
    console.log('协议页面卸载');
    
    // 🆕 修改：页面卸载时，如果用户点击了同意，通知首页
    if (this.data.fromPage === 'index') {
      const hasAgreed = wx.getStorageSync('user_agreed');
      if (hasAgreed) {
        // 通知首页用户已同意协议
        const pages = getCurrentPages();
        const indexPage = pages[0];
        if (indexPage && indexPage.onProtocolAgreed) {
          indexPage.onProtocolAgreed();
        }
      }
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '用户协议与隐私政策',
      path: '/pages/agreement/agreement?type=all'
    };
  },

  onShareTimeline() {
    return {
      title: '用户协议与隐私政策'
    };
  }
})