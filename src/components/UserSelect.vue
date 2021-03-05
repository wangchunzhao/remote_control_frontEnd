<template>
  <el-popover
    :placement="placement"
    width="200"
    trigger="click"
    popper-class="user-select"
    :visible-arrow="false"
    @hide="hide"
  >
    <slot slot="reference" />
    <div class="us-header">
      <el-input
        v-model="filter"
        size="small"
        clearable
        suffix-icon="el-icon-search"
        placeholder="用户名"
      />
    </div>
    <ul class="us-list thin-scroll">
      <li
        v-for="(user, index) in list"
        :key="index"
        :class="['us-list-item', user.check === 1 ? 'us-list-item-select' : '']"
        @click="select(user)"
      >
        <c-svg
          :class="['us-check', user.check === 1 ? 'us-check-show' : '']"
          name="true"
        />
        <img class="us-avatar" :src="user.avatar" alt="" />
        <span class="us-name">{{ user.name }}</span>
      </li>
    </ul>
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
      type: Array,
      required: true
    }
  },
  data() {
    return {
      list: this.data,
      filter: ''
    }
  },
  watch: {
    filter(val) {
      this.list = this.data.filter(
        user => user.name.toLowerCase().indexOf(val.toLowerCase()) > -1
      )
    },
    data(val) {
      this.list = val
    }
  },
  methods: {
    select(user) {
      if (user.check === 1) {
        user.check = 0
      } else {
        user.check = 1
      }
      this.$emit('change', user)
    },
    hide() {
      this.filter = ''
      this.$emit('hide')
    }
  }
}
</script>

<style lang="scss">
.user-select {
  border: 1px solid #dadfe6;
  border-radius: 5px;
  background: #fff;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
  * {
    box-sizing: border-box;
  }
  .us-header {
    padding: 6px 10px;
    background: #f2f4f6;
    box-shadow: 0 1px 0 0 #d8dde4;
    border-radius: 5px 5px 0 0;
    border-bottom: 1px solid #dadfe6;
  }
  .us-list {
    max-height: 250px;
    overflow: auto;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .us-list-item {
    display: flex;
    align-items: center;
    height: 36px;
    line-height: 36px;
    padding-left: 10px;
    padding-right: 10px;
    border-bottom: 1px solid #f5f7fa;
    cursor: pointer;
  }
  .us-list-item-select {
    background: #f5f7fa;
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
