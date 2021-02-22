function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10)
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
    default:
      break
  }
}
const colors = [
  '#0074D9',
  '#7FDBFF',
  '#39CCCC',
  '#2ECC40',
  '#01FF70',
  '#FFDC00',
  '#FF851B',
  '#83E8BA',
  '#e3e0cf',
  '#89bdd3',
  '#e6cf8b',
  '#98dafc',
  '#62bcfa'
]

export default function avatarFactory(name) {
  //设置初始值,防止name为空时程序无法执行
  var nick = '未知'
  let fontSize = 14
  let fontWeight = 'normal'
  if (name.length === 1) {
    fontSize = 18
    nick = name
  } else {
    // 纯英文
    if (/^[a-zA-Z]+$/.test(name)) {
      fontSize = 17
      nick = name.substr(0, 2).toUpperCase()
    } else {
      nick = name.substr(name.length - 2, 2)
    }
  }

  let canvas = document.getElementById('avatar-canvas')
  if (canvas) {
    canvas.remove()
  } else {
    const el = document.createElement('canvas')
    el.setAttribute('id', 'avatar-canvas')
    document.body.append(el)
    canvas = document.getElementById('avatar-canvas')
  }
  canvas.width = 40
  canvas.height = 40
  let context = canvas.getContext('2d')
  //头像背景颜色设置
  context.fillStyle = colors[randomNum(0, 12)]
  context.fillRect(0, 0, canvas.width, canvas.height)
  //头像字体颜色设置
  context.fillStyle = '#FFFFFF'
  context.font = fontWeight + ' ' + fontSize + 'px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(nick, canvas.width / 2, canvas.height / 2)
  return canvas.toDataURL('image/png')
}
