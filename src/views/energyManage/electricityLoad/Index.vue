<template>
  <div class="content-box energy_manage-electricity">
    <Panel1 />
    <Panel2 />
    <Panel3 />
  </div>
</template>

<script>
import Panel1 from './component/Panel1'
import Panel2 from './component/Panel2'
import Panel3 from './component/Panel3'
export default {
  components: {
    Panel1,
    Panel2,
    Panel3
  }
}
</script>

<style lang="scss">
.energy_manage-electricity {
  padding: 0;
  background-color: transparent;
  .energy_manage-panel {
    margin-top: 24px;
    background-color: #fff;
    border-radius: 4px;
  }

  .panel-header {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    padding: 20px 24px 0 24px;
  }

  .panel-header .title {
    font-size: 15px;
    font-weight: 500;
  }

  .table-wrap {
    position: relative;
    .table-download-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      .icon {
        font-size: 18px;
      }
    }
  }
}
</style>
