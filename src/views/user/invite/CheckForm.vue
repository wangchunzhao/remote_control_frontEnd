<template>
  <el-form
    ref="form"
    :model="form"
    :rules="formRules"
    label-width="0px"
    size="medium"
    class="form-wrap"
  >
    <div style="color: #5e6d82;text-align: center;margin-bottom: 24px;">
      {{ data.InviterUserName }} 邀请你加入{{
        $route.query.type === 'company' ? '企业' : '项目'
      }}
    </div>
    <div class="project-name">
      {{ data.SubareaName || '&nbsp;' }}
    </div>
    <el-form-item prop="phone" style="margin-bottom: 32px;">
      <el-input
        :disabled="inputDisabled"
        v-model.trim="form.phone"
        placeholder="请输入手机号"
      >
        <el-select slot="prepend" v-model="areaCode" style="width: 80px;">
          <el-option label="+86" value="+86" />
          <el-option label="+886" value="+886" />
        </el-select>
      </el-input>
    </el-form-item>
    <div class="submit-btn">
      <el-button type="primary" :loading="loading" @click="submitForm('form')">
        加入{{ $route.query.type === 'company' ? '企业' : '项目' }}
      </el-button>
    </div>
  </el-form>
</template>
<script>
import { validatePhone } from '@/utils/checkAreaCode'
import { getInvitationInfo } from '@/api/invitation'
import { exists } from '@/api/user'

export default {
  data() {
    const checkPhone = (rule, value, callback) => {
      if (!validatePhone(this.areaCode, value)) {
        callback(new Error('手机号格式错误'))
        return false
      } else {
        callback()
      }
    }
    return {
      data: {},
      loading: false,
      inputDisabled: false,
      areaCode: '+86',
      form: {
        phone: ''
      },
      formRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    getInvitationInfo({
      invitationId: this.$route.query.invitationId
    })
      .then(res => {
        const data = res.data
        if (data.Code === 200) {
          this.data = data.Data
        } else {
          this.inputDisabled = true
          this.$message(data.Message)
        }
      })
      .catch(err => {
        console.error(err)
        this.$message.error('邀请信息获取失败')
      })
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true
          const { phone } = this.form
          exists({
            Mobile: phone
          })
            .then(({ data }) => {
              if (data.Data.IsSuccess) {
                this.$emit('submit', true, phone, this.data.SubareaName)
              } else {
                this.$emit('submit', false, phone, this.data.SubareaName)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message('出错了...')
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-wrap {
  padding: 24px 35px;
  margin-bottom: 24px;
  box-sizing: border-box;
  border-radius: 6px;
  background: #fff;
}
.project-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 32px;
  text-align: center;
}
.submit-btn {
  button {
    width: 100%;
  }
}
</style>
