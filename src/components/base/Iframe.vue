<template>
  <Base :config="config">
    <slot name="chart-before"></slot>
    <!-- 用于管理通用的报表容器样式 -->
    <iframe frameborder="0"
            class="iframe-ins"
            :src="config.option.url"
            :id="config.id"
            :ref="config.id"></iframe>
    <slot name="chart-after"></slot>
  </Base>
</template>

<script>
  import Base from '@/components/base/Base';
  import Config from '../../config/config';
  import _ from 'lodash';

  export default {
    name: 'Iframe',
    props: ['config'],
    data () {
      return {
        domain: null,
        iframe: null,
        iframeDomain: null,
        // 用于传入消息
        message: null,
        // 消息栈
        stack: {
          busy: false,
          queue: []
        },
      };
    },
    created () {
      if (!this.config) {
        throw new Error('Iframe：未声明config属性');
      }
      this.initBase();
      this.initOption();
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
       * 重新渲染
       */
      render () {
        if (this.iframe) {
          let arr = this.option.url.split('//');
          let protocol = arr[0];
          let url = arr[1];
          let index = url.indexOf('/');
          if (index >= 0) {
            url = url.substring(0, index);
          }
          this.iframeDomain = protocol + '//' + url;
          // 接收iframe内页面的消息
          let me = this;
          window.addEventListener('message', function (e) {
            me.receive(e.data);
          }, false);
        } else {
          this.initIframe();
        }
      },
      /**
       * 初始化基础属性
       */
      initBase () {
        this.config.id = this.config.id || 'iframe-' + new Date().getTime();
        this.config.base = _.assignIn({
          style: {width: 400, height: 300}
        }, this.config.base);
      },
      /**
       * 初始化基础属性
       */
      initOption () {
        this.config.option = _.assignIn({
          action: {
            initChild: function () {
              this.post({
                action: Config.CORS_MESSAGE.ACTION.INIT,
                data: {
                  parentId: this.id,
                  parentDomain: this.domain
                }
              });
            }
          }
        }, this.config.option);
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
       * 初始化表格对象
       */
      initIframe () {
        this.iframe = this.$refs[this.id];
        this.render();
      },
      /**
       * 处理接收到的消息
       */
      receive (data) {
        if (!data) {
          return;
        }
        let msg = typeof (data) === 'string' ? JSON.parse(data) : data;
        if (!msg || !msg.id || !msg.type) {
          return;
        }
        if (msg.type.toLowerCase() === Config.CORS_MESSAGE.TYPE.SEND) {
          this.receiveRequest(msg);
        } else {
          this.receiveResponse(msg);
        }
      },
      /**
       * 处理收到的请求
       */
      receiveRequest (msg) {
        // 处理子页面发来的请求
        let result = {
          id: msg.id,
          type: Config.CORS_MESSAGE.TYPE.BACK,
          parentId: this.parentId,
          success: true,
          message: '',
          data: null
        };
        // 调用handler中的方法，处理子页面发送来的请求
        let source = this.proxyMethod(this.config.option.actions, msg.action, [msg.data]);
        result = Object.assign(result, source);
        // 将结果返回子页面
        this.iframe.contentWindow.postMessage(JSON.stringify(result), this.iframeDomain);
      },
      /**
       * 处理收到的反馈
       */
      receiveResponse (msg) {
        if (!msg.success) {
          let req = this.stack.queue[0];
          let err = '发送到子页面的请求【action: ' + req.action +
            ', data: ' + JSON.stringify(req.data) +
            '】出错：' + msg.message;
          console.error(err);
        }
        // 删除消息栈中第一个，并触发post
        this.stack.queue.shift();
        this.stack.busy = false;
        this.doPost();
      },
      /**
       * 发送消息
       */
      doPost () {
        // 任务空闲并且队列中有消息时，发送消息
        if (!this.stack.busy && this.stack.queue.length) {
          this.stack.busy = true;
          this.iframe.contentWindow.postMessage(JSON.stringify(this.stack.queue[0]), this.iframeDomain);
        }
      },
      /**
       * 添加消息
       */
      post (msg) {
        msg.id = 'msg-' + new Date().getTime();
        msg.type = Config.CORS_MESSAGE.TYPE.SEND;
        msg.parentId = this.parentId;
        this.stack.queue.push(msg);
        this.doPost();
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
        this.$children[0].commit(stateProp, value);
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
