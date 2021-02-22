// import Vue from 'vue'
import { storageName } from '@/utils/index'
const carInfo = sessionStorage.getItem(storageName('carInfo'))
const monitor = {
  state: {
    coldcarData: carInfo ? JSON.parse(carInfo) : ''
  },
  mutations: {
    UPDATE_CARDATA(state, data) {
      state.coldcarData = data
      sessionStorage.setItem(storageName('carInfo'), JSON.stringify(data))
    }
  }
}
export default monitor
