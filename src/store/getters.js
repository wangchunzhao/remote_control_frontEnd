const getters = {
  sidebar: state => state.app.sidebar,
  proList: state => state.app.proList,
  project: state => state.app.project,
  pid: state => state.app.pid,
  userInfo: state => state.app.userInfo,
  preference: state => state.user.preference
}
export default getters
