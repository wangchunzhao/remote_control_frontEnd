import { getUserPreferences, UpdateUserPreferences } from '@/api/user'
const user = {
  state: {
    preference: sessionStorage.getItem('preference')
      ? JSON.parse(sessionStorage.getItem('preference'))
      : {}
  },
  mutations: {
    UPDATE_PREFERENCE(state, payload) {
      state.preference = payload
      sessionStorage.setItem('preference', JSON.stringify(payload))
    }
  },
  actions: {
    fetchUserPreference({ commit }) {
      getUserPreferences()
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            if (data.Preferences) {
              commit('UPDATE_PREFERENCE', JSON.parse(data.Preferences))
            } else {
              commit('UPDATE_PREFERENCE', {})
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    updateUserPreference({ commit }, payload) {
      commit('UPDATE_PREFERENCE', payload)
      UpdateUserPreferences({
        Preferences: JSON.stringify(payload)
      })
    }
  }
}
export default user
