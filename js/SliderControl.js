L.Control.SliderControl = L.Control.extend({
    options: {
        position: 'topright',
        layers: null,
        maxValue: -1,
        minValue: -1,
        markers: null,
        range: false
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this._layer = this.options.layer;
    },

    setPosition: function (position) {
        var map = this._map;

        if (map) {
            map.removeControl(this);
        }

        this.options.position = position;

        if (map) {
            map.addControl(this);
        }
        this.startSlider();
        return this;
    },

    onAdd: function (map) {
        this.options.map = map;

        // Create a control sliderContainer with a jquery ui slider
        var sliderContainer = L.DomUtil.create('div', 'slider', this._container);
        $(sliderContainer).append('<div id="leaflet-slider"><div class="ui-slider-handle"></div><div id="slider-timestamp" style="width:200px; background-color:#FFFFFF;"></div></div>');
        //Prevent map panning/zooming while using the slider
        $(sliderContainer).mousedown(function () {
            map.dragging.disable();
        });
        $(document).mouseup(function () {
            map.dragging.enable();
            //Only show the slider timestamp while using the slider
            $('#slider-timestamp').html('');
            $('#slider-timestamp').css('border','');
        });

        var options = this.options;
        this.options.markers = [];

        //If a layer has been provided: calculate the min and max values for the slider
        if (this._layer) {
            this._layer.eachLayer(function (layer) {
                if (options.minValue === -1) {
                    options.minValue = layer._leaflet_id;
                }
                options.maxValue = layer._leaflet_id;
                options.markers[layer._leaflet_id] = layer;
            });
            this.options = options;
        }
        else {
            console.log("Error: You have to specify a layer via new SliderControl({layer: your_layer});");
        }
        return sliderContainer;
    },

    onRemove: function (map) {
        //Delete all markers which where added via the slider and remove the slider div
        for (i = this.options.minValue; i < this.options.maxValue; i++) {
            map.removeLayer(this.options.markers[i]);
        }
        $('#leaflet-slider').remove();
    },

    startSlider: function () {
        options = this.options;
        $("#leaflet-slider").slider({
            range: options.range,
            value: options.minValue + 1,
            min: options.minValue,
            max: options.maxValue +1,
            step: 1,
            slide: function (e, ui) {
                if(!!options.markers[ui.value]) {
                    //If there is no startTime property, this line has to be removed (or exchanged with a different property)
                    
                    var PrettyDate = new Date(options.markers[ui.value].feature.properties.startTime);
                     
                    //PrettyDate.getMinutes() += '0' + PgetMinutes;
                    var PrettyString = "";
                    PrettyString += PrettyDate.getHours() + ":";
                    PrettyString += (PrettyDate.getMinutes() < 10) ? ("0" + PrettyDate.getMinutes()) : PrettyDate.getMinutes();
 
                    if(options.markers[ui.value].feature.properties.startTime){
                        if(options.markers[ui.value]) $('#slider-timestamp').html('<p style="padding-top:5px;" class="paramTitle">Street Name:</p>' + options.markers[ui.value].feature.properties.streetName + '<p class="paramTitle">Closure Extent:</p>' + options.markers[ui.value].feature.properties.closureExtent + '<p class="paramTitle">Start Time:</p>' + PrettyString + '<p class="paramTitle">End Time:</p>' + options.markers[ui.value].feature.properties.endTime.substr(0, 19) + '<p></p>' );
                        $('#slider-timestamp').css('border','solid black');
                    }
                    if(options.range){
                        for (var i = ui.values[0]; i< ui.values[1]; i++){
                           if(options.markers[i]) map.addLayer(options.markers[i]); 
                        }
                        for (var i = options.maxValue; i > ui.values[1]; i--) {
                            if(options.markers[i]) map.removeLayer(options.markers[i]);
                        }
                        for (var i = options.minValue; i < ui.values[0]; i++) {
                            if(options.markers[i]) map.removeLayer(options.markers[i]);
                        }
                    }else{
                        for (var i = options.minValue; i < ui.value ; i++) {
                            if(options.markers[i]) map.addLayer(options.markers[i]);
                            if(options.markers[i]) {
                               if(options.markers[i].feature.properties.endTime < options.markers[ui.value].feature.properties.startTime) {
                                   if(options.markers[i - 1]) map.removeLayer(options.markers[i - 1]);
                                   if(options.markers[31].feature.properties.endTime < options.markers[ui.value].feature.properties.startTime) map.removeLayer(options.markers[31]);
                            }                           
                        }
                        }
                        for (var i = ui.value; i <= options.maxValue; i++) {
                            if(options.markers[i]) map.removeLayer(options.markers[i]);
                        }
                    }
                }
            }
        });
        map.addLayer(options.markers[options.minValue]);
    }
});

L.control.sliderControl = function (options) {
    return new L.Control.SliderControl(options);
};
