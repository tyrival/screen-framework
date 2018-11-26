<template>
  <div v-show="config.base.show"
       class="chart-container"
       :class="config.base.class"
       :style="calcStyle"
       :id="config.id + '-container'">
    <slot></slot>
  </div>
</template>

<script>
  import Config from '../../config/config';
  import _ from 'lodash';

  export default {
    name: 'Base',
    props: ['config'],
    data () {
      return {
        // 数据代理
        dataProxy: null,
      };
    },
    created () {
      this.proxyMethod(this.config.event, 'beforeInit', [this]);
      if (!this.config) {
        throw new Error('Chart：未声明config属性');
      }
      this.initBase();
      this.initProxy();
      this.initBinder();
      this.proxyMethod(this.config.event, 'onInit', [this]);
    },
    mounted () {
      this.render();
    },
    beforeDestroy () {
      this.$store.commit(Config.MUTATIONS.UNREGISTER, {
        comp: this
      });
    },
    computed: {
      /**
       * 计算样式
       */
      calcStyle () {
        let style = _.assignIn({}, this.config.base.style);
        style.position = 'absolute';
        style.top = style.top ? style.top + 'px' : 'auto';
        style.left = style.left ? style.left + 'px' : 'auto';
        style.width = style.width ? style.width + 'px' : 'auto';
        style.height = style.height ? style.height + 'px' : 'auto';
        style.right = style.right ? style.right + 'px' : 'auto';
        style.bottom = style.bottom ? style.bottom + 'px' : 'auto';
        return style;
      },
    },
    methods: {
      /**
       * 初始化基础属性
       */
      initBase () {
        this.config.id = this.config.id || 'chart-' + new Date().getTime();
        this.config.base = _.assignIn({}, {
          show: true,
          class: null,
          style: {
            top: 0,
            left: 0,
            width: 400,
            height: 300,
            zIndex: 0,
          }
        }, this.config.base);
      },
      /**
       * 初始化数据代理
       */
      initProxy () {
        if (!this.config.proxy || this.config.proxy.remote === false) {
          return;
        }
        if (!this.config.proxy.url) {
          throw new Error('Base：未声明获取数据的URL');
        }
        this.dataProxy = new Promise((resolve, reject) => {
          this.ajax({
            url: this.config.proxy.url,
            method: this.config.proxy.method || Config.AJAX.GET,
            data: this.config.proxy.param,
          }).then((response) => {
            resolve(response);
          }).catch((error) => {
            reject(error);
          });
        });
      },
      /**
       * 注册数据绑定规则
       */
      initBinder () {
        for (let key in this.config.binder) {
          let prop = this.config.binder[key][0];
          let storeProp = this.config.binder[key][1];
          this.$store.commit(Config.MUTATIONS.REGISTER, {
            store: storeProp,
            prop: prop,
            comp: this
          });
        }
      },
      /**
       * 修改binder的值
       */
      commitBinder (binderKey, value) {
        this.commit(this.config.binder[binderKey][1], value);
      },
      /**
       * 修改store的值
       */
      commit (stateProp, value) {
        this.$store.commit(Config.MUTATIONS.MODIFY, {
          store: stateProp,
          value: value
        });
      },
      /**
       * 加载配置
       */
      render () {
        if (this.config.proxy && this.config.proxy.remote !== false) {
          this.dataProxy.then((response) => {
            this.config.data = response.data;
          }).catch(() => {
          }).finally(() => {
            this.doRender();
          });
        } else {
          this.doRender();
        }
      },
      /**
       * 加载配置
       */
      doRender () {
        this.proxyMethod(this.config.event, 'beforeRender', [this.config.data, this.config.option, this]);
        if (this.$parent.render) {
          this.$parent.render();
        }
        this.proxyMethod(this.config.event, 'onRender', [this]);
      },
      /**
       * 代理方法
       */
      proxyMethod (context, eventName, param) {
        if (!context) {
          return;
        }
        let func = context[eventName];
        if (func && typeof func == 'function') {
          return func.apply(this, param);
        }
      },
    },
    watch: {
      "config.option": {
        deep: true,
        handler: function (val) {
          this.render();
        }
      },
      "config.proxy": {
        deep: true,
        handler: function (val) {
          this.initProxy();
          this.render();
        }
      },
    }
  };
</script>
