export default {
  init: function() {
    // ("初始化百度地图脚本...");
    const AK = 'W0wjQm4FqLiYsXrf7biyRHTO769bxeMQ'
    const BMap_URL =
      'https://api.map.baidu.com/api?v=2.0&ak=' +
      AK +
      '&s=1&callback=onBMapCallback'
    return new Promise(resolve => {
      // 如果已加载直接返回
      if (typeof BMap !== 'undefined') {
        resolve(BMap)
        return true
      }
      // 百度地图异步加载回调处理
      window.onBMapCallback = function() {
        resolve(BMap)
      }

      // 插入script脚本
      let scriptNode = document.createElement('script')
      scriptNode.setAttribute('type', 'text/javascript')
      scriptNode.setAttribute('src', BMap_URL)
      document.body.appendChild(scriptNode)
    })
  }
}
