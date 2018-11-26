<template>
  <Chart :config="conf"></Chart>
</template>

<script>
  import API from '../../../config/api';
  import Chart from '@/components/base/Chart';
  import _ from 'lodash';

  export default {
    name: 'ChartSample',
    props: ['config'],
    data () {
      return {
        conf: {}
      };
    },
    created () {
      this.initConfig();
    },
    methods: {
      /**
       * 设置默认配置
       */
      initConfig () {
        this.conf = _.assignIn({
          id: 'chart-sample',
          base: {
            show: true,
            style: {
              backgroundColor: '#cccccc',
              right: 50,
              top: 50,
              width: 400,
              height: 300,
            }
          },
          data: null,
          option: {
            xAxis: {
              type: 'category',
              boundaryGap: false,
            },
            yAxis: {
              type: 'value'
            },
            series: [{
              type: 'line',
              areaStyle: {}
            }]
          },
          proxy: {
            url: API.SCREEN.TRAFFIC.TEST,
            param: {year: null}
          },
          binder: {
            year: ['config.proxy.param.year', 'screen.traffic.timelineYear']
          },
          event: {
            beforeRender: function (data, option, chart) {
              option.dataset = {
                source: data,
                dimensions: ['phone', 'loginCount']
              };
            }
          }
        }, this.config);
      }
    },
    components: {
      'Chart': Chart
    }
  };
</script>

<style scoped>

</style>
