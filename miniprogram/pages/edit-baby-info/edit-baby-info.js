Page({
  data: {
    avatarUrl: '',
    babyName: '',
    birthday: '',
    energyRating: 3,
    today: '',
    energyTexts: ['能量不足', '能量较低', '能量一般', '能量充足', '能量满满']
  },

  onLoad(options) {
    // 设置今天日期，用于限制生日选择
    const today = new Date().toISOString().split('T')[0];
    
    // 从本地存储加载宝宝信息
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
          avatarUrl: tempFilePath
        });
      }
    })
  },

  // 输入姓名
  onNameInput(e) {
    this.setData({
      babyName: e.detail.value
    });
  },

  // 选择生日
  onBirthdayChange(e) {
    this.setData({
      birthday: e.detail.value
    });
  },

  // 设置能量评分
  setEnergyRating(e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({
      energyRating: rating
    });
  },

  // 取消编辑
  cancelEdit() {
    wx.navigateBack();
  },

  // 保存宝宝信息
  saveBabyInfo() {
    const { avatarUrl, babyName, birthday, energyRating } = this.data;
    
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
    
    // 保存到本地存储
    const babyInfo = {
      avatarUrl: avatarUrl,
      name: babyName.trim(),
      birthday: birthday,
      age: age,
      energyRating: energyRating
    };
    
    wx.setStorageSync('babyInfo', babyInfo);
    
    // 更新首页数据 - 确保头像也同步更新
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        'babyInfo.avatarUrl': avatarUrl,  // 确保头像更新
        'babyInfo.name': babyName.trim(),
        'babyInfo.birthday': birthday,
        'babyInfo.age': age,
        'babyInfo.energyRating': energyRating
      });
      
      // 如果首页有初始化宝宝信息的函数，也调用一下
      if (prevPage.initBabyInfo) {
        prevPage.initBabyInfo();
      }
    }
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 计算年龄 - 移到正确的位置
  calculateAge(birthday) {
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return `${years}岁${months}个月`;
  }
})