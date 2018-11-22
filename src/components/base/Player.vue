<template>
  <Base :config="config">
    <slot name="player-before"></slot>
    <!-- 用于管理通用的报表容器样式 -->
    <div :id="id" class="player-ins">
      <div class="stop-area">
        <el-button v-if="config.option.playable"
                   :disabled="!state.playing"
                   class="stop-button"
                   @click="stop">
          <i class="icon iconfont" :class="'icon-' + config.option.icon.stop"></i>
        </el-button>
      </div>
      <div class="play-area">
        <el-button v-if="config.option.playable && !state.playing"
                   class="play-button"
                   @click="play">
          <i class="icon iconfont" :class="'icon-' + config.option.icon.play"></i>
        </el-button>
      </div>
      <div class="pause-area">
        <el-button v-if="config.option.playable && state.playing"
                   class="play-button"
                   @click="pause">
          <i class="icon iconfont" :class="'icon-' + config.option.icon.pause"></i>
        </el-button>
      </div>
      <div class="timeline-area">
        <el-slider v-model="state.index"
                   :min="0"
                   :max="config.option.data.length - 1"
                   :step="1"
                   :format-tooltip="formatTooltip"
                   @change="onNodeClick">
        </el-slider>
      </div>
    </div>
    <slot name="player-after"></slot>
  </Base>
</template>

<script>
  import Base from '@/components/base/Base';
  import Config from '../../config/config';
  import _ from 'lodash';

  export default {
    name: 'Player',
    props: ['config'],
    data () {
      return {
        state: {
          index: 0,
          playing: false,
          interval: (this.config.option.interval || 1) * 1000,
          thread: null,
        },
      };
    },
    created () {
      if (!this.config) {
        throw new Error('Player：未声明config属性');
      }
      this.config.option.data = [];
      if (this.config.option.playable !== false) {
        this.config.option.playable = true;
      }
      this.initIcon();
      this.initBase();
      this.initBinder();
    },
    beforeDestroy () {
      // 销毁前注销组件的数据绑定
      this.$store.commit(Config.MUTATIONS.UNREGISTER, {
        comp: this
      });
    },
    methods: {
      /**
       * 播放
       */
      play () {
        this.state.playing = true;
        this.proxyMethod(this.event, 'onPlay', [this]);
        this.state.thread = setInterval(() => {
          this.proxyMethod(this.event, 'onHandlerNode', [this.state.index, this.config.option.data[this.state.index], this]);
          this.state.index++;
          if (this.state.index == this.config.option.data.length) {
            this.stop();
          }
        }, this.state.interval);
      },
      /**
       * 暂停
       */
      pause () {
        this.state.playing = false;
        clearInterval(this.state.thread);
        this.proxyMethod(this.event, 'onPause', [this.state.index, this.config.option.data[this.state.index], this]);
      },
      /**
       * 停止
       */
      stop () {
        this.state.playing = false;
        this.state.index = 0;
        clearInterval(this.state.thread);
        this.proxyMethod(this.config.event, 'onStop', [this]);
      },
      /**
       * 重置
       */
      reset () {
        this.state.playing = false;
        this.state.index = 0;
        clearInterval(this.state.thread);
        this.proxyMethod(this.config.event, 'onReset', [this]);
      },
      /**
       * 处理节点
       */
      onNodeClick (value) {
        this.state.playing = false;
        clearInterval(this.state.thread);
        this.proxyMethod(this.config.event, 'onHandlerNode', [value, this.config.option.data[value], this]);
      },
      /**
       * 提示内容格式
       */
      formatTooltip (value) {
        if (!value) {
          return;
        }
        return this.proxyMethod(this.handler, 'formatTooltip', [value, this.config.option.data[value], this]);
      },
      /**
       * 处理图标
       */
      initIcon () {
        let icon = Object.assign({
          play: 'play',
          stop: 'stop',
          pause: 'pause'
        }, this.config.option.icon);
        this.config.option.icon = icon;
      },
      /**
       * 初始化基础属性
       */
      initBase () {
        this.config.id = this.config.id || 'player-' + new Date().getTime();
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
    components: {
      'Base': Base
    }
  };
</script>
