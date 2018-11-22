<template>
  <Chart :config="conf"></Chart>
</template>

<script>
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
              left: 50,
              top: 50,
              width: 400,
              height: 300,
            }
          },
          data: [
            {name: "周一", value: 123 },
            {name: "周二", value: 321 },
            {name: "周三", value: 553 },
            {name: "周四", value: 234 },
            {name: "周五", value: 547 },
            {name: "周六", value: 254 },
            {name: "周日", value: 754 },
          ],
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
          binder: {
            show: ['config.base.show', 'screen.medical.show']
          },
          event: {
            beforeRender: function (data, option, chart) {
              option.dataset = {
                source: data,
                dimensions: ['name', 'value']
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
