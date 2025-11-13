Page({
  data: {
    diaryId: null,
    selectedMood: '',
    diaryContent: '',
    selectedTags: [],
    customTag: '',
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
    ],
    tagOptions: [
      '第一次', '成长记录', '健康', '饮食', '睡眠', 
      '运动', '学习', '玩耍', '外出', '生病'
    ]
  },

  onLoad: function(options) {
    if (options.diaryId) {
      // 编辑现有日记
      this.loadDiary(options.diaryId);
    }
  },

  // 加载日记数据
  loadDiary: function(diaryId) {
    const diaryList = wx.getStorageSync('babyDiaryList') || [];
    const diary = diaryList.find(item => item.id === diaryId);
    
    if (diary) {
      this.setData({
        diaryId: diary.id,
        selectedMood: diary.mood || '',
        diaryContent: diary.content || '',
        selectedTags: diary.tags || [],
        isPublic: diary.isPublic || false
      });
    }
  },

  // 选择心情
  selectMood: function(e) {
    const mood = e.currentTarget.dataset.value;
    this.setData({
      selectedMood: mood
    });
  },

  // 输入日记内容
  onContentInput: function(e) {
    this.setData({
      diaryContent: e.detail.value
    });
  },

  // 切换标签
  toggleTag: function(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = this.data.selectedTags;
    
    if (selectedTags.includes(tag)) {
      // 移除标签
      this.setData({
        selectedTags: selectedTags.filter(t => t !== tag)
      });
    } else {
      // 添加标签
      this.setData({
        selectedTags: [...selectedTags, tag]
      });
    }
  },

  // 输入自定义标签
  onCustomTagInput: function(e) {
    this.setData({
      customTag: e.detail.value
    });
  },

  // 添加自定义标签
  addCustomTag: function(e) {
    const customTag = this.data.customTag.trim();
    if (customTag && !this.data.selectedTags.includes(customTag)) {
      this.setData({
        selectedTags: [...this.data.selectedTags, customTag],
        customTag: ''
      });
    }
  },

  // 切换隐私设置
  onPrivacyChange: function(e) {
    this.setData({
      isPublic: e.detail.value
    });
  },

  // 取消编辑
  cancelEdit: function() {
    wx.navigateBack();
  },

  // 保存日记
  saveDiary: function() {
    const { selectedMood, diaryContent, selectedTags, isPublic, diaryId } = this.data;
    
    if (!diaryContent.trim()) {
      wx.showToast({
        title: '请填写日记内容',
        icon: 'none'
      });
      return;
    }

    // 获取心情信息
    const moodInfo = this.data.moodOptions.find(item => item.value === selectedMood) || {};
    
    // 构建日记数据
    const diaryData = {
      id: diaryId || Date.now().toString(),
      mood: selectedMood,
      moodIcon: moodInfo.icon || '',
      content: diaryContent,
      tags: selectedTags,
      isPublic: isPublic,
      createTime: this.formatDate(new Date())
    };

    // 保存到本地存储
    this.saveDiaryToStorage(diaryData);

    // 显示成功提示
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
  },

  // 保存到本地存储
  saveDiaryToStorage: function(diaryData) {
    let diaryList = wx.getStorageSync('babyDiaryList') || [];
    
    if (this.data.diaryId) {
      // 更新现有日记
      diaryList = diaryList.map(diary => 
        diary.id === this.data.diaryId ? diaryData : diary
      );
    } else {
      // 添加新日记
      diaryList.unshift(diaryData);
    }
    
    wx.setStorageSync('babyDiaryList', diaryList);
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
});