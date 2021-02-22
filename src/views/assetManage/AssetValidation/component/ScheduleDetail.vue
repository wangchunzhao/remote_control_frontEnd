<template>
  <el-dialog
    :title="data.Content"
    :visible.sync="dialogVisible"
    width="650px"
    custom-class="schedule-info-dialog"
    @close="
      () => {
        data = {}
      }
    "
  >
    <div class="schedule-detail">
      <div style="margin-bottom: 20px;">
        <div class="schedule-info-list-item">
          <c-svg name="biaoqian" />
          <span>类型：</span>
          <span class="value">
            <el-tag
              size="small"
              :style="
                data.Type === 2
                  ? {
                      background: 'rgba(24,144,255,0.1)',
                      borderColor: 'rgba(24,144,255,0.45)',
                      color: 'rgba(24,144,255,1)'
                    }
                  : {
                      background: 'rgba(47,84,235,0.1)',
                      borderColor: 'rgba(47,84,235,0.45)',
                      color: 'rgba(47,84,235,1)'
                    }
              "
            >
              {{ data.Type === 2 ? '校验日程' : '验证日程' }}
            </el-tag>
          </span>
        </div>
        <div class="schedule-info-list-item">
          <c-svg name="outtime" />
          <span>日期：</span>
          <div class="value">
            <el-date-picker
              v-if="data.dateEditable"
              v-model="data.WorkDate"
              type="date"
              size="mini"
              placeholder="请选择日期"
            />
            <span v-else>
              {{ _dateFormat(data.WorkDate, 'YYYY-MM-DD') }}
            </span>
          </div>
          <el-button
            class="edit-btn"
            type="text"
            v-if="editable"
            @click.native="handleEdit('dateEditable')"
          >
            <c-svg :name="data.dateEditable ? 'true' : 'bianji'" />
          </el-button>
        </div>
        <div class="schedule-info-list-item">
          <c-svg name="laba" />
          <span>提醒：</span>
          <div class="value">
            <el-input-number
              controls-position="right"
              :min="1"
              size="mini"
              v-if="data.remindEditable"
              v-model="data.Remind"
            ></el-input-number>
            <span v-else> 提前{{ data.Remind }}天 </span>
          </div>
          <el-button
            class="edit-btn"
            type="text"
            v-if="editable"
            @click.native="handleEdit('remindEditable')"
          >
            <c-svg :name="data.remindEditable ? 'true' : 'bianji'" />
          </el-button>
        </div>
      </div>
      <div style="margin-bottom: 20px;" class="schedule-user-wrap">
        <template v-if="!data.memberEditable">
          <div
            v-for="(item, index) in data.Member"
            :key="item.Id"
            class="schedule-user-list-item"
          >
            <c-svg v-if="index === 0" name="duoren" style="font-size: 18px;" />
            <img
              class="user-avatar"
              :src="item.Avatar"
              alt=""
              style="width: 24px;height: 24px;border-radius: 50%;"
            />

            <span class="value">
              {{ item.Nickname }}
              {{ item.Id === createUserId ? '（发起人）' : '' }}
            </span>
          </div>
        </template>

        <el-select
          v-else
          v-model="data.MemberIds"
          multiple
          placeholder="请选择"
          filterable
          style="width: 560px;"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.userId"
            :label="item.name"
            :value="item.userId"
          />
        </el-select>
        <el-button
          class="edit-btn"
          type="text"
          v-if="editable"
          @click.native="handleEdit('memberEditable')"
        >
          <c-svg :name="data.memberEditable ? 'true' : 'bianji'" />
        </el-button>
      </div>
      <el-tabs v-model="activeName">
        <el-tab-pane label="关联资源" name="first">
          <ScheduleAssociated
            :data="data.ResourcesList"
            style="margin-bottom: 15px;"
            :schedule-type="data.Type"
            @update="resourcesUpdate"
            :editable="editable"
          />
        </el-tab-pane>
        <el-tab-pane label="文件" name="second">
          <el-upload
            ref="upload"
            action="#233"
            v-if="editable"
            :show-file-list="false"
            ::before-upload="beforeUpload"
            :http-request="handleUpload"
            accept=".xlsx, .xls, .doc, .docx, .pdf"
            style="margin-top: 15px;"
          >
            <el-button
              slot="trigger"
              :loading="uploadLoading"
              size="small"
              icon="el-icon-plus"
            >
              添 加
            </el-button>
            <div slot="tip" class="el-upload__tip">
              只能上传excel/word/pdf文件，且不超过5M
            </div>
          </el-upload>
          <div class="schedule-file-list">
            <el-tooltip
              v-for="item in data.Files"
              :key="item"
              class="item"
              effect="dark"
              :content="item.split('/').pop()"
              placement="top"
            >
              <a :href="item" download class="schedule-file">
                <c-svg
                  class="file-type-icon"
                  :name="handleFileType(item.split('/').pop())"
                />
                <span>{{ item.split('/').pop() }}</span>
                <div class="cover">
                  <c-svg class="download-icon" name="download" />
                </div>
              </a>
            </el-tooltip>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script>
import { getScheduleQuery, updateSchedule } from '@/api/schedule'
import { uploadFile } from '@/api/uploader'
import ScheduleAssociated from './ScheduleAssociated'
import { queryProjectConcats } from '@/api/alarmStrategyNew'

