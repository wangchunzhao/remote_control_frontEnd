<template>
  <div class="page-box" />
</template>

<script>
export default {
  name: 'DeviceList',
  data() {
    return {
      id: '',
      Loading: false,
      List: [],
      pagination: {
        currentPage: 1,
        total: 0,
        pageSize: 10
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    rowEditReg(row) {
      if (row.ModelTreeName && row.sn) {
        row.editStatus = false
      } else if (!row.ModelTreeName) {
        this.$message.error('请输入设备名称')
      } else {
        this.$message.error('请输入SN号')
      }
    },
    cancelEdit(row) {
      row.ModelTreeName = row.oldModelTreeName
      row.sn = row.oldSn
      row.editStatus = false
    },
    fetchData(list) {
      list.map(item => {
        item.oldModelTreeName = item.ModelTreeName
        item.oldSn = item.sn
        item.editStatus = false
      })
      this.pagination = {
        currentPage: 1,
        total: list.length,
        pageSize: 10
      }
    },
    // 修改每页显示的数量
    handleSizeChange() {
      this.pagination.currentPage = 1
    }
  }
}
</script>

<style scoped>
.page-box {
  max-width: 1710px;
  margin: 24px auto 24px auto;
  background: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
