export const generateHtml = groupList => {
  const checkBox =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgEAYAAAAj6qa3AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAWNJREFUaN7tmDGKwkAUhv9ZNpUKQrDLDUyhpbUELAMqnkE9gYWWOYKCR0jsrQLGRg+QFNqaRtAuNirMFuukWWTsnqzv6wJ5yff/zDQPYBjmkxG6F2rr2rq2rlTu6T29p7MZBhhg0GrBggWrUKAOkJMiRXq5YIcddsvldXwdX8f9/n6+n+/np9OzsS/dd/PgHjx47fbbBVcoryaaaHY6hmM4hjOd6sa0J8Au22W7nGX5DwQExOEgJ3IiJ9stde4cFy7cRkPURV3ULQsmTJhZFkdxFEel0rOx75ebfSBXciVXm01iJmZi9nrUuRXVoBpUA9//fep2ccYZ52JRN6e9Av8dLoBagBougFqAGi6AWoAaLoBagBougFqAGi6AWoAaLoBagBougFqAmo9fiekLONpH+xgEatlInfNVZCQjGfm+bnWnvQJqvYwQIcLFQjVLHfAPDy8V/Da6jW6j4ZBai2GY9+YHlaOQTASlMNAAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMDgtMTZUMTQ6NDI6MzgrMDg6MDCYyusZAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTA4LTE2VDE0OjQyOjM4KzA4OjAw6ZdTpQAAAEx0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vaG9tZS9hZG1pbi9pY29uLWZvbnQvdG1wL2ljb25fOGE1dDZ5dTliNXQvY2hlY2stYm94LnN2Z7PwjUgAAAAASUVORK5CYII='
  const radio =
    'data:image/png;base64,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'
  let groupHtml = ''
  groupList.forEach(group => {
    groupHtml += `
      <tr style="background-color: #E7E6E6;"">
        <td>${group.name}</td>
      </tr>`
    // item: {
    //   contents: [] | {} | null,
    //   itemId: 23,
    //   name: 'i am name',
    //   order: 1
    //   templateType: 0 | 1 | 2 | 3 |4
    // }
    group.items.forEach((item, index) => {
      let temp = ''
      if (item.templateType === 0) {
        item.contents.forEach(content => {
          temp += `<img style="width: 16px;height: 16px;vertical-align: middle;margin-right: 6px;" src="${radio}" />${content.value}<br>`
        })
      } else if (item.templateType === 1) {
        item.contents.forEach(content => {
          temp += `<div>${content.name}：${content.referenceValue}${content.unit}</div>`
        })
      } else if (item.templateType === 2) {
        temp = `
          <img style="width: 16px;height: 16px;vertical-align: middle;margin-right: 6px;" src="${radio}" />是<br>
          <img style="width: 16px;height: 16px;vertical-align: middle;margin-right: 6px;" src="${radio}" />否<br>
        `
      } else if (item.templateType === 3) {
        temp = `
          <div>${item.contents.value}</div>
        `
      } else if (item.templateType === 4) {
        item.contents.forEach(content => {
          temp += `<img style="width: 16px;height: 16px;vertical-align: middle;margin-right: 6px;" src="${checkBox}" />${content.value}<br>`
        })
      }
      groupHtml += `
        <tr>
          <td>
            <div>
              ${index + 1}. ${item.name}
            </div>
            <div class="item-box">
              ${temp}
            </div>
          </td>
        </tr>
      `
    })
  })
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
      body {
        font-size: 20px;
      }
      table {
        border-collapse: collapse;
        border-spacing: 0px;
      }
      table,
      th,
      td {
        padding: 5px;
        border: 1px solid #000;
      }
      .item-box {
        margin: 10px 0 0 15px;
      }
    </style>
  </head>
  <body>
    <div style="padding: 12px;text-align: center;font-size: 25px;font-weight: bold;border: 1px solid;">保养报告</div>
    <table style="width: 100%;margin: 32px 0;">
      <tr>
        <td style="width: 15%;background-color: #E7E6E6;">工单号</td>
        <td style="width: 35%;"></td>
        <td style="width: 15%;background-color: #E7E6E6;">保养日期</td>
        <td style="width: 35%;"></td>
      </tr>
      <tr>
        <td style="width: 15%;background-color: #E7E6E6;">维保单位</td>
        <td style="width: 35%;"></td>
        <td style="width: 15%;background-color: #E7E6E6;">地址</td>
        <td style="width: 35%;"></td>
      </tr>
      <tr>
        <td style="width: 15%;background-color: #E7E6E6;">维保人</td>
        <td style="width: 35%;"></td>
        <td style="width: 15%;background-color: #E7E6E6;">联系电话</td>
        <td style="width: 35%;"></td>
      </tr>
      <tr>
        <td style="width: 15%;background-color: #E7E6E6;">验收内容</td>
        <td style="width: 35%;"></td>
        <td style="width: 15%;background-color: #E7E6E6;">备注</td>
        <td style="width: 35%;"></td>
      </tr>
    </table>
    <table style="width: 100%;">
      <tr>
        <td colspan="4">
          验收确认
        </td>
      </tr>
      <tr>
        <td style="width: 15%;background-color: #E7E6E6;">门店名称</td>
        <td style="width: 35%;"></td>
        <td style="width: 15%;background-color: #E7E6E6;">地址</td>
        <td style="width: 35%;"></td>
      </tr>
      <tr>
        <td style="width: 15%;background-color: #E7E6E6;">验收人</td>
        <td style="width: 35%;"></td>
        <td style="width: 15%;background-color: #E7E6E6;">联系电话</td>
        <td style="width: 35%;"></td>
      </tr>
      <tr>
        <td style="width: 15%;background-color: #E7E6E6;">验收时间</td>
        <td style="width: 35%;"></td>
        <td style="width: 15%;background-color: #E7E6E6;">备注</td>
        <td style="width: 35%;"></td>
      </tr>
    </table>
    <table style="width: 100%;margin: 32px 0;">
      <tr>
        <td>保养内容</td>
      </tr>
      ${groupHtml}
    </table>

    <table style="width: 100%;margin: 32px 0;">
      <tr style="height: 80px;">
        <td style="width: 15%;background-color: #E7E6E6;">维保人签字</td>
        <td style="width: 35%;">
        </td>
        <td style="width: 15%;background-color: #E7E6E6;">验收人签字</td>
        <td style="width: 35%;"></td>
      </tr>
    </table>
  </body>
  </html>
  `
}
