<template>
  <div>
    <div v-if="editable">
      已关联{{ tableData.length }}
      <el-button
        :disabled="!scheduleType"
        type="text"
        style="margin-left: 10px;"
        @click.native="dialogVisible = true"
      >
        添加关联
      </el-button>
    </div>
    <el-table v-show="tableData.length" :data="table" style="width: 100%">
      <el-table-column
        :prop="prop1"
        :label="scheduleType === 1 ? '设备名称' : '点位名称'"
      />
      <el-table-column
        :prop="prop2"
        :label="scheduleType === 1 ? '所属系统' : '所属设备'"
      />
    </el-table>
    <div class="pagination-wrap" v-show="tableData.length">
      <el-pagination
        background
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        layout="total, prev, pager, next"
        :total="tableData.length"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      title="添加关联资源"
      :visible.sync="dialogVisible"
      width="800px"
      :append-to-body="true"
      @open="fetchResources"
    >
      <Transfer
        :schedule-type="scheduleType"
        :data="resources"
        :value="tableData"
        @input="resourcesChange"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getProjectResources } from '@/api/project_new'
import Transfer from './Transfer'
export default {
  components: {
    Transfer
  },
  props: {
    data: {
      type: Array,
      default: function() {
        return []
      }
    },
    editable: {
      type: Boolean,
      default: function() {
        return true
      }
    },
    scheduleType: {
      type: Number,
      default: function() {
        return 0
      }
    }
  },
  data() {
    return {
      dialogVisible: false,

      tableData: [],
      table: [],
      pagination: {
        currentPage: 1,
        size: 5
      },
      resources: []
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    prop1() {
      return this.scheduleType === 1 ? 'MName' : 'PName'
    },
    prop2() {
      return this.scheduleType === 1 ? 'sysName' : 'MName'
    }
  },
  watch: {
    scheduleType() {
      this.tableData = []
    },
    data(val) {
      if (val) {
        this.tableData = val
        this.pagination.currentPage = 1
        this.handleCurrentChange()
      } else {
        this.tableData = []
      }
    }
  },
  methods: {
    // 资源更新时触发
    resourcesChange(data) {
      this.tableData = data
      this.pagination.currentPage = 1
      this.handleCurrentChange()
      if (this.data) {
        // 说明是更新日程，不是新增
        this.$emit('update', data)
      }
    },
    // 假分页
    handleCurrentChange() {
      this.table = this.tableData.slice(
        (this.pagination.currentPage - 1) * this.pagination.size,
        (this.pagination.currentPage - 1) * this.pagination.size +
          this.pagination.size
      )
    },
    fetchResources() {
      getProjectResources({
        projectId: this.projectId,
        type: this.scheduleType
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data.Result.filter(item => {
              const temp = this.tableData.find(item2 => item2.ID === item.ID)
              if (temp) {
                return false
              } else {
                return true
              }
            })
            this.resources = data
          } else {
            this.resources = []
          }
        })
        .catch(err => {
          console.error(err)
          this.resources = []
        })
    }
  }
}
</script>
