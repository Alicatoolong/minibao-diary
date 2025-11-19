// pages/experience-list/experience-list.js
const STORAGE_KEY = 'experiencePosts';

// 默认种子数据
const DEFAULT_POSTS = [
  {
    id: 1,
    author: '乐乐妈妈',
    title: '孩子不爱吃饭，我是怎么办的',
    content: '乐乐前阵子不爱吃饭，我是这样做的。',
    likes: 12,
    cheers: 5,
    createdAt: '2025-11-01 10:00',
    isMine: false
  },
  {
    id: 2,
    author: '辰辰妈妈',
    title: '睡前总想玩怎么办？',
    content: '我们家辰辰睡前总想玩一会儿。',
    likes: 8,
    cheers: 3,
    createdAt: '2025-11-02 09:30',
    isMine: false
  },
  {
    id: 3,
    author: '果果妈妈',
    title: '多喝水',
    content: '孩子多喝水真的很好。',
    likes: 15,
    cheers: 9,
    createdAt: '2025-11-03 14:20',
    isMine: false
  }
];

Page({
  data: {
    allPosts: [],      // 原始数据
    posts: [],         // 当前展示的数据
    currentSort: 'hot',   // hot | new
    currentScope: 'all',  // all | mine
    myAuthorName: '乐乐妈妈' // 暂定
  },

  onLoad() {
    this.loadPosts();
  },

  onShow() {
    this.loadPosts();
  },

  // 从本地存储加载帖子
  loadPosts() {
    try {
      let stored = wx.getStorageSync(STORAGE_KEY) || [];
      if (!stored.length) {
        stored = DEFAULT_POSTS;
        wx.setStorageSync(STORAGE_KEY, stored);
      }

      this.setData(
        {
          allPosts: stored
        },
        () => {
          this.updatePosts();
        }
      );
    } catch (e) {
      console.error('加载经验帖子失败:', e);
      this.setData({ allPosts: [], posts: [] });
    }
  },

  // 根据当前筛选 & 排序，生成 posts
  updatePosts() {
    const { allPosts, currentSort, currentScope, myAuthorName } = this.data;
    let list = allPosts.slice();

    // 先按“我发布的”过滤
    if (currentScope === 'mine') {
      list = list.filter(
        (p) => p.isMine || p.author === myAuthorName
      );
    }

    // 排序
    if (currentSort === 'hot') {
      list.sort((a, b) => {
        const scoreA = (a.likes || 0) + (a.cheers || 0);
        const scoreB = (b.likes || 0) + (b.cheers || 0);
        return scoreB - scoreA;
      });
    } else if (currentSort === 'new') {
      // 简单用 id 倒序（你是用时间戳当 id 的）
      list.sort((a, b) => b.id - a.id);
    }

    this.setData({ posts: list });
  },

  // 切换排序：最热 / 最新
  onSortTap(e) {
    const sort = e.currentTarget.dataset.sort;
    if (sort === this.data.currentSort) return;

    this.setData(
      {
        currentSort: sort
      },
      () => {
        this.updatePosts();
      }
    );
  },

  // 切换范围：全部 / 我发布的
  onScopeTap(e) {
    const scope = e.currentTarget.dataset.scope;
    if (scope === this.data.currentScope) return;

    this.setData(
      {
        currentScope: scope
      },
      () => {
        this.updatePosts();
      }
    );
  },

  goBack() {
    wx.navigateBack();
  },

  // 去发经验
  goToPostEdit() {
    wx.navigateTo({
      url: '/pages/experience-edit/experience-edit'
    });
  },
// 点击某条经验 → 进入详情页
goToDetail: function(e) {
  const id = e.currentTarget.dataset.id;
  if (!id) return;

  wx.navigateTo({
    url: `/pages/experience-detail/experience-detail?id=${id}`
  });
},
  // 去某条详情：用 ?id=xxx 的形式，方便详情页做上一条/下一条
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    wx.navigateTo({
      url: `/pages/experience-detail/experience-detail?id=${id}`
    });
  }
});
