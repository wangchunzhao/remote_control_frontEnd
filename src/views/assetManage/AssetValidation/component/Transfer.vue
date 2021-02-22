<template>
  <div class="transfer">
    <div class="transfer-left">
      <div class="transfer-header">
        <el-input
          v-model.trim="filter"
          clearable
          size="small"
          suffix-icon="el-icon-search"
          style="width: 210px;display: inline-block;"
        />
        <span style="float:right;">{{
          `${leftSelect.length}/${leftData.length}`
        }}</span>
      </div>
      <div class="transfer-table-header">
        <span style="width: 40px;text-align: center;">
          <el-checkbox
            v-model="leftCheckAll"
            :indeterminate="isIndeterminateLeft"
            @change="handleLeftAllCheck"
          />
        </span>
        <span class="transfer-th">{{
          scheduleType === 1 ? '设备名称' : '点位名称'
        }}</span>
        <span class="transfer-th">{{
          scheduleType === 1 ? '所属系统' : '所属设备'
        }}</span>
      </div>
      <div v-loading="loading" class="transfer-table-body">
        <recycle-scroller
          v-show="leftData.length"
          v-slot="{ item }"
          class="scroller"
          style="height: 400px"
          :items="leftData"
          :item-size="50"
          key-field="ID"
        >
          <div class="transfer-tr">
            <span style="width: 40px;text-align: center;line-height: 50px;">
              <el-checkbox
                v-model="item.checked"
                @change="leftItemCheckChange(item)"
              />
            </span>
            <span class="transfer-td">{{ item[prop1] }}</span>
            <span class="transfer-td">{{ item[prop2] }}</span>
          </div>
        </recycle-scroller>
        <div v-show="!leftData.length" class="transfer-empty">
          暂无相关参数
        </div>
      </div>
    </div>
    <div class="transfer-center">
      <el-button
        size="mini"
        :type="leftSelect.length ? 'primary' : ''"
        :disabled="!leftSelect.length"
        @click.native="transferRight"
      >
        <i class="el-icon-arrow-right" />
      </el-button>
      <br />
      <el-button
        size="mini"
        :type="rightSelect.length ? 'primary' : ''"
        :disabled="!rightSelect.length"
        @click.native="transferLeft"
      >
        <i class="el-icon-arrow-left" />
      </el-button>
    </div>
    <div class="transfer-right">
      <div class="transfer-header">
        <span>已选中</span>
        <span style="float:right;">{{
          `${rightSelect.length}/${rightData.length}`
        }}</span>
      </div>
      <div class="transfer-table-header">
        <span style="width: 40px;text-align: center;">
          <el-checkbox
            v-model="rightCheckAll"
            :indeterminate="isIndeterminateRight"
            @change="handleRightAllCheck"
          />
        </span>
        <span class="transfer-th">{{
          scheduleType === 1 ? '设备名称' : '点位名称'
        }}</span>
        <span class="transfer-th">{{
          scheduleType === 1 ? '所属系统' : '所属设备'
        }}</span>
      </div>
      <div v-loading="loading" class="transfer-table-body">
        <recycle-scroller
          v-show="rightData.length"
          v-slot="{ item }"
          class="scroller"
          style="height: 400px"
          :items="rightData"
          :item-size="50"
          key-field="ID"
        >
          <div class="transfer-tr">
            <span style="width: 40px;text-align: center;line-height: 50px;">
              <el-checkbox
                v-model="item.checked"
                @change="rightItemCheckChange(item)"
              />
            </span>
            <span class="transfer-td">{{ item[prop1] }}</span>
            <span class="transfer-td">{{ item[prop2] }}</span>
          </div>
        </recycle-scroller>
        <div v-show="!rightData.length" class="transfer-empty">
          暂无相关参数
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import '@/assets/style/vue-virtual-scroller.scss'

