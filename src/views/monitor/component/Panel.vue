<template>
  <div element-loading-text="加载中...">
    <div class="tool-wrap">
      <el-radio-group
        v-model="modelType"
        size="small"
        style="margin-right: 15px;transform: translateY(-2px);"
      >
        <el-radio-button :disabled="bigTypeId === 46" label="卡片模式" />
        <el-radio-button label="列表模式" />
      </el-radio-group>
      <el-select
        v-show="modelType === '卡片模式'"
        v-model="filterForm.state"
        size="small"
        filterable
        @change="handleStateChange"
        placeholder="请选择"
      >
        <el-option label="所有状态" :value="0"> </el-option>
        <el-option label="在线" :value="2"> </el-option>
        <el-option label="离线" :value="1"> </el-option>
        <el-option label="报警" :value="3"> </el-option>
      </el-select>
      <div style="float: right;">
        <el-badge
          :hidden="hideFilterNotice()"
          v-show="modelType === '列表模式'"
          is-dot
          style="margin-right: 20px;margin-top: 10px;"
        >
          <el-button
            @click.native="() => $refs.filterForm.openDialog()"
            type="text"
            style="padding: 0;"
            >筛选<i class="el-icon-arrow-down"></i
          ></el-button>
        </el-badge>

        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="width: 200px;float: right;"
          class="filter-input"
          :placeholder="
            modelType === '列表模式' ? '搜索设备或点位名称' : '搜索设备名称'
          "
          suffix-icon="el-icon-search"
        />
      </div>
    </div>

    <Card-Model
      :form="cardFilterForm"
      v-show="modelType === '卡片模式'"
      :bigTypeId="bigTypeId"
      :smallTypeId="smallTypeId"
    />
    <Table-Model
      :form="tableFilterForm"
      v-show="modelType === '列表模式'"
      :bigTypeId="bigTypeId"
      :smallTypeId="smallTypeId"
    />

    <Filter-Form
      ref="filterForm"
      :projectId="projectId"
      :bigTypeId="bigTypeId"
      @change="handleFilterFormChange"
      :smallTypeId="smallTypeId"
    />
  </div>
</template>

<script>
import FilterForm from '@/views/monitor/component/FilterForm'
import TableModel from '@/views/monitor/component/TableModel'
import CardModel from '@/views/monitor/component/CardModel'
import { SMALL_TYPE1 } from '@/views/monitor/type'

export default {
  props: {
    bigTypeId: Number,
    smallTypeId: Number
  },
  components: {
    FilterForm,
    CardModel,
    TableModel
  },
  data() {
    return {
      modelType: SMALL_TYPE1.includes(this.smallTypeId)
        ? '卡片模式'
        : '列表模式',
      tableFilterForm: {
        deviceStatusIds: [],
        pointStatusIds: [],
        readWriteAccess: [],
        isSetAlarm: [],
        pointTypeIds: [],
        text: ''
      },
      cardFilterForm: {
        text: '',
        state: 0
      },
      filterForm: {
        text: '',
        state: 0
      }
    }
  },
  watch: {
    $route() {
      const { fullPath } = this.$route
      this.$router.replace({
        path: '/redirect' + fullPath
      })
    },
    'filterForm.text'(text) {
      this.tableFilterForm.text = text
      this.cardFilterForm.text = text
    }
  },
  mounted() {
    // if (this.smallTypeId === 3 || this.smallTypeId === 8) {
    //   this.fetchCardData()
    //   this.timer = setInterval(() => {
    //     this.fetchCardData({ showLoading: false })
    //   }, 60 * 1000)
    // }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  methods: {
    hideFilterNotice() {
      const {
        deviceStatusIds,
        pointStatusIds,
        readWriteAccess,
        isSetAlarm,
        pointTypeIds
      } = this.tableFilterForm
      return !!(
        !deviceStatusIds.length &&
        !pointStatusIds.length &&
        !readWriteAccess.length &&
        !isSetAlarm.length &&
        !pointTypeIds.length
      )
    },
    handleStateChange(val) {
      this.cardFilterForm.state = val
    },
    handleFilterFormChange(form) {
      this.tableFilterForm = form
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/style/monitorCommon.scss';
.device-container {
  .alarm-tag {
    font-size: 13px;
    background: #fff2e8;
    border: 1px solid #f84d50;
    color: #f84d50;
  }
  .offline-tag {
    font-size: 13px;
    background-color: rgba(144, 147, 153, 0.1);
    border-color: rgba(144, 147, 153, 0.2);
    color: #909399;
  }
  .normal-tag {
    font-size: 13px;
    background: #f6ffec;
    border: 1px solid #52c41b;
    color: #52c41b;
  }
}
.tool-wrap {
  padding: 13px 25px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: #fff;
}
</style>
