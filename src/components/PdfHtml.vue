<template>
  <div id="pdfWrapper" class="pdfWrapper">
    <div
      v-if="data"
      style="text-align:center;margin: 25px 0;font-weight: bold;font-size: 16px;"
    >
      {{ data.ProjectName + `（${data.startTime} 至 ${data.endTime}）` }}
    </div>
    <div class="title-wrap">
      <h3>
        <span class="text">历史数据曲线</span>
      </h3>
    </div>
    <div id="pdf-chart" class="pdf-chart">
      <img :src="chartImg" style="width:100%;height:100%" />
    </div>
    <div class="title-wrap">
      <h3>
        <span class="text">历史数据统计</span>
      </h3>
    </div>
    <table v-if="data" border="1" style="margin-top: 20px;width: 100%;">
      <tr>
        <th>点位</th>
        <th>最大值</th>
        <th>最小值</th>
        <th>平均值</th>
      </tr>
      <tr v-for="(item, index) in data.PointList" :key="index">
        <th>{{ item.PointName }}</th>
        <th>{{ item.Max }}</th>
        <th>{{ item.Min }}</th>
        <th>{{ item.Avg }}</th>
      </tr>
    </table>

    <div class="title-wrap" style="margin-top: 20px;">
      <h3>
        <span class="text">历史数据表</span>
      </h3>
    </div>
    <table v-if="data" border="1" style="margin-top: 20px;width: 100%;">
      <tr>
        <th>时间</th>
        <th v-for="(item, index) in data.PointList" :key="index">
          {{ data.ModelName }}
          <br />
          {{ item.PointName }}
        </th>
      </tr>
      <tr v-for="i in data.PointList[0].DataList.length">
        <td>
          {{
            _dateFormat(
              data.PointList[0].DataList[i - 1][0],
              'YYYY-MM-DD HH:mm:ss'
            )
          }}
        </td>
        <td v-for="l in data.PointList.length">
          {{
            data.PointList[l - 1].DataList[i - 1] &&
              data.PointList[l - 1].DataList[i - 1][1]
          }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartImg: '',
      data: null
    }
  },
  methods: {
    generateHTML(chartImg, data) {
      this.chartImg = chartImg
      this.data = data
      return new Promise(resolve => {
        this.$nextTick(() => {
          const htmlText = `
            <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Document</title>
              </head>
              <style>
                .pdfWrapper {
                  width: 100%;
                  box-sizing: border-box;
                  padding: 0 60px;
                  background: #fff;
                }
                .pdf-chart{
                  width: 100%;
                  height: 400px;
                }
                table {
                  border-collapse: collapse;
                }
                table, th, td {
                  border: 1px solid #ccc;,
                  text-align: center;
                }
                th, td {
                  padding: 6px 15px;
                  font-weight: bold;
                  color: #3c3c3c
                }
                .pdf-table {
                  box-sizing: border-box;
                  padding: 0 30px;
                }
                .point-date {
                  float: left;
                }
                .point-value {
                  float: right;
                }
                .pdf-table-item {
                  line-height: 40px;
                  overflow: hidden;
                  border-bottom: 1px solid #E8E8E8;
                }
                .title-wrap {
                  position: relative;
                  padding: 9px 15px;
                  border-bottom: 2px solid #DEDFE0;
                  background: #fff;
                }
                h3 {
                  font-size: 16px;
                  font-weight: normal;
                  display: inline-block;
                  margin: 0;
                }
                .title-icon {
                  vertical-align: middle;
                  margin-right: 5px;
                  width: 20px;
                  height: 20px;
                }
                span.text {
                  font-size: 15px;
                  font-weight: bold;
                  display: inline-block;
                  transform: translateY(2px);
                  color: #3c3c3c
                }
              </style>
              <body>
                ${document.getElementById('pdfWrapper').innerHTML}
              </body>
              </html>
          `
          resolve(htmlText)
        })
      })
    }
  }
}
</script>

<style lang="scss">
.pdfWrapper {
  width: 100%;
  box-sizing: border-box;
  padding: 0 60px;
  background: #fff;
  display: none;
  .pdf-chart {
    width: 100%;
    height: 400px;
  }
  table {
    border-collapse: collapse;
  }
  table,
  th,
  td {
    border: 1px solid #ccc;
  }
  th,
  td {
    padding: 6px 15px;
    text-align: center;
  }
  .pdf-table {
    box-sizing: border-box;
    padding: 0 30px;
  }
  .point-date {
    float: left;
  }
  .point-value {
    float: right;
  }
  .pdf-table-item {
    line-height: 40px;
    overflow: hidden;
    border-bottom: 1px solid #e8e8e8;
  }
  .title-wrap {
    position: relative;
    padding: 9px 15px;
    border-bottom: 2px solid #dedfe0;
    background: #fff;
  }
  h3 {
    font-size: 16px;
    font-weight: normal;
    display: inline-block;
    margin: 0;
  }
  .title-icon {
    vertical-align: middle;
    margin-right: 5px;
    width: 20px;
    height: 20px;
  }
  span.text {
    font-size: 15px;
    font-weight: bold;
    display: inline-block;
    transform: translateY(2px);
    color: #3c3c3c;
  }
}
</style>
