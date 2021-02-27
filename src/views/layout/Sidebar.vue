<template>
  <div class="sidebar-container thin-scroll">
    <el-menu
      mode="vertical"
      :default-active="$route.path"
      :class="{ 'is-collapse': sidebar }"
      :collapse="!sidebar"
      background-color="#fff"
      text-color="rgba(0,0,0,0.65)"
      active-text-color="#1890ff"
      class="el-menu-vertical-demo"
      unique-opened
      @select="selectMenuItem"
    >
      <template v-for="item in routerMap">
        <div
          v-if="!item.hidden && item.children"
          :key="item.name + uuidv1()"
          class="menu-item"
        >
          <el-submenu
            v-if="!item.singleMenu"
            :key="item.name + uuidv1()"
            :index="item.name || item.path"
          >
            <template slot="title" style="vertical-align:-3em">
              <c-svg :name="item.meta.icon" class-name="nav-icon" />
              <span>{{ item.meta && item.meta.title }}</span>
            </template>
            <template v-for="child in item.children">
              <!-- 商超行业实时监测子系统导航 start -->
              <el-submenu
                v-if="child.type === 'monitorSystem'"
                :key="child.path + uuidv1()"
                :index="child.path"
              >
                <template slot="title">
                  {{ child.name }}
                </template>
                <el-menu-item
                  v-for="systemChild in child.children"
                  :key="systemChild.path + 'index' + uuidv1()"
                  :index="systemChild.path"
                  :route="systemChild"
                >
                  {{ systemChild.name }}
                </el-menu-item>
              </el-submenu>
              <!-- 商超行业实时监测子系统导航 end -->

              <!-- 冷链行业实时监测子系统导航 start -->
              <el-menu-item
                v-if="child.type === 'monitorSystemChild'"
                :key="child.path + uuidv1()"
                :index="child.path"
                :route="child"
              >
                {{ child.name }}
              </el-menu-item>
              <!-- 冷链行业实时监测子系统导航 end -->

              <el-menu-item
                v-if="
                  !child.hidden &&
                    child.type !== 'monitorSystem' &&
                    child.type !== 'monitorSystemChild'
                "
                :key="child.path + 'index' + uuidv1()"
                :index="
                  child.redirect ? child.redirect : item.path + '/' + child.path
                "
                :route="child"
              >
                {{ child.meta && child.meta.title }}
              </el-menu-item>
            </template>
          </el-submenu>
          <el-menu-item
            v-else
            :index="item.redirect"
            :class="{ 'submenu-title-noDropdown': !sidebar }"
          >
            <c-svg :name="item.meta.icon" class-name="nav-icon" />
            <span>{{ item.meta && item.meta.title }}</span>
          </el-menu-item>
        </div>
      </template>
    </el-menu>
  </div>
</template>
<script>
import { getFirstRouterPath } from '@/utils/permissions'
import uuidv1 from 'uuid/v1'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      uuidv1
    }
  },
  computed: {
    routerMap() {
      return this.$store.state.permissions.routerMap
    },
    ...mapGetters(['sidebar', 'industry', 'platform'])
  },
  methods: {
    selectMenuItem(path, indexPath, item) {
      this.$router.push({ path: path, query: (item.route || {}).query })
    },
    // 业务运营平台-定制化实时监测导航
    generateMonitorSystemNav(monitorSystemRouteMap) {
      let routerCopy = JSON.parse(JSON.stringify(this.router))
      let temp = routerCopy.find(item => item.name === 'monitor')
      // 可能存在没有设备监测的路由权限
      if (temp) {
        if (this.industry === 2 || this.industry === 4) {
          // 商超行业或文物保护
          temp.children = temp.children.filter(
            item => item.type !== 'monitorSystem'
          ) // 删除上一个项目的实时监测子系统
          // 将所有子系统放入子系统菜单下
          temp.children.push({
            type: 'monitorSystem',
            name: '子系统',
            path: uuidv1(),
            children: [...monitorSystemRouteMap]
          })
        } else if (this.industry === 1) {
          // 冷链行业
          temp.children = temp.children.filter(
            item => item.type !== 'monitorSystemChild'
          ) // 删除上一个项目的实时监测子系统
          temp.children.unshift(...monitorSystemRouteMap)
          this.$router.push({
            path: monitorSystemRouteMap.length
              ? monitorSystemRouteMap[0].realPath
              : this.$router.push({
                  path: getFirstRouterPath(this.router[0])
                })
          }) // 如果有子系统 ? 跳转第一个子系统 ： 跳转第一个页面
        } else if (this.industry === 3) {
          // 养殖业
          temp.children = temp.children.filter(
            item => item.type !== 'monitorSystemChild'
          ) // 删除上一个项目的实时监测子系统
          temp.children.push(...monitorSystemRouteMap)
        }

        this.router = routerCopy
      }
    }
  }
}
</script>
<style lang="scss">
@import 'src/assets/style/sidebar.scss';
.nav-icon {
  margin-right: 16px;
  width: 16px;
  height: 16px;
  color: rgba(0, 0, 0, 0.65) !important;
  vertical-align: middle;
}
</style>
