<!--
Plugin组件，通过传入:config，生成相应类型的元素
配置
{
  1. 样式
  style: {
    // 是否隐藏，默认false
    hidden: false,
    class: 样式class,
    position: {
      left: 0,
      top: 0,
      right: 'auto',
      bottom: 'auto',
      zIndex: 0,
      width: 'auto',
      height: 'auto'
    }
  }
  2. 远端获取数据代理
  proxy: {
    // 通过访问服务端获取数据
    remote: true,
    url: "",
    // POST、GET，默认POST
    method: "",
    // 参数
    param: null,
    // 缓存远端数据
    data: null
  },
  3. 数据绑定
  binder: {
    // name: 绑定规则命名
    // prop: 当前组件的属性路径，进行数据绑定的属性，必须在实例化后存在显式声明，
    // 例如：param.region，必须在config中配置 config: { param: {region: null} }
    // storeProp: Vuex中的属性路径
    // prop与storeProp进行单向数据绑定，当storeProp变化时，prop随之变化，
    // 并会触发当前组件的watch
    name:[prop, storeProp]
  },
  4. 代理函数
  handler: {
    // 数据转换过程，将远端获取的proxy.data转换到option，
    // 或者转换为chart对象其他属性的规则
    transformData: function(proxy.data, option, chart)
  },
  5. 事件
  event: {
    // 初始化完成
    onInit: (plugin) { },
    // 加载完成
    onLoad: (plugin) { },
  },

  6. 各类元素的配置参数：
  6.1. 按钮
  option: {
    type: 'button',
    style: 'plain-原始 / round-圆角 / circle-圆形',
    icon: '',
    html: '提交',
    disabled: false,
  },
  event: {
    onClick: (plugin) => { }
  },

  6.2. 按钮组
  option: {
    type: 'button-group',
    data: [
      {html: '上页', disabled: false},
      {html: '下页', disabled: true}
    ],
  },
  event: {
    onClick: (index, plugin) => { }
  },

  6.3. Radio
  option: {
    type: 'radio',
    style: 'button',
    value: null,
    name: '',
    data: [
      {value: 0, icon: 'icon-play', text: '选项1', disabled: false},
      {value: 1, icon: 'icon-play', text: '选项2', disabled: false},
    ],
  },
  event: {
    onChange: (label, index, option, plugin) => { }
  },

  6.4. Checkbox
  option: {
    type: 'check',
    // 样式，button / undefined
    style: 'button',
    name: '',
    value: [],
    data: [
      {value: 0, icon: 'icon-play', text: '选项1', checked: false, disabled: false},
      {value: 1, icon: 'icon-play', text: '选项2', checked: false, disabled: false},
    ],
  },
  event: {
    onChange: (value, index, option, plugin) => { }
  },

  6.5. 下拉框
  option: {
    type: 'select',
    disabled: false,
    clear: true,
    multiple: true,
    value: null,
    name: '',
    placeholder: '请选择',
    data: [
      {text: '选项1', value: '选项1', disabled: false},
      {text: '选项2', value: '选项2', disabled: false},
    ],
  },
  event: {
    onChange: (value, selectedValues, plugin) => { }
    onFocus: (event, plugin) => { }
    onBlur: (event, plugin) => { }
    onClear: (plugin) => { }
  },

  6.6. 输入框
  option: {
    type: 'input',
    disabled: false,
    clearable: false,
    value: null,
    placeholder: '请输入',
    name: '',
  },
  event: {
    onChange: (value, plugin) => { }
    onFocus: (event, plugin) => { }
    onBlur: (event, plugin) => { }
    onClear: (plugin) => { }
  },

  6.7. 标签
  option: {
    type: 'label',
    html: "",
  },

  6.8. 图片
  option: {
    type: 'image',
    src: "",
    alt: "",
  },

  6.9. 链接
  option: {
    type: 'link',
    html: "",
  },
  event: {
    onClick: (plugin) => { }
  },

  6.10. 链接组
  option: {
    type: 'link-group',
    data: [
      {html: '上页', disabled: false},
      {html: '下页', disabled: true}
    ],
  },
  event: {
    onClick: (index, plugin) => { }
  },

  6.11. DIV
  option: {
    type: 'container',
    html: html内容
  },

  6.12. 日期选择器
  option: {
    type: 'date',
    formatText: 'yyyy-MM-dd',
    formatValue: 'yyyy-MM-dd',
    readonly: false,
    disabled: false,
    name: '',
    default: '',
  },
  event: {
    onChange: (value, plugin) => { }
    onBlur: (plugin) => { }
    onFocus: (plugin) => { }
  },
},

