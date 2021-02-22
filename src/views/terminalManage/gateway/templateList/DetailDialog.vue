<template>
  <el-dialog
    v-loading="loading"
    element-loading-text="加载中..."
    append-to-body
    :title="templateName"
    :visible.sync="dialogVisible"
    width="1300px"
    @close="dialogClose"
  >
    <el-table v-loading="loading" :data="tableData" style="width: 100%">
      <el-table-column type="index" />
      <el-table-column label="点位名称">
        <template slot-scope="{ row }">
          {{ row.sensorName }}
        </template>
      </el-table-column>
      <el-table-column label="点位类型">
        <template slot-scope="{ row }">
          {{ getPointTypeLabel(row.sensorTypeId) }}
        </template>
      </el-table-column>
      <el-table-column label="小数位">
        <template slot-scope="{ row }">
          {{ row.decimal }}
        </template>
      </el-table-column>
      <el-table-column label="单位">
        <template slot-scope="{ row }">
          {{ row.unit }}
        </template>
      </el-table-column>
      <el-table-column label="映射">
        <template slot-scope="{ row }">
          <span v-if="!row.fullVisible">***</span>
          <span v-else>
            {{
              row.field1
                ? `${row.field1}/${row.field2}/${row.field3}/${row.field4}`
                : ''
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="从站地址">
        <template slot-scope="{ row }">
          {{ row.address }}
        </template>
      </el-table-column>
      <el-table-column label="功能码">
        <template slot-scope="{ row }">
          <span v-if="!row.fullVisible">***</span>
          <span v-else>
            {{
              row.funcode === 1
                ? '01读写'
                : row.funcode === 2
                ? '02只读'
                : row.funcode === 3
                ? '03读写'
                : row.funcode === 4
                ? '04只读'
                : ''
            }}</span
          >
        </template>
      </el-table-column>
      <el-table-column label="寄存器地址">
        <template slot-scope="{ row }">
          <span v-if="!row.fullVisible">***</span>
          <span v-else>
            {{ row.bias }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="数据格式">
        <template slot-scope="{ row }">
          <span v-if="!row.fullVisible">***</span>
          <span v-else>
            {{
              row.datatype === 1
                ? '16位有符号数'
                : row.datatype === 2
                ? '16位无符号数'
                : row.datatype === 3
                ? '32位有符号数'
                : row.datatype === 4
                ? '32位无符号数'
                : row.datatype === 5
                ? '32位浮点型数'
                : row.datatype === 6
                ? '16位按位读取'
                : row.datatype === 7
                ? 'bit'
                : ''
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="字节顺序">
        <template slot-scope="{ row }">
          <span v-if="!row.fullVisible">***</span>
          <span v-else>
            {{ row.orderStr }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="地址位">
        <template slot-scope="{ row }">
          <span v-if="!row.fullVisible">***</span>
          <span v-else>
            {{ row.datas }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="采集周期/s">
        <template slot-scope="{ row }">
          {{ row.cycle }}
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
  </el-dialog>
</template>

<script>
import { fetchPointTypeList } from '@/api/pointType'
import { getDeviceTemplate } from '@/api/deviceTemplate'
import { Decrypt } from '@/utils/secret'
export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      templateName: '-',
      pointTypeOptions: [],
      completeControl: false,
      tableSource: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    tableData() {
      return this.tableSource.slice(
        (this.pagination.currentPage - 1) * this.pagination.size,
        (this.pagination.currentPage - 1) * this.pagination.size +
          this.pagination.size
      )
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  mounted() {
    fetchPointTypeList(0)
      .then(res => {
        const data = res.data.Data
        this.pointTypeOptions = [
          {
            label: '状态量',
            options: data.State
          },
          {
            label: '模拟量',
            options: data.Analog
          }
        ]
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    openDialog({ id, completeControl }) {
      this.dialogVisible = true
      this.completeControl = completeControl

      this.loading = true
      getDeviceTemplate({
        deviceTemplateId: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = JSON.parse(Decrypt(res.data.Data))
            this.templateName = data.DeviceTemplateName

            const list = []
            data.Device_Template_ModuleList.forEach(item => {
              const temp = item.Device_Module.DeviceModulePointList
              temp.forEach(v => {
                v.fullVisible = this.userId === item.Device_Module.UserId
              })
              list.push(...temp)
            })
            this.tableSource = list
            this.pagination.total = list.length
          } else {
            this.$message.error('模板数据获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('模板数据获取失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    dialogClose() {
      this.completeControl = false
      this.templateName = '-'
      this.pagination = {
        currentPage: 1,
        size: 10,
        total: 0
      }
      this.tableSource = []
    },
    // 分页
    handleCurrentChange() {
      // this.fetchTableData()
    },
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
    },
    // 获取点位类型的文字描述
    getPointTypeLabel(id) {
      let label = ''
      this.pointTypeOptions[0].options.forEach(item => {
        if (item.ID === id) {
          label = item.TypeName
        }
      })
      this.pointTypeOptions[1].options.forEach(item => {
        if (item.ID === id) {
          label = item.TypeName
        }
      })
      return label
    }
  }
}
</script>
