// MQTT工具库 - 只提供工具函数，不负责连接

// 设备相关的主题
const TOPICS = {
  deviceData: '/k207mrvCv5H/xiaochengxu/user/wxget',     // 设备数据主题
  deviceControl: '/k207mrvCv5H/xiaochengxu/user/wxupdate', // 控制指令主题
}

// 处理设备数据 - 根据提供的格式解析
function processDeviceData(message, callbacks) {
  try {
    console.log('处理MQTT消息:', message)
    
    const payload = JSON.parse(message)
    
    // 检查是否有设备基本数据
    if (payload.hasOwnProperty('light') && 
        payload.hasOwnProperty('dist') && 
        payload.hasOwnProperty('fall_sta')) {
      
      const deviceData = {
        light: parseFloat(payload.light || 0).toFixed(1),
        distance: parseFloat(payload.dist || 0).toFixed(1),
        fallStatus: payload.fall_sta === 1
      }
      
      console.log('解析设备数据:', deviceData)
      
      if (callbacks && callbacks.onData) {
        callbacks.onData(deviceData)
      }
      
      // 如果摔倒了，检查是否有位置信息
     
    }
  } catch (e) {
    console.error('消息处理错误:', e.message)
  }
}

// 构建发送光线阈值的消息 - 格式: {"light_th": 200}
function buildLightThresholdMessage(threshold) {
  return JSON.stringify({
    light_th: parseInt(threshold)
  })
}

// 构建发送安全距离阈值的消息 - 格式: {"dist_th": 35}
function buildDistanceThresholdMessage(threshold) {
  return JSON.stringify({
    dist_th: parseInt(threshold)
  })
}

// 构建发送摔倒检测时长的消息 - 格式: {"fall_th": 3}
function buildFallThresholdMessage(threshold) {
  return JSON.stringify({
    fall_th: parseInt(threshold)
  })
}

export default {
  TOPICS,
  processDeviceData,
  buildLightThresholdMessage,
  buildDistanceThresholdMessage,
  buildFallThresholdMessage
}
