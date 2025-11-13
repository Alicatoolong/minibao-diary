Page({
  data: {
    diaryList: []
  },

  onLoad: function(options) {
    this.loadDiaryList();
  },

  onPullDownRefresh: function() {
    this.loadDiaryList();
    wx.stopPullDownRefresh();
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
  },

  onReady: function() {

  },

  onShow: function() {

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