<template>
  <el-dialog
    title="选择投屏设备"
    :visible.sync="dialogVisible"
    width="350px"
    custom-class="cold-datav-select"
    :before-close="handleClose"
  >
    <div class="panel">
      <div class="panel-header">
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="checkAll"
          @change="handleCheckAllChange"
          >全选</el-checkbox
        >
        {{ selectValue.length }} / {{ list.length }} 项
      </div>
      <div class="filter-wrap">
        <el-input
          size="medium"
          v-model="filter"
          clearable
          placeholder="请输入"
          suffix-icon="el-icon-search"
        ></el-input>
      </div>
      <div class="list-wrap thin-scroll">
        <el-checkbox-group
          v-model="selectValue"
          @change="handleSelectValueChange"
        >
          <div v-for="item in list" :key="item.mtid" style="padding: 5px 0">
            <el-checkbox :label="item.mtid">{{ item.mname }}</el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-checkbox style="float: left;margin-top: 6px;" v-model="isShowVideo"
        >启用视频投屏</el-checkbox
      >
      <el-button
        :disabled="selectValue.length === 0"
        type="primary"
        @click="submit"
        size="medium"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { getMtIdList } from '@/api/model'

export default {
  props: {
    project: Number,
    sid: Number
  },
  data() {
    return {
      dialogVisible: false,
      isIndeterminate: false,
      checkAll: false,
      isShowVideo: false,
      filter: '',
      selectValue: [],
      listSource: []
    }
  },
  computed: {
    list() {
      return this.listSource.filter(
        item => item.mname.toLowerCase().indexOf(this.filter.toLowerCase()) > -1
      )
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchList()
    },
    handleClose() {
      this.dialogVisible = false
      this.filter = ''
      this.listSource = []
      this.selectValue = []
      this.isIndeterminate = false
      this.checkAll = false
    },
    handleCheckAllChange(val) {
      // if (val && this.list.length > 6) {
      //   this.$message('投屏设备不能超过6个')
      //   this.checkAll = false
      //   return false
      // }
      this.selectValue = val ? this.list.map(item => item.mtid) : []
      this.isIndeterminate = false
    },
    handleSelectValueChange(value) {
      // if (value.length > 6) {
      //   this.$message('投屏设备不能超过6个')
      //   this.selectValue.pop()
      //   return false
      // }
      let checkedCount = value.length
      this.checkAll = checkedCount === this.list.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.list.length
    },
    fetchList() {
      getMtIdList({
        projectId: this.project,
        bigTypeId: this.sid,
        smallTypeId: 0
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.listSource = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    submit() {
      // if (this.selectValue.length > 6) {
      //   this.$message('投屏设备不能超过6个')
      //   return false
      // }
      const params = new URLSearchParams()
      params.set('project', this.project)
      params.set('sid', this.sid)
      const project = this.$store.state.app.proList.find(
        item => item.id === this.project
      )
      params.set('projectName', project ? project.label : '')
      params.set('userId', this.$store.state.app.userInfo.uid)
      params.set('isShowVideo', this.isShowVideo)
      this.selectValue.forEach(item => {
        params.append('mtid', item)
      })
      this.dialogVisible = false

      window.open(
        process.env.NODE_ENV === 'production'
          ? window.location.protocol +
              '//' +
              window.location.host +
              '/datav_v1/#/?' +
              params.toString()
          : 'http://dev.sinocold.com:81/datav/#/?' + params.toString(),
        '_blank'
      )
    }
  }
}
</script>

<style lang="scss">
.cold-datav-select {
  .el-dialog__body {
    padding: 8px 16px;
  }
  .panel {
    height: 330px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.15);
  }
  .panel-header {
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  }
  .filter-wrap {
    padding: 8px 12px;
  }
  .list-wrap {
    height: 205px;
    overflow: auto;
    padding: 12px;
  }
}
</style>
