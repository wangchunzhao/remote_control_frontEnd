<template>
  <div class="content-box permission-manage">
    <el-card shadow="never" class="left-wrap">
      <el-tabs v-model="tabActiveName" @tab-click="handleTabClick">
        <el-tab-pane label="项目角色" name="project">
          <el-button
            style="margin-left: 20px;padding: 8px 0;"
            icon="el-icon-circle-plus"
            type="text"
            v-permission="[19]"
            @click.native="handleAddRole()"
            >新增自定义角色</el-button
          >
          <div style="margin-top: 10px;">
            <div
              v-for="item in projectRoleList"
              @click="() => handleClickRole(item)"
              :key="item.RoleId"
              :class="[
                'role-list-item',
                currentRole && currentRole.RoleId === item.RoleId
                  ? 'active'
                  : undefined
              ]"
            >
              <span class="role-name">{{ item.RoleName }}</span>
              <el-tag
                v-if="item.IsDefault === 1"
                effect="plain"
                type="info"
                size="mini"
                >默认角色</el-tag
              >
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="企业角色" name="company">
          <el-button
            style="margin-left: 20px;padding: 8px 0;"
            icon="el-icon-circle-plus"
            type="text"
            v-permission="[19]"
            @click.native="handleAddRole()"
            >新增自定义角色</el-button
          >
          <div style="margin-top: 10px;">
            <div
              v-for="item in companyRoleList"
              @click="() => handleClickRole(item)"
              :key="item.RoleId"
              :class="[
                'role-list-item',
                currentRole && currentRole.RoleId === item.RoleId
                  ? 'active'
                  : undefined
              ]"
            >
              <span class="role-name">{{ item.RoleName }}</span>
              <el-tag
                v-if="item.IsDefault === 1"
                effect="plain"
                type="info"
                size="mini"
                >默认角色</el-tag
              >
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-card shadow="never" class="right-wrap">
      <div slot="header" class="clearfix">
        <span class="card-title" style="padding-right: 15px;">{{
          currentRole ? currentRole.RoleName : ''
        }}</span>
        <el-button
          @click.native="handleSetDefault"
          v-if="
            currentRole && currentRole.IsCustom && currentRole.IsDefault !== 1
          "
          size="mini"
          v-permission="[22]"
          :loading="setDefaultLoading"
          plain
          >设为默认角色</el-button
        >
        <el-button
          v-if="currentRole && currentRole.IsCustom === true"
          @click.native="handleEditName"
          size="mini"
          v-permission="[20]"
          :loading="editNameLoading"
          plain
          >修改角色名称</el-button
        >
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content">
            删除角色后，企业下所有该角色用<br />户的项目角色将被调整为默认角色
          </div>
          <!-- 只有自定义角色，且非默认的角色可以删除 -->
          <el-button
            v-if="
              currentRole &&
                currentRole.IsCustom === true &&
                currentRole.IsDefault === 0
            "
            @click.native="handleDeleteRole"
            type="danger"
            :loading="deleteLoading"
            v-permission="[21]"
            size="mini"
            >删除角色</el-button
          >
        </el-tooltip>
        <el-button
          type="primary"
          v-if="handlePermissionEditable()"
          style="float: right;"
          :loading="submitLoading"
          @click.native="submitPermission"
        >
          &nbsp;保 存&nbsp;
        </el-button>
      </div>
      <div class="permission-tree-wrap" v-loading="loading">
        <el-tree
          :data="permissionTree"
          show-checkbox
          node-key="FuncId"
          ref="permissionTree"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          :default-checked-keys="permissionChecked"
          :default-expand-all="true"
          :props="defaultProps"
          :indent="0"
        >
          <span
            slot-scope="{ node }"
            :class="['custom-tree-node', `lv${node.level}-node`]"
          >
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
        <div class="gatewayauth-permission-group">
          <div style="color: #606266;flex: 1">
            网关授权
          </div>
          <el-radio-group v-model="gatewayAuth" :max="1">
            <el-radio
              v-for="item in gatewayAuthPermissions"
              :key="item.FuncId"
              :label="item.FuncId"
              @click.native.prevent="
                () => {
                  if (item.disabled) {
                    return
                  }
                  onGatewayAuthChange(item.FuncId)
                }
              "
              :disabled="item.disabled"
            >
              {{ item.FuncName }}
              <!-- <el-tooltip effect="dark" :content="item.remark" placement="top">
                <c-svg name="question-circle"></c-svg>
              </el-tooltip> -->
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import {
  getRoleList,
  setDefaultRole,
  updateRole,
  daleteRole,
  addRole
} from '@/api/role'
import { getRuleTree, editRoleRule } from '@/api/roleFunc'
import { logSnapShotFactory } from '@/utils/logSnapShot'

