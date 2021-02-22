<template>
  <div class="company-register">
    <div class="invite-content">
      <el-form
        ref="form"
        :model="form"
        class="register-form-wrap"
        :rules="formRules"
        size="medium"
        hide-required-asterisk
        label-width="75px"
      >
        <div class="title">企业注册申请</div>
        <div class="tiny-title">
          企业信息
        </div>
        <el-form-item prop="companyName" label="企业名称">
          <el-input
            clearable
            v-model.trim="form.companyName"
            placeholder="请输入企业名称"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="industry" label="行业类型">
          <el-select
            v-model="form.industry"
            placeholder="请选择行业类型"
            clearable
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="item in industryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <div class="tiny-title">
          管理员信息
        </div>
        <el-form-item error prop="userName" label="姓名">
          <el-input
            v-model.trim="form.userName"
            clearable
            placeholder="请输入真实姓名"
          />
          <input style="position: fixed;top: -99999px;" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model.trim="form.phone" clearable placeholder="手机号">
            <el-select slot="prepend" v-model="areaCode" style="width: 80px;">
              <el-option label="+86" value="+86" />
              <el-option label="+886" value="+886" />
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item prop="checkCode" label="验证码">
          <el-input
            v-model.trim="form.checkCode"
            placeholder="输入验证码"
            clearable
            :maxlength="4"
            :minlength="4"
          >
            <template slot="append">
              <el-button
                :disabled="!canSent"
                class="send-msg-btn"
                @click.native="sendMsg"
              >
                <span v-show="canSent">发送验证码</span>
                <span v-show="!canSent">{{ time }} S</span>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <div class="submit-btn-wrap">
          <el-button
            type="primary"
            :loading="loading"
            @click.native="submitForm('form')"
          >
            提交注册
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
import { mobileCode } from '@/api/user'
import { validatePhone, getAreaCode } from '@/utils/checkAreaCode'
import { addCompanyApply } from '@/api/user'
import { industryOptions } from '@/utils/enum'

export default {
  props: {
    phone: String
  },
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
      canSent: true,
      time: 120,
      areaCode: '+86',
      form: {
        companyName: '',
        industry: undefined,
        userName: '',
        phone: '',
        checkCode: ''
      },
      formRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        companyName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        checkCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        industry: [
          { required: true, message: '请选择行业类型', trigger: 'change' }
        ]
      },
      loading: false,
      industryOptions
    }
  },
  watch: {
    phone: {
      handler: function(val) {
        const res = getAreaCode(val)
        this.areaCode = res.areaCode
        this.form.phone = res.phone
      },
      immediate: true
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true
          const {
            companyName,
            industry,
            userName,
            phone,
            checkCode
          } = this.form
          addCompanyApply({
            Code: checkCode,
            companyName: companyName,
            industry: industry,
            fullname: userName,
            mobile: phone
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                this.$message.success('注册申请已提交，请等待后台审核完成')
              } else {
                this.$message.error('注册失败')
              }
            })
            .catch(err => {
              this.$message.error('注册失败')
              console.error(err)
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    // 发送验证码
    sendMsg() {
      if (!this.form.phone) {
        this.$message('请填写手机号')
        return false
      }
      this.canSent = false
      this.countDown()
      mobileCode({
        mobile: this.form.phone,
        title: '',
        region: this.areaCode
      }).catch(err => {
        console.error(err)
        this.$message.error('验证码发送失败')
      })
    },
    countDown() {
      if (this.time === 0) {
        this.canSent = true
        this.time = 120
      } else {
        this.time--
        setTimeout(() => {
          this.countDown()
        }, 1000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.company-register {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #324157;
  .invite-content {
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%, -50%);
    width: 400px;
  }
  .title {
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 24px;
  }
  .tiny-title {
    font-weight: 500;
    margin-bottom: 15px;
  }
  .register-form-wrap {
    padding: 24px 45px;
    margin-bottom: 24px;
    box-sizing: border-box;
    border-radius: 6px;
    background: #fff;
  }
  .submit-btn-wrap {
    text-align: center;
  }
}
</style>
