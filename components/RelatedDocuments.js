/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
 * StreetView component
 * Creates a Related document window that can be opened bij clicking a button.
 * It generates a list of Documents and tries to get the file extension from the url
 * With the file extention it tries to get the file icon_[fileextension].png in the 
 * resources/images/relatedDocuments/ folder.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.RelatedDocuments",{
    extend: "viewer.components.Component",
    documentImg: null,
    config:{
        name: "Related Documents",
        title: "",
        titlebarIcon : "",
        tooltip : ""
    },
    constructor: function (conf){   
        conf.isPopup=true;        
        viewer.components.RelatedDocuments.superclass.constructor.call(this, conf);
        this.documentImg = new Object();
        this.initConfig(conf);
        this.popup.hide();
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.title,
            icon: me.titlebarIcon,
            tooltip: me.tooltip
        });        
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.reinit,this);
        return this;
    },
    /**
     *When the button is clicked
     */
    buttonClick: function (){
        //console.log("!!!"+this.viewerController);        
        this.reinit();
        this.popup.show();
    },
    /**
     * reinit the window
     */
    reinit: function(){
        var documents=this.getDocuments();
        var html = this.createHtml(documents);
        var contentDiv=Ext.get(this.getContentDiv());
        contentDiv.update("");
        contentDiv.appendChild(html);
        this.loadImages();
    },
    /**
     *Gets all the documents with the selectedContent
     */
    getDocuments: function(){
        var documents = new Object();
        for ( var i = 0 ; i < this.viewerController.app.selectedContent.length ; i ++){
            var contentItem = this.viewerController.app.selectedContent[i];
            var parentDocuments = new Object();
            if(contentItem.type ==  "level"){
                parentDocuments=this.viewerController.getDocumentsInLevel(this.viewerController.app.levels[contentItem.id]);
            }else if(contentItem.type == "appLayer"){
                var parentLevel = this.viewerController.getAppLayerParent(contentItem.id);
                parentDocuments=this.viewerController.getDocumentsInLevel(parentLevel);                
            }
            Ext.apply(documents,parentDocuments);
        }
        return documents;
    },
    /**
     * Make a Ext.Element with the documents in it as a <a href>
     * @param documents the document objects
     * @return Ext.Element with html in it that represents the documents.
     */
    createHtml: function(documents){        
        var html="";
        this.documentImg={};
        html+="<div class='documents_documents'>";
        for (var documentId in documents){
            var doc=documents[documentId];
            html+="<div class='document_entry'>";
                html+="<div class='document_icon'>"
                html+="<img id='img_"+doc.id+"' src=''/>";
                html+="</div>";
                html+="<div class='document_link'>"
                html+="<a target='_blank' href='"+doc.url+"'>"+doc.name+"</a></div>";
            html+="</div>";
            this.documentImg["img_"+doc.id]=doc.url;
        }
        html+="</div>"
        var element=new Ext.Element(document.createElement("div"));
        element.insertHtml("beforeEnd",html);
        
        return element;
    },
    /**
     * Call loadImage for all the images
     */
    loadImages: function(){
        for (var imgId in this.documentImg){
            this.loadImage(imgId,this.documentImg[imgId]);
        }
    },
    /**
     * Load the image icon_<extension>.png Iff the image does not exists then load the default.
     * @param imgId the id of the img element
     * @param path the path of the document.
     */
    loadImage: function (imgId,path){       
        var defaultSrc=contextPath+"/resources/images/relatedDocuments/icon_default.png";        
        var extension=path.substring(path.lastIndexOf(".")+1);
        //check if the extension has a length > 2 and < 4
        if (extension.length <= 4 && extension.length>=2){            
            var image = new Image();
            //var extension=path.substring(lio);
            image.onload=function(){
                Ext.get(imgId).dom.src = image.src
            };
            image.onerror=function(){
                Ext.get(imgId).dom.src = defaultSrc
            };
            image.src=contextPath+"/resources/images/relatedDocuments/icon_"+extension+".png";
        }else{
            Ext.get(imgId).dom.src=defaultSrc;
        }
    }
    
});