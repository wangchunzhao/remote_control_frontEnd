<template>
  <el-dialog
    title="添加成员"
    :visible.sync="dialogVisible"
    width="420px"
    @close="dialogClose"
  >
    <el-form
      ref="memberForm"
      :model="memberForm"
      :rules="memberFormRule"
      label-width="90px"
      size="medium"
      style="margin-right: 50px;"
    >
      <el-form-item label="手机号" prop="phone">
        <el-autocomplete
          class="inline-input"
          v-model="memberForm.phone"
          :fetch-suggestions="querySearch"
          clearable
          placeholder="请输入"
          :trigger-on-focus="false"
          @select="handleSelectUser"
        >
          <el-select
            slot="prepend"
            v-model="memberForm.areaCode"
            style="width: 80px;"
          >
            <el-option label="+86" value="+86" />
            <el-option label="+886" value="+886" />
          </el-select>
          <template slot-scope="{ item }">
            <div>
              <img
                style="width: 25px;height: 25px;border-radius: 50%;margin-right: 15px;vertical-align: middle;"
                :src="item.Extend"
                alt=""
              />
              <span>{{ item.Value }}</span>
            </div>
          </template>
        </el-autocomplete>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input clearable placeholder="请输入" v-model="memberForm.name" />
      </el-form-item>
      <el-form-item label="企业角色" prop="companyRoleId">
        <el-select
          v-model="memberForm.companyRoleId"
          clearable
          placeholder="请选择"
          style="width: 100%;"
        >
          <el-option
            v-for="item in companyRoleOptions"
            :label="item.Value"
            :value="item.Key"
            :key="item.Key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="加入项目" prop="subareaIdS">
        <treeselect
          v-model="memberForm.subareaIdS"
          :default-expand-level="1"
          :options="structTree"
          style="line-height: 20px;"
          placeholder="请选择"
          :normalizer="normalizer"
          :multiple="true"
          :show-count="true"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        :loading="submitLoading"
        type="primary"
        size="medium"
        @click="submit('memberForm')"
        >添 加</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { validatePhone } from '@/utils/checkAreaCode'
import { getUserDropdownByMobileOrName } from '@/api/user'
import avatarFactory from '@/utils/avatarFactory'
import { addMember } from '@/api/userSubarea'

export default {
  props: {
    structTree: Array,
    companyRoleOptions: Array
  },
  components: {
    Treeselect
  },
  data() {
    const checkPhone = (rule, value, callback) => {
      if (validatePhone(this.memberForm.areaCode, value)) {
        callback()
      } else {
        callback(new Error('手机号格式错误'))
      }
    }
    return {
      dialogVisible: false,
      submitLoading: false,
      memberForm: {
        name: '',
        phone: '',
        userId: undefined,
        areaCode: '+86',
        companyRoleId: undefined,
        subareaIdS: []
      },
      memberFormRule: {
        name: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
            message: '不可包含特殊字符',
            trigger: 'blur'
          }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      normalizer(node) {
        return {
          id: node.SubareaId,
          label: node.SubareaName,
          children: node.Children
        }
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    dialogClose() {
      this.dialogVisible = false
      this.memberForm.userId = ''
      this.$refs.memberForm.resetFields()
    },
    submit() {
      this.$refs.memberForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const {
            name,
            phone,
            userId,
            companyRoleId,
            subareaIdS
          } = this.memberForm
          const companyRole = this.companyRoleOptions.find(
            item => item.Key === companyRoleId
          )
          addMember({
            Avatar: userId ? undefined : avatarFactory(name),
            Nickname: userId ? undefined : name,
            Mobile: userId ? undefined : phone,
            SubareaIdS: subareaIdS,
            CompanyId: this.companyId,
            IsAdd: true,
            UserId: userId,
            CompanyRole: companyRole
              ? { Key: companyRole.Key, Value: companyRole.Value }
              : undefined,
            ProjectRole: undefined
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('添加成功')
                this.$emit('refresh')
                this.dialogVisible = false
              } else {
                this.$message(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('添加失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        }
      })
    },
    querySearch(text, cb) {
      // 如果是手机号
      if (validatePhone(this.memberForm.areaCode, text)) {
        getUserDropdownByMobileOrName({
          mobileOrName: text
        })
          .then(({ data }) => {
            if (data.Code === 200) {
              cb(data.Data)
            }
          })
          .catch(err => {
            console.error(err)
            cb([])
          })
      } else {
        this.memberForm.userId = undefined
        cb([])
      }
    },
    handleSelectUser(val) {
      this.memberForm.userId = val.Key
      this.memberForm.name = val.Value
      this.memberForm.phone = val.Title
    },
    // 删除空的Children
    walk(arr) {
      arr.forEach(item => {
        if (item.Children) {
          if (!item.Children.length) {
            delete item.Children
          } else {
            this.walk(item.Children)
          }
        }
      })
    }
  }
}
</script>