方法：
1. 修改Vuex Store的值
stateProp：vuex store中的属性，例如screen.govern.showCamera
value：给所有绑定的属性赋值
commit: function(stateProp, value)

2. 修改数据绑定的值
binderName：binder规则的name属性
value：给所有绑定的属性赋值
commitBinder: function(binderName, value)

3. reload: function()
重新加载报表

-->
<template>
  <Base :config="config">
    <slot name="plugin-before"></slot>

    <div v-if="config.option.type == 'label'"
         class="plugin-label"
         v-html="config.option.html">
    </div>

    <div v-else-if="config.option.type == 'container'"
         class="plugin-container"
         v-html="config.option.html">
    </div>

    <el-button v-else-if="config.option.type == 'link'"
               type="text"
               :disabled="config.option.disabled"
               class="plugin-link"
               v-html="config.option.html"
               @click="onLinkClick">
    </el-button>

    <el-button-group v-else-if="config.option.type == 'link-group'"
                     class="plugin-link-group">
      <el-button v-for="(button, index) in config.option.data"
                 :key="index"
                 type="text"
                 v-html="button.html"
                 :disabled="button.disabled"
                 @click="onLinkClick(index)">
      </el-button>
    </el-button-group>

    <img v-else-if="config.option.type == 'image'"
         :src="config.option.src"
         :alt="config.option.alt"
         class="plugin-image">

    <el-input v-else-if="config.option.type == 'input'"
              :placeholder="config.option.placeholder || '请输入'"
              v-model="config.option.value"
              :value="config.option.value"
              :disabled="config.option.disabled"
              :clearable="config.option.clearable"
              :name="config.option.name"
              class="plugin-input"
              @change="onInputChange"
              @focus="onInputFocus"
              @blur="onInputBlur"
              @clear="onInputClear">
    </el-input>

    <div v-else-if="config.option.type == 'search'"
         class="plugin-input plugin-search el-input el-input--suffix">
      <input autocomplete="off" placeholder="搜索" ref="search-word" type="text" rows="2" validateevent="true"
             suffixicon="el-icon-search" class="el-input__inner">
      <span class="el-input__suffix" @click="onSearch">
        <span class="el-input__suffix-inner">
          <i class="el-input__icon el-icon-search"></i>
        </span>
      </span>
    </div>

    <el-button v-else-if="config.option.type == 'button'"
               :plain="config.option.style == 'plain'"
               :round="config.option.style == 'round'"
               :circle="config.option.style == 'circle'"
               :disabled="config.option.disabled"
               v-html="config.option.html"
               class="plugin-button"
               @click="onButtonClick">
    </el-button>

    <el-button-group v-else-if="config.option.type == 'button-group'"
                     class="plugin-button-group">
      <el-button v-for="(button, index) in config.option.data"
                 :key="index"
                 v-html="button.html"
                 :disabled="button.disabled"
                 @click="onButtonClick(index)">
      </el-button>
    </el-button-group>

    <el-radio-group v-else-if="config.option.type == 'radio'"
                    v-model="config.option.value"
                    class="plugin-radio"
                    @change="onRadioChange">
      <template v-if="config.option.style == 'button'">
        <el-radio-button v-for="(item, index) in config.option.data"
                         :key="index"
                         :label="item.value || index"
                         :disabled="item.disabled"
                         :name="item.name">
          <i class="icon iconfont" :class="item.icon"></i><span>{{item.text}}</span>
        </el-radio-button>
      </template>
      <template v-else>
        <el-radio v-for="(item, index) in config.option.data"
                  :key="index"
                  :label="item.value || index"
                  :disabled="item.disabled"
                  :name="config.option.name">
          <i class="icon iconfont" :class="item.icon"></i><span>{{item.text}}</span>
        </el-radio>
      </template>
    </el-radio-group>

    <el-checkbox-group v-else-if="config.option.type == 'check'"
                       class="plugin-checkbox"
                       v-model="config.option.value">
      <template v-if="config.option.style == 'button'">
        <el-checkbox-button v-for="(item, index) in config.option.data"
                            :key="index"
                            :label="item.value || index"
                            :checked="item.checked"
                            :disabled="item.disabled"
                            :name="config.option.name"
                            @change="onCheckChange($event,index)">
          <i class="icon iconfont" :class="item.icon"></i><span>{{item.text}}</span>
        </el-checkbox-button>
      </template>
      <template v-else>
        <el-checkbox v-for="(item, index) in config.option.data"
                     :key="index"
                     :label="item.value || index"
                     :checked="item.checked"
                     :disabled="item.disabled"
                     :name="config.option.name"
                     @change="onCheckChange($event,index)">
          <i class="icon iconfont" :class="item.icon"></i><span>{{item.text}}</span>
        </el-checkbox>
      </template>
    </el-checkbox-group>

    <el-select v-else-if="config.option.type == 'select'"
               v-model="config.option.value"
               :disabled="config.option.disabled"
               :multiple="config.option.multiple"
               :placeholder="config.option.placeholder || '请选择'"
               :name="config.option.name"
               class="plugin-select"
               @change="onSelectChange"
               @focus="onSelectFocus"
               @blur="onSelectBlur"
               @clear="onSelectClear">
      <el-option v-for="item in config.option.data"
                 :key="item.value"
                 :label="item.text"
                 :value="item.value">
      </el-option>
    </el-select>

    <el-date-picker v-else-if="config.option.type == 'date'"
                    v-model="config.option.value"
                    type="date"
                    :format="config.option.formatText"
                    :value-format="config.option.formatValue"
                    :readonly="config.option.readonly"
                    :disabled="config.option.disabled"
                    :name="config.option.name"
                    :default-value="config.option.default"
                    :placeholder="config.option.placeholder || '选择日期'"
                    @change="onDateChange"
                    @blur="onDateBlur"
                    @focus="onDateFocus">
    </el-date-picker>

    <el-progress v-else-if="config.option.type == 'progress'"
                 :percentage="config.option.value"
                 :type="config.option.style || 'line'"
                 :stroke-width="config.option.width"
                 :show-text="config.option.showText || false">
    </el-progress>

    <slot name="plugin-after"></slot>
  </Base>
