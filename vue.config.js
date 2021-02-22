const path = require('path') //引入path模块（node）
const resolve = dir => path.join(__dirname, dir) //将文件组成绝对路径

module.exports = {
  publicPath: './',
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  chainWebpack: config => {
    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@assets', resolve('src/assets'))
      .set('@components', resolve('src/components'))
  },
  css: {
    loaderOptions: {
      sass: {
        // @/ 是 src/ 的别名
        data: `@import "~@/assets/style/variables.scss";`
      }
    }
  }
  // pwa: {
  //   iconPaths: {
  //     favicon32: 'favicon.ico',
  //     favicon16: 'favicon.ico',
  //     appleTouchIcon: 'favicon.ico',
  //     maskIcon: 'favicon.ico',
  //     msTileImage: 'favicon.ico'
  //   }
  // }
}
