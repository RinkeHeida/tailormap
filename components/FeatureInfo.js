/* 
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * LoadMonitor object.
 * Monitor's the loading with a loadingbar
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.FeatureInfo",{
    extend: "viewer.components.Maptip",   
    progressElement: null,
    constructor: function (conf){
        //don't call maptip constructor but that of super maptip.
        viewer.components.Maptip.superclass.constructor.call(this, conf);        
        this.initConfig(conf);   
        //make the balloon
        this.balloon = new Balloon(this.getDiv(),this.getViewerController().mapComponent,"balloonFeatureInfo",this.width,this.height);
        //listen to the on addlayer
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
         //Add event when started the identify (clicked on the map)
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.onFeatureInfoStart,this);
        //listen to the onmaptipcancel
        //this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_MAPTIP_CANCEL,this.onMaptipCancel,this);        
        //Add the maptip component to the framework
        //conf.type = viewer.viewercontroller.controller.Component.MAPTIP;
        //this.maptipComponent = this.getViewerController().mapComponent.createComponent(conf);
        //this.getViewerController().mapComponent.addComponent(this.maptipComponent);        
        return this;
        /*if (this.popup){
            this.popup.hide();
        }
        this.progressElement = new Ext.Element(document.createElement("div"));
        this.progressElement.addCls("featureinfo_progress");
        //Add event when started the identify (clicked on the map)
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.onFeatureInfo,this);
        
        //TODO if no attribute data configuration available:
        //register ondata event.
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA,this.onGetFeatureInfoData,this);
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_PROGRESS,this.onProgress,this);
        //todo: else with configured attributes:
        
        var contentDiv=Ext.get(this.getContentDiv());
        
        //contentDiv.applyStyles({position: "static"});
        return this;*/
        
    },    
    /**
     * Event handler for when a layer is added to the map
     * @see event ON_LAYER_ADDED
     */
    onAddLayer: function(map,mapLayer){     
        if (mapLayer==null)
            return;
        if(this.isSummaryLayer(mapLayer)){            
            var appLayer=this.viewerController.app.appLayers[mapLayer.appLayerId];
            var layer = this.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
            //do server side getFeature.
            if (layer.hasFeatureType){
                this.activateServerRequest(true);
            }else{
                //listen to the onMaptipData
                mapLayer.registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA,this.onMapData,this);       
            }            
        }
    },
    activateServerRequest: function (sr){       
        if (sr==this.serverRequestEnabled){
            return;
        }
        this.serverRequestEnabled=sr;
        if (this.serverRequestEnabled){
            this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.doServerRequest,this);
            this.featureInfo=Ext.create("viewer.FeatureInfo", {viewerController: this.viewerController});
        }else{
            this.featureInfo=null;
        }
    }
    ,onFeatureInfoStart: function(){
        this.balloon.setContent("");
        this.balloon.hide();
    }/*,
    onGetFeatureInfoData: function(map,options){
        var contentDiv=Ext.get(this.getContentDiv());
        var data=options.data;
        var dataAdded=false;
        var html="";
        html+="<div class='featureinfo_layer'>";
        for (var layerName in data){
            var appLayer = this.viewerController.getApplayer(options.layer.serviceId,layerName);
            html+="<div class='featureinfo_layertitle'>"
                //TODO: Use the alias of the layer???
                html+=appLayer.layerName;          
            html+="</div>";
            html+="<div class='featureinfo_features'>";
            for (var index in data[layerName]){
                dataAdded=true;
                html+="<div class='featureinfo_layername'>"+layerName+"</div>";
                html+="<div class='featureinfo_attributes'>";
                for (var attributeName in data[layerName][index]){
                    html+="<div class='featureinfo_attr'>";
                        html+="<div class='featureinfo_attrname'>"+attributeName+"</div>";
                        html+="<div class='featureinfo_attrvalue'>"+data[layerName][index][attributeName]+"</div>";
                    html+="</div>";
                }
                html+="</div>";
            }            
            html+="</div>";
        }
        html+="</div>";
        if(dataAdded)
            contentDiv.insertHtml("beforeEnd", html);                
    },
    onFeatureInfo: function(map,options){          
        Ext.get(this.getContentDiv()).update("");
        Ext.get(this.getContentDiv()).appendChild(this.progressElement);
        if(this.popup){
            this.popup.show();
        }
        this.setProgress(0);      
        
    },
    onProgress: function(map,options){
        if (options.total==options.nr){
            this.progressElement.hide();
        }else{
            this.progressElement.show();
            //calculate the percentage but add 1 to both because we begin at 0
            var percentage=100/(options.total+1) * (options.nr+1);
            this.setProgress(percentage);      
        }
    },
    setProgress: function (progress){
        this.progressElement.update(""+progress+" %");
    },
    getExtComponents: function() {
        return [];
    }*/
});

