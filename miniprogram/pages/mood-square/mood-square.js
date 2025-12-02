Page({
  data: {
    searchKeyword: '',
    moodList: [],
    originalMoodList: [] // 保存原始数据用于搜索
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
          hugCount: diary.hugCount || 0,
          createTime: diary.createTime // 保留原始时间用于排序
        }))
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      
      this.setData({ 
        moodList: publicMoods,
        originalMoodList: publicMoods // 保存原始数据
      });
    } catch (error) {
      console.error('加载心情日记失败:', error);
      this.setData({ moodList: [], originalMoodList: [] });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
  },

  // 执行搜索（点击搜索图标时调用）
  performSearch() {
    const keyword = this.data.searchKeyword.trim();
    
    if (keyword === '') {
      // 如果搜索关键词为空，显示所有日记
      this.setData({
        moodList: this.data.originalMoodList
      });
      return;
    }
    
    // 执行模糊搜索
    const searchResults = this.data.originalMoodList.filter(diary => {
      const searchContent = keyword.toLowerCase();
      
      // 在多个字段中进行模糊匹配
      return (
        // 匹配作者名
        (diary.author && diary.author.toLowerCase().includes(searchContent)) ||
        // 匹配日记内容
        (diary.content && diary.content.toLowerCase().includes(searchContent)) ||
        // 匹配心情类型
        (diary.moodType && diary.moodType.toLowerCase().includes(searchContent)) ||
        // 匹配标签
        (diary.tags && diary.tags.some(tag => 
          tag.toLowerCase().includes(searchContent)
        ))
      );
    });
    
    this.setData({
      moodList: searchResults
    });
    
    console.log('搜索关键词:', keyword, '结果数量:', searchResults.length);
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      moodList: this.data.originalMoodList
    });
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