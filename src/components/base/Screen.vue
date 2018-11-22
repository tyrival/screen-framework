<template>
  <div class="viewport"
       :class="config.base && config.base.class"
       :style="config.base && config.base.style"
       :id="config.id">

    <!-- 菜单 -->
    <Menu :config="config.menu"></Menu>

    <!-- 二级菜单，为了兼容两级菜单分离的情况 -->
    <SubMenu :config="config.menu"></SubMenu>

    <!-- 浮动组件 -->
    <template v-for="(layout, i) in config.layouts">
      <template v-if="i === $store.state.navigator.menu[config.menu.index].index.value">
        <template v-for="(item, j) in layout">
          <!-- 装载插件，并将config参数传入 -->
          <component :is="loader.component[i][j].default"
                     :config="item.config"></component>
        </template>
      </template>
    </template>

    <!-- 地图 -->
    <div class="map">
      <template v-for="(item, index) in config.map.components">
        <component :is="loader.map[index].default"
                   :config="item.config"></component>
      </template>
    </div>
  </div>
</template>

<script>
  import '../../assets/styles/main.less';
  import Menu from '@/components/base/Menu';
  import SubMenu from '@/components/base/SubMenu';
  import Config from '../../config/config';

  export default {
    name: 'Screen',
    props: ['config'],
    data () {
      return {
        // 动态载入组件
        loader: {
          component: [],
          map: []
        },
      };
    },
    created () {
      this.initConfig();
      this.initComponent();
      this.initBinder();
    },
    mounted () {
      // 更新store中存储的当前菜单状态
      this.commitBinder('menuIndex', this.config.menu.index);
      this.commitBinder('subMenuIndex', this.config.menu.subIndex);
    },
    methods: {
      /**
       * 初始化配置项
       */
      initConfig () {
        if (!this.config.binder) {
          this.config.binder = {};
        }
        this.config.binder.menuIndex = ['config.menu.index', 'navigator.index'];
        this.config.binder.subMenuIndex =
          ['config.menu.subIndex', 'navigator.menu[' + this.config.menu.index + '].index'];
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
        this.commit(this.config.binder[binderKey][1], value);
      },
      /**
       * 修改store的值
       */
      commit (stateProp, value) {
        this.$store.commit(Config.MUTATIONS.MODIFY, {
          store: stateProp,
          value: value
        });
      },
      /**
       * 初始化动态载入所有组件
       */
      initComponent () {
        // 载入各布局的组件
        this.dynamicLoadComponent();
        // 载入地图
        this.dynamicLoadMap();
      },
      /**
       * 动态载入组件
       * @param comps
       */
      dynamicLoadComponent () {
        // 载入各布局的组件
        if (!this.config || !this.config.layouts || !this.config.layouts.length) {
          return;
        }
        for (let i = 0; i < this.config.layouts.length; i++) {
          let layout = this.config.layouts[i];
          this.loader.component[i] = []
          if (!layout || !layout.length) {
            continue;
          }
          for (let j = 0; j < layout.length; j++) {
            let item = layout[j];
            this.loader.component[i].push(require('../../' + item.path + '.vue'));
          }
        }
      },
      /**
       * 动态载入组件
       * @param comps
       */
      dynamicLoadMap () {
        if (!this.config.map || !this.config.map.length) {
          return;
        }
        this.loader.map = [];
        for (let i = 0; i < this.config.map.length; i++) {
          let map = this.config.map[i];
          this.loader.map.push(require('../../' + map.path + '.vue'))
        }
      }
    },
    components: {
      'Menu': Menu,
      'SubMenu': SubMenu
    }
  };
</script>
