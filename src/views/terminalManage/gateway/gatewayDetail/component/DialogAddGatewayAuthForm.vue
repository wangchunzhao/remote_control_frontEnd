<template>
  <el-dialog
    width="370px"
    title="新增授权"
    :visible.sync="dialogVisible"
    class="standardAddDialog"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      size="small"
      style="margin:0 30px;"
      v-loading="selectLoading"
    >
      <el-form-item prop="UserId" label="用户名">
        <el-select
          v-model="form.UserId"
          filterable
          :placeholder="`请输入`"
          style="width: 100%"
          :filter-method="inputSelectFilter"
        >
          <el-option
            v-for="item in userFilterList"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
            :class="item.Key === userInfo.uid ? 'now-user-item' : 'user-item'"
            :disabled="item.Key === userInfo.uid"
          >
            <el-image class="user-img" :src="item.Extend" />
            <span class="user-name">{{ item.Value }}</span>
            <span class="user-phone">{{ item.Title }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="type" label="授权类型：">
        <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="item in typeList"
            :key="item.FuncGroupId"
            :label="item.FuncGroupName"
            :value="item.FuncGroupId"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <div slot="footer">
      <div
        style="display: flex;align-items: center;justify-content: space-between"
      >
        <div />
        <div>
          <el-button size="medium" @click.native="handleClose">取消</el-button>
          <el-button
            :loading="submitLoading || selectLoading"
            size="medium"
            type="primary"
            @click.native="submitForm"
            >确定</el-button
          >
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { addOrUpdateUserFuncGroup } from '@/api/userApply'
import { getUserDropdownByMobileOrName } from '@/api/user'
export default {
  props: {
    typeList: Array
  },
  data() {
    return {
      deviceId: '',
      dialogVisible: false,
      submitLoading: false,
      selectLoading: false,
      form: {
        type: '',
        UserId: ''
      },
      userFilterList: [],
      userList: [],
      rules: {
        UserId: [{ required: true, message: '请选择用户', trigger: 'change' }],
        type: [{ required: true, message: '请选择授权类型', trigger: 'change' }]
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.app.userInfo
    }
  },
  mounted() {
    this.getUserList()
  },
  methods: {
    openDialog(deviceId) {
      this.deviceId = deviceId
      this.dialogVisible = true
      this.$refs.form ? this.$refs.form.clearValidate() : null
    },
    handleClose() {
      this.form.UserId = ''
      this.form.type = ''
      this.$refs.form.clearValidate()
      this.dialogVisible = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          let data = {
            Type: 'Gateway',
            ForeignId: this.deviceId,
            UserFuncGroupList: [
              {
                UserId: this.form.UserId,
                FuncGroupId: this.form.type
              }
            ]
          }
          addOrUpdateUserFuncGroup(data)
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message.success('新增授权成功')
                this.$emit('refresh')
                this.handleClose()
              } else {
                this.$message.error('新增授权失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('新增授权失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getUserList() {
      this.selectLoading = true
      getUserDropdownByMobileOrName({ mobileOrName: '' })
        .then(res => {
          if (res.data.Code === 200) {
            this.userList = res.data.Data
            this.userFilterList = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.selectLoading = false
        })
    },
    inputSelectFilter(val) {
      this.userFilterList = this.userList.filter(
        item =>
          item.Key === this.form.UserId ||
          (item.Title && item.Title.indexOf(val) > -1) ||
          (val.toLowerCase &&
            item.Value.toLowerCase().indexOf(val.toLowerCase()) > -1)
      )
    }
  }
}
</script>
<style scoped lang="scss">
.now-user-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  line-height: 21px;
  height: 40px;
}
.user-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
  line-height: 21px;
  height: 40px;
}
.user-img {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 15px;
}
.user-name {
  margin-left: 15px;
}
.user-phone {
  margin-left: 15px;
}
</style>
