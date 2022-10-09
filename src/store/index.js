/*
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 09:16:02
 * @LastEditTime: 2022-01-19 11:01:15
 * @Description : vuex
 */
import Vue from 'vue'
import Vuex from 'vuex'
// import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  // plugins: [
  //   createPersistedState({
  //     key: 'vuex-persistedstate', // 自定义Storage中的Key名，默认是vuex
  //     storage: window.sessionStorage, // 使用sessionStorage来固化数据
  //     reducer(val) {
  //       return {
  //         facilityID: val.facilityID,
  //         isfacilityExpire: val.isfacilityExpire,
  //         facilityDeadline: val.facilityDeadline
  //       }
  //     }
  //   })
  // ],

  state: {
    /* 设备编号 */
    facilityID: '',
    /* 设备是否到期 */
    isfacilityExpire: 0, // 0到期，1未到期
    /* 设备到期时间 */
    facilityDeadline: '',

    /* 当前登录管理员 */
    currentAdmin: {
      adminId: '',
      adminPassword: ''
    },
    /* 当前登录用户 */
    currentUser: {
      userId: '',
      userName: '',
      birthday: '',
      sex: ''
    },
    /* 在查看用户报告中，所选择的用户id */
    selectUserId: '',

    /* 是否展开、折叠侧边菜单栏 */
    isCollapse: false, // 默认展开

    /* 最大、最小灵活度值 */
    bothFlexibility: {
      maxDepth: null,
      minDepth: null
    },

    /* 语音开关 */
    voiceSwitch: true,
    /* 语音基础地址 */
    voiceBaseSrc: 'mandarin' // 默认 mandarin 普通话，其次 Cantonese 粤语
  },

  mutations: {
    /* 设备编号 */
    SET_FACILITYID(state, facilityID) {
      state.facilityID = facilityID
    },
    /* 设备是否到期 */
    SET_ISFACILITYEXPIRE(state, isfacilityExpire) {
      state.isfacilityExpire = isfacilityExpire
    },
    /* 设备到期时间 */
    SET_FACILITYDEADLINE(state, facilityDeadline) {
      state.facilityDeadline = facilityDeadline
    },

    /* 当前登录管理员 */
    SET_CURRENTADMIN(state, newCurrentAdmin) {
      state.currentAdmin = newCurrentAdmin
    },
    /* 当前登录用户 */
    SET_CURRENTUSER(state, newCurrentUser) {
      state.currentUser = newCurrentUser
    },
    /* 在查看用户报告中，所选择的用户id */
    SET_SELECTUSERID(state, newSelectUserId) {
      state.selectUserId = newSelectUserId
    },

    /* 是否展开、折叠侧边菜单栏 */
    SET_ISCOLLAPSE(state, collapse) {
      state.isCollapse = collapse
    },

    /* 最大、最小灵活度值 */
    SET_BOTHFLEXIBILITY(state, newBothFlexibility) {
      state.bothFlexibility = newBothFlexibility
    },

    /* 语音开关 */
    SET_VOICESWITCH(state, voiceSwitch) {
      state.voiceSwitch = voiceSwitch
    },
    /* 语音基础地址 */
    SET_VOICEBASESRC(state, voiceBaseSrc) {
      state.voiceBaseSrc = voiceBaseSrc
    }
  },

  actions: {
    /* 设备编号 */
    setFacilityID({ commit }, facilityID) {
      return new Promise((resolve, reject) => {
        commit('SET_FACILITYID', facilityID)
        resolve()
      })
    },
    /* 设备是否到期 */
    setIsfacilityExpire({ commit }, isfacilityExpire) {
      return new Promise((resolve, reject) => {
        commit('SET_ISFACILITYEXPIRE', isfacilityExpire)
        resolve()
      })
    },
    /* 设备到期时间 */
    setFacilityDeadline({ commit }, facilityDeadline) {
      return new Promise((resolve, reject) => {
        commit('SET_FACILITYDEADLINE', facilityDeadline)
        resolve()
      })
    },

    /* 当前登录管理员 */
    setCurrentAdmin({ commit }, newCurrentAdmin) {
      return new Promise((resolve, reject) => {
        commit('SET_CURRENTADMIN', newCurrentAdmin)
        resolve()
      })
    },
    /* 当前登录用户 */
    setCurrentUser({ commit }, newCurrentUser) {
      return new Promise((resolve, reject) => {
        commit('SET_CURRENTUSER', newCurrentUser)
        resolve()
      })
    },
    /* 在查看用户报告中，所选择的用户id */
    setSelectUserId({ commit }, newSelectUserId) {
      return new Promise((resolve, reject) => {
        commit('SET_SELECTUSERID', newSelectUserId)
        resolve()
      })
    },

    /* 是否展开、折叠侧边菜单栏 */
    setIsCollapse({ commit }, collapse) {
      return new Promise((resolve, reject) => {
        commit('SET_ISCOLLAPSE', collapse)
        resolve()
      })
    },

    /* 最大、最小灵活度值 */
    setBothFlexibility({ commit }, newBothFlexibility) {
      return new Promise((resolve, reject) => {
        commit('SET_BOTHFLEXIBILITY', newBothFlexibility)
        resolve()
      })
    },

    /* 语音开关 */
    setVoiceSwitch({ commit }, voiceSwitch) {
      return new Promise((resolve, reject) => {
        commit('SET_VOICESWITCH', voiceSwitch)
        resolve()
      })
    },
    /* 语音基础地址 */
    setVoiceBaseSrc({ commit }, voiceBaseSrc) {
      return new Promise((resolve, reject) => {
        commit('SET_VOICEBASESRC', voiceBaseSrc)
        resolve()
      })
    }
  }
})
