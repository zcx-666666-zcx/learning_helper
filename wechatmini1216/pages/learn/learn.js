const mqttUtil = require('../../utils/mqtt').default // 导入MQTT工具
const mqtt = require('../../utils/mqtt.min.js') // 导入MQTT库

let client = null // MQTT客户端实例

Page({
  data: {
    // 学习时间
    learn_time:'00:00:00',
    seconds: 0,
    timer: null,
    learn: "开始学习",
    start: false,
    // 灯、身体、眼睛
    light: false,
    body: true,
    eye: true,
    body_time: 0,
    eye_time: 0,
    // MQTT连接状态
    mqttConnected: false,
    mqttConnecting: false,
    // 设备状态文本颜色控制
    lightStatus: 'yellow',
    bodyStatus: 'yellow',
    eyeStatus: 'yellow',
    // 设备状态文本内容
    lightText: '未检测',
    bodyText: '未检测',
    eyeText: '未检测',
    // 姿态状态跟踪
    currentPosture: null, // 当前姿态状态
    postureStartTime: null, // 当前姿态开始时间
    postureRecords: [] // 姿态记录列表
  },

  onUnload() {
    clearInterval(this.data.timer)
    this.disconnectMQTT() // 页面卸载时断开MQTT连接
  },

  StartTimer: function () {
    if (this.data.start == false) {
      this.setData({
        learn: "结束学习",
        start: true,
        // 初始化姿态跟踪数据
        currentPosture: null,
        postureStartTime: null,
        postureRecords: [],
        body_time: 0,
        eye_time: 0
      })

      this.data.timer = setInterval(() => {
        this.setData({
          seconds: this.data.seconds + 1
        }, () => {
          this.formatTime()
        })
      }, 1000)

      // 开始连接MQTT
      this.connectMQTT()
    } 
    else {
      // 结束学习时，保存当前姿态记录
      if (this.data.currentPosture && this.data.postureStartTime) {
        const now = new Date();
        const duration = Math.floor((now - this.data.postureStartTime) / 1000);
        const postureRecord = {
          postureType: this.data.currentPosture,
          startTime: this.data.postureStartTime.toISOString(),
          endTime: now.toISOString(),
          duration: duration
        };
        
        this.setData({
          postureRecords: [...this.data.postureRecords, postureRecord]
        });
      }

      this.setData({
        learn: "开始学习",
        start: false
      })

      const app = getApp();
      app.globalData.learnTime = app.globalData.learnTime + this.data.seconds;

      // 计算不良姿态和疲劳时长
      let poorPostureDuration = 0;
      let fatigueDuration = 0;
      
      this.data.postureRecords.forEach(record => {
        if (record.postureType === 'POOR') {
          poorPostureDuration += record.duration;
        } else if (record.postureType === 'FATIGUE') {
          fatigueDuration += record.duration;
        }
      });
      
      this.setData({
        body_time: poorPostureDuration,
        eye_time: fatigueDuration
      });

      const time = this.data.seconds
/*
     // 保存学习记录到小程序云函数
      wx.cloud.callFunction({
        name: 'study_records',
        data: {
          type: 'add',
          seconds: time,
          username: app.globalData.USERNAME
        },
        success: (res) => {
          if (res.result && res.result.code === 200) {
            wx.showToast({ title: '学习记录已保存', icon: 'success' })
          } else {
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        },
        fail: (err) => {
          wx.showToast({ title: '网络错误', icon: 'none' })
          console.error(err)
          wx.showToast({ title: '已保存', icon: 'none' })
        }
      })
*/
      // 将学习数据发送到您的后端服务器
      this.sendStudyDataToBackend({
        userId: app.globalData.USER_ID || 3, // 默认为3，实际使用时应从全局变量获取
        totalDuration: this.data.seconds,
        fatigueDuration: fatigueDuration,
        poorPostureDuration: poorPostureDuration,
        postureRecords: this.data.postureRecords,
        username: app.globalData.USERNAME
      });

      this.resetTimer()
      this.disconnectMQTT() // 断开MQTT连接
    }
  },

  // 发送学习数据到后端服务器
  sendStudyDataToBackend: function(data) {
    const app = getApp();
    const startTime = new Date(Date.now() - data.totalDuration * 1000);
    const endTime = new Date();
    
    // 第一步：创建学习会话
    wx.request({
      url: 'http://localhost:3000/api/study/session', // 注意：这里使用你实际的服务器地址
      method: 'POST',
      data: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalDuration: data.totalDuration,
        fatigueDuration: data.fatigueDuration,
        poorPostureDuration: data.poorPostureDuration
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('学习会话创建成功:', res);
        if (res.data.success && res.data.data) {
          // 第二步：发送姿态记录
          const sessionId = res.data.data.id;
          this.sendPostureData(sessionId, data.postureRecords);
        }
      },
      fail: (err) => {
        console.error('学习会话创建失败:', err);
      }
    });
  },

  // 发送姿态数据
  sendPostureData: function(sessionId, postures) {
    if (!postures || postures.length === 0) {
      console.log('没有姿态数据需要发送');
      wx.showToast({ title: '学习数据已保存', icon: 'success' });
      return;
    }
    
    wx.request({
      url: 'http://localhost:3000/api/study/postures', // 注意：这里使用你实际的服务器地址
      method: 'POST',
      data: postures,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('姿态数据发送成功:', res);
        if (res.data.success) {
          wx.showToast({ title: '学习数据已保存', icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('姿态数据发送失败:', err);
      }
    });
  },

  // 计时函数
  formatTime() {
    const sec = this.data.seconds
    const hours = Math.floor(sec / 3600)
    const minutes = Math.floor((sec % 3600) / 60)
    const seconds = sec % 60
    const format = num => num.toString().padStart(2, '0')
    this.setData({
      learn_time: `${format(hours)}:${format(minutes)}:${format(seconds)}`
    })
  },

  // 时间重置函数
  resetTimer: function () {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
    this.setData({
      learn_time: '00:00:00',
      seconds: 0,
      timer: null
    })
  },

  // 连接MQTT
  connectMQTT: function () {
    if (this.data.mqttConnected || this.data.mqttConnecting) {
      wx.showToast({ title: '已连接或正在连接', icon: 'none' })
      return
    }

    this.setData({ mqttConnecting: true })

    wx.showLoading({ title: '正在连接服务器' })

    this.doConnect()
  },

  doConnect: function () {
    console.log('连接MQTT服务器')

    const options = {
      clientId: 'k207mrvCv5H.xiaochengxu|securemode=2,signmethod=hmacsha256,timestamp=1753024836831|',
      username: 'xiaochengxu&k207mrvCv5H',
      password: '883eeb06f7f3faf48536039b0ff984321fcf8466ef4e0655bd2b32fbd3a81827',
      port: 443,
      clean: true,
      keepalive: 60,
      protocolVersion: 4
    }

    const connectUrl = 'wxs://iot-06z00faknsj8rav.mqtt.iothub.aliyuncs.com:443'

    client = mqtt.connect(connectUrl, options)

    client.on('connect', () => {
      console.log('MQTT连接成功')
      this.subscribeTopic()
      this.setData({ mqttConnected: true, mqttConnecting: false })
      wx.hideLoading()
      wx.showToast({ title: '设备已连接', icon: 'success' })
    })

    client.on('message', (topic, message) => {
      console.log('收到MQTT消息:', { topic: topic, message: message.toString() })
      try {
        if (topic === mqttUtil.TOPICS.deviceData) {
          // 直接处理原始数据，根据接收到的数据更新状态显示
          const messageStr = message.toString();
          console.log('设备数据:', messageStr)
          this.updateDeviceStatus(messageStr)
        }
      } catch (error) {
        console.error('处理消息失败:', error)
      }
    })

    client.on('error', (error) => {
      console.error('MQTT错误:', error)
      this.setData({ mqttConnected: false, mqttConnecting: false })
      wx.hideLoading()
      wx.showToast({ title: '连接出错', icon: 'error' })
    })

    client.on('close', () => {
      console.log('MQTT连接关闭')
      this.setData({ mqttConnected: false, mqttConnecting: false })
      wx.hideLoading()
    })
  },

  // 更新设备状态显示
  updateDeviceStatus: function(data) {
    const dataStr = data.toString();
    const now = new Date();
    
    // 处理光照强度状态（前两位数字）
    let lightStatus = 'red';
    let lightText = '未检测';
    const lightValue = parseInt(dataStr.substring(0, 2));
    if (!isNaN(lightValue)) {
      if (lightValue > 15) {
        lightStatus = 'green';
        lightText = '正常';
      } else {
        lightStatus = 'yellow';
        lightText = '异常';
      }
    }
    
    // 处理姿态检测状态（第三位数字）
    let bodyStatus = 'red';
    let bodyText = '未检测';
    let newPosture = null;
    
    if (dataStr.charAt(2) === '6') {
      bodyStatus = 'green';
      bodyText = '正常';
      newPosture = 'GOOD';
    } else if (dataStr.charAt(2) === '7') {
      bodyStatus = 'yellow';
      bodyText = '异常';
      newPosture = 'POOR';
    } else if (dataStr.charAt(2) === '3') {
      // 未检测到姿态，保持原状态
      bodyStatus = this.data.bodyStatus;
      bodyText = '未检测';
    }
    
    // 处理专注检测状态（第四位数字）
    let eyeStatus = 'red';
    let eyeText = '未检测';
    if (dataStr.charAt(3) === '4') {
      eyeStatus = 'green';
      eyeText = '正常';
      if (!newPosture) newPosture = 'GOOD'; // 如果姿态未设置，设置为正常
    } else if (dataStr.charAt(3) === '5') {
      eyeStatus = 'yellow';
      eyeText = '疲劳';
      newPosture = 'FATIGUE';
    }
    
    // 检查姿态是否发生变化
    if (newPosture !== this.data.currentPosture) {
      // 如果之前有姿态记录，保存之前的姿态
      if (this.data.currentPosture && this.data.postureStartTime) {
        const duration = Math.floor((now - this.data.postureStartTime) / 1000);
        const postureRecord = {
          postureType: this.data.currentPosture,
          startTime: this.data.postureStartTime.toISOString(),
          endTime: now.toISOString(),
          duration: duration
        };
        
        this.setData({
          postureRecords: [...this.data.postureRecords, postureRecord]
        });
      }
      
      // 更新当前姿态和开始时间
      this.setData({
        currentPosture: newPosture,
        postureStartTime: newPosture ? now : null
      });
    }
    
    // 更新界面显示
    this.setData({
      lightStatus: lightStatus,
      bodyStatus: bodyStatus,
      eyeStatus: eyeStatus,
      lightText: lightText,
      bodyText: bodyText,
      eyeText: eyeText
    });
  },

  // 订阅主题
  subscribeTopic: function () {
    if (!client) return
    client.subscribe(mqttUtil.TOPICS.deviceData, { qos: 0 }, (err) => {
      if (!err) console.log('订阅成功:', mqttUtil.TOPICS.deviceData)
      else console.error('订阅失败:', err)
    })
  },

  // 断开MQTT连接
  disconnectMQTT: function () {
    if (!client || !this.data.mqttConnected) return

    try {
      client.end()
      client = null
      this.setData({ mqttConnected: false })
      wx.showToast({ title: '已断开连接', icon: 'success' })
    } catch (error) {
      console.error('断开连接失败:', error)
      wx.showToast({ title: '断开连接失败', icon: 'error' })
    }
  }
})
