<template>
  <div v-if="!style || !style.hidden"
       class="map-container"
       :class="style.class"
       :style="style.position"
       :id="id + '-container'">
    <slot name="map-before"></slot>
    <!-- 用于管理通用的报表容器样式 -->
    <div :id="id + '-map'" class="map-ins"></div>
    <!--<div id="map" class="map-ins"></div>-->
    <slot name="map-after"></slot>
  </div>
</template>

<script>
  import Config from '../../config/config';
  import _ from 'lodash';

  export default {
    name: 'Map',
    props: ['config'],
    data () {
      return {
        id: null,
        style: this.config.style || {class: null, position: null},
        binder: this.config.binder,
        option: this.config.option,
        handler: this.config.handler,
        event: this.config.event,
        proxy: this.config.proxy || {},
        map: null,
        mapStatus: this.config.mapStatus || {},
        oldStatus: null,
        statusHandler: this.config.mapStatusHandler || {}
      };
    },
    created () {
      if (!this.config) {
        throw new Error('map：未声明config属性');
      }
      // 创建id
      this.id = this.config.id || 'map-' + new Date().getTime();
      this.oldStatus = _.assign({}, this.mapStatus);

      this.initPosition();
      this.initBinder();
    },
    mounted () {
      this.init();
      this.load();
    },
    beforeDestroy () {
      // 销毁前注销组件的数据绑定
      this.$store.commit(Config.MUTATIONS.SCREEN.UNREGISTER, {
        comp: this
      });
    },
    methods: {
      /**
       * 处理位置参数
       */
      initPosition () {
        if (this.style.position) {
          let zIndex = this.style.position.zIndex || 0;
          this.style.position = _.mapValues(this.style.position, function (o) {
            return o + 'px';
          });
          _.set(this.style, 'position.zIndex', zIndex);
          _.set(this.style, 'position.position', 'absolute');
        }
      },
      /**
       * 处理位置参数
       */
      initBinder () {
        for (let key in this.binder) {
          let prop = this.binder[key][0];
          let storeProp = this.binder[key][1];
          this.$store.commit(Config.MUTATIONS.SCREEN.REGISTER, {
            store: storeProp,
            prop: prop,
            comp: this
          });
        }
      },
      /**
       * 初始化组件
       */
      init () {
        //let mapNode = document.getElementById("map");
        let mapNode = document.getElementById(this.id + '-map');

        if (mapNode.offsetHeight === 0) {
          if (this.style.position.width) {
            mapNode.style.width = this.style.position.width;
          } else {
            mapNode.style.height = '2160px';
          }
          if (this.style.position.height) {
            mapNode.style.height = this.style.position.height;
          }

        }
        /*if(this.type=='25D')
                this.map = new MapApp(this.id + "-map", {mapbox3D:this.option.mapbox25D}, this.loadRemoteData);
            else*/
        this.map = new MapApp(this.id + '-map', this.option, this.loadRemoteData);
      },
      /**
       * 加载配置
       */
      load () {
        let thisObj = this;

        // this.map.updateData("building_haishu", {
        //   dataType: "polygon",
        //   dataUrl: API.MAP.DATA.POLYGONS.BUILDING_HAISHU
        // }, null, true);
        /*this.map.updateData("building_sd", {
          dataType: "polygon",
          dataUrl: API.MAP.DATA.POLYGONS.BUILDING_SD,
          dataProcessor: function(data){
            data.features.map(function(feature) {
              var curProps = feature.properties;
              curProps["name"] = curProps.n;
                curProps["height"] = curProps.bh;
            });

            return data;
          }
        }, null, true);*/

        // this.map.updateData("road_sd", {
        //   dataType: "line",
        //   // dataUrl: API.MAP.DATA.POLYGONS.ROAD_SD_test
        //   dataUrl: API.MAP.DATA.POLYGONS.ROAD_SD
        // }, null, true);

        // this.map.updateData("hotspot", {
        //   dataType: "hotspot",
        //   dataUrl: "./static/data/map/sd/hotspot.json"
        // }, null, true);

        // this.map.updateData("region_haishu", {
        //   dataType: "region",
        //   dataUrl: API.MAP.DATA.POLYGONS.REGION_HAISHU
        // }, {
        //   minzoom: 13,
        //   maxzoom: 14
        // }, true);
        //
        // this.map.updateData("region_ningbo", {
        //   dataType: "region",
        //   dataUrl: API.MAP.DATA.POLYGONS.REGION_NINGBO
        // }, {
        //   maxzoom: 13
        // }, true);
      },
      /**
       * 加载服务端数据
       */
      loadRemoteData (method, url, params, callback) {
        if (!url) {
          throw new Error('map：未声明获取数据的URL');
        }

        let thisObj = this;
        this.ajax({
          method: method || 'GET',
          url: url,
          data: params || {},
        }).then(response => {
          if (callback && typeof callback === 'function') {
            callback.call(thisObj, response.data);
          }
        }).catch(error => {
          this.$message.error(error.message);
        });
      },
      /**
       * 代理
       */
      proxyMethod (context, eventName, param) {
        if (!context) {
          return;
        }
        let func = context[eventName];
        if (func && typeof func == 'function') {
          return func.apply(this, param);
        }
      },
      /**
       * 修改binder的值
       */
      commitBinder (binderKey, value) {
        this.commit(this.binder[binderKey][1], value);
      },
      /**
       * 修改store的值
       */
      commit (stateProp, value) {
        this.$store.commit(Config.MUTATIONS.SCREEN.MODIFY, {
          store: stateProp,
          value: value
        });
      },
      /**
       * 重新加载报表
       */
      reload () {
        this.load();
      },
    },
    watch: {
      event: {
        deep: true,
        handler: function (val) {

        }
      },
      mapStatus: {
        deep: true,
        handler: function (val, oldVal) {
          for (let statusName in this.statusHandler) {
            this.proxyMethod(this.statusHandler, statusName, [this, val[statusName], this.oldStatus[statusName]]);
          }

          this.oldStatus = _.assign({}, this.mapStatus);
        }
      }
    }
  };
</script>
