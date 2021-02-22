import Vue from 'vue'
import Vuex from 'vuex'
import app from './module/app'
import monitor from './module/monitor'
import permissions from './module/permissions'
import energy from './module/energy'
import user from './module/user'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    monitor,
    permissions,
    energy,
    user
  },
  getters
})
export default store
