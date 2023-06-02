/*
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 09:16:02
 * @LastEditTime: 2023-06-02 11:39:16
 * @Description : vuex
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /* 当前选择的用户及其信息 */
    currentUserInfo: {
      userId: '', // 唯一id
      userName: '', // 姓名
      sex: '', // 性别
      height: '', // 身高
      weight: '', // 体重
      birthday: '', // 出生日期
      remarks: '', // 备注
      lastLoginTime: '' // 最后登录时间
    },

    /* 最大、最小活动度值 */
    bothFlexibility: {
      maxDepth: null,
      minDepth: null
    },

    /* 训练方案的选项 */
    planSelect: [],

    /* 语音开关 */
    voiceSwitch: true
  },

  mutations: {
    /* 当前选择的用户及其信息 */
    CHANGE_CURRENTUSERINFO(state, currentUserInfo) {
      state.currentUserInfo = currentUserInfo
    },

    /* 最大、最小活动度值 */
    SET_BOTHFLEXIBILITY(state, bothFlexibility) {
      state.bothFlexibility = bothFlexibility
    },

    /* 训练方案的选项 */
    CHANGE_PLANSELECT(state, planSelect) {
      state.planSelect = planSelect
    },

    /* 语音开关 */
    SET_VOICESWITCH(state, voiceSwitch) {
      state.voiceSwitch = voiceSwitch
    }
  },

  actions: {
    /* 当前选择的用户及其信息 */
    changeCurrentUserInfo({ commit }, currentUserInfo) {
      return new Promise((resolve, reject) => {
        commit('CHANGE_CURRENTUSERINFO', currentUserInfo)
        resolve()
      })
    },

    /* 最大、最小活动度值 */
    setBothFlexibility({ commit }, bothFlexibility) {
      return new Promise((resolve, reject) => {
        commit('SET_BOTHFLEXIBILITY', bothFlexibility)
        resolve()
      })
    },

    /* 训练方案的选项 */
    changePlanSelect({ commit }, planSelect) {
      return new Promise((resolve, reject) => {
        commit('CHANGE_PLANSELECT', planSelect)
        resolve()
      })
    },

    /* 语音开关 */
    setVoiceSwitch({ commit }, voiceSwitch) {
      return new Promise((resolve, reject) => {
        commit('SET_VOICESWITCH', voiceSwitch)
        resolve()
      })
    }
  }
})
