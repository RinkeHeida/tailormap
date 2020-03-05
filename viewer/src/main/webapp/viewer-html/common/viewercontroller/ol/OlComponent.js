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

/* global Ext */

Ext.define("viewer.viewercontroller.ol.OlComponent", {
    extend: "viewer.viewercontroller.controller.Component",
    /**
     * @see viewer.viewercontroller.controller.Component#constructor
     * @param conf the configuration for the component
     * @param frameworkObject the implementing openlayers object
     */
    constructor: function (conf, frameworkObject) {
        viewer.viewercontroller.ol.OlComponent.superclass.constructor.call(this, conf);
        this.frameworkObject = frameworkObject;
    },
    /**
     * Can be overwritten to do something after the component is added.
     */
    doAfterAdd: function () {
    }
});