export default {
  components: {
    'recycle-scroller': RecycleScroller
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    value: {
      type: Array
    },
    scheduleType: {
      type: Number,
      default: function() {
        return 0
      }
    },
    loading: {
      type: Boolean
    }
  },
  data() {
    return {
      leftDataSource: this.data,
      leftData: this.data,
      leftSelect: [],
      leftCheckAll: false,
      isIndeterminateLeft: false,
      rightData: [],
      rightSelect: [],
      rightCheckAll: false,
      isIndeterminateRight: false,
      filter: ''
    }
  },
  computed: {
    prop1() {
      return this.scheduleType === 1 ? 'MName' : 'PName'
    },
    prop2() {
      return this.scheduleType === 1 ? 'sysName' : 'MName'
    }
  },
  watch: {
    filter(val) {
      const text = val.toLowerCase()
      this.leftData = this.leftDataSource.filter(item => {
        return (
          item[this.prop1].toLowerCase().indexOf(text) > -1 ||
          item[this.prop2].toLowerCase().indexOf(text) > -1
        )
      })
    },
    value: {
      handler: function(val) {
        this.rightData = [] // 清空数据，强制刷新虚拟列表
        if (!val.length) {
          this.rightData = []
          this.rightSelect = []
        } else {
          val.forEach(item => {
            item.checked = false
          })
          this.rightData = val
        }
      },
      immediate: true
    },
    data(val) {
      this.leftData = [] // 清空数据，强制刷新虚拟列表
      val.forEach(item => {
        item.checked = false
      })
      this.leftDataSource = val
      this.leftData = JSON.parse(JSON.stringify(val))
      this.leftSelect = []
      this.rightSelect = []
    }
  },
  methods: {
    leftItemCheckChange(select) {
      if (select.checked) {
        this.leftSelect.push(select)
      } else {
        this.leftSelect = this.leftSelect.filter(item => {
          return item.ID !== select.ID
        })
      }
      const length = this.leftSelect.length
      this.isIndeterminateLeft = length > 0 && length < this.leftData.length
      this.leftCheckAll = length === this.leftData.length
    },
    rightItemCheckChange(select) {
      if (select.checked) {
        this.rightSelect.push(select)
      } else {
        this.rightSelect = this.rightSelect.filter(item => {
          return item.ID !== select.ID
        })
      }
      const length = this.rightSelect.length
      this.isIndeterminateRight = length > 0 && length < this.rightData.length
      this.rightCheckAll = length === this.rightData.length
    },
    // 左侧全选
    handleLeftAllCheck(val) {
      this.isIndeterminateLeft = false
      if (val) {
        this.leftData.forEach(item => {
          item.checked = true
        })
        this.leftSelect = this.leftData
      } else {
        this.leftData.forEach(item => {
          item.checked = false
        })
        this.leftSelect = []
      }
    },
    // 右侧全选
    handleRightAllCheck(val) {
      this.isIndeterminateRight = false
      if (val) {
        this.rightData.forEach(item => {
          item.checked = true
        })
        this.rightSelect = this.rightData
      } else {
        this.rightData.forEach(item => {
          item.checked = false
        })
        this.rightSelect = []
      }
    },
    transferRight() {
      const Ids = this.leftSelect.map(item => {
        item.checked = false
        return item.ID
      })
      this.rightData.push(...this.leftSelect)
      this.leftSelect = []
      this.leftData = this.leftData.filter(item => !Ids.includes(item.ID))
      this.leftDataSource = this.leftDataSource.filter(
        item => !Ids.includes(item.ID)
      )
      this.$emit('input', this.rightData.map(item => item))
      this.leftCheckAll = false
      this.isIndeterminateLeft = false
      this.filter = ''
    },
    rightSelectionChange(val) {
      this.rightSelect = val
    },
    transferLeft() {
      const Ids = this.rightSelect.map(item => {
        item.checked = false
        return item.ID
      })
      this.leftData.push(...this.rightSelect)
      this.leftDataSource.push(...this.rightSelect)
      this.rightSelect = []
      this.rightData = this.rightData.filter(item => !Ids.includes(item.ID))
      this.$emit('input', this.rightData)
      this.rightCheckAll = false
      this.isIndeterminateRight = false
    }
  }
}
</script>

<style lang="scss" scoped>
.transfer {
  display: flex;
  .transfer-left {
    flex: 1;
    border: 1px solid #e1e1e1;
    border-radius: 4px;
  }
  .transfer-right {
    flex: 1;
    border: 1px solid #e1e1e1;
    border-radius: 4px;
  }
  .transfer-header {
    // background: #1890FF;
    height: 40px;
    line-height: 40px;
    padding: 0 15px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  .transfer-center {
    flex: 0 0 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .el-button {
      padding: 7px 10px;
    }
  }
  .transfer-table-header {
    display: flex;
    background: #eaf6fe;
    line-height: 32px;
  }
  .transfer-th {
    flex: 1;
    font-weight: bold;
    color: #909399;
    text-align: left;
  }
  .transfer-table-body {
    height: 400px;
  }
  .transfer-tr {
    display: flex;
    height: 50px;
    border-bottom: 1px solid #ebeef5;
  }
  .transfer-td {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0 2px;
    color: #606266;
  }
  .transfer-empty {
    color: #909399;
    text-align: center;
    padding-top: 50px;
  }
}
</style>
