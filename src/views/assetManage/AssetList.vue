<template>
  <div
    v-loading="assetUploadLoading"
    class="assetList content-box"
    element-loading-text="资产导入中..."
  >
    <div style="margin-bottom: 35px;">
      <!-- <el-select
        v-model="tableFilterForm.project"
        class="margin-right-15"
        size="small"
        multiple
        collapse-tags
        placeholder="请选择项目"
        style="width: 260px;"
        @visible-change="projectSelectVisibleChange"
        @change="changeProject"
        @remove-tag="fetchAssetList"
      >
        <el-option
          v-for="(item, index) in projectOptions"
          :key="index"
          :label="item.label"
          :value="item.id"
        />
      </el-select> -->
      <el-button
        type="primary"
        class="margin-right-15"
        size="small"
        v-permission="[45]"
        icon="el-icon-plus"
        @click.native="openAssetDialog"
      >
        新增
      </el-button>
      <el-dropdown trigger="click">
        <el-button v-permission="[47]" size="small" class="margin-right-15">
          操作<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- <el-dropdown-item @click.native="copyAsset">
            复制
          </el-dropdown-item> -->
          <el-dropdown-item @click.native="statusChangeDialog = true">
            状态变更
          </el-dropdown-item>
          <el-dropdown-item @click.native="openAttributeDialog">
            属性变更
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click" class="margin-right-15">
        <el-button size="small">
          导入/导出<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-permission="[45]">
            <el-button type="text" class="file-btn">
              从excel导入
              <input
                id="fileInput"
                type="file"
                multiple="false"
                accept=".xls"
                @change="uploadExcel($event)"
              />
            </el-button>
            <el-tooltip class="item" effect="light" placement="top">
              <div slot="content">
                批量导入样表<a
                  href="javascript:;"
                  style="color:#409EFF;"
                  @click="downloadExcelTemplate"
                >
                  下载<c-svg name="download"
                /></a>
              </div>
              <c-svg style="font-size: 16px;" name="what" />
            </el-tooltip>
          </el-dropdown-item>
          <el-dropdown-item v-permission="[44]" @click.native="exportExcel">
            导出为excel
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click" class="margin-right-15">
        <el-button size="small">
          生成标签<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- <el-dropdown-item>下载标签图片</el-dropdown-item> -->
          <el-dropdown-item v-permission="[44]" @click.native="exportAssetTag">
            导出标签列表
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button
        size="small"
        icon="el-icon-delete"
        v-permission="[46]"
        type="danger"
        @click.native="delAsset"
      >
        删除
      </el-button>
      <el-input
        v-model.trim="tableFilterForm.deviceName"
        clearable
        size="small"
        placeholder="名称/编号"
        suffix-icon="el-icon-search"
        style="float: right;width: 200px;"
      />
    </div>
    <el-table
      ref="table"
      v-loading="assetLoading"
      :data="assetList"
      class="asset-table"
      style="width: 100%"
      show-overflow-tooltip
      @selection-change="handleSelectionChange"
      @filter-change="tableFilterChange"
      @sort-change="tableSortChange"
    >
      <el-table-column type="selection" width="35" align="center" />
      <el-table-column
        prop="status"
        column-key="status"
        label="状态"
        :filters="
          industryId === 1
            ? [
                { text: '闲置中', value: 2 },
                { text: '使用中', value: 1 },
                { text: '已验证', value: 3 },
                { text: '待验证', value: 4 }
              ]
            : [{ text: '闲置中', value: 2 }, { text: '使用中', value: 1 }]
        "
        width="150"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.status === 1"
            size="small"
            style="cursor:pointer;"
            @click.native="fetchStatusLog(scope.row.id)"
          >
            使用中
          </el-tag>
          <el-tag
            v-if="scope.row.repairCount"
            size="small"
            type="success"
            style="cursor:pointer;"
            @click.native="fetchRepairLog(scope.row.id)"
          >
            维修中
          </el-tag>
          <el-tag
            v-if="scope.row.status === 2"
            size="small"
            type="info"
            style="cursor:pointer;"
            @click.native="fetchStatusLog(scope.row.id)"
          >
            闲置中
          </el-tag>
          <el-tag
            v-if="scope.row.status === 3"
            size="small"
            type="success"
            style="cursor:pointer;"
            @click.native="fetchStatusLog(scope.row.id)"
          >
            已验证
          </el-tag>
          <el-tag
            v-if="scope.row.status === 4"
            size="small"
            type="info"
            style="cursor:pointer;"
            @click.native="fetchStatusLog(scope.row.id)"
          >
            待验证
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="资产编码"
        prop="assets_code"
        sortable
        width="165"
      />
      <el-table-column label="资产名称" prop="mName" sortable>
        <template slot-scope="scope">
          <el-button type="text" @click.native="fetchAssetInfo(scope.row.id)">
            {{ scope.row.mName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="资产类别"
        prop="TypeName"
        column-key="TypeName"
        sortable
        :filters="filterAssetTypeOptions"
      />
      <el-table-column label="所属项目" prop="pname" sortable />
      <el-table-column prop="locName">
        <template slot="header" slot-scope="{}" style="cursor:pointer">
          <el-popover
            v-model="filterPopoverVisible"
            placement="bottom-start"
            width="190"
            trigger="click"
            popper-class="asset-table-filter-popover"
            transition="el-zoom-in-top"
          >
            <div class="filter-top">
              <button
                :class="[
                  'filter-btn',
                  tableFilterLocation.length ? '' : 'disabled'
                ]"
                @click="filterByLocation('filter')"
              >
                筛选
              </button>
              <button class="filter-btn" @click="filterByLocation('reset')">
                重置
              </button>
            </div>
            <el-select
              v-model="tableFilterLocation"
              multiple
              collapse-tags
              placeholder="请选择所属位置"
              size="mini"
              style="padding: 8px;"
            >
              <el-option-group
                v-for="group in filterLocationOptions"
                :key="group.lable"
                :label="group.lable"
              >
                <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.lable"
                  :value="item.value"
                />
              </el-option-group>
            </el-select>
            <div slot="reference" style="cursor: pointer;display: block;">
              <span
                :style="{
                  color: tableFilterLocation.length ? '#409EFF' : 'inherit'
                }"
                >位置</span
              >
              <i
                class="el-icon-arrow-down"
                style="font-size:12px;color: #909399;transform: scale(.75)"
              />
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        width="95"
        label="是否监控"
        prop="ismonitor"
        column-key="ismonitor"
        :filters="[{ text: '是', value: 1 }, { text: '否', value: 0 }]"
      >
        <template slot-scope="scope">
          {{ scope.row.ismonitor === 0 ? '否' : '是' }}
        </template>
      </el-table-column>
      <el-table-column
        label="监控分类(系统)"
        prop="monitorName"
        column-key="monitorName"
        :filters="filterSystemTypes"
        sortable
        width="150"
      />
      <el-table-column
        label="监控分类(设备)"
        prop="devtypeName"
        column-key="devtypeName"
        :filters="filterDeviceTypes"
        sortable
        width="150"
      />
    </el-table>
    <el-pagination
      background
      :current-page.sync="pagination.currentPage"
      :page-size.sync="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
    <el-dialog
      title="新增/编辑资产"
      :visible.sync="assetDialog"
      custom-class="asset-edit-dialog"
      width="800px"
      @close="assetDialogClose"
    >
      <el-form
        ref="assetForm"
        :model="assetForm"
        :rules="assetFormRules"
        label-width="100px"
      >
        <el-row :gutter="25">
          <el-col :span="12">
            <el-form-item label="项目" prop="project">
              <el-select
                v-model="assetForm.project"
                size="medium"
                value-key="id"
                clearable
                filterable
                placeholder="请选择项目"
                style="width: 100%;"
                @change="projectSelectChange"
              >
                <el-option
                  v-for="item in projectOptions"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="25">
          <el-col :span="12">
            <el-form-item label="资产名称" prop="mName">
              <el-input
                v-model.trim="assetForm.mName"
                size="medium"
                clearable
                placeholder="请填写资产名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产编码" prop="assets_code">
              <el-tooltip
                effect="dark"
                content="编码是唯一的，您也可以自己定义"
                placement="top"
              >
                <el-input
                  v-model.trim="assetForm.assets_code"
                  size="medium"
                  class="bg-gray"
                  clearable
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="25">
          <el-col :span="12">
            <el-form-item label="资产类别">
              <el-select
                v-model="assetForm.assets_type"
                size="medium"
                placeholder="请选择资产类别"
                style="width: 100%;"
                clearable
                filterable
                @visible-change="assetSelectVisibleChange"
              >
                <el-option
                  v-for="(item, index) in assetTypeOption"
                  :key="index"
                  :label="item.TypeName"
                  :value="item.ID"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存放位置" prop="locationZ">
              <el-select
                v-model="assetForm.locationZ"
                size="medium"
                placeholder="请选择存放位置"
                style="width: 100%;"
                clearable
                filterable
                @visible-change="assetSelectVisibleChange"
              >
                <el-option
                  v-for="(item, index) in assetLocationOption"
                  :key="index"
                  :label="item.mname"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="25">
          <el-col :span="12">
            <el-form-item label="是否监控">
              <el-switch
                v-model="assetForm.ismonitor"
                active-text="否"
                inactive-text="是"
                active-color="#ff4949"
                inactive-color="#409eff"
                :active-value="0"
                :inactive-value="1"
                @change="monitorChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="monitorType" label="监控分类">
              <el-cascader
                v-model="assetForm.monitorType"
                :options="monitroTypeOption"
                size="medium"
                :props="cascaderProps"
                style="width:100%;"
                :disabled="assetForm.ismonitor === 0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="25">
          <el-col :span="12">
            <el-form-item label="管理员">
              <el-popover
                ref="popover1"
                placement="bottom"
                width="280"
                trigger="click"
                popper-class="contact-popover"
                @hide="inviteAble = false"
              >
                <el-input
                  slot="reference"
                  v-model.trim="assetForm.manager"
                  clearable
                  size="medium"
                  placeholder="通过用户名或手机号搜索"
                />
                <ul
                  v-if="suggestContact"
                  class="device-contact-list thin-scroll"
                >
                  <li
                    class="device-contact-list-item"
                    @click="
                      selectUser(
                        suggestContact.nickname,
                        suggestContact.mobile,
                        suggestContact.id,
                        'manager'
                      )
                    "
                  >
                    <div class="contact-avatar">
                      <img
                        :src="suggestContact.avatar"
                        width="25px"
                        height="25px"
                        alt=""
                      />
                    </div>
                    <div class="contact-info">
                      <div class="contact-username">
                        {{ suggestContact.nickname }}
                      </div>
                      <div class="contact-phone">
                        {{ suggestContact.mobile }}
                      </div>
                    </div>
                  </li>
                </ul>
                <div
                  v-show="
                    !suggestContact && !contactFilterLoading && !inviteAble
                  "
                  class="no-contact"
                >
                  {{
                    assetForm.manager
                      ? '没有找到该用户'
                      : '请输入用户名或手机号查找'
                  }}
                </div>
                <div v-show="contactFilterLoading" class="loading-mask">
                  <i class="el-icon-loading" />
                </div>
                <div v-show="inviteAble" class="register-invite">
                  没有找到该用户&nbsp;
                  <el-button
                    type="text"
                    @click.native="invite(assetForm.manager)"
                  >
                    邀请加入
                  </el-button>
                </div>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用者">
              <el-popover
                ref="popover2"
                placement="bottom"
                width="280"
                trigger="click"
                popper-class="contact-popover"
                @hide="inviteAble = false"
              >
                <el-input
                  slot="reference"
                  v-model.trim="assetForm.user"
                  clearable
                  size="medium"
                  placeholder="通过用户名或手机号搜索"
                />
                <ul
                  v-if="suggestContact"
                  class="device-contact-list thin-scroll"
                >
                  <li
                    class="device-contact-list-item"
                    @click="
                      selectUser(
                        suggestContact.nickname,
                        suggestContact.mobile,
                        suggestContact.id,
                        'user'
                      )
                    "
                  >
                    <div class="contact-avatar">
                      <img
                        :src="suggestContact.avatar"
                        width="25px"
                        height="25px"
                        alt=""
                      />
                    </div>
                    <div class="contact-info">
                      <div class="contact-username">
                        {{ suggestContact.nickname }}
                      </div>
                      <div class="contact-phone">
                        {{ suggestContact.mobile }}
                      </div>
                    </div>
                  </li>
                </ul>
                <div
                  v-show="
                    !suggestContact && !contactFilterLoading && !inviteAble
                  "
                  class="no-contact"
                >
                  {{
                    assetForm.user
                      ? '没有找到该用户'
                      : '请输入用户名或手机号查找'
                  }}
                </div>
                <div v-show="contactFilterLoading" class="loading-mask">
                  <i class="el-icon-loading" />
                </div>
                <div v-show="inviteAble" class="register-invite">
                  没有找到该用户&nbsp;
                  <el-button type="text" @click.native="invite(assetForm.user)">
                    邀请加入
                  </el-button>
                </div>
              </el-popover>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="25">
          <el-col :span="12">
            <el-form-item label="维保商">
              <el-popover
                ref="popover3"
                placement="bottom"
                width="280"
                trigger="click"
                popper-class="contact-popover"
                @hide="inviteAble = false"
              >
                <el-input
                  slot="reference"
                  v-model.trim="assetForm.repairer"
                  clearable
                  size="medium"
                  placeholder="通过用户名或手机号搜索"
                />
                <ul
                  v-if="suggestContact"
                  class="device-contact-list thin-scroll"
                >
                  <li
                    class="device-contact-list-item"
                    @click="
                      selectUser(
                        suggestContact.nickname,
                        suggestContact.mobile,
                        suggestContact.id,
                        'repair'
                      )
                    "
                  >
                    <div class="contact-avatar">
                      <img
                        :src="suggestContact.avatar"
                        width="25px"
                        height="25px"
                        alt=""
                      />
                    </div>
                    <div class="contact-info">
                      <div class="contact-username">
                        {{ suggestContact.nickname }}
                      </div>
                      <div class="contact-phone">
                        {{ suggestContact.mobile }}
                      </div>
                    </div>
                  </li>
                </ul>
                <div
                  v-show="
                    !suggestContact && !contactFilterLoading && !inviteAble
                  "
                  class="no-contact"
                >
                  {{
                    assetForm.repairer
                      ? '没有找到该用户'
                      : '请输入用户名或手机号查找'
                  }}
                </div>
                <div v-show="contactFilterLoading" class="loading-mask">
                  <i class="el-icon-loading" />
                </div>
                <div v-show="inviteAble" class="register-invite">
                  没有找到该用户&nbsp;
                  <!-- <el-button
                    type="text"
                    @click.native="invite(assetForm.repairer)"
                  >
                    邀请加入
                  </el-button> -->
                </div>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用状态">
              <el-select
                v-model="assetForm.status"
                size="medium"
                clearable
                placeholder="请选择项目"
                style="width: 100%;"
              >
                <el-option label="使用中" :value="1" />
                <el-option label="闲置中" :value="2" />
                <el-option v-if="industryId === 1" label="已验证" :value="3" />
                <el-option v-if="industryId === 1" label="待验证" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 冷链行业才有货位号 -->
          <el-col :span="12" v-if="industryId === 1">
            <el-form-item label="货位号">
              <el-input
                v-model="assetForm.CargoLocation"
                placeholder="请填写货位号"
                clearable
                size="medium"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-collapse v-model="activeNames" accordion>
          <el-collapse-item title="设备属性" name="1">
            <el-row :gutter="25">
              <el-col :span="12">
                <el-form-item label="品牌">
                  <el-input
                    v-model.trim="assetForm.brand"
                    clearable
                    size="medium"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="规格型号">
                  <el-input
                    v-model.trim="assetForm.type"
                    clearable
                    size="medium"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="25">
              <el-col :span="12">
                <el-form-item label="SN号">
                  <el-input
                    v-model.trim="assetForm.sn"
                    clearable
                    size="medium"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出厂日期">
                  <el-date-picker
                    v-model="assetForm.MFG"
                    value-format="yyyy-MM-dd"
                    size="medium"
                    type="date"
                    clearable
                    placeholder="选择日期"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="25" v-if="isFreezer">
              <el-col :span="12">
                <el-form-item label="容量">
                  <el-input
                    v-model.trim="assetForm.capacity"
                    clearable
                    size="medium"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!--                <el-form-item label="出厂日期">-->
                <!--                  <el-date-picker-->
                <!--                      v-model="assetForm.MFG"-->
                <!--                      value-format="yyyy-MM-dd"-->
                <!--                      size="medium"-->
                <!--                      type="date"-->
                <!--                      clearable-->
                <!--                      placeholder="选择日期"-->
                <!--                      style="width: 100%;"-->
                <!--                  />-->
                <!--                </el-form-item>-->
              </el-col>
            </el-row>
          </el-collapse-item>
          <el-collapse-item title="企业属性" name="2">
            <el-row :gutter="25">
              <el-col :span="12">
                <el-form-item label="使用公司">
                  <el-input
                    v-model.trim="assetForm.use_company"
                    clearable
                    size="medium"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="使用部门">
                  <el-input
                    v-model.trim="assetForm.use_department"
                    clearable
                    size="medium"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="25">
              <el-col :span="12">
                <el-form-item label="所属公司">
                  <el-input
                    v-model.trim="assetForm.affiliated_company"
                    clearable
                    size="medium"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
          <el-collapse-item title="其它属性" name="3">
            <el-row :gutter="25">
              <el-col :span="12">
                <el-form-item label="来源">
                  <!-- 1:购入、2:自建、3:租赁、4:捐赠、5:其他 -->
                  <el-select
                    v-model="assetForm.source"
                    size="medium"
                    clearable
                    filterable
                    placeholder="请选择项目"
                    style="width: 100%;"
                  >
                    <el-option label="购入" :value="1" />
                    <el-option label="自建" :value="2" />
                    <el-option label="租赁" :value="3" />
                    <el-option label="捐赠" :value="4" />
                    <el-option label="其他" :value="5" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="入库时间">
                  <el-date-picker
                    v-model="assetForm.installDate"
                    size="medium"
                    value-format="yyyy-MM-dd"
                    type="date"
                    placeholder="选择日期"
                    style="width:100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="25">
              <el-col :span="12">
                <el-form-item label="金额">
                  <el-input
                    v-model.trim="assetForm.money"
                    size="medium"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="供应商">
                  <el-input
                    v-model.trim="assetForm.supplier"
                    size="medium"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="25">
              <el-col :span="12">
                <el-form-item label="使用期限">
                  <el-date-picker
                    v-model="assetForm.EXP"
                    value-format="yyyy-MM-dd"
                    size="medium"
                    type="date"
                    clearable
                    placeholder="选择日期"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="25">
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input
                    v-model="assetForm.remark"
                    type="textarea"
                    :rows="3"
                    size="medium"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
          <el-collapse-item title="报警记录" name="4">
            <Alarm-list ref="alarmList"></Alarm-list>
          </el-collapse-item>
          <el-collapse-item title="维修记录" name="5">
            <Repair-list ref="repairList"></Repair-list>
          </el-collapse-item>
        </el-collapse>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="assetDialog = false">取 消</el-button>
        <el-button
          type="primary"
          v-permission="[47]"
          :loading="submitAssetLoding"
          size="small"
          @click="submitAsset('assetForm', operationType)"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="维保记录"
      :visible.sync="repairRecordDialog"
      width="950px"
    >
      <el-table :data="repairRecordList" style="width: 100%">
        <el-table-column label="类型" width="60">
          <template slot-scope="scope">
            {{ scope.row.type === 1 ? '维修' : '保养' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" sortable width="80">
          <template slot-scope="scope">
            {{ scope.row.type === 1 && repairStatusFactory(scope.row.Status) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderno" label="单号" sortable width="170" />
        <el-table-column prop="conent" label="内容" sortable />
        <el-table-column prop="CreateTime" label="时间" sortable width="150" />
        <el-table-column prop="userName" label="维保人" sortable width="90" />
      </el-table>
    </el-dialog>
    <el-dialog
      title="状态变更纪录"
      :visible.sync="timeLineDialog"
      width="400px"
    >
      <timeline v-if="logs.length" :events="logs" />
      <div v-else style="text-align: center;">
        暂无状态变更纪录
      </div>
    </el-dialog>
    <el-dialog
      title="状态变更"
      :visible.sync="statusChangeDialog"
      width="400px"
    >
      <div style="text-align:center">
        <el-radio-group
          v-model="status"
          size="small"
          style="text-align:center;"
        >
          <el-radio :label="1" border>
            使用中
          </el-radio>
          <el-radio :label="2" border>
            闲置中
          </el-radio>
        </el-radio-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="statusChangeDialog = false"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click.native="changeAssetStatus"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="批量修改属性"
      :visible.sync="attributeDialog"
      width="450px"
    >
      <el-form
        ref="attrForm"
        :model="attrForm"
        :rules="attrFormRule"
        label-width="120px"
      >
        <div style="margin-left:25px;margin-bottom: 25px;">
          已选中资产:<span
            style="color: #F9D462;font-size: 18px;margin-left: 20px;margin-right: 6px;"
            >{{ selectAssets.length }}</span
          >件
        </div>
        <el-form-item label="选择属性：">
          <el-select
            v-model="attrForm.type"
            placeholder="请选择活动区域"
            size="medium"
          >
            <el-option label="资产分类" :value="1" />
            <el-option label="监控分类" :value="2" />
            <el-option label="存放位置" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="attrForm.type === 3" label="存放位置：">
          <el-select
            v-model="attrForm.location"
            size="medium"
            placeholder="请选择存放位置"
          >
            <el-option
              v-for="(item, index) in assetLocationOption"
              :key="index"
              :label="item.mname"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="attrForm.type === 1"
          label="资产类别："
          prop="assetType"
        >
          <el-select
            v-model="attrForm.assetType"
            size="medium"
            placeholder="请选择资产类别"
          >
            <el-option
              v-for="(item, index) in assetTypeOption"
              :key="index"
              :label="item.TypeName"
              :value="item.ID"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="attrForm.type === 2" label="是否监控：">
          <el-switch
            v-model="attrForm.isMonitor"
            active-text="否"
            inactive-text="是"
            active-color="#ff4949"
            inactive-color="#409eff"
            :active-value="0"
            :inactive-value="1"
            @change="attrForm.monitorType = []"
          />
        </el-form-item>
        <el-form-item
          v-if="attrForm.type === 2"
          prop="monitorType"
          label="监控分类："
        >
          <el-cascader
            v-model="attrForm.monitorType"
            :options="monitroTypeOption"
            size="medium"
            :props="cascaderProps"
            :disabled="attrForm.isMonitor === 0"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="attributeDialog = false"
          >取 消</el-button
        >
        <el-button
          size="small"
          type="primary"
          @click="submitAttrForm('attrForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 这个表不显示，只是为了给用下下载Excel提供数据源 -->
    <table id="excel-table" style="display:none">
      <tr>
        <th>设备名称</th>
        <th>项目</th>
        <th>位置</th>
        <th>序列号</th>
        <th>二维码地址</th>
      </tr>
      <tr v-for="(item, index) in selectAssets" :key="index">
        <td>{{ item.mName }}</td>
        <td>{{ item.pname }}</td>
        <td>{{ item.locName }}</td>
        <td>{{ item.assets_code }}</td>
        <td>
          {{
            `http://wx.api.sinocold.net/suguodist/#/deviceInfoByQrcode?deviceId=${item.id}`
          }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import timeline from '@/components/timeLine'
import AlarmList from './AlarmList'
import RepairList from './RepairList'
import { invitationUser } from '@/api/register'
import { queryContact } from '@/api/user'

import {
  addAssetsDevice,
  deleteAssetsInfo,
  uploadAssetsExcel,
  updateAssets,
  getAssetsAddress,
  updateAssetsInfo,
  getAssetsList,
  getAssetsStatusLog,
  getAssetsInfo,
  getAssetsMaintenance,
  existCode,
  updateAssetProp,
  exportAssetsList,
  exportAssetsLabel
} from '@/api/assets'
import {
  assetsTypeList,
  fetchFilterAssetTypeOptions,
  fetchFilterLocationOption,
  fetchFilterSystemTypes,
  fetchFilterDeviceTypes
} from '@/api/assetTypeProject'
import { monitorTypeList } from '@/api/monitorTypeProject'
import { logSnapShotFactory } from '@/utils/logSnapShot'
import FileSaver from 'file-saver'
import { storageName } from '@/utils/index'

export default {
  components: {
    timeline,
    AlarmList,
    RepairList
  },
  data() {
    let checkCode = (rule, value, callback) => {
      if (this.operationType === 'config') {
        callback()
        return false
      }
      existCode({
        assetsCode: value
      }).then(res => {
        if (res.data.Data.IsExist) {
          callback(new Error('该资产编码已存在，不可重复添加'))
        } else {
          callback()
        }
      })
    }
    let checkmonitorType = (rule, value, callback) => {
      if (this.assetForm.ismonitor === 1) {
        if (!value.length) {
          callback(new Error('请选择监控分类'))
        } else {
          callback()
          return false
        }
      } else {
        callback()
      }
    }
    let checkAttrForm = (rule, value, callback) => {
      if (this.attrForm.type === 1) {
        !this.attrForm.assetType && callback(new Error('请选择资产分类'))
      } else if (this.attrForm.type === 2) {
        if (this.attrForm.isMonitor) {
          !this.attrForm.monitorType.length &&
            callback(new Error('请选择监控分类'))
        } else {
          callback()
        }
      }
      callback()
    }
    return {
      activeNames: '0',
      projectOptions: [],
      tableFilterForm: {
        project: [this.$store.state.app.pid],
        orderfield: 0,
        orderfunc: undefined,
        deviceName: '',
        assets_typeID: undefined,
        locationZ: undefined,
        ismonitor: undefined,
        monitorID: undefined,
        devtypeID: undefined
      },
      selectAssets: [],
      assetUploadLoading: false,
      assetLoading: false,
      assetList: [],
      pagination: {
        currentPage: 1,
        total: 0,
        pageSize: 10
      },
      assetDialog: false,
      assetTypeOption: [],
      assetLocationOption: [],
      cascaderProps: {
        value: 'ID',
        label: 'TypeName',
        children: 'subset'
      },
      monitroTypeOption: [],
      inviteAble: false, // 能否邀请
      contactFilterLoading: false,
      suggestContact: null,
      contactForm: {
        visible: false,
        userName: '',
        role: '',
        userId: undefined
      },
      operationType: 'add', // 区分是添加还是编辑表单
      submitAssetLoding: false,
      isFreezer: false, //监控分类是否是冷柜类型：monitorType[0]===41&&monitorType[1]===8  true:可以设置设备属性->容量 false:不可以设置设备属性->容量
      assetForm: {
        project: null, // 项目id
        mName: '', // 资产名称
        assets_code: '', // 资产编码
        assets_type: undefined, // 资产类别
        locationZ: '', // 存放位置
        ismonitor: 1, // 是否监控
        monitorType: [], // 监控类型
        manager: '',
        administratorId: undefined, // 管理员
        user: '',
        userId: undefined, // 使用者
        repairer: undefined, // 维修商
        maintenanceId: undefined,
        status: 1, // 使用状态
        brand: '', // 品牌
        type: '', // 品牌型号
        sn: '', // sn号
        MFG: undefined, // 出厂时间
        capacity: '', //容量
        use_company: '', // 使用公司
        use_department: '', // 使用部门
        affiliated_company: '', // 所属公司
        source: undefined, // 来源
        installDate: undefined, // 入库时间
        money: undefined, // 金额
        supplier: '', // 供应商
        EXP: undefined, // 使用期限
        imgUrl: '', // 图片地址
        remark: '', // 备注
        CargoLocation: '' // 货位号
      },
      assetFormRules: {
        project: [{ required: true, message: '请选择项目', trigger: 'change' }],
        mName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
        assets_code: [{ validator: checkCode, trigger: 'blur' }],
        monitorType: [{ validator: checkmonitorType, trigger: 'change' }],
        locationZ: [
          { required: true, message: '请输入存放位置', trigger: 'blur' }
        ]
      },
      repairRecordDialog: false,
      repairRecordList: [],
      timeLineDialog: false,
      logs: [],
      statusChangeDialog: false,
      attributeDialog: false,
      attrForm: {
        type: 1,
        location: '',
        assetType: '',
        isMonitor: false,
        monitorType: []
      },
      attrFormRule: {
        monitorType: [{ validator: checkAttrForm, trigger: 'change' }],
        assetType: [{ validator: checkAttrForm, trigger: 'change' }]
      },
      status: '',
      filterAssetTypeOptions: [],
      filterLocationOptions: [],
      filterSystemTypes: [],
      filterDeviceTypes: [],
      tableFilterLocation: '',
      filterPopoverVisible: false
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    industryId() {
      return this.$store.state.app.project.Industry
    }
  },
  watch: {
    'assetForm.monitorType'(val) {
      if (
        val &&
        val.length &&
        val.length > 1 &&
        val[0] === 41 &&
        val[1] === 8
      ) {
        this.isFreezer = true
      } else {
        this.isFreezer = false
      }
    },
    'assetForm.manager'(val) {
      this.fetchSuggestContact(val)
    },
    'assetForm.user'(val) {
      this.fetchSuggestContact(val)
    },
    'assetForm.repairer'(val) {
      this.fetchSuggestContact(val)
    },
    'tableFilterForm.deviceName'() {
      this.fetchAssetList(1)
    }
  },
  mounted() {
    this.fetchProjectList()
  },
  methods: {
    // 当列表中项目栏中选中了一个项目 在新增项目中 直接帮用户赋值选中项目 节省用户操作时间 当选择两个项目或两个以上时 无此操作
    openAssetDialog() {
      this.assetDialog = true
      if (this.tableFilterForm.project.length === 1) {
        this.assetForm.project =
          this.tableFilterForm.project.length === 1
            ? this.tableFilterForm.project[0]
            : ''
        this.fetchAssetTypeOption(this.assetForm.project)
        this.fetchAssetLocationOption(this.assetForm.project)
        this.fetchMonitorTypeList(this.assetForm.project)
      } else {
        this.assetForm.project = null
      }
    },
    changeProject(val) {
      if (val.length > 1) {
        val = val.filter(item => {
          if (item != 0) {
            // 删除 “所有项目”
            return item
          }
        })
        this.tableFilterForm.project = val
      }
      this.fetchFilterAssetTypeOptions()
      this.fetchFilterLocationOption()
      this.fetchFilterSystemTypes()
      this.fetchFilterDeviceTypes()
    },
    projectSelectVisibleChange(visible) {
      if (!visible) {
        this.pagination.currentPage = 1
        this.fetchAssetList()
      }
    },
    // 复制资产
    copyAsset() {
      if (!this.selectAssets.length) {
        this.$message('请至少选择一条资产')
        return false
      }
    },
    openAttributeDialog() {
      if (!this.selectAssets.length) {
        this.$message('请至少选择一条资产')
        return false
      }
      const project = this.selectAssets.map(item => item.pname)
      if (new Set(project).size !== 1) {
        this.$message('只能操作同一个项目下的资产')
        return false
      }
      this.fetchAssetTypeOption(this.selectAssets[0].project)
      this.fetchAssetLocationOption(this.selectAssets[0].project)
      this.fetchMonitorTypeList(this.selectAssets[0].project)
      this.attributeDialog = true
    },
    // 状态变更
    changeAssetStatus() {
      if (!this.selectAssets.length) {
        this.$message('请至少选择一条资产')
        return false
      }
      if (!this.status) {
        this.$message('请选择要修改的状态')
        return false
      }
      updateAssetsInfo({
        modelTreeIdList: this.selectAssets.map(item => item.id),
        status: this.status,
        userName: JSON.parse(sessionStorage.getItem(storageName('userInfo')))
          .nickname
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('资产状态修改成功')
            this.fetchAssetList()
            setTimeout(() => {
              this.statusChangeDialog = false
            }, 500)
          } else {
            this.$message.error('资产状态修改失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 提交属性更改表单
    submitAttrForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let form = {}
          form.ListID = this.selectAssets.map(item => item.id).join(',')
          form.projectID = this.selectAssets[0].project
          if (this.attrForm.type === 1) {
            form.assets_typeID = this.attrForm.assetType
          } else if (this.attrForm.type === 2) {
            form.ismonitor = this.attrForm.isMonitor
            form.monitorID = this.attrForm.monitorType[0]
            form.devtypeID =
              this.attrForm.monitorType.length > 1
                ? this.attrForm.monitorType[1]
                : undefined
          } else {
            form.locationZ = this.attrForm.location
          }
          updateAssetProp(form)
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('资产状态修改成功')
                this.fetchAssetList()
              } else {
                this.$message.error('资产状态修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('资产状态修改失败')
            })
            .finally(() => {
              this.attributeDialog = false
              this.attrForm.type = 1
              this.attrForm.location = ''
              this.attrForm.assetType = ''
              this.attrForm.isMonitor = false
              this.attrForm.monitorType = []
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    // 下载excel模板
    downloadExcelTemplate() {
      window.location.href =
        'https://cdn.sinocold.net/excel_template/%E8%B5%84%E4%BA%A7%E5%AF%BC%E5%85%A5%E6%A0%B7%E8%A1%A8.xls'
    },
    // 导入模板
    uploadExcel(evt) {
      const file = evt.target.files[0]
      if (!file) {
        return false
      }
      this.assetUploadLoading = true
      let fd = new FormData()
      fd.append('file1', file)
      uploadAssetsExcel(fd)
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            if (data.Description.length) {
              let descText = ''
              data.Description.forEach(item => {
                descText += `<div style="padding: 4px 0">${item.ErrMessage}</div>`
              })
              this.$notify({
                title: '错误提示',
                duration: 10000,
                dangerouslyUseHTMLString: true,
                message: descText
              })
            }
            this.fetchAssetList()
          } else {
            this.$message.error('资产导入失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('文件解析错误，请确保上传文件不存在错误')
        })
        .finally(() => {
          evt.target.value = ''
          this.assetUploadLoading = false
        })
    },
    // 导出为 excel
    exportExcel() {
      exportAssetsList(
        Object.assign({}, this.tableFilterForm, {
          project: this.tableFilterForm.project.join(','),
          companyId: this.companyId
        })
      )
        .then(res => {
          if (
            res.headers['content-type'] === 'application/json; charset=utf-8'
          ) {
            // blob转json
            var reader = new FileReader()
            reader.onload = e => {
              const temp = JSON.parse(e.target.result)
              this.$message(temp.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          const blob = new Blob([res.data])
          FileSaver.saveAs(blob, '资产列表.xls')
        })
        .catch(err => {
          console.error(err)
          this.$message.error('资产导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    // 导出资产标签
    exportAssetTag() {
      exportAssetsLabel(
        Object.assign({}, this.tableFilterForm, {
          project: this.tableFilterForm.project.join(','),
          companyId: this.companyId
        })
      )
        .then(res => {
          if (
            res.headers['content-type'] === 'application/json; charset=utf-8'
          ) {
            // blob转json
            var reader = new FileReader()
            reader.onload = e => {
              const temp = JSON.parse(e.target.result)
              this.$message(temp.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          const blob = new Blob([res.data])
          FileSaver.saveAs(blob, '资产标签列表.xls')
        })
        .catch(err => {
          console.error(err)
          this.tableData = []
          this.pagination.total = 0
          this.$message.error('资产标签导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    // 删除资产
    delAsset() {
      if (!this.selectAssets.length) {
        this.$message('请至少选择一条资产')
        return false
      }
      this.$confirm('确认要删除这些资产？', '提示', { type: 'warning' }).then(
        () => {
          // const { fileName, bucketName, objectName } = logSnapShotFactory(
          //   document.querySelector('.asset-table')
          // )
          // const storageSpaceExtendList = {
          //   FileNameList: [fileName],
          //   BucketName: bucketName,
          //   ObjectName: objectName
          // }
          deleteAssetsInfo({
            storageSpaceExtendList: undefined,
            operateType: 0,
            modelTreeIdList: this.selectAssets.map(item => item.id)
          }).then(res => {
            if (res.data.Code === 200) {
              this.$message.success('资产删除成功')
              this.fetchAssetList()
            } else {
              this.$message.error('资产删除失败')
            }
          })
        }
      )
    },
    // 表格筛选
    tableFilterChange(filters) {
      switch (Object.keys(filters)[0]) {
        case 'status':
          this.tableFilterForm.status = filters['status'].join(',')
          break
        case 'TypeName':
          this.tableFilterForm.assets_typeID = filters['TypeName'].join(',')
          break
        case 'ismonitor':
          this.tableFilterForm.ismonitor = filters['ismonitor'].join(',')
          break
        case 'monitorName':
          this.tableFilterForm.monitorID = filters['monitorName'].join(',')
          break
        case 'devtypeName':
          this.tableFilterForm.devtypeID = filters['devtypeName'].join(',')
          break
        default:
          break
      }
      this.pagination.currentPage = 1
      this.fetchAssetList()
    },
    // 表格排序
    tableSortChange(sorts) {
      if (sorts.order === 'ascending') {
        this.tableFilterForm.orderfunc = 0
      } else {
        this.tableFilterForm.orderfunc = 1
      }
      // 排序字段（0 默认，1 资产编码，2 资产名称，3 资产类别，4 所属项目，5 位置，6 监控分类（系统），7 监控分类（设备））
      switch (sorts.prop) {
        case 'assets_code':
          this.tableFilterForm.orderfield = 1
          break
        case 'mName':
          this.tableFilterForm.orderfield = 2
          break
        case 'TypeName':
          this.tableFilterForm.orderfield = 3
          break
        case 'pname':
          this.tableFilterForm.orderfield = 4
          break
        case 'locName':
          this.tableFilterForm.orderfield = 5
          break
        case 'monitorName':
          this.tableFilterForm.orderfield = 6
          break
        case 'devtypeName':
          this.tableFilterForm.orderfield = 7
          break
        default:
          this.tableFilterForm.orderfield = 0
          break
      }
      this.pagination.currentPage = 1
      this.fetchAssetList()
    },
    filterByLocation(type) {
      if (type === 'reset') {
        this.tableFilterLocation = []
        this.tableFilterForm.locationZ = ''
      } else {
        this.tableFilterForm.locationZ = this.tableFilterLocation.join(',')
      }
      this.pagination.currentPage = 1
      this.fetchAssetList()
      this.filterPopoverVisible = false
    },
    handleSelectionChange(val) {
      this.selectAssets = val
    },
    // 添加/编辑资产中的项目变更时触发
    projectSelectChange(val) {
      this.fetchAssetTypeOption(val)
      this.fetchAssetLocationOption(val)
      this.fetchMonitorTypeList(val)
    },
    // 页面跳转
    handleCurrentChange() {
      this.fetchAssetList()
    },
    // 修改每页显示的数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchAssetList()
    },
    assetSelectVisibleChange(visible) {
      if (!this.assetForm.project && visible) {
        this.$message('请先选择项目')
      }
    },
    // 是否监控开关
    monitorChange(val) {
      if (val === 0) {
        // this.assetForm.monitorType = []
      }
    },
    // 选择管理员
    selectUser(nickname, mobile, id, type) {
      if (type === 'manager') {
        this.$refs.popover1.showPopper = false
        this.assetForm.manager = `${nickname} - ${mobile}`
        this.assetForm.administratorId = id
      } else if (type === 'user') {
        this.$refs.popover2.showPopper = false
        this.assetForm.userId = id
        this.assetForm.user = `${nickname} - ${mobile}`
      } else {
        this.$refs.popover3.showPopper = false
        this.assetForm.maintenanceId = id
        this.assetForm.repairer = `${nickname} - ${mobile}`
      }
    },
    fetchAssetInfo(id) {
      this.assetDialog = true
      this.operationType = 'config'
      getAssetsInfo({
        modelTreeId: id
      })
        .then(res => {
          let data = res.data.Data
          if (data.EXP === '0001-01-01 00:00:00') {
            data.EXP = undefined
          }
          if (data.MFG === '0001-01-01 00:00:00') {
            data.MFG = undefined
          }
          if (data.installDate === '0001-01-01 00:00:00') {
            data.installDate = undefined
          }
          if (data.status === 0) {
            data.status = undefined
          }
          // data.assets_code = data.assets_code
          Object.assign(this.assetForm, data)
          this.fetchAssetTypeOption(this.assetForm.project)
          this.fetchAssetLocationOption(this.assetForm.project)
          this.fetchMonitorTypeList(this.assetForm.project)
          this.assetForm.project = data.project
          this.assetForm.user = data.userName
          // this.assetForm.locationZ = data.locationZ
          this.assetForm.repairer = data.maintenanceName
          this.assetForm.manager = data.administratorName
          this.assetForm.monitorType = [data.pid, data.model]
          this.assetForm.money =
            this.assetForm.money === 0 ? undefined : this.assetForm.money
          this.assetForm.source =
            this.assetForm.source === 0 ? undefined : this.assetForm.source
          this.assetForm.assets_type =
            this.assetForm.assets_type === 0
              ? undefined
              : this.assetForm.assets_type
          this.$refs.alarmList.fetchData(this.assetForm.id)
          this.$refs.repairList.fetchData(this.assetForm.id)
        })
        .catch(err => {
          console.error(err)
        })
    },
    assetDialogClose() {
      this.assetTypeOption = []
      this.assetLocationOption = []
      this.monitroTypeOption = []
      this.operationType = 'add'
      this.$refs['assetForm'].resetFields()
      this.assetForm.ismonitor = 1 // 是否监控
      this.assetForm.assets_type = undefined // 监控类型
      this.assetForm.manager = ''
      this.assetForm.administratorId = undefined // 管理员
      this.assetForm.user = ''
      this.assetForm.userId = undefined // 使用者
      this.assetForm.repairer = undefined // 维修商
      this.assetForm.maintenanceId = undefined
      this.assetForm.status = 1 // 使用状态
      this.assetForm.brand = '' // 品牌
      this.assetForm.type = '' // 品牌型号
      this.assetForm.sn = '' // sn号
      this.assetForm.MFG = undefined // 出厂时间
      this.assetForm.capacity = '' // 容量
      this.assetForm.use_company = '' // 使用公司
      this.assetForm.use_department = '' // 使用部门
      this.assetForm.affiliated_company = '' // 所属公司
      this.assetForm.source = undefined // 来源
      this.assetForm.installDate = undefined // 入库时间
      this.assetForm.money = undefined // 金额
      this.assetForm.supplier = '' // 供应商
      this.assetForm.EXP = undefined // 使用期限
      this.assetForm.imgUrl = '' // 图片地址
      this.assetForm.remark = '' // 备注
      this.activeNames = '0'
    },
    // 添加/编辑
    submitAsset(formName, operationType) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let data = this.assetForm
          data.model = this.assetForm.monitorType[1]
          data.pid = this.assetForm.monitorType[0]
          data.capacity = this.isFreezer ? data.capacity : ''

          const { fileName, bucketName, objectName } = logSnapShotFactory(
            document.querySelector('.asset-edit-dialog')
          )
          data.StorageSpaceExtendList = {
            FileNameList: [fileName],
            BucketName: bucketName,
            ObjectName: objectName
          }
          this.submitAssetLoding = true
          if (operationType === 'config') {
            updateAssets(data)
              .then(res => {
                if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                  this.$message.success('资产修改成功')
                  this.fetchAssetList()
                  this.assetDialog = false
                } else {
                  this.$message.error('资产修改失败')
                }
              })
              .catch(err => {
                console.error(err)
              })
              .finally(() => {
                this.submitAssetLoding = false
              })
          } else {
            addAssetsDevice(data)
              .then(res => {
                if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                  this.$message.success('资产添加成功')
                  this.fetchAssetList()
                  setTimeout(() => {
                    this.assetDialog = false
                  }, 500)
                } else {
                  this.$message.error('资产添加失败')
                }
              })
              .catch(err => {
                console.error(err)
              })
              .finally(() => {
                this.submitAssetLoding = false
              })
          }
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    // 获取资产列表
    // orderfield		//排序字段（0 默认，1 资产编码，2 资产名称，3 资产类别，4 所属项目，5 位置，6 监控分类（系统），7 监控分类（设备））
    // orderfunc		//排序方式（0 升序，1 降序）
    // deviceName		//资产名称或编号
    // assets_typeID	//资产类型（多选以，分割）
    // locationZ		//所在位置（多选以，分割）
    // ismonitor		//监控状态（int）
    // monitorID		//监控分类ID（大类）（多选以，分割）
    // devtypeID		//设备分类ID（小类）（多选以，分割）
    fetchAssetList(page) {
      if (page === 1) {
        this.pagination.currentPage = 1
      }
      this.assetLoading = true
      getAssetsList(
        Object.assign({}, this.tableFilterForm, {
          project: this.tableFilterForm.project.join(','),
          PageIndex: this.pagination.currentPage,
          PageSize: this.pagination.pageSize
        })
      )
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.assetList = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.$message.error('资产列表加载失败')
          }
        })
        .catch(err => {
          this.$message.error('资产列表加载失败')
          console.error(err)
        })
        .finally(() => {
          this.assetLoading = false
        })
    },
    // 监控分类选项
    fetchMonitorTypeList(project) {
      monitorTypeList({
        projectId: project,
        industry: this.industryId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.monitroTypeOption = res.data.Data.subset
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchProjectList() {
      this.projectOptions = this.$store.state.app.proList
      this.fetchAssetList()
      this.fetchFilterAssetTypeOptions()
      this.fetchFilterLocationOption()
      this.fetchFilterSystemTypes()
      this.fetchFilterDeviceTypes()
    },
    // 获取资产分类选项
    fetchAssetTypeOption(project) {
      assetsTypeList({
        projectId: project
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.assetTypeOption = res.data.Data.subset
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchAssetLocationOption(project) {
      getAssetsAddress({
        projectId: project
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.assetLocationOption = res.data.Data
            if (this.assetLocationOption.length) {
              this.attrForm.location = this.assetLocationOption[0].id
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 根据用户名或手机号获取可添加的设备联系人
    fetchSuggestContact(filter) {
      !filter && (filter = '')
      this.contactFilterLoading = true
      queryContact(filter)
        .then(res => {
          let data = res.data.Data
          this.suggestContact = data
          this.inviteAble = false
          if (!data) {
            // 如果查找手机号，且没有查询到，则可以邀请对方注册
            if (/^1[0-9]{10}$/.test(filter)) {
              this.inviteAble = true
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .then(() => {
          this.contactFilterLoading = false
        })
    },
    fetchStatusLog(id) {
      this.timeLineDialog = true
      getAssetsStatusLog({
        modelTreeId: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            if (data.length) {
              this.logs = data
            } else {
              this.logs = []
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取维保记录
    fetchRepairLog(id) {
      this.repairRecordDialog = true
      getAssetsMaintenance({
        modelTreeId: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            if (data.length) {
              this.repairRecordList = data
            } else {
              this.repairRecordList = []
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchFilterAssetTypeOptions() {
      fetchFilterAssetTypeOptions({
        projectIdList: this.tableFilterForm.project,
        companyId: this.companyId
      })
        .then(res => {
          let data = res.data.Data
          data.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
          this.filterAssetTypeOptions = data
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchFilterLocationOption() {
      fetchFilterLocationOption({
        projectIdList: this.tableFilterForm.project,
        companyId: this.companyId
      })
        .then(res => {
          let data = res.data.Data
          this.filterLocationOptions = data
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchFilterSystemTypes() {
      fetchFilterSystemTypes({
        projectIdList: this.tableFilterForm.project,
        companyId: this.companyId
      })
        .then(res => {
          let data = res.data.Data
          data.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
          this.filterSystemTypes = data
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchFilterDeviceTypes() {
      fetchFilterDeviceTypes({
        projectIdList: this.tableFilterForm.project,
        companyId: this.companyId
      })
        .then(res => {
          let data = res.data.Data
          data.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
          this.filterDeviceTypes = data
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 邀请未注册用户
    async invite(phone) {
      let flag = false
      await invitationUser(phone).then(res => {
        if (res.data) {
          flag = true
          this.inviteAble = false
        }
      })
      if (!flag) {
        return false
      }
      this.fetchSuggestContact(phone)
      // invite(JSON.parse(sessionStorage.getItem(storageName('userInfo'))).nickname, phone)
      //   .then(res => {
      //     if (res.data) {
      //       this.$notify({
      //         title: '成功',
      //         message: `已成功发送短信邀请手机号为:${phone}的用户加入平台`,
      //         type: 'success'
      //       })
      //     } else {
      //       this.$notify.error({
      //         title: '错误',
      //         message: '邀请发送失败'
      //       })
      //     }
      //     this.inviteAble = false
      //   })
      //   .catch(err => {
      //     console.error(err)
      //   })
    },
    // 判断维修记录状态
    repairStatusFactory(status) {
      let tag = ''
      switch (status) {
        case -1:
          tag = '待提交' // 提交 删除
          break
        case 0:
          tag = '待受理' // 撤销 受理
          break
        case 1:
          tag = '待派工' // 派工 维修
          break
        case 2:
          tag = '待接单' // 接单 拒选
          break
        case 3:
          tag = '维修中' // 完工 添加维修记录
          break
        case 4:
          tag = '待验收' // 验收
          break
        case 5:
          tag = '已完成' // 评价
          break
        case 6:
          tag = '已评价' // 已评价
          break
        default:
          tag = 'Tag'
      }
      return tag
    },
    s2ab(s) {
      let buf
      if (typeof ArrayBuffer !== 'undefined') {
        buf = new ArrayBuffer(s.length)
        var view = new Uint8Array(buf)
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
      } else {
        buf = new Array(s.length)
        for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff
        return buf
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.assetList {
  background: #fff;
  .el-table__header {
    tr {
      background: red;
    }
  }
}
.el-pagination {
  margin-top: 15px;
  text-align: center;
}
.margin-right-15 {
  margin-right: 15px;
}
.width-140 {
  width: 140px;
}
</style>

<style lang="scss">
.assetList {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  .bg-gray input {
    background: #f5f7fa;
  }
  .el-table__body,
  .el-table__header {
    .el-table-column--selection {
      .cell {
        padding: 0;
      }
    }
  }
}
.file-btn {
  position: relative;
  overflow: hidden;
  input {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    opacity: 0;
  }
}
.input-asset-execl {
  overflow-y: auto;
  height: 600px;
}
.contact-popover {
  padding: 0;
  .loading-mask {
    height: 48px;
    text-align: center;
    line-height: 48px;
  }
  .no-contact {
    height: 48px;
    text-align: center;
    line-height: 48px;
    color: #ccc;
  }
  .el-icon-loading {
    font-size: 25px;
  }
  .register-invite {
    height: 48px;
    text-align: center;
    line-height: 48px;
  }
}
.device-contact-list {
  list-style: none;
  height: 48px;
  overflow: auto;
}
.device-contact-list-item {
  cursor: pointer;
  padding: 6px 15px;
  border-bottom: 1px solid #d8dde4;
  &:hover {
    background: rgb(242, 244, 246);
  }
  .contact-avatar {
    display: table-cell;
    vertical-align: middle;
    width: 25px;
    height: 25px;
    img {
      width: 25px;
      height: 25px;
      border-radius: 50%;
    }
  }
  .contact-info {
    padding-left: 10px;
    display: table-cell;
  }
  .contact-username {
    font-size: 14px;
  }
  .contact-phone {
    font-size: 12px;
    color: #ccc;
  }
}
</style>
<style lang="scss">
div.asset-table-filter-popover {
  padding: 0;
  .filter-top {
    border-bottom: 1px solid #ebeef5;
    padding: 8px;
  }
  .filter-btn {
    background: 0 0;
    border: none;
    outline: none;
    color: #606266;
    cursor: pointer;
    font-size: 13px;
    padding: 0 3px;
    padding-top: 7px;
    &:hover {
      color: #409eff;
    }
    &.disabled {
      color: #c0c4cc;
      cursor: not-allowed;
    }
  }
}
</style>
