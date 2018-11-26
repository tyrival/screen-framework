import Vue from 'vue'
import Router from 'vue-router'
import Traffic from '@/views/traffic/Traffic'

Vue.use(Router)

export default new Router({
  /*mode: 'history',*/
  routes: [
    {
      path: '/',
      name: 'Traffic',
      component: Traffic
    }
  ]
})
