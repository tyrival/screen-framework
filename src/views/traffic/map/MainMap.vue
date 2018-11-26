<template>
  <Map :config="conf"></Map>
</template>

<script>
  import Map from '@/components/base/Map';

  import Config from '../../../config/config';
  import API from '../../../config/api';
  import _ from 'lodash';

  export default {
    name: 'MainMap',
    props: ['config'],
    data () {
      return {
        conf: {},
      }
    },
    created () {
      this.initConfig();
    },
    methods: {
      initConfig() {
        let config = {
          id: 'traffic-map',
          base: {
            style: {top: 100, left: 100, width: 800, height: 600, zIndex: 5}
          },
          option: {
            mapbox3D: {
              center: API.MAP.DEFAULT.CENTER,
              zoom: API.MAP.DEFAULT.ZOOM,
              pitch: API.MAP.DEFAULT.PITCH,
              bearing: API.MAP.DEFAULT.BEARING,
              dragRotate: true,
              altitudeScale: 2,
              style: API.MAP.ASSET.MAPBOX_STYLE,
              postEffect: {
                enable: true,
                screenSpaceAmbientOcclusion: {
                  enable: true,
                  intensity: 1.2,
                  radius: 6,
                  quality: 'high'
                },
                screenSpaceReflection: {
                  enable: false
                },
                depthOfField: {
                  enable: false,
                  focalDistance: 80,
                  focalRange: 5,
                  fstop: 2.2,
                  blurRadius: 2
                }
              },
              light: {
                main: {
                  intensity: 1,
                  shadow: true,
                  shadowQuality: 'high'
                },
                ambient: {
                  intensity: 0.
                },
                ambientCubemap: {
                  texture: API.MAP.ASSET.TEXTURE_AMBIENT,
                  exposure: 1,
                  diffuseIntensity: 0.5,
                  specularIntensity: 2
                }
              }
            },
            series: []
          },
          proxy: {
            remote: false,
            url: null,
            method: Config.AJAX.GET,
            param: null
          },
          mapStatus: {},
          mapStatusHandler: {},
          binder: {},
        }
        if (this.config) {
          config = _.assignIn(config, this.config)
        }
        this.conf = config;
      }
    },
    components: {
      'Map': Map
    }
  }
</script>

<style scoped>

</style>
