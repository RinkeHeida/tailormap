/* 
 * Copyright (C) 2019 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global ol, Ext */
/**
 * @class
 * @description
 * The openlayers map object wrapper
 */
Ext.define("viewer.viewercontroller.ol.OpenLayers5Map", {
    extend: "viewer.viewercontroller.controller.Map",
    layersLoading: null,
    utils: null,
    markerIcons: null,
    restrictedExtent: null,
    /**
     * @constructor
     * @see viewer.viewercontroller.controller.Map#constructor
     */
    constructor: function (config) {
        viewer.viewercontroller.ol.OpenLayers5Map.superclass.constructor.call(this, config);
        this.initConfig(config);
        this.utils = Ext.create("viewer.viewercontroller.ol.Utils");
        var maxBounds = null;
        var me = this;
        if (config.options.maxExtent) {
            maxBounds = this.utils.createBounds(config.options.maxExtent);
        }
        var startBounds;
        if (config.options.startExtent) {
            startBounds = this.utils.createBounds(config.options.startExtent);
        }
        //set the Center point
        if (startBounds) {
            config.center = [(startBounds[0] + startBounds[2]) / 2, (startBounds[1] + startBounds[3]) / 2];
        } else if (maxBounds) {
            config.center = [(maxBounds[0] + maxBounds[2]) / 2, (maxBounds[1] + maxBounds[3]) / 2];
        } else {
            this.config.viewerController.logger.error("No bounds found, can't center viewport");
        }

        config.restrictedExtent = maxBounds;
        this.frameworkMap = new ol.Map({
            target: config.domId,
            controls: ol.control.defaults({zoom: false}),
            keyboardEventTarget: document,
            view: new ol.View({
                projection: config.projection,
                center: config.center,
                resolution: config.resolution,
                resolutions: config.resolutions,
                extent: config.restrictedExtent
            })
        });

        this.restrictedExtent = config.restrictedExtent;
        this.group = new ol.layer.Group();
        this.frameworkMap.setLayerGroup(this.group);


        if (config.options.startExtent) {
            var me = this;
            var handler = function () {
                me.zoomToExtent(config.options.startExtent);
                me.removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED, handler, handler);
            };
            this.addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED, handler, handler);
            this.group.getLayers().on("add", function (args) {
                me.handleEvent(args);
            }, me);
        }

        this.group.getLayers().on('remove', function (args) {
            me.handleEvent(args);
        }, me);

        this.layersLoading = 0;
        this.markerLayer = null;
        this.defaultIcon = {};
        this.markerIcons = {
            "default": {
                "icon": FlamingoAppLoader.get('contextPath') + '/viewer-html/common/openlayers/img/marker.png',
                "defaultSize": 17,
                "align": "bottom"
            },
            "circle": {
                "icon": FlamingoAppLoader.get('contextPath') + '/resources/images/circle.svg',
                "defaultSize": 25,
                "align": "center"
            },
            "spinner": {
                "icon": FlamingoAppLoader.get('contextPath') + '/resources/images/spinner.gif',
                "defaultSize": 17,
                "align": "bottom"
            }
        };
        this.markers = new Object();

        this.addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED, me.layerRemoved, me);

        // Prevents the markerlayer to "disappear" beneath all the layers
        me.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, function () {
            if (me.markerLayer) {
                me.markerLayer.setZIndex(me.frameworkMap.getLayers().getLength() + 1);
            }
        }, me);


        return this;
    },

    /**
     *See @link Map.getAllWMSLayers
     */
    getAllWMSLayers : function(){
        var lagen = new Array();
        for(var i = 0 ; i < this.layers.length;i++){
            if(this.layers[i] instanceof viewer.viewercontroller.ol.OlWMSLayer){
                lagen.push(this.layers[i]);
            }
        }
        return lagen;
    },

    /**
     *See @link Map.getAllVectorLayers
     */
    getAllVectorLayers : function(){
        var lagen = new Array();
        for(var i = 0 ; i < this.layers.length;i++){
            if(this.layers[i] instanceof viewer.viewercontroller.ol.OlVectorLayer){
                lagen.push(this.layers[i]);
            }
        }
        return lagen;
    },

    /**
     *Add a layer. Also see @link Map.addLayer
     **/
    addLayer: function (layer) {
        var me = this;
        this.superclass.addLayer.call(this, layer);
        var map = this.getFrameworkMap();
        var l = layer.getFrameworkLayer();
        if (layer.id === undefined) {
            layer.id = layer.name;
        }
        try {
            l.set('id', layer.id, false);
            l.on("change:visible", function (evt) {
                layer.tempType = evt.type;
                me.handleEvent(layer);
            }, this);
            map.addLayer(l);
        } catch (exception) {
            this.config.viewerController.logger.error(exception);
        }
    },

    /**
     *remove the specific layer. See @link Map.removeLayer
     **/
    removeLayer: function (layer) {
        //remove layer from framework
        this.getFrameworkMap().removeLayer(layer.getFrameworkLayer());
        /**
         *Dont call super because we listen to a remove of the layer with a listener
         *at the framework:
         *viewer.viewercontroller.openlayers.OpenLayersMap.superclass.removeLayer.call(this,layer);
         */
    },

    layerRemoved: function (map, options) {
        var l = options.layer.getFrameworkLayer();
        for (var i = 0; i < this.layers.length; i++) {
            var frameworkLayer = this.layers[i].getFrameworkLayer();
            if (frameworkLayer.get('id') === l.get('id')) {
                this.layers.splice(i, 1);
                break;
            }
        }
    },

    setLayerVisible: function (layer, visible) {
        this.superclass.setLayerVisible.call(this, layer, visible);
        layer.setVisible(visible);
    },

    /**
     * Move the viewport to the maxExtent. See @link Map.zoomToMaxExtent
     **/
    zoomToMaxExtent : function (){
        this.getFrameworkMap().zoomToExtent(this.restrictedExtent);
    },

    /**
     * See @link Map.zoomToExtent
     **/
    zoomToExtent: function (extent) {
        var bounds = this.utils.createBounds(extent);
        this.frameworkMap.getView().fit(bounds, this.frameworkMap.getSize());
    },

    /**
     * See @link Map.zoomToResolution
     */
    zoomToResolution: function (resolution) {
        return this.getFrameworkMap().getView().setZoom(this.getFrameworkMap().getView().getZoomForResolution(resolution));
    },

    /**
     * See @link viewer.viewercontroller.controller.Map#moveTo
     */
    moveTo: function (x, y) {
        var center = [x, y];
        this.getFrameworkMap().getView().setCenter(center);
        new ol.geom.Point(center);
    },

    /**
     * See @link Map.setMaxExtent
     */
    setMaxExtent : function(extent){
        console.log("SetMaxExtent not yet implemented for OL 5");
    },

    /**
     * See @link Map.getMaxExtent
     */
    getMaxExtent : function(){
        return this.restrictedExtent;
    },

    /**
     * See @link Map.getExtent
     */
    getExtent: function () {
        var extent = this.getFrameworkMap().getView().calculateExtent(this.getFrameworkMap().getSize());
        return this.utils.createExtent(extent);
    },

    /**
     *see @link Map.setMarker
     *TODO: marker icon path...
     */
    setMarker: function (markerName, x, y, type) {
        if (this.markerLayer === null) {
            this.markerLayer = new ol.layer.Vector({
                source: new ol.source.Vector({})
            });
            this.frameworkMap.addLayer(this.markerLayer);
        }
        if(!type){
            type = "default";
        }
        if(!Ext.isDefined(this.defaultIcon[type])){
            var marker = this.markerIcons.hasOwnProperty(type) ? this.markerIcons[type] : this.markerIcons['default'];
            this.defaultIcon [type] =  new ol.style.Style({
                image: new ol.style.Icon({
                    src: marker.icon,
                    scale:0.8,
                    anchor: [0.5,1]

                })
            });
        }
        var defaultIcon = this.defaultIcon[type];
        if (this.markers[markerName] === undefined) {
            var positionFeature = new ol.Feature({
                geometry: new ol.geom.Point([x, y])
            });
            positionFeature.setStyle(defaultIcon);
            this.markers[markerName] = positionFeature;
            this.markerLayer.getSource().addFeature(this.markers[markerName]);
        } else {
            this.markers[markerName].setGeometry(new ol.geom.Point([x, y]));
        }
    },

    /**
     * see @link Map.removeMarker
     */
    removeMarker: function (markerName) {
        if (this.markers[markerName] && this.markerLayer !== null) {
            this.markerLayer.getSource().removeFeature(this.markers[markerName]);
            delete this.markers[markerName];
        }
    },

    /**
     * @see Ext.util.Observable#addListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope
     * TODO check events in OL5
     */
    addListener: function (event, handler, scope) {
        var me = this;
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
        if (olSpecificEvent) {
            if (!scope) {
                scope = this;
            }

            if (this.enabledEvents[olSpecificEvent]) {
                this.enabledEvents[olSpecificEvent]++;
            } else {
                this.enabledEvents[olSpecificEvent] = 1;
                this.frameworkMap.on(olSpecificEvent, function (args) {
                    me.handleEvent(args);
                }, me);
            }
        }
        viewer.viewercontroller.ol.OpenLayers5Map.superclass.addListener.call(this, event, handler, scope);
    },

    /**
     * @see Ext.util.Observable#removeListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope
     * TODO check events in OL5
     */
    removeListener: function (event, handler, scope) {
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
        if (olSpecificEvent) {
            if (!scope) {
                scope = this;
            }
            if (this.enabledEvents[olSpecificEvent]) {
                this.enabledEvents[olSpecificEvent]--;
                if (this.enabledEvents[olSpecificEvent] <= 0) {
                    this.enabledEvents[olSpecificEvent] = 0;
                    this.frameworkMap.un(olSpecificEvent, this.handleEvent, this);
                }
            }
            viewer.viewercontroller.ol.OpenLayers5Map.superclass.removeListener.call(this, event, handler, scope);
        } else {
            this.viewerController.logger.warning("Event not listed in OpenLayersMapComponent >" + event + "<. The application  might not work correctly.");
        }
    },

    /**
     * Handles the events fired by OpenLayers.Map and propagates them to the registered objects.
     *
     */
    handleEvent: function (args) {
        if (args.tempType) {
            var event = args.tempType;
        } else {
            var event = args.type;
        }
        var options = {};
        var genericEvent = this.config.viewerController.mapComponent.getGenericEventName(event);
        if (genericEvent === viewer.viewercontroller.controller.Event.ON_LAYER_ADDED) {
            args.id = args.element.get('id');
            options.layer = this.getLayerByOpenLayersId(args.id);
            if (options.layer === undefined) {
                //if no layer found return, dont fire
                return;
            }
        } else if (genericEvent === viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED) {

            options.layer = this.getLayerByOpenLayersId(args.id);
            if (options.layer === undefined) {

                //if no layer found return, dont fire
                return;
            }
            options.visible = options.layer.visible;
        } else if (genericEvent === viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED) {
            args.id = args.element.get('id');
            options.layer = this.getLayerByOpenLayersId(args.id);
            if (options.layer === undefined) {
                //if no layer found return, dont fire
                return;
            }
        } else if (genericEvent === viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT ||
            genericEvent === viewer.viewercontroller.controller.Event.ON_ZOOM_END ||
            genericEvent === viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT) {
            options.extent = this.getExtent();
        } else {
            this.config.viewerController.logger.error("The event " + genericEvent + " is not implemented in the OlMap.handleEvent()");
        }
        this.fireEvent(genericEvent, this, options);
    },

    /**
     *See @link Map.getScale
     *@deprecated, use getResolution because it returns the resolution and not the scale
     */
    getScale: function () {
        return this.getFrameworkMap().getView().getResolution();
    },

    getActualScale: function () {
        var unit = this.getFrameworkMap().getView().getProjection().getUnits();
        var resolution = this.getFrameworkMap().getView().getResolution();
        if (this.unit === "degrees") {
            return "";
        } else {
            var scale = this.utils.getScaleFromResolution(resolution, unit);
            return Math.round(scale);
        }
    },

    /**
     *See @link Map.getResolution
     */
    getResolution: function () {
        return this.getFrameworkMap().getView().getResolution();
    },

    /**
     *See @link Map.getResolutions
     */
    getResolutions: function () {
        return this.getFrameworkMap().getView().getResolutions();
    },

    /**
     *See @link Map.coordinateToPixel
     *@returns {a} pixel object (has a .x and a .y)
     */
    coordinateToPixel : function(x,y){
        var pixel  = this.getFrameworkMap().getPixelFromCoordinate([x,y]);
        return {x: pixel[0], y: pixel[1]};
    },

    pixelToCoordinate : function (x,y){
        var coord = this.getFrameworkMap().getCoordinateFromPixel([x,y]);
        return {x: coord[0],y: coord[1]};
    },

    /**
     *see @link Map.getCenter
     *@return {a} LonLat object with .x references to .lon and .y references to .lat
     */
    getCenter : function(){
        var coord = this.getFrameworkMap().getView().getCenter();
        return {x: coord[0], y: coord[1]};
    },

    getWidth: function () {
        var size = this.frameworkMap.getSize();
        return size[0];
    },

    getHeight: function () {
        var size = this.frameworkMap.getSize();
        return size[1];
    },

    updateSize: function () {
        this.getFrameworkMap().updateSize();
    },

    getLayerByOpenLayersId: function (olId) {
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].frameworkLayer) {
                if (this.layers[i].id === olId) {
                    return this.layers[i];
                }
            }
        }
    },
});
