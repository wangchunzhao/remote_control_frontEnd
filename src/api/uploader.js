import fetch from '@/utils/service'

// #region 上传文档 start
export const uploadFile = formData => {
  return fetch.post('/api/Uploader/Upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// #endregion 上传文档 end

// #region html转pdf start
export const htmlToPdf = formData => {
  return fetch.post('/api/Uploader/HtmlToPdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// #endregion html转pdf end
