// symptom.js
Page({
  data: {
    selectedSymptom: 'asymptomatic',
    selectedSeverity: null,
    otherSymptomText: '',
    showOtherInput: false,
    confirmedSymptoms: [],
    
    symptomOptions: [
      { value: 'asymptomatic', label: '无症状', desc: '今日无异常情况' },
      { value: 'blink', label: '眨眼睛', desc: '频繁眨眼' },
      { value: 'nose', label: '抽鼻子', desc: '频繁抽动鼻子' },
      { value: 'eyebrow', label: '抬眉毛', desc: '眉毛不自觉抬起' },
      { value: 'mouth', label: '咧嘴', desc: '嘴角抽动咧嘴' },
      { value: 'head', label: '仰头摇头', desc: '头部不自主运动' },
      { value: 'shoulder', label: '耸肩膀', desc: '肩膀不自觉耸动' },
      { value: 'neck', label: '抻脖子', desc: '颈部伸展抽动' },
      { value: 'belly', label: '鼓肚子', desc: '腹部鼓动' },
      { value: 'wrist', label: '扭手腕', desc: '手腕扭动' },
      { value: 'ankle', label: '扭脚', desc: '脚踝扭动' },
      { value: 'jump', label: '跳跃', desc: '不自主跳跃动作' },
      { value: 'touch', label: '触摸', desc: '反复触摸物体' },
      { value: 'throat', label: '清嗓子', desc: '频繁清喉咙' },
      { value: 'cough', label: '咳嗽', desc: '无原因咳嗽' },
      { value: 'sniff', label: '吸鼻子', desc: '频繁吸鼻子' },
      { value: 'animal', label: '动物叫', desc: '发出动物叫声' },
      { value: 'squeal', label: '尖叫', desc: '突然尖叫' },
      { value: 'repeat', label: '重复词语', desc: '重复说某些词语' },
      { value: 'echo', label: '模仿语言', desc: '模仿他人说话' },
      { value: 'nonsense', label: '无意义短语', desc: '说无意义的话' },
      { value: 'coprolalia', label: '秽语', desc: '说脏话或不当言语' },
      { value: 'insult', label: '侮辱性语言', desc: '说侮辱性话语' },
      { value: 'compulsion', label: '强迫行为', desc: '强迫行为或思维' },
      { value: 'other', label: '其他情况', desc: '其他特殊情况' }
    ],
    
    severityLevels: [
      { level: 1, icon: '😊', label: '轻微', color: '#52C41A' },
      { level: 2, icon: '😐', label: '中等', color: '#FAAD14' },
      { level: 3, icon: '😰', label: '频繁', color: '#FF4D4F' }
    ]
  },

  // 辅助方法：获取严重程度标签
  getSeverityLabel: function(selectedSeverity) {
    if (!selectedSeverity) return '未知';
    const severity = this.data.severityLevels.find(level => level.level === selectedSeverity);
    return severity ? severity.label : '未知';
  },

  // 辅助方法：获取症状标签
  getSymptomLabel: function(selectedSymptom) {
    if (selectedSymptom === 'asymptomatic') return '无症状';
    if (selectedSymptom === 'other') return this.data.otherSymptomText || '其他症状';
    const option = this.data.symptomOptions.find(opt => opt.value === selectedSymptom);
    return option ? option.label : '未知症状';
  },

  selectSymptom: function(e) {
    const value = e.currentTarget.dataset.value;
    const showOtherInput = value === 'other';
    
    this.setData({
      selectedSymptom: value,
      showOtherInput: showOtherInput,
      selectedSeverity: null
    });
  },

  selectSeverity: function(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({
      selectedSeverity: level
    });
  },

  onOtherSymptomInput: function(e) {
    this.setData({
      otherSymptomText: e.detail.value
    });
  },

  confirmSymptom: function() {
    const { selectedSymptom, selectedSeverity, otherSymptomText } = this.data;
  
    console.log('🔍 当前选择:', {
      selectedSymptom: selectedSymptom,
      selectedSeverity: selectedSeverity,
      otherSymptomText: otherSymptomText
    });

    // 验证数据
  if (selectedSymptom === 'other' && !otherSymptomText.trim()) {
    wx.showToast({
      title: '请输入其他症状描述',
      icon: 'none'
    });
    return;
  }

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
  const severityText = selectedSymptom === 'asymptomatic' ? '无' : this.getSeverityLabel(selectedSeverity);

  console.log('🔍 生成的症状记录:', {
    symptomName: symptomName,
    severity: severityText,
    severityLevel: selectedSeverity,
    type: selectedSymptom
  });

    // 创建症状记录
  const symptomRecord = {
    id: new Date().getTime() + Math.random(),
    symptomName: symptomName,
    severity: severityText,
    severityLevel: selectedSeverity,
    type: selectedSymptom,
    otherText: otherSymptomText,
    timestamp: new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };

    // 添加到已确认列表
  const updatedSymptoms = [...this.data.confirmedSymptoms, symptomRecord];
  this.setData({
    confirmedSymptoms: updatedSymptoms
  });

  console.log('📝 更新后的已选症状列表:', updatedSymptoms);

    // 重置表单
  this.resetForm();

  wx.showToast({
    title: '已添加症状',
    icon: 'success',
    duration: 1500
  });
},

  resetForm: function() {
    this.setData({
      selectedSymptom: 'asymptomatic',
      selectedSeverity: null,
      otherSymptomText: '',
      showOtherInput: false
    });
  },

  deleteSymptom: function(e) {
    const index = e.currentTarget.dataset.index;
    const { confirmedSymptoms } = this.data;
    
    const updatedSymptoms = confirmedSymptoms.filter((_, i) => i !== index);
    this.setData({
      confirmedSymptoms: updatedSymptoms
    });

    wx.showToast({
      title: '已删除',
      icon: 'success',
      duration: 1000
    });
  },

  completeSelection: function() {
    const { confirmedSymptoms } = this.data;
    
    console.log('💾 准备保存的症状:', confirmedSymptoms);
  
    if (confirmedSymptoms.length === 0) {
      wx.showToast({
        title: '请至少添加一个症状',
        icon: 'none'
      });
      return;
    }
  
    // 保存到本地存储
    const now = new Date();
    const completeRecord = {
      id: new Date().getTime(),
      date: `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`,
      timestamp: now.toLocaleString('zh-CN'),
      symptoms: confirmedSymptoms,
      symptomCount: confirmedSymptoms.length
    };
  
    console.log('📤 完整保存记录:', completeRecord);

    // 获取现有记录
  let existingRecords = wx.getStorageSync('symptomRecords') || [];
  console.log('📂 保存前的现有记录:', existingRecords);
  
  existingRecords.push(completeRecord);

  // 保存到缓存
  wx.setStorage({
    key: 'symptomRecords',
    data: existingRecords,
    success: () => {
      console.log('✅ 所有症状保存成功');
      console.log('💾 存储后的所有记录:', wx.getStorageSync('symptomRecords'));
      
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });
    },
    fail: (err) => {
      console.error('❌ 保存失败:', err);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  });
},
// 新增：立即重新加载最新症状数据
loadLatestSymptoms: function() {
  try {
    const records = wx.getStorageSync('symptomRecords') || [];
    
    if (records.length > 0) {
      // 获取最新记录（按时间倒序）
      const sortedRecords = records.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp) : new Date(a.id || 0);
        const timeB = b.timestamp ? new Date(b.timestamp) : new Date(b.id || 0);
        return timeB - timeA;
      });
      
      const latest = sortedRecords[0];
      
      console.log('🔄 立即加载的最新记录:', latest);
      
      if (latest.symptoms && latest.symptoms.length > 0) {
        const symptomStrings = latest.symptoms.map(symptom => {
          return `${symptom.symptomName}·${symptom.severity}`;
        });
        
        let symptomListText = symptomStrings.join('，');
        if (symptomStrings.length > 9) {
          symptomListText = symptomStrings.slice(0, 9).join('，') + '...';
        }
        
        // 格式化记录时间
        let recordTime = '';
        if (latest.timestamp) {
          const date = new Date(latest.timestamp);
          recordTime = `记录时间：${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // 立即更新显示
        this.setData({
          confirmedSymptoms: latest.symptoms, // 更新为最新症状
          symptomListText: symptomListText,
          recordTime: recordTime
        });
        
        console.log('✅ 立即更新显示:', symptomListText);
      }
    }
  } catch (err) {
    console.error('立即加载症状出错:', err);
  }
},  // ← 这里需要逗号

cancelEdit: function() {
  wx.navigateBack();
}
})