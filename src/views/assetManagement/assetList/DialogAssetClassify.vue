<template>
  <el-dialog
    width="400px"
    title="资产分类"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div v-loading="loading" class="classify-tree-wrap">
      <el-tree
        ref="tree1"
        class="filter-tree"
        :data="assetClassify"
        empty-text="暂无资产分类数据"
        :expand-on-click-node="false"
        :props="defaultProps"
        default-expand-all
        :filter-node-method="filterNode"
      >
        <span class="custom-tree-node" slot-scope="{ node }">
          <c-svg name="ceng"></c-svg>
          <span style="margin-left: 6px;">{{ node.label }}</span>
        </span>
      </el-tree>
    </div>
    <span slot="footer">
      <el-button
        size="medium"
        type="primary"
        @click.native="() => (dialogVisible = false)"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { getCompanyAssetsTypeList } from '@/api/assetTypeProject'

export default {
  data() {
    return {
      dialogVisible: false,
      assetClassify: [],
      loading: false,
      defaultProps: {
        children: 'subset',
        label: 'TypeName'
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchData()
    },
    handleClose() {
      this.dialogVisible = false
    },
    filterNode() {},
    fetchData() {
      this.loading = true
      getCompanyAssetsTypeList({
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.assetClassify = [res.data.Data]
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
