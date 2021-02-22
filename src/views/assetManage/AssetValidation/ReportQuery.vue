<template>
  <div class="report-query">
    <div style="margin: 25px auto 35px auto;width: 650px;">
      <el-input
        v-model="queryForm.text"
        placeholder="请输入完整的仓库/车辆名称"
        class="input-with-select"
      >
        <el-select
          slot="prepend"
          v-model="queryForm.type"
          placeholder="请选择"
          @change="
            () => {
              fetchResources()
              tableData = []
            }
          "
        >
          <el-option label="验证日程" :value="1" />
          <el-option label="校验日程" :value="2" />
        </el-select>
        <el-button
          slot="append"
          icon="el-icon-search"
          type="primary"
          @click.native="handleSearch"
        />
      </el-input>
    </div>
    <div class="content-box">
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        style="width: 100%"
        element-loading-text="加载中..."
      >
        <el-table-column type="expand">
          <template slot-scope="{ row }">
            <div class="report-file-list">
              <el-tooltip
                v-for="item in row.Files"
                :key="item"
                class="item"
                effect="dark"
                :content="item.split('/').pop()"
                placement="top"
              >
                <a :href="item" download class="schedule-file">
                  <c-svg
                    class="file-type-icon"
                    :name="handleFileType(item.split('/').pop())"
                  />
                  <span>{{ item.split('/').pop() }}</span>
                  <div class="cover">
                    <c-svg class="download-icon" name="download" />
                  </div>
                </a>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="日期" prop="WorkDate">
          <template slot-scope="{ row }">
            {{ _dateFormat(row.WorkDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column label="内容" prop="Content" />
        <el-table-column label="负责人" prop="CreateUserName" />
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
    </div>
  </div>
</template>

<script>
import { getScheduleList } from '@/api/schedule'
import { getProjectResources } from '@/api/project_new'

export default {
  data() {
    return {
      queryForm: {
        type: 1,
        text: '',
        resource: undefined
      },

      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    // this.fetchTableData()
    this.fetchResources()
  },
  methods: {
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 根据文件名确定图标
    handleFileType(name) {
      // .xlsx, .xls, .doc, .docx, .pdf
      if (name.indexOf('.xlsx') > -1 || name.indexOf('.xls') > -1) {
        return 'excel'
      } else if (name.indexOf('pdf') > -1) {
        return 'PDF'
      } else if (name.indexOf('doc') > -1 || name.indexOf('docx') > -1) {
        return 'wenjianguanli_wordwenjian'
      } else {
        return 'wenjian'
      }
    },
    handleSearch() {
      if (!this.queryForm.text) {
        this.$message('请输入要搜索的内容')
        return false
      }
      const resource = this.resources.filter(item => {
        if (this.queryForm.type === 1) {
          return item.MName === this.queryForm.text
        } else {
          return item.PName === this.queryForm.text
        }
      })
      if (!resource.length) {
        this.$message('未找到该资源')
        return false
      }
      this.queryForm.resource = resource.map(item => item.ID)
      this.fetchTableData()
    },
    fetchTableData() {
      this.tableLoading = true
      const { type, resource } = this.queryForm
      getScheduleList({
        ProjectId: this.projectId,
        Type: [type],
        Content: undefined,
        Status: 1,
        Orderby: undefined,
        Resources: resource,
        PageIndex: this.pagination.currentPage,
        PageSize: this.pagination.size
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.tableData = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.tableData = []
            this.$message.error('列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('列表获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    fetchResources() {
      getProjectResources({
        projectId: this.projectId,
        type: this.queryForm.type
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.resources = res.data.Data.Result
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

<style lang="scss" scoped>
.report-query {
  .report-file-list {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
  }
  .report-file {
    flex: 0 0 180px;
    overflow: hidden;
    z-index: 0;
    position: relative;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 4px;
    box-sizing: border-box;
    margin: 10px;
    padding: 6px;
    cursor: pointer;
    .file-type-icon {
      font-size: 40px;
      margin-right: 6px;
    }
    span {
      width: 115px;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transform: translateY(-5px);
      color: #656565;
    }
    &:hover {
      .cover {
        display: block;
      }
      span {
        color: rgb(24, 144, 255);
      }
    }
    .cover {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
      text-align: center;
      line-height: 54px;
    }
    .download-icon {
      font-size: 18px;
      fill: #fff;
    }
  }
  .report-file-input {
    flex: 0 0 180px;
    overflow: hidden;
    z-index: 0;
    margin: 10px;
    background-color: #fff;
    border: 1px dashed #c0ccda;
    border-radius: 4px;
    box-sizing: border-box;
    margin-top: 10px;
    padding: 6px;
    height: 54px;
    line-height: 49px;
    text-align: center;
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.report-query {
  .el-input-group__prepend {
    width: 70px;
  }
  .el-input-group__append {
    background-color: #1890ff;
    .el-icon-search {
      color: #fff;
    }
  }
  .el-input-group__append button.el-button {
    background-color: #1890ff;
  }
  .schedule-file-list {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
  }
  .schedule-file {
    flex: 0 0 180px;
    overflow: hidden;
    z-index: 0;
    position: relative;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 4px;
    box-sizing: border-box;
    margin: 10px;
    padding: 6px;
    cursor: pointer;
    .file-type-icon {
      font-size: 40px;
      margin-right: 6px;
    }
    span {
      width: 115px;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transform: translateY(-5px);
      color: #656565;
    }
    &:hover {
      .cover {
        display: block;
      }
      span {
        color: rgb(24, 144, 255);
      }
    }
    .cover {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
      text-align: center;
      line-height: 54px;
    }
    .download-icon {
      font-size: 18px;
      fill: #fff;
    }
  }
}
</style>
