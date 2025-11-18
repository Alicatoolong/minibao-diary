Page({
  data: {
    searchKeyword: '',
    moodList: []
  },

  onLoad() {
    this.loadPublicMoods();
  },

  onShow() {
    this.loadPublicMoods();
  },

  // 加载公开的心情日记
  loadPublicMoods() {
    try {
      // 从存储中获取所有心情日记
      const allDiaries = wx.getStorageSync('diaryRecords') || [];
      
      // 筛选公开的日记并按时间倒序
      const publicMoods = allDiaries
        .filter(diary => diary.isPublic === true)
        .map(diary => ({
          id: diary.id,
          author: diary.author || '匿名妈妈',
          date: this.formatDate(diary.createTime || new Date()),
          moodIcon: this.getMoodIcon(diary.mood),
          moodType: this.getMoodType(diary.mood),
          content: diary.content,
          tags: diary.tags || [],
          hugCount: diary.hugCount || 0
        }))
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      
      this.setData({ moodList: publicMoods });
    } catch (error) {
      console.error('加载心情日记失败:', error);
      this.setData({ moodList: [] });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    // 这里可以添加搜索过滤逻辑
  },

  // 发送抱抱
  sendHug(e) {
    const id = e.currentTarget.dataset.id;
    const moodList = this.data.moodList.map(item => {
      if (item.id === id) {
        return { ...item, hugCount: (item.hugCount || 0) + 1 };
      }
      return item;
    });
    
    this.setData({ moodList });
    
    wx.showToast({
      title: '抱抱已发送',
      icon: 'success'
    });
  },

  // 查看详情
  viewMoodDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/diary-detail/diary-detail?id=${id}`
    });
  },

  // 工具函数
  formatDate(date) {
    const d = new Date(date);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  },

  getMoodIcon(moodValue) {
    const moodMap = {
      1: '😊', // 开心
      2: '😐', // 平静  
      3: '😔', // 不开心
      4: '😢', // 难过
      5: '😴'  // 疲惫
    };
    return moodMap[moodValue] || '😐';
  },

  getMoodType(moodValue) {
    const typeMap = {
      1: '开心',
      2: '平静',
      3: '不开心', 
      4: '难过',
      5: '疲惫'
    };
    return typeMap[moodValue] || '平静';
  }
});