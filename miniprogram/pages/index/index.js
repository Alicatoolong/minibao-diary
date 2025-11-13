Page({
  data: {
    babyInfo: {
      name: '乐乐',
      birthday: '2023-01-15',
      status: '近期有过敏反应',
      rating: 3
    },
    hotPosts: [
      {
        id: 1,
        author: '张妈妈',
        title: '宝宝花粉过敏怎么办？',
        content: '分享我的抗过敏经验，希望对大家有帮助...',
        likes: 23
      },
      {
        id: 2, 
        author: '李爸爸',
        title: '湿疹宝宝的护理心得',
        content: '三个月战胜湿疹！分享我的护理方法...',
        likes: 45
      },
      {
        id: 3,
        author: '王妈妈', 
        title: '过敏体质饮食调理',
        content: '这些食物要避开，这些可以多吃...',
        likes: 67
      }
    ]
  },

  onLoad: function(options) {
    // 尝试从本地存储加载宝宝信息
    const savedBabyInfo = wx.getStorageSync('babyBasicInfo');
    if (savedBabyInfo) {
      this.setData({
        babyInfo: savedBabyInfo
      });
    }
    
    // 计算并设置年龄
    this.calculateAge();
  },

  onShow: function() {
    // 每次页面显示时重新计算年龄
    this.calculateAge();
  },

  // 计算年龄方法
  calculateAge: function() {
    const birthday = this.data.babyInfo.birthday;
    if (!birthday) {
      console.log('没有生日数据');
      return;
    }
    
    const birthDate = new Date(birthday);
    const today = new Date();
    
    // 验证日期是否有效
    if (isNaN(birthDate.getTime())) {
      console.error('无效的生日日期:', birthday);
      return;
    }
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    // 如果当前月份小于出生月份，年份减1，月份加12
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // 如果当前日期小于出生日期，月份减1
    if (today.getDate() < birthDate.getDate()) {
      months--;
      // 如果月份变成负数，年份减1，月份加12
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    
    // 确保月份在合理范围内
    if (months < 0) months = 0;
    if (months > 11) months = 11;
    
    // 构建年龄显示字符串
    let ageString = '';
    if (years > 0) {
      ageString += `${years}岁`;
    }
    if (months > 0) {
      if (ageString) ageString += '';
      ageString += `${months}个月`;
    }
    if (!ageString) {
      ageString = '新生儿';
    }
    
    // 更新数据
    this.setData({
      'babyInfo.age': ageString
    });
  },

  // 快速记录点击事件
  quickRecord: function(e) {
    const type = e.currentTarget.dataset.type;
    console.log('快速记录类型:', type);
    
    // 这里可以弹出对应的记录模态框
    wx.showModal({
      title: '记录' + this.getTypeName(type),
      content: '记录' + this.getTypeName(type) + '信息',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '记录成功',
            icon: 'success'
          });
        }
      }
    });
  },

  getTypeName: function(type) {
    const names = {
      'mood': '情绪',
      'diet': '饮食', 
      'sleep': '睡眠',
      'exercise': '运动',
      'special': '特殊情况'
    };
    return names[type] || type;
  },

  // 编辑宝宝信息
  editBabyInfo: function() {
    const babyInfo = {
      name: this.data.babyInfo.name,
      birthday: this.data.babyInfo.birthday,
      age: this.data.babyInfo.age,
      status: this.data.babyInfo.status,
      rating: this.data.babyInfo.rating
    };
    
    wx.navigateTo({
      url: `/pages/edit-baby-info/edit-baby-info?babyInfo=${encodeURIComponent(JSON.stringify(babyInfo))}`,
      success: (res) => {
        console.log('✅ 跳转成功');
      },
      fail: (err) => {
        console.error('❌ 跳转失败:', err);
      }
    });
  },

  // 更新宝宝信息
  updateBabyInfo: function(newData) {
    this.setData({
      babyInfo: newData
    });
    
    // 重新计算年龄
    this.calculateAge();
    
    // 保存到本地存储
    wx.setStorageSync('babyBasicInfo', newData);
  },

// 跳转到我宝情况页面 - 应该跳转到 baby-status
navToBabyStatus: function() {
  wx.navigateTo({
    url: '/pages/baby-status/baby-status',
    success: (res) => {
      console.log('跳转到宝宝情况页面成功');
    },
    fail: (err) => {
      console.error('跳转失败:', err);
    }
  });
},

// 跳转到我宝情况页面
navToBabyStatus: function() {
  wx.navigateTo({
    url: '/pages/baby-status/baby-status'
  });
},

// 跳转到心情日记页面
navToDiary: function() {
  wx.navigateTo({
    url: '/pages/diary-list/diary-list'
  });
},

  navToForum: function() {
    wx.navigateTo({
      url: '/pages/forum/index'
    });
  },

  navToMap: function() {
    // 跳转到地图页面
    console.log('跳转到看看周围');
  },
  
  navToDiary: function() {
    wx.navigateTo({
      url: '/pages/diary-list/diary-list'
    });
  },
  
  startChat: function() {
    // 开始聊天功能
    console.log('开始聊天');
  },

  // 获取评分星星
  getRatingStars: function(rating) {
    const stars = ['☆', '☆', '☆', '☆', '☆'];
    for (let i = 0; i < rating; i++) {
      stars[i] = '★';
    }
    return stars.join('');
  }
});