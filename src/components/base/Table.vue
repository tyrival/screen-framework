<template>
  <Base :config="config">
    <slot name="table-before"></slot>
    <!-- 用于管理通用的报表容器样式 -->
    <el-table :id="config.id"
              :ref="config.id"
              class="table-ins"
              :data="config.data"
              :max-height="config.option.maxHeight"
              :highlight-current-row="config.option.highlightCurrentRow || false"
              :stripe="config.option.stripe || false"
              :border="config.option.border || false"
              :default-sort="config.option.defaultSort"
              @cell-click="onCellClick"
              @row-click="onRowClick"
              @header-click="onHeaderClick">
      <template v-for="(column, index) in config.option.columns">
        <template v-if="column.type =='index'">
          <el-table-column v-if="column.show"
                           :key="index"
                           v-show=""
                           type="index"
                           :label="column.text"
                           :width="column.width"
                           :fixed="column.fixed || false">
          </el-table-column>
        </template>
        <template v-else-if="!column.type || column.type =='text'">
          <el-table-column v-if="!column.hidden"
                           :key="index"
                           :prop="column.prop"
                           :width="column.width"
                           :sortable="column.sortable"
                           :fixed="column.fixed || false"
                           :label="column.text"
                           :formatter="column.formatter">
          </el-table-column>
        </template>
        <template v-else-if="column.type == 'component'">
          <el-table-column v-if="!column.hidden"
                           :key="index"
                           :width="column.width"
                           :fixed="column.fixed || false"
                           :label="column.text">
            <template slot-scope="scope">
              <component :is="components[index].loader.default"
                         :config="components[index].configs[scope.$index]"></component>
            </template>
          </el-table-column>
        </template>
      </template>
    </el-table>
    <slot name="table-after"></slot>
  </Base>
</template>

<script>
  import Base from '@/components/base/Base';
  import Config from '../../config/config';
  import _ from 'lodash';

  export default {
    name: 'Table',
    props: ['config'],
    data () {
      return {
        loader: {},
        table: null,
      };
    },
    created () {
      if (!this.config) {
        throw new Error('Table：未声明config属性');
      }
      this.initBase();
      this.initBinder();
      this.initEvent();
      this.dynamicLoadComponent(this.config.option.columns);
    },
    beforeDestroy () {
      // 销毁前注销组件的数据绑定
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
        if (this.table) {
          this.table.doLayout();
        } else {
          this.initTable();
        }
      },
      /**
       * 初始化基础属性
       */
      initBase () {
        this.config.id = this.config.id || 'table-' + new Date().getTime();
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
       * 初始化表格对象
       */
      initTable () {
        this.table = this.$refs[this.config.id];
        this.render();
      },
      /**
       * 初始化事件配置
       */
      initEvent () {
        this.config.event = _.assignIn({}, this.config.event);
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
      /**
       * 动态加载组件
       */
      dynamicLoadComponent (columns) {
        let loader = {}
        if (!columns || !columns.length) {
          return;
        }
        for (let i = 0; i < columns.length; i++) {
          let column = columns[i];
          if (column.type !== 'component') {
            continue;
          }
          if (!column.component || !column.component.path) {
            console.error('Table错误: 组件列的属性设置有误。');
            return;
          }
          let key = 'col-' + i;
          let config = _.assignIn({}, column.component.config);
          config.data = {
            value: item[column.prop],
            prop: column.prop,
            model: item,
            index: i
          }
          this.loader[key] = {
            component: require('../../' + column.component.path + '.vue'),
            config: config
          }
        }
        this.loader = loader;
      },
      /* =================== event =================== */
      onCellClick: function (row, column, cell, event) {
        this.proxyMethod(this.config.event, 'onCellClick', [row, column, cell, event, this]);
      },
      onRowClick: function (row, event, column) {
        this.proxyMethod(this.config.event, 'onRowClick', [row, event, column, this]);
      },
      onHeaderClick: function (column, event) {
        this.proxyMethod(this.config.event, 'onHeaderClick', [column, event, this]);
      },
    },
    components: {
      'Base': Base
    }
  };
</script>
