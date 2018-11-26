// import API from "../../src/config/api";

var echartsExtend = {};

echartsExtend.getFunction = function (type, funcName, rawFunction, contextObject) {
  var contextObject = contextObject;
  // var baseResolution = 180 / 256;

  var funcs = {
    'ec': {
      'setSeriesData': function (seriesIndex, newData) {
        var seriesModel = this.getModel().getSeriesByIndex(seriesIndex);

        if (!seriesModel) {
          return;
        }

        // seriesModel.restoreData();
        // var data = seriesModel.getInitialData({data: newData}, this.getModel());
        // // wrapData(data, this);
        // seriesModel.dataTask.context.data = data;
        seriesModel.mergeOption({data: newData}, this.getModel());
        this._scheduler.unfinished = true;
      },

      // "enableTiledLoad": function(seriesIndex, mapInstance, tileLoader){
      //     var seriesModel = this.getModel().getSeriesByIndex(seriesIndex);
      //
      //     if(!seriesModel){
      //         return;
      //     }
      //
      //     var chartView = this._api.getViewOfSeriesModel(seriesModel);
      //
      //     if(chartView["enableTiledLoad"]){
      //         chartView.enableTiledLoad(mapInstance, tileLoader, seriesModel);
      //     }
      // },
      //
      // "disableTiledLoad": function(seriesIndex){
      //     var seriesModel = this.getModel().getSeriesByIndex(seriesIndex);
      //
      //     if(!seriesModel){
      //         return;
      //     }
      //
      //     var chartView = this._api.getViewOfSeriesModel(seriesModel);
      //
      //     if(chartView["disableTiledLoad"]){
      //         chartView.disableTiledLoad();
      //     }
      // }
    },
    'egl': {
      'coordSysOption': null,
      'update': function (ecModel, api) {
        var echartsInstance = contextObject.echartsInstance;
        var mapboxModel = echartsInstance.getModel().getComponent('mapbox3D');

        if (mapboxModel) {
          var coordinateSystem = mapboxModel.coordinateSystem;
          var coordinateSystemPrototype = coordinateSystem.constructor.prototype;

          if (!coordinateSystem.setTileDef) {
            // echartsExtend.register(coordinateSystemPrototype, "mapbox3DComponent._mapbox3DModel.coordinateSystem", "_tileOrigin");
            // echartsExtend.register(coordinateSystemPrototype, "mapbox3DComponent._mapbox3DModel.coordinateSystem", "_geoExtent");
            // echartsExtend.register(coordinateSystemPrototype, "mapbox3DComponent._mapbox3DModel.coordinateSystem", "_lod");
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'isWebMercator', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'setTileDef', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'getZoomOfLevel0', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'getWorldSizeOfLevel0', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'getGeoExtent', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'getTileOrigin', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'setCameraOption', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'getScale', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'projectOnTileWithScale', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'unprojectOnTileWithScale', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'updateTransform', {echartsInstance: echartsInstance});
            echartsExtend.register(coordinateSystemPrototype, 'mapbox3DComponent._mapbox3DModel.coordinateSystem', 'dataToPoint', {echartsInstance: echartsInstance});
          }

          if (!coordinateSystem._geoExtent && echartsInstance.coordSysOption) {
            coordinateSystem.setTileDef(echartsInstance.coordSysOption);
          }
        }

        rawFunction.apply(this, arguments);
      }
    },
    'mapbox3DComponent': {
      'updatePostEffect': function (postEffectOptions, api) {
        // contextObject.rawFunc();
        var coordSys = this.coordinateSystem;

        this.option.postEffect = postEffectOptions;
        coordSys.viewGL.setPostEffect(this.getModel('postEffect'), api);

        // this._sceneHelper.setScene(coordSys.viewGL.scene);
        // this._sceneHelper.updateLight(mapbox3DModel);
        //
        // // Update post effects
        // coordSys.viewGL.setPostEffect(mapbox3DModel.getModel('postEffect'), api);
        // coordSys.viewGL.setTemporalSuperSampling(mapbox3DModel.getModel('temporalSuperSampling'));
      }
    },
    'mapbox3DComponent._mapbox3DModel.coordinateSystem': {
      isWebMercator: true,
      setTileDef: function (tileDef) {
        if (!tileDef) {
          return;
        }

        // this.tileSize = tileDef.tileSize || 256;
        this._tileOrigin = tileDef.tileOrigin;
        this._geoExtent = tileDef.fullExtent;
        // this._validExtent = tileDef.validExtent;
        // this.latRange = [tileDef.validExtent.miny, tileDef.validExtent.maxy];
        // this.lngRange = [tileDef.validExtent.minx, tileDef.validExtent.maxx];
        this._lod = tileDef.lod;

        if (this._lod && this._lod.length > 0) {
          this.isWebMercator = false;
        }

        // this.maxValidLatitude = this._geoExtent.maxy;
      },

      getZoomOfLevel0: function () {
        return (this._lod && this._lod.length > 0) ? this._lod[0].ID : 0;
      },

      getGeoExtent: function () {
        if (!this._geoExtent) {
          this.setTileDef(contextObject.echartsInstance.tileDef);
        }

        return this._geoExtent;
      },

      getTileOrigin: function () {
        if (!this._tileOrigin) {
          this.setTileDef(contextObject.echartsInstance.tileDef);
        }

        return this._tileOrigin;
      },

      getWorldSizeOfLevel0: function () {
        var level0Width = 256;
        var level0Height = 256;

        if (!this.isWebMercator) {
          var geoExtent = this.getGeoExtent();
          level0Width = (geoExtent.maxx - geoExtent.minx) / this._lod[0].Resolution;
          level0Height = (geoExtent.maxy - geoExtent.miny) / this._lod[0].Resolution;
        }

        return {width: level0Width, height: level0Height};
      },

      setCameraOption: function (option) {
        // console.info("setCameraOption: option=" + JSON.stringify(option));
        var TILE_SIZE = 512;
        this.bearing = option.bearing;
        this.pitch = option.pitch;

        this.center = option.center;
        this.zoom = option.zoom;

        if (!this._origin) {
          this._origin = this.projectOnTileWithScale(this.center, TILE_SIZE);
        }
        if (this._initialZoom == null) {
          this._initialZoom = this.zoom;
        }

        this.updateTransform();
      },

      getScale: function () {
        var zoomOfLevel0 = this.getZoomOfLevel0() || 0;
        return Math.pow(2, this.zoom - this.zoomOffset - zoomOfLevel0);
      },

      projectOnTileWithScale: function (data, scale, out) {
        var lng = data[0];
        var lat = data[1];
        var x, y;

        if (this.isWebMercator) {
          var PI = Math.PI;
          var lambda2 = lng * PI / 180;
          var phi2 = lat * PI / 180;
          x = scale * (lambda2 + PI) / (2 * PI);
          y = scale * (PI - Math.log(Math.tan(PI / 4 + phi2 * 0.5))) / (2 * PI);
        } else {
          var geoExt = this.getGeoExtent();
          var worldSizeOfLevel0 = this.getWorldSizeOfLevel0();
          // x = (scale / 512) * worldSizeOfLevel0.width * (lng - geoExt.minx) / (geoExt.maxx - geoExt.minx);
          // y = (scale / 512) * worldSizeOfLevel0.height * (geoExt.maxy - lat) / (geoExt.maxy - geoExt.miny);
          x = worldSizeOfLevel0.width * (lng - geoExt.minx) / (geoExt.maxx - geoExt.minx);
          y = worldSizeOfLevel0.height * (geoExt.maxy - lat) / (geoExt.maxy - geoExt.miny);
        }

        out = out || [];
        out[0] = x;
        out[1] = y;
        return out;
      },

      unprojectOnTileWithScale: function (point, scale, out) {
        var x = point[0];
        var y = point[1];

        if (this.isWebMercator) {
          var PI = Math.PI;
          var lambda2 = (x / scale) * (2 * PI) - PI;
          var phi2 = 2 * (Math.atan(Math.exp(PI - (y / scale) * (2 * PI))) - PI / 4);
          out = out || [];
          out[0] = lambda2 * 180 / PI;
          out[1] = phi2 * 180 / PI;
        } else {
          var geoExt = this.getGeoExtent();
          var worldSizeOfLevel0 = this.getWorldSizeOfLevel0();
          // var lng = x * (geoExt.maxx - geoExt.minx) / (worldSizeOfLevel0.width * (scale / 512)) + geoExt.minx;
          // var lat = geoExt.maxy - y * (geoExt.maxy - geoExt.miny) / (worldSizeOfLevel0.height * (scale / 512));
          var lng = x * (geoExt.maxx - geoExt.minx) / (worldSizeOfLevel0.width) + geoExt.minx;
          var lat = geoExt.maxy - y * (geoExt.maxy - geoExt.miny) / (worldSizeOfLevel0.height);
          out = out || [];
          out[0] = lng;
          out[1] = lat;
        }

        return out;
      },

      dataToPoint: function (data, out) {
        var TILE_SIZE = 512;

        if (!this._originInited) {
          debugger // TODO 报错
          var tileOrigin = this.getTileOrigin();
          this._origin = this.projectOnTileWithScale([tileOrigin.x, tileOrigin.y], TILE_SIZE, out);
          this._originInited = true;
        }

        out = this.projectOnTileWithScale(data, TILE_SIZE, out);
        // Add a origin to avoid precision issue in WebGL.
        out[0] -= this._origin[0];
        out[1] -= this._origin[1];
        // PENDING
        out[2] = !isNaN(data[2]) ? data[2] : 0;
        if (!isNaN(data[2])) {
          out[2] = data[2];
          if (this.altitudeExtent) {
            out[2] -= this.altitudeExtent[0];
          }
        }
        return out;
      },

      updateTransform: function () {
        rawFunction.apply(this, arguments);

        var WORLD_SCALE = 0.1;
        // var worldSizeOfLevel0 = this.getWorldSizeOfLevel0();
        // var worldSizeWidth = worldSizeOfLevel0.width * this.getScale();
        // var worldSizeHeight = worldSizeOfLevel0.height * this.getScale();
        var verticalScale;

        if (this.altitudeExtent && !isNaN(this.boxHeight)) {
          var range = this.altitudeExtent[1] - this.altitudeExtent[0];
          verticalScale = this.boxHeight / range * this.getScale() / Math.pow(2, this._initialZoom - this.zoomOffset - this.getZoomOfLevel0());
        } else {
          // verticalScale = worldSize / (2 * Math.PI * 6378000 * Math.abs(Math.cos(this.center[1] * (Math.PI / 180))))
          //   * this.altitudeScale * WORLD_SCALE;
          verticalScale = this.getScale() * 1 / this._lod[0].Resolution * this.altitudeScale * WORLD_SCALE;
        }
        // Include scale to avoid relayout when zooming
        // FIXME Camera scale may have problem in shadow
        var rawScale = this.viewGL.rootNode.scale;
        this.viewGL.rootNode.scale.set(
          rawScale.x, rawScale.y, verticalScale
        );
      }
    },
    // "GlobalModel": {
    //     "addOneSeries": function(seriesOptions){
    //         var currentOptions = this._optionManager.mountOption();
    //         currentOptions.series.push(seriesOptions);
    //         this._optionManager.setOption(currentOptions, optionPreprocessorFuncs);
    //
    //         // this.resetOption("addSeries");
    //         currentOptions = this._optionManager.mountOption(true);
    //         this.mergeOption(currentOptions);
    //     }
    // },
    // "Scheduler": {
    //     "refreshPipelines": function(ecModel){
    //         var scheduler = this;
    //         var pipelineMap = scheduler._pipelineMap || createHashMap();
    //
    //         ecModel.eachSeries(function (seriesModel) {
    //             var progressive = seriesModel.getProgressive();
    //             var pipelineId = seriesModel.uid;
    //
    //             if(pipelineMap.get(pipelineId)){
    //                 return;
    //             }
    //
    //             pipelineMap.set(pipelineId, {
    //                 id: pipelineId,
    //                 head: null,
    //                 tail: null,
    //                 threshold: seriesModel.getProgressiveThreshold(),
    //                 progressiveEnabled: progressive
    //                 && !(seriesModel.preventIncremental && seriesModel.preventIncremental()),
    //                 blockIndex: -1,
    //                 step: Math.round(progressive || 700),
    //                 count: 0
    //             });
    //
    //             pipe(scheduler, seriesModel, seriesModel.dataTask);
    //         });
    //     }
    // },
    'Geo3DBuilder': {
      'updateColorOfPolygonGeometry': function (componentModel, geometry, dataIndex, regionHeight,
                                                vertexOffset, triangleOffset, color) {
        var colorAttr = geometry.attributes.color;
        // var normalAttr = geometry.attributes.normal;
        var polygonInfo = this._getRegionPolygonInfo(dataIndex);
        var vertexCount = polygonInfo.vertexCount;

        for (var p = 0; p < vertexCount; p++) {
          colorAttr.set(vertexOffset + p, color);
          // var curNormal = [];
          // normalAttr.get(vertexOffset + p, curNormal);
          // curNormal[0] *= 10000;
          // curNormal[1] *= 10000;
          // curNormal[2] *= 10000;
          // normalAttr.set(vertexOffset + p, curNormal);
        }

        geometry.dirty();

        return {
          vertexOffset: vertexOffset + polygonInfo.vertexCount,
          triangleOffset: triangleOffset + polygonInfo.triangleCount
        };
      },
      'dispose': function () {
      }
    },
    'Polygon3DView': {
      'updateInstanceStyle': function () {
        function computeOpsItemFromDataItem (opsItem, dataItem, defaultResult) {
          if (!opsItem) {
            return defaultResult;
          } else if (typeof opsItem === 'function') {
            return opsItem(dataItem);
          } else {
            return opsItem;
          }
        }

        return function (newStyle) {
          // var colorNeedsUpdate = newStyle.color !== undefined && newStyle.color !== null;
          // var opacityNeedsUpdate = newStyle.opacity !== undefined && newStyle.opacity !== null;
          var data = this._geo3DBuilderList.length > 0 ? this._geo3DBuilderList[0]._data : [];

          if (data.count() === 0) {
            return;
          }

          newStyle = newStyle || {};
          var componentModel = contextObject.componentModel;
          var api = contextObject.api;

          for (var geoBuilderIndex in this._geo3DBuilderList) {
            var geoBuilder = this._geo3DBuilderList[geoBuilderIndex];
            var polygonMesh = geoBuilder._polygonMesh;
            var linesMesh = geoBuilder._linesMesh;
            var startIndex = geoBuilder._startIndex;
            var endInex = geoBuilder._endIndex;

            var vertexOffset = 0;
            var triangleOffset = 0;
            var hasTranparentRegion = false;

            for (var dataIndex = startIndex; dataIndex < endInex; dataIndex++) {
              var regionModel = componentModel.getRegionModel(dataIndex);

              var visualColor = data.getItemVisual(dataIndex, 'color', true);
              var visualOpacity = data.getItemVisual(dataIndex, 'opacity', true) || 1;
              var rawDataItem = data.getRawDataItem(dataIndex);
              var curDataColor = computeOpsItemFromDataItem(newStyle.color, rawDataItem, visualColor);
              var curDataOpacity = computeOpsItemFromDataItem(newStyle.opacity, rawDataItem, visualOpacity);
              curDataColor[3] = (curDataColor[3] === 0) ? 0 : (curDataColor[3] || 1);
              curDataColor[3] *= curDataOpacity;
              data.setItemVisual(dataIndex, 'color', curDataColor);
              data.setItemVisual(dataIndex, 'opacity', curDataOpacity);
              var isTransparent = curDataOpacity < 0.99;
              hasTranparentRegion = hasTranparentRegion || isTransparent;

              var regionHeight = (regionModel.get('height', true) || regionModel.get('height', true) === 0)
                ? regionModel.get('height', true) : componentModel.get('regionHeight');

              var newOffsets = geoBuilder.updateColorOfPolygonGeometry(
                componentModel, polygonMesh.geometry, dataIndex, regionHeight,
                vertexOffset, triangleOffset, curDataColor
              );

              vertexOffset = newOffsets.vertexOffset;
              triangleOffset = newOffsets.triangleOffset;

              // var borderColor = computeOpsItemFromDataItem(newStyle.borderColor, rawDataItem, [0.8, 0, 0]);
              // borderColor[3] = borderColor[3] === undefined ? 1 : borderColor[3];
              // borderColor[3] *= curDataOpacity;
              // var lineWidth = computeOpsItemFromDataItem(newStyle.borderWidth, rawDataItem, 1);
              // var hasLine = lineWidth > 0;
              // if (hasLine) {
              //     lineWidth *= api.getDevicePixelRatio();
              //     geoBuilder._updateLinesGeometry(
              //         linesMesh.geometry, componentModel, dataIndex, regionHeight, lineWidth,
              //         componentModel.coordinateSystem.transform
              //     );
              // }
              // linesMesh.invisible = !hasLine;
              // linesMesh.material.set({
              //     color: borderColor
              // });
            }

            if (polygonMesh.material.transparent !== hasTranparentRegion) {
              polygonMesh.material.transparent = hasTranparentRegion;
              polygonMesh.material.depthMask = !hasTranparentRegion;
              // var material = polygonMesh.material;
              // polygonMesh.material.set('color', [color[0], color[1], color[2], opacity]);
              // polygonMesh.material.dirtyDefines();
            }
          }
        }
      }(),

      'updateLayerStyle': function () {
        function computeOpsItemFromDataItem (opsItem, dataItem, defaultResult) {
          if (!opsItem) {
            return defaultResult;
          } else if (typeof opsItem === 'function') {
            return opsItem(dataItem);
          } else {
            return opsItem;
          }
        }

        return function (newStyle) {
          var data = this._geo3DBuilderList.length > 0 ? this._geo3DBuilderList[0]._data : [];

          if (data.count() === 0) {
            return;
          }

          newStyle = newStyle || {};
          var inputDataColor = computeOpsItemFromDataItem(newStyle.color, null, null);
          var inputDataOpacity = computeOpsItemFromDataItem(newStyle.opacity, null, NaN);

          for (var geoBuilderIndex in this._geo3DBuilderList) {
            var geoBuilder = this._geo3DBuilderList[geoBuilderIndex];
            var polygonMesh = geoBuilder._polygonMesh;
            // var linesMesh = geoBuilder._linesMesh;

            var material = polygonMesh.material;
            var visualColor = material.get('color');
            var curDataColor = inputDataColor || visualColor;
            var curDataOpacity = (inputDataOpacity === 0) ? 0 : (inputDataOpacity || curDataColor[3] || 1);
            material.set('color', [curDataColor[0], curDataColor[1], curDataColor[2], curDataOpacity]);

            var isTransparent = curDataOpacity < 0.99;

            if (material.transparent !== isTransparent) {
              material.transparent = isTransparent;
              material.depthMask = !isTransparent;
            }

            material.dirtyDefines();

            // var linesMaterial = linesMesh.material;
            // var visualLineColor = linesMaterial.get("color");
            // var borderColor = computeOpsItemFromDataItem(newStyle.borderColor, null, visualLineColor);
            // borderColor[3] = borderColor[3] === undefined ? 1 : borderColor[3];
            // borderColor[3] *= curDataOpacity;
            // var lineWidth = computeOpsItemFromDataItem(newStyle.borderWidth, null, visualLineColor[3]);
            // var hasLine = lineWidth > 0;
            // linesMesh.invisible = !hasLine;
            // linesMaterial.set({
            //     color: borderColor
            // });
            // linesMaterial.transparent = isTransparent;
            // linesMaterial.depthMask = !isTransparent;
            // linesMaterial.dirtyDefines();
          }
          // }
        }
      }(),

      'enableTiledLoad': function (mapboxInstance, tileLoader, seriesModel) {
        var thisObj = this;

        this._mapInstance = mapboxInstance;
        this._onTileChange = function () {
          updateAllTiles(mapboxInstance, seriesModel);
        }

        function updateAllTiles (map, tileLoader, seriesModel) {
          // var zoom = map.getZoom();
          var newTiles = map.transform.coveringTiles({
            tileSize: 256,
            minzoom: undefined,
            maxzoom: undefined,
            roundZoom: undefined
          });

          var tileList = [];

          for (var tileKey in newTiles) {
            var tileObj = newTiles[tileKey].canonical;
            var newTileKey = tileObj.z + '_' + tileObj.x + '_' + tileObj.y;
            tileList.push(newTileKey);
          }

          thisObj.updateTiles(tileList, tileLoader, seriesModel);
        }

        mapboxInstance.on('zoomend', this._onTileChange);

        mapboxInstance.on('moveend', this._onTileChange);
      },

      'disableTiledLoad': function () {
        if (!this._mapInstance) {
          return;
        }

        this._mapInstance.off('zoomend', this._onTileChange);

        this._mapInstance.off('moveend', this._onTileChange);
      },

      'updateTiles': function (tileList, tileLoader, seriesModel) {
        if (!this._geo3DBuilderForTile) {
          this._geo3DBuilderForTile = {};
        }

        var currentGeo3DBuilderForTile = this._geo3DBuilderForTile;
        var newGeo3DBuilderForTile = {};
        var tilesForUpdate = [];
        tileList = tileList || [];

        //更新有效瓦片范围
        tileList.forEach(function (tileKey, index) {
          var currentBuilder = currentGeo3DBuilderForTile[tileKey];

          if (currentBuilder && currentBuilder.builder) {
            newGeo3DBuilderForTile[tileKey] = currentBuilder;
          } else {
            newGeo3DBuilderForTile[tileKey] = {
              builder: null
            };

            tilesForUpdate.push(tileKey);
          }
        });

        //删除不可见瓦片
        for (var key in currentGeo3DBuilderForTile) {
          if (!newGeo3DBuilderForTile[key]) {
            var recordForDelete = currentGeo3DBuilderForTile[key];
            var builderForDelete = recordForDelete.builder;

            this.groupGL.remove(builderForDelete.rootNode);
            builderForDelete.dispose();
            delete currentGeo3DBuilderForTile[key];
          }
        }

        this._geo3DBuilderForTile = newGeo3DBuilderForTile;
        var thisObj = this;

        //加载新瓦片
        for (var i = 0; i < tilesForUpdate.length; i++) {
          tileLoader.load(tilesForUpdate[i], function (tileId, tileData) {
            thisObj.updateDataOfOneTile(tileId, tileData, seriesModel);
          });
        }
        // return tilesForUpdate;
      },

      'updateDataOfOneTile': function (tileId, tileData, seriesModel) {
        if (!this._geo3DBuilderForTile[tileId]) {
          return;
        }

        seriesModel.mergeOption({data: tileData}, this.getModel());
        this.render(seriesModel, ecModel, api);

        var builderRecord = this._geo3DBuilderForTile[tileId];
        builderRecord.builder = this._geo3DBuilderList[0];
        this._geo3DBuilderList = [];

        seriesModel.mergeOption({data: []}, this.getModel());
      }
    }
  };

  if (funcs[type] && funcs[type][funcName]) {
    return funcs[type][funcName];
  } else {
    return null;
  }
};

