Page({
  data: {
    selectedSymptom: 'asymptomatic',
    otherSymptomText: '',
    showOtherInput: false,
    symptomOptions: [
      { value: 'asymptomatic', label: '无症状', desc: '今日无异常症状' },
      { value: 'blink', label: '眨眼睛', desc: '频繁眨眼' },
      { value: 'nose', label: '抽鼻子', desc: '频繁抽动鼻子' },
      { value: 'eyebrow', label: '抬眉毛', desc: '眉毛不自觉抬起' },
      { value: 'mouth', label: '咧嘴', desc: '嘴角抽动咧嘴' },
      { value: 'head', label: '仰头摇头', desc: '头部不自主运动' },
      { value: 'neck', label: '抻脖子', desc: '颈部伸展抽动' },
      { value: 'shoulder', label: '耸肩膀', desc: '肩膀不自觉耸动' },
      { value: 'belly', label: '鼓肚子', desc: '腹部鼓动' },
      { value: 'wrist', label: '扭手腕', desc: '手腕扭动' },
      { value: 'ankle', label: '扭脚', desc: '脚踝扭动' },
      { value: 'throat', label: '清嗓子', desc: '频繁清喉咙' },
      { value: 'shout', label: '大叫动物叫', desc: '发出异常叫声' },
      { value: 'coprolalia', label: '秽语', desc: '说脏话或不当言语' },
      { value: 'compulsion', label: '强迫', desc: '强迫行为或思维' },
      { value: 'other', label: '其他', desc: '其他特殊症状' }
    ],
    severityLevels: [
      { level: 1, icon: '😊', label: '轻微', desc: '偶尔发生', color: '#52C41A' },
      { level: 2, icon: '😐', label: '中等', desc: '影响日常', color: '#FAAD14' },
      { level: 3, icon: '😰', label: '严重', desc: '频繁发作', color: '#FF4D4F' }
    ],
    severityData: {
      level: 1,
      frequency: '',
      duration: '',
      description: ''
    }
  },

  onLoad: function(options) {
    console.log('🔄 症状编辑页面加载');
  },

  // 选择症状类型
  selectSymptom: function(e) {
    const value = e.currentTarget.dataset.value;
    const showOtherInput = value === 'other';
    
    this.setData({
      selectedSymptom: value,
      showOtherInput: showOtherInput
    });
  },

  // 输入其他症状内容
  onOtherSymptomInput: function(e) {
    this.setData({
      otherSymptomText: e.detail.value
    });
  },

  // 选择严重程度
  selectSeverity: function(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({
      'severityData.level': level
    });
  },

  // 输入频率
  onFrequencyInput: function(e) {
    this.setData({
      'severityData.frequency': e.detail.value
    });
  },

  // 输入持续时间
  onDurationInput: function(e) {
    this.setData({
      'severityData.duration': e.detail.value
    });
  },

  // 输入描述
  onDescriptionInput: function(e) {
    this.setData({
      'severityData.description': e.detail.value
    });
  },

  // 取消编辑
  cancelEdit: function() {
    wx.navigateBack();
  },

  // 保存症状
  saveSymptom: function() {
    const that = this;
    const { selectedSymptom, otherSymptomText, severityData } = this.data;

    // 获取症状名称
    let symptomName = '';
    if (selectedSymptom === 'asymptomatic') {
      symptomName = '无症状';
    } else if (selectedSymptom === 'other') {
      symptomName = otherSymptomText || '其他症状';
    } else {
      const selectedOption = this.data.symptomOptions.find(option => option.value === selectedSymptom);
      symptomName = selectedOption ? selectedOption.label : '未知症状';
    }

    // 获取严重程度文本
    const severityText = this.data.severityLevels.find(level => level.level === severityData.level)?.label || '轻微';

    // 获取当前日期（只到日）
    const now = new Date();
    const dateString = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;

    // 构建症状记录
    const newRecord = {
      id: new Date().getTime(),
      symptomName: symptomName,
      severity: severityText,
      time: dateString,
      date: dateString,
      notes: severityData.description || '',
      frequency: severityData.frequency,
      duration: severityData.duration,
      level: severityData.level,
      type: selectedSymptom,
      otherText: otherSymptomText
    };

    console.log('💾 保存症状记录:', newRecord);

    // 获取现有记录
    wx.getStorage({
      key: 'symptomRecords',
      success: function(res) {
        const existingRecords = res.data || [];
        existingRecords.push(newRecord);

        // 保存到缓存
        wx.setStorage({
          key: 'symptomRecords',
          data: existingRecords,
          success: function() {
            console.log('✅ 症状保存成功，记录总数:', existingRecords.length);
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1500
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          },
          fail: function(err) {
            console.error('❌ 保存失败:', err);
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        });
      },
      fail: function() {
        // 如果没有现有记录，创建新数组
        wx.setStorage({
          key: 'symptomRecords',
          data: [newRecord],
          success: function() {
            console.log('✅ 症状保存成功（首次记录）');
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        });
      }
    });
  }
})