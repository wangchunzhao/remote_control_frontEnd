<template>
  <el-dialog
    append-to-body
    title="模板预览"
    :visible.sync="dialogVisible"
    width="1350px"
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
          <span v-if="row.pointType !== '2'">
            {{
              row.field1
                ? `${row.field1}/${row.field2}/${row.field3}/${row.field4}`
                : ''
            }}
          </span>
          <span v-else>***</span>
        </template>
      </el-table-column>
      <el-table-column label="从站地址">
        <template slot-scope="{ row }">
          <span>
            {{ row.address }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="功能码">
        <template slot-scope="{ row }">
          <span v-if="row.pointType !== '2'">
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
            }}
          </span>
          <span v-else>***</span>
        </template>
      </el-table-column>
      <el-table-column label="寄存器地址">
        <template slot-scope="{ row }">
          <span v-if="row.pointType !== '2'">{{ row.bias }}</span>
          <span v-else>***</span>
        </template>
      </el-table-column>
      <el-table-column label="数据格式">
        <template slot-scope="{ row }">
          <span v-if="row.pointType !== '2'">
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

          <span v-else>***</span>
        </template>
      </el-table-column>
      <el-table-column label="字节顺序">
        <template slot-scope="{ row }">
          <span v-if="row.pointType !== '2'">{{ row.orderStr }}</span>
          <span v-else>***</span>
        </template>
      </el-table-column>
      <el-table-column label="地址位">
        <template slot-scope="{ row }">
          <span v-if="row.pointType !== '2'">{{ row.datas }}</span>
          <span v-else>***</span>
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

export default {
  props: {
    list: Array
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      pointTypeOptions: [],

      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  watch: {
    list(list) {
      this.pagination.total = list.length
    }
  },
  computed: {
    tableData() {
      return this.list.slice(
        (this.pagination.currentPage - 1) * this.pagination.size,
        (this.pagination.currentPage - 1) * this.pagination.size +
          this.pagination.size
      )
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
    openDialog() {
      this.dialogVisible = true
    },
    dialogClose() {
      this.pagination = {
        currentPage: 1,
        size: 10,
        total: 0
      }
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
