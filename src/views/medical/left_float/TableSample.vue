<template>
  <Table :config="conf"></Table>
</template>

<script>
  import Table from '@/components/base/Table';
  import _ from 'lodash';

  export default {
    name: 'TableSample',
    props: ['config'],
    data () {
      return {
        conf: null
      }
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
          base: {
            style: {
              left: 550,
              top: 50,
              width: 400,
              height: 300,
            }
          },
          data: [
            {name: 'Google', value: 10},
            {name: 'Baidu', value: 9},
            {name: 'Bing', value: 8}
          ],
          option: {
            border: true,
            columns: [
              {type: 'index', text: '排名'},
              {prop: 'name', text: '搜索引擎'},
              {prop: 'value', text: '业务量'}
            ]
          }
        }, this.config);
      }
    },
    components: {
      'Table': Table
    }
  };
</script>

<style scoped>

</style>
