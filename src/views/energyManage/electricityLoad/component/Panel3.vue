<template>
  <div class="energy_manage-panel energy_manage-electricity-panel3">
    <div class="panel-header">
      <div>
        <span class="title" style="margin-right: 25px;">最大需量管理</span>
        <el-button
          icon="el-icon-download"
          :loading="exportLoading"
          @click.native="handleClickExport"
          plain
          size="mini"
          v-permission="[121]"
          >导出表格</el-button
        >
        <el-button
          icon="el-icon-edit"
          :loading="editLoading"
          @click.native="handleClickEdit"
          plain
          size="mini"
          >{{ editFlag ? '保存指标' : '编辑指标' }}</el-button
        >
      </div>
    </div>

    <div class="table-wrap">
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="desc" width="145" label=""> </el-table-column>
        <el-table-column prop="1" label="1月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[1].Value"
            ></el-input>
            <span v-else>
              {{ (row[1] && row[1].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="2" label="2月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[2].Value"
            ></el-input>
            <span v-else>
              {{ (row[2] && row[2].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="3" label="3月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[3].Value"
            ></el-input>
            <span v-else>
              {{ (row[3] && row[3].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="4" label="4月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[4].Value"
            ></el-input>
            <span v-else>
              {{ (row[4] && row[4].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="5" label="5月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[5].Value"
            ></el-input>
            <span v-else>
              {{ (row[5] && row[5].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="6" label="6月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[6].Value"
            ></el-input>
            <span v-else>
              {{ (row[6] && row[6].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="7" label="7月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[7].Value"
            ></el-input>
            <span v-else>
              {{ (row[7] && row[7].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="8" label="8月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[8].Value"
            ></el-input>
            <span v-else>
              {{ (row[8] && row[8].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="9" label="9月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[9].Value"
            ></el-input>
            <span v-else>
              {{ (row[9] && row[9].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="10" label="10月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[10].Value"
            ></el-input>
            <span v-else>
              {{ (row[10] && row[10].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="11" label="11月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[11].Value"
            ></el-input>
            <span v-else>
              {{ (row[11] && row[11].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="12" label="12月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row[12].Value"
            ></el-input>
            <span v-else>
              {{ (row[12] && row[12].Value) || '-' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import filesaver from 'file-saver'
import {
  exportEnergyDemand,
  updateEnergyDemand,
  getPowerEnergyDemandList
} from '@/api/energyStatistical'

export default {
  data() {
    return {
      loading: false,
      editLoading: false,
      exportLoading: false,
      editFlag: false,
      tableData: []
    }
  },
  computed: {
    structTree() {
      return this.$store.state.energy.energyStruct.filter(item => {
        return '电量' === item.Name
      })
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  watch: {
    projectId: {
      handler: function() {
        this.fetchTableData()
      },
      immediate: true
    }
  },
  methods: {
    handleClickExport() {
      const deviceIds = this.structTree
        .find(e => '电量' === e.Name)
        .ModelTreeList.map(e => e.ModelTreeId)
      deviceIds.length
        ? ((this.exportLoading = true),
          exportEnergyDemand({
            projectId: this.projectId,
            modelTreeIdList: deviceIds
          })
            .then(res => {
              if (
                'application/json; charset=utf-8' ===
                res.headers['content-type']
              ) {
                const reader = new FileReader()

                reader.onload = t => {
                  const data = JSON.parse(t.target.result)
                  this.$message(data.Message)
                }
                reader.readAsText(res.data)
                return false
              }
              var a = new Blob([res.data])
              filesaver.saveAs(a, '需量管理列表.xls')
            })
            .catch(err => {
              console.error(err)
              this.$message.error('导出失败')
            })
            .finally(() => {
              this.exportLoading = false
            }))
        : this.$message('电量分项下面没有设备，无法查询')
    },
    handleClickEdit() {
      this.editFlag = !this.editFlag
      this.tableData[0].rowEditable = !this.tableData[0].rowEditable
      if (!this.editFlag) {
        let list = []
        Object.keys(this.tableData[0]).forEach(n => {
          'desc' !== n && 'rowEditable' !== n && list.push(this.tableData[0][n])
        })
        this.editLoading = true
        updateEnergyDemand({
          list
        })
          .then(res => {
            if (200 === res.data.Code) {
              this.fetchTableData()
              this.$message.success('更新成功')
            } else {
              this.$message.error('更新失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('更新失败')
          })
          .finally(() => {
            this.editLoading = false
          })
      }
    },
    fetchTableData() {
      const deviceIds = this.structTree
        .find(function(e) {
          return '电量' === e.Name
        })
        .ModelTreeList.map(function(e) {
          return e.ModelTreeId
        })
      if (!deviceIds.length) {
        return
      }
      this.loading = true
      getPowerEnergyDemandList({
        projectId: this.projectId,
        modelTreeIdList: deviceIds
      })
        .then(res => {
          if (200 === res.data.Code) {
            const data = res.data.Data
            let row1 = {}
            let row2 = {}
            data.forEach((item, index) => {
              if (0 === index) {
                row1 = Object.assign(
                  {
                    rowEditable: false,
                    desc: item.desc
                  },
                  item.Data
                )
              } else {
                row2 = Object.assign(
                  {
                    desc: item.desc
                  },
                  item.Data
                )
              }
            })
            this.tableData = [row1, row2]
          } else {
            this.tableData = []
            this.$message.error(res.data.Message)
          }
        })
        .catch(err => {
          this.tableData = []
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.energy_manage-electricity-panel3 .table-wrap {
  padding: 30px;
}
</style>