export default {
  components: {},
  data() {
    return {
      tabActiveName: 'project',
      currentRole: undefined,
      companyRoleList: [],
      projectRoleList: [],
      loading: false,
      submitLoading: false,
      setDefaultLoading: false,
      deleteLoading: false,
      editNameLoading: false,
      permissionTree: [],
      // 网关授权的权限项
      gatewayAuthPermissions: [],
      gatewayAuth: undefined,
      permissionChecked: [],
      defaultProps: {
        children: 'Children',
        label: 'FuncName'
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    permissions() {
      return this.$store.state.permissions.companyPermissions
    }
  },
  watch: {
    currentRole(val) {
      if (val) {
        this.permissionChecked = []
        this.fetchRuleTree()
      }
    }
  },
  mounted() {
    this.fetchCompanyRoles()
    this.fetchProjectRoles()

    window.addEventListener('resize', this.resize)
  },
  methods: {
    handleTabClick({ name }) {
      if (name === 'company') {
        this.currentRole = this.companyRoleList[0]
      } else {
        this.currentRole = this.projectRoleList[0]
      }
    },
    // 新增角色
    handleAddRole() {
      this.$prompt('添加自定义角色', '', {
        inputValue: '',
        confirmButtonText: '确定',
        inputPlaceholder: '输入名称',
        inputValidator: function(value) {
          if (
            value.length > 1 &&
            value.length < 15 &&
            /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)
          ) {
            return true
          } else {
            return '角色名称长度（1至15之间），不可有特殊字符'
          }
        },
        inputErrorMessage: '',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          addRole({
            RoleName: value,
            CompanyId: this.companyId,
            RoleType: this.tabActiveName === 'project' ? 2 : 1
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('角色添加成功')
                if (this.tabActiveName === 'project') {
                  this.fetchProjectRoles()
                } else {
                  this.fetchCompanyRoles()
                }
              } else {
                this.$$message.error('添加失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        })
        .catch(() => {})
    },
    // 修改网关授权角色时触发
    onGatewayAuthChange(val) {
      if (this.gatewayAuth === val) {
        this.gatewayAuth = undefined
      } else {
        this.gatewayAuth = val
      }
    },
    handleClickRole(item) {
      this.currentRole = item
    },
    // 设为默认角色
    handleSetDefault() {
      this.$confirm('确认要将选中的角色设置为默认角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.setDefaultLoading = true
          setDefaultRole({
            roleId: this.currentRole.RoleId
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                this.$message.success('默认角色设置成功')
                if (this.tabActiveName === 'project') {
                  this.fetchProjectRoles()
                } else {
                  this.fetchCompanyRoles()
                }
                this.currentRole.IsDefault = 1
              } else {
                this.$message.error('设置失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('设置失败')
            })
            .finally(() => {
              this.setDefaultLoading = false
            })
        })
        .catch(() => {})
    },
    // 修改角色名
    handleEditName() {
      this.$prompt('修改角色名称', '', {
        inputValue: this.currentRole.RoleName,
        confirmButtonText: '确定',
        inputValidator: function(value) {
          if (
            value.length > 1 &&
            value.length < 15 &&
            /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)
          ) {
            return true
          } else {
            return '角色名称长度（1至15之间），不可有特殊字符'
          }
        },
        inputErrorMessage: '',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          this.editNameLoading = true
          updateRole({
            roleId: this.currentRole.RoleId,
            roleName: value
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                this.$message.success('修改成功')
                this.currentRole.RoleName = value
                if (this.tabActiveName === 'project') {
                  this.fetchProjectRoles()
                } else {
                  this.fetchCompanyRoles()
                }
              } else {
                this.$message.error('修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('修改失败')
            })
            .finally(() => {
              this.editNameLoading = false
            })
        })
        .catch(() => {})
    },
    // 删除角色
    handleDeleteRole() {
      this.$confirm(
        `删除角色后，企业下所有该角色用户的${
          this.tabActiveName === 'project' ? '项目' : '企业'
        }角色将被调整为默认角色，还要继续吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.deleteLoading = true
          daleteRole({
            roleId: this.currentRole.RoleId
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                this.$message.success('删除成功')
                this.currentRole = undefined
                if (this.tabActiveName === 'project') {
                  this.fetchProjectRoles()
                } else {
                  this.fetchCompanyRoles()
                }
              } else {
                this.$message.error('删除成功')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('删除成功')
            })
            .finally(() => {
              this.deleteLoading = false
            })
        })
        .catch(() => {})
    },
    fetchCompanyRoles() {
      getRoleList({
        companyId: this.companyId,
        roleType: 1
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.companyRoleList = res.data.Data
            if (!this.currentRole && this.tabActiveName === 'company') {
              this.currentRole = this.companyRoleList[0]
            }
          } else {
            this.companyRoleList = []
            this.$message.error('企业角色获取失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchProjectRoles() {
      getRoleList({
        companyId: this.companyId,
        roleType: 2
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.projectRoleList = res.data.Data
            if (!this.currentRole && this.tabActiveName === 'project') {
              this.currentRole = this.projectRoleList[0]
            }
          } else {
            this.companyRoprojectRoleListleList = []
            this.$message.error('项目角色获取失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    submitPermission() {
      this.submitLoading = true
      const { fileName, bucketName, objectName } = logSnapShotFactory(
        document.querySelector('.permission-manage')
      )
      const storageSpaceExtendList = {
        FileNameList: [fileName],
        BucketName: bucketName,
        ObjectName: objectName
      }
      const checkedKey = this.$refs.permissionTree.getCheckedKeys()
      if (this.gatewayAuth) {
        checkedKey.push(this.gatewayAuth)
      }
      editRoleRule({
        HalfSelection: this.$refs.permissionTree.getHalfCheckedKeys(),
        FuncIdS: checkedKey,
        RoleId: this.currentRole.RoleId,
        StorageSpaceExtendList: storageSpaceExtendList
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.$message.success('修改成功')
          } else {
            this.$message.error('修改失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('修改失败')
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    fetchRuleTree: debounce(
      function() {
        this.loading = true
        const { RoleId } = this.currentRole

        this.gatewayAuth = undefined
        this.gatewayAuthPermissions = []
        getRuleTree({
          roleId: RoleId,
          PlatformType: this.tabActiveName === 'project' ? 2 : 1,
          industry: undefined,
          companyId: this.companyId
        })
          .then(res => {
            if (res.data.Code === 200) {
              // 如果点击太快，可能会有多次不同的请求
              if (this.currentRole.RoleId === RoleId) {
                const data = res.data.Data
                this.walk(
                  data,
                  this.permissionChecked,
                  !this.handlePermissionEditable()
                )
                // 单独拿出网关授权这个权限组来，因为这个是单选的
                const gatewayAuthGroupIndex = data.findIndex(
                  v => v.FuncName === '网关授权'
                )
                if (gatewayAuthGroupIndex > -1) {
                  this.gatewayAuthPermissions =
                    data[gatewayAuthGroupIndex].Children
                  this.gatewayAuthPermissions.forEach(v => {
                    if (v.Checked) {
                      this.gatewayAuth = v.FuncId
                    }
                  })
                }
                // 删除网关授权权限组
                data.splice(gatewayAuthGroupIndex, 1)
                this.permissionTree = data
                this.$nextTick(() => {
                  this.changeTreeStyle()
                })
              }
            } else {
              this.$message.error('权限列表获取失败')
            }
          })
          .finally(() => {
            if (this.currentRole.RoleId === RoleId) {
              this.loading = false
            }
          })
      },
      500,
      {
        leading: true
      }
    ),
    walk(arr, res, disabled = false) {
      arr.forEach(item => {
        item.disabled = disabled
        // HalfSelection: 0 未选中  1 全选  2半选
        if (item.HalfSelection === 1) {
          res.push(item.FuncId)
        }
        if (item.Children.length) {
          this.walk(item.Children, res, disabled)
        }
      })
    },
    handlePermissionEditable() {
      let eidtable = true
      if (!this.currentRole) {
        return false
      }
      if (this.currentRole.IsCustom === false) {
        // 角色不是自定义角色
        eidtable = false
      } else if (
        !this.permissions.includes(18) &&
        !this.permissions.includes(20)
      ) {
        // 没有修改默认角色权限的且没有修改自定义角色权限
        eidtable = false
      } else if (
        !this.permissions.includes(20) &&
        this.permissions.includes(18) &&
        this.currentRole.IsDefault === 0
      ) {
        // 没有修改自定义角色权限,有修改默认权限，但选中角色不是默认角色的
        eidtable = false
      }
      return eidtable
    },
    // 修改树节点的样式
    changeTreeStyle() {
      const width =
        document.querySelector('.permission-tree-wrap').clientWidth / 5
      const lv2Nodes = document.querySelectorAll('.lv2-node')
      lv2Nodes.forEach(node => {
        let temp = node.parentNode.parentNode
        temp.style.display = 'inline-block'
        temp.style.width = width + 'px'
      })
      const lv1Nodes = document.querySelectorAll('.lv1-node')
      lv1Nodes.forEach(node => {
        let temp = node.parentNode
        temp.parentNode.style.cssText =
          'border-bottom: 2px solid #EBEEF5;padding: 10px;'
        temp.nextElementSibling.style.cssText = `display: inline-block; width: ${width *
          4}px;overflow: visible;white-space: normal;`
        temp.querySelector('.el-tree-node__expand-icon').style.display = 'none'
        temp.style.cssText = `display: inline-block; width: ${width}px; vertical-align: top;line-height: 34px;`
      })
    },
    resize: debounce(function() {
      this.changeTreeStyle()
    }, 200)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
  }
}
</script>

<style lang="scss" scoped>
.permission-manage {
  background-color: transparent;
  display: flex;
  padding: 0;
  .left-wrap {
    flex: 0 0 300px;
    margin-right: 25px;
    padding-bottom: 25px;
  }
  .right-wrap {
    flex: 1;
    .el-tabs__item {
      height: 55px;
      line-height: 55px;
    }
  }

  .role-list-item {
    display: flex;
    align-items: center;
    padding: 0 25px 0 25px;
    height: 40px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    &.active {
      background: #e6f7ff;
      color: #1890ff;
      &:hover {
        .btn-wrap {
          display: inline-block;
        }
      }
    }
    &:hover {
      background-color: #f5f7fa;
      color: #1890ff;
    }
    .el-tag {
      flex: 0 65px;
    }
    .role-name {
      flex: 1;
      margin-right: 10px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .btn-wrap {
      display: none;
      float: right;
      margin-top: 3px;
      i {
        color: red;
      }
    }
  }
  .permission-tree-wrap {
    margin: 16px;
    margin-bottom: 30px;
  }
}
</style>

<style lang="scss">
.permission-manage {
  display: flex;
  .el-card__header {
    & > div {
      height: 18px;
      line-height: 18px;
    }
  }
  .el-card__body {
    padding: 0;
  }
  .el-tabs__nav {
    transform: translateX(75px) !important;
  }
  .el-tabs__nav-wrap::after {
    height: 1px;
  }
  .el-card__header {
    .el-button {
      font-size: 10px;
      padding: 4px;
    }
  }
}
.gatewayauth-permission-group {
  display: flex;
  align-items: center;
  padding: 15px;
  padding-left: 30px;
  .el-radio-group {
    flex: 4;
    display: flex;
    .el-radio {
      flex: 1;
      margin-left: 15px;
    }
  }
  .el-radio__input.is-disabled + span.el-radio__label {
    cursor: default;
    color: #606266;
  }
}
</style>
