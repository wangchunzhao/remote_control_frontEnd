<template>
  <div class="repair-table-config">
    <div class="head">表头设置</div>
    <div class="main-body thin-scroll">
      <draggable
        :list="data"
        class="list-group"
        ghost-class="ghost"
        handle=".drag-trigger"
        @start="dragging = true"
        @end="handleDragEnd"
      >
        <div
          @click="() => handleClickItem(item)"
          v-for="item in data"
          :key="item.key"
          :class="['list-item', item.cannotHide ? 'list-item_disabled' : null]"
        >
          <c-svg
            :class="[
              'drag-icon',
              item.dragable ? 'drag-trigger' : 'drag-trigger_disabled'
            ]"
            name="tuozhuai"
          ></c-svg>
          <c-svg class="desc-icon" :name="item.icon"></c-svg>
          <span class="desc">{{ item.label }}</span>
          <c-svg
            v-show="!item.hidden"
            name="true"
            class="sign-icon"
            style="font-size: 13px;"
          ></c-svg>
        </div>
      </draggable>
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import { updatePreferences } from '@/api/preferences'
export default {
  props: {
    list: Array
  },
  components: {
    draggable
  },
  data() {
    return {
      dragging: false,
      data: []
    }
  },
  watch: {
    list: {
      handler: function(val) {
        this.data = JSON.parse(JSON.stringify(val))
      }
    }
  },
  computed: {
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  methods: {
    handleClickItem(item) {
      if (item.cannotHide) {
        return
      }
      item.hidden = !item.hidden
      this.$emit('change', this.data)
      this.update()
    },
    handleDragEnd() {
      this.dragging = false
      this.$emit('change', this.data)
      this.update()
    },
    update() {
      updatePreferences({
        ForeignId: this.userId,
        TableType: 'Repair',
        Field: JSON.stringify(this.data)
      })
        .then(res => {
          if (res.data.Code !== 200 || res.data.Data !== true) {
            this.$message('表头设置更新失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss">
.repair-table-config {
  .head {
    height: 48px;
    line-height: 48px;
    text-align: center;
    border-bottom: 1px solid #e5e5e5;
    font-weight: 500;
  }
  .main-body {
    // margin: 16px 0;
    height: 300px;
    overflow-y: auto;
  }
  .list-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    &:hover {
      background-color: #f7f7f7;
      .drag-icon {
        opacity: 1;
      }
    }
  }
  .list-item_disabled {
    cursor: not-allowed;
    .sign-icon {
      color: #bfbfbf;
    }
  }
  .sign-icon {
    font-size: 13px;
    color: #595959;
  }
  .desc-icon {
    margin: 0 10px;
  }
  .desc {
    flex: 1;
  }
  .drag-icon {
    opacity: 0;
    transition: opacity 0.4s;
    cursor: move;
  }
  .drag-trigger_disabled {
    opacity: 0 !important;
    cursor: not-allowed;
  }
}
</style>
