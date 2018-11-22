import Vue from 'vue'
import Router from 'vue-router'
import Medical from '@/views/medical/Medical'

Vue.use(Router)

export default new Router({
  /*mode: 'history',*/
  routes: [
    {
      path: '/',
      name: 'Medical',
      component: Medical
    }
  ]
})
