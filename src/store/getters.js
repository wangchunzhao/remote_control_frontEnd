const getters = {
  sidebar: state => state.app.sidebar,
  mapOverviewHeaderVisible: state => state.app.mapOverviewHeaderVisible,
  proList: state => state.app.proList,
  project: state => state.app.project,
  pid: state => state.app.pid,
  userInfo: state => state.app.userInfo || {},
  companyId: state => (state.app.company || {}).id,
  companyList: state => state.app.companyList,
  industry: state => (state.app.project || {}).Industry,
  preference: state => state.user.preference,
  platform: state => state.permissions.platform,
  isEmptyAccount: state => state.app.isEmptyAccount
}
export default getters
