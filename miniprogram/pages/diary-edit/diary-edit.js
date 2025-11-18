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
    
    if (!diaryContent.trim()) {
      wx.showToast({
        title: '请填写日记内容',
        icon: 'none'
      });
      return;
    }

    const moodInfo = this.data.moodOptions.find(item => item.value === selectedMood) || {};
    
    const diaryData = {
      id: diaryId || Date.now().toString(),
      mood: selectedMood,
      moodIcon: moodInfo.icon || '',
      content: diaryContent,
      isPublic: isPublic,
      createTime: this.formatSimpleDate() // 使用简化的日期格式
    };

    this.saveDiaryToStorage(diaryData);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    });
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