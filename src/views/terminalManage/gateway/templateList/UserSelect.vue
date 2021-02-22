<template>
  <el-popover
    :placement="placement"
    width="220"
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
        placeholder="手机号码搜索"
      />
    </div>
    <ul class="us-list thin-scroll" v-loading="loading">
      <li
        v-for="(user, index) in list"
        :key="index"
        :class="[
          'us-list-item',
          selectId.includes(user.Key) ? 'us-list-item-select' : ''
        ]"
        @click="select(user)"
      >
        <c-svg
          :class="[
            'us-check',
            selectId.includes(user.Key) ? 'us-check-show' : ''
          ]"
          name="true"
        />
        <img class="us-avatar" :src="user.Extend" alt="" />
        <span class="us-name">{{ user.Value }}</span>
      </li>
      <li
        v-if="!list.length"
        class="us-list-item"
        style="height: 50px;color: #c2c5ca;font-size: 13px;justify-content: center"
      >
        {{ !filter ? '输入用户手机号码搜索' : '未找到指定用户' }}
      </li>
    </ul>
  </el-popover>
</template>

<script>
import { getUserDropdownByMobileOrName } from '@/api/user'
import debounce from 'lodash/debounce'

export default {
  props: {
    placement: {
      type: String,
      default: 'right-start'
    },
    selectId: Array
  },
  data() {
    return {
      list: [],
      filter: '',
      loading: false
    }
  },
  watch: {
    filter(val) {
      this.fetchUserOption(val)
    }
  },
  methods: {
    select(user) {
      this.$emit('change', user)
      this.hide()
    },
    hide() {
      this.filter = ''
      this.list = []
    },
    fetchUserOption: debounce(
      function(filter = '') {
        if (filter === '') {
          this.list = []
          this.loading = false
          return false
        }
        this.loading = true

        getUserDropdownByMobileOrName({
          mobileOrName: filter
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.list = res.data.Data
            } else {
              this.list = []
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.loading = false
          })
      },
      1000,
      {
        leading: true
      }
    )
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
    height: 40px;
    line-height: 40px;
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
