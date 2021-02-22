<template>
  <div class="transfer">
    <div class="transfer-left">
      <div class="transfer-header">
        <el-input
          v-model.trim="leftFilter"
          clearable
          size="small"
          suffix-icon="el-icon-search"
        />
      </div>
      <el-table
        :data="leftData"
        style="width: 458px;"
        height="400"
        @selection-change="leftSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="pname" label="点位名称" />
        <el-table-column prop="DeviceName" label="设备" />
        <el-table-column prop="SysName" label="系统" />
      </el-table>
    </div>
    <div class="transfer-center">
      <el-button
        size="mini"
        :type="leftSelect.length ? 'primary' : ''"
        :disabled="!leftSelect.length"
        @click.native="transferRight"
      >
        <i class="el-icon-arrow-right" />
      </el-button>
      <br />
      <el-button
        size="mini"
        :type="rightSelect.length ? 'primary' : ''"
        :disabled="!rightSelect.length"
        @click.native="transferLeft"
      >
        <i class="el-icon-arrow-left" />
      </el-button>
    </div>
    <div class="transfer-right">
      <div class="transfer-header">
        <span class="header-title">已选中点位</span>
        <el-input
          v-model.trim="rightFilter"
          clearable
          size="small"
          suffix-icon="el-icon-search"
        />
      </div>
      <el-table
        :data="rightData"
        style="width: 458px;"
        height="400"
        @selection-change="rightSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="pname" label="点位名称" />
        <el-table-column prop="DeviceName" label="设备" />
        <el-table-column prop="SysName" label="系统" />
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    value: {
      type: Array
    }
  },
  data() {
    return {
      leftDataSource: [],
      leftData: [],
      leftSelect: [],
      rightDataSource: [],
      rightData: [],
      rightSelect: [],
      leftFilter: '',
      rightFilter: ''
    }
  },
  watch: {
    leftFilter(val) {
      const text = val.toLowerCase()
      this.leftData = this.leftDataSource.filter(item => {
        return (
          item.DeviceName.toLowerCase().indexOf(text) > -1 ||
          item.pname.toLowerCase().indexOf(text) > -1 ||
          item.SysName.toLowerCase().indexOf(text) > -1
        )
      })
    },
    rightFilter(val) {
      const text = val.toLowerCase()
      this.rightData = this.rightDataSource.filter(item => {
        return (
          item.DeviceName.toLowerCase().indexOf(text) > -1 ||
          item.pname.toLowerCase().indexOf(text) > -1 ||
          item.SysName.toLowerCase().indexOf(text) > -1
        )
      })
    },
    value(val) {
      if (!val.length) {
        this.rightData = []
        this.rightSelect = []
      } else {
        this.rightData = val
        this.rightDataSource = val
      }
    },
    data(val) {
      this.leftDataSource = JSON.parse(JSON.stringify(val))
      this.leftData = JSON.parse(JSON.stringify(val))
    }
  },
  methods: {
    leftSelectionChange(val) {
      this.leftSelect = val
    },
    transferRight() {
      const points = this.leftSelect.map(item => item.point)
      this.rightData.push(...this.leftSelect)
      this.rightDataSource.push(...this.rightSelect)
      this.leftSelect = []
      this.leftData = this.leftData.filter(item => !points.includes(item.point))
      this.leftDataSource = this.leftDataSource.filter(
        item => !points.includes(item.point)
      )
      this.$emit('input', this.rightData.map(item => item))
      this.leftFilter = ''
    },
    rightSelectionChange(val) {
      this.rightSelect = val
    },
    transferLeft() {
      const points = this.rightSelect.map(item => item.point)
      this.leftData.push(...this.rightSelect)
      this.rightSelect = []
      this.rightData = this.rightData.filter(
        item => !points.includes(item.point)
      )
      this.rightDataSource = this.rightDataSource.filter(
        item => !points.includes(item.point)
      )
      this.$emit('input', this.rightDataSource)
      this.rightFilter = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.transfer {
  display: flex;
}
.transfer-left {
  flex: 1;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
}
.transfer-right {
  flex: 1;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
}
.transfer-header {
  display: flex;
  align-items: center;
  background: #1890ff;
  height: 40px;
  line-height: 40px;
  padding: 0 25px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  .header-title {
    color: #fff;
    margin-right: 15px;
  }
  .el-input {
    flex: 1;
  }
}
.transfer-center {
  flex: 0 0 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .el-button {
    padding: 7px 10px;
  }
}
</style>

<style lang="scss">
.transfer {
  .el-table {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    td {
      padding: 5px 0;
    }
    th {
      padding: 5px 0;
      background: #eaf6fe;
    }
  }
}
</style>
