<template>
  <el-dialog
    width="600px"
    title="点位列表"
    append-to-body
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-table :data="tableData" style="margin-top: 15px;">
      <el-table-column prop="PointName" label="点位名称"> </el-table-column>
      <el-table-column prop="PointTypeName" label="类型"> </el-table-column>
      <el-table-column prop="Unit" width="70" label="单位"> </el-table-column>
      <el-table-column prop="Level" width="70" label="等级">
        <template slot-scope="{ row }">
          {{ levelOptions[row.Level] }}
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button
        size="medium"
        type="primary"
        @click.native="() => (dialogVisible = false)"
        >取 消</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      tableData: [],
      levelOptions: {
        1: '一级',
        2: '二级',
        3: '三级'
      }
    }
  },
  methods: {
    openDialog(pointList) {
      this.dialogVisible = true
      this.tableData = pointList
    },
    handleClose() {
      this.dialogVisible = false
      this.tableData = []
    }
  }
}
</script>
