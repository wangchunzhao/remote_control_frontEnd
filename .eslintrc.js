module.exports = {
  root: true,
  env: {
    node: true
  },
  //指定环境为我们提供了预置的全局变量
  //对于那些我们自定义的全局变量，可以用globals指定
  //设置每个变量等于true允许变量被重写，或false不允许被重写
  globals: {
    XLSX: true,
    echarts: true,
    _host: true,
    BASE_URI: true,
    BMap: true,
    ckplayer: true,
    BMapLib: true,
    CanvasLayer: true,
    fabric: true,
    html2canvas: true,
    PLATFORM: true
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    "vue/no-use-v-if-with-v-for": "off",
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'semi': [2, 'never'],
    // "quotes": ["error", "single"]
    'prettier/prettier': [
      'warn',
      {
        '#': 'prettier config in here :)',
        singleQuote: true,
        semi: false,
        trailingComma: 'none'
      }
    ]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
