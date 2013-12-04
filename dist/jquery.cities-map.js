/*! cities-map - v0.0.1 - 2013-12-04
* https://github.com/TheDahv/cities-map
* Copyright (c) 2013 David Pierce; Licensed MIT */
/*! cities-map - v0.0.1 - 2013-12-04
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
    this.options      = mapOptions || {};
    this.mapRef       = null;
    this.mapPoints    = {};

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

    /**
     * #writeMapToElement
     *
     * Takes the instance's reference to the map container DOM element and writes a Google Map
     * into it.
     *
     * This Google Map instance is added to the object's list of references.
     *
     * This method also creates the object's GMaps InfoWindow instance shared across all
     * markers on the map.
     *
     * While this could be called explicitly, it is intended to be an internal method called
     * by the object's constructor, and assumes the map container is already known and assigned.
     *
     * It also assumes that the DOM element is a jQuery instance.
     *
     * Returns a reference to the GMaps object for anybody who happens to be interested.
     */
    MapApi.prototype.writeMapToElement = function () {
      var self = this,
          desiredHeight, desiredWidth,
          $element             = self.mapContainer,
          mapOptions           = {};

      mapOptions.center    = new maps.LatLng(-34.397, 150.644);
      mapOptions.zoom      = 8;
      mapOptions.mapTypeId = maps.MapTypeId.ROADMAP;

      // Assign instance references to the internal map interface objects
      self.mapRef             = new maps.Map($element[0], mapOptions);
      self.infoWindowInstance = new maps.InfoWindow({ map: self.mapRef });

      // Set up map UI options
      desiredWidth            = mapOptions.width  || $element.data('width')  || 600;
      desiredHeight           = mapOptions.height || $element.data('height') || 400;

      // Set the map container dimensions
      $element.css('width', desiredWidth);
      $element.css('height', desiredHeight);

      return this.mapRef;
    };

    /**
     * #createCityPoint
     *
     * Given an object containing city data and a marker click handler, this method
     * creates a marker on the map representing that city's location and information.
     *
     * It also adds the city to the object's lookup table of marker ID's to city data.
     */
    MapApi.prototype.createCityPoint = function (city, markerShowHandler) {
      var marker = new maps.Marker({
        map      : this.mapRef,
        position : new maps.LatLng(city.location[0], city.location[1])
      });

      marker.addListener('click', markerShowHandler);

      this.mapPoints[marker.__gm_id] = city;

      return marker;
    };
  }

  /**
   * #getMarkerShowHandler
   *
   * Creates a map marker click handler with a cached reference to the
   * MapApi instance. 
   *
   * The returned function will use the shared reference to provide click handlers
   * for each point
   */
  MapApi.prototype.getMarkerShowHandler = function () {
    // Cache the instance reference since this function will usually
    // be called from a dispatched event and will execute within the global scope
    var self = this,
        map = self.mapRef,
        infoWindow = self.infoWindowInstance;

    // Return the function that will actually be called by the event dispatcher
    return function (markerClickEvent) {
      var marker = this,
          markerId   = marker.__gm_id,
          cityData   = self.mapPoints[markerId];

      infoWindow.setContent(self.getCityInfoWindowContent(cityData));

      // Open the info window over the clicked marker
      infoWindow.open(map, marker);
      // Prevent any other map click handlers from running
      markerClickEvent.stop();

      return false;
    };
  };

  /**
   * Given a city object with data from the API, return an HTML string to
   * display for the map info window
   */
  MapApi.prototype.getCityInfoWindowContent = function (city) {
    var self = this,
        payload = "<h1>" + city.city + "</h1>";

    // Loop through programs and add them to the window
    payload += city.upcoming_programs.map(function (program) {
      var programContent = "";

      programContent += "<h2>Upcoming for " + program.event_type + "</h2>";
      programContent += "<ul>";
      programContent += program.events.map(function (programEvent) {
        var formattedDate = self.formatDateString(programEvent.start_date);
        return "<li>" +
            "<a href='" + programEvent.public_registration_url + "' target='_blank'>" +
              (programEvent.vertical.length > 0  ? (programEvent.vertical + ' ') : '') +
              formattedDate +
            "</a>" +
          "</li>";
      }).join('');

      programContent += "</ul>";

      return programContent;
    }).join('');

    return payload;
  };

  MapApi.prototype.formatDateString = function (date) {
    var mon;
    if (typeof date === 'string') {
      date = new Date(date);
    }

    switch(date.getUTCMonth()) {
      case 0:
        mon = "January";
        break;
      case 1:
        mon = "February";
        break;
      case 2:
        mon = "March";
        break;
      case 3:
        mon = "April";
        break;
      case 4:
        mon = "May";
        break;
      case 5:
        mon = "June";
        break;
      case 6:
        mon = "July";
        break;
      case 7:
        mon = "August";
        break;
      case 8:
        mon = "September";
        break;
      case 9:
        mon = "October";
        break;
      case 10:
        mon = "November";
        break;
      case 11:
        mon = "December";
        break;
      default:
        mon = "";
        break;
    }

    return date.getUTCDate() + " " + mon + ", " + date.getUTCFullYear();
  };
})(window);
;(function ($, CitiesMap) {
  var Data = CitiesMap.Data;

  // Collection method.
  $.fn.citiesmap = function (opts) {
    var mapContainer = $(this);

    var data = Data.loadCitiesData(opts);
    data.error(function (errorMsg) {
      window.alert(errorMsg);
    });

    data.success(function (cities) {
      var map     = new CitiesMap.MapApi(mapContainer, opts),
          handler = map.getMarkerShowHandler();

      cities.forEach(function (city) {
        map.createCityPoint.call(map, city, handler);
      });
    });
  };

}(jQuery, CitiesMap));

