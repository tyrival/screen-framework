
// import mapboxgl from './mapbox-gl0.48.0.js'

// import mapboxgl from './mapbox-gl0.48.0'
import mapboxgl from './mapbox-gl-dev-proj0.48.0'

import echarts from 'echarts'
//import echarts from './echarts.min'
// import echartslayer from 'echartslayer'
import EchartsLayer from './EchartsLayer'
import './echarts-gl1.1.1.js'
import coordtransform from './coordtransform.js'
//import echartsExtend from './echart-gl-extend'
import API from '../../src/config/api'
import _ from 'lodash'
import * as turf from "@turf/turf";
require('./mapbox-gl.css')

/**
 * echarts-gl里需要直接调用全局对象mapboxgl，否则会报错
 **/
if (window && !window.mapboxgl) {
  window.mapboxgl = mapboxgl
}

/**
 * echartslayer里需要用到全局对象echarts
 */
if (window && !window.echarts) {
  window.echarts = echarts
}

let defaultOptions = {
    mapbox3D: {
        center: API.MAP.DEFAULT.CENTER,
        zoom: API.MAP.DEFAULT.ZOOM,
        pitch: API.MAP.DEFAULT.PITCH,
        bearing: API.MAP.DEFAULT.BEARING,
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
};

var defaultEchartsOptions = {
  GLMap: {
    roam: true
  },
  animation:false,
  coordinateSystem: 'GLMap',
  visualMap: {
	show: false,
	top: 'top',
	min: 0,
	max: 5,
	seriesIndex: 0,
	calculable: true,
	inRange: {
		color: ['blue', 'blue', 'green', 'yellow', 'red']
	}
  },
  series: []
};

var emptyEchartsGLSeries = {
  type: 'scatter3D',
  coordinateSystem: 'mapbox3D',
  data: []
};

var emptyEchartsSeries = {
  type: 'scatter',
  coordinateSystem: 'GLMap',
  data: []
};

var defaultMarkerInnerHTML = '<svg height="41px" width="27px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="#3FB1CE"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>';

var zIndexSetting = {
  marker: 999,
  popup: 1000,
  echartsLayer: 100
}

var SDMap = function (container, options) {
    this.container = container;
    this.mapDom = null;
    this.options = options || defaultOptions;
	this.keyPoint = options.mapbox3D.keyPoint || null;
    this._roads = {};
    this._polygons = {};
    this._regions = {};
    this._points = {};
    this._markers = {};
    this._popups = {};
    this._heats = {};
    this._charts = {};
	this._flows = {};
	this._lines = {};
    this.chart = null;   //echarts-gl实例
    this.echartsLayer = null;
    // this._currentEnvimentOptions = {};
    this._layerIndexMapOfEchartsGL = {};
    this._layerIndexMapOfEcharts = {};
    this._mapboxToken = API.MAP.MAPBOXGL_ACCESS_TOKEN;
	this.TILE_DEF = options.mapbox3D.TILE_DEF||API.MAP.DEFAULT.TILE_DEF;
	this.IS_PROJ = options.mapbox3D.IS_PROJ||API.MAP.DEFAULT.IS_PROJ;

    // this._innerMap;

    this.initialize();
	this.events = {
		click: {},
		zoomend: [],
		mousemove: {},
	}

	this.visibility=true;

};
function coordDistance(coord1,coord2){
	return Math.sqrt(Math.pow(coord1[0]-coord2[0],2)+Math.pow(coord1[1]-coord2[1],2));
}
function PointLine_Disp(xx, yy, x1, y1, x2, y2){
	var a, b, c, ang1, ang2, ang, m;
	var result = 0;
	//分别计算三条边的长度
	a = Math.sqrt((x1 - xx) * (x1 - xx) + (y1 - yy) * (y1 - yy));
	if (a == 0)
		return -1;
	b = Math.sqrt((x2 - xx) * (x2 - xx) + (y2 - yy) * (y2 - yy));
	if (b == 0)
		return -1;
	c = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	//如果线段是一个点则退出函数并返回距离
	if (c == 0)
	{
		result = a;
		return result;
	}
	//如果点(xx,yy到点x1,y1)这条边短
	if (a < b)
	{
		//如果直线段AB是水平线。得到直线段AB的弧度
		if (y1 == y2)
		{
			if (x1 < x2)
				ang1 = 0;
			else
				ang1 = Math.PI;
		}
		else
		{
			m = (x2 - x1) / c;
			if (m - 1 > 0.00001)
				m = 1;
			ang1 = Math.acos(m);
			if (y1 >y2)
				ang1 = Math.PI*2  - ang1;//直线(x1,y1)-(x2,y2)与折X轴正向夹角的弧度
		}
		m = (xx - x1) / a;
		if (m - 1 > 0.00001)
			m = 1;
		ang2 = Math.acos(m);
		if (y1 > yy)
			ang2 = Math.PI * 2 - ang2;//直线(x1,y1)-(xx,yy)与折X轴正向夹角的弧度

		ang = ang2 - ang1;
		if (ang < 0) ang = -ang;

		if (ang > Math.PI) ang = Math.PI * 2 - ang;
		//如果是钝角则直接返回距离
		if (ang > Math.PI / 2)
			return a;
		else
			return a * Math.sin(ang);
	}
	else//如果(xx,yy)到点(x2,y2)这条边较短
	{
		//如果两个点的纵坐标相同，则直接得到直线斜率的弧度
		if (y1 == y2)
			if (x1 < x2)
				ang1 = Math.PI;
			else
				ang1 = 0;
		else
		{
			m = (x1 - x2) / c;
			if (m - 1 > 0.00001)
				m = 1;
			ang1 = Math.acos(m);
			if (y2 > y1)
				ang1 = Math.PI * 2 - ang1;
		}
		m = (xx - x2) / b;
		if (m - 1 > 0.00001)
			m = 1;
		ang2 = Math.acos(m);//直线(x2-x1)-(xx,yy)斜率的弧度
		if (y2 > yy)
			ang2 = Math.PI * 2 - ang2;
		ang = ang2 - ang1;
		if (ang < 0) ang = -ang;
		if (ang > Math.PI) ang = Math.PI * 2 - ang;//交角的大小
		//如果是钝角则直接返回距离
		if (ang > Math.PI / 2)
			return b;
		else
			return b * Math.sin(ang);//如果是锐角，返回计算得到的距离
	}
}
function pointToLineDistance(coord,coords){
	return PointLine_Disp(coord[0], coord[1], coords[0][0], coords[0][1], coords[1][0], coords[1][1]);
}
function pointToLinesDistance(coord,coords){
	var coord1,coord2;
	var minD=null;
	for(var c of coords){
		if(coord1==null){
			coord1=c;
		}else {
			coord2=coord1;
			coord1=c;
			var d=pointToLineDistance(coord,[coord1,coord2]);
			if(minD==null||minD>d)
				minD=d;
		}
	}
	return minD;
}
SDMap.prototype.initialize = function(){
    var containerDom = document.getElementById(this.container);
	var me=this;
    if(!containerDom){
        console.log("请指定地图容器");
        return;
    }

    mapboxgl.Map.prototype._protoOptions = {
      isProj: this.IS_PROJ,
      tileDef: this.TILE_DEF
    };

	this.mapDom = document.createElement("div");
	this.mapDom.style.width="100%";
	this.mapDom.style.height="100%";
	containerDom.append(this.mapDom);

    var myChart = echarts.init(this.mapDom);
    myChart.tileDef = this.TILE_DEF;
    mapboxgl.accessToken = this._mapboxToken;
    myChart.setOption(this.options);

    this.chart = myChart;

    //扩展echarts-gl
    //echartsExtend.doExtend(this.chart);

  mapboxgl.Map.prototype._protoOptions = null;

  var mapboxComp = this.chart.getModel().getComponent('mapbox3D');
  // mapboxComp.coordinateSystem.setTileDef(API.MAP.DEFAULT.TILE_DEF);
  this.chart.coordSysOption = this.TILE_DEF;
	var map = mapboxComp.getMapbox();
	map.on('click', function(e) {
		console.log([e.point.x, e.point.y]);
		for (var id in me.events.click) {
			if (map.getLayer(id)){
				var features = map.queryRenderedFeatures([e.point.x, e.point.y
					//[e.point.x - width / 2, e.point.y - height / 2],
					//[e.point.x + width / 2, e.point.y + height / 2]
				], {
					layers: [id]
				});
				me.events.click[id](features);
			}else if(me._roads[id]){
			    var source=me._roads[id].source;
				var features = [];
				for(var feature of source.features){
					if(pointToLinesDistance([e.lngLat.lng, e.lngLat.lat], feature.geometry.coordinates)<3){
						features.push(feature);
					}
				}
				me.events.click[id](features);
			}else if(me._polygons[id]){
			    var source=me._polygons[id].source;
				var features = [];
				for(var feature of source.features){
					if(turf.booleanPointInPolygon(turf.point([e.lngLat.lng, e.lngLat.lat]), feature)){
						features.push(feature);
					}
				}
				me.events.click[id](features);
			}
		}
	});
	map.on('zoomend', function(e) {
		me.events.zoomend.forEach(function(item) {
			item.handler(e)
		});
	});
	map.on('mousemove', function(e) {
		console.log([e.point.x, e.point.y]);
		for (var id in me.events.mousemove) {
			if (map.getLayer(id)){
				var features = map.queryRenderedFeatures([e.point.x, e.point.y
					//[e.point.x - width / 2, e.point.y - height / 2],
					//[e.point.x + width / 2, e.point.y + height / 2]
				], {
					layers: [id]
				});
				me.events.mousemove[id](features);
			}else if(me._roads[id]){
			    var source=me._roads[id].source;
				var features = [];
				for(var feature of source.features){
					if(pointToLinesDistance([e.lngLat.lng, e.lngLat.lat], feature.geometry.coordinates)<3){
						features.push(feature);
					}
				}
				console.log(features.length);
				me.events.mousemove[id](features);
			}else if(me._polygons[id]){
			    var source=me._polygons[id].source;
				var features = [];
				for(var feature of source.features){
					if(turf.booleanPointInPolygon(turf.point([e.lngLat.lng, e.lngLat.lat]), feature)){
						features.push(feature);
					}
				}
				me.events.mousemove[id](features);
			}
		}
	});
	this.chart.on('click', function(e){

		for (var id in me.events.click) {
			if(me._roads[id] || me._polygons[id]){
			  debugger
			}
		}

	});
	this._getEchartsLayer().chart.on('click', function(e){
		for (var id in me.events.click) {
			if(me._points[id]||me._heats[id]){
			  me.events.click[id](e.data);
			}
		}
	});
};

SDMap.prototype.dataExist = function(id){
    var exist = false;

    if(this._lines[id] || this._roads[id] || this._points[id] || this._polygons[id] || this._markers[id] || this._popups[id] || this._regions[id]||this._charts[id]||this._heats[id]||this._flows[id]){
      exist = true;
    }

    return exist;
}


SDMap.prototype.addHeatMap = function(id, pointsGeojson, options){
	options = options || {};
	var style = options.style || {};
    var features = pointsGeojson.features;
	var points=[];
    for (var feature of features) {
        var lnglats = feature.geometry.coordinates
        points.push(lnglats.concat([feature.properties.value]));
    }
	var heatOptions = {};
	heatOptions = _.assign(heatOptions, {
        type: 'heatmap',
        coordinateSystem: 'GLMap',
        data: points,
		pointSize: 5,
		blurSize: 6
    }, style);

    this._heats[id] = heatOptions;

	this._updateMapLayersOfEcharts();
};

SDMap.prototype.removeHeatMap = function(id){
    if(id && this._heats[id]){
        delete this._heats[id];

        this._updateMapLayersOfEcharts();
    }
};
SDMap.prototype.addFlowMap = function(id, pointJson, options){
	options = options || {};
	var pointStyle = options.pointStyle || {};
	var lineStyle = options.lineStyle || {};

	var pointData=[];
	var lineData=[];
    for (var feature of pointJson.features) {
        var lnglats = feature.geometry.coordinates;
        lineData.push([{
			coord: lnglats,
			value: feature.properties.value,
			name1: feature.properties.name
		}, {
			coord: [113.2878766400,22.8081481500],
			name2: "双牌"
		}]);
		pointData.push({
			name: feature.properties.name,
			value: lnglats.concat([feature.properties.value])
		});
    }
	pointData.push({
		name: "双牌",
		value: [113.2878766400,22.8081481500,0]
	});
	var pointOptions = {};
	pointOptions = _.assign(pointOptions, {
		type: 'effectScatter',
		coordinateSystem: 'GLMap',
		zlevel: 2,
		//animation:false,
		rippleEffect: { //涟漪特效相关配置
			period: '4', //动画的时间
			scale: '2', //动画中波纹的最大缩放比例
			brushType: 'stroke'
		},
		itemStyle:{
			color:"red"
		},
		label: { //图形上的城市文本标签
			normal: {
				show: true,
				position: 'right',
				formatter: '{b}',
				textStyle: {
					color: '#fff',
					fontStyle: 'normal',
					fontFamily: 'arial',
					fontSize: 24
				}
			}
		},
		symbolSize: 50,//function(val) {return Math.sqrt(val[2]) * 10 / Math.sqrt(max);}, //点大小
		data: pointData
	}, pointStyle);

	var lineOptions = {};
	lineOptions = _.assign(lineOptions, { //线
		coordinateSystem: 'GLMap',
		type: 'lines',
		zlevel: 2,
		symbol: ['none', 'none'],
		symbolSize: 0,
		//animation:false,
		lineStyle: {
			normal: {
				width: 1,
				opacity: 0.6,
				color:'red',
                curveness: 0.2
			},
		},
		effect: {
			show: true,
			period: 4, //箭头指向速度，值越小速度越快
			trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
			symbol: 'pin', //箭头图标
			symbolSize: 5, //图标大小
			shadowBlur: 8
		},
		data: lineData
	}, lineStyle);

    this._flows[id] = [pointOptions,lineOptions];

	this._updateMapLayersOfEcharts();
};

SDMap.prototype.removeFlowMap = function(id){
    if(id && this._flows[id]){
        delete this._flows[id];

        this._updateMapLayersOfEcharts();
    }
};
SDMap.prototype.addRoads = function(id, roadGeojson, options){
	options = options || {};
	var style = options.style || {};
    var data = roadGeojson.features;

    var hStep = 300 / (data.length - 1);
    var taxiRoutes=[];
    var i = 0;
    for (var x in data) {
        var lnglats = data[x].geometry.coordinates;
		var routate={
            coords: lnglats,
            value:data[x].properties.value || Math.random()*200
        }
		if(typeof style.myLineStyle=='function'){
			routate.lineStyle=style.myLineStyle(data[x].properties);
		}else if(typeof style.myLineStyle=='string'){
			routate.lineStyle=style.myLineStyle;
		}
        taxiRoutes.push(routate);
    }

    var roadOptions = {
        type: 'lines3D',
        coordinateSystem: 'mapbox3D',
        effect: {
            show: true,
            constantSpeed: 20,
            trailWidth: 2,
            trailLength: 0.8,
            trailOpacity: 1,
            spotIntensity: 30
        },
        lineStyle: {
            width: 0.1,
            color: 'rgb(200, 40, 0)',
            opacity: 1.
        },
        blendMode: 'lighter',
        polyline: true,
        data: taxiRoutes,
		source:roadGeojson
    };
	roadOptions = _.assign({}, roadOptions,style);
	if(options.onClick)
		this.events.click[id]=options.onClick;
	if(options.onMouseMove)
		this.events.mousemove[id]=options.onMouseMove;
    this._roads[id] = roadOptions;

    this._updateMapLayersOfEchartsGL();
};

SDMap.prototype.removeRoads = function(id){
    if(id && this._roads[id]){
        delete this._roads[id];
        delete this.events.click[id];
        delete this.events.mousemove[id];

        this._updateMapLayersOfEchartsGL();
    }
};

SDMap.prototype.addPolygons = function(id, polygonGeojson, options){
  options = options || {};
  var style = options.style || {};
  var regionsData = polygonGeojson.features.map(function(feature){
      var featureRecord = {
          "name": feature.geometry.name,
          "coords":feature.geometry.coordinates,
          "height":feature.properties.height||100
      }

      if(style.color){
        featureRecord.itemStyle = featureRecord.itemStyle || {};

        if(typeof style.color === "function"){
          featureRecord.itemStyle.color = style.color(feature.properties);
        }else{
          featureRecord.itemStyle.color = style.color;
        }
      }

      if(style.opacity){
        featureRecord.itemStyle = featureRecord.itemStyle || {};

        if(typeof style.opacity === "function"){
          featureRecord.itemStyle.opacity = style.opacity(feature.properties);
        }else{
          featureRecord.itemStyle.opacity = style.opacity;
        }
      }

      if(style.showLabel) {
        featureRecord.label = {
          show: true
        };
      }

      return featureRecord;
  });

    var polygonOptions = {
        type: 'polygons3D',
        coordinateSystem: 'mapbox3D',
        data: regionsData,
        shading: 'realistic',
        realisticMaterial: {
            metalness: 1,
            roughness: 0.2,
        },
        progressiveThreshold: 1000,
        progressive: 1000,
		source:polygonGeojson
    };
	if(options.onClick)
		this.events.click[id]=options.onClick;
    this._polygons[id] = polygonOptions;

    this._updateMapLayersOfEchartsGL();
};

SDMap.prototype.removePolygons = function(id){
    if(id && this._polygons[id]){
        delete this._polygons[id];
		delete this.events.click[id];
        this._updateMapLayersOfEchartsGL();
    }
};

SDMap.prototype.addRegions = function(id, polygonGeojson, options){
  this._regions[id]=({geojson:polygonGeojson, options:options});
  let LayerId=id;
  var me=this;
  options = options || {};
  var style = options.style || {};

  polygonGeojson.features.map(function(feature){
    // feature.properties.name = feature.properties.NAME;
    feature.properties.value = Math.floor(Math.random() * 2500);
  });
  //
  // echarts.registerMap('region_haishu', polygonGeojson);
  //
  // var regionsData = polygonGeojson.features.map(function(feature){
  //   var featureRecord = {
  //     // "coords":feature.geometry.coordinates,
  //     // "height":feature.properties.RELHEI||100
  //     "name":feature.properties.NAME,
  //     "value":feature.properties.RELHEI||100
  //   }
  //
  //   if(style.color){
  //     featureRecord.itemStyle = featureRecord.itemStyle || {};
  //
  //     if(typeof style.color === "function"){
  //       featureRecord.itemStyle.color = style.color(feature.properties);
  //     }else{
  //       featureRecord.itemStyle.color = style.color;
  //     }
  //   }
  //
  //   if(style.opacity){
  //     featureRecord.itemStyle = featureRecord.itemStyle || {};
  //
  //     if(typeof style.opacity === "function"){
  //       featureRecord.itemStyle.opacity = style.opacity(feature.properties);
  //     }else{
  //       featureRecord.itemStyle.opacity = style.opacity;
  //     }
  //   }
  //
  //   if(style.showLabel) {
  //     featureRecord.label = {
  //       show: true
  //     };
  //   }
  //
  //   return featureRecord;
  // });
  //
  // var regionOptions = {
  //   type: 'map3D',
  //     map: 'region_haishu',
  //   // coordinateSystem: 'mapbox3D',
  //   shading: 'lambert',
  //   realisticMaterial: {
  //   roughness: 0.2,
  //     metalness: 0
  // },
  //   postEffect: {
  //     enable: true,
  //       SSAO: {
  //       enable: true,
  //         radius: 2,
  //         intensity: 1
  //     }
  //   },
  //   // groundPlane: {
  //   //   show: true
  //   // },
  //   light: {
  //     main: {
  //       intensity: 2,
  //         shadow: true,
  //         shadowQuality: 'high',
  //         alpha: 30
  //     },
  //     ambient: {
  //       intensity: 0
  //     },
  //     // ambientCubemap: {
  //     //   texture: '/asset/get/s/data-1491896094618-H1DmP-5px.hdr',
  //     //     exposure: 1,
  //     //     diffuseIntensity: 1
  //     // }
  //   },
  //   viewControl: {
  //     distance: 50
  //   },
  //   regionHeight: 1,
  //   data: regionsData
  // };
  //
  // // this.options.series.push(polygonOptions);
  // // this.chart.setOption(this.options);
  //
  // this._regions[id] = regionOptions;
  //
  // this._updateMapLayersOfEchartsGL();
	var colorStops=[];
	var opacity=style.opacity||0.8;
	for(var feature of polygonGeojson.features){
		feature.properties.SUID=randomString(6);
		if(style.color){
			if(typeof style.color === "function"){
				colorStops.push([feature.properties.SUID,style.color(feature.properties)]);
			}else{
				colorStops.push([feature.properties.SUID,style.color]);
			}
		}
	};
	var mapboxIns = this.getMapboxInstance();
	if(style.type=="line"){
		var layerOptions = {
			'id': id,
			'source': {
			  "type": "geojson",
			  "data": polygonGeojson
			},
			'type': 'line',
			'paint': {
			  'line-color': {
					"property": "SUID",
					"type": "categorical",
					"stops": colorStops,
					"default": '#F2F12D'
				},
			  'line-opacity': opacity,
			  'line-width': 3
			}
		};
	}else{
		var layerOptions = {
			'id': id,
			'source': {
			  "type": "geojson",
			  "data": polygonGeojson
			},
			'type': 'fill',
			'paint': {
			  'fill-color': {
					"property": "SUID",
					"type": "categorical",
					"stops": colorStops,
					"default": '#F2F12D'
				},
			  'fill-opacity': opacity
			}
		};
	}

  if(options.minzoom !== undefined){
    layerOptions.minzoom = options.minzoom;
  }

  if(options.maxzoom !== undefined){
    layerOptions.maxzoom = options.maxzoom;
  }

	if(options.onClick)
		this.events.click[id]=options.onClick;
  if(mapboxIns.loaded()){
	me.removeRegions(LayerId);
    mapboxIns.addLayer(layerOptions);
  }else{
    mapboxIns.on('load', function(){
	  me.removeRegions(LayerId);
      mapboxIns.addLayer(layerOptions);
    });
  }

};
function randomString(len) {
	len = len || 12;
	var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
	var maxPos = $chars.length;
	var pwd = '';
	for (var i = 0; i < len; i++) {
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}
SDMap.prototype.removeRegions = function(id){
    var mapboxIns = this.getMapboxInstance();
    var layer = mapboxIns.getLayer(id);

	delete this._regions[id];
    if(layer){
      mapboxIns.removeLayer(id);
    }
    if(this.events.click[id]){
        delete this.events.click[id];
    }

    var source = mapboxIns.getSource(id);

    if(source){
      mapboxIns.removeSource(id);
    }
};
SDMap.prototype.addLines = function(id, lineGeojson, options){
	this._lines[id]=({geojson:lineGeojson, options:options});
	let LayerId=id;
	var me=this;
	options = options || {};
	var style = options.style || {};
	var opacity=style.opacity||0.8;
	var width=style.width||2;
	var label=style.label||"";

	var colorStops=[];
	var opacity=style.opacity||0.8;
	for(var feature of lineGeojson.features){
		feature.properties.SUID=randomString(6);
		if(style.color){
			if(typeof style.color === "function"){
				colorStops.push([feature.properties.SUID,style.color(feature.properties)]);
			}else{
				colorStops.push([feature.properties.SUID,style.color]);
			}
		}
	};

	var mapboxIns = this.getMapboxInstance();
	var layerOptions = {
		'id': id,
		'source': {
		  "type": "geojson",
		  "data": lineGeojson
		},
		'type': 'line',
		'paint': {
		  'line-color': {
				"property": "SUID",
				"type": "categorical",
				"stops": colorStops,
				"default": '#4f5660'
			},
		  'line-width': width,
		  'line-opacity': opacity
		}
	};
	var pointGeojson={
		"type": "FeatureCollection",
		"features": []
	};
	lineGeojson.features.map(function(feature){
		var point=turf.pointOnFeature(feature);
		point.properties=feature.properties;
		pointGeojson.features.push(point);
	});
	var layerLableOptions = {
		'id': id+"_label",
		'source': {
		  "type": "geojson",
		  "data": pointGeojson
		},
		'type': 'symbol',
		'layout': {
			'text-field': label,
			"text-font": ["Microsoft YaHei"],
			"text-size": 14
		},
		"paint":{
			"text-color": '#FFFFFF',
			"text-halo-color":'#000000',
			"text-halo-width":1,
			"text-halo-blur":1
		}
	};
	if(options.minzoom !== undefined){
		layerOptions.minzoom = options.minzoom;
	}

	if(options.maxzoom !== undefined){
		layerOptions.maxzoom = options.maxzoom;
	}

	if(options.onClick)
		this.events.click[id]=options.onClick;
	if(mapboxIns.loaded()){
		me.removeLines(LayerId);
		mapboxIns.addLayer(layerOptions);
		//mapboxIns.addLayer(layerLableOptions);
	}else{
		mapboxIns.on('load', function(){
			me.removeRegions(LayerId);
			mapboxIns.addLayer(layerOptions);
			//mapboxIns.addLayer(layerLableOptions);
		});
	}
};
SDMap.prototype.removeLines = function(id){
    var mapboxIns = this.getMapboxInstance();
    var layer = mapboxIns.getLayer(id);
    var layerLabel = mapboxIns.getLayer(id+'_label');

	delete this._lines[id];
    if(layer){
      mapboxIns.removeLayer(id);
    }
	if(layerLabel){
      mapboxIns.removeLayer(id+'_label');
    }
    if(this.events.click[id]){
        delete this.events.click[id];
    }

    var source = mapboxIns.getSource(id);

    if(source){
      mapboxIns.removeSource(id);
    }
};
/**
 * 添加二维点图层，以echarts散点图的方式表示
 * @param id     图层id，需要全局唯一，否则会覆盖同名图层
 * @param pointGeojson   GeoJSON格式
 * @param options.style    echarts的散点图的series options（不包含name/type/coordinateSystem/data，这几个属性值会自动生成并覆盖传入的style中的同名项）
 */
SDMap.prototype.addPoints = function (id, pointGeojson, options) {
  options = options || {};
  var style = options.style || {};
  // var mapboxIns = this.getMapboxInstance();
  // mapboxIns.addLayer({
  //   "id": id,
  //   "type": "symbol",
  //   "source": {
  //     "type": "geojson",
  //     "data": pointGeojson
  //   },
  //   "layout": style
  // });
  // this._points[id] = mapboxIns.getLayer(id);

  var dataForEcharts = [];

  for(var featureId in pointGeojson.features){
    var feature = pointGeojson.features[featureId];

    if(feature.geometry.type !== "Point"){
      console.info("要素类型不是点要素：" + feature.geometry.type);
      continue;
    }

    var coord = feature.geometry.coordinates;

    if(!coord || coord.length < 2){
      continue;
    }

    var newArray = [].concat(feature.geometry.coordinates);
    var value = feature.properties.value || 100;
    newArray = newArray.concat(value);
    dataForEcharts.push({name: feature.properties.title || 't', value: newArray,id: feature.properties.id || '',symbol:feature.properties.symbol,feature:feature});
  }

  var pointOptions = {};
  var type= 'effectScatter';
  if(options.noEffect){
	  type="scatter"
  }
  pointOptions = _.assign(pointOptions, style, {
    name: id,
    type: type,
    coordinateSystem: 'GLMap',
    data: dataForEcharts
  });

  this._points[id] = pointOptions;
  if(options.onClick)
		this.events.click[id]=options.onClick;
  this._updateMapLayersOfEcharts();
}

SDMap.prototype.removePoints = function (id) {
  // let mapboxIns = this.getMapboxInstance();
  // mapboxIns.removeLayer(id);
  if(id && this._points[id]){
    delete this._points[id];
	delete this.events.click[id];
    this._updateMapLayersOfEcharts();
  }
}
/**
 *
 * @param id
 * @param pointGeojson
 * @param style  {element: domElement, offset: [0, 0]}。offset的正方向为向右向下
 */
SDMap.prototype.addMarkers = function (id, pointGeojson, options) {
  options = options || {};
  var style = options.style || {};
  var markers = [];

  for(var featureId in pointGeojson.features){
    var feature = pointGeojson.features[featureId];

    if(feature.geometry.type !== "Point"){
      console.info("要素类型不是点要素：" + feature.geometry.type);
      continue;
    }

    var coord = feature.geometry.coordinates;

    if(!coord || coord.length < 2){
      continue;
    }

    var newStyle = {};

    for(var styleKey in style){
      if(typeof style[styleKey] === "function"){
        newStyle[styleKey] = style[styleKey](feature.properties);
      }else{
        newStyle[styleKey] = style[styleKey];
      }
    }

    // var marker = new mapboxgl.Marker(null, newStyle);
    let markerElement = newStyle.element;

    if(!markerElement){
      markerElement = document.createElement('div');
      markerElement.innerHTML = defaultMarkerInnerHTML;
    }

    markerElement.style.zIndex = zIndexSetting.marker;
	newStyle.element=markerElement;

	if(options.onClick){
		let click=options.onClick;
		markerElement.onclick = function(){
			click(markerElement);
		}
	}
    var marker = new mapboxgl.Marker(newStyle);
    marker.setLngLat(feature.geometry.coordinates);
    markers.push(marker);
  }
  this.removeMarkers(id);
  this._markers[id] = markers;
  var mapboxIns = this.getMapboxInstance();

  for (var markerIndex in markers) {
    markers[markerIndex].addTo(mapboxIns);
  }
}

SDMap.prototype.removeMarkers = function (id) {
  if (id && this._markers[id]) {
    var targetMarkers = this._markers[id];

    for (var key in targetMarkers) {
      targetMarkers[key].remove();
    }

    delete this._markers[id];
  }
}

/**
 *
 * @param id
 * @param pointGeojson
 * @param style  {element: domElement, offset: [0, 0]}。offset的正方向为向右向下
 */
SDMap.prototype.addCharts = function (id, pointGeojson, options) {
  options = options || {};
  var style = options.style || {};
  var charts = [];
  var mapboxIns = this.getMapboxInstance();
  if(typeof style["chartOption"] === "undefined" || style["chartOption"]==null){
	  return;
  }
  this.removeCharts(id);
  for(var featureId in pointGeojson.features){
	var chartOption=clone(style["chartOption"]);
    var feature = pointGeojson.features[featureId];

    if(feature.geometry.type !== "Point"){
      console.info("要素类型不是点要素：" + feature.geometry.type);
      continue;
    }

    var coord = feature.geometry.coordinates;

    if(!coord || coord.length < 2){
      continue;
    }

    var newStyle = {};

    for(var styleKey in style){
      if(typeof style[styleKey] === "function"){
        newStyle[styleKey] = style[styleKey](feature.properties);
      }else{
        newStyle[styleKey] = style[styleKey];
      }
    }
	var series=chartOption.series;
	for(var serie of series){
		if(typeof serie["data"] === "function"){
			serie["data"] = serie["data"](feature.properties);
		}
	}
	var title=chartOption.title;
	if(typeof title["text"] === "function"){
		title["text"] = title["text"](feature.properties);
	}

    if(!newStyle.element){
      newStyle.element = document.createElement('div');
      newStyle.element.innerHTML = defaultMarkerInnerHTML;
    }

    newStyle.element.style.zIndex = zIndexSetting.marker;
    var marker = new mapboxgl.Marker(newStyle);
    marker.setLngLat(feature.geometry.coordinates);
	marker.addTo(mapboxIns)
	var makerChart = echarts.init(newStyle.element);
	makerChart.setOption(chartOption);
	if(options.onClick)
		makerChart.on('click', options.onClick);

    charts.push(marker);
  }

  this._charts[id] = charts;

  /*for (var chartIndex in charts) {
    charts[chartIndex].addTo(mapboxIns);
  }*/
}
var clone = function(v) {
  if(v==null)return v;
  var o = v.constructor === Array ? [] : {};
  for( var key in v) {
    o[key] = typeof v[key] === 'object' ? clone(v[key]) : v[key];
  }
  return o;
}
SDMap.prototype.removeCharts = function (id) {
  if (id && this._charts[id]) {
    var targetCharts = this._charts[id];

    for (var key in targetCharts) {
      targetCharts[key].remove();
    }

    delete this._charts[id];
  }
}

/**
 *
 * @param id
 * @param pointGeojson
 * @param style {anchor: 'bottom', offset: [], closeButton: false, closeOnClick: true, text: '', html: '', domContent: DOMElement}
 */
SDMap.prototype.addPopups = function (id, pointGeojson, options) {
  let popLayerId=id;
  var me=this;
  options = options || {};
  var style = options.style || {};
  var popups = [];

  for(var featureId in pointGeojson.features){
    var feature = pointGeojson.features[featureId];

    if(feature.geometry.type !== "Point"){
      console.info("要素类型不是点要素：" + feature.geometry.type);
      continue;
    }

    var coord = feature.geometry.coordinates;

    if(!coord || coord.length < 2){
      continue;
    }

    var newStyle = {};

    for(var styleKey in style){
      if(typeof style[styleKey] === "function"){
        newStyle[styleKey] = style[styleKey](feature.properties);
      }else{
        newStyle[styleKey] = style[styleKey];
      }
    }

    var popup = new mapboxgl.Popup(newStyle);
    popup.setLngLat(feature.geometry.coordinates);
	popup.on("close",function(){
		var i =me._popups[popLayerId].indexOf(popup);
		me._popups[popLayerId].splice(i, 1);
		if(typeof options.close=='function')
			options.close();
	})
    if(newStyle.text){
      popup.setText(newStyle.text);
    }else if(newStyle.html){
      popup.setHTML(newStyle.html);
    }else if(newStyle.domContent){
      popup.setDOMContent(newStyle.domContent);
    }

    popups.push(popup);
  }
  this.removePopups(id);
  this._popups[id] = popups;
  var mapboxIns = this.getMapboxInstance();

  for (var popupIndex in popups) {
    var curPopup = popups[popupIndex];
    curPopup.addTo(mapboxIns);

    if(curPopup._container){
      curPopup._container.style.zIndex = zIndexSetting.popup;
    }
  }
}

SDMap.prototype.removePopups = function (id) {
  if (id && this._popups[id]) {
    var targetPopups = this._popups[id].concat([]);

    for (var key in targetPopups) {
      targetPopups[key].remove();
    }

    delete this._popups[id];
  }
}

SDMap.prototype.updateEnvironmentOptions = function (environmentOptions) {
    environmentOptions = environmentOptions || {};
    this.options.mapbox3D.postEffect.screenSpaceReflection = this.options.mapbox3D.postEffect.screenSpaceReflection || {};
    this.options.mapbox3D.postEffect.bloom = this.options.mapbox3D.postEffect.bloom || {};
    this.options.mapbox3D.postEffect.depthOfField = this.options.mapbox3D.postEffect.depthOfField || {};
    this.options.mapbox3D.postEffect.screenSpaceAmbientOcclusion = this.options.mapbox3D.postEffect.screenSpaceAmbientOcclusion || {};
    this.options.mapbox3D.postEffect.FXAA = this.options.mapbox3D.postEffect.FXAA || {};

    if(environmentOptions.screenSpaceReflection !== undefined){
        this.options.mapbox3D.postEffect.screenSpaceReflection.enable = environmentOptions.screenSpaceReflection ? true : false;
    }

    if (environmentOptions.bloom !== undefined) {
        this.options.mapbox3D.postEffect.bloom.enable = environmentOptions.bloom ? true : false;
    }

    if (environmentOptions.depthOfField !== undefined) {
        this.options.mapbox3D.postEffect.depthOfField.enable = environmentOptions.depthOfField ? true : false;
    }

    if (environmentOptions.ssao !== undefined) {
        this.options.mapbox3D.postEffect.screenSpaceAmbientOcclusion.enable = environmentOptions.ssao ? true : false;
    }

    if (environmentOptions.fxaa !== undefined) {
        this.options.mapbox3D.postEffect.FXAA.enable = environmentOptions.fxaa ? true : false;
    }

    // this.chart.setOption({mapbox3D: {postEffect: this.options.mapbox3D.postEffect}});
    // this.chart.updatePostEffect(this.options.mapbox3D.postEffect, "mapbox3D");
    this.chart.updatePostEffectOfComponents(this.options.mapbox3D.postEffect, "mapbox3D");
    // this._currentEnvimentOptions = environmentOptions;
}

SDMap.prototype.resize = function () {
    this.chart.resize();
}

SDMap.prototype.setCenter = function(x, y){
    var mapboxIns = this.getMapboxInstance();

    mapboxIns.setCenter([x, y]);
};
SDMap.prototype.setZoom = function(z){
    var mapboxIns = this.getMapboxInstance();

    mapboxIns.setZoom(z);
};
SDMap.prototype.flyTo = function(center,zoom){
    var mapboxIns = this.getMapboxInstance();
	zoom=zoom||mapboxIns.getZoom();
	center=center||mapboxIns.getCenter();
    mapboxIns.flyTo({center: center, zoom: zoom,speed: 1.2,curve:1});
};
SDMap.prototype.getMapboxInstance = function () {
  return this.chart.getModel().getComponent('mapbox3D').getMapbox();
};

SDMap.prototype.updateLayerStyle = function (layerId, style) {
    var layerIndex = this._layerIndexMap[layerId];

    if((layerIndex === null || layerIndex === undefined) && !this._points[layerId]){
        console.log("id为" + layerId + "的图层不存在");
        return;
    }

    if (this._points[layerId]) {
      var mapboxIns = this.getMapboxInstance();

      for (var styleKey in style) {
        mapboxIns.setLayoutProperty(layerId, styleKey, style[styleKey]);
      }
    } else {
      this.chart.updateStyleOfSeries(layerIndex, style);
    }
};

SDMap.prototype._updateMapLayersOfEchartsGL = function () {
    var series = [];
    this._layerIndexMapOfEchartsGL = {};

    for (var lineId in this._roads) {
        this._layerIndexMapOfEchartsGL[lineId] = series.length;
        series.push(this._roads[lineId]);
    }

    for (var polygonId in this._polygons) {
        this._layerIndexMapOfEchartsGL[polygonId] = series.length;
        series.push(this._polygons[polygonId]);
    }

    /*for (var regionId in this._regions) {
      this._layerIndexMapOfEchartsGL[regionId] = series.length;
      series.push(this._regions[regionId]);
    }*/

    if(series.length === 0){
      series.push(emptyEchartsGLSeries);
    }

    this.chart.setOption({
        series: series
    });
}

SDMap.prototype._updateMapLayersOfEcharts = function () {

  this._getEchartsLayer().chart.setOption({
    series: [emptyEchartsSeries]
  });

  var series = [];
  this._layerIndexMapOfEcharts = {};

  for (var pointId in this._points) {
    this._layerIndexMapOfEcharts[pointId] = series.length;
    series.push(this._points[pointId]);
  }
  for (var heatId in this._heats) {
	this._layerIndexMapOfEchartsGL[heatId] = series.length;
	series.push(this._heats[heatId]);
  }

  for (var flowId in this._flows) {
    this._layerIndexMapOfEcharts[flowId] = series.length;
    series=series.concat(this._flows[flowId]);
  }

  if(series.length === 0){
    series.push(emptyEchartsSeries);
  }

  this._getEchartsLayer().chart.setOption({
    series: series
  });
}

SDMap.prototype._getEchartsLayer = function () {
  if (!this.echartsLayer) {
    var mapboxInstance = this.getMapboxInstance();
    // var oldWindowEC = window.echarts;
    // window.echarts = echarts;
    this.echartsLayer = new EchartsLayer(mapboxInstance);
    this.echartsLayer.chart.setOption(defaultEchartsOptions);
    //将echarts的图表置于echarts-gl图表之上
    this.echartsLayer.chart._zr.dom.childNodes[0].style.zIndex = zIndexSetting.echartsLayer;
    // window.echarts = oldWindowEC;
  }

  return this.echartsLayer;
}

SDMap.prototype.hide = function () {
	this.mapDom.style.display = 'none';
	this.visibility=false;
}

SDMap.prototype.show = function () {
	this.mapDom.style.display = '';
	this.visibility=true;
}

SDMap.prototype.clear = function () {
    this._roads = {};
    this._polygons = {};
    this._points = {};
    this._heats = {};
	this._flows = {};
	this._updateMapLayersOfEchartsGL();
	this._updateMapLayersOfEcharts();
	//移除弹窗
	for(var id in this._popups) {
		var popups = this._popups[id];
		for (var key in popups) {
		  popups[key].remove();
		}
	}
    this._popups = {};
	//移除图表标注
	for(var id in this._charts) {
		var charts = this._charts[id];
		for (var key in charts) {
		  charts[key].remove();
		}
	}
    this._charts = {};
	//移除普通标注
	for(var id in this._markers) {
		var markers = this._markers[id];
		for (var key in markers) {
		  markers[key].remove();
		}
	}
    this._markers = {};
	//移除线
	var ids=[];
	for(var id in this._lines) {
		ids.push(id);
	}
	for(var id of ids) {
		this.removeLines(id);
	}
	ids=[];
	//移除区划
	var ids=[];
	for(var id in this._regions) {
		ids.push(id);
	}
	for(var id of ids) {
		this.removeRegions(id);
	}
	ids=[];
}

SDMap.prototype.input = function(map){
	this._roads = map._roads;
    this._polygons = map._polygons;
    this._points = map._points;
    this._heats = map._heats;
	this._flows = map._flows;
	this._popups = map._popups;
	this._charts = map._charts;
	this._markers = map._markers;
	this._lines = map._lines;
	this._regions = map._regions;
	/*
		var trans=null;
		if(this.keyPoint && map.keyPoint){
			trans=new coordtransform(map.keyPoint,this.keyPoint);
		}

		var center = this.getMapboxInstance().getCenter();
		if(trans)
			center=trans.S2T(center[0],center[1]);
		map.setCenter(center.x,center.y);

		var resolution=this.lods[this.getMapboxInstance().getZoom()].Resolution;
		var zoom;
		for(zoom=0;zoom<map.lods.length;zoom++){
			if(map.lods[zoom].Resolution<resolution)
				break;
		}
		map.setZoom(zoom);
	*/
}

SDMap.prototype.switchTo = function(map){
	map.input(this);
	this.clear();
	this.hide();
	map.show();
	map.resize();
}
export default SDMap
