Page({
  data: {
    babyName: '乐乐',
    birthday: '2022-01-15',
    healthStatus: '近期有过敏反应',
    healthRating: 3,
    calculatedAge: '3岁9个月',
    today: '',
    ratingTexts: [
      '需要关注',
      '状态一般', 
      '基本健康',
      '比较健康',
      '非常健康'
    ]
  },

  onLoad: function(options) {
    console.log('编辑页面开始加载');
    
    // 设置今天的日期
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    this.setData({
      today: todayStr
    });

    // 如果有参数，尝试解析
    if (options && options.babyInfo) {
      try {
        console.log('收到参数:', options.babyInfo);
        const babyInfo = JSON.parse(decodeURIComponent(options.babyInfo));
        this.setData({
          babyName: babyInfo.name || '乐乐',
          birthday: babyInfo.birthday || '2022-01-15',
          healthStatus: babyInfo.status || '近期有过敏反应',
          healthRating: babyInfo.rating || 3
        });
      } catch (e) {
        console.error('解析参数失败:', e);
      }
    }
  },

  onNameInput: function(e) {
    this.setData({
      babyName: e.detail.value
    });
  },

  onBirthdayChange: function(e) {
    this.setData({
      birthday: e.detail.value
    });
  },

  onHealthInput: function(e) {
    this.setData({
      healthStatus: e.detail.value
    });
  },

  setRating: function(e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({
      healthRating: rating
    });
  },

  cancelEdit: function() {
    wx.navigateBack();
  },

  saveBabyInfo: function() {
    const saveData = {
      name: this.data.babyName,
      birthday: this.data.birthday,
      status: this.data.healthStatus,
      rating: this.data.healthRating
    };

    // 获取首页并更新数据
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.updateBabyInfo) {
      prevPage.updateBabyInfo(saveData);
    }

    // 保存到本地
    wx.setStorageSync('babyBasicInfo', saveData);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
})