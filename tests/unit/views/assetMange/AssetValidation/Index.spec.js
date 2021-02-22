import ElementUI from 'element-ui'
import Vue from 'vue'
import Index from '@/views/assetManage/AssetValidation/Index'
import { shallowMount } from '@vue/test-utils'

Vue.use(ElementUI)

// beforeEach

describe('验证校验首页', () => {
  const wrap = shallowMount(Index)
  it('包含『日程列表』和『报告查询』', () => {
    expect(wrap.html()).toContain('日程列表')
    expect(wrap.html()).toContain('报告查询')
  })

  it('初始化是日程列表tab', () => {
    expect(wrap.vm.activeName).toBe('first')
  })
})
