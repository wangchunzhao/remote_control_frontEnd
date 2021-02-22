// utils: 更新您的浏览器
import Bowser from 'bowser'
import { Notification } from 'element-ui'
const browser = Bowser.getParser(window.navigator.userAgent)

const { version, name } = browser.getBrowser()

// 是否满足条件：Chrome(v >= 70) || Firefox(v >= 70)
let isSatisfies = false

// 支持的浏览器列表
const supportBrowserList = ['Microsoft Edge', 'Chrome', 'Firefox']

if (
  browser.satisfies({
    chrome: '>=60',
    firefox: '>=70',
    edge: '>= 80'
  })
) {
  isSatisfies = true
}

let text = ''
if (
  browser.satisfies({
    chrome: '<70'
  })
) {
  text = '版本过低（最新版本为 80）'
} else if (
  browser.satisfies({
    firefox: '<70'
  })
) {
  text = '版本过低（最新版本为 74）'
} else if (
  browser.satisfies({
    edge: '<80'
  })
) {
  text = '版本过低（最新版本为 81）'
}

const downloadUrlMap = {
  'Microsoft Edge': 'https://www.microsoft.com/zh-cn/edge/',
  Chrome: 'https://www.google.cn/chrome/',
  Firefox: 'http://www.firefox.com.cn/'
}

let messageHTML = `
  <div>
    检测到您的浏览器 (${name} ${version}) ${text}。当前浏览器可能存在兼容性问题，${
  supportBrowserList.includes(name)
    ? '请更新'
    : '请下载最新的<a target="_blank" style="color: #409EFF;" href="https://www.google.cn/chrome/"> Chrome </a>'
}浏览器进行操作。
    <div class="btn-wrap" style="margin-top: 15px;text-align: right;">
      <button type="button" id="browserUpdate-btn" class="el-button el-button--primary el-button--mini">${
        supportBrowserList.includes(name)
          ? 'supportBrowserList.includes(name)'
          : '下载'
      }</button>
    </div>
  </div>
`
if (!isSatisfies) {
  const instance = Notification({
    title: '浏览器兼容性提示',
    type: 'warning',
    position: 'bottom-left',
    customClass: 'browserUpdate-notify',
    duration: 0,
    dangerouslyUseHTMLString: true,
    message: messageHTML
  })

  setTimeout(() => {
    document
      .querySelector('#browserUpdate-btn')
      .addEventListener('click', () => {
        instance.close()
        if (supportBrowserList.includes(name)) {
          window.open(downloadUrlMap[name], '_blank')
        } else {
          window.open('https://www.google.cn/chrome/', '_blank')
        }
      })
  }, 50)
}
