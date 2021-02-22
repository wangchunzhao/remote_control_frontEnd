<template>
  <div
    v-loading="loading"
    element-loading-text="加载中..."
    class="content-box monitor-dashboard"
  >
    <el-row :gutter="20">
      <draggable
        :list="subsystemList"
        ghost-class="ghost"
        :disabled="!checkPermission([28])"
        @start="dragging = true"
        @end="handleDragEnd"
      >
        <el-col
          v-for="item in subsystemList"
          :key="item.index"
          :xs="24"
          :sm="8"
          :md="6"
          :lg="4"
        >
          <div class="panel-wrap" @click="goPage(item)">
            <el-card
              class="panel"
              :body-style="{ padding: '0px' }"
              :style="{
                backgroundImage: `url(https://cdn.sinocold.net/images/monitorDashboard/${item.name}.png)`
              }"
            >
              <div class="panel-right">
                <div class="number">
                  {{ item.name }}
                </div>
                <div class="subtitle-container">
                  <el-tooltip
                    v-for="cell in item.children.slice(0, 3)"
                    :key="cell.index"
                    :content="cell.name + ' ' + cell.info"
                    placement="right-end"
                  >
                    <div :key="cell.smallid" class="subtitle">
                      {{ cell.name }}&nbsp;&nbsp;{{ cell.info }}
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </draggable>
      <el-col :key="randomString(8)" :xs="24" :sm="8" :md="6" :lg="4">
        <div v-permission="[28]">
          <div
            class="add-panel"
            @click="() => $refs.systemAddDialog.openDialog()"
          >
            <i class="el-icon-plus"></i>
            <div>添加子系统</div>
          </div>
        </div>
      </el-col>
    </el-row>
    <div :key="randomString(8)" class="prompt-text" v-permission="[28]">
      可通过拖拽编辑系统面板排序
    </div>
    <UserAddDialog ref="userAddDialog" />
    <SystemAddDialog @refresh="handleAddSystem" ref="systemAddDialog" />
  </div>
</template>
<script>
import { getChildPlan } from '@/api/model_new'
import UserAddDialog from '../UserAddDialog'
import SystemAddDialog from '../SystemAddDialog'
import { getCompanyProjectUserConfig } from '@/api/subarea'
import draggable from 'vuedraggable'
import { getPreferences, updatePreferences } from '@/api/preferences'
import { checkPermission } from '@/utils/permissions'
import { randomString } from '@/utils/index'

export default {
  name: 'DashboardCommon',
  components: {
    UserAddDialog,
    SystemAddDialog,
    draggable
  },
  data() {
    return {
      dragging: false,
      subsystemList: [],
      loading: false,
      checkPermission,
      randomString
    }
  },
  computed: {
    project() {
      return this.$store.state.app.project
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  watch: {
    project: {
      handler: function(val) {
        if (val) {
          this.fetchSystemList()
          getCompanyProjectUserConfig({
            projectId: this.project.id,
            CompanyId: this.companyId
          }).then(res => {
            if (res.data.Code === 200) {
              const data = res.data.Data
              if (data.IsSubareaUser) {
                this.$refs.userAddDialog.openDialog(data.SubareaUsers)
              }
            }
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleAddSystem() {
      this.fetchSystemList()
    },
    fetchSystemList() {
      this.loading = true
      const tempProjectId = this.project.id
      Promise.all([
        getPreferences({
          type: 'SubSystemCard',
          foreignId: this.project.id
        }),
        getChildPlan({
          project: this.project.id
        })
      ])
        .then(([res1, res2]) => {
          if (tempProjectId !== this.project.id) {
            return
          }
          let orderRules = null
          if (res1.data.Code === 200 && res1.data.Data !== null) {
            orderRules = JSON.parse(res1.data.Data.Field)
          }

          if (res2.data.Code === 200) {
            let data = res2.data.Data
            if (orderRules) {
              // 如果有排序规则
              data.forEach(v => {
                const temp = orderRules.find(vv => vv.key === v.childid)
                if (temp) {
                  v.order = temp.order
                } else {
                  v.order = 10000
                }
              })
              data.sort((x, y) => x.order - y.order)
            }
            this.subsystemList = data
          } else {
            this.subsystemList = []
            this.$message.error('数据获取失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          if (tempProjectId !== this.project.id) {
            return
          }
          this.loading = false
        })
    },

    handleDragEnd() {
      updatePreferences({
        ForeignId: this.project.id,
        TableType: 'SubSystemCard',
        Field: JSON.stringify(
          this.subsystemList.map((v, i) => {
            return {
              order: i,
              key: v.childid,
              label: v.name
            }
          })
        )
      })
        .then(res => {
          if (res.data.Code !== 200 || res.data.Data !== true) {
            this.$message('排序设置失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },

    goPage(item) {
      this.$router.push({ path: item.path, query: { sid: item.childid } })
    }
  }
}
</script>
<style scoped lang="scss">
div.monitor-dashboard {
  padding: 20px;
  min-height: 340px;
  position: relative;
  .prompt-text {
    position: absolute;
    bottom: 10px;
    width: 100%;
    text-align: center;
    color: rgb(233, 233, 235);
    font-size: 12px;
  }
  .panel {
    margin-bottom: 20px;
    padding: 20px 20px 0 20px;
    height: 150px;
    box-sizing: border-box;
    background-size: 100% 100%;
    border-radius: 14px;
    background-color: #4894ea;
    border: none;
  }
  .panel > div {
    display: inline-block;
  }
  .panel-wrap {
    cursor: pointer;
  }
  .panel-wrap:hover {
    border-radius: 20px;
    box-shadow: 5px 5px 10px 2px rgba(168, 182, 191, 0.6);
    opacity: 0.9;
  }
  .panel .panel-left {
    width: 40%;
    float: right;
  }
  .panel .panel-right {
    width: 60%;
    float: left;
    .subtitle-container {
      margin-top: 25px;
    }
  }
  .panel .panel-right .number {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
  }
  .panel .panel-right .subtitle {
    font-size: 13px;
    color: #fff;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-weight: 600;
    width: 100%;
    line-height: 20px;
  }
  .add-panel {
    margin-bottom: 20px;
    padding-top: 45px;
    height: 150px;
    box-sizing: border-box;
    border-radius: 14px;
    text-align: center;
    background: rgba(0, 0, 0, 0.05);
    border: 1px dashed rgba(0, 0, 0, 0.15);
    color: rgba(0, 0, 0, 0.45);
    font-size: 15px;
    cursor: pointer;
    & > i {
      font-size: 20px;
      padding-bottom: 10px;
    }
  }
  @media (max-width: 1700px) {
    .el-col-lg-4 {
      width: 20%;
    }
  }
  @media (max-width: 1520px) {
    .el-col-lg-4 {
      width: 25%;
    }
  }
  @media (max-width: 1000px) {
    .panel {
      height: 230px;
      .panel-left {
        float: left;
        width: 100%;
        text-align: center;
        .svg-icon {
          margin-right: 0;
        }
      }
      .panel-right {
        float: right;
        width: 100%;
        text-align: center;
        margin-top: 20px;
      }
    }
  }
  @media (max-width: 768px) {
    .el-col-lg-4 {
      width: 100%;
    }
  }
  .svg-icon {
    width: 5em;
    height: 5em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
    margin-right: 10px;
  }
}
</style>
