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
  },

  // 执行删除操作
  performDeleteDiary: function(diaryId) {
    try {
      let allDiaries = wx.getStorageSync('babyDiaryList') || [];
      
      const updatedDiaries = allDiaries.filter(diary => diary.id !== diaryId);
      
      wx.setStorageSync('babyDiaryList', updatedDiaries);
      
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
    
    diaryList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    
    this.setData({
      diaryList: diaryList
    });
  },

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
    
    wx.setStorageSync('babyDiaryList', updatedList);
    
    this.setData({
      diaryList: updatedList
    });
    
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    });
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