Page({
  data: {
    chatRecords: [], // 聊天记录
    inputValue: '', // 输入框内容
    isLoading: false, // 是否正在加载
    requestTask: null // 当前请求任务
  },

  onLoad: function (options) {
    this.initChat();
  },

  // 初始化聊天
  initChat: function() {
    const welcomeMessage = {
      content: '你好！我是你的专属学习助手，可以帮你解答各学科问题，有什么需要帮助的吗？',
      isUser: false,
      timestamp: new Date().getTime()
    };
    
    this.setData({
      chatRecords: [welcomeMessage]
    });
  },

  // 输入框内容变化
  bindInput: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 发送问题
  sendQuestion: function() {
    const question = this.data.inputValue.trim();
    
    if (!question) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      });
      return;
    }

    if (this.data.isLoading) {
      return;
    }

    // 添加用户消息到聊天记录
    const userMessage = {
      content: question,
      isUser: true,
      timestamp: new Date().getTime()
    };

    const updatedRecords = [...this.data.chatRecords, userMessage];
    
    this.setData({
      chatRecords: updatedRecords,
      inputValue: '',
      isLoading: true
    });

    // 滚动到底部
    this.scrollToBottom();

    // 调用 Coze AI 接口
    this.getCozeAIResponse(question);
  },

  // 调用 Coze AI 接口
  getCozeAIResponse: function(question) {
    // 显示加载状态
    wx.showLoading({
      title: '思考中...',
    });

    let aiResponse = '';
    let buffer = ''; // 用于存储缓冲数据

    // 创建请求任务
    const requestTask = wx.request({
      url: 'https://api.coze.cn/v3/chat',
      header: {
        'Authorization': 'Bearer pat_hFEJSGhxAHsdnpjuEXHDZJxuPNEhXVHFXCeezRkSQy1Zc056uQUQcBwuSYr4bKM3',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      data: {
        "bot_id": "7524127105165082643",
        "user_id": "123456789",
        "stream": true,
        "auto_save_history": true,
        "additional_messages": [
          {
            "role": "user",
            "content": question,
            "content_type": "text"
          }
        ]
      },
      enableChunked: true,
      responseType: 'arraybuffer',
      success: (res) => {
        wx.hideLoading();
        this.setData({
          isLoading: false
        });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        });
        
        // 添加错误提示消息
        const errorMessage = {
          content: '抱歉，AI助手暂时无法回应，请稍后重试~',
          isUser: false,
          timestamp: new Date().getTime()
        };
        
        const updatedRecords = [...this.data.chatRecords, errorMessage];
        this.setData({
          chatRecords: updatedRecords,
          isLoading: false
        });
      }
    });

    this.setData({ requestTask });

    // 监听分块数据接收
    requestTask.onChunkReceived((res) => {
      // 解析接收到的数据
      const chunk = this.decodeChunk(res.data);
      if (!chunk) return;

      buffer += chunk;
      
      // 处理完整的事件
      while (buffer.includes('\n\n')) {
        const endIndex = buffer.indexOf('\n\n');
        const eventData = buffer.substring(0, endIndex);
        buffer = buffer.substring(endIndex + 2);

        // 解析事件数据
        const lines = eventData.split('\n');
        let eventType = '';
        let jsonData = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            jsonData = line.substring(5).trim();
          }
        }

        // 处理不同类型事件
        if (eventType === 'conversation.message.delta' && jsonData) {
          try {
            const dataObj = JSON.parse(jsonData);
            if (dataObj.type === 'answer' && dataObj.content) {
              aiResponse += dataObj.content;
              
              // 更新最新的AI回复
              this.updateLastAIMessage(aiResponse);
            }
          } catch (e) {
            console.error('解析JSON数据出错:', e);
          }
        } else if (eventType === 'conversation.chat.completed') {
          // 对话完成，结束请求
          if (this.data.requestTask) {
            this.data.requestTask.abort();
          }
          wx.hideLoading();
          this.setData({
            isLoading: false,
            requestTask: null
          });
        }
      }
    });
  },

  // 更新最后一条AI消息
  updateLastAIMessage: function(content) {
    const updatedRecords = [...this.data.chatRecords];
    const lastRecord = updatedRecords[updatedRecords.length - 1];

    // 如果最后一条消息是AI消息，则更新它
    if (lastRecord && !lastRecord.isUser) {
      lastRecord.content = content;
    } else {
      // 否则添加新的AI消息
      const aiMessage = {
        content: content,
        isUser: false,
        timestamp: new Date().getTime()
      };
      updatedRecords.push(aiMessage);
    }

    this.setData({
      chatRecords: updatedRecords
    });

    // 滚动到底部
    this.scrollToBottom();
  },

  // 解码分块数据
  decodeChunk: function(buffer) {
    // 使用TextDecoder正确解码UTF-8格式数据
    try {
      const decoder = new TextDecoder('utf-8');
      const decodedString = decoder.decode(new Uint8Array(buffer));
      return decodedString;
    } catch (e) {
      console.error('解码数据出错:', e);
      // 兼容性处理，如果TextDecoder不可用则回退到原来的方法
      try {
        const uint8Array = new Uint8Array(buffer);
        let decodedString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          decodedString += String.fromCharCode(uint8Array[i]);
        }
        return decodedString;
      } catch (fallbackError) {
        console.error('回退解码方法也失败了:', fallbackError);
        return '';
      }
    }
  },

  // 滚动到底部
  scrollToBottom: function() {
    setTimeout(() => {
      wx.createSelectorQuery().select('.chat-window').boundingClientRect(function(rect){
        wx.pageScrollTo({
          scrollTop: rect.bottom,
          duration: 300
        });
      }).exec();
    }, 100);
  },
})