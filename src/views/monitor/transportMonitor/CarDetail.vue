<template>
  <div class="refrigerationCar_container pdg2">
    <el-row :gutter="24">
      <el-col :span="16" class="car-information">
        <div class="car-info_details">
          <div class="info-details_title">
            <span class="car-title_wrapper">
              <span class="car-title_name">{{ car_info.carNumber }}</span>
            </span>
          </div>
          <el-form
            ref="car_info"
            size="small"
            label-position="left"
            :model="car_info"
            label-width="100px"
            style="box-sizing:border-box;padding:10px 10px 0 25px"
            :rules="formRules"
          >
            <el-row :gutter="24">
              <el-col
                :span="12"
                @mouseenter.native="handleHover(1)"
                @mouseleave.native="companyShow = false"
                @click.native="switchcarType(1)"
              >
                <el-form-item
                  label="所属公司："
                  prop="Company"
                  @mouseenter="handleHover(1)"
                  @mouseleave="companyShow = false"
                  @click="switchcarType(1)"
                >
                  <span v-show="!companybtnShow">{{ car_info.Company }}</span>
                  <el-input
                    v-show="companybtnShow"
                    v-model="car_info.Company"
                    placeholder="请输入"
                    size="small"
                  />
                  <i v-show="companyShow" class="el-icon-edit blueColor2" />
                  <i
                    v-show="companybtnShow"
                    class="el-icon-circle-close cancelIcon"
                    @click.stop="cancelInput(1)"
                  />
                  <i
                    v-show="confirmCompany && companybtnShow"
                    class="el-icon-circle-check blueColor"
                    @click.stop="confirmcarInfo(1)"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="车辆类型："
                  prop="Type"
                  @mouseenter.native="handleHover(2)"
                  @mouseleave.native="typeShow = false"
                  @click.native="switchcarType(2)"
                >
                  <span v-show="!typebtnShow">{{
                    car_info.Type == 0 ? '独立冷机' : '非独立冷机'
                  }}</span>
                  <el-select
                    v-show="typebtnShow"
                    v-model="car_info.Type"
                    size="small"
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option label="独立冷机" value="0" />
                    <el-option label="非独立冷机" value="1" />
                  </el-select>
                  <i v-show="typeShow" class="el-icon-edit blueColor2" />
                  <i
                    v-show="typebtnShow"
                    class="el-icon-circle-close cancelIcon"
                    @click.stop="cancelInput(2)"
                  />
                  <i
                    v-show="confirmType && typebtnShow"
                    class="el-icon-circle-check blueColor"
                    @click.stop="confirmcarInfo(2)"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item
                  class="carinfoForm"
                  label="联系人   ："
                  prop="Contact"
                  @mouseenter.native="handleHover(3)"
                  @mouseleave.native="personShow = false"
                  @click.native="switchcarType(3)"
                >
                  <span v-show="!personbtnShow">{{ car_info.Contact }}</span>
                  <el-input
                    v-show="personbtnShow"
                    v-model="car_info.Contact"
                    placeholder="请输入"
                    size="small"
                  />
                  <i v-show="personShow" class="el-icon-edit blueColor2" />
                  <i
                    v-show="personbtnShow"
                    class="el-icon-circle-close cancelIcon"
                    @click.stop="cancelInput(3)"
                  />
                  <i
                    v-show="confirmPerson && personbtnShow"
                    class="el-icon-circle-check blueColor"
                    @click.stop="confirmcarInfo(3)"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  class="carinfoForm"
                  label="制冷剂   ："
                  prop="Refriger"
                  @mouseenter.native="handleHover(4)"
                  @mouseleave.native="refrigerShow = false"
                  @click.native="switchcarType(4)"
                >
                  <span v-show="!refrigerbtnShow">{{ car_info.Refriger }}</span>
                  <el-input
                    v-show="refrigerbtnShow"
                    v-model="car_info.Refriger"
                    placeholder="请输入"
                    size="small"
                  />
                  <i
                    v-show="refrigerbtnShow"
                    class="el-icon-circle-close cancelIcon"
                    @click.stop="cancelInput(4)"
                  />
                  <i v-show="refrigerShow" class="el-icon-edit blueColor2" />
                  <i
                    v-show="confirmRefriger && refrigerbtnShow"
                    class="el-icon-circle-check blueColor"
                    @click.stop="confirmcarInfo(4)"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item
                  label="联系电话："
                  prop="Mobile"
                  @mouseenter.native="handleHover(5)"
                  @mouseleave.native="phoneShow = false"
                  @click.native="switchcarType(5)"
                >
                  <span v-show="!phonebtnShow">{{ car_info.Mobile }}</span>
                  <el-input
                    v-show="phonebtnShow"
                    v-model="car_info.Mobile"
                    placeholder="请输入"
                    size="small"
                  />
                  <i v-show="phoneShow" class="el-icon-edit blueColor2" />
                  <i
                    v-show="phonebtnShow"
                    class="el-icon-circle-close cancelIcon"
                    @click.stop="cancelInput(5)"
                  />
                  <i
                    v-show="confirmPhone && phonebtnShow"
                    class="el-icon-circle-check blueColor"
                    @click.stop="confirmcarInfo(5)"
                  />
                </el-form-item>
              </el-col>
              <el-col
                :span="12"
                @mouseenter.native="handleHover(6)"
                @mouseleave.native="brandShow = false"
                @click.native="switchcarType(6)"
              >
                <el-form-item
                  label="产品品牌："
                  class="brand-form_item"
                  prop="Brand"
                >
                  <span v-show="!brandbtnShow">{{ car_info.Brand }}</span>
                  <el-input
                    v-show="brandbtnShow"
                    v-model="car_info.Brand"
                    size="small"
                    placeholder="请输入品牌名称"
                    style="width:100%;marign-right:5px;"
                  />
                </el-form-item>
                <el-form-item label="" class="atype-form_item" prop="Atype">
                  <span v-show="!brandbtnShow">{{ car_info.Atype }}</span>
                  <el-input
                    v-show="brandbtnShow"
                    v-model="car_info.Atype"
                    size="small"
                    style="width:100%;"
                    placeholder="请输入品牌型号"
                  />
                  <i
                    v-show="confirmAtype && brandbtnShow"
                    class="el-icon-circle-check blueColor atype-icon"
                    @click.stop="confirmcarInfo(6)"
                  />
                  <i
                    v-show="brandbtnShow"
                    class="el-icon-circle-close cancelIcon"
                    @click.stop="cancelInput(6)"
                  />
                </el-form-item>
                <i v-show="brandShow" class="el-icon-edit lastEdit" />
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-col>
      <el-col :span="8" class="car-info_track">
        <router-link
          :to="{
            name: 'carTrack',
            query: { carNumber: car_info.carNumber, carId: car_info.Id }
          }"
          class="car-track_wrapper"
        >
          <div id="track-container" />
        </router-link>
      </el-col>
    </el-row>
    <div class="car-status-wrapper mgt20">
      <div class="car-status_title">
        <span class="car-status_text">监测点数值</span>
        <el-button
          v-if="car_info.CarSnType === 1"
          style="margin-left: 10px;"
          icon="el-icon-setting"
          size="mini"
          @click.native="pointFormDialog = true"
        >
          管理监测点
        </el-button>
      </div>
      <div class="car-status">
        <template v-for="item in carData">
          <div v-if="item.unit === '℃'" :key="item.id" class="car-status_value">
            <div class="car-status_inside">
              <div
                class="status-value_circle"
                :class="
                  item.unit === '℃' ? 'temperature-circle' : 'humid-circle'
                "
              >
                {{ item.name }}
              </div>
              <div>
                <div class="status-value_num">
                  {{ item.valuename }}
                </div>
                <div class="status-value_title">
                  {{ item.utime }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="car-historyData">
      <div class="car-status_title">
        <span class="car-status_text">历史数据</span>
      </div>
      <div class="historydata-wrapper">
        <div class="w100">
          <el-form
            ref="searchHisForm"
            :model="searchHisForm"
            inline
            size="small"
            label-width="120px"
            class="search-form"
          >
            <el-form-item
              label="选择时间"
              prop="time"
              :rules="[
                { required: true, message: '请选择时间', trigger: 'change' }
              ]"
            >
              <el-date-picker
                v-model="searchHisForm.time"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm"
                @change="handleTime"
              />
            </el-form-item>
            <el-form-item
              label="时间间隔(分)"
              prop="interval"
              :rules="[
                { required: true, message: '时间间隔不能为空' },
                { type: 'number', message: '时间间隔必须为数字值' }
              ]"
            >
              <el-input
                v-model.number="searchHisForm.interval"
                style="width:130px"
                placeholder="分钟"
                :maxlength="6"
              />
            </el-form-item>
            <el-form-item style="text-align:center">
              <el-button type="primary" @click.native="search('searchHisForm')">
                查看数据
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-loading="historyLoading" element-loading-text="加载中...">
          <div v-show="!isShow" id="historydata_chart" />
          <div v-show="isShow" class="placehold_photo" />
        </div>
      </div>
    </div>
    <el-dialog title="车辆监测点" :visible.sync="pointFormDialog" width="450px">
      <el-form
        ref="pointForm"
        :model="pointForm"
        label-width="100px"
        size="medium"
      >
        <el-form-item
          v-for="(point, index) in pointForm.points"
          :key="index"
          :label="'监测点' + (index + 1)"
          :prop="'points.' + index + '.value'"
          :rules="{
            required: true,
            message: '不能为空',
            trigger: 'blur'
          }"
        >
          <el-select
            v-model="point.value"
            :disabled="!handleEditAble(point.value)"
            placeholder="请选择传感器"
          >
            <el-option
              v-for="item in CarTagOptions"
              :key="item.Key"
              :disabled="handleSelectDisabled(item.Value, pointForm.points)"
              :label="item.Value"
              :value="item.Value"
            />
          </el-select>
          <el-button
            class="btn-danger"
            type="text"
            v-if="handleEditAble(point.value)"
            @click.native="removeInput(index)"
          >
            <i
              class="el-icon-remove"
              style="font-size: 18px;margin-left: 5px;"
            />
          </el-button>
          <el-tooltip
            v-else
            effect="dark"
            content="配置了报警策略的监测点不能修改"
            placement="top"
          >
            <c-svg
              name="what"
              style="margin-left: 10px;font-size: 17px;"
            ></c-svg>
          </el-tooltip>
        </el-form-item>
        <el-button
          type="text"
          style="margin-left: 100px;"
          @click.native="addInput"
        >
          <i class="el-icon-plus" />
          新增
        </el-button>
      </el-form>
      <span slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button @click="pointFormDialog = false" size="medium"
          >取 消</el-button
        >
        <el-button
          type="primary"
          size="medium"
          @click="submitPointForm('pointForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { carDataInfo } from '@/api/car'
