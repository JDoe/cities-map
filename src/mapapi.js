(function (root) {
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

      return new maps.Map($element[0], mapOptions);
    };
  }
})(window);
