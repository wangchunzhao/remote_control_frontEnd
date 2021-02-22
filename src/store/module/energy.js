import { getSubentryTree } from '@/api/subentry'
import { storageName } from '@/utils/index'
import { Message } from 'element-ui'

const energy = {
  state: {
    previewData: {
      mointorPointNum: '-',
      areaNum: '-',
      todayElectricityUse: '-',
      todayElectricityLoad: '-',
      currentMonthElectricityUse: '-'
    },
    energyStruct:
      JSON.parse(sessionStorage.getItem(storageName('energyStruct'))) || []
  },
  mutations: {
    UPDATE_ENERGY_STRUCT(state, payload) {
      state.energyStruct = payload
      sessionStorage.setItem(
        storageName('energyStruct'),
        JSON.stringify(payload)
      )
    },
    UPDATE_PREVIEW_DATA(state, payload) {
      Object.assign(state.previewData, payload)
    }
  },
  actions: {
    fetchEnergyStruct({ commit, rootState }) {
      return new Promise((resolve, reject) => {
        getSubentryTree({
          companyId: rootState.app.company.id,
          projectId: rootState.app.project.id,
          isGetModelTree: true
        })
          .then(function(res) {
            if (200 === res.data.Code) {
              // 目前只要做了电量的
              let data = res.data.Data
              walk(data)
              commit('UPDATE_ENERGY_STRUCT', data)
            } else commit('UPDATE_ENERGY_STRUCT', [])
            resolve()
          })
          .catch(err => {
            reject()
            console.error(err)
            Message.info('能耗分项数据获取失败')
          })
      })
    }
  }
}
export default energy

function walk(arr) {
  arr.forEach(item => {
    item.ChildrenList && item.ChildrenList.length
      ? walk(item.ChildrenList)
      : delete item.ChildrenList
  })
}
