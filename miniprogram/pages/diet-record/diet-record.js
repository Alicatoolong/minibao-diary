Page({
  data: {
    // 移除 isConfirmed 和 canSubmit 状态
    selectedMealTime: 'breakfast',
    dietContent: '',
    isEditMode: false,
    editingId: null,

    // 分析区需要的状态
    hasData: false,
    showHistory: false,
    historyRecords: [],
    totalRecords: 0,
    usedRecords: 0,
    latestDate: '',
    commonFoods: [],
    newFoods: [],
    decreasedFoods: [],
    newFoodsText: '',
    decreasedFoodsText: '',

    // 用餐时间映射
    mealTimeMap: {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐'
    }
  },

  // 选择用餐时间
  selectMealTime(e) {
    const mealTime = e.currentTarget.dataset.time;
    this.setData({
      selectedMealTime: mealTime
    });
  },

  // 饮食内容输入
  onDietInput(e) {
    const value = e.detail.value || '';
    this.setData({
      dietContent: value
    });
  },

  // 提交饮食记录（简化版）
  submitDietRecord() {
    const content = (this.data.dietContent || '').trim();

    if (!content) {
      wx.showToast({
        title: '请输入饮食内容',
        icon: 'none'
      });
      return;
    }

    if (!this.data.selectedMealTime) {
      wx.showToast({
        title: '请选择用餐时间',
        icon: 'none'
      });
      return;
    }

    const now = new Date();
    const iso = now.toISOString();

    // 编辑模式
    if (this.data.isEditMode && this.data.editingId) {
      try {
        const all = wx.getStorageSync('dietRecords') || [];
        const updated = all.map(item => {
          if (Number(item.id) === Number(this.data.editingId)) {
            return {
              ...item,
              mealTime: this.data.selectedMealTime,
              content: content,
              timestamp: iso,
              date: iso.split('T')[0]
            };
          }
          return item;
        });
        wx.setStorageSync('dietRecords', updated);

        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 1500
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } catch (e) {
        console.error('更新失败', e);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
      return;
    }

    // 新增模式
    const dietRecord = {
      id: now.getTime(),
      mealTime: this.data.selectedMealTime,
      content: content,
      timestamp: iso,
      date: iso.split('T')[0]
    };

    const success = this.saveDietRecord(dietRecord);
    if (success) {
      this.loadAndAnalyze();

      // 清空表单
      this.setData({
        dietContent: '',
        selectedMealTime: 'breakfast'
      });

      wx.showToast({
        title: '记录成功',
        icon: 'success',
        duration: 1500
      });
    }
  },

  // 保存饮食记录（仅新增时调用）
  saveDietRecord(record) {
    try {
      const existingRecords = wx.getStorageSync('dietRecords') || [];
      const updatedRecords = [...existingRecords, record];
      wx.setStorageSync('dietRecords', updatedRecords);
      console.log('饮食记录保存成功，当前记录数:', updatedRecords.length);
      return true;
    } catch (error) {
      console.error('保存饮食记录失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
      return false;
    }
  },

  // 读取历史记录并做分析
  loadAndAnalyze() {
    try {
      const records = wx.getStorageSync('dietRecords') || [];

      if (!records.length) {
        this.setData({
          hasData: false,
          totalRecords: 0,
          usedRecords: 0,
          latestDate: '',
          commonFoods: [],
          newFoods: [],
          decreasedFoods: [],
          newFoodsText: '',
          decreasedFoodsText: '',
          historyRecords: [],
          showHistory: false
        });
        return;
      }

      // 按时间从近到远排序
      records.sort((a, b) => (b.id || 0) - (a.id || 0));

      const usedRecords = records.slice(0, 30);
      const analysis = this.analyzeRecords(usedRecords);

      const newFoodsText = analysis.newFoods.length
        ? analysis.newFoods.map(item => item.name).join('  ')
        : '暂无明显新增食物';

      const decreasedFoodsText = analysis.decreasedFoods.length
        ? analysis.decreasedFoods.map(item => item.name).join('  ')
        : '暂无明显减少食物';

      this.setData({
        hasData: true,
        totalRecords: records.length,
        usedRecords: usedRecords.length,
        latestDate: usedRecords[0].date || '',
        commonFoods: analysis.commonFoods,
        newFoods: analysis.newFoods,
        decreasedFoods: analysis.decreasedFoods,
        newFoodsText,
        decreasedFoodsText,
        historyRecords: records
      });
    } catch (e) {
      console.error('读取饮食记录失败：', e);
      wx.showToast({
        title: '读取数据失败',
        icon: 'none'
      });
      this.setData({
        hasData: false,
        showHistory: false,
        historyRecords: []
      });
    }
  },

  // 分析记录：频次 + 新增 / 减少
  analyzeRecords(records) {
    const half = Math.ceil(records.length / 2);
    const recentPart = records.slice(0, half); // 最近
    const earlyPart = records.slice(half);     // 较早

    const totalMap = this.buildFoodMap(records);
    const recentMap = this.buildFoodMap(recentPart);
    const earlyMap = this.buildFoodMap(earlyPart);

    // 最近常吃食物
    const commonFoods = Object.keys(totalMap)
      .map(name => ({
        name,
        count: totalMap[name]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 新增：最近有、以前没有
    const newFoods = Object.keys(recentMap)
      .filter(name => !earlyMap[name])
      .map(name => ({ name }))
      .slice(0, 5);

    // 减少：以前有、最近没有
    const decreasedFoods = Object.keys(earlyMap)
      .filter(name => !recentMap[name])
      .map(name => ({ name }))
      .slice(0, 5);

    return {
      commonFoods,
      newFoods,
      decreasedFoods
    };
  },

  // 构建 { 食物: 次数 } map
  buildFoodMap(records) {
    const map = {};

    (records || []).forEach(record => {
      const content = record.content || '';
      const foods = this.splitFoods(content);

      foods.forEach(name => {
        if (!name) return;
        map[name] = (map[name] || 0) + 1;
      });
    });

    return map;
  },

  // 把一条文本拆成多个食物名称
  splitFoods(content) {
    if (!content) return [];

    let text = String(content);

    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, ',')
      .replace(/，/g, ',')
      .replace(/、/g, ',')
      .replace(/；/g, ',')
      .replace(/;/g, ',');

    const parts = text.split(',');
    const foods = [];

    parts.forEach(raw => {
      const item = raw.trim();
      if (!item) return;

      if (item.length > 0 && item.length <= 15) {
        foods.push(item);
      }
    });

    return foods;
  },

  // 点击“整体统计” → 展开 / 收起记录详情（不再滚动页面）
  toggleHistory() {
    const show = !this.data.showHistory;
    this.setData({ showHistory: show });
    console.log(show ? '📜 展开记录详情列表' : '📜 收起记录详情列表');
  },

  // 在本页编辑某条历史记录
  onEditHistory(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.historyRecords || [];
    const target = list.find(item => String(item.id) === String(id));
    if (!target) {
      wx.showToast({
        title: '未找到记录',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isEditMode: true,
      editingId: target.id,
      selectedMealTime: target.mealTime || 'breakfast',
      dietContent: target.content || '',
      // 这两个你之前说要移除，这里如果不需要可以删掉
      isConfirmed: false,
      canSubmit: false
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // 删除某条历史记录
  onDeleteHistory(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条饮食记录吗？',
      success: (res) => {
        if (!res.confirm) return;

        try {
          const all = wx.getStorageSync('dietRecords') || [];
          const remain = all.filter(item => String(item.id) !== String(id));
          wx.setStorageSync('dietRecords', remain);

          wx.showToast({
            title: '已删除',
            icon: 'success'
          });

          this.loadAndAnalyze();
        } catch (err) {
          console.error('删除失败', err);
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
