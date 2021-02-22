<template>
  <el-row :gutter="20" class="myinfo pdg2" style="margin:0;">
    <el-col :span="12" class="commonWrapper" style="padding-left:0">
      <div class="commonBox clearfix">
        <el-col class="commonHeader">
          <c-svg name="smile" class-name="commonImg" />
          <span class="commonTitle">我的头像</span>
        </el-col>
        <el-col class="commonContent p_gap">
          <div class="mine">
            <img class="myimage" :src="img" />
            <span>头像预览</span>
            <span>(建议用主流的PNG,GIF,jpeg,bmp，建议用200KB以内的图片)</span>
          </div>
          <div>
            <el-upload
              ref="upload"
              class="upload-demo"
              action="#2333"
              :before-upload="beforeDevImgUpload"
              accept="image/png,image/jpg,image/jpeg"
            >
              <el-button
                slot="trigger"
                type="primary"
                size="small"
                @click="clearImg"
              >
                上传头像
              </el-button>
            </el-upload>
          </div>
          <div class="imgList">
            <img
              v-for="(item, index) in imagelist"
              :key="index"
              class="myimg"
              :src="item"
              @click="selectImg(item)"
            />
          </div>
          <div class="btn">
            <el-button type="primary" @click.native="saveImg">
              确认
            </el-button>
          </div>
        </el-col>
      </div>
    </el-col>
    <el-col :span="12" class="commonWrapper">
      <div class="commonBox clearfix">
        <el-col class="commonHeader">
          <c-svg name="hamburger" class-name="commonImg" />
          <span class="commonTitle">我的信息设置</span>
        </el-col>
        <el-col class="commonContent table">
          <el-col :span="12">
            <el-col :span="24">
              <div><span>用户名</span></div>
              <div><el-input v-model="form.account" :disabled="true" /></div>
            </el-col>
            <el-col :span="24">
              <div>
                <span>手机号</span
                ><span class="txtcolor" @click="updatePhone">修改手机</span>
              </div>
              <div><el-input v-model="form.mobile" :disabled="true" /></div>
            </el-col>
            <el-col :span="24">
              <div><span>公司名称</span></div>
              <div><el-input v-model="form.cname" /></div>
            </el-col>
            <el-col :span="24">
              <div>
                <span>密码</span
                ><span class="txtcolor" @click="updatePsw">修改密码</span>
              </div>
            </el-col>
          </el-col>
          <el-col :span="12">
            <el-col :span="24">
              <div><span>姓名</span></div>
              <div><el-input v-model="form.nickname" /></div>
            </el-col>
            <el-col :span="24">
              <div>
                <span>邮箱</span
                ><span class="txtcolor" @click="updateEmail">修改邮箱</span>
              </div>
              <div><el-input v-model="form.email" :disabled="true" /></div>
            </el-col>
            <el-col :span="24">
              <div><span>部门</span></div>
              <div><el-input v-model="form.depart" /></div>
            </el-col>
            <el-col :span="24">
              <div v-show="!form.wxicon">
                <span class="txtcolor" @click="bingding">绑定微信</span>
              </div>
              <div v-show="form.wxicon">
                <img :src="form.wxicon" /><span
                  class="txtcolor"
                  @click="cancelbingding"
                  >解除绑定</span
                >
              </div>
            </el-col>
          </el-col>
          <el-col :span="24" class="btn">
            <el-button type="primary" @click="submitForm">
              确认
            </el-button>
          </el-col>
        </el-col>
      </div>
    </el-col>
    <el-dialog
      title="绑定手机"
      class="dialogBox"
      :visible.sync="dialogPhoneVisible"
    >
      <el-form ref="formPhone" :model="formPhone" :rules="phoneRules">
        <el-form-item prop="phone">
          <el-input v-model.trim="formPhone.phone" placeholder="手机号">
            <template slot="prepend">
              <el-button>+86</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model.trim="formPhone.checkCode"
            placeholder="手机验证码"
            :maxlength="4"
            :minlength="4"
          >
            <template slot="append">
              <el-button
                class="send-msg-btn"
                :disabled="!canSent"
                @click="sendMsg"
              >
                <span v-show="canSent">发送短信</span>
                <span v-show="!canSent">{{ time }}S</span>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="pwd">
          <el-input
            v-model.trim="formPhone.pwd"
            type="password"
            show-password
            placeholder="密码"
          />
        </el-form-item>
        <el-form-item style="text-align:center;">
          <el-button @click="cancelphone">
            取消
          </el-button>
          <el-button type="primary" @click="sureBingding('formPhone')">
            确认
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      title="修改邮箱"
      class="dialogBox"
      :visible.sync="dialogEmailVisible"
    >
      <el-form
        ref="formemail"
        :model="formemail"
        :rules="emailRules"
        class="emailbox"
      >
        <el-form-item prop="emails">
          <el-input v-show="false" />
          <el-input
            v-model="formemail.emails"
            type="text"
            placeholder="邮箱"
            auto-complete
          />
        </el-form-item>
        <el-form-item prop="passwords">
          <el-input v-show="false" />
          <el-input
            v-model="formemail.passwords"
            type="password"
            show-password
            placeholder="密码"
            auto-complete
          />
        </el-form-item>
        <el-form-item style="text-align:center;">
          <el-button @click="cancelemail('formemail')">
            取 消
          </el-button>
          <el-button type="primary" @click="sendemail('formemail')">
            确 认
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      title="修改密码"
      class="dialogBox"
      :visible.sync="dialogPswVisible"
    >
      <el-form ref="formPassword" :model="formPassword" :rules="passwordRules">
        <el-form-item prop="pwd">
          <el-input
            v-model.trim="formPassword.pwd"
            type="password"
            show-password
            placeholder="密码"
          />
        </el-form-item>
        <el-form-item error prop="pwdnew">
          <el-input
            v-model.trim="formPassword.pwdnew"
            type="password"
            show-password
            placeholder="新密码"
          />
        </el-form-item>
        <el-form-item prop="checkpwd">
          <el-input
            v-model.trim="formPassword.checkpwd"
            type="password"
            show-password
            placeholder="确认密码"
          />
        </el-form-item>
        <el-form-item style="text-align:center;">
          <el-button @click="cancelpwd('formPassword')">
            取 消
          </el-button>
          <el-button type="primary" @click="sendpwd('formPassword')">
            确认修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      title="扫一扫"
      class="dialogBox"
      :visible.sync="dialogweixinVisible"
    >
      <el-form style="text-align:center;">
        <img
          src="https://cdn.sinocold.net/images/Coolcarewx.jpg"
          style="width:215px;height:215px;"
        />
        <div>请扫码关注，以进行用户绑定</div>
      </el-form>
    </el-dialog>
  </el-row>
