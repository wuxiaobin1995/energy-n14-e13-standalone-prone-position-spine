/*
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 09:16:02
 * @LastEditTime: 2023-05-23 16:13:06
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

  {
    path: '/',
    name: 'layout',
    component: () => import('@/layout'),
    redirect: '/home',
    children: [
      // 首页
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home'),
        meta: ['首页']
      },
      // 用户
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/user'),
        meta: ['用户']
      },
      // 导出所选用户的数据（测试、训练）
      {
        path: 'user-data-output',
        name: 'user-data-output',
        component: () => import('@/views/user-data-output'),
        meta: ['导出所选用户的数据']
      },
      // 添加用户
      {
        path: 'user-add',
        name: 'user-add',
        component: () => import('@/views/user-add'),
        meta: ['添加用户']
      },
      // 用户信息修改
      {
        path: 'user-edit',
        name: 'user-edit',
        component: () => import('@/views/user-edit'),
        meta: ['用户信息修改']
      },
      // 设置医院名称
      {
        path: 'set-hospital',
        name: 'set-hospital',
        component: () => import('@/views/set/set-hospital'),
        meta: ['设置医院名称']
      },
      // 开发者
      {
        path: 'set-developer',
        name: 'set-developer',
        component: () => import('@/views/set/set-developer'),
        meta: ['开发者']
      },
      // 数据迁移
      {
        path: 'set-data-migration',
        name: 'set-data-migration',
        component: () => import('@/views/set/set-data-migration'),
        meta: ['数据迁移']
      },
      // 游戏
      {
        path: 'game',
        name: 'game',
        component: () => import('@/views/game'),
        meta: ['游戏']
      },

      /* 测试模式 */
      // 骨盆灵活度测试-动作展示
      {
        path: 'test-flexibility-show',
        name: 'test-flexibility-show',
        component: () => import('@/views/test-mode/flexibility/show'),
        meta: ['骨盆灵活度测试-动作展示']
      },
      // 骨盆灵活度测试-内核心是什么
      {
        path: 'test-flexibility-what',
        name: 'test-flexibility-what',
        component: () => import('@/views/test-mode/flexibility/what'),
        meta: ['骨盆灵活度测试-内核心是什么']
      },
      // 骨盆灵活度测试-内核心训练的好处
      {
        path: 'test-flexibility-why',
        name: 'test-flexibility-why',
        component: () => import('@/views/test-mode/flexibility/why'),
        meta: ['骨盆灵活度测试-内核心训练的好处']
      },
      // 骨盆灵活度测试-具体测量
      {
        path: 'test-flexibility-measure',
        name: 'test-flexibility-measure',
        component: () => import('@/views/test-mode/flexibility/measure'),
        meta: ['骨盆灵活度测试-具体测量']
      },

      /* 训练模式 */
      // 训练项目选择
      {
        path: 'train-select',
        name: 'train-select',
        component: () => import('@/views/train-mode'),
        meta: ['训练项目选择'],
        redirect: '/train-select/abdominal-respiration-set',
        children: [
          // 腹式呼吸训练-参数设置
          {
            path: 'abdominal-respiration-set',
            name: 'abdominal-respiration-set',
            component: () =>
              import('@/views/train-mode/abdominal-respiration/set'),
            meta: ['腹式呼吸训练-参数设置']
          },
          // 活动度训练-参数设置
          {
            path: 'activity-improvement-set',
            name: 'activity-improvement-set',
            component: () =>
              import('@/views/train-mode/activity-improvement/set'),
            meta: ['活动度训练-参数设置']
          },
          // 内核心激活训练-参数设置
          {
            path: 'stabilizer-activation-set',
            name: 'stabilizer-activation-set',
            component: () =>
              import('@/views/train-mode/stabilizer-activation/set'),
            meta: ['内核心激活训练-参数设置']
          },
          // 本体感觉训练-参数设置
          {
            path: 'deep-sensory-set',
            name: 'deep-sensory-set',
            component: () => import('@/views/train-mode/deep-sensory/set'),
            meta: ['本体感觉训练-参数设置']
          },
          // 静态稳定训练-参数设置
          {
            path: 'static-set',
            name: 'static-set',
            component: () => import('@/views/train-mode/static/set'),
            meta: ['静态稳定训练-参数设置']
          },
          // 动态稳定训练-参数设置
          {
            path: 'dynamic-set',
            name: 'dynamic-set',
            component: () => import('@/views/train-mode/dynamic/set'),
            meta: ['动态稳定训练-参数设置']
          }
        ]
      },
      // 腹式呼吸训练-具体测量
      {
        path: 'abdominal-respiration-measure',
        name: 'abdominal-respiration-measure',
        component: () =>
          import('@/views/train-mode/abdominal-respiration/measure'),
        meta: ['腹式呼吸训练-具体测量']
      },
      // 活动度训练-具体测量
      {
        path: 'activity-improvement-measure',
        name: 'activity-improvement-measure',
        component: () =>
          import('@/views/train-mode/activity-improvement/measure'),
        meta: ['活动度训练-具体测量']
      },
      // 内核心激活训练-具体测量
      {
        path: 'stabilizer-activation-measure',
        name: 'stabilizer-activation-measure',
        component: () =>
          import('@/views/train-mode/stabilizer-activation/measure'),
        meta: ['内核心激活训练-具体测量']
      },
      // 本体感觉训练-具体测量
      {
        path: 'deep-sensory-measure',
        name: 'deep-sensory-measure',
        component: () => import('@/views/train-mode/deep-sensory/measure'),
        meta: ['本体感觉训练-具体测量']
      },
      // 静态稳定训练-具体测量
      {
        path: 'static-measure',
        name: 'static-measure',
        component: () => import('@/views/train-mode/static/measure'),
        meta: ['静态稳定训练-具体测量']
      },
      // 动态稳定训练-具体测量
      {
        path: 'dynamic-measure',
        name: 'dynamic-measure',
        component: () => import('@/views/train-mode/dynamic/measure'),
        meta: ['动态稳定训练-具体测量']
      },

      /* 数据记录 */
      // 测试
      {
        path: 'test-record',
        name: 'test-record',
        component: () => import('@/views/record/test'),
        meta: ['测试-数据记录'],
        redirect: '/test-record/flexibility',
        children: [
          // 骨盆灵活度测试
          {
            path: 'flexibility',
            name: 'test-flexibility-record',
            component: () => import('@/views/record/test/flexibility'),
            meta: ['骨盆灵活度测试']
          }
        ]
      },
      // 训练
      {
        path: 'train-record',
        name: 'train-record',
        component: () => import('@/views/record/train'),
        meta: ['训练-数据记录'],
        redirect: '/train-record/abdominal-respiration',
        children: [
          // 腹式呼吸训练
          {
            path: 'abdominal-respiration',
            name: 'train-abdominal-respiration-record',
            component: () =>
              import('@/views/record/train/abdominal-respiration'),
            meta: ['腹式呼吸训练']
          },
          // 活动度训练
          {
            path: 'activity-improvement',
            name: 'train-activity-improvement-record',
            component: () =>
              import('@/views/record/train/activity-improvement'),
            meta: ['活动度训练']
          },
          // 内核心激活训练
          {
            path: 'stabilizer-activation',
            name: 'train-stabilizer-activation-record',
            component: () =>
              import('@/views/record/train/stabilizer-activation'),
            meta: ['内核心激活训练']
          },
          // 本体感觉训练
          {
            path: 'deep-sensory',
            name: 'train-deep-sensory-record',
            component: () => import('@/views/record/train/deep-sensory'),
            meta: ['本体感觉训练']
          },
          // 静态稳定训练
          {
            path: 'static',
            name: 'train-static-record',
            component: () => import('@/views/record/train/static'),
            meta: ['静态稳定训练']
          },
          // 动态稳定训练
          {
            path: 'dynamic',
            name: 'train-dynamic-record',
            component: () => import('@/views/record/train/dynamic'),
            meta: ['动态稳定训练']
          }
        ]
      }
    ]
  },

  /* 测试报告 */
  // 骨盆灵活度测试-导出PDF
  {
    path: '/test-flexibility-pdf',
    name: 'test-flexibility-pdf',
    component: () => import('@/views/test-mode/flexibility/pdf'),
    meta: ['骨盆灵活度测试-导出PDF']
  },
  // 骨盆灵活度测试-导出长期趋势PDF
  {
    path: '/test-flexibility-secular-trend-pdf',
    name: 'test-flexibility-secular-trend-pdf',
    component: () =>
      import('@/views/record/test/flexibility/secular-trend-pdf'),
    meta: ['骨盆灵活度测试-导出长期趋势PDF']
  },

  /* 训练报告 */
  // 腹式呼吸训练-导出PDF
  {
    path: '/train-abdominal-respiration-pdf',
    name: 'train-abdominal-respiration-pdf',
    component: () => import('@/views/train-mode/abdominal-respiration/pdf'),
    meta: ['腹式呼吸训练-导出PDF']
  },
  // 腹式呼吸训练-导出长期趋势PDF
  {
    path: '/train-abdominal-respiration-secular-trend-pdf',
    name: 'train-abdominal-respiration-secular-trend-pdf',
    component: () =>
      import('@/views/record/train/abdominal-respiration/secular-trend-pdf'),
    meta: ['腹式呼吸训练-导出长期趋势PDF']
  },

  // 活动度训练-导出PDF
  {
    path: '/train-activity-improvement-pdf',
    name: 'train-activity-improvement-pdf',
    component: () => import('@/views/train-mode/activity-improvement/pdf'),
    meta: ['活动度训练-导出PDF']
  },
  // 活动度训练-导出长期趋势PDF
  {
    path: '/train-activity-improvement-secular-trend-pdf',
    name: 'train-activity-improvement-secular-trend-pdf',
    component: () =>
      import('@/views/record/train/activity-improvement/secular-trend-pdf'),
    meta: ['活动度训练-导出长期趋势PDF']
  },

  // 内核心激活训练-导出PDF
  {
    path: '/train-stabilizer-activation-pdf',
    name: 'train-stabilizer-activation-pdf',
    component: () => import('@/views/train-mode/stabilizer-activation/pdf'),
    meta: ['内核心激活训练-导出PDF']
  },
  // 内核心激活训练-导出长期趋势PDF
  {
    path: '/train-stabilizer-activation-secular-trend-pdf',
    name: 'train-stabilizer-activation-secular-trend-pdf',
    component: () =>
      import('@/views/record/train/stabilizer-activation/secular-trend-pdf'),
    meta: ['内核心激活训练-导出长期趋势PDF']
  },

  // 本体感觉训练-导出PDF
  {
    path: '/train-deep-sensory-pdf',
    name: 'train-deep-sensory-pdf',
    component: () => import('@/views/train-mode/deep-sensory/pdf'),
    meta: ['本体感觉训练-导出PDF']
  },
  // 本体感觉训练-导出长期趋势PDF
  {
    path: '/train-deep-sensory-secular-trend-pdf',
    name: 'train-deep-sensory-secular-trend-pdf',
    component: () =>
      import('@/views/record/train/deep-sensory/secular-trend-pdf'),
    meta: ['本体感觉训练-导出长期趋势PDF']
  },

  // 静态稳定训练-导出PDF
  {
    path: '/train-static-pdf',
    name: 'train-static-pdf',
    component: () => import('@/views/train-mode/static/pdf'),
    meta: ['静态稳定训练-导出PDF']
  },
  // 静态稳定训练-导出长期趋势PDF
  {
    path: '/train-static-secular-trend-pdf',
    name: 'train-static-secular-trend-pdf',
    component: () => import('@/views/record/train/static/secular-trend-pdf'),
    meta: ['静态稳定训练-导出长期趋势PDF']
  },

  // 动态稳定训练-导出PDF
  {
    path: '/train-dynamic-pdf',
    name: 'train-dynamic-pdf',
    component: () => import('@/views/train-mode/dynamic/pdf'),
    meta: ['动态稳定训练-导出PDF']
  },
  // 动态稳定训练-导出长期趋势PDF
  {
    path: '/train-dynamic-secular-trend-pdf',
    name: 'train-dynamic-secular-trend-pdf',
    component: () => import('@/views/record/train/dynamic/secular-trend-pdf'),
    meta: ['动态稳定训练-导出长期趋势PDF']
  },

  {
    path: '/refresh',
    name: 'refresh',
    component: () => import('@/views/refresh')
  },

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
