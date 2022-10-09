<!--
 * @Author      : Mr.bin
 * @Date        : 2022-10-08 10:51:46
 * @LastEditTime: 2022-10-08 11:03:58
 * @Description : 根组件
-->
<template>
  <div id="app" v-loading.fullscreen.lock="fullscreenLoading">
    <transition mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'App',

  data() {
    return {
      fullscreenLoading: false, // 全屏加载动效
      checkoutDateDeadlineClock: null, // 检验设备是否到期计时器
      resetOnlineTimeClock: null // 刷新设备在线状态计时器
    }
  },

  created() {
    /* 检验设备是否已完成注册 */
    this.checkoutFacilityID()
      .then(() => {
        /* 检验设备是否到期计时器，每隔1小时调用一次 */
        this.checkoutDateDeadline() // 开软件先调用一次
        this.checkoutDateDeadlineClock = setInterval(() => {
          this.checkoutDateDeadline()
        }, 3600000)
      })
      .then(() => {
        /* 刷新设备在线状态计时器，每隔25分钟调用一次 */
        this.resetOnlineTime() // 开软件先调用一次
        this.resetOnlineTimeClock = setInterval(() => {
          this.resetOnlineTime()
        }, 1500000)
      })
  },

  methods: {
    /**
     * @description: 检验设备是否已完成注册
     */
    checkoutFacilityID() {
      return new Promise((resolve, reject) => {
        const facilityID = window.localStorage.getItem('facilityID') // 找不到则返回null
        if (facilityID === null) {
          /* 未完成注册 */
          this.inputFacilityID(`该设备仍未注册，请输入设备编号：`)
        } else {
          /* 已完成注册，检验通过 */
          this.$store.dispatch('setFacilityID', facilityID).finally(() => {
            return resolve()
          })
        }
      })
    },

    /**
     * @description: 输入设备编号的弹框
     * @param {string} text 警告的文本内容
     */
    inputFacilityID(text) {
      this.$prompt(text, '警告', {
        type: 'warning',
        center: false, // 是否居中布局
        showClose: false, // 是否显示右上角关闭按钮
        showCancelButton: false, // 是否显示取消按钮
        closeOnClickModal: false, // 是否可通过点击遮罩关闭
        closeOnPressEscape: false, // 是否可通过按下 ESC 键关闭
        confirmButtonText: '确 定', // 确定按钮的文本内容
        inputPlaceholder: '设备编号格式如：HWXT-22001', // 输入框的占位符
        inputValue: 'HWXT-', // 输入框的初始文本
        inputPattern: /\S/, // 输入框的校验表达式（\S 匹配所有非空格符）
        inputErrorMessage: '请正确填写设备编号！' // 校验未通过时的提示文本
      })
        .then(({ value }) => {
          const val = value.replace(/\s+/g, '') // 去掉字符串中的所有空格
          this.registerFacilityID(`${val}`)
        })
        .catch(() => {})
    },

    /**
     * @description: 注册设备编号
     * @param {string} facilityID 设备编号
     */
    registerFacilityID(facilityID) {
      this.fullscreenLoading = true
      this.$axios
        .post('/registerDevicesName', {
          devices_name: facilityID
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 注册成功 */
            window.localStorage.setItem('facilityID', data.result.name) // 把设备编号保存在localStorage中
            this.$alert(
              `[状态码为 ${data.status}] 设备注册成功，请点击“刷新页面”按钮，以完成数据同步。`,
              '成功',
              {
                type: 'success',
                center: true,
                showClose: false,
                confirmButtonText: '刷 新 页 面',
                callback: () => {
                  window.location.reload()
                }
              }
            )
          } else if (data.status === -8) {
            /* 设备编号已存在 */
            this.inputFacilityID(
              `[状态码为 ${data.status}] 设备编号已存在，请重新输入：`
            )
          } else if (data.status === -11) {
            /* 传参错误 */
            this.inputFacilityID(
              `[状态码为 ${data.status}] [${data.message}] 传参错误，请重新输入：`
            )
          }
        })
        .catch(err => {
          this.$alert(
            `[注册设备编号环节] ${err}。请确保网络连接正常！`,
            '网络请求错误',
            {
              type: 'error',
              center: false, // 是否居中布局
              showClose: false, // 是否显示右上角关闭按钮
              confirmButtonText: '重 试', // 确定按钮的文本内容
              callback: () => {
                this.inputFacilityID(`该设备仍未注册，请输入设备编号：`)
              }
            }
          )
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 检验设备是否到期
     */
    checkoutDateDeadline() {
      const facilityID = window.localStorage.getItem('facilityID')
      this.fullscreenLoading = true
      this.$axios
        .post('/getDevicesData', {
          devices_name: facilityID
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            this.$store.dispatch(
              'setFacilityDeadline',
              `${data.result.end_time}`
            ) // 设备过期时间
            if (data.result.devices_usable === 1) {
              /* 未到期 */
              this.$store.dispatch('setIsfacilityExpire', 1)
            } else {
              /* 已到期 */
              this.$store.dispatch('setIsfacilityExpire', 0).finally(() => {
                this.$alert(
                  `设备编号为"${facilityID}"，请电话联系："${data.result.administrator_phone}"。续费成功后，点击关闭软件，再手动启动软件以完成数据同步。`,
                  '设备已到期',
                  {
                    type: 'warning',
                    center: true,
                    showClose: false,
                    confirmButtonText: '关闭软件',
                    callback: () => {
                      ipcRenderer.send('close') // 关闭整个程序
                    }
                  }
                )
              })
            }
          } else if (data.status === -9) {
            /* 设备编号不存在 */
            this.$alert(
              `[状态码为 ${data.status}] 该设备编号不存在，请重启软件！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '关闭软件',
                callback: () => {
                  ipcRenderer.send('close') // 关闭整个程序
                }
              }
            )
          } else if (data.status === -11) {
            /* 传参错误 */
            this.$alert(
              `[状态码为 ${data.status}] [${data.message}] 传参错误，请重启软件！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '关闭软件',
                callback: () => {
                  ipcRenderer.send('close') // 关闭整个程序
                }
              }
            )
          }
        })
        .catch(err => {
          this.$alert(
            `[检验设备是否到期环节] ${err}。请确保网络连接正常！`,
            '网络请求错误',
            {
              type: 'error',
              center: false,
              showClose: false,
              confirmButtonText: '重 试',
              callback: () => {
                this.checkoutDateDeadline()
              }
            }
          )
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 刷新设备在线状态
     */
    resetOnlineTime() {
      const facilityID = window.localStorage.getItem('facilityID')
      this.$axios.post('/resetOnlineTime', {
        devices_name: facilityID
      })
      // .then(res => {
      //   const data = res.data
      //   if (data.status === 1) {
      //     /* 成功 */
      //   } else if (data.status === 0) {
      //     /* 失败 */
      //     this.$alert(
      //       `[状态码为 ${data.status}] 刷新设备在线状态失败，请重启软件！`,
      //       '警告',
      //       {
      //         type: 'error',
      //         showClose: false,
      //         confirmButtonText: '关闭软件',
      //         callback: () => {
      //           ipcRenderer.send('close') // 关闭整个程序
      //         }
      //       }
      //     )
      //   } else if (data.status === -9) {
      //     /* 设备编号不存在 */
      //     this.$alert(
      //       `[状态码为 ${data.status}] 该设备编号不存在，请重启软件！`,
      //       '警告',
      //       {
      //         type: 'error',
      //         showClose: false,
      //         confirmButtonText: '关闭软件',
      //         callback: () => {
      //           ipcRenderer.send('close') // 关闭整个程序
      //         }
      //       }
      //     )
      //   } else if (data.status === -11) {
      //     /* 传参错误 */
      //     this.$alert(
      //       `[状态码为 ${data.status}] [${data.message}] 传参错误，请重启软件！`,
      //       '警告',
      //       {
      //         type: 'error',
      //         showClose: false,
      //         confirmButtonText: '关闭软件',
      //         callback: () => {
      //           ipcRenderer.send('close') // 关闭整个程序
      //         }
      //       }
      //     )
      //   }
      // })
      // .catch(err => {
      //   this.$alert(
      //     `[刷新设备在线状态环节] ${err}。请确保网络连接正常！`,
      //     '网络请求错误',
      //     {
      //       type: 'error',
      //       center: false,
      //       showClose: false,
      //       confirmButtonText: '重 试',
      //       callback: () => {
      //         this.resetOnlineTime()
      //       }
      //     }
      //   )
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
// 路由过渡动效
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s;
}
.v-enter,
.v-leave-to {
  opacity: 0;
}
</style>
