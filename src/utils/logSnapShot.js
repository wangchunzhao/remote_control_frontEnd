import uuidv1 from 'uuid/v1'
import { uploadFile } from '@/api/uploader'

export const logSnapShotFactory = element => {
  const fileName = uuidv1()
  const bucketName = 'back-end-assets'
  const objectName = 'log/'
  if (element) {
    html2canvas(element).then(function(canvas) {
      canvas.toBlob(
        blob => {
          const formData = new FormData()
          formData.append('$' + fileName, blob, fileName + '.jpeg')
          formData.append('BucketName', bucketName)
          formData.append('ObjectName', objectName)
          uploadFile(formData)
            .then(res => {
              if (res.data.Code !== 200) {
                console.error('日志快照上传失败')
              }
            })
            .catch(err => {
              console.error(err, '---日志快照上传失败')
            })
        },
        'image/jpeg',
        0.5
      )
    })
  } else {
    console.error('无效的元素，快照上传失败')
  }

  return {
    fileName: fileName + '.jpeg',
    bucketName,
    objectName
  }
}
