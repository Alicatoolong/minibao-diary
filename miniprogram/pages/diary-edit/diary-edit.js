Page({
  data: {
    diaryId: null,
    selectedMood: '',
    diaryContent: '',
    isPublic: false,
    moodOptions: [
      { value: 'happy', label: '开心', icon: '😊' },
      { value: 'excited', label: '兴奋', icon: '😄' },
      { value: 'peaceful', label: '平静', icon: '😌' },
      { value: 'tired', label: '疲惫', icon: '😴' },
      { value: 'unwell', label: '不适', icon: '😔' },
      { value: 'crying', label: '哭闹', icon: '😢' },
      { value: 'angry', label: '生气', icon: '😠' },
      { value: 'surprised', label: '惊讶', icon: '😲' }
    ]
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
  onLoad: function(options) {
    if (options.diaryId) {
      this.loadDiary(options.diaryId);
    }
  },

  loadDiary: function(diaryId) {
    const diaryList = wx.getStorageSync('babyDiaryList') || [];
    const diary = diaryList.find(item => item.id === diaryId);
    
    if (diary) {
      this.setData({
        diaryId: diary.id,
        selectedMood: diary.mood || '',
        diaryContent: diary.content || '',
        isPublic: diary.isPublic || false
      });
    }
  },

  selectMood: function(e) {
    const mood = e.currentTarget.dataset.value;
    this.setData({
      selectedMood: mood
    });
  },

  onContentInput: function(e) {
    this.setData({
      diaryContent: e.detail.value
    });
  },

  onPrivacyChange: function(e) {
    this.setData({
      isPublic: e.detail.value
    });
  },

  cancelEdit: function() {
    wx.navigateBack();
  },

  saveDiary: function() {
    const { selectedMood, diaryContent, isPublic, diaryId } = this.data;
    
    // 🆕 添加防重复点击
    if (this.saving) {
      console.log('⏳ 保存中，请稍候...');
      return;
    }
    this.saving = true;
    
    if (!diaryContent.trim()) {
      wx.showToast({
        title: '请填写日记内容',
        icon: 'none'
      });
      this.saving = false;
      return;
    }
  
    const moodInfo = this.data.moodOptions.find(item => item.value === selectedMood) || {};
    
    const diaryData = {
      id: diaryId || 'diary_' + Date.now(), // 🆕 更好的ID格式
      mood: selectedMood,
      moodIcon: moodInfo.icon || '',
      content: diaryContent.trim(),
      isPublic: isPublic,
      createTime: this.formatSimpleDate(),
      updateTime: new Date().toISOString() // 🆕 添加更新时间
    };
  
    console.log('💾 保存日记:', {
      模式: diaryId ? '编辑' : '新建',
      ID: diaryData.id,
      内容长度: diaryData.content.length
    });
  
    this.saveDiaryToStorage(diaryData);
  
    wx.showToast({
      title: diaryId ? '更新成功' : '保存成功',
      icon: 'success',
      duration: 1500
    });
  
    // 🆕 保存后禁用按钮，防止重复点击
    setTimeout(() => {
      this.saving = false;
      // 自动返回上一页
      wx.navigateBack();
    }, 1500);
  },

  // 简化的日期格式 - 只包含年月日
  formatSimpleDate: function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  saveDiaryToStorage: function(diaryData) {
    let diaryList = wx.getStorageSync('babyDiaryList') || [];
    
    if (this.data.diaryId) {
      diaryList = diaryList.map(diary => 
        diary.id === this.data.diaryId ? diaryData : diary
      );
    } else {
      diaryList.unshift(diaryData);
    }
    
    wx.setStorageSync('babyDiaryList', diaryList);
  }
});