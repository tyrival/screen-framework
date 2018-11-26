<template>
  <Player :config="conf"></Player>
</template>

<script>
  import Player from '@/components/base/Player';
  import _ from 'lodash';

  export default {
    name: 'YearTimeline',
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
          id: 'year-timeline',
          base: {
            show: true,
            style: {
              right: 50,
              bottom: 200,
              width: 400,
              height: 200,
              zIndex: 5,
            }
          },
          data: [
            {name: "2011", value: "2011" },
            {name: "2012", value: "2012" },
            {name: "2013", value: "2013" },
            {name: "2014", value: "2014" },
            {name: "2015", value: "2015" },
            {name: "2016", value: "2016" },
            {name: "2017", value: "2017" },
          ],
          option: {
            playable: true,
            interval: 2,
            icon: {
              play: 'play',
              pause: 'pause',
              stop: 'stop',
            }
          },
          event: {
            beforeRender: function (data, option, chart) {
              option.data = data;
            },
            onNode: function (index, model, chart) {
              this.commit("screen.traffic.timelineYear", model.value)
            }
          }
        }, this.config);
      }
    },
    components: {
      'Player': Player
    }
  }
</script>

<style scoped>

</style>