</template>
<script>
import {
  getUserInfo,
  updateUserInfo,
  updateAvatar,
  updatePwd,
  updateWChart,
  updateEmail,
  updateMobile,
  mobileCode,
  exists
} from '@/api/user'
import { uploadFile } from '@/api/uploader'
import { storageName } from '@/utils/index'
export default {
  data() {
    var pwdValidate = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.formPassword.checkpwd !== '') {
          this.$refs.formPassword.validateField('checkpwd')
        }
        callback()
      }
    }
    var pwdValidates = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.formPassword.pwdnew) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    var checkPhone = (rule, value, callback) => {
      exists({ Mobile: this.formPhone.phone }).then(res => {
        if (res.data.Data.IsSuccess) {
          callback(new Error('该手机号已被注册'))
        } else {
          callback()
        }
      })
    }
    return {
      file: [],
      img: '',
      imgs: '',
      imagelist: [
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_07.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_09.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_11.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_13.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_21.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_22.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_23.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_24.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_27.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_28.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_35.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_36.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_37.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_38.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_39.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_40.gif ',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_47.gif',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1-5%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF_48.png',
        'https://cdn.sinocold.net/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1.gif'
      ],
      form: {},
      formPhone: {
        phone: '',
        checkCode: '',
        pwd: ''
      },
      phoneRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^(((13[0-9]{1})|(15[0-9]{1})| |(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/,
            message: '请输入正确的手机格式',
            trigger: 'blur'
          },
          { validator: checkPhone, trigger: 'blur' }
        ],
        pwd: [{ required: true, trigger: 'blur', message: '请填写密码' }]
      },
      formemail: {
        emails: '',
        passwords: ''
      },
      emailRules: {
        emails: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        passwords: [{ required: true, trigger: 'blur', message: '请填写密码' }]
      },
      formPassword: {
        pwd: '',
        pwdnew: '',
        checkpwd: ''
      },
      passwordRules: {
        pwd: [{ required: true, trigger: 'blur', message: '请填写密码' }],
        pwdnew: [
          { required: true, validator: pwdValidate, trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9_~!@#$%^&*\.]{8,16}$/,
            message: '8到16位（由字母数字特殊字符（_~!@#$%^&*.）组成）'
          }
        ],
        checkpwd: [{ required: true, validator: pwdValidates, trigger: 'blur' }]
      },
      dialogPhoneVisible: false,
      dialogEmailVisible: false,
      dialogPswVisible: false,
      dialogweixinVisible: false,
      canSent: true,
      time: 120
    }
  },
  mounted() {
    // 根据用户获取用户详细信息
    getUserInfo()
      .then(res => {
        if (res.data.Code === 200) {
          const {
            Account,
            Avatar,
            CompanyName,
            Depart,
            Email,
            Id,
            Mobile,
            Nickname,
            WXicon
          } = res.data.Data
          this.form = {
            account: Account,
            cname: CompanyName,
            depart: Depart,
            email: Email,
            id: Id,
            img: Avatar,
            mobile: Mobile,
            nickname: Nickname,
            wxicon: WXicon
          }
          this.img = Avatar
          this.imgs = Avatar
        } else {
          this.$message.error('用户信息获取失败')
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    // 发送短信
    sendMsg() {
      if (!this.formPhone.phone) {
        this.$message('请填写手机号')
        return
      }
      exists({ Mobile: this.formPhone.phone }).then(res => {
        if (res.data.Data.IsSuccess) {
          this.canSent = true
        } else {
          this.canSent = false
          this.countDown()
          mobileCode({
            mobile: this.formPhone.phone,
            title: '',
            region: '+86'
          }).catch(err => {
            console.error(err)
          })
        }
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
    },
    // 确认绑定（更换绑定手机号）
    sureBingding(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          updateMobile({
            mobile: this.formPhone.phone,
            code: this.formPhone.checkCode,
            pwd: this.formPhone.pwd
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('修改成功')
              } else {
                this.$message(res.data.Message)
                return false
              }
              this.form.mobile = this.formPhone.phone
              this.dialogPhoneVisible = false
            })
            .catch(err => {
              console.error(err)
            })
        } else {
          return false
        }
      })
    },
    cancelphone() {
      this.dialogPhoneVisible = false
      this.canSent = true
      this.time = 120
      this.formPhone.phone = ''
    },
    // 发送验证邮件
    sendemail(formNames) {
      this.$refs[formNames].validate(valid => {
        if (valid) {
          updateEmail({
            email: this.formemail.emails,
            pwd: this.formemail.passwords
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('更新成功')
                this.dialogEmailVisible = false
              } else {
                this.$message(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
            })
        } else {
          return false
        }
      })
    },
    cancelemail(formName) {
      this.$refs[formName].resetFields()
      this.dialogEmailVisible = false
    },
    // 确认修改密码
    sendpwd(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          updatePwd({
            pwd: this.formPassword.pwd,
            newPwd: this.formPassword.pwdnew
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('密码修改成功')
                this.$refs[formName].resetFields()
                // 修改密码成功后，延时2秒跳转重新登录
                setTimeout(() => {
                  var _this = this
                  sessionStorage.removeItem(storageName('user'))
                  _this.$router.push('/login')
                }, 2000)
              } else {
                this.$message(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
      })
    },
    cancelpwd(formName) {
      this.$refs[formName].resetFields()
      this.dialogPswVisible = false
    },
    selectImg(name) {
      this.img = name
      this.imgs = name
      this.file = name
    },
    saveImg() {
      var userInfo = JSON.parse(sessionStorage.getItem(storageName('userInfo')))
      updateAvatar(this.file)
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('修改成功')
            userInfo.avatar = this.imgs
            this.$store.commit('UPDATE_USERINFO', userInfo)
            sessionStorage.setItem(
              storageName('userInfo'),
              JSON.stringify(userInfo)
            )
          } else {
            this.$message.error('修改失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    beforeDevImgUpload(file) {
      const formData = new FormData()
      formData.append('$' + file.name.split('.')[0], file)
      formData.append('BucketName', 'front-end-assets')
      formData.append('ObjectName', `用户头像/`)
      uploadFile(formData)
        .then(res => {
          if (res.data.Code === 200) {
            this.img = res.data.Data[0]
            this.imgs = res.data.Data[0]
            this.file = res.data.Data[0]
          } else {
            this.$message.error('文件上传失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
      return false
    },
    clearImg() {
      this.$refs.upload.clearFiles()
    },
    updatePhone() {
      this.dialogPhoneVisible = true
    },
    updateEmail() {
      this.dialogEmailVisible = true
      this.formemail.emails = ''
      this.formemail.pwds = ''
    },
    updatePsw() {
      this.dialogPswVisible = true
    },
    bingding() {
      this.dialogweixinVisible = true
    },
    cancelbingding() {
      this.$prompt('请输入帐号密码', '输入密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          updateWChart({
            pwd: value
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('解绑成功')
                this.dialogweixinVisible = false
              } else {
                this.$message.error('解绑失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        })
        .catch(err => {
          console.error(err)
        })
    },
    submitForm() {
      updateUserInfo({
        Nickname: this.form.nickname,
        CompanyName: this.form.cname,
        Depart: this.form.depart
      })
        .then(({ data }) => {
          if (data.Code === 200 && data.Data.IsSuccess) {
            this.$message.success('修改成功')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('修改失败')
        })
    }
  }
}
</script>

<style lang="scss">
.myinfo {
  .emailbox {
    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px #fff inset;
      box-shadow: 0 0 0 1000px #fff inset;
      -webkit-text-fill-color: #fff;
    }
  }
  .commonWrapper {
    color: #324057;
    .commonBox {
      border-radius: 4px;
      margin-bottom: 20px;
      background: #fff;
      .commonHeader {
        height: 46px;
        padding: 10px;
        color: #324057;
        border-bottom: 1px solid #dedfe0;
        .title-icon {
          font-size: 20px;
          margin-right: 6px;
          vertical-align: -0.2em;
        }
        .commonImg {
          float: left;
          margin-right: 10px;
          height: 26px;
          width: 26px;
        }
        .squareDown {
          float: right;
          margin-top: 12px;
          margin-right: 10px;
          height: 20px;
          width: 20px;
          cursor: pointer;
          .commonIcon {
            float: left;
          }
        }
        .commonTitle {
          height: 26px;
          line-height: 26px;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
  }
  .clearfix::after {
    content: '';
    display: block;
    clear: both;
  }
  .p_gap {
    padding: 40px 20px;
  }
  .myimage {
    height: 45px;
    width: 45px;
    margin-right: 15px;
    border-radius: 50%;
  }
  .mine {
    margin-bottom: 10px;
    span {
      display: inline-block;
      vertical-align: top;
      line-height: 45px;
    }
  }
  .imgList {
    text-align: center;
    margin: 35px 30px;
    .myimg {
      height: 45px;
      width: 45px;
      margin: 0 20px 10px;
      cursor: pointer;
    }
  }
  .upload-demo {
    height: 46px;
    line-height: 46px;
    padding: 0 10px;
    border-radius: 4px;
  }
  .el-upload--text {
    width: auto;
    height: auto;
    border: none;
    vertical-align: top;
  }
  .el-upload-list {
    display: inline-block;
  }
  .btn {
    text-align: center;
  }
  .el-form {
    padding: 0 10%;
  }
  .table {
    padding: 20px 15%;
    .el-col {
      margin-bottom: 15px;
      &:last-child {
        margin-bottom: 0;
      }
      div:first-child {
        margin-bottom: 10px;
      }
      .txtcolor {
        cursor: pointer;
        color: $color;
        float: right;
      }
    }
  }
  .dialogBox .el-dialog {
    width: 400px;
  }
}
</style>
