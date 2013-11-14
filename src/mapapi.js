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
