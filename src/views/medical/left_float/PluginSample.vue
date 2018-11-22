<template>
  <Plugin :config="conf"></Plugin>
</template>

<script>
  import Plugin from '@/components/base/Plugin';
  import _ from 'lodash';

  export default {
    name: 'PluginSample',
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
          id: 'btn-sample',
          base: {
            style: {
              fontSize: '20px',
              left: 50,
              top: 400,
              width: 400,
              height: 300
            }
          },
          option: {
            type: 'button',
            html: 'show/hide'
          },
          event: {
            beforeRender: function (data, option, plugin) {
            },
            onClick: function (plugin) {
              this.commit('screen.medical.show', !this.$store.state.screen.medical.show.value)
            }
          }
        }, this.config);
      }
    },
    components: {
      'Plugin': Plugin
    }
  };
</script>

<style scoped>

</style>
