/*
 * Copyright (C) 2015 B3Partners B.V.
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
/**
 * Custom configuration object for HTML configuration
 * @author <a href="mailto:markprins@b3partners.nl">Mark Prins</a>
 */
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    defaultSnapColour: "FF00FF",
    defaultSnapColourOpacity: 50,
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null) {
            configObject = {};
            configObject.snapColour = this.defaultSnapColour;
            configObject.snapColourOpacity = this.defaultSnapColourOpacity;
            configObject.snapFillColour = this.defaultSnapColour;
            configObject.snapFillColourOpacity = this.defaultSnapColourOpacity;
        }
        configObject.showLabelconfig = true;
        configObject.defaultOnLayers = configObject.defaultOnLayers ? configObject.defaultOnLayers  : [];
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.createCheckBoxes(this.configObject.layers, {
            bufferable: true
        },configObject.defaultOnLayers );
        this.addFormItems(configObject);
    },
    addFormItems: function (configObject) {
        this.form.add([{
                xtype: 'colorfield',
                fieldLabel: i18next.t('snapping_config_0'),
                name: 'snapColour',
                value: configObject.snapColour ? configObject.snapColour : this.defaultSnapColour,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'numberfield',
                anchor: '100%',
                name: 'snapColourOpacity',
                fieldLabel: i18next.t('snapping_config_1'),
                value: configObject.snapColourOpacity ? configObject.snapColourOpacity : this.defaultSnapColourOpacity,
                maxValue: 100,
                step: 5,
                minValue: 0,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'colorfield',
                fieldLabel: i18next.t('snapping_config_2'),
                name: 'snapFillColour',
                value: configObject.snapFillColour ? configObject.snapFillColour : this.defaultSnapColour,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'numberfield',
                anchor: '100%',
                name: 'snapFillColourOpacity',
                fieldLabel: i18next.t('snapping_config_3'),
                value: configObject.snapFillColourOpacity ? configObject.snapFillColourOpacity : this.defaultSnapColourOpacity,
                maxValue: 100,
                step: 5,
                minValue: 0,
                labelWidth: this.labelWidth
            }
        ]);
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 400,
                minHeight: 250
            }
        };
    }
});