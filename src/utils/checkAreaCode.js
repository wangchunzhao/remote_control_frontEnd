// 获取手机区号
export const getAreaCode = phone => {
  if (/^\+886\d{1,}/.test(phone)) {
    return { phone: phone.replace('+886', ''), areaCode: '+886' }
  } else if (/^\+852\d{1,}/.test(phone)) {
    return { phone: phone.replace('+852', ''), areaCode: '+852' }
  } else if (/^\+853\d{1,}/.test(phone)) {
    return { phone: phone.replace('+853', ''), areaCode: '+853' }
  }
  return { phone: phone, areaCode: '+86' }
}

// 通过手机号和区号验证正确性
export const validatePhone = (areaCode, phone) => {
  let res = true
  switch (areaCode) {
    case '+86': // 大陆
      if (!/^[1]([3-9])[0-9]{9}$/.test(phone)) {
        res = false
      }
      break
    case '+886': // 台湾
      if (!/^9[0-9]{8}$/.test(phone)) {
        res = false
      }
      break
    default:
      break
  }
  return res
}
