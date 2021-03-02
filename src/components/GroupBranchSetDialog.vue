<template>
  <el-dialog
    width="572px"
    title="分组设置"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form label-width="85px" size="small">
      <div v-for="(item, index) in List" :key="index">
        <el-form-item label="组名称：">
          <div class="row">
            <el-input
              class=""
              v-model="item.name"
              size="small"
              style="width:200px;margin-right: 10px"
            ></el-input>
            <el-link
              :underline="false"
              @click="deleteItem(index)"
              v-show="List.length > 1"
            >
              <c-svg
                name="delete"
                style="color: #F56C6C;font-size: 16px"
              ></c-svg>
            </el-link>
          </div>
        </el-form-item>
        <el-form-item label="用能支路：">
          <el-cascader
            :options="energyStruct"
            :ref="'cascader' + index"
            clearable
            :filterable="true"
            :props="cascaderProps"
            collapse-tags
            @change="handleBranchVisible(index)"
            size="small"
            style="width: 100%"
          >
            <template slot-scope="{ node, data }">
              <c-svg
                v-if="data.IsSubentry"
                style="color: #909399; margin-right: 5px"
                name="folder-open-fill"
              ></c-svg>
              <span
                :class="[
                  data.nodeType === 'projectNode'
                    ? 'project-node-SJHDF9823'
                    : ''
                ]"
                >{{ data.Name }}</span
              >
              <c-svg
                v-if="data.IsSummary"
                style="color: #909399; margin-left: 5px"
                name="zong"
              ></c-svg>
            </template>
          </el-cascader>
        </el-form-item>
      </div>
      <el-button @click="addGroup" type="text">
        <c-svg name="jia" style="color: #409EFF"></c-svg>
        增加组
      </el-button>
    </el-form>
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submit">
        确 定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getSubentryTree } from '@/api/subentry'

function walk(arr) {
  arr.forEach(item => {
    item.ChildrenList && item.ChildrenList.length
      ? walk(item.ChildrenList)
      : delete item.ChildrenList
  })
}

export default {
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    }
  },
  computed: {
    energyStruct() {
      return this.$store.state.energy.energyStruct
    }
  },
  data() {
    return {
      dialogVisible: false,
      List: [
        {
          name: '',
          idList: []
        }
      ],

      cascaderProps: {
        multiple: true,
        children: 'ChildrenList',
        label: 'Name',
        value: 'SubentryId',
        lazy: false,
        lazyLoad: (node, resolve) => {
          if (node.level === 1) {
            getSubentryTree({
              companyId: this.$store.state.app.company.id,
              projectId: node.value,
              isGetModelTree: true
            })
              .then(res => {
                if (200 === res.data.Code) {
                  // 目前只要做了电量的
                  let data = res.data.Data
                  walk(data)
                  resolve(data)
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            resolve()
          }
        }
      }
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    // 更换支路
    handleBranchVisible(index) {
      console.log(this.$refs, 'this.$refs')
      // 获取选中的设备节点
      let checkedNodes = this.$refs[`cascader${index}`][0].getCheckedNodes()
      if (!checkedNodes.length) {
        return
      }
      if (
        !checkedNodes.every(v => {
          if (v.data.TopSubentryId === checkedNodes[0].data.TopSubentryId) {
            return true
          }
          return false
        })
      ) {
        this.$notify.info({
          title: '消息',
          duration: 10000,
          offset: 70,
          message:
            '不支持不同类型支路的对比，如：电量下的 A 支路不可以和燃气量下的 B 支路对比'
        })
        return
      }
      let nodes = checkedNodes.filter(item => !item.data.IsSubentry)
      if (nodes.length) {
        let branchIds = []
        nodes.forEach(item => {
          branchIds.push(item.data.ModelTreeId)
        })
        if (!branchIds.length) {
          this.$message('选中的节点下面没有设备，无法查询')
          return
        }
        this.List[index].idList = branchIds
      } else {
        this.List[index].idList = []
      }
    },
    //增加一组
    addGroup() {
      this.List.push({
        name: '',
        idList: []
      })
    },
    // 删除某组数据
    deleteItem(index) {
      this.List.splice(index, 1)
    },
    handleClose() {
      this.List = [
        {
          name: '',
          idList: []
        }
      ]
      this.dialogVisible = false
    },
    submit() {
      console.log(this.List)
    }
  }
}
</script>
<style scoped lang="scss">
.row {
  display: flex;
  align-items: center;
}
</style>
