import Vue from 'vue'
import ElementUI from 'element-ui'
import Vuex from 'vuex'
import dayjs from 'dayjs'
import ScheduleList from '@/views/assetManage/AssetValidation/ScheduleList'
import CSvg from '@/components/CSvg'
// import ScheduleAddForm from '@/views/assetManage/AssetValidation/component/ScheduleAddForm'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import * as api from '@/api/schedule'
Vue.use(ElementUI)
Vue.component('c-svg', CSvg)

Vue.prototype._dateFormat = (time, formateString = 'YYYY-MM-DD HH:mm') => {
  return dayjs(time).format(formateString)
}

const localVue = createLocalVue()
localVue.use(Vuex)

describe('views/assetManage/AssetValidation/ScheduleList', () => {
  let wrap
  let store
  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        app: {
          state: {
            proList: [
              {
                id: 23,
                label: '项目名称'
              }
            ],
            project: {
              id: 233
            },
            company: {
              id: 233
            }
          }
        }
      }
    })
    wrap = shallowMount(ScheduleList, {
      store,
      localVue,
      sync: false,
      stubs: {
        transition: false
      }
    })
  })

  // it('watch - filterForm.text 改变后调用 fetchTableData事件', () => {
  //   const stub = jest.fn()
  //   wrap.setMethods({ fetchTableData: stub })
  //   wrap.vm.filterForm.text = '233333'

  //   expect(stub).toHaveBeenCalled()
  // })
  it('computed', () => {
    expect(wrap.vm.proList).toEqual([
      {
        id: 23,
        label: '项目名称'
      }
    ])
    expect(wrap.vm.companyId).toEqual(233)
  })
  it('表格排序', () => {
    wrap.vm.sortChange({ order: 'ascending' })
    expect(wrap.vm.filterForm.orderBy).toBe('asc')

    wrap.vm.sortChange({ order: 'descending' })
    expect(wrap.vm.filterForm.orderBy).toBe('desc')

    const stub = jest.fn()
    wrap.setMethods({ fetchTableData: stub })
    wrap.vm.sortChange({ order: 'descending' })
    expect(stub).toHaveBeenCalled()
  })

  it('表格筛选', () => {
    wrap.vm.filterChange({
      Type: [23]
    })
    expect(wrap.vm.filterForm.type).toEqual([23])

    const stub = jest.fn()
    wrap.setMethods({ fetchTableData: stub })
    wrap.vm.filterChange({
      Type: [223]
    })
    expect(stub).toHaveBeenCalled()
  })

  it('表格分页', () => {
    const { vm } = wrap
    const stub = jest.fn()
    wrap.setMethods({ fetchTableData: stub })

    vm.handleCurrentChange()
    expect(stub).toHaveBeenCalled()

    vm.handleSizeChange()
    expect(stub).toHaveBeenCalled()
    expect(vm.pagination.currentPage).toEqual(1)
  })

  it('获取表格数据 fetchTableData', () => {
    const getScheduleListStub = jest.spyOn(api, 'getScheduleList')
    getScheduleListStub.mockReturnValueOnce(
      Promise.resolve({
        data: {
          Code: 200,
          Message: '成功',
          Data: {
            Data: [
              {
                ID: 13,
                ProjectID: 0,
                Content: '3333333',
                Type: 1,
                WorkDate: '2019-07-09 00:00:00',
                Remind: 0,
                CreateUser: 120,
                CreateUserName: '蒋贻鑫',
                Status: 0,
                Member: null,
                ResourcesList: null,
                Files: [
                  'https://back-end-assets.oss-cn-shanghai.aliyuncs.com/资产验证校验/13/运单导入样表.xlsx',
                  'https://back-end-assets.oss-cn-shanghai.aliyuncs.com/资产验证校验/13/网关模版.xlsx'
                ]
              }
            ],
            TotalCount: 1,
            TotalPages: 1
          }
        }
      })
    )

    const { vm } = wrap
    vm.fetchTableData()
    expect(vm.tableLoading).toBe(true)

    vm.$nextTick(() => {
      expect(vm.tableData).toHaveLength(1)
    })
  })

  it('点击新增日程按钮打开弹窗', () => {
    const { vm } = wrap
    wrap.find('.test-add-button').trigger('click')
    expect(vm.addScheduleDialogVisible).toBe(true)
  })

  it('点击查看日程', () => {
    const { vm } = wrap
    vm.tableData = [
      {
        ID: 13,
        ProjectID: 0,
        Content: '3333333',
        Type: 1,
        WorkDate: '2019-07-09 00:00:00',
        Remind: 0,
        CreateUser: 120,
        CreateUserName: '蒋贻鑫',
        Status: 0,
        Member: null,
        ResourcesList: null,
        Files: [
          'https://back-end-assets.oss-cn-shanghai.aliyuncs.com/资产验证校验/13/运单导入样表.xlsx',
          'https://back-end-assets.oss-cn-shanghai.aliyuncs.com/资产验证校验/13/网关模版.xlsx'
        ]
      }
    ]
    wrap.vm.$nextTick(() => {
      const stub = jest.fn()
      wrap.setMethods({ handleWatch: stub })
      wrap.find('.test-watch-btn').trigger('click')

      expect(stub).toHaveBeenCalled()
      expect(wrap.find({ ref: 'scheduleDetailDialog' }).vm.dialogVisible).toBe(
        true
      )
    })
  })
})
