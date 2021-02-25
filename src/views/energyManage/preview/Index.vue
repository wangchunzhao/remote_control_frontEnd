<template>
  <div class="content-box energy_manage-preview">
    <page-header title="能耗分析" showBack>
      <template v-slot:right>
        <div style="flex: 1;display: flex;justify-content: flex-end">
          <el-button
              @click.native="
              () => {
                $refs.dialogAssetClassify.openDialog()
              }
            "
              style="margin-left: 15px;"
              size="mini"
          >
            <c-svg name="time-circle" style="font-size: 13px;"></c-svg>
            时段设置
          </el-button>
        </div>
      </template>
    </page-header>
    <Header />
    <Panel1 />
    <Panel2 />
    <Panel3 />
    <Panel4 />
  </div>
</template>

<script>
import Header from './component/Header'
import Panel1 from './component/Panel1'
import Panel2 from './component/Panel2'
import Panel3 from './component/Panel3'
import Panel4 from './component/Panel4'
export default {
  components: {
    Header,
    Panel1,
    Panel2,
    Panel3,
    Panel4
  }
}
</script>

<style lang="scss">
.energy_manage-preview {
  padding: 0;
  background-color: transparent;
  .energy_manage-panel {
    margin-top: 24px;
    background-color: #fff;
    border-radius: 4px;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0 24px;
    .title {
      font-size: 15px;
      font-weight: 500;
    }
  }
  .table-wrap {
    position: relative;
    .table-download-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      .icon {
        font-size: 16px;
      }
    }
  }
}
</style>
