import SDMap from './map';

var dataFuncName = {
  'line_true': 'addRoads',
  'line_false': 'removeRoads',
  'polygon_true': 'addPolygons',
  'polygon_false': 'removePolygons',
  'region_true': 'addRegions',
  'region_false': 'removeRegions',
  'point_true': 'addPoints',
  'point_false': 'removePoints',
  'marker_true': 'addMarkers',
  'marker_false': 'removeMarkers',
  'popup_true': 'addPopups',
  'popup_false': 'removePopups',
  'heat_true': 'addHeatMap',
  'heat_false': 'removeHeatMap',
  'chart_true': 'addCharts',
  'chart_false': 'removeCharts',
  'flow_true': 'addFlowMap',
  'flow_false': 'removeFlowMap',
  'staticLine_true': 'addLines',
  'staticLine_false': 'removeLines'
};
var MapApp = function (container, options, remoteProxy) {
  this.maps = [];
  this.map = null;
  for (var mapType in options) {
    if (mapType.indexOf('map') < 0) continue;
    if (this.map == null) {
      this.map = new SDMap(container, {mapbox3D: options[mapType]});
      this.maps.push({type: mapType, map: this.map});
    } else {
      this.maps.push({type: mapType, map: null, mapOption: {container: container, type: {mapbox3D: options[mapType]}}});
    }
  }
  this._remoteProxy = remoteProxy;
};

/**
 * dataId: 数据id，需要唯一
 * dataOptions: {
 *  dataType: string             数据类型：lines、polygons, points
 *  dataUrl: string              数据url
 *  dataProcessor: function                显示还是隐藏
 * }
 * dataStyle: {                       //适用于线和面要素，点要是的style直接用mapbox-gl的layout定义
 *  color: function or string         颜色
 *  opacity: function or number       透明度
 * }
 * visible: boolean                   显示隐藏
 */
MapApp.prototype.updateData = function (dataId, dataSourceOptions, dataStyle, visible) {
  visible = visible === undefined ? true : (visible ? true : false);
  var dataType = dataSourceOptions.dataType;
  var funcName = dataFuncName[dataType + '_' + visible];

  if (!funcName) {
    return;
  }

  var thisObj = this;

  if (visible) {
    if (dataSourceOptions.data) {
      thisObj._doDataLoad(dataId, dataSourceOptions.data, dataStyle, dataSourceOptions.dataProcessor, thisObj.map[funcName]);
    } else if (dataSourceOptions.dataUrl) {
      this._remoteProxy('GET', dataSourceOptions.dataUrl, {}, function (data) {
        // var dp = dataSourceOptions.dataProcessor;
        //
        // if(dp && typeof dp === "function"){
        //   data = dp(data);
        // }
        //
        // thisObj.map[funcName].call(thisObj.map, dataId, data, dataStyle);
        thisObj._doDataLoad(dataId, data, dataStyle, dataSourceOptions.dataProcessor, thisObj.map[funcName]);
      });
    }
  } else {
    thisObj.map[funcName].call(thisObj.map, dataId);
  }
}

MapApp.prototype._doDataLoad = function (dataId, dataContent, dataStyle, dataProcessor, onloadFuncOfMap) {
  var dp = dataProcessor;

  if (dp && typeof dp === 'function') {
    dataContent = dp(dataContent);
  }

  onloadFuncOfMap.call(this.map, dataId, dataContent, dataStyle);
}

MapApp.prototype.setCenter = function (x, y) {
  this.map.setCenter(x, y);
}
MapApp.prototype.setZoom = function (z) {
  this.map.setZoom(z);
}

MapApp.prototype.flyTo = function (c, z) {
  this.map.flyTo(c, z);
}

MapApp.prototype.switchMap = function (i) {
  if (this.map != this.maps[i]) {
    if (this.maps[i].map == null) {
      this.maps[i].map = new SDMap(this.maps[i].mapOption.container, this.maps[i].mapOption.type);
    }
    this.map.switchTo(this.maps[i].map);
    this.map = this.maps[i].map;
  }
}
export default MapApp
