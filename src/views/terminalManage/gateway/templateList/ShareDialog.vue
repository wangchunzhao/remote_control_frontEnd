<template>
  <el-dialog
    width="490px"
    title="模板分享"
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="template-share-dialog"
  >
    <el-form ref="form" label-width="100px" size="small">
      <el-form-item label="权限设置：" prop="name">
        <span>查看和使用模板</span>
      </el-form-item>
      <el-form-item label="已分享：" prop="name">
        <div class="user-list">
          <span
            v-for="(item, index) in userList"
            :key="index"
            class="el-tag el-tag--info el-tag--light"
          >
            <img :src="item.Extend" class="user-avatar"/>
            {{ item.Value }}
            <i
              @click="handleRemove(item.Key)"
              class="el-tag__close el-icon-close"
            ></i
          ></span>
          <user-select
            :select-id="userList.map(item => item.Key)"
            @change="selectUser"
            placement="bottom-start"
          >
            <el-button type="primary" icon="el-icon-plus" circle></el-button>
          </user-select>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import UserSelect from './UserSelect'
import {
  getDeviceTemplateShareUserDropdown,
  shareDeviceTemplate
} from '@/api/deviceTemplate'
export default {
  components: {
    UserSelect
  },
  data() {
    return {
      dialogVisible: false,
      templateId: undefined,
      submitLoading: false,
      userList: []
    }
  },
  mounted() {},
  methods: {
    openDialog(id) {
      this.dialogVisible = true
      this.templateId = id

      getDeviceTemplateShareUserDropdown({
        deviceTemplateId: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.userList = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    handleClose() {
      this.userList = []
      this.templateId = undefined
      this.dialogVisible = false
    },
    selectUser(user) {
      const temp = this.userList.find(item => item.Key === user.Key)
      if (temp) {
        this.userList = this.userList.filter(item => item.Key !== user.Key)
      } else {
        this.userList.push(user)
      }
    },
    handleRemove(id) {
      this.userList = this.userList.filter(item => item.Key !== id)
    },
    submitForm() {
      this.submitLoading = true
      shareDeviceTemplate({
        permission: ',1,2,',
        deviceTemplateId: this.templateId,
        userIdList: this.userList.map(item => item.Key)
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            if (data.Data.IsSuccess) {
              this.$message.success('分享成功')
              this.dialogVisible = false
            } else {
              this.$message.error('分享失败')
            }
          } else {
            this.$message.error('分享失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.submitLoading = false
        })
    }
  }
}
</script>

<style lang="scss">
.template-share-dialog {
  .user-list {
    .el-tag {
      margin-right: 10px;
      margin-bottom: 10px;
      border-radius: 22px;
      padding-left: 0;
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      vertical-align: middle;
    }
  }
}
</style>
