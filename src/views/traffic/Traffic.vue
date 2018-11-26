<template>
  <Screen :config="config"></Screen>
</template>

<script>
  import Screen from '@/components/base/Screen';
  import '../../assets/styles/traffic/traffic.less';

  export default {
    name: 'Traffic',
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
          layouts: [
            [
              {path: 'views/traffic/general/ChartSample'},
              {path: 'views/traffic/general/YearTimeline'},
            ]
          ],
          map: [{
            path: 'views/traffic/map/MainMap',
          }],
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