import {
  getCarTagDropdownList,
  batchAddCarTag,
  getHistoryData
} from '@/api/device_new'
import BaiduMap from '@/utils/initBaiduMap'
import { isPhone } from '@/utils/validate'
import { getCarInfo, updateCarInfo } from '@/api/car'
import { forwardBaiduGetlatestpoint } from '@/api/forward'

export default {
  data() {
    // eslint-disable-next-line no-useless-escape
    let reg = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im
    let checkCompany = (rule, value, callback) => {
      if (!value) {
        this.confirmCompany = false
        callback(new Error('请输入公司名称'))
      } else if (reg.test(value)) {
        this.confirmCompany = false
        callback(new Error('请输入正确的公司名称'))
      } else {
        this.confirmCompany = true
        callback()
      }
    }
    let checkType = (rule, value, callback) => {
      if (value === '') {
        this.confirmPerson = false
        callback(new Error('请选择车辆类型'))
      } else if (this.typebtnShow && (value === 1 || value === 0)) {
        this.confirmType = true
        callback()
      }
    }
    let checkContact = (rule, value, callback) => {
      if (!value) {
        this.confirmPerson = false
        callback(new Error('请输入联系人'))
      } else if (reg.test(value)) {
        this.confirmPerson = false
        callback(new Error('请输入正确的联系人'))
      } else {
        this.confirmPerson = true
        callback()
      }
    }
    let checkPhone = (rule, value, callback) => {
      if (!value) {
        this.confirmPhone = false
        callback(new Error('请输入电话号码'))
      } else if (!isPhone(value)) {
        this.confirmPhone = false
        callback(new Error('请输入正确的电话号码'))
      } else {
        this.confirmPhone = true
        callback()
      }
    }
    let checkRefriger = (rule, value, callback) => {
      if (!value) {
        this.confirmRefriger = false
        callback(new Error('请输入制冷剂'))
      } else if (reg.test(value)) {
        this.confirmRefriger = false
        callback(new Error('请输入正确的制冷剂'))
      } else {
        this.confirmRefriger = true
        callback()
      }
    }
    let checkBrand = (rule, value, callback) => {
      if (!value) {
        this.confirmBrand = false
        callback(new Error('请输入品牌名称'))
      } else if (reg.test(value)) {
        this.confirmBrand = false
        callback(new Error('请输入正确的品牌名称'))
      } else {
        this.confirmBrand = true
        if (this.confirmBrand && this.confirmAtypestatus) {
          this.confirmAtype = true
        }
        callback()
      }
    }
    let checkAtype = (rule, value, callback) => {
      if (!value) {
        this.confirmAtype = false
        callback(new Error('请输入品牌型号'))
      } else if (reg.test(value)) {
        this.confirmAtype = false
        callback(new Error('请输入正确的品牌型号'))
      } else {
        this.confirmAtypestatus = true
        if (this.confirmBrand && this.confirmAtypestatus) {
          this.confirmAtype = true
        }
        callback()
      }
    }
    return {
      periods: '',
      car_info: {
        carNumber: '',
        Id: this.$route.query.carId,
        Company: '',
        Type: '',
        Contact: '',
        Mobile: '',
        Refriger: '',
        Brand: '',
        Atype: '',
        sn: '',
        CarSnType: ''
      },
      map: '',
      carData: [],
      pointList: [],
      history_chart: null,
      chartData: [],
      selected_time: '',
      pickerOptions: {
        disabledDate: time => {
          return (
            time.getTime() <
            new Date(this.searchHisForm.starttime).getTime() - 8.64e7
          )
        }
      },
      cardatainfoTimer: null,
      currentpositionTimer: null,
      historyLoading: false,
      typeShow: false,
      typebtnShow: false,
      confirmType: false,
      companyShow: false,
      companybtnShow: false,
      confirmCompany: false,
      personShow: false,
      personbtnShow: false,
      confirmPerson: false,
      phoneShow: false,
      phonebtnShow: false,
      confirmPhone: false,
      brandShow: false,
      brandbtnShow: false,
      confirmBrand: false,
      confirmAtype: false,
      confirmAtypestatus: false,
      refrigerShow: false,
      refrigerbtnShow: false,
      confirmRefriger: false,
      // isSpecial,
      formRules: {
        Company: [{ validator: checkCompany, trigger: 'blur' }],
        Type: [{ validator: checkType, trigger: 'blur' }],
        Contact: [{ validator: checkContact, trigger: 'blur' }],
        Mobile: [{ validator: checkPhone, trigger: 'blur' }],
        Refriger: [{ validator: checkRefriger, trigger: 'blur' }],
        Brand: [{ validator: checkBrand, trigger: 'blur' }],
        Atype: [{ validator: checkAtype, trigger: 'blur' }]
      },
      isShow: false,
      searchHisForm: {
        interval: 1,
        time: '',
        start: '',
        end: ''
      },

      pointFormDialog: false,
      pointForm: {
        points: [
          {
            value: ''
          }
        ]
      },
      CarTagOptions: []
    }
  },
  computed: {
    carInfo() {
      return this.$store.state.monitor.coldcarData
    },
    projectId() {
      return this.$store.state.app.pid
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  async mounted() {
    // this.isShow=false
    BaiduMap.init().then(BMap => {
      this.map = new BMap.Map('track-container', { enableMapClick: false })
      this.map.setMapStyle({ style: 'googlelite' })
      const point = new BMap.Point(116.404, 39.915)
      this.map.centerAndZoom(point, 14)
      // 地图禁用滚轮放大缩小和拖拽
      this.map.disableDragging()
      this.map.disableScrollWheelZoom()
    })
    // 获取冷藏车详情
    await this.fetchcarInfo()
    if (!this.car_info.sn) {
      this.$message('该车辆未绑定轨迹采集设备')
    } else {
      await this.fetchcurrentPosition()
    }
    await carDataInfo({
      carId: this.car_info.Id
    })
      .then(res => {
        if (res.data.Code === 200) {
          this.carData = res.data.Data
          this.pointList = []
          this.carData.forEach(item => {
            this.pointList.push(item.point)
          })
        } else {
          clearInterval(this.cardatainfoTimer)
        }
      })
      .catch(err => {
        console.error(err)
      })

    // 初始化开始时间为当前时间减4小时 结束时间为当前时间
    const end = new Date().format('yyyy/MM/dd hh:mm')
    const start = new Date(new Date().getTime() - 4 * 3600 * 1000).format(
      'yyyy/MM/dd hh:mm'
    )
    this.searchHisForm.time = [new Date(start), new Date(end)]
    this.searchHisForm.start = start
    this.searchHisForm.end = end
    // 获取冷藏车点位图表数据
    if (this.pointList.length) {
      await this.fetchchartData(start, end)
    } else {
      this.isShow = true
    }
    // },200)

    if (this.car_info.CarSnType === 1) {
      getCarTagDropdownList({
        projectId: this.projectId,
        carId: this.$route.query.carId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.CarTagOptions = [
              ...data.CarSensorDropdown,
              ...data.UnusedSensorDropdown
            ]
            this.pointForm.points = data.CarSensorDropdown.map(item => {
              return {
                value: item.Value,
                canNotDelete: Boolean(item.AlarmSet)
              }
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  },
  beforeDestroy() {
    clearInterval(this.cardatainfoTimer)
    clearInterval(this.currentpositionTimer)
  },
  methods: {
    cancelInput(val) {
      if (val === 1) {
        this.confirmCompany = false
        this.companybtnShow = false
      } else if (val === 2) {
        this.confirmType = false
        this.typebtnShow = false
      } else if (val === 3) {
        this.confirmPerson = false
        this.personbtnShow = false
      } else if (val === 4) {
        this.confirmRefriger = false
        this.refrigerbtnShow = false
      } else if (val === 5) {
        this.confirmPhone = false
        this.phonebtnShow = false
      } else if (val === 6) {
        this.confirmAtype = false
        this.brandbtnShow = false
      }
      // this.$refs['car_info'].resetFields()
      this.fetchcarInfo()
    },
    handleHover(val) {
      if (!this.companybtnShow && val === 1) {
        this.companyShow = true
      } else if (!this.typebtnShow && val === 2) {
        this.typeShow = true
      } else if (!this.personbtnShow && val === 3) {
        this.personShow = true
      } else if (!this.refrigerbtnShow && val === 4) {
        this.refrigerShow = true
      } else if (!this.phonebtnShow && val === 5) {
        this.phoneShow = true
      } else if (!this.brandbtnShow && val === 6) {
        this.brandShow = true
      }
    },
    handleTime(val) {
      if (val) {
        this.searchHisForm.start = val[0]
        this.searchHisForm.end = val[1]
      }
    },
    switchcarType(val) {
      if (val === 1) {
        this.companybtnShow = true
        this.companyShow = false
      } else if (val === 2) {
        this.typebtnShow = true
        this.typeShow = false
        if (this.car_info.Type === '0' || this.car_info.Type === '1') {
          this.confirmType = true
        }
      } else if (val === 3) {
        this.personbtnShow = true
        this.personShow = false
      } else if (val === 4) {
        this.refrigerbtnShow = true
        this.refrigerShow = false
      } else if (val === 5) {
        this.phonebtnShow = true
        this.phoneShow = false
      } else {
        this.brandbtnShow = true
        this.brandShow = false
      }
    },
    confirmcarInfo(val) {
      this.updatecardataInfo(val)
    },
    // 获取冷藏车详情
    fetchcarInfo(val) {
      let promise = new Promise(resolve => {
        getCarInfo({
          carId: this.car_info.Id
        }).then(res => {
          this.$refs['car_info'].resetFields()
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.car_info.carNumber = data.CarNumber
            this.car_info.Company = data.Company
            this.car_info.Type = data.Type
            this.car_info.Contact = data.Contact
            this.car_info.Mobile = data.Mobile
            this.car_info.Refriger = data.Refriger
            this.car_info.Brand = data.Brand
            this.car_info.Atype = data.AType
            this.car_info.sn = data.CarSn
            this.car_info.CarSnType = data.CarSnType
            if (val === 1) {
              this.confirmCompany = true
              this.companybtnShow = false
            } else if (val === 2) {
              this.confirmType = true
              this.typebtnShow = false
            } else if (val === 3) {
              this.confirmPerson = true
              this.personbtnShow = false
            } else if (val === 4) {
              this.confirmRefriger = true
              this.refrigerbtnShow = false
            } else if (val === 5) {
              this.confirmPhone = true
              this.phonebtnShow = false
            } else if (val === 6) {
              this.confirmAtype = true
              this.brandbtnShow = false
            }
            resolve({ flag: 'success', val: this.car_info.sn })
          } else {
            resolve({ flag: 'error', val: '' })
          }
        })
      })
      return promise
    },
    // 编辑更新冷藏车详情数据
    updatecardataInfo(val) {
      const {
        Mobile,
        Contact,
        Id,
        Brand,
        Refriger,
        Type,
        AType,
        Company
      } = this.car_info
      updateCarInfo({
        CarId: Id,
        Company,
        Contact,
        Mobile,
        Brand,
        Refriger,
        Type,
        AType
      })
        .then(res => {
          if (res.data.Code !== 200) {
            this.$message.error('车辆信息更新失败')
          }
          this.fetchcarInfo(val)
        })
        .catch(err => {
          console.error(err)
          this.$message.error('车辆信息更新失败')
        })
    },
    // 获取设备实时位置
    fetchcurrentPosition() {
      let promise = new Promise(resolve => {
        forwardBaiduGetlatestpoint({
          service_id: this.carInfo.sid,
          entity_name: this.car_info.sn
        }).then(res => {
          if (res.data.latest_point && res.data.latest_point.longitude) {
            resolve({ flag: 'success', val: res.data.latest_point })
            this.map.clearOverlays()
            let data = res.data.latest_point
            const point = new BMap.Point(data.longitude, data.latitude)
            this.map.panTo(point)
            const icon = new BMap.Icon(
              'https://cdn.sinocold.net/images/baiduMap/currentPos.png',
              new BMap.Size(40, 47),
              { anchor: new BMap.Size(20, 13) }
            )
            const marker = new BMap.Marker(point, { icon: icon })
            this.map.addOverlay(marker)
            if (!this.currentpositionTimer) {
              this.currentpositionTimer = setInterval(
                this.fetchcurrentPosition,
                1000 * 30
              )
            }
          } else {
            resolve({ flag: 'error', val: '' })
            this.$message('查询车辆实时位置失败')
            clearInterval(this.currentpositionTimer)
          }
        })
      })
      return promise
    },
    search(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.isShow = false
          this.$refs[formName].clearValidate()
          this.historyLoading = true
          this.fetchchartData(this.searchHisForm.start, this.searchHisForm.end)
        } else {
          return false
        }
      })
    },
    // 获取冷藏车点位历史数据
    fetchchartData(start, end) {
      let promise = new Promise(resolve => {
        getHistoryData({
          start: start,
          end: end,
          pointIdList: this.pointList,
          tmes: this.searchHisForm.interval
        })
          .then(res => {
            if (res.data.Code === 200) {
              const data = res.data.Data.PointList
              let temperatureList = []
              let humidityList = []
              let series = []
              let legendList = []
              // 分别构造温度数据与湿度数据
              data.forEach(item => {
                legendList.push(item.PointName)
                if (item.Unit === '℃') {
                  temperatureList.push(item)
                } else {
                  humidityList.push(item)
                }
                for (
                  let i = 0, length = item.DataList.length;
                  i < length;
                  i++
                ) {
                  item.DataList[i] = [
                    item.DataList[i].Time,
                    item.DataList[i].Value
                  ]
                }
              })

              if (temperatureList.length) {
                temperatureList.forEach(item => {
                  series.push({
                    name: item.PointName,
                    type: 'line',
                    data: item.DataList
                  })
                })
              }
              if (humidityList.length) {
                humidityList.forEach(item => {
                  series.push({
                    name: item.pointname,
                    type: 'line',
                    yAxisIndex: 1,
                    data: item.DataList
                  })
                })
              }
              // 判断温度和湿度数组是否为空，如果为空，图表则只存在一个Y轴，如果都不为空，则图表存在两个Y轴
              if (humidityList.length && temperatureList.length) {
                const yAxisConfig = [
                  {
                    type: 'value',
                    name: '温度 ℃',
                    position: 'left',
                    min: value => {
                      return value.min
                    }
                  },
                  {
                    splitLine: { show: false },
                    type: 'value',
                    name: '湿度 %',
                    position: 'right',
                    boundaryGap: ['20%', '20%'],
                    scale: true
                  }
                ]
                this.chartData = series
                this.drawChart(legendList, yAxisConfig)
              } else if (humidityList.length || temperatureList.length) {
                const yAxisConfig = [
                  {
                    type: 'value',
                    name: temperatureList.length ? '温度 ℃' : '湿度 %',
                    position: 'left',
                    boundaryGap: ['20%', '20%'],
                    scale: true
                  }
                ]
                this.chartData = series
                this.drawChart(legendList, yAxisConfig)
              } else {
                this.chartData = []
                this.isShow = true
              }
            } else {
              resolve({ flag: 'error', val: {} })
              this.history_chart && this.history_chart.dispose()
              this.isShow = true
              this.historyLoading = false
            }
          })
          .catch(err => {
            this.$message.error('历史数据查询失败')
            this.isShow = true
            this.historyLoading = false
            console.error(err)
          })
      })
      return promise
    },
    removeInput(index) {
      this.pointForm.points.splice(index, 1)
    },
    addInput() {
      this.pointForm.points.push({
        value: ''
      })
    },
    // 判断能不能删除
    handleEditAble(value) {
      const temp = this.CarTagOptions.find(item => item.Value === value)
      if (temp) {
        // 大于0说明设置了报警
        return !(temp.AlarmSet > 0)
      } else {
        return true
      }
    },
    // 判断选项的disabled属性
    handleSelectDisabled(value, options) {
      return Boolean(options.find(item => item.value === value))
    },
    submitPointForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          batchAddCarTag({
            modelTreeId: this.$route.query.carId,
            tagList: this.pointForm.points.map(item => item.value)
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('修改成功')
                this.pointFormDialog = false
                const { fullPath } = this.$route
                this.$router.replace({
                  path: '/redirect' + fullPath
                })
              } else {
                this.$message.error('修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('修改失败')
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    // 历史图表配置
    drawChart(legendList, yAxisConfig) {
      this.history_chart = echarts.init(
        document.getElementById('historydata_chart')
      )
      this.history_chart.setOption({
        color: [
          '#2297E8',
          '#48CE38',
          '#F8D156',
          '#FD9827',
          '#9764DC',
          '#339999',
          '#50c2c2',
          '#abd4dd',
          '#7b98c1',
          '#84b5ef',
          '#ffc281',
          '#ff8080'
        ],
        grid: {
          left: 50,
          right: 50,
          bottom: 100,
          top: 80
        },
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0]
          },
          {
            id: 'dataZoomX',
            type: 'slider',
            xAxisIndex: [0],
            filterMode: 'filter' // 设定为 'filter' 从而 X 的窗口变化会影响 Y 的范围。
          }
        ],
        toolbox: {
          right: 20,
          feature: {
            saveAsImage: {
              // icon:'image://https://dn-coding-net-production-file.qbox.me/cabfb120-917d-11e8-a3da-cb8ebb792789.png?e=1532686614&token=goE9CtaiT5YaIP6ZQ1nAafd_C1Z_H2gVP8AwuC-5:TC34quExpltjByWHnla8X1NZe-U='
            }
          }
        },
        legend: {
          show: true,
          data: this.chartData.length === 0 ? '' : legendList,
          bottom: 40
        },
        title: {
          text: this.chartData.length === 0 ? '暂无数据' : '',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const colorSpan = color =>
              `<i class="circlepoint" style="background: ${color}"></i>`
            let text =
              this._dateFormat(params[0].axisValue, 'YYYY-MM-DD HH:mm') +
              '<br/>'
            for (let i = 0; i < params.length; i++) {
              text += `${colorSpan(params[i].color)} ${params[i].seriesName}：${
                params[i].value[1] === null ? '无数据' : params[i].value[1]
              } <br/>`
            }
            return text
          }
        },
        xAxis: {
          show: this.chartData.length !== 0,
          type: 'time',
          splitLine: {
            show: false
          }
        },
        yAxis: yAxisConfig,
        series: this.chartData
      })
      this.historyLoading = false
      window.addEventListener('resize', this.history_chart.resize)
      window.onresize = this.history_chart.resize
    }
  }
}
</script>
<style lang="scss" scoped>
.car-information {
  // padding: 10px;
  .car-info_details {
    background: #fff;
    // height: 180px;
    border-radius: 4px;
    .info-details_title {
      line-height: 48px;
      padding-left: 24px;
      border-bottom: 1px solid #fafafa;
      font-weight: 500;
      .car-title_wrapper {
        display: inline-block;
        .car-title_photo {
          width: 36px;
          height: 36px;
          vertical-align: -10px;
          margin-right: 10px;
        }
        .car-title_name {
          font-size: 16px;
          font-weight: 600;
        }
      }
    }
    .info-details_wrapper {
      padding-left: 44px;
      box-sizing: border-box;
      margin-top: 10px;
    }
    .info-details_item {
      line-height: 35px;
      .details-line_title {
        width: 70px;
        display: inline-block;
        text-align: right;
      }
      .edit-line {
        width: 180px;
      }
      &:after {
        content: '';
        clear: both;
        display: table;
      }
      .info-details_line {
        float: left;
        width: 50%;
        position: relative;
      }
    }
  }
}
.car-info_track {
  // padding: 10px;
  box-sizing: border-box;
  .car-track_wrapper {
    background: #fff;
    padding: 10px;
    display: block;
    border-radius: 4px;
    #track-container {
      min-width: 280px;
      height: 189px;
    }
  }
}
.car-status_title {
  line-height: 50px;
  background: #fff;
  // margin-top: 20px;
  padding-left: 24px;
  border-bottom: 1px solid #fafafa;
  font-weight: 500;
  .car-status_text {
    font-size: 16px;
    font-weight: 600;
  }
}
.car-status {
  padding: 20px 10px;
  box-sizing: border-box;
  display: flex;
  background: #fff;
  .car-status_value {
    text-align: center;
    flex: 1 1 auto;
    // border-right: 1px solid #BBBBBB;
    &:last-child {
      border-right: none;
    }
    .car-status_inside {
      display: flex;
      justify-content: center;
    }
    .status-value_title {
      color: #949494;
      font-size: 16px;
    }
    .status-value_num {
      font-size: 20px;
      margin: 10px 0;
    }
    .status-value_circle {
      border-radius: 50%;
      width: 74px;
      height: 74px;
      line-height: 74px;
      color: #fff;
      font-weight: 500;
      font-size: 16px;
      margin-right: 13px;
    }
    .temperature-circle {
      background: linear-gradient(to bottom, #d7b9fe, #b07eed);
    }
    .humid-circle {
      background: linear-gradient(to bottom, #ffd079, #ffae52);
    }
  }
}
.car-historyData {
  background: #fff;
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
  .historydata-wrapper {
    padding: 20px;
    box-sizing: border-box;
  }
  .historydata-wrapper_header {
    padding: 10px 20px;
    .historydata_queryBtn {
      vertical-align: 0;
      margin-left: 10px;
    }
  }
  #historydata_chart {
    height: 400px;
    width: 100%;
  }
}
.car-status-wrapper {
  border-radius: 4px;
  overflow: hidden;
}
.blueColor {
  color: #1890ff;
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  right: 35px;
  top: 8px;
}
.blueColor2 {
  color: #1890ff;
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  right: 0px;
  top: 8px;
}
.cancelIcon {
  color: #1890ff;
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 8px;
}
</style>
<style lang="scss">
.brand-form_item,
.atype-form_item {
  float: left;
  position: relative;
  box-sizing: border-box;
  line-height: 32px;
}
.atype-form_item .el-form-item__content {
  margin-left: 30px !important;
}
.lastEdit {
  color: #1890ff;
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 8px;
}
.placehold_photo {
  height: 400px;
  width: 100%;
  background-size: cover;
  background: url('https://cdn.sinocold.net/images/no-data.png')
    center center no-repeat;
}
.historydata-wrapper {
  .el-form-item {
    margin-bottom: 0;
  }
  .circlepoint {
    display: inline-block;
    width: 0.6em;
    height: 0.6em;
    margin-right: 5px;
    border-radius: 50%;
  }
}
.carinfoForm {
  .el-form-item__label {
    white-space: pre;
  }
}
</style>
