<template>
  <div class="pact-template">
    <page-header :showBack="true" :title="templateInfo.MaintenanceTemplateName">
      <template v-slot:right>
        <el-button
          size="mini"
          @click.native="handleCopyTemplate"
          style="padding: 5px 7px;margin-left: 15px;"
        >
          <c-svg name="paste"></c-svg>
          复制模板
        </el-button>
        <el-button
          size="mini"
          :loading="preViewLoading"
          @click.native="() => preView(true)"
          style="padding: 5px 7px;"
        >
          <c-svg v-if="!preViewLoading" name="chakan" />
          预览报告
        </el-button>
        <el-button
          size="mini"
          @click.native="watchAssociatedPact"
          style="padding: 5px 7px;"
        >
          <c-svg name="meiyouzhanghao" />
          查看关联合同
        </el-button>
        <el-button
          size="mini"
          type="danger"
          @click.native="handleRemoveTemplate"
          style="padding: 5px 7px;"
        >
          <c-svg name="delete" />
          删除模板
        </el-button>
      </template>
      <template v-slot:bottom>
        <div class="pact-info">
          <div class="info-item">
            <span class="label">类型：</span>
            <span>{{ templateInfo.BigTypeName }}</span>
          </div>
          <div class="info-item">
            <span class="label">周期：</span>
            <span>
              {{
                templateInfo.MaintenanceCycle === 0
                  ? '周'
                  : templateInfo.MaintenanceCycle === 2
                  ? '半月'
                  : templateInfo.MaintenanceCycle === 4
                  ? '月'
                  : templateInfo.MaintenanceCycle === 6
                  ? '季度'
                  : templateInfo.MaintenanceCycle === 7
                  ? '半年'
                  : templateInfo.MaintenanceCycle === 8
                  ? '年'
                  : ''
              }}</span
            >
          </div>
          <div class="info-item">
            <span class="label">保养类型：</span>
            <span>{{
              templateInfo.MaintenanceType === 0 ? '现场保养' : '远程保养'
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">维保内容项数量：</span>
            <span>{{ templateItemCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">修订时间：</span>
            <span>{{ templateInfo.UpdateTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">修订人：</span>
            <span>{{ templateInfo.OperateUName }}</span>
          </div>
        </div>
      </template>
    </page-header>
    <div
      v-loading="pageLoading"
      class="content-box"
      style="background-color: transparent;position: relative;padding: 0;"
    >
      <el-input
        v-model="filterText"
        size="small"
        clearable
        style="width: 200px;position: absolute;right: 3px;top: -6px;z-index: 10"
        placeholder="搜索维保内容"
        suffix-icon="el-icon-search"
      />
      <div
        v-for="group in groupList"
        :key="group.name"
        style="margin-bottom: 35px;"
        class="group-wrap"
      >
        <div style="position: relative;">
          <span style="font-size: 18px;">{{ group.name }}</span>
          <div class="group-title-btn">
            <el-button type="text" @click.native="handleGroupNameEdit(group)">
              <c-svg name="bianji" />
            </el-button>
            <el-button
              @click.native="handleGroupRemove(group.name)"
              class="btn-danger"
              type="text"
            >
              <c-svg name="delete" />
            </el-button>
          </div>
        </div>
        <draggable
          :list="group.items"
          class="list-group el-row el-row--flex"
          ghost-class="ghost"
          :disabled="Boolean(filterText)"
          :draggable="'.draggable-item'"
          @change="() => orderChange(group.items)"
          style="margin-left: -10px; margin-right: -10px; flex-wrap: wrap;"
        >
          <el-col
            v-for="(item, index) in group.items"
            :key="index"
            :sm="8"
            :md="8"
            :lg="8"
            class="draggable-item"
            style="margin-top: 20px;padding-left: 10px; padding-right: 10px;"
          >
            <component
              v-bind:is="'Template' + item.templateType"
              :title="item.name"
              :itemId="item.itemId"
              :contents="item.contents"
              @remove="itemId => handleItemRemove(itemId)"
              @edit="
                () =>
                  handleItemEdit(
                    item.templateType,
                    item.contents,
                    item.itemId,
                    item.name,
                    group.name
                  )
              "
            ></component>
          </el-col>
          <el-col
            :sm="8"
            :md="8"
            slot="footer"
            :lg="8"
            style="margin-top: 20px;padding-left: 10px; padding-right: 10px;"
          >
            <div
              class="add-box"
              @click="handleClickBtn(group.name, group.items.length + 1)"
            >
              <div class="add-box-content">
                <div>
                  <i class="el-icon-plus"></i>
                </div>
                <span
                  style="font-size: 16px;line-height: 60px;color: rgba(0, 0, 0, 0.15);"
                  >点击添加新维保内容项</span
                >
              </div>
            </div>
          </el-col>
        </draggable>
      </div>

      <div style="margin-top: 20px;" @click="addGroup">
        <el-button icon="el-icon-plus" type="text" style="font-size: 16px;"
          >新增分组</el-button
        >
      </div>
    </div>
    <TemplateItemForm ref="templateItemForm" @refresh="fetchData" />
    <TemplateCopyForm ref="templateCopyForm" />
    <el-dialog
      title="关联合同"
      :visible.sync="associatedDialogVisible"
      width="700"
      @close="
        () => {
          associatedPactList = []
        }
      "
    >
      <el-table
        v-loading="associatedPactLoading"
        :data="associatedPactList"
        style="width: 100%;"
      >
        <el-table-column prop="ContractName" label="合同名称" />
        <el-table-column prop="ContractNumber" label="合同编号" />
        <el-table-column prop="ContractStatus" label="合同状态">
          <template slot-scope="{ row }">
            <el-tag
              size="small"
              :type="
                row.ContractStatus === 0
                  ? 'warning'
                  : row.ContractStatus === 1
                  ? 'success'
                  : row.ContractStatus === 2
                  ? 'info'
                  : ''
              "
            >
              {{
                row.ContractStatus === 0
                  ? '待签约'
                  : row.ContractStatus === 1
                  ? '执行中'
                  : row.ContractStatus === 2
                  ? '已到期'
                  : ''
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="PartyBName" label="维保单位" />
        <el-table-column prop="StartDate" label="开始日期">
          <template slot-scope="{ row }">
            {{ _dateFormat(row.StartDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column prop="EndDate" label="结束日期">
          <template slot-scope="{ row }">
            {{ _dateFormat(row.EndDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
// 0:选择项 1:数值 2:是否 3:文本 4:清单
import Template0 from './component/Template0'
import Template1 from './component/Template1'
import Template2 from './component/Template2'
import Template3 from './component/Template3'
import Template4 from './component/Template4'
import TemplateItemForm from './component/TemplateItemForm'
import TemplateCopyForm from './component/TemplateCopyForm'
import draggable from 'vuedraggable'

import {
  getMaintenanceTemplateItemList,
  deleteMaintenanceTemplateItem,
  deleteMaintenanceTemplateItemByGroupName,
  UpdateMaintenanceTemplateGroupName,
  maintenanceTemplateItemOrder,
  deleteMaintenanceTemplate,
  getMaintenanceTemplateInfo,
  updateMaintenanceTemplateUrl,
  getTemplateRelateContractListGetTemplateRelateContractList
} from '@/api/maintenanceTemplate'
// import { transSpecialChar } from '@/utils/index'
import { generateHtml } from '@/utils/pactTemplate'

export default {
  components: {
    Template0,
    Template1,
    Template2,
    Template3,
    Template4,
    TemplateItemForm,
    TemplateCopyForm,
    draggable
  },
  data() {
    return {
      preViewLoading: false,
      pageLoading: false,
      filterText: '',
      templateInfo: {},
      groupList: [],
      groupListSource: [],

      associatedPactLoading: false,
      associatedDialogVisible: false,
      associatedPactList: []
    }
  },
  watch: {
    filterText() {
      const list = JSON.parse(JSON.stringify(this.groupListSource))
      this.groupList = list.filter(group => {
        const temp = group.items.filter(items => {
          return (
            items.name.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1
          )
        })
        group.items = temp
        return group
      })
    }
  },
  computed: {
    templateItemCount() {
      let count = 0
      this.groupListSource.forEach(group => {
        count += group.items.length
      })
      return count
    }
  },
  beforeRouteLeave(to, from, next) {
    this.preView(false) // 退过当前页面时，假定用户已经对模板做出了更新，调用该方法生成预览文件
    next()
  },
  mounted() {
    this.templateInfo = JSON.parse(this.$route.query.data)
    this.fetchTemplateInfo() // 因为可能从维保合同页跳转到当前页，url上的参数信息不全，所以要调用当前方法获取模板详细信息
    this.fetchData()
  },
  methods: {
    // 复制模板
    handleCopyTemplate() {
      this.$refs.templateCopyForm.openDialog(this.templateInfo)
    },
    // 预览
    preView(autoOpen) {
      this.preViewLoading = true
      let html = ''
      try {
        html = generateHtml(this.groupListSource)
      } catch (error) {
        console.error(error)
        this.$message.error('生成预览文件失败')
        this.preViewLoading = false
        return false
      }
      updateMaintenanceTemplateUrl({
        maintenanceTemplateId: this.templateInfo.MaintenanceTemplateId,
        htmlText: html
      })
        .then(res => {
          if (res.data.Code === 200) {
            if (autoOpen) {
              window.open(res.data.Data, '_blank')
            }
          } else {
            this.$message.error('生成预览文件失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('生成预览文件失败')
        })
        .finally(() => {
          this.preViewLoading = false
        })
    },
    watchAssociatedPact() {
      this.associatedDialogVisible = true
      this.associatedPactLoading = true
      getTemplateRelateContractListGetTemplateRelateContractList({
        maintenanceTemplateId: this.templateInfo.MaintenanceTemplateId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.associatedPactList = res.data.Data
          } else {
            this.$message.error('关联合同查询失败')
            this.associatedPactList = []
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('关联合同查询失败')
        })
        .finally(() => {
          this.associatedPactLoading = false
        })
    },
    // 删除模板
    handleRemoveTemplate() {
      this.$confirm('确认要删除该模板?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteMaintenanceTemplate({
            maintenanceTemplateId: this.templateInfo.MaintenanceTemplateId
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('删除成功')
                this.$router.go(-1)
                this.fetchData()
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              this.$message.error('删除失败')
              console.error(err)
            })
        })
        .catch(() => {})
    },
    orderChange(list) {
      let form = []
      list.forEach((item, index) => {
        form.push({
          MaintenanceTemplateItemID: item.itemId,
          order: index + 1
        })
      })
      maintenanceTemplateItemOrder(form)
        .then(res => {
          if (res.data.Code !== 200) {
            this.$message('排序失败，请刷新页面')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message('排序失败，请刷新页面')
        })
    },
    // 点击新增维保项
    handleClickBtn(groupName, order) {
      this.$refs.templateItemForm.openDialog({
        itemId: undefined,
        templateId: this.templateInfo.MaintenanceTemplateId,
        groupName: groupName,
        order: order
      })
    },
    // 删除维保项
    handleItemRemove(itemId) {
      deleteMaintenanceTemplateItem({
        maintenanceTemplateItemId: itemId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error('删除失败')
          }
        })
        .catch(err => {
          this.$message.error('删除失败')
          console.error(err)
        })
    },
    // 编辑维保项
    handleItemEdit(templateType, contents, itemId, itemName, groupName) {
      this.$refs.templateItemForm.openDialog({
        itemId,
        templateId: this.templateInfo.MaintenanceTemplateId,
        groupName,
        itemName,
        contents: JSON.parse(JSON.stringify(contents)),
        templateType
      })
    },
    // 删除组
    handleGroupRemove(groupName) {
      this.$confirm('确认要删除选中的分组?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteMaintenanceTemplateItemByGroupName({
            maintenanceTemplateId: this.templateInfo.MaintenanceTemplateId,
            oldGroupName: groupName
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('删除成功')
                this.fetchData()
              } else {
                this.$message.error('删除失败')
              }
            })
            .catch(err => {
              this.$message.error('删除失败')
              console.error(err)
            })
        })
        .catch(() => {})
    },
    // 新增分组
    addGroup() {
      this.$prompt('', '新增分组', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入分组名称',
        inputPattern: /.{1,20}/,
        inputErrorMessage: '分组名长度（1至20之间）'
      })
        .then(({ value }) => {
          this.groupListSource.push({
            name: value,
            items: []
          })
          this.groupList.push({
            name: value,
            items: []
          })
        })
        .catch(() => {})
    },
    // 修改分组名
    handleGroupNameEdit(group) {
      this.$prompt('', '编辑分组名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: group.name,
        inputPlaceholder: '请输入分组名称',
        inputPattern: /.{1,20}/,
        inputErrorMessage: '分组名长度（1至20之间）'
      })
        .then(({ value }) => {
          UpdateMaintenanceTemplateGroupName({
            maintenanceTemplateId: this.templateInfo.MaintenanceTemplateId,
            oldGroupName: group.name,
            newGroupName: value
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('编辑成功')
                group.name = value
              } else {
                this.$message.error('编辑失败')
              }
            })
            .catch(err => {
              this.$message.error('编辑失败')
              console.error(err)
            })
        })
        .catch(() => {})
    },
    // 获取模板基本信息
    fetchTemplateInfo() {
      getMaintenanceTemplateInfo({
        maintenanceTemplateId: this.templateInfo.MaintenanceTemplateId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.templateInfo = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取模板项目
    fetchData() {
      this.pageLoading = true
      this.groupListSource = []
      this.groupList = []
      getMaintenanceTemplateItemList({
        maintenanceTemplateId: this.templateInfo.MaintenanceTemplateId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            let groupList = []
            // 说明没有任何维保项
            if (Object.keys(data || {}).length === 0) {
              // data || {}: data可能会有为null的情况
              groupList = [
                {
                  name: '默认分组',
                  items: []
                }
              ]
            }
            for (const key in data) {
              let items = []

              data[key].forEach(item => {
                let contents = null

                item.TemplateContent = JSON.parse(item.TemplateContent)
                if (item.TemplateType === 0) {
                  contents = []
                  Object.keys(item.TemplateContent).forEach(key2 => {
                    contents.push({
                      value: key2
                    })
                  })
                } else if (item.TemplateType === 1) {
                  contents = []
                  for (const key2 in item.TemplateContent) {
                    contents.push({
                      name: key2,
                      referenceValue: item.TemplateContent[key2].Value,
                      unit: item.TemplateContent[key2].Unit
                    })
                  }
                } else if (item.TemplateType === 2) {
                  // 是/否类型，不用处理
                } else if (item.TemplateType === 3) {
                  contents = {
                    value: item.TemplateContent.key
                  }
                } else if (item.TemplateType === 4) {
                  contents = []
                  Object.keys(item.TemplateContent).forEach(key2 => {
                    contents.push({
                      value: key2
                    })
                  })
                }
                items.push({
                  templateType: item.TemplateType,
                  itemId: item.MaintenanceTemplateItemId,
                  name: item.MaintenanceTemplateItemName,
                  order: item.Order,
                  contents
                })
              })
              groupList.push({
                name: key,
                items
              })
            }
            this.groupList = groupList
            this.groupListSource = JSON.parse(JSON.stringify(groupList))
          } else {
            this.$message.error(res.data.Message)
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.pageLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.pact-template {
  .pact-info {
    margin-top: 15px;
    font-size: 14px;
    line-height: 24px;
    color: #797878;
  }
  .info-item {
    display: inline-block;
    margin-right: 30px;
  }
  .group-wrap {
    &:hover {
      .group-title-btn {
        display: inline-block;
      }
    }
  }
  .group-title-btn {
    display: none;
    margin-left: 15px;
    .el-button {
      padding: 0;
    }
  }
  .add-box {
    position: relative;
    padding-bottom: calc(50% + 51px);
    background-color: rgba(0, 0, 0, 0.02);
    border: 2px dashed rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    cursor: pointer;
  }
  .add-box-content {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .el-icon-plus {
      color: rgba(0, 0, 0, 0.3);
      font-size: 60px;
    }
  }
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