export default {
  components: {
    ScheduleAssociated
  },
  props: {
    editable: {
      type: Boolean,
      default: function() {
        return true
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      activeName: 'first',
      createUserId: '',
      data: {},

      uploadLoading: false,
      userOptions: []
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    queryProjectConcats({
      strategyID: 0,
      project: this.projectId
    })
      .then(res => {
        this.userOptions = res.data.Data
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    openDialog(id, userId) {
      this.createUserId = userId
      this.currentScheduleId = id
      this.dialogVisible = true
      this.fetchSchedule()
    },
    beforeUpload(file) {
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        this.$message('上传文件大小不能超过5M')
      }
      return isLt5M
    },
    // 上传文件
    handleUpload({ file }) {
      this.uploadLoading = true
      const formData = new FormData()
      formData.append('$' + file.name.split('.')[0], file)
      formData.append('BucketName', 'back-end-assets')
      formData.append('ObjectName', `资产验证校验/${this.data.ID}/`)
      uploadFile(formData)
        .then(res => {
          if (res.data.Code === 200) {
            this.data.Files = [
              ...new Set([...this.data.Files, res.data.Data[0]])
            ]
            this.handleUpdateSchedule()
          } else {
            this.$message.error('文件上传失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('文件上传失败')
        })
        .finally(() => {
          this.uploadLoading = false
        })
    },
    // 关联资源更新时触发
    resourcesUpdate(data) {
      this.data.ResourcesList = data
      this.handleUpdateSchedule()
    },
    // 点击编辑或保存
    async handleEdit(editableProp) {
      if (this.data[editableProp]) {
        await this.handleUpdateSchedule()
        if (editableProp === 'memberEditable') {
          this.fetchSchedule()
        }
      }
      this.data[editableProp] = !this.data[editableProp]
    },
    // 更新日程
    handleUpdateSchedule() {
      const {
        ID,
        Type,
        Content,
        WorkDate,
        Remind,
        CreateUser,
        MemberIds,
        ResourcesList,
        Files
      } = this.data
      if (!ResourcesList.length) {
        this.$message('更新失败（最少关联一项资源），请刷新页面重试')
        return false
      }
      if (!MemberIds.length) {
        this.$message('请至少关联一位成员')
        return false
      }
      if (!WorkDate) {
        this.$message('请选择日期')
        return false
      }
      return new Promise((resolve, reject) => {
        updateSchedule({
          ID,
          ProjectId: this.projectId,
          Type,
          Content,
          WorkDate: this._dateFormat(WorkDate, 'YYYY-MM-DD'),
          Remind,
          CreateUser,
          Member: MemberIds,
          Resources: ResourcesList.map(item => item.ID),
          Files
        })
          .then(res => {
            if (res.data.Code !== 200) {
              this.$message.error('日程更新失败')
            } else {
              this.$message.success('更新成功')
            }
            resolve()
          })
          .catch(err => {
            console.error(err)
            reject()
            this.$message.error('日程更新失败')
          })
      })
    },
    // 根据文件名确定图标
    handleFileType(name) {
      // .xlsx, .xls, .doc, .docx, .pdf
      if (name.indexOf('.xlsx') > -1 || name.indexOf('.xls') > -1) {
        return 'excel'
      } else if (name.indexOf('pdf') > -1) {
        return 'PDF'
      } else if (name.indexOf('doc') > -1 || name.indexOf('docx') > -1) {
        return 'wenjianguanli_wordwenjian'
      } else {
        return 'wenjian'
      }
    },
    // 获取日程
    fetchSchedule() {
      getScheduleQuery({
        ID: this.currentScheduleId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.dateEditable = false
            data.remindEditable = false
            data.memberEditable = false
            data.MemberIds = data.Member.map(item => item.Id)
            data.Files = data.Files || []
            data.ResourcesList = data.ResourcesList || []
            this.data = data
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.schedule-detail {
  .schedule-info-list-item {
    position: relative;
    padding: 0 20px;
    background-color: #fff;
    line-height: 40px;
    height: 40px;
    border-bottom: 1px solid #ebeef5;
    .value {
      display: inline-block;
    }
    .icon {
      margin-right: 10px;
    }
    &:hover {
      .edit-btn {
        display: inline-block;
      }
    }
    .edit-btn {
      position: absolute;
      right: 10px;
      display: none;
    }
  }
  .schedule-user-wrap {
    position: relative;
    background-color: #fff;
    &:hover {
      .edit-btn {
        display: inline-block;
      }
    }
    .edit-btn {
      position: absolute;
      right: 20px;
      top: 0;
      display: none;
    }
  }
  .schedule-user-list-item {
    display: flex;
    align-items: center;
    padding: 0 20px 0 40px;
    position: relative;
    background-color: #fff;
    line-height: 40px;
    height: 40px;
    .icon {
      position: absolute;
      left: 20px;
      top: 12px;
      margin-right: 10px;
    }
    .user-avatar {
      flex: 0 0 25px;
      margin: 0 15px;
    }
  }
  .schedule-file-list {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
  }
  .schedule-file {
    flex: 0 0 180px;
    overflow: hidden;
    z-index: 0;
    position: relative;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 4px;
    box-sizing: border-box;
    margin: 10px;
    padding: 6px;
    cursor: pointer;
    .file-type-icon {
      font-size: 40px;
      margin-right: 6px;
    }
    span {
      width: 115px;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transform: translateY(-5px);
      color: #656565;
    }
    &:hover {
      .cover {
        display: block;
      }
      span {
        color: rgb(24, 144, 255);
      }
    }
    .cover {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
      text-align: center;
      line-height: 54px;
    }
    .download-icon {
      font-size: 18px;
      fill: #fff;
    }
  }
}
</style>

<style lang="scss">
.schedule-detail {
  div.el-tabs__nav-scroll {
    background-color: transparent;
    padding-left: 0;
  }
}
</style>
