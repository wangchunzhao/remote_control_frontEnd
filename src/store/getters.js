const getters = {
  sidebar: state => state.app.sidebar,
  proList: state => state.app.proList,
  project: state => state.app.project,
  pid: state => state.app.pid,
  userInfo: state => state.app.userInfo,
  companyId: state => (state.app.company || {}).id,
  preference: state => state.user.preference,
  isEmptyAccount: state => state.app.isEmptyAccount
}
export default getters
