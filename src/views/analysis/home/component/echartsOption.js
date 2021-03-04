export const totalNumStoreEchartOptions = {
  grid: {
    // 直角坐标系内绘图网格
    left: '0', // grid 组件离容器左侧的距离,
    // left的值可以是80这样具体像素值，
    // 也可以是'80%'这样相对于容器高度的百分比
    top: '0',
    right: '0',
    bottom: '0',
    containLabel: true // gid区域是否包含坐标轴的刻度标签。为true的时候，
    // left/right/top/bottom/width/height决定的是包括了坐标轴标签在内的
    // 所有内容所形成的矩形的位置.常用于【防止标签溢出】的场景
  },
  xAxis: {
    // 直角坐标系grid中的x轴,
    // 一般情况下单个grid组件最多只能放上下两个x轴,
    // 多于两个x轴需要通过配置offset属性防止同个位置多个x轴的重叠。
    maxInterval: 1,
    type: 'value', // 坐标轴类型,分别有：
    // 'value'-数值轴；'category'-类目轴;
    // 'time'-时间轴;'log'-对数轴
    splitLine: { show: false }, // 坐标轴在 grid 区域中的分隔线
    axisLabel: { show: false }, // 坐标轴刻度标签
    axisTick: { show: false }, // 坐标轴刻度
    axisLine: { show: false } // 坐标轴轴线
  },
  yAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: { show: false },
    data: ['a'] // 类目数据，在类目轴（type: 'category'）中有效。
    // 如果没有设置 type，但是设置了axis.data,则认为type 是 'category'。
  },
  series: [
    // 系列列表。每个系列通过 type 决定自己的图表类型
    {
      name: '%', // 系列名称
      type: 'bar', // 柱状、条形图
      silent: true,
      barWidth: '100%', // 柱条的宽度,默认自适应
      data: [0], // 系列中数据内容数组
      color: '#1890FF',
      zlevel: 1 // 柱状图所有图形的 zlevel 值,
      // zlevel 大的 Canvas 会放在 zlevel 小的 Canvas 的上面
    },
    {
      name: '进度条背景',
      type: 'bar',
      silent: true,
      barGap: '-100%', // 不同系列的柱间距离，为百分比。
      // 在同一坐标系上，此属性会被多个 'bar' 系列共享。
      // 此属性应设置于此坐标系中最后一个 'bar' 系列上才会生效，
      // 并且是对此坐标系中所有 'bar' 系列生效。
      barWidth: '100%',
      data: [1],
      color: '#F0F2F5' // 柱条颜色
    }
  ]
}
export const totalNumDeviceEchartOptions = {
  grid: {
    // 直角坐标系内绘图网格
    left: '0', // grid 组件离容器左侧的距离,
    // left的值可以是80这样具体像素值，
    // 也可以是'80%'这样相对于容器高度的百分比
    top: '0',
    right: '0',
    bottom: '0',
    containLabel: true // gid区域是否包含坐标轴的刻度标签。为true的时候，
    // left/right/top/bottom/width/height决定的是包括了坐标轴标签在内的
    // 所有内容所形成的矩形的位置.常用于【防止标签溢出】的场景
  },
  xAxis: {
    // 直角坐标系grid中的x轴,
    // 一般情况下单个grid组件最多只能放上下两个x轴,
    // 多于两个x轴需要通过配置offset属性防止同个位置多个x轴的重叠。
    type: 'value', // 坐标轴类型,分别有：
    maxInterval: 1,
    // 'value'-数值轴；'category'-类目轴;
    // 'time'-时间轴;'log'-对数轴
    splitLine: { show: false }, // 坐标轴在 grid 区域中的分隔线
    axisLabel: { show: false }, // 坐标轴刻度标签
    axisTick: { show: false }, // 坐标轴刻度
    axisLine: { show: false } // 坐标轴轴线
  },
  yAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: { show: false },
    inverse: true,
    data: ['b'] // 类目数据，在类目轴（type: 'category'）中有效。
    // 如果没有设置 type，但是设置了axis.data,则认为type 是 'category'。
  },
  series: [
    // 系列列表。每个系列通过 type 决定自己的图表类型
    {
      name: '%', // 系列名称
      type: 'bar', // 柱状、条形图
      silent: true,
      barWidth: '100%', // 柱条的宽度,默认自适应
      data: [0], // 系列中数据内容数组
      color: '#14D27C',
      zlevel: 1 // 柱状图所有图形的 zlevel 值,
      // zlevel 大的 Canvas 会放在 zlevel 小的 Canvas 的上面
    },
    {
      name: '进度条背景',
      type: 'bar',
      silent: true,
      barGap: '-100%', // 不同系列的柱间距离，为百分比。
      // 在同一坐标系上，此属性会被多个 'bar' 系列共享。
      // 此属性应设置于此坐标系中最后一个 'bar' 系列上才会生效，
      // 并且是对此坐标系中所有 'bar' 系列生效。
      barWidth: '100%',
      data: [1],
      color: '#F0F2F5' // 柱条颜色
    }
  ]
}
