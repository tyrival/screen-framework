<template>
  <Screen :config="config"></Screen>
</template>

<script>
  import Screen from '@/components/base/Screen';
  import '../../assets/styles/medical/medical.less';

  export default {
    name: 'Medical',
    data () {
      return {
        config: {
          // 菜单配置
          menu: {
            // 一级菜单索引
            index: 0,
            // 二级菜单默认激活索引
            subIndex: 0,
          },
          layouts: [{
            // 左面板配置
            leftPanel: [{
              path: 'views/medical/left_float/ChartSample',
            }, {
              path: 'views/medical/left_float/PluginSample',
            }, {
              path: 'views/medical/left_float/TableSample',
            }],
            // 右面板配置
            rightPanel: [],
            // 漂浮面板配置
            leftFloat: [],
            rightFloat: [],
            floatBar: [],
          }, {

          }],
          map: [],
          binder: {}
        }
      };
    },
    created () {
    },
    mounted () {
    },
    methods: {},
    components: {
      'Screen': Screen,
    }
  };
</script>

<style scoped>

</style>
