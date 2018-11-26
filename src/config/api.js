const API = {
  // 服务器地址
  SERVER_URL: '',
  //
  MAP: {
    MAPBOXGL_ACCESS_TOKEN: "pk.eyJ1IjoiemhhbmdsZWk4Nzg1IiwiYSI6IkZ3cHBZeGcifQ.ul8W1MQdPN6QkaI94bYfFQ",
    DEFAULT: {
      CENTER: [121.51083332300004, 29.881685704000063],
      ZOOM: 13,
      PITCH: 55,
      BEARING: -10
    },
    ASSET: {
      MAPBOX_STYLE: "./static/data/mapbox_style_dark_v9.json",
      TEXTURE_AMBIENT: "./static/data/data-1491838644249-ry33I7YTe.hdr"
    },
    DATA: {
      LINES: {
      },
      POLYGONS: {
      },
      POINTS: {
      }
    }
  },

  // 大屏
  SCREEN: {
    // 交通专题
    TRAFFIC: {
      TEST: 'http://rap2api.taobao.org/app/mock/data/25438'
    }
  }
}

export default API
