<template>
  <div>
    <div v-for="v in router" :key="v.label">
      {{ v.label }}
      <div v-for="vv in v.child" :key="vv.label" style="margin-left: 30px;">
        {{ vv.label }}
        <div
          v-for="vvv in vv.child"
          :key="vvv.label"
          style="margin-left: 30px;"
        >
          {{ vvv.label }}
        </div>
      </div>
    </div>
    <el-button @click="foo">button</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      router: []
    }
  },
  methods: {
    foo() {
      let routerCopy = JSON.parse(JSON.stringify(this.router))
      const temp = routerCopy.find(v => v.label === '2')
      temp.child.push({
        label: '2-2',
        child: [
          {
            label: '2-2-1',
            child: []
          }
        ]
      })
      this.router = routerCopy
    }
  },
  mounted() {
    this.router = [
      {
        label: '1',
        child: [
          {
            label: '1-1',
            child: [
              {
                label: '1-1-1',
                child: []
              }
            ]
          }
        ]
      },
      {
        label: '2',
        child: [
          {
            label: '2-1',
            child: [
              {
                label: '2-1-1',
                child: []
              }
            ]
          }
        ]
      }
    ]
  }
}
</script>
