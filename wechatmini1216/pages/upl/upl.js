// pages/upl/upl.js
Page({
  data: {
    filePath:'',
    fileName:'无',
    isUploading:false, 
    uploadResult: null,
    uploadProgress: 0,
    fileSize: ''
  },
  onLoad(options) {},

  chooseFile(){
    wx.chooseMessageFile({
      count: 1,
      type:'file',
      success: res =>{
        const file = res.tempFiles[0]
        const size = (file.size / 1024 / 1024).toFixed(2);
        this.setData({
          filePath: file.path,
          fileName: file.name,
          fileSize: ' 大小:' + size + 'MB',
          uploadProgress: 0 // 重置进度
        })
      },
      fail: (err) => {
        wx.showToast({ 
          title: '选择文件失败',
          icon: 'none' 
        });
      }
    })
  },

  upload(){
    if(!this.data.filePath){
      wx.showToast({
        title: '未选择文件',
        icon: 'none'
      })
      return;
    }

    if(this.data.isUploading){
      wx.showToast({
        title: '正在上传中...',
        icon: 'none'
      })
      return;
    }

    // 设置上传状态
    this.setData({
      isUploading: true,
      uploadProgress: 0
    });

    // 显示加载中
    wx.showLoading({
      title: '上传中...',
    });

    // 模拟上传进度
    this.simulateUpload();
  },

  // 模拟上传过程 - 按照要求的速度变化
  simulateUpload() {
    const totalTime = 3000; // 总时间3秒
    let elapsedTime = 0;
    
    // 定义不同阶段的进度变化函数
    const stages = [
      {
        // 1-40: 上升比较快 (0-1250ms)
        duration: 1250,
        getProgress: (time) => 1 + (39 * time / 1250)
      },
      {
        // 41-55: 稍慢 (1250-1750ms)
        duration: 500,
        getProgress: (time) => 40 + (15 * time / 500)
      },
      {
        // 56-77: 最快 (1750-2250ms)
        duration: 500,
        getProgress: (time) => 55 + (22 * time / 500)
      },
      {
        // 78-99: 中等 (2250-2500ms)
        duration: 250,
        getProgress: (time) => 77 + (22 * time / 250)
      },
      {
        // 99-100: 需要0.5秒 (2500-3000ms)
        duration: 500,
        getProgress: (time) => 99 + (1 * time / 500)
      }
    ];

    let currentStage = 0;
    let stageStartTime = 0;

    const updateProgress = () => {
      if (elapsedTime >= totalTime) {
        this.uploadComplete();
        return;
      }

      const stage = stages[currentStage];
      const stageElapsed = elapsedTime - stageStartTime;
      
      if (stageElapsed >= stage.duration) {
        // 进入下一阶段
        elapsedTime = stageStartTime + stage.duration;
        stageStartTime = elapsedTime;
        currentStage++;
        
        if (currentStage >= stages.length) {
          this.setData({ uploadProgress: 100 });
          this.uploadComplete();
          return;
        }
      } else {
        // 在当前阶段内更新进度
        const progress = Math.floor(stage.getProgress(stageElapsed));
        this.setData({ uploadProgress: progress });
      }

      elapsedTime += 50; // 每50ms更新一次
      setTimeout(updateProgress, 50);
    };

    updateProgress();
  },

  // 上传完成处理
  uploadComplete() {
    wx.hideLoading();
    
    this.setData({
      isUploading: false,
      uploadProgress: 100
    });

    wx.showToast({
      title: '上传完成',
      icon: 'success',
      duration: 2000
    });

    // 重置文件选择显示区
    setTimeout(() => {
      this.resetUpload();
    }, 2000);
  },

  resetUpload() {
    this.setData({
      filePath: '',
      fileName: '无',
      fileSize: '',
      uploadResult: null,
      uploadProgress: 0,
      isUploading: false
    });
  },

})