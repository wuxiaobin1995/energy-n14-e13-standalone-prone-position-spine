/*
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 09:16:02
 * @LastEditTime: 2022-05-23 11:50:15
 * @Description : 路由
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  /*
   * 前面加"/"表示绝对路径，不加"/"表示相对路径
   * 一般嵌套路由中的子路由不需要加"/"，它会在父路由后自动加上"/子路由"
   * 比如父 "/father"，子 "child"，要想访问子路由，跳转链接需要写成 "/father/child"
   */

  /* 登录主页面 */
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/login')
  },

  /* 注册页面 */
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register')
  },

  /* 普通用户登录选择页面 */
  {
    path: '/login-select',
    name: 'login-select',
    component: () => import('@/views/login-select')
  },

  /* 布局组件 */
  {
    path: '/layout',
    name: 'layout',
    component: () => import('@/layout'),
    children: [
      // 首页
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home'),
        meta: ['首页']
      },
      // 个人信息修改
      {
        path: 'user-edit',
        name: 'user-edit',
        component: () => import('@/views/user-edit'),
        meta: ['个人信息修改']
      },
      // 用户管理
      {
        path: 'user-manage',
        name: 'user-manage',
        component: () => import('@/views/user-manage'),
        meta: ['用户管理']
      },
      // 管理员信息修改
      {
        path: 'admin-edit',
        name: 'admin-edit',
        component: () => import('@/views/admin-edit'),
        meta: ['管理员信息修改']
      },
      // 用户报告查看选择页
      {
        path: 'user-pdf-check',
        name: 'user-pdf-check',
        component: () => import('@/views/user-pdf-check'),
        meta: ['用户报告查看选择页']
      },
      // 用户测试报告
      {
        path: 'user-pdf-check-test',
        name: 'user-pdf-check-test',
        component: () => import('@/views/user-pdf-check/test-check'),
        meta: ['用户测试报告']
      },
      // 用户训练报告
      {
        path: 'user-pdf-check-train',
        name: 'user-pdf-check-train',
        component: () => import('@/views/user-pdf-check/train-check'),
        meta: ['用户训练报告']
      },
      // 设备信息
      {
        path: 'facility-info',
        name: 'facility-info',
        component: () => import('@/views/facility-info'),
        meta: ['设备信息']
      },
      // 开发者页面
      {
        path: 'developer',
        name: 'developer',
        component: () => import('@/views/developer'),
        meta: ['开发者页面']
      },

      /* 测试模式 */
      // 灵活性测试-描述页面
      {
        path: 'flexibility-test-des',
        name: 'flexibility-test-des',
        component: () => import('@/views/test-mode/flexibility-test/des'),
        meta: ['灵活性测试-描述页面']
      },
      // 灵活性测试-测量页面
      {
        path: 'flexibility-test-measure',
        name: 'flexibility-test-measure',
        component: () => import('@/views/test-mode/flexibility-test/measure'),
        meta: ['灵活性测试-测量页面']
      },
      // 灵活性测试-PDF报告
      {
        path: 'flexibility-test-pdf',
        name: 'flexibility-test-pdf',
        component: () => import('@/views/test-mode/flexibility-test/pdf'),
        meta: ['灵活性测试-PDF报告']
      },
      // 深感觉测试-参数设置页面
      {
        path: 'deep-sensory-test-set',
        name: 'deep-sensory-test-set',
        component: () => import('@/views/test-mode/deep-sensory-test/set'),
        meta: ['深感觉测试-参数设置页面']
      },
      // 深感觉测试-测量页面
      {
        path: 'deep-sensory-test-measure',
        name: 'deep-sensory-test-measure',
        component: () => import('@/views/test-mode/deep-sensory-test/measure'),
        meta: ['深感觉测试-测量页面']
      },
      // 深感觉测试-PDF报告
      {
        path: 'deep-sensory-test-pdf',
        name: 'deep-sensory-test-pdf',
        component: () => import('@/views/test-mode/deep-sensory-test/pdf'),
        meta: ['深感觉测试-PDF报告']
      },

      /* 训练模式 */
      // 内核心激活训练-参数设置页面
      {
        path: 'core-activation-train-set',
        name: 'core-activation-train-set',
        component: () => import('@/views/train-mode/core-activation-train/set'),
        meta: ['内核心激活训练-参数设置页面']
      },
      // 内核心激活训练-测量页面
      {
        path: 'core-activation-train-measure',
        name: 'core-activation-train-measure',
        component: () =>
          import('@/views/train-mode/core-activation-train/measure'),
        meta: ['内核心激活训练-测量页面']
      },
      // 活动度改善训练-参数设置页面
      {
        path: 'activity-improvement-train-set',
        name: 'activity-improvement-train-set',
        component: () =>
          import('@/views/train-mode/activity-improvement-train/set'),
        meta: ['活动度改善训练-参数设置页面']
      },
      // 活动度改善训练-测量页面
      {
        path: 'activity-improvement-train-measure',
        name: 'activity-improvement-train-measure',
        component: () =>
          import('@/views/train-mode/activity-improvement-train/measure'),
        meta: ['活动度改善训练-测量页面']
      },
      // 活动度改善训练-PDF报告
      {
        path: 'activity-improvement-train-pdf',
        name: 'activity-improvement-train-pdf',
        component: () =>
          import('@/views/train-mode/activity-improvement-train/pdf'),
        meta: ['活动度改善训练-PDF报告']
      },
      // 腹式呼吸训练-参数设置页面
      {
        path: 'abdominal-respiration-train-set',
        name: 'abdominal-respiration-train-set',
        component: () =>
          import('@/views/train-mode/abdominal-respiration-train/set'),
        meta: ['腹式呼吸训练-参数设置页面']
      },
      // 腹式呼吸训练-测量页面
      {
        path: 'abdominal-respiration-train-measure',
        name: 'abdominal-respiration-train-measure',
        component: () =>
          import('@/views/train-mode/abdominal-respiration-train/measure'),
        meta: ['腹式呼吸训练-测量页面']
      },
      // 腹式呼吸训练-PDF报告
      {
        path: 'abdominal-respiration-train-pdf',
        name: 'abdominal-respiration-train-pdf',
        component: () =>
          import('@/views/train-mode/abdominal-respiration-train/pdf'),
        meta: ['腹式呼吸训练-PDF报告']
      },
      // 静态训练-参数设置页面
      {
        path: 'static-train-set',
        name: 'static-train-set',
        component: () => import('@/views/train-mode/static-train/set'),
        meta: ['静态训练-参数设置页面']
      },
      // 静态训练-测量页面
      {
        path: 'static-train-measure',
        name: 'static-train-measure',
        component: () => import('@/views/train-mode/static-train/measure'),
        meta: ['静态训练-测量页面']
      },
      // 静态训练-PDF报告
      {
        path: 'static-train-pdf',
        name: 'static-train-pdf',
        component: () => import('@/views/train-mode/static-train/pdf'),
        meta: ['静态训练-PDF报告']
      },
      // 动态训练-参数设置页面
      {
        path: 'dynamic-train-set',
        name: 'dynamic-train-set',
        component: () => import('@/views/train-mode/dynamic-train/set'),
        meta: ['动态训练-参数设置页面']
      },
      // 动态训练-测量页面
      {
        path: 'dynamic-train-measure',
        name: 'dynamic-train-measure',
        component: () => import('@/views/train-mode/dynamic-train/measure'),
        meta: ['动态训练-测量页面']
      },
      // 动态训练-PDF报告
      {
        path: 'dynamic-train-pdf',
        name: 'dynamic-train-pdf',
        component: () => import('@/views/train-mode/dynamic-train/pdf'),
        meta: ['动态训练-PDF报告']
      },

      /* 数据记录 */
      /* 测试 */
      // 灵活性测试-数据记录
      {
        path: 'flexibility-test-record',
        name: 'flexibility-test-record',
        component: () => import('@/views/test-record/flexibility-test'),
        meta: ['灵活性测试-数据记录']
      },
      // 灵活性测试-长期趋势报告
      {
        path: 'flexibility-test-secular-trend-pdf',
        name: 'flexibility-test-secular-trend-pdf',
        component: () =>
          import('@/views/test-record/flexibility-test/secular-trend-pdf'),
        meta: ['灵活性测试-长期趋势报告']
      },
      // 深感觉测试-数据记录
      {
        path: 'deep-sensory-test-record',
        name: 'deep-sensory-test-record',
        component: () => import('@/views/test-record/deep-sensory-test'),
        meta: ['深感觉测试-数据记录']
      },
      /* 训练 */
      // 内核心激活训练-数据记录
      {
        path: 'core-activation-train-record',
        name: 'core-activation-train-record',
        component: () => import('@/views/train-record/core-activation-train'),
        meta: ['内核心激活训练-数据记录']
      },
      // 活动度改善训练-数据记录
      {
        path: 'activity-improvement-train-record',
        name: 'activity-improvement-train-record',
        component: () =>
          import('@/views/train-record/activity-improvement-train'),
        meta: ['活动度改善训练-数据记录']
      },
      // 活动度改善训练-长期趋势报告
      {
        path: 'activity-improvement-train-secular-trend-pdf',
        name: 'activity-improvement-train-secular-trend-pdf',
        component: () =>
          import(
            '@/views/train-record/activity-improvement-train/secular-trend-pdf'
          ),
        meta: ['活动度改善训练-长期趋势报告']
      },
      // 腹式呼吸训练-数据记录
      {
        path: 'abdominal-respiration-train-record',
        name: 'abdominal-respiration-train-record',
        component: () =>
          import('@/views/train-record/abdominal-respiration-train'),
        meta: ['腹式呼吸训练-数据记录']
      },
      // 腹式呼吸训练-长期趋势报告
      {
        path: 'abdominal-respiration-train-secular-trend-pdf',
        name: 'abdominal-respiration-train-secular-trend-pdf',
        component: () =>
          import(
            '@/views/train-record/abdominal-respiration-train/secular-trend-pdf'
          ),
        meta: ['腹式呼吸训练-长期趋势报告']
      },
      // 静态训练-数据记录
      {
        path: 'static-train-record',
        name: 'static-train-record',
        component: () => import('@/views/train-record/static-train'),
        meta: ['静态训练-数据记录']
      },
      // 静态训练-长期趋势报告
      {
        path: 'static-train-secular-trend-pdf',
        name: 'static-train-secular-trend-pdf',
        component: () =>
          import('@/views/train-record/static-train/secular-trend-pdf'),
        meta: ['静态训练-长期趋势报告']
      },
      // 动态训练-数据记录
      {
        path: 'dynamic-train-record',
        name: 'dynamic-train-record',
        component: () => import('@/views/train-record/dynamic-train'),
        meta: ['动态训练-数据记录']
      },
      // 动态训练-长期趋势报告
      {
        path: 'dynamic-train-secular-trend-pdf',
        name: 'dynamic-train-secular-trend-pdf',
        component: () =>
          import('@/views/train-record/dynamic-train/secular-trend-pdf'),
        meta: ['动态训练-长期趋势报告']
      }
    ]
  },

  /* 刷新中转页 */
  {
    path: '/refresh',
    name: 'refresh',
    component: () => import('@/views/refresh')
  },

  /* 路由出错时跳转至登录页 */
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  routes,
  /* 自定义路由切换时页面如何滚动 */
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 } // 回到顶部
  }
})

export default router
