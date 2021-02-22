<template>
  <div class="content-box" style="background-color: transparent;padding: 0;">
    <el-row :gutter="20" type="flex">
      <el-col :span="12">
        <PointSourceBox @change="val => (list = val)" />
      </el-col>
      <el-col :span="12">
        <PointTargetBox :list-add="list" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PointSourceBox from './PointSourceBox'
import PointTargetBox from './PointTargetBox'
export default {
  components: {
    PointSourceBox,
    PointTargetBox
  },
  data() {
    return {
      list: []
    }
  }
}
</script>

<style lang="scss" scoped></style>
