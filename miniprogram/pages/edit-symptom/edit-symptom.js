Page({
  data: {
    selectedSymptom: 'asymptomatic',
    otherSymptomText: '',
    showOtherInput: false,
    
    // 基于YGTSS量表的症状分类
    symptomOptions: [
      // 无症状
      { value: 'asymptomatic', label: '无症状', desc: '今日无异常症状', weight: 0, category: 'none' },
      
      // 简单运动性抽动 - 权重 1.0
      { value: 'blink', label: '眨眼睛', desc: '频繁眨眼', weight: 1.0, category: 'simple_motor' },
      { value: 'nose', label: '抽鼻子', desc: '频繁抽动鼻子', weight: 1.0, category: 'simple_motor' },
      { value: 'eyebrow', label: '抬眉毛', desc: '眉毛不自觉抬起', weight: 1.0, category: 'simple_motor' },
      { value: 'mouth', label: '咧嘴', desc: '嘴角抽动咧嘴', weight: 1.0, category: 'simple_motor' },
      { value: 'head', label: '仰头摇头', desc: '头部不自主运动', weight: 1.0, category: 'simple_motor' },
      { value: 'shoulder', label: '耸肩膀', desc: '肩膀不自觉耸动', weight: 1.0, category: 'simple_motor' },
      
      // 复杂运动性抽动 - 权重 1.5
      { value: 'neck', label: '抻脖子', desc: '颈部伸展抽动', weight: 1.5, category: 'complex_motor' },
      { value: 'belly', label: '鼓肚子', desc: '腹部鼓动', weight: 1.5, category: 'complex_motor' },
      { value: 'wrist', label: '扭手腕', desc: '手腕扭动', weight: 1.5, category: 'complex_motor' },
      { value: 'ankle', label: '扭脚', desc: '脚踝扭动', weight: 1.5, category: 'complex_motor' },
      { value: 'jump', label: '跳跃', desc: '不自主跳跃动作', weight: 1.5, category: 'complex_motor' },
      { value: 'touch', label: '触摸', desc: '反复触摸物体', weight: 1.5, category: 'complex_motor' },
      
      // 简单发声性抽动 - 权重 2.0
      { value: 'throat', label: '清嗓子', desc: '频繁清喉咙', weight: 2.0, category: 'simple_vocal' },
      { value: 'cough', label: '咳嗽', desc: '无原因咳嗽', weight: 2.0, category: 'simple_vocal' },
      { value: 'sniff', label: '吸鼻子', desc: '频繁吸鼻子', weight: 2.0, category: 'simple_vocal' },
      { value: 'animal', label: '动物叫', desc: '发出动物叫声', weight: 2.0, category: 'simple_vocal' },
      { value: 'squeal', label: '尖叫', desc: '突然尖叫', weight: 2.0, category: 'simple_vocal' },
      
      // 复杂发声性抽动 - 权重 2.5
      { value: 'repeat', label: '重复词语', desc: '重复说某些词语', weight: 2.5, category: 'complex_vocal' },
      { value: 'echo', label: '模仿语言', desc: '模仿他人说话', weight: 2.5, category: 'complex_vocal' },
      { value: 'nonsense', label: '无意义短语', desc: '说无意义的话', weight: 2.5, category: 'complex_vocal' },
      
      // 秽语症 - 权重 3.0
      { value: 'coprolalia', label: '秽语', desc: '说脏话或不当言语', weight: 3.0, category: 'coprolalia' },
      { value: 'insult', label: '侮辱性语言', desc: '说侮辱性话语', weight: 3.0, category: 'coprolalia' },
      
      // 其他症状
      { value: 'compulsion', label: '强迫行为', desc: '强迫行为或思维', weight: 1.5, category: 'other' },
      { value: 'other', label: '其他症状', desc: '其他特殊症状', weight: 1.0, category: 'other' }
    ],
    
    severityLevels: [
      { level: 1, icon: '😊', label: '轻微', desc: '偶尔发生，不影响生活', color: '#52C41A', factor: 1.0 },
      { level: 2, icon: '😐', label: '中等', desc: '影响日常活动', color: '#FAAD14', factor: 1.5 },
      { level: 3, icon: '😰', label: '严重', desc: '频繁发作，严重影响', color: '#FF4D4F', factor: 2.0 }
    ],
    
    severityData: {
      level: 1,
      frequency: '',
      duration: '',
      description: ''
    },
    
    // 症状分类说明
    categoryInfo: {
      'simple_motor': { name: '简单运动抽动', color: '#1890FF', desc: '短暂、孤立的动作' },
      'complex_motor': { name: '复杂运动抽动', color: '#722ED1', desc: '较复杂、有目的的动作' },
      'simple_vocal': { name: '简单发声抽动', color: '#FA8C16', desc: '简单声音或噪音' },
      'complex_vocal': { name: '复杂发声抽动', color: '#EB2F96', desc: '词语或短语' },
      'coprolalia': { name: '秽语症', color: '#F5222D', desc: '不当或攻击性语言' },
      'other': { name: '其他症状', color: '#52C41A', desc: '其他相关症状' }
    }
  },

  onLoad: function(options) {
    console.log('🔄 症状编辑页面加载');
    // 如果有传入ID，说明是编辑模式
    if (options.id) {
      this.loadSymptomData(options.id);
    }
  },

  // 加载已有症状数据（编辑模式）
  loadSymptomData: function(id) {
    const records = wx.getStorageSync('symptomRecords') || [];
    const record = records.find(r => r.id == id);
    
    if (record) {
      this.setData({
        selectedSymptom: record.type || 'asymptomatic',
        otherSymptomText: record.otherText || '',
        showOtherInput: record.type === 'other',
        severityData: {
          level: record.level || 1,
          frequency: record.frequency || '',
          duration: record.duration || '',
          description: record.notes || ''
        }
      });
    }
  },

  // 选择症状类型
  selectSymptom: function(e) {
    const value = e.currentTarget.dataset.value;
    const showOtherInput = value === 'other';
    
    this.setData({
      selectedSymptom: value,
      showOtherInput: showOtherInput
    });
    
    // 显示症状分类信息
    const selectedOption = this.data.symptomOptions.find(opt => opt.value === value);
    if (selectedOption && selectedOption.category !== 'none') {
      const category = this.data.categoryInfo[selectedOption.category];
      wx.showToast({
        title: `${category.name} - 权重${selectedOption.weight}`,
        icon: 'none',
        duration: 2000
      });
    }
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

  // 计算频率影响因子
  calculateFrequencyFactor: function(frequency) {
    if (!frequency || frequency <= 10) return 1.0;
    if (frequency <= 30) return 1.2;
    if (frequency <= 50) return 1.5;
    if (frequency <= 100) return 1.8;
    return 2.0;
  },

  // 计算症状影响值
  calculateSymptomImpact: function() {
    const { selectedSymptom, otherSymptomText, severityData } = this.data;
    
    if (selectedSymptom === 'asymptomatic') {
      return 0; // 无症状，影响值为0
    }
    
    // 获取症状权重
    let weight = 1.0;
    if (selectedSymptom === 'other') {
      weight = 1.0; // 其他症状默认权重
    } else {
      const selectedOption = this.data.symptomOptions.find(opt => opt.value === selectedSymptom);
      weight = selectedOption ? selectedOption.weight : 1.0;
    }
    
    // 获取严重程度系数
    const severityLevel = this.data.severityLevels.find(level => level.level === severityData.level);
    const severityFactor = severityLevel ? severityLevel.factor : 1.0;
    
    // 计算频率影响因子
    const frequency = parseInt(severityData.frequency) || 0;
    const frequencyFactor = this.calculateFrequencyFactor(frequency);
    
    // 计算总影响值
    const impact = weight * severityFactor * frequencyFactor;
    
    console.log(`📊 症状影响计算: 权重${weight} × 严重${severityFactor} × 频率${frequencyFactor} = ${impact}`);
    
    return impact;
  },

  // 取消编辑
  cancelEdit: function() {
    wx.navigateBack();
  },

  // 保存症状
  saveSymptom: function() {
    const that = this;
    const { selectedSymptom, otherSymptomText, severityData } = this.data;

    // 验证数据
    if (selectedSymptom === 'other' && !otherSymptomText.trim()) {
      wx.showToast({
        title: '请输入其他症状描述',
        icon: 'none'
      });
      return;
    }

    // 获取症状详细信息
    let symptomName = '';
    let weight = 0;
    let category = 'none';
    
    if (selectedSymptom === 'asymptomatic') {
      symptomName = '无症状';
      weight = 0;
      category = 'none';
    } else if (selectedSymptom === 'other') {
      symptomName = otherSymptomText || '其他症状';
      weight = 1.0;
      category = 'other';
    } else {
      const selectedOption = this.data.symptomOptions.find(option => option.value === selectedSymptom);
      symptomName = selectedOption ? selectedOption.label : '未知症状';
      weight = selectedOption ? selectedOption.weight : 1.0;
      category = selectedOption ? selectedOption.category : 'other';
    }

    // 获取严重程度信息
    const severityLevel = this.data.severityLevels.find(level => level.level === severityData.level);
    const severityText = severityLevel ? severityLevel.label : '轻微';
    const severityFactor = severityLevel ? severityLevel.factor : 1.0;

    // 计算影响值
    const impact = this.calculateSymptomImpact();
    
    // 获取当前时间
    const now = new Date();
    const dateString = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    const timeString = now.toLocaleString('zh-CN');

    // 构建症状记录
    const newRecord = {
      id: new Date().getTime(),
      symptomName: symptomName,
      severity: severityText,
      severityLevel: severityData.level,
      severityFactor: severityFactor,
      time: timeString,
      date: dateString,
      notes: severityData.description || '',
      frequency: severityData.frequency,
      duration: severityData.duration,
      level: severityData.level,
      type: selectedSymptom,
      otherText: otherSymptomText,
      // 新增字段用于健康趋势计算
      weight: weight,
      category: category,
      impact: impact,
      frequencyFactor: this.calculateFrequencyFactor(parseInt(severityData.frequency) || 0),
      healthIndex: Math.max(0, 100 - (impact * 10)) // 计算健康指数
    };

    console.log('💾 保存症状记录:', newRecord);

    // 获取现有记录
    let existingRecords = wx.getStorageSync('symptomRecords') || [];
    
    // 如果是编辑模式，先删除原记录
    const options = getCurrentPages()[getCurrentPages().length - 1].options;
    if (options.id) {
      existingRecords = existingRecords.filter(record => record.id != options.id);
    }
    
    // 添加新记录
    existingRecords.push(newRecord);

    // 保存到缓存
    wx.setStorage({
      key: 'symptomRecords',
      data: existingRecords,
      success: function() {
        console.log('✅ 症状保存成功，记录总数:', existingRecords.length);
        console.log('📈 本次症状影响值:', impact);
        console.log('🏥 计算健康指数:', newRecord.healthIndex);
        
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
  }
})