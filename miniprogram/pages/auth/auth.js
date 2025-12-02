Page({
  data: {
    agreed: false,        // 是否同意协议
    authLoading: false    // 授权中状态
  },

  onLoad() {
    // 检查是否已经授权过
    this.checkAuthStatus();
  },

  // 返回上一页 - 这个函数现在在 Page 对象内部
  goBack: function() {
    const pages = getCurrentPages();
    
    if (pages.length > 1) {
      // 有上一页，正常返回
      wx.navigateBack({
        delta: 1
      });
    } else {
      // 没有上一页，使用 reLaunch 跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  // 检查授权状态
  async checkAuthStatus() {
    try {
      const hasAgreed = wx.getStorageSync('hasAgreedProtocol');
      const userInfo = wx.getStorageSync('userInfo');
      
      if (hasAgreed && userInfo) {
        // 已经授权，直接跳转首页
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    } catch (error) {
      console.log('检查授权状态失败:', error);
    }
  },

  // 切换协议同意状态
  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    });
  },

  // 跳转到协议详情页
  navToAgreement() {
    wx.navigateTo({
      url: '/pages/auth/agreement/agreement'
    });
  },

  // 处理授权
  async handleAuth() {
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先阅读并同意用户协议',
        icon: 'none'
      });
      return;
    }

    this.setData({ authLoading: true });

    try {
      // 1. 微信登录获取code
      const loginRes = await wx.login();
      
      // 2. 获取用户信息授权
      const userInfo = await this.getUserProfile();
      
      // 3. 向后端发送登录请求（获取openid等）
      const authResult = await this.requestAuth(loginRes.code, userInfo);
      
      // 4. 存储用户信息和同意状态
      this.saveAuthData(userInfo, authResult);
      
      // 5. 跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
      
    } catch (error) {
      console.error('授权失败:', error);
      wx.showToast({
        title: '授权失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ authLoading: false });
    }
  },

  // 获取用户信息（新版本API）
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 请求后端认证
  async requestAuth(code, userInfo) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://your-api-domain.com/auth/login',
        method: 'POST',
        data: {
          code: code,
          userInfo: userInfo
        },
        success: (res) => {
          if (res.data.success) {
            resolve(res.data.data);
          } else {
            reject(res.data.message);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 存储认证数据
  saveAuthData(userInfo, authResult) {
    // 存储用户信息
    wx.setStorageSync('userInfo', userInfo);
    
    // 存储登录凭证
    wx.setStorageSync('token', authResult.token);
    wx.setStorageSync('openid', authResult.openid);
    
    // 标记已同意协议
    wx.setStorageSync('hasAgreedProtocol', true);
    
    // 记录同意时间
    wx.setStorageSync('agreementTime', new Date().getTime());
  }
})