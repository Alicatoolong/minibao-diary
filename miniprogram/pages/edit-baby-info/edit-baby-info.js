Page({
  data: {
    avatarUrl: '',
    babyName: '',
    birthday: '',
    energyRating: 3,
    today: '',
    energyTexts: ['能量不足', '能量较低', '能量一般', '能量充足', '能量满满'],
    isSaved: false
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
    const today = new Date().toISOString().split('T')[0];
    const babyInfo = wx.getStorageSync('babyInfo') || {};
    
    this.setData({
      today: today,
      avatarUrl: babyInfo.avatarUrl || '',
      babyName: babyInfo.name || '',
      birthday: babyInfo.birthday || '',
      energyRating: babyInfo.energyRating || 3
    });
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          avatarUrl: tempFilePath,
          isSaved: false
        });
      }
    })
  },

  // 输入姓名
  onNameInput(e) {
    this.setData({
      babyName: e.detail.value,
      isSaved: false
    });
  },

  // 选择生日
  onBirthdayChange(e) {
    this.setData({
      birthday: e.detail.value,
      isSaved: false
    });
  },

  // 设置能量评分
  setEnergyRating(e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({
      energyRating: rating,
      isSaved: false
    });
  },

  // 取消编辑
  cancelEdit() {
    wx.navigateBack();
  },

  // 保存宝宝信息 - 修复后的完整方法
  saveBabyInfo() {
    const { avatarUrl, babyName, birthday, energyRating } = this.data;
    
    console.log('💾 开始保存宝宝信息...');
    
    // 验证输入
    if (!babyName.trim()) {
      wx.showToast({
        title: '请输入宝宝姓名',
        icon: 'none'
      });
      return;
    }

    if (!birthday) {
      wx.showToast({
        title: '请选择宝宝生日',
        icon: 'none'
      });
      return;
    }

    // 计算年龄
    const age = this.calculateAge(birthday);
    
    // 构建宝宝信息对象
    const babyInfo = {
      avatarUrl: avatarUrl,
      name: babyName.trim(),
      birthday: birthday,
      age: age,
      energyRating: energyRating
    };
    
    console.log('📝 宝宝信息对象:', babyInfo);
    
    // 保存到本地存储
    try {
      wx.setStorageSync('babyInfo', babyInfo);
      console.log('✅ 宝宝信息已保存到本地存储');
    } catch (error) {
      console.error('❌ 保存到本地存储失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
      return;
    }
    
    // 更新首页数据
    this.updateIndexPage(babyInfo);
    
    // 触发备份到云开发
    this.triggerBackup();
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500
    });
    
    // 标记为已保存状态
    this.setData({
      isSaved: true
    });
    
    // 2秒后自动返回（可选）
    setTimeout(() => {
      if (this.data.isSaved) {
        this.goBack();
      }
    }, 1500);
  },

  // 更新首页数据
  updateIndexPage(babyInfo) {
    const pages = getCurrentPages();
    if (pages.length < 2) {
      console.log('⚠️ 没有上一页，无法更新首页数据');
      return;
    }
    
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.setData) {
      console.log('🔄 更新首页宝宝信息');
      prevPage.setData({
        babyInfo: babyInfo,
        hasBabyInfo: true
      });
      
      // 调用首页的初始化方法（如果存在）
      if (typeof prevPage.initBabyInfo === 'function') {
        prevPage.initBabyInfo();
      }
      
      // 调用首页的刷新方法（如果存在）
      if (typeof prevPage.forceRefreshData === 'function') {
        prevPage.forceRefreshData();
      }
      
      // 触发首页的数据备份（如果存在）
      if (typeof prevPage.onSymptomSaved === 'function') {
        prevPage.onSymptomSaved();
      }
    }
  },

  // 触发备份到云开发
  triggerBackup: function() {
    try {
      console.log('💾 宝宝信息变更，触发云备份...');
      
      // 方法1：通过全局回调
      const app = getApp();
      if (app && app.globalDataUpdateCallback) {
        console.log('🔄 通过全局回调触发备份');
        app.globalDataUpdateCallback();
      }
      
      // 方法2：直接调用首页备份方法
      const pages = getCurrentPages();
      const indexPage = pages.find(page => page.route === 'pages/index/index');
      if (indexPage && typeof indexPage.onSymptomSaved === 'function') {
        console.log('🔄 直接调用首页备份方法');
        indexPage.onSymptomSaved();
      } else {
        console.log('⚠️ 未找到首页备份方法，尝试其他方式');
        // 方法3：通过存储事件触发
        wx.setStorageSync('need_backup', Date.now());
      }
      
      console.log('✅ 宝宝信息备份触发完成');
    } catch (error) {
      console.error('❌ 触发备份失败:', error);
    }
  },

  // 计算年龄
  calculateAge(birthday) {
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // 处理不满1岁的情况
    if (years === 0) {
      return `${months}个月`;
    }
    
    return `${years}岁${months}个月`;
  },

  // 新增：页面显示时检查保存状态
  onShow() {
    // 如果是从其他页面返回，检查是否需要刷新数据
    const babyInfo = wx.getStorageSync('babyInfo') || {};
    if (babyInfo.name && !this.data.isSaved) {
      this.setData({
        avatarUrl: babyInfo.avatarUrl || '',
        babyName: babyInfo.name || '',
        birthday: babyInfo.birthday || '',
        energyRating: babyInfo.energyRating || 3
      });
    }
  }
})