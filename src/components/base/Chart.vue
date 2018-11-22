<template>
  <Base :config="config">
    <slot name="chart-before"></slot>
    <!-- 用于管理通用的报表容器样式 -->
    <div :id="config.id"
         class="chart-ins"
         :style="calcStyle">
    </div>
    <slot name="chart-after"></slot>
  </Base>
</template>

<script>
  import Base from '@/components/base/Base';
  import echarts from 'echarts';
  import Config from '../../config/config';
  import _ from 'lodash';

  export default {
    name: 'Chart',
    props: ['config'],
    data () {
      return {
        chart: null
      };
    },
    created () {
      if (!this.config) {
        throw new Error('Chart：未声明config属性');
      }
      this.initBase();
      this.initBinder();
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
        return {
          position: 'position',
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
        this.id = this.config.id || 'chart-' + new Date().getTime();
        this.config.base = _.assignIn({
          style: {width: 400, height: 300}
        }, this.config.base);
      },
      /**
       * 处理绑定参数
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
       * 注册所有传入的事件
       */
      initEvent () {
        if (!this.config.event) {
          return;
        }
        let me = this;
        for (let eventName in me.config.event) {
          me.chart.on(eventName, function (params) {
            me.proxyMethod(me.config.event, eventName, [params, me]);
          });
        }
      },
      /**
       * 加载配置
       */
      render () {
        if (this.chart) {
          this.chart.setOption(this.config.option, true);
          this.resize();
        } else {
          this.initChart();
        }
      },
      /**
       * 初始化图表配置
       */
      initChart () {
        if (this.config.base.theme) {
          this.ajax({
            method: 'GET',
            url: this.config.base.theme,
          }).then(response => {
            echarts.registerTheme(this.config.id, response.data);
            this.doInitChart(this.config.id);
          }).catch(error => {
            this.$message.error(error.message);
          });
        } else {
          this.doInitChart();
        }
      },
      /**
       * 初始化图表
       */
      doInitChart (theme) {
        // 初始化图表对象
        let dom = document.getElementById(this.config.id);
        if (!dom) {
          return;
        }
        if (theme) {
          this.chart = echarts.init(dom, theme);
        } else {
          this.chart = echarts.init(dom);
        }
        // 注册echarts事件
        this.initEvent();
        this.render();
      },
      /**
       * chart刷新尺寸
       */
      resize () {
        this.chart.resize({
          height: this.config.base.style.height,
          width: this.config.base.style.width,
          silent: true
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
        this.$children[0].commit(binderKey, value);
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
          this.initEvent();
        }
      },
    },
    components: {
      'Base': Base
    }
  };
</script>
