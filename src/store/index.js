import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import Config from '../config/config'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    navigator: {
      index: {value: 0},
      // 一级菜单
      menu: [{
        name: '交通出行监测',
        url: './traffic',
        icon: '',
        // 当前激活的二级菜单
        index: {value: 0},
        // 二级菜单
        submenu: [{name: '总览'}, {name: '静态交通'}, {name: '动态交通'}, {name: '交通事件'}]
      }]
    },

    // 主题大屏组件状态
    screen: {
      // 交通专题
      traffic: {
        // 时间轴当前选择的年份
        timelineYear: {value: null},
      }
    }
  },
  mutations: {
    // 大屏组件注册和状态绑定
    [Config.MUTATIONS.REGISTER] (state, payload) {
      let store = _.get(state, payload.store)
      if (store === undefined) {
        _.set(state, payload.store, {
          value: null,
          observer: [{comp: payload.comp, prop: payload.prop}]
        })
      } else {
        !store.observer && (store.observer = [])
        // 查看当前组件和属性是否已经绑定
        let isExist = false;
        for (let i = 0; i < store.observer.length; i++) {
          let obs = store.observer[i];
          if (obs.comp === payload.comp && obs.prop === payload.prop) {
            isExist = true;
            break;
          }
        }
        // 如果没有绑定过，则进行绑定操作
        if (!isExist) {
          store.observer.push({comp: payload.comp, prop: payload.prop});
          _.set(payload.comp, payload.prop, store.value)
        }
      }
    },
    // 大屏状态修改
    [Config.MUTATIONS.MODIFY] (state, payload) {
      let store = _.get(state, payload.store)
      if (store === undefined) {
        return
      }
      _.set(state, payload.store + '.value', payload.value)
      if (!store.observer || !store.observer.length) {
        return
      }
      for (let i = 0; i < store.observer.length; i++) {
        let ob = store.observer[i]
        if (_.get(ob.comp, ob.prop) === payload.value) {
          continue
        }
        _.set(ob.comp, ob.prop, payload.value)
      }
    },
    // 大屏组件注销
    [Config.MUTATIONS.UNREGISTER] (state, payload) {
      let comp = payload.comp
      let binder = comp.binder
      for (let key in binder) {
        let obj = _.get(state, binder[key][1])
        let observer = obj.observer
        for (let i = observer.length - 1; i >= 0; i--) {
          let ob = observer[i]
          if (ob.comp == comp) {
            observer.splice(i, 1)
          }
        }
      }
    }
  }
})
