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
        <!-- <el-input clearable v-model="memberForm.phone"> </el-input> -->
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input placeholder="请输入" clearable v-model="memberForm.name" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select
          v-model="memberForm.role"
          clearable
          placeholder="请选择"
          style="width: 100%;"
        >
          <el-option
            v-for="item in projectRoleOptions"
            :label="item.Value"
            :key="item.Key"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        :loading="submitLoading"
        size="medium"
        @click="submit('memberForm')"
        >添 加</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { validatePhone } from '@/utils/checkAreaCode'
import avatarFactory from '@/utils/avatarFactory'
import { copyToClipboard } from '@/utils/index'
import { addMember } from '@/api/userSubarea'
import { getUserDropdownByMobileOrName } from '@/api/user'
import { addInvitation } from '@/api/invitation'
import { storageName } from '@/utils/index'

export default {
  props: {
    projectRoleOptions: Array,
    projectSubareaId: Number
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
        role: undefined
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
      inviteUrl: {
        inviteText: '',
        url: ''
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
      this.$refs.memberForm.resetFields()
    },
    submit() {
      this.$refs.memberForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const { name, phone, userId, role } = this.memberForm
          const projectRole = this.projectRoleOptions.find(
            item => item.Key === role
          )
          if (projectRole) {
            delete projectRole.text
            delete projectRole.value
          }
          addMember({
            Avatar: userId ? undefined : avatarFactory(name),
            Nickname: userId ? undefined : name,
            Mobile: userId ? undefined : phone,
            SubareaId: this.projectSubareaId,
            IsAdd: true,
            UserId: userId,
            CompanyId: this.companyId,
            CompanyRole: undefined,
            ProjectRole: projectRole
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$emit('refresh')
                this.dialogVisible = false
                if (
                  localStorage.getItem(
                    storageName('HideMemberAddSuccessDialog')
                  )
                ) {
                  this.$message.success('添加成功')
                } else {
                  addInvitation({
                    subareaId: this.projectSubareaId
                  }).then(res => {
                    if (res.data.Code === 200) {
                      const data = res.data.Data
                      let url = ''
                      if (process.env.NODE_ENV !== 'production') {
                        // 开发环境
                        url = `http://dev.sinocold.com:81/utopia/#/invite?invitationId=${data.InvitationId}`
                      } else {
                        // 正式环境
                        if (this.companyId === 3) {
                          // 康德乐
                          url = `http://kdlhealth.sinocold.net/#/invite?invitationId=${data.InvitationId}`
                        } else if (this.companyId === 6) {
                          // 科立德
                          url = `http://yun.ikold.com.cn/#/invite?invitationId=${data.InvitationId}`
                        } else {
                          url = `https://yun.sinocold.net/#/invite?invitationId=${data.InvitationId}`
                        }
                      }
                      this.inviteUrl.url = url
                      this.inviteUrl.inviteText = `『${data.InviterUserName}』邀请你加入项目『${data.SubareaName}』，点击链接加入项目。${url}`

                      this.$confirm(
                        '发送项目邀请链接即可邀请成员激活账号并加入项目, ' +
                          this.inviteUrl.url,
                        '添加成功',
                        {
                          confirmButtonText: '复制链接',
                          cancelButtonText: '不再提示',
                          type: 'success'
                        }
                      )
                        .then(() => {
                          copyToClipboard(this.inviteUrl.inviteText)
                          this.$message.success('邀请链接已复制到剪切板')
                        })
                        .catch(() => {
                          localStorage.setItem(
                            storageName('HideMemberAddSuccessDialog'),
                            'true'
                          )
                        })
                    }
                  })
                }
              } else {
                this.$message.error(res.data.Message)
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
    }
  }
}
</script>
