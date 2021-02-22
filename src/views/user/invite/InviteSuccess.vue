<template>
  <div
    style="background-color: rgba(244,245,246,1);position: fixed;top: 0;right: 0;bottom: 0; left: 0;"
  >
    <div class="success-panel">
      <img class="avatar" :src="avatar" alt="" />
      <div style="margin: 30px 0;color: black;font-size: 15px;">
        你已成功加入『{{ projectName }}』
      </div>
      <button
        @click="downloadApp"
        class="download-btn"
        type="primary"
        @click.native="downloadApp"
      >
        下载 CoolCare 应用
      </button>
      <div class="mask">
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAhIAAADdCAMAAADZwmvFAAAAllBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AJcWoAAAAMXRSTlMARHe7Ee4zZiLMmd1ViKr79QYdAuji0UoLghil1sfBYJN9UXJZjTi3ry9tJz8r3J4P3Jdy9wAAHTVJREFUeNrs1F0KAQEYRuHvgiJhkiQX/nOj1Lv/zZlpjMkW9DxrOJ0CAAAAAAAAAIC/dW5uBaNDMi0YNUlmBV9pXQt+klgWDDZpzQsGt7TWk4KPXTr3gt4jSZOsCnqrJNuk2Rd0nuski1dyKhgmkd0lORa82TWz9bRhIIyORruFDUnTJWm6t2mbpsv//i9XbOFIXgg4kBS+5lxgFlsGdDwajbzkBjVvT+fAd3riCTp5AbwFvlEFvKYnnqASWHwCftMVMP9JT/z3iDlwzcA5kTy2eagShiKGujiX70Y7IYSjHoabdostW7ayUkSmkjM6An5o4Ct9Aa5jeeKG9osE1xsBuddW2XVbBRTlWBS0okBB0zBlpzGAqYsFHJHzsDQCQ8bf3eLQXGse0EdQID79BTy/oCqug1bA5ckjKmG5h6OtEIATLGKrbJtuow5Vine2p4vgtYjYgxpe3aWEgzZE5Nv3jVxhx5UwWEIUAAg6dNxzYHFF9AYwtSALoNy5TY6INUo4scKRRA+xrWeSGBxbhRwa55BdwKHbpYy18K1E2tyhRIFZs1eVDI3wuBJUNkpYfQRK3JwB85dE9Hx1JV0Dc0G7IRBhJZZ4FPWG4euNyruE8ygRUGwdJWaA6yox6w0OnIdo7n5oZU4AvGxpNTIa2qxXQocYiNpdRPxxfqBEwqP55NCVOPkwBxa1Ea+ABTV8Bc7crkqEpotZYIDoKpEht/+3lEZJuRLxRU5AQRhBjgScQD2SE+NKOHihmm/siFIIjBaoXAmlWa0OqeLXOuxc4uUlgLMrWvId8NRwcQa8+LOjEjL+P0Yu0Qj1xkPXGxMvojSieIjJSngE1VOiGkR+t50S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"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      projectName: '',
      avatar: ''
    }
  },
  mounted() {
    this.projectName = this.$route.query.projectName
    this.avatar = this.$route.query.avatar
  },
  methods: {
    // 下载app
    downloadApp() {
      /*智能机浏览器版本信息:*/
      const browser = {
        versions: (function() {
          const u = navigator.userAgent
          return {
            //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile:
              !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
          }
        })(),
        language: (
          navigator.browserLanguage || navigator.language
        ).toLowerCase()
      }
      if (!this.isWeiXin()) {
        //非微信
        if (
          browser.versions.ios ||
          browser.versions.iPhone ||
          browser.versions.iPad
        ) {
          //苹果app下载
          location.href =
            'https://itunes.apple.com/us/app/coolcare/id1458343974?l=zh&ls=1&mt=8'
        } else if (browser.versions.android) {
          //安卓app下载
          location.href =
            'https://sinocold-1252924295.cos.ap-shanghai.myqcloud.com/RNCoolCare_APK/CoolCare.apk'
        } else {
          //PC下载
          location.href =
            'https://sinocold-1252924295.cos.ap-shanghai.myqcloud.com/RNCoolCare_APK/CoolCare.apk'
        }
      } else {
        //微信
        document.querySelector('.mask').style.display = 'block'
      }
    },
    // 判断是微信
    isWeiXin() {
      const ua = window.navigator.userAgent.toLowerCase()
      if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.success-panel {
  text-align: center;
  background-color: #fff;
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 6px;
  padding: 40px 0;
  margin: 0 20px;
  margin-top: 15%;
}

.avatar {
  width: 75px;
  height: 75px;
  border-radius: 50%;
}

.mask {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: right;
  background: rgba(0, 0, 0, 0.85);
}

.mask img {
  width: 80%;
}

.download-btn {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  -webkit-transition: 0.1s;
  transition: 0.1s;
  font-weight: 500;
  -moz-user-select: none;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
  color: #fff;
  text-transform: none;
  background-color: #409eff;
  border-color: #409eff;
}
</style>
