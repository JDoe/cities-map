/*! cities-map - v0.0.1 - 2013-11-14
* https://github.com/TheDahv/cities-map
* Copyright (c) 2013 David Pierce; Licensed MIT */
/*! cities-map - v0.0.1 - 2013-11-14
* https://github.com/TheDahv/cities-map
* Copyright (c) 2013 David Pierce; Licensed MIT */
(function (root, $) {
  var CitiesMap = root.CitiesMap = ( root.CitiesMap || {} );

  /**
   * CitiesMap.Data
   *
   * A module to manage all functions related to getting data out of the API
   */
  var Data = CitiesMap.Data = {};

  /*
   * loadCitiesData
   *
   * Helps clients load data from the SWOOP API.
   *
   * Takes an options object to specify customizations to the query behavior. Possible options are:
   *    * urlBase - Without a trailing slash, specifies the source of the API provider
   *
   * Returns a jQuery deferred object that can call a success or error function upon fulfillment of the computation
   */
  Data.loadCitiesData = function (opts) {
    var defaultOptions, options;

    opts = opts || {};

    defaultOptions = {
      urlBase: 'http://swoop.startupweekend.org'
    };

    options = $.extend(defaultOptions, opts);

    return $.get('' + options.urlBase + '/cities');
  };
})(window, jQuery);
;(function (root) {
  var google = window.google;
  var maps;
  var CitiesMap = root.CitiesMap = ( root.CitiesMap || {} );

  /**
   * CitiesMap.MapApi - Google Maps Implementation
   *
   * A module to hide away all interaction with the Google Maps API.
   *
   * Full of functions with side effects that manipulate the map in the DOM
   */
  var MapApi = CitiesMap.MapApi = function (mapContainer, mapOptions) {
    this.mapContainer = mapContainer;
    this.options = mapOptions || {};
    this.mapRef = null;
    this.mapPoints = [];

    this.writeMapToElement();

    return this;
  };

  if (google && google.maps) {
    maps = google.maps;
  } else {
    maps = undefined;
  }

  if (typeof maps === 'undefined') {
   window.alert('The Google Maps API is not available at this time.' +
    ' Please try again later');
  } else {

    MapApi.prototype.writeMapToElement = function () {
      var desiredHeight, desiredWidth,
          mapOptions = this.options,
          $element = this.mapContainer;

      mapOptions    = mapOptions || {};
      desiredWidth  = mapOptions.width  || $element.data('width')  || 600;
      desiredHeight = mapOptions.height || $element.data('height') || 400;

      mapOptions.center = new maps.LatLng(-34.397, 150.644);
      mapOptions.zoom = 8;
      mapOptions.mapTypeId = maps.MapTypeId.ROADMAP;

      $element.css('width', desiredWidth);
      $element.css('height', desiredHeight);

      this.mapRef = new maps.Map($element[0], mapOptions);
      return this.mapRef;
    };

    MapApi.prototype.createCityPoint = function (city) {
      var marker = new maps.Marker({
        map: this.mapRef,
        position: new maps.LatLng(city.location[0], city.location[1])
      });

      marker.on('click', this.showCityInfo);

      this.mapPoints.push(marker);

      return marker;
    };
  }

  MapApi.prototype.showCityInfo = function (markerClickEvent) {
    var marker = markerClickEvent.target;
    markerClickEvent.stop();
    return marker;
  };
})(window);
;(function ($, CitiesMap) {
  var Data = CitiesMap.Data;

  // Collection method.
  $.fn.citiesmap = function () {
    var mapContainer = $(this);

    var data = Data.loadCitiesData();
    data.error(function (errorMsg) {
      window.alert(errorMsg);
    });

    data.success(function (cities) {
      var map = new CitiesMap.MapApi(mapContainer);
      cities.forEach(map.createCityPoint);
    });
  };

}(jQuery, CitiesMap));
