<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 11:39:05
 * @LastEditTime: 2021-11-18 16:40:44
 * @Description : 头部状态栏
-->
<template>
  <div class="header-status-bar">
    <!-- 左边区域 -->
    <div class="left">
      <!-- 折叠展开按钮 -->
      <div class="header-status-bar__btn">
        <el-button
          class="header-status-bar__btn--fold"
          v-if="!this.$store.state.isCollapse"
          type="text"
          icon="el-icon-s-fold"
          @click="handleFold"
        ></el-button>
        <el-button
          class="header-status-bar__btn--unfold"
          v-else
          type="text"
          icon="el-icon-s-unfold"
          @click="handleUnFold"
        ></el-button>
      </div>

      <!-- 面包屑 -->
      <el-breadcrumb
        class="header-status-bar__breadcrumb"
        separator-class="el-icon-arrow-right"
      >
        <el-breadcrumb-item>当前位置</el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="(item, index) in this.$route.meta"
          :key="index"
        >
          {{ item }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 个人信息 -->
    <div class="header-status-bar__info">
      <!-- 下拉菜单 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="header-status-bar__info--avatar">
          <svg class="icon icon--size" aria-hidden="true">
            <use xlink:href="#icon-yonghu"></use>
          </svg>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="首页">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-shouye"></use>
            </svg>
            &nbsp;&nbsp;首页
          </el-dropdown-item>
          <el-dropdown-item divided command="退出登录">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-tuichudenglu"></use>
            </svg>
            &nbsp;&nbsp;退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- 姓名、性别等 -->
      <div
        v-if="this.$store.state.currentUser.userId"
        class="header-status-bar__info--name"
      >
        {{ this.$store.state.currentUser.userName }},
        {{ this.$store.state.currentUser.sex }}
      </div>
      <div v-else class="header-status-bar__info--name admin">管理员</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderStatusBar',

  methods: {
    /**
     * @description: 折叠侧边菜单栏按钮
     */
    handleFold() {
      this.$store.dispatch('setIsCollapse', true)
    },

    /**
     * @description: 展开侧边菜单栏按钮
     */
    handleUnFold() {
      this.$store.dispatch('setIsCollapse', false)
    },

    /**
     * @description: 点击菜单项触发的事件回调
     * @param {*} command 菜单项 key
     */
    handleCommand(command) {
      if (command === '首页') {
        this.$router.push({ path: '/layout/home' })
      } else if (command === '退出登录') {
        this.$confirm('退出当前账户?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        })
          .then(() => {
            this.$router.push({ path: '/' })
            this.$store.dispatch('setCurrentAdmin', {
              adminId: '',
              adminPassword: ''
            })
            this.$store.dispatch('setCurrentUser', {
              userId: '',
              userName: '',
              birthday: '',
              sex: ''
            })
            this.$store.dispatch('setBothFlexibility', {
              maxDepth: null,
              minDepth: null
            })
          })
          .catch(() => {})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header-status-bar {
  width: 100%;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.1);
  @include flex(row, space-between, center);

  /* 左边区域 */
  .left {
    @include flex(row, space-between, center);
    /* 折叠展开按钮 */
    .header-status-bar__btn {
      .header-status-bar__btn--fold,
      .header-status-bar__btn--unfold {
        font-size: 48px;
        margin: 0;
        padding: 0;
        color: #545c64;
      }
    }
    /* 面包屑 */
    .header-status-bar__breadcrumb {
      margin-left: 20px;
      font-size: 18px;
      font-weight: 700;
    }
  }

  /* 个人信息 */
  .header-status-bar__info {
    margin-right: 30px;
    @include flex(row, space-between, center);
    // 头像
    .header-status-bar__info--avatar {
      margin-right: 12px;
      .icon--size {
        font-size: 40px;
      }
    }
    // 姓名、性别等
    .header-status-bar__info--name {
      font-size: 18px;
    }
    .admin {
      color: red;
    }
  }
}
</style>
