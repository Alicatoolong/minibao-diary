Page({
  data: {
    diaryList: []
  },

  onLoad: function(options) {
    this.loadDiaryList();
  },

  onShow: function() {
    this.loadDiaryList();
  },

  onPullDownRefresh: function() {
    this.loadDiaryList();
    wx.stopPullDownRefresh();
  },

  // 删除日记
  deleteDiary: function(e) {
    const diaryId = e.currentTarget.dataset.id;
    const diary = this.data.diaryList.find(item => item.id === diaryId);
    
    if (!diary) return;
    
    // 确认删除弹窗
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇日记吗？删除后无法恢复',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteDiary(diaryId);
        }
      }
    });
    
    // 注意：这里不需要 e.stopPropagation()，因为使用了 catchtap
  },

  // 执行删除操作 - 修复存储键名不一致的问题
  performDeleteDiary: function(diaryId) {
    try {
      // 修复：统一使用 'babyDiaryList' 作为存储键名
      let allDiaries = wx.getStorageSync('babyDiaryList') || [];
      
      // 过滤掉要删除的日记
      const updatedDiaries = allDiaries.filter(diary => diary.id !== diaryId);
      
      // 保存更新后的日记列表
      wx.setStorageSync('babyDiaryList', updatedDiaries);
      
      // 更新页面数据
      this.setData({
        diaryList: updatedDiaries
      });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 1500
      });
      
    } catch (error) {
      console.error('删除日记失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 加载日记列表
  loadDiaryList: function() {
    const diaryList = wx.getStorageSync('babyDiaryList') || [];
    
    // 按时间倒序排列
    diaryList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    
    this.setData({
      diaryList: diaryList
    });
  },

  // 创建新日记
  createNewDiary: function() {
    wx.navigateTo({
      url: '/pages/diary-edit/diary-edit'
    });
  },

  // 查看日记详情
  viewDiaryDetail: function(e) {
    const diary = e.currentTarget.dataset.diary;
    wx.navigateTo({
      url: `/pages/diary-edit/diary-edit?diaryId=${diary.id}`
    });
  },

  // 切换隐私状态
  togglePrivacy: function(e) {
    const diaryId = e.currentTarget.dataset.id;
    const diaryList = this.data.diaryList;
    
    const updatedList = diaryList.map(diary => {
      if (diary.id === diaryId) {
        return {
          ...diary,
          isPublic: !diary.isPublic
        };
      }
      return diary;
    });
    
    // 保存到本地存储
    wx.setStorageSync('babyDiaryList', updatedList);
    
    // 更新页面数据
    this.setData({
      diaryList: updatedList
    });
    
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    });
    
    // 注意：这里不需要 e.stopPropagation()，因为使用了 catchtap
  },

  onReady: function() {

  },

  onHide: function() {

  },

  onUnload: function() {

  },

  onReachBottom: function() {

  },

  onShareAppMessage: function() {

  }
})