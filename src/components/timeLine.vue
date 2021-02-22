<template>
  <ul class="event-list">
    <span>
      <i class="el-icon-time clock" />
    </span>
    <li v-for="(item, index) in events" :key="index" class="events-item">
      <div>
        <div style="padding:3px;">时间：{{ item.UpdateTime }}</div>
        <div style="padding:3px;">
          由【{{ item.UserName }}】变更状态为【{{
            item.Status === 1 ? '使用中' : item.Status === 2 ? '闲置中' : ''
          }}】
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    events: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    placeClick(e) {
      this.$emit('placeClick', e.target.innerText)
    }
  }
}
</script>

<style lang="scss" scoped>
.event-list {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
  &::before {
    content: '';
    position: absolute;
    top: 28px;
    left: 15px;
    bottom: 0;
    width: 1px;
    background: #ededed;
  }
}
.clock {
  font-size: 30px;
  color: #13ce66;
  margin-bottom: 35px;
}
.events-item {
  position: relative;
  margin-left: 70px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ededed;
  &::before {
    content: '';
    position: absolute;
    left: -60px;
    top: 0;
    z-index: 10;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #13ce66;
  }
}
</style>
