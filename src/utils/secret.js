const CryptoJS = require('crypto-js') //引用AES源码js

const key = CryptoJS.enc.Utf8.parse('1234123412ABCDEF') //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412') //十六位十六进制数作为密钥偏移量

/**
 * 解密方法(base64字符串解密后转成普通字符串)
 *
 * @param {*} base64String base64字符串
 * @returns·解密后的字符串
 */
export function Decrypt(base64String) {
  let decrypt = CryptoJS.AES.decrypt(base64String, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString(CryptoJS.enc.Utf8)
}

/**
 * 加密方法(使用aes加密后转成base64字符串)
 *
 * @param {*} word 需要加密的字符串
 * @returns 加密结果转成的base64字符串
 */
export function Encrypt(string) {
  let srcs = CryptoJS.enc.Utf8.parse(string)
  let encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
}
