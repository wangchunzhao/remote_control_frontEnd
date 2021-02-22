<template>
  <div class="content-box personnel-manage-member">
    <el-card shadow="never" class="left-wrap">
      <span id="scroll-target" />
      <div class="section-title">成员类型</div>
      <div
        @click="() => handleChangeUserType({ value: 1, label: '所有成员' })"
        :class="[
          'member-type-item',
          userType && userType.value === 1 ? 'active' : undefined
        ]"
      >
        <c-svg name="team1" style="font-size: 18px;margin-right: 8px;" />
        <span>所有成员</span>
      </div>
      <div
        @click="() => handleChangeUserType({ value: 2, label: '外部成员' })"
        :class="[
          'member-type-item',
          userType && userType.value === 2 ? 'active' : undefined
        ]"
      >
        <c-svg name="waibuchengyuan" />
        <span>外部成员</span>
      </div>
      <div
        @click="
          () => handleChangeUserType({ value: 3, label: '未分配项目的成员' })
        "
        :class="[
          'member-type-item',
          userType && userType.value === 3 ? 'active' : undefined
        ]"
      >
        <c-svg name="weifenpeixiangmuchengyuan" />
        <span>未分配项目的成员</span>
      </div>
      <div class="section-title" style="margin-top: 15px;">项目结构</div>
      <div>
        <div>
          <el-input
            v-model="treeFilter"
            placeholder="搜索"
            clearable
            size="small"
            suffix-icon="el-icon-search"
          />
          <el-tree
            ref="tree"
            v-loading="treeLoading"
            :data="structTree"
            node-key="SubareaId"
            default-expand-all
            :expand-on-click-node="false"
            style="margin-top: 15px;"
            :filter-node-method="filterNode"
            highlight-current
            :props="{
              children: 'Children',
              label: 'SubareaName'
            }"
            @node-click="clickNode"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <c-svg
                :name="
                  data.Remark === '项目' ? 'location-fill' : 'folder-open-fill'
                "
                :style="{
                  color: data.Remark === '项目' ? '#909399' : '#5AC8FA'
                }"
              />
              {{ node.label
              }}{{ data.Remark !== '项目' ? `（${data.Count}）` : '' }}
            </span>
          </el-tree>
        </div>
      </div>
    </el-card>
    <el-card shadow="never" class="right-wrap">
      <div slot="header" class="clearfix">
        <span class="card-title">{{
          currentNode
            ? currentNode.SubareaName +
              (pagination.total > 0 ? `（${pagination.total}人）` : '')
            : userType.label +
              (pagination.total > 0 ? `（${pagination.total}人）` : '')
        }}</span>
      </div>
      <!-- 只有「所有成员」和具体项目的右侧列表上有添加、导入、删除和邀请操作 -->
      <div
        v-if="
          (userType && userType.value === 1) ||
            (currentNode && currentNode.Remark === '项目')
        "
        class="clearfix"
      >
        <el-button
          size="small"
          type="primary"
          v-permission="[13]"
          @click.native="handleOpenAddDialog"
        >
          添加成员
        </el-button>
        <el-tooltip class="item" effect="light" placement="top">
          <div slot="content">
            <div v-if="currentNode && currentNode.Remark === '项目'">
              下载项目成员导入表<a
                href="javascript:;"
                style="color:#409EFF"
                @click="downloadExcelTemplate('project')"
              >
                下载<c-svg name="download"
              /></a>
            </div>
            <div v-else>
              批量导入企业成员样表<a
                href="javascript:;"
                style="color:#409EFF"
                @click="downloadExcelTemplate('company')"
              >
                下载<c-svg name="download"
              /></a>
            </div>
          </div>
          <el-upload
            :before-upload="beforeUpload"
            style="display: inline-block;margin: 0 10px;"
            action="#2333"
            accept=".xlsx"
          >
            <el-button
              :loading="uploadLoading"
              v-permission="[13]"
              size="small"
            >
              批量导入
            </el-button>
          </el-upload>
        </el-tooltip>

        <el-button
          v-permission="[14]"
          size="small"
          type="danger"
          @click.native="removeMember"
        >
          移除成员
        </el-button>
        <el-button
          type="text"
          v-permission="[13]"
          @click.native="handleClickInvite"
        >
          <c-svg name="qrcode" style="font-size: 18px;" />
          邀请成员加入{{
            currentNode && currentNode.Remark === '项目' ? '项目' : '企业'
          }}</el-button
        >
        <el-input
          v-model.trim="filterForm.text"
          placeholder="搜索姓名或手机号"
          clearable
          size="small"
          suffix-icon="el-icon-search"
          style="width: 165px;float: right;"
        />
      </div>
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        class="member-table"
        ref="memberTable"
        style="width: 100%;margin-top: 20px;"
        @sort-change="sortChange"
        @filter-change="filterChange"
        @selection-change="val => (multipleSelection = val)"
      >
        <el-table-column
          type="selection"
          :selectable="row => row.UId !== currentUserId"
          width="50"
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
        <el-table-column prop="Mobile" min-width="110" label="联系电话" />

        <el-table-column
          column-key="CompanyRoleName"
          prop="CompanyRoleName"
          min-width="100"
          :filters="companyRoleOptions"
          :filter-multiple="false"
          label="企业角色"
        >
          <template slot-scope="{ row }">
            <el-select
              v-if="row.editAble && row.UId !== currentUserId"
              size="medium"
              v-model="row.CompanyRoleId"
              placeholder="请选择"
            >
              <el-option
                v-for="item in companyRoleOptions"
                :label="item.Value"
                :key="item.Key"
                :value="item.Key"
              >
                <span style="float: left">{{ item.Value }}</span>
                <RolePermissionPopover
                  :role-type="1"
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
            <div v-else>
              <RolePermissionPopover
                :role-type="1"
                :role-id="row.CompanyRoleId"
              >
                <span>
                  {{ row.CompanyRoleName }}
                </span>
              </RolePermissionPopover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="userType || (currentNode && currentNode.Remark !== '项目')"
          min-width="180"
          prop="SubareaNames"
          class-name="member-table_column"
          label="项目权限"
        >
          <template slot-scope="{ row }">
            <treeselect
              v-if="row.editAble"
              v-model="row.SubareaId"
              :default-expand-level="1"
              :options="structTree"
              style="line-height: 20px;"
              placeholder="请选择"
              :append-to-body="true"
              :normalizer="normalizer"
              :multiple="true"
              :show-count="true"
            />
            <span v-else>{{ row.SubareaNames }}</span>
          </template>
        </el-table-column>
        <el-table-column
          column-key="ProjectRoleName"
          prop="ProjectRoleName"
          min-width="100"
          :filter-multiple="false"
          v-if="currentNode && currentNode.Remark === '项目'"
          :filters="
            currentNode && currentNode.Remark === '项目'
              ? projectRoleOptions
              : undefined
          "
          label="项目角色"
        >
          <template slot-scope="{ row }">
            <el-select
              v-if="row.editAble && row.UId !== currentUserId"
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
            <div v-else>
              <RolePermissionPopover
                :role-type="2"
                :role-id="row.ProjectRoleId"
              >
                <span>
                  {{ row.ProjectRoleName }}
                </span>
              </RolePermissionPopover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="currentNode && currentNode.Remark === '项目'"
          prop="Flag"
          min-width="180"
          show-overflow-tooltip
          label="设备权限"
        >
          <template slot-scope="{ row }">
            <el-button
              v-if="row.editAble"
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
          :filters="[
            { text: '已激活', value: 1 },
            { text: '未激活', value: 0 }
          ]"
        >
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.Flag ? 'success' : 'info'">
              {{ row.Flag === 1 ? '已激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="IsWechat" min-width="110" label="第三方账号">
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
              v-permission="[15]"
              :icon="row.editAble ? 'el-icon-check' : undefined"
              type="text"
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
    </el-card>
    <MemberCompanyAddDialog
      :structTree="structTree"
      :companyRoleOptions="companyRoleOptions"
      @refresh="fetchTableData"
      ref="memberCompanyAddDialog"
    />
    <MemberProjectAddDialog
      @refresh="fetchTableData"
      :projectSubareaId="currentNode ? currentNode.SubareaId : undefined"
      :projectRoleOptions="projectRoleOptions"
      ref="memberProjectAddDialog"
    />
    <InviteQrcodeDialog
      :url="inviteUrl"
      :title="company.label"
      :type="
        currentNode && currentNode.Remark === '项目' ? 'project' : 'company'
      "
      ref="inviteQrcodeDialog"
    />
    <DevicePermissionDialog
      @refresh="fetchTableData"
      ref="devicePermissionDialog"
    />
  </div>
</template>

<script>
// import { getSubareaTree } from '@/api/subarea'
import avatarFactory from '@/utils/avatarFactory'
import {
  getMemberList,
  deleteMember,
  importProjectUser,
  importCompanyUser,
  addMember
} from '@/api/userSubarea'
import { getRoleDropdownList } from '@/api/role'
import { excel2JSON } from '@/utils/excel2JSON'
import MemberCompanyAddDialog from './MemberAddDialog'
import MemberProjectAddDialog from '@/views/projectConfig/projectMember/MemberAddDialog'
import InviteQrcodeDialog from '@/components/InviteQrcodeDialog'
import debounce from 'lodash/debounce'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import DevicePermissionDialog from './DevicePermissionDialog'
import { addInvitation } from '@/api/invitation'
import RolePermissionPopover from '@/components/RolePermissionPopover'

export default {
  components: {
    MemberCompanyAddDialog,
    MemberProjectAddDialog,
    InviteQrcodeDialog,
    DevicePermissionDialog,
    Treeselect,
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
      treeFilter: '',
      userType: {
        value: 1,
        label: '所有成员'
      },

      structTree: [],
      currentNode: undefined,
      treeLoading: false,
      projectRoleOptions: [],
      companyRoleOptions: [],
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        status: undefined,
        companyRoleId: undefined,
        projectRoleId: undefined
      },
      tableLoading: false,
      tableData: [],
      multipleSelection: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      normalizer(node) {
        return {
          id: node.SubareaId,
          label: node.SubareaName,
          children: node.Children
        }
      },
      currentUserId: this.$store.state.app.userInfo.uid
    }
  },
  watch: {
    treeFilter(val) {
      this.$refs.tree.filter(val)
    },
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    currentNode() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    companyStruct: {
      handler: function() {
        this.structTree = [this.companyStruct]
        this.walk(this.structTree)
      },
      immediate: true
    }
  },
  computed: {
    company() {
      return this.$store.state.app.company
    },
    companyStruct() {
      return this.$store.state.app.companyStruct
    }
  },
  mounted() {
    this.fetchTableData()
    // this.fetchSumbareaTree()
    this.fetchCompanyRoleOptions()
    this.fetchProjectRoleOptions()
  },
  methods: {
    // 点击成员类型
    handleChangeUserType(val) {
      this.userType = val
      this.currentNode = undefined
      this.pagination.currentPage = 1
      this.fetchTableData()
      this.$refs.tree.setCurrentKey(null)
    },
    // 点击树节点
    clickNode(data) {
      this.userType = undefined
      this.currentNode = data
      this.pagination.total = 0
      document.querySelector('#scroll-target').scrollIntoView({
        block: 'end',
        behavior: 'smooth'
      })
    },
    handleOpenAddDialog() {
      if (this.currentNode && this.currentNode.Remark === '项目') {
        this.$refs.memberProjectAddDialog.openDialog()
      } else {
        this.$refs.memberCompanyAddDialog.openDialog()
      }
    },
    // 移除成员
    removeMember() {
      if (!this.multipleSelection.length) {
        this.$message('请选择要移除的成员')
        return false
      }

      this.$confirm('确认要移除选中的成员？', '提示', { type: 'warning' })
        .then(() => {
          deleteMember({
            CompanyId: this.company.id,
            SubareaId: this.currentNode
              ? this.currentNode.SubareaId
              : undefined,
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
    // 下载样表
    downloadExcelTemplate(type) {
      let url = ''
      if (type === 'project') {
        url =
          'https://cdn.sinocold.net/excel_template/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E9%A1%B9%E7%9B%AE%E6%88%90%E5%91%98-%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86.xlsx'
      } else {
        url =
          'https://cdn.sinocold.net/excel_template/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E4%BC%81%E4%B8%9A%E6%88%90%E5%91%98.xlsx'
      }
      window.open(url, '_blank')
    },
    // 上传导入文件
    beforeUpload(file) {
      this.uploadLoading = true
      if (this.currentNode && this.currentNode.Remark === '项目') {
        // 导入项目成员
        excel2JSON(file, [
          'Nickname',
          'Mobile',
          'ProjectRoleName',
          'CompanyRoleName'
        ])
          .then(({ results, header }) => {
            if (
              !(
                header.includes('*姓名') &&
                header.includes('*手机号') &&
                header.includes('项目角色') &&
                header.includes('企业角色')
              )
            ) {
              this.$message('你似乎使用了错误的导入模板')
              this.uploadLoading = false
              return false
            }
            let form = results.splice(1)
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
              companyId: this.company.id,
              projectSubareaId: this.currentNode.SubareaId,
              isSystemImport: true,
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
      } else {
        // 导入企业成员
        excel2JSON(file, [
          'Nickname',
          'Mobile',
          'CompanyRoleName',
          'SubareaName'
        ])
          .then(({ results, header }) => {
            if (
              !(
                header.includes('*姓名') &&
                header.includes('*手机号') &&
                header.includes('加入项目') &&
                header.includes('企业角色')
              )
            ) {
              this.$message('你似乎使用了错误的导入模板')
              this.uploadLoading = false
              return false
            }
            let form = results.splice(1)
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
            importCompanyUser({
              companyId: this.company.id,
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
      }

      return false
    },
    handleClickInvite() {
      addInvitation({
        subareaId: this.structTree[0].SubareaId
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          let url = ''
          if (this.currentNode && this.currentNode.Remark === '项目') {
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
          } else {
            if (process.env.NODE_ENV !== 'production') {
              // 开发环境
              url = `http://dev.sinocold.com:81/utopia/#/invite?invitationId=${data.InvitationId}&type=company`
            } else {
              // 正式环境
              if (this.company.id === 3) {
                // 康德乐
                url = `http://kdlhealth.sinocold.net/#/invite?invitationId=${data.InvitationId}&type=company`
              } else if (this.company.id === 6) {
                // 科立德
                url = `http://yun.ikold.com.cn/#/invite?invitationId=${data.InvitationId}&type=company`
              } else {
                url = `https://yun.sinocold.net/#/invite?invitationId=${data.InvitationId}&type=company`
              }
            }
            this.inviteUrl.url = url
            this.inviteUrl.qrcodeUrl =
              BASE_URI +
              `/api/Uploader/CreateQrCode?content=` +
              encodeURIComponent(url)

            this.inviteUrl.inviteText = `『${data.InviterUserName}』邀请你加入企业『${data.SubareaName}』，点击链接加入企业。${url}`
          }

          this.$refs.inviteQrcodeDialog.openDialog()
        } else {
          this.$message.error('邀请码生成失败')
        }
      })
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
      } else if (filter.CompanyRoleName) {
        this.filterForm.companyRoleId = filter.CompanyRoleName[0]
      } else if (filter.ProjectRoleName) {
        this.filterForm.projectRoleId = filter.ProjectRoleName[0]
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    filterNode(value, data) {
      if (!value) return true
      return data.SubareaName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    openDevicePermissionDialog(row) {
      this.$refs.devicePermissionDialog.openDialog({
        projectId: this.currentNode.ProjectId,
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
          SubareaId,
          CompanyRoleId,
          ProjectRoleId
        } = row
        if (!Nickname) {
          this.$message('请填写姓名')
          return false
        }
        row.loading = true
        const companyRole = this.companyRoleOptions.find(
          item => item.Key === CompanyRoleId
        )
        delete companyRole.value
        delete companyRole.text

        const projectRole = this.projectRoleOptions.find(
          item => ProjectRoleId === item.Key
        )
        if (projectRole) {
          delete projectRole.value
          delete projectRole.text
        }

        addMember({
          Avatar,
          Nickname,
          Mobile,
          SubareaIdS:
            this.currentNode && this.currentNode.Remark === '项目'
              ? undefined
              : SubareaId,
          SubareaId:
            this.currentNode && this.currentNode.Remark === '项目'
              ? this.currentNode.SubareaId
              : undefined,
          CompanyId,
          IsAdd: false,
          UserId: UId,
          CompanyRole: companyRole,
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
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { currentPage, size } = this.pagination
        const currentNode = this.currentNode
          ? { ...this.currentNode }
          : undefined
        const {
          text,
          sortProp,
          isAsc,
          status,
          companyRoleId,
          projectRoleId
        } = this.filterForm
        getMemberList({
          CompanyId: this.company.id,
          UserType: this.userType ? this.userType.value : undefined,
          SubareaId: this.currentNode ? this.currentNode.SubareaId : undefined,
          UserNameOrMobile: text,
          CompanyRoleId: companyRoleId,
          ProjectRoleId:
            this.currentNode && this.currentNode.Remark === '项目'
              ? projectRoleId
              : undefined,
          ActiveStatus: status,
          SortType: sortProp,
          IsAsc: isAsc,
          pageIndex: currentPage,
          pageSize: size
        })
          .then(res => {
            if (
              this.pagination.currentPage !== currentPage ||
              this.pagination.size !== size ||
              text !== this.filterForm.text ||
              JSON.stringify(currentNode) !== JSON.stringify(this.currentNode)
            ) {
              return false
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
              this.pagination.currentPage !== currentPage ||
              this.pagination.size !== size ||
              text !== this.filterForm.text ||
              JSON.stringify(currentNode) !== JSON.stringify(this.currentNode)
            ) {
              return false
            }
            this.tableLoading = false
          })
      },
      1000,
      {
        leading: true
      }
    ),
    // fetchSumbareaTree() {
    //   this.treeLoading = true
    //   getSubareaTree({
    //     companyId: this.company.id
    //   })
    //     .then(res => {
    //       const data = res.data
    //       if (data.Code === 200) {
    //         const tree = [data.Data]
    //         this.walk(tree)
    //         this.structTree = tree
    //         // this.currentNode = this.structTree[0]
    //         // this.$nextTick(() => {
    //         //   this.$refs.tree &&
    //         //     this.$refs.tree.setCurrentKey(this.currentNode.SubareaId)
    //         // })
    //       } else {
    //         this.$message.error('项目结构树获取失败')
    //       }
    //     })
    //     .catch(err => {
    //       console.error(err)
    //       this.$message.error('项目结构树获取失败')
    //     })
    //     .finally(() => {
    //       this.treeLoading = false
    //     })
    // },
    fetchSumbareaTree() {
      this.treeLoading = true
      this.$store
        .dispatch('fetchCompanyStruct')
        .catch(err => {
          this.$message.error(err)
        })
        .finally(() => {
          this.treeLoading = false
        })
    },
    fetchCompanyRoleOptions() {
      getRoleDropdownList({
        companyId: this.company.id,
        roleType: 1
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.companyRoleOptions = res.data.Data
            this.companyRoleOptions.forEach(item => {
              item.value = item.Key
              item.text = item.Value
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchProjectRoleOptions() {
      getRoleDropdownList({
        companyId: this.company.id,
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

<style lang="scss">
.personnel-manage-member {
  display: flex;
  background-color: transparent;
  padding: 0;
  .left-wrap {
    flex: 0 0 350px;
    margin-right: 25px;
  }
  .right-wrap {
    flex: 1;
  }
  .member-type-item {
    height: 34px;
    line-height: 34px;
    cursor: pointer;
    .icon {
      margin-right: 10px;
      font-size: 15px;
    }
    &:hover {
      background-color: #f5f7fa;
    }
    &.active {
      background-color: #f0f7ff;
    }
  }
  .section-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 15px;
  }
  .el-pagination {
    margin-top: 15px;
    text-align: center;
  }

  .member-table_column {
    .el-table__column-filter-trigger {
      display: none;
    }
  }
}
</style>
