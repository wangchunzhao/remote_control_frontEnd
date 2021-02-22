<template>
  <div>
    <el-button @click.native="click">更新</el-button>
    <div
      style="height: 50px;line-height: 50px;padding: 0 100px;"
      v-for="item in list"
      :key="item.Id"
    >
      <span
        style="width: 100px;display: inline-block;vertical-align: text-bottom;"
        >{{ item.Nickname }}</span
      >
      <img
        style="width: 40px;border-radius: 50%;height: 40px;"
        :src="item.Avatar"
        alt=""
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import avatarFactory from '@/utils/avatarFactory'
export default {
  data() {
    return {
      list: []
    }
  },
  mounted() {
    axios.get('http://192.168.6.180:5003/api/Values/GetUserList').then(res => {
      this.list = res.data.Data
      this.list.forEach(item => {
        if (item.Nickname) {
          item.Avatar = avatarFactory(item.Nickname)
        }
        // if (
        //   item.Avatar === 'default.gif' ||
        //   item.Avatar === null ||
        //   item.Nickname === '张乐毅' ||
        //   item.Avatar.indexOf('data:image') > -1 ||
        //   item.Avatar === '5991E69A99-8D83-4FEF-B193-DA287111923F.jpg'
        // ) {
        //   item.Avatar = avatarFactory(item.Nickname)
        // } else {
        // item.Avatar =
        //   'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/' +
        //   encodeURI(item.Avatar)
        // }
      })
    })
  },
  methods: {
    click() {
      this.list.forEach(item => {
        axios
          .post(
            'http://192.168.6.180:5003/api/Values/BatchUpdateUserAvatar',
            JSON.stringify([
              {
                Key: item.Id,
                Value: item.Avatar
              }
            ]),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          )
          .then(() => {})
      })
      // axios
      //   .post(
      //     'http://192.168.6.180:5003/api/Values/BatchUpdateUserAvatar',
      //     qs.stringify(
      //       this.list.map(item => {
      //         return {
      //           Key: item.Id,
      //           Value: item.Avatar
      //         }
      //       })
      //     )
      //   )
      //   .then(res => {
      //     console.log('%c--', 'color:rgb(38, 139, 210)', res)
      //   })
    }
  }
}
</script>
