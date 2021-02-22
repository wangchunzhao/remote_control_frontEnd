<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        @click.native="() => $refs.memberAddDialog.openDialog()"
        size="small"
        type="primary"
        v-permission="[56]"
      >
        添加成员
      </el-button>
      <el-tooltip placement="top" effect="light" style="display: inline-block;">
        <div slot="content" style="text-align: center;font-size: 12px;">
          <a
            href="javascript:;"
            style="color:rgb(24, 144, 255);"
            @click="downloadTemplate"
            ><c-svg name="download" />下载导入模板</a
          >
        </div>
        <el-upload
          action="123"
          :show-file-list="false"
          accept=".xlsx"
          :before-upload="uploadExcel"
        >
          <el-button
            :loading="uploadLoading"
            size="small"
            v-permission="[56]"
            style="margin: 0 10px;"
          >
            批量导入
          </el-button>
        </el-upload>
      </el-tooltip>
      <el-button
        v-permission="[57]"
        @click.native="handleRemove"
        size="small"
        type="danger"
      >
        移除成员
      </el-button>
      <el-button
        type="text"
        v-permission="[56]"
        @click.native="handleClickInvite"
      >
        <c-svg name="qrcode" style="font-size: 18px;" />
        邀请成员</el-button
      >
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索姓名/手机"
        suffix-icon="el-icon-search"
      />
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @filter-change="filterChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        :selectable="row => row.ProjectRoleName !== '高级管理员'"
        type="selection"
        width="55"
      />
      <el-table-column
        sortable="custom"
        min-width="80"
        prop="Nickname"
        label="姓名"
      >
        <template slot-scope="{ row }">
          <el-input
            v-if="row.Flag === 0 && row.editAble"
            size="small"
            v-model="row.Nickname"
          ></el-input>
          <span v-else>{{ row.Nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="Mobile" label="手机号" />
      <el-table-column
        column-key="ProjectRoleName"
        prop="ProjectRoleName"
        min-width="100"
        :filter-multiple="false"
        :filters="projectRoleOptions"
        label="项目角色"
      >
        <template slot-scope="{ row }">
          <el-select
            v-if="
              row.editAble &&
                checkPermission([58]) &&
                row.ProjectRoleName !== '高级管理员'
            "
            size="medium"
            v-model="row.ProjectRoleId"
            placeholder="请选择"
          >
            <el-option
              v-for="item in projectRoleOptions"
              :label="item.Value"
              :key="item.Key"
              :value="item.Key"
            >
              <span style="float: left">{{ item.Value }}</span>
              <RolePermissionPopover
                :role-type="2"
                :open-delay="0"
                :role-id="item.Key"
              >
                <c-svg
                  style="float: right;color: rgba(0,0,0,0.25);margin-top: 10px;"
                  name="question-circle"
                ></c-svg>
              </RolePermissionPopover>
            </el-option>
          </el-select>
          <div v-if="!row.editAble">
            <RolePermissionPopover :role-type="2" :role-id="row.ProjectRoleId">
              <span>
                {{ row.ProjectRoleName }}
              </span>
            </RolePermissionPopover>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="设备权限">
        <template slot-scope="{ row }">
          <el-button
            v-if="
              row.editAble &&
                checkPermission([59]) &&
                row.ProjectRoleName !== '高级管理员'
            "
            @click.native="openDevicePermissionDialog(row)"
            type="text"
            >点击编辑</el-button
          >
          <el-tooltip
            class="item"
            effect="dark"
            v-else
            :content="row.UserModelNames"
            placement="top"
          >
            <div slot="content" style="max-width: 400px;line-height: 20px;">
              {{ row.UserModelNames }}
            </div>
            <div class="ellipsis">
              {{ row.UserModelNames }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="Flag"
        label="账号状态"
        column-key="Flag"
        :filter-multiple="false"
        min-width="90"
        :filters="[{ text: '已激活', value: 1 }, { text: '未激活', value: 0 }]"
      >
        <template slot-scope="{ row }">
          <el-tag size="mini" :type="row.Flag ? 'success' : 'info'">
            {{ row.Flag === 1 ? '已激活' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="Flag" label="第三方账号">
        <template slot-scope="{ row }">
          <c-svg
            v-if="row.IsWechat"
            style="font-size: 18px;color: #19AD19;"
            name="wechat-fill"
          />
        </template>
      </el-table-column>

      <el-table-column prop="name" width="115" fixed="right" label="操作">
        <template slot-scope="{ row }">
          <el-button
            :icon="row.editAble ? 'el-icon-check' : undefined"
            type="text"
            v-if="
              currentUserId !== row.UId &&
                checkPermission([58, 59]) &&
                row.ProjectRoleName !== '高级管理员'
            "
            :loading="row.loading"
            @click.native="handleClickEdit(row)"
          >
            {{ row.editAble ? '保存' : '编辑' }}
          </el-button>
          <el-button
            v-if="row.editAble"
            type="text"
            @click.native="() => (row.editAble = false)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <InviteQrcodeDialog
      :url="inviteUrl"
      :title="project.label"
      type="project"
      ref="inviteQrcodeDialog"
    />
    <MemberAddDialog
      ref="memberAddDialog"
      :projectSubareaId="project.SubareaId"
      @refresh="fetchTableData"
      :projectRoleOptions="projectRoleOptions"
    />
    <DevicePermissionDialog
      @refresh="fetchTableData"
      ref="devicePermissionDialog"
    />
  </div>
</template>

<script>
import InviteQrcodeDialog from '@/components/InviteQrcodeDialog'
import MemberAddDialog from './MemberAddDialog'
import debounce from 'lodash/debounce'
import { getRoleDropdownList } from '@/api/role'
import {
  getMemberList,
  deleteMember,
  importProjectUser,
  addMember
} from '@/api/userSubarea'
import { addInvitation } from '@/api/invitation'
import DevicePermissionDialog from '@/views/personnelManage/DevicePermissionDialog'
import { checkPermission } from '@/utils/permissions'
import { excel2JSON } from '@/utils/excel2JSON'
import avatarFactory from '@/utils/avatarFactory'
import RolePermissionPopover from '@/components/RolePermissionPopover'

export default {
  components: {
    InviteQrcodeDialog,
    MemberAddDialog,
    DevicePermissionDialog,
    RolePermissionPopover
  },
  data() {
    return {
      uploadLoading: false,
      inviteUrl: {
        inviteText: '',
        qrcodeUrl: '',
        url: ''
      },
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        status: undefined,
        projectRoleId: undefined
      },
      projectRoleOptions: [],

      multipleSelection: [],
      tableLoading: false,
      tableData: [{}],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      checkPermission
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  computed: {
    project() {
      return this.$store.state.app.project
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    currentUserId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  mounted() {
    this.fetchTableData()
    this.fetchProjectRoleOptions()
  },
  methods: {
    // 下载样表
    downloadTemplate() {
      window.open(
        'https://cdn.sinocold.net/excel_template/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E9%A1%B9%E7%9B%AE%E6%88%90%E5%91%98.xlsx',
        '_blank'
      )
    },
    handleClickInvite() {
      addInvitation({
        subareaId: this.project.SubareaId
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
          this.inviteUrl.qrcodeUrl =
            BASE_URI +
            `/api/Uploader/CreateQrCode?content=` +
            encodeURIComponent(url)

          this.inviteUrl.inviteText = `『${data.InviterUserName}』邀请你加入项目『${data.SubareaName}』，点击链接加入项目。${url}`
          this.$refs.inviteQrcodeDialog.openDialog()
        } else {
          this.$message.error('邀请码生成失败')
        }
      })
    },
    // 批量上传
    uploadExcel(file) {
      this.uploadLoading = true
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', this.project.id)
      this.uploadLoading = true
      excel2JSON(file, ['Nickname', 'Mobile', 'ProjectRoleName'])
        .then(res => {
          let form = res.results.splice(1)
          form = form.filter(item => {
            item.Nickname = item.Nickname.toString().trim()
            item.Mobile = item.Mobile.toString().trim()
            item.Avatar = avatarFactory(item.Nickname)
            return (
              item.Nickname &&
              item.Mobile &&
              /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(item.Nickname) &&
              /^[1]([3-9])[0-9]{9}$/.test(item.Mobile)
            )
          })
          importProjectUser({
            companyId: this.companyId,
            projectSubareaId: this.project.SubareaId,
            isSystemImport: false,
            form
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                if (data.Data.Description.FailureNum === 0) {
                  this.$message.success('成员导入成功')
                } else {
                  const errList = data.Data.Description.ErrList
                  let descText = ''
                  errList.forEach(item => {
                    descText += `
                      <div>第${item.ErrKey}行，Message：${item.ErrMessage}</div>
                    `
                  })
                  this.$notify({
                    title: '错误提示',
                    duration: 10000,
                    dangerouslyUseHTMLString: true,
                    message: descText
                  })
                }
                this.fetchTableData()
              } else {
                this.$message.error('批量导入失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
            .finally(() => {
              this.uploadLoading = false
            })
        })
        .catch(err => {
          console.error(err)
          this.$message.error('批量导入失败')
          this.uploadLoading = false
        })
      return false
    },
    handleRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请选择要移除的成员')
        return false
      }
      this.$confirm('确认要移除选中的成员？', '提示', { type: 'warning' })
        .then(() => {
          deleteMember({
            CompanyId: this.companyId,
            SubareaId: this.project.SubareaId,
            UserIdList: this.multipleSelection.map(item => item.UId),
            StorageSpace: undefined
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('成员移除成功')
                this.fetchTableData()
              } else {
                this.$message.error('成员移除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('成员移除失败')
            })
        })
        .catch(() => {})
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'Nickname') {
        this.filterForm.sortProp = 0
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.Flag) {
        this.filterForm.status = filter.Flag[0]
      } else if (filter.ProjectRoleName) {
        this.filterForm.projectRoleId = filter.ProjectRoleName[0]
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 分页
    handleCurrentChange() {
      this.fetchTableData()
    },
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    openDevicePermissionDialog(row) {
      this.$refs.devicePermissionDialog.openDialog({
        projectId: this.project.id,
        userId: row.UId
      })
    },
    // 表格内点击编辑
    handleClickEdit(row) {
      if (row.editAble === true) {
        // 保存
        const {
          Avatar,
          CompanyId,
          Nickname,
          UId,
          Mobile,
          ProjectRoleId,
          CompanyRoleId,
          CompanyRoleName
        } = row
        if (!Nickname) {
          this.$message('请填写姓名')
          return false
        }
        row.loading = true
        const projectRole = this.projectRoleOptions.find(
          item => ProjectRoleId === item.Key
        )
        delete projectRole.value
        delete projectRole.text

        addMember({
          Avatar,
          Nickname,
          Mobile,
          SubareaIdS: undefined,
          SubareaId: this.project.SubareaId,
          CompanyId,
          IsAdd: false,
          UserId: UId,
          CompanyRole: {
            Key: CompanyRoleId,
            Value: CompanyRoleName
          },
          ProjectRole: projectRole
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.$message.success('编辑成功')
              this.fetchTableData()
              row.editAble = false
            } else {
              this.$message.error(res.data.Message)
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('编辑失败')
          })
          .finally(() => {
            row.loading = false
          })
      } else {
        row.editAble = true
      }
    },
    fetchProjectRoleOptions() {
      getRoleDropdownList({
        companyId: this.companyId,
        roleType: 2
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.projectRoleOptions = res.data.Data
            this.projectRoleOptions.forEach(item => {
              item.value = item.Key
              item.text = item.Value
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取表格数据
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { currentPage, size } = this.pagination
        const { text, sortProp, isAsc, status, projectRoleId } = this.filterForm
        getMemberList({
          CompanyId: this.companyId,
          UserType: undefined,
          SubareaId: this.project.SubareaId,
          UserNameOrMobile: text,
          CompanyRoleId: undefined,
          ProjectRoleId: projectRoleId,
          ActiveStatus: status,
          SortType: sortProp,
          IsAsc: isAsc,
          pageIndex: currentPage,
          pageSize: size
        })
          .then(res => {
            if (
              currentPage !== this.pagination.currentPage ||
              size !== this.pagination.size ||
              text !== this.filterForm.text
            ) {
              return
            }
            const data = res.data
            if (data.Code === 200) {
              if (data.Data === null) {
                this.tableData = []
                return false
              }
              data.Data.Data.forEach(item => {
                item.editAble = false
                item.loading = false
              })
              this.tableData = data.Data.Data

              this.pagination.total = data.Data.TotalCount
            } else {
              this.tableData = []
              this.$message.error(res.data.Message)
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('用户列表获取失败')
          })
          .finally(() => {
            if (
              currentPage !== this.pagination.currentPage ||
              size !== this.pagination.size ||
              text !== this.filterForm.text
            ) {
              return
            }
            this.tableLoading = false
          })
      },
      1000,
      {
        leading: true
      }
    )
  }
}
</script>

<style lang="scss" scoped></style>
