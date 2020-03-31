import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('views/Login')
  },
  {
    path: '/home',
    component: () => import('views/Home'),
    children: [
      {
        path: '',
        redirect: '/welcome'
      },
      {
        path: '/welcome',
        component: () => import('views/homechild/Welcome')
      },
      {
        path: '/users',
        component: () => import('views/user/Users')
      },
      {
        path: '/rights',
        component: () => import('views/power/Rights')
      },
      {
        path: '/roles',
        component: () => import('views/power/Roles')
      },
      {
        path: '/categories',
        component: () => import('views/goods/Categories')
      },
      {
        path: '/params',
        component: () => import('views/goods/Params')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})
//导航守卫
router.beforeEach((to, from, next) => {
  // to 将要跳转到哪个页面
  // from 从哪个页面跳转来
  // next()执行下一步（放行）
  if(to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token');
  // 判断是否有token 没有就强制到登录界面
  if(!tokenStr) return next('/login');
  next()
})
export default router