echartsExtend.doExtend = function (echartsInstance) {
  if (echartsInstance) {
    var zr = echartsInstance._api.getZr();
    var egl = zr.__egl;

    if (egl) {
      echartsExtend.register(egl.__proto__, 'egl', 'update', {echartsInstance: echartsInstance});
    }

    echartsExtend.register(echartsInstance, 'ec', 'setSeriesData');

    echartsInstance.updatePostEffectOfComponents = function (postEffectOptions, componentName) {
      var targetComponent = this.getModel().getComponent('mapbox3D');

      if (targetComponent) {
        if (!targetComponent.updatePostEffect) {
          echartsExtend.register(targetComponent, 'mapbox3DComponent', 'updatePostEffect');
        }

        targetComponent.updatePostEffect(postEffectOptions, this._api);
      }

      this._zr.flush();
    };

    // echartsInstance.addOneSeries = function(seriesOptions){
    //     var targetModel = this._model;
    //
    //     if(!targetModel.addOneSeries){
    //         echartsExtend.register(targetModel, "GlobalModel", "addOneSeries");
    //     }
    //
    //     targetModel.addOneSeries(seriesOptions);
    //
    //     var scheduler = this._scheduler;
    //
    //     if(scheduler.refreshPipelines){
    //         echartsExtend.register(scheduler, "Scheduler", "refreshPipelines");
    //     }
    //
    //     scheduler.refreshPipelines(targetModel);
    //
    //     //未完成，待续
    // };

    echartsInstance.updateStyleOfSeries = function (seriesIndex, newStyle) {
      var seriesModel = this._model.getSeriesByIndex(seriesIndex);
      var chartView = this._api.getViewOfSeriesModel(seriesModel);

      if (chartView._geo3DBuilderList.length > 0 && !chartView._geo3DBuilderList[0].updateColorOfPolygonGeometry) {
        echartsExtend.register(chartView._geo3DBuilderList[0].__proto__, 'Geo3DBuilder', 'updateColorOfPolygonGeometry');
      }

      if (!chartView.updateStyle) {
        echartsExtend.register(chartView, 'Polygon3DView', 'updateLayerStyle', {
          componentModel: seriesModel,
          api: this._api
        });
        echartsExtend.register(chartView, 'Polygon3DView', 'updateInstanceStyle', {
          componentModel: seriesModel,
          api: this._api
        });
      }

      newStyle = newStyle || {};

      if (newStyle.layerStyle) {
        chartView.updateLayerStyle(newStyle.layerStyle);
      }

      if (newStyle.instanceStyle) {
        chartView.updateInstanceStyle(newStyle.instanceStyle);
      }

      this._zr.flush();

      // var childNodes = chartView.groupGL.children();

      // var coordSys = seriesModel.coordinateSystem;
      // if (chartView.__ecgl__) {
      // if ((coordSys && !coordSys.viewGL) && !chartView.viewGL) {
      //     console.error('Can\'t find viewGL of series ' + chartView.id);
      //     return;
      // }
      // var viewGL = (coordSys && coordSys.viewGL) || chartView.viewGL;
      // // TODO Check zlevel not same with component of coordinate system ?
      // var layerGL = getLayerGL(seriesModel);
      // layerGL.addView(viewGL);
      //
      // chartView.afterRender && chartView.afterRender(
      //     seriesModel, ecModel, api, layerGL
      // );
      //
      // setSilent(chartView.groupGL, seriesModel.get('silent'));
    }

    echartsInstance.enableTiledLoad = function (seriesIndex, mapInstance, tileLoader) {
      var seriesModel = this.getModel().getSeriesByIndex(seriesIndex);

      if (!seriesModel) {
        return;
      }

      var chartView = this._api.getViewOfSeriesModel(seriesModel);

      if (!chartView['enableTiledLoad'] && chartView.type === 'polygons3D') {
        echartsExtend.register(chartView, 'Polygon3DView', 'enableTiledLoad');
        echartsExtend.register(chartView, 'Polygon3DView', 'disableTiledLoad');
        echartsExtend.register(chartView, 'Polygon3DView', 'updateTiles');
        echartsExtend.register(chartView, 'Polygon3DView', 'updateDataOfOneTile');
      }

      chartView.enableTiledLoad(mapInstance, tileLoader, seriesModel);
    },

      echartsInstance.disableTiledLoad = function (seriesIndex) {
        var seriesModel = this.getModel().getSeriesByIndex(seriesIndex);

        if (!seriesModel) {
          return;
        }

        var chartView = this._api.getViewOfSeriesModel(seriesModel);

        if (!chartView['disableTiledLoad'] && chartView.type === 'polygons3D') {
          echartsExtend.register(chartView, 'Polygon3DView', 'enableTiledLoad');
          echartsExtend.register(chartView, 'Polygon3DView', 'disableTiledLoad');
          echartsExtend.register(chartView, 'Polygon3DView', 'updateTiles');
          echartsExtend.register(chartView, 'Polygon3DView', 'updateDataOfOneTile');
        }

        chartView.disableTiledLoad();
      }
  }
};

echartsExtend.register = function (targetObject, objectType, funcName, contextObject) {
  if (targetObject) {
    targetObject[funcName] = echartsExtend.getFunction(objectType, funcName, targetObject[funcName], contextObject);
  }
};

// echartsExtend.override = function(targetObject, objectType, funcName, rawFuncContent, newFuncContent){
//     if(targetObject){
//         targetObject[objectType][funcName] = funcContent;
//     }
// };

export default echartsExtend;