</template>
<script>
  import Base from '@/components/base/Base';
  import _ from 'lodash';
  import Config from '../../config/config';

  export default {
    name: 'Plugin',
    props: ['config'],
    data () {
      return {
      };
    },
    created () {
      if (!this.config) {
        throw new Error('Plugin：未声明config属性');
      }
      this.initBase();
      this.initBinder();
      this.initEvent();
    },
    beforeDestroy () {
      this.$store.commit(Config.MUTATIONS.UNREGISTER, {
        comp: this
      });
    },
    methods: {
      /**
       * 初始化基础属性
       */
      initBase () {
        this.config.id = this.config.id || 'plugin-' + new Date().getTime();
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
       * 初始化事件配置
       */
      initEvent () {
        this.config.event = _.assignIn({}, this.config.event);
      },

      onInputChange (value) {
        this.proxyMethod(this.config.event, 'onChange', [value, this]);
      },
      onInputFocus (event) {
        this.proxyMethod(this.config.event, 'onFocus', [event, this]);
      },
      onInputBlur (event) {
        this.proxyMethod(this.config.event, 'onBlur', [event, this]);
      },
      onInputClear () {
        this.proxyMethod(this.config.event, 'onClear', [this]);
      },
      onLinkClick (index) {
        this.proxyMethod(this.config.event, 'onClick', [index, this]);
      },
      onButtonClick (index) {
        if (index === undefined) {
          this.proxyMethod(this.config.event, 'onClick', [this]);
        } else {
          this.proxyMethod(this.config.event, 'onClick', [index, this]);
        }
      },
      onRadioChange (value) {
        this.proxyMethod(this.config.event, 'onChange', [value, this.config.option, this]);
      },
      onCheckChange (value, index) {
        this.proxyMethod(this.config.event, 'onChange', [value, index, this.config.option, this]);
      },
      onSelectChange (value) {
        this.proxyMethod(this.config.event, 'onChange', [value, this.config.option, this]);
      },
      onSelectFocus (event) {
        this.proxyMethod(this.config.event, 'onFocus', [event, this]);
      },
      onSelectBlur (event) {
        this.proxyMethod(this.config.event, 'onBlur', [event, this]);
      },
      onSelectClear () {
        this.proxyMethod(this.config.event, 'onClear', [this]);
      },
      onDateChange (value) {
        this.proxyMethod(this.config.event, 'onChange', [value, this]);
      },
      onDateBlur () {
        this.proxyMethod(this.config.event, 'onBlur', [this]);
      },
      onDateFocus () {
        this.proxyMethod(this.config.event, 'onFocus', [this]);
      },
      onSearch () {
        let value = this.$refs['search-word'].value;
        this.proxyMethod(this.config.event, 'onSearch', [value, this]);
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

