Page({
  data: {
    currentTime: '',
    All_learn_time: "00:00:00",
    Today_learn_time: "00:00:00",
    daytime: '',
    user: '',
    sentences: ''
  },

  onLoad: function() {
    // 更新时间显示
    this.updateTime();
    this.timer = setInterval(() => {
      this.updateTime();
    }, 1000);

    // 获取用户信息及学习时长
    const app = getApp();
    const time = app.globalData.learnTime;
    const H = Math.floor(time / 3600);
    const M = Math.floor((time % 3600) / 60);
    const S = time % 60;
    this.setData({
      Today_learn_time: `${this.formatTime(H)}:${this.formatTime(M)}:${this.formatTime(S)}`,
      All_learn_time: `${this.formatTime(H)}:${this.formatTime(M)}:${this.formatTime(S)}`
    });


 
    const sents = app.globalData.sentences;
    const randomNum = Math.floor(Math.random() * 200);
    this.setData({sentences: sents[randomNum]})
    // 修正为 globalData
    if (app.globalData.USERNAME) {
      this.setData({ 
        user: app.globalData.USERNAME
      });

      // 获取今日学习时长
      wx.cloud.callFunction({
        name: 'study_record',
        data: {
          type: 'get',
          username: app.globalData.USERNAME // 修正为 globalData
        },
        success: (res) => {
          if (res.result && res.result.code === 200) {
            const totalSeconds = res.result.data.totalSeconds;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            this.setData({
              Today_learn_time: `${this.formatTime(hours)}:${this.formatTime(minutes)}:${this.formatTime(seconds)}`
            });
          }
        },
        fail: (err) => {
          console.error('获取学习时长失败:', err);
        }
      });
    }
  },
  //切换页面时卸载函数
  onUnload: function() {
    clearInterval(this.timer);
  },
  //显示时间函数
  updateTime: function() {
    const now = new Date();
    const hours = this.formatTime(now.getHours());
    const minutes = this.formatTime(now.getMinutes());
    const seconds = this.formatTime(now.getSeconds());
    let period;
    //打招呼
    if (hours <= 11) {
      period = "上午好 ";
    } else if (hours <= 13) {
      period = "中午好 ";
    } else if (hours <= 17) {
      period = "下午好 ";
    } else {
      period = "晚上好 ";
    }
    this.setData({
      currentTime: `${hours}:${minutes}:${seconds}`,
      daytime: period,
    });
    
  },
  //00:00:00格式化时间函数
  formatTime: function(time) {
    return time < 10 ? `0${time}` : time;
  },
  /*
  openEmbeddedMiniProgram() {
    wx.openEmbeddedMiniProgram({
      appId: 'wxf8cb706022205f40', // 小微智能体的 appId
      path: '/sub_main/pages/ai-chat/index?id=6222426211', // 跳转路径和参数
      envVersion: 'release', // 可选值：develop（开发）trial（体验）release（正式）
      extraData: {
        // 可选：传递给目标小程序的数据
        from: 'main_mini_program'
      },
      success: (res) => {
        // 打开成功
        console.log('跳转成功:', res);
      },
      fail: (err) => {
        // 打开失败
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  }*/
})
