<template>
  <Base :config="config">
    <slot name="map-before"></slot>
    <!-- 用于管理通用的报表容器样式 -->
    <div :id="config.id"
         class="map-ins"
         :style="calcStyle">
    </div>
    <slot name="map-after"></slot>
  </Base>
</template>

<script>
  import Base from '@/components/base/Base';
  import Config from '../../config/config';
  import MapApp from '../../../static/lib/mapApp.js'
  import _ from 'lodash';

  export default {
    name: 'Map',
    props: ['config'],
    data () {
      return {
        map: null,
      };
    },
    created () {
      if (!this.config) {
        throw new Error('map：未声明config属性');
      }
      this.initBase();
    },
    mounted () {
      //this.render();
    },
    beforeDestroy () {
      // 销毁前注销组件的数据绑定
      this.$store.commit(Config.MUTATIONS.UNREGISTER, {
        comp: this
      });
    },
    computed: {
      /**
       * 计算样式
       */
      calcStyle () {
        return {
          position: 'position',
          top: this.config.base.style.top + 'px',
          left: this.config.base.style.left + 'px',
          width: this.config.base.style.width + 'px',
          height: this.config.base.style.height + 'px',
        };
      },
    },
    methods: {
      /**
       * 初始化基础属性
       */
      initBase () {
        this.config.id = this.config.id || 'map-' + new Date().getTime();
        this.config.base = _.assignIn({
          style: {width: 600, height: 400}
        }, this.config.base);
      },
      /**
       * 初始化组件
       */
      render () {
        let mapNode = document.getElementById(this.config.id);
        if (mapNode.offsetHeight === 0) {
          mapNode.style.width = this.config.base.style.width;
          mapNode.style.height = this.config.base.style.height;
        }
        // if (this.type == '25D') {
        //   this.map = new MapApp(this.id, {mapbox3D: this.option.mapbox25D}, this.loadRemoteData);
        // } else
        this.map = new MapApp(this.config.id, this.config.option, this.loadRemoteData);
      },
      /**
       * 加载服务端数据
       */
      loadRemoteData (method, url, params, callback) {
        debugger
        if (!url) {
          throw new Error('map：未声明获取数据的URL');
        }

        let thisObj = this;
        this.ajax({
          method: method || 'GET',
          url: url,
          data: params || {},
        }).then(response => {
          debugger
          if (callback && typeof callback === 'function') {
            callback.call(thisObj, response.data);
          }
        }).catch(error => {
          debugger
          this.$message.error(error.message);
        });
      },
      /**
       * 修改binder的值
       */
      commitBinder (binderKey, value) {
        this.$children[0].commitBinder(binderKey, value);
      },
      /**
       * 修改store的值
       */
      commit (stateProp, value) {
        this.$children[0].commit(stateProp, value);
      },
      /**
       * 修改store的值
       */
      proxyMethod (context, name, param) {
        this.$children[0].proxyMethod(context, name, param);
      },
    },
    watch: {
      event: {
        deep: true,
        handler: function (val) {

        }
      },
      'config.mapStatus': {
        deep: true,
        handler: function (val, oldVal) {
          for (let statusName in this.config.mapStatusHandler) {
            this.proxyMethod(this.config.mapStatusHandler, statusName, [this, val[statusName], this.config.mapStatus[statusName]]);
          }
        }
      }
    },
    components: {
      'Base': Base
    }
  };
</script>
