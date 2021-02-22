<template>
  <el-popover
    :placement="placement"
    width="250"
    trigger="click"
    popper-class="template-select"
    :visible-arrow="false"
    @hide="hide"
    v-model="visible"
  >
    <slot slot="reference" />
    <div class="select-header">
      <el-input
        v-model="filter"
        size="small"
        clearable
        suffix-icon="el-icon-search"
        placeholder="搜索模板名称"
      />
    </div>
    <div v-for="(group, key) in list" :key="key" class="group">
      <div class="group-title">
        {{ key }}
      </div>
      <ul class="option-list thin-scroll">
        <li
          v-for="item in group"
          :key="item.MaintenanceTemplateId"
          :class="['option-list-item']"
          @click="select(item)"
        >
          <span class="us-name">{{ item.MaintenanceTemplateName }}</span>
        </li>
      </ul>
    </div>
  </el-popover>
</template>

<script>
export default {
  props: {
    placement: {
      type: String,
      default: 'right-start'
    },
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      list: this.data,
      visible: false,
      filter: ''
    }
  },
  watch: {
    filter(val) {
      const data = JSON.parse(JSON.stringify(this.data))
      console.log('[61]-TemplateSelect.vue', data)
      for (const key in data) {
        const temp = []
        data[key].forEach(item => {
          if (
            item.MaintenanceTemplateName.toLowerCase().indexOf(
              val.toLowerCase()
            ) > -1
          ) {
            temp.push(item)
          }
          data[key] = temp
        })
      }
      this.list = data
    },
    data(val) {
      this.list = val
    }
  },
  methods: {
    select(template) {
      this.$emit('change', template)
      this.visible = false
    },
    hide() {
      this.filter = ''
      this.$emit('hide')
    }
  }
}
</script>

<style lang="scss">
.template-select {
  border: 1px solid #dadfe6;
  border-radius: 5px;
  background: #fff;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
  * {
    box-sizing: border-box;
  }
  .select-header {
    padding: 6px 10px;
    background: #f2f4f6;
    box-shadow: 0 1px 0 0 #d8dde4;
    border-radius: 5px 5px 0 0;
    border-bottom: 1px solid #dadfe6;
  }
  .option-list {
    overflow: auto;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .option-list-item {
    display: flex;
    align-items: center;
    height: 36px;
    line-height: 36px;
    padding-left: 15px;
    padding-right: 15px;
    cursor: pointer;
    &:hover {
      background-color: #f5f7fa;
    }
  }
  .group {
    max-height: 250px;
    border-bottom: 1px solid #f5f7fa;
  }
  .group-title {
    padding-left: 15px;
    padding-right: 15px;
    font-size: 12px;
    color: #909399;
    line-height: 30px;
  }
  .us-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin: 0 10px;
  }
  .us-check {
    flex: 0 0 14px;
    visibility: hidden;
  }
  .us-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .us-check-show {
    visibility: visible;
  }
}
</style>
