/*! cities-map - v0.0.1 - 2013-12-17
* https://github.com/TheDahv/cities-map
* Copyright (c) 2013 David Pierce; Licensed MIT */
/*! cities-map - v0.0.1 - 2013-12-17
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
  var $ = window.jQuery;
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
    var configDefaults = {
          programsOfInterest: [],
          notificationUrl: 'http://startupweekend.us1.list-manage.com/subscribe/post?u=77bee8d6876e3fd1aa815badb&amp;id=66eed7c427',
          disableDefaultUI: true
        };

    this.mapContainer  = mapContainer;
    this.options       = $.extend(configDefaults, (mapOptions || {}));
    this.knownPrograms = [
      "Bootcamp",
      "LeanStartup",
      "Marketing",
      "Meetup",
      "NEXT",
      "SW Corporate",
      "Social",
      "Startup Weekend",
      "Summit"
    ];

    this.mapRef        = null;
    this.mapPoints     = {};
    this.markers       = {};
    this.searchControl = null;

    this.writeMapToElement();
    this.addFilterControlToMap();

    // If the MarkerClustererPlus library is available, enable it on the map
    if (root.MarkerClusterer) {
      this.clusterManager = new root.MarkerClusterer(this.mapRef, [], {
        maxZoom: 8,
        minimumClusterSize: 4
      });
    }

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
          mapOptions           = self.options;

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
      this.markers[marker.__gm_id] = marker;
      // If clustering is enabled, add it to the cluster manager
      if (this.clusterManager) {
        this.clusterManager.addMarker(marker);
      }

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
   * #getCityInfoWindowContent
   *
   * Given a city object with data from the API, return an HTML string to
   * display for the map info window
   */
  MapApi.prototype.getCityInfoWindowContent = function (city) {
    var self = this,
        payload = "<div class='sw-cities-map'>",
        programsOfInterest = self.options.programsOfInterest;

    // Filter down to the desired programs to render on the map
    if (programsOfInterest.length === 0) {
      programsOfInterest = self.knownPrograms;
    }

    payload += programsOfInterest.map(function (program) {
      // Loop through programs and add them to the window
      var programContent = "";
      var programData = null;
      var formId;

      city.upcoming_programs.some(function (apiProgram) {
        if (apiProgram.event_type === program) {
          programData = apiProgram;
          return true;
        } else {
          return false;
        }
      });

      programContent += "<h1>" + program + " " + city.city + "</h1>";

      // Unique identifier for this row
      // Borrowed from http://stackoverflow.com/a/2117523
      formId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = (c === 'x' ? r : (r&0x3|0x8));
        return v.toString(16);
      });

      if (programData && programData.events && programData.events.length > 0) {
        // Iterate through and render events
        programContent += programData.events.map(function (programEvent) {
          var formattedDate = self.formatDateString(programEvent.start_date),
            infoUrl,
            registrationUrl;

          infoUrl = /^https?\:\/\//.test(programEvent.website) ? program.website : 'http://' + programEvent.website;
          registrationUrl = /^https?:\/\//.test(programEvent.public_registration_url) ? programEvent.public_registration_url : 'http://' + programEvent.public_registration_url;

          return "<div class='event-row'><p class='event-row__date'>" +
              formattedDate +
                (programEvent.vertical.length > 0 ? (' - ' + programEvent.vertical) : '') + "</p>" +
                "<span class='event-row__form-controls'><a href='" + infoUrl + "'>More Info</a></span>" +
                "<span class='event-row__form-controls'><a href='" + registrationUrl + "'>Sign up</a></span>" +
                "<label for='" + formId + "' class='event-row__notification-trigger'>Future event alerts</label>" +
                "<input id='" + formId + "' type='checkbox' class='event-row__activate-form' />" +
                "<div class='event-row__form-target'>" +
                "<form action='" + self.options.notificationUrl + "' method='POST' target='_blank'>" +
                "<input type='hidden' name='CITY' value='" + city.city + "' />" +
                "<input type='hidden' name='MMERGE3' value='" + program + "' />" +
                "<input type='hidden' name='MMERGE4' value='" + programEvent.vertical + "' />" +
                "<input type='text' name='EMAIL' placeholder='Email Address' /><input type='submit' name='Subscribe' value='Subscribe' />" +
                "</form></div>" +
              "</div>";
        }).join('');
      } else {
        // No event
        programContent += "<div class='event-row'><p class='event-row__date'>No upcoming events</p>" +

            "<span class='event-row__form-controls'><a href=' " + self.programOrganizeRegistrationUrl(program) +  "' target='_blank'>Organize an event</a></span>" +
            "<label for='" + formId + "' class='event-row__notification-trigger'>Future event alerts</label>" +
            "<input id='" + formId + "' type='checkbox' class='event-row__activate-form' />" +
            "<div class='event-row__form-target'>" +
              "<form action='" + self.options.notificationUrl + "' method='POST' target='_blank'>" +
              "<input type='hidden' name='CITY' value='" + city.city + "' />" +
              "<input type='hidden' name='MMERGE3' value='" + program + "' />" +
              "<input type='hidden' name='MMERGE4' value='' />" +
              "<input type='text' name='EMAIL' placeholder='Email Address'/><input type='submit' name='Subscribe' value='Subscribe' />" +
              "</form>" +
            "</div>" +
          "</div>";
      }

      return programContent;
    }).join('');

    payload += "</div>";
    return payload;
  };

  /**
   * #programOrganizeRegistrationUrl
   *
   * Given a program type name, return the corresponding registration URL
   * for that program. If a mapping cannot be found, always default to the
   * UP Global "Become a Leader" form URL
   */
  MapApi.prototype.programOrganizeRegistrationUrl = function (program) {
    switch (program) {
      case 'Startup Weekend':
        return 'http://startupweekend.org/organizer/application/';
      case 'NEXT':
        return 'http://www.swnext.co/get-involved/apply';
      default:
        return 'http://www.up.co/get-involved/become-leader';
    }
  };

  /**
   * #formatDateString
   *
   * Given a date string or date object, return a formatted date
   * string of the format "dddd MMMM DD"
   */
  MapApi.prototype.formatDateString = function (date) {
    var day, mon;
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    switch(date.getUTCDay()) {
      case 0:
        day = "Monday";
        break;
      case 1:
        day = "Tuesday";
        break;
      case 2:
        day = "Wednesday";
        break;
      case 3:
        day = "Thursday";
        break;
      case 4:
        day = "Friday";
        break;
      case 5:
        day = "Saturday";
        break;
      case 6:
        day = "Sunday";
        break;
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

    return day + ", " + mon + " " + date.getUTCDate();
  };

  /**
   * #addFilterControlToMap
   *
   * Intended to be called by the constructor, this adds a search
   * box to the top-right corner of the map UI on the page.
   *
   * It also sets up bindings so that the map system can respond to the
   * user's search queries
   */
  MapApi.prototype.addFilterControlToMap = function () {
    var searchBox = document.createElement('input'),
        self = this;

    searchBox.type = 'search';
    searchBox.setAttribute('results', '');
    searchBox.className = 'map-city-filter';

    // Add to map
    self.mapRef.controls[maps.ControlPosition.TOP_RIGHT].push(searchBox);

    // Set up search query handler
    $(searchBox).on('search', bind(self.handleSearchFilter, self));
    $(searchBox).on('keyup' , bind(self.handleSearchFilter, self));

    self.searchControl = searchBox;
  };

  /**
   * bind
   *
   * An internal method. Helpful for wrapping functions intended to be called
   * by event dispatchers while retaining their intended context
   */
  var bind = function (fn, context) {
    var ctx = context;
    return function () {
      fn.call(ctx, arguments);
    };
  };

  /**
   * #handleSearchFilter
   *
   * Called by the browser event dispatcher when a user types in the map
   * search box.
   *
   * Its intended effect is to loop through all known map points and show
   * or hide the map point based on whether or not the city that it represents
   * matches the user's search term.
   *
   * This implementation does not implement fuzzy searching. Instead, it does
   * a case-insenstive search from the beginning of the city's name.
   */
  MapApi.prototype.handleSearchFilter = function () {
    var self = this, // Note, that "this" can only be "MapApi" if bind is used
        searchInput = self.searchControl.value,
        searchRegex = new RegExp("^" + searchInput, "i"),
        dropdownCities = [];

    Object.keys(self.markers).forEach(function (mapKey) {
      if (searchInput === '' || searchRegex.test(self.mapPoints[mapKey].city)) {
        // Show for empty searches (e.g., clearing) or matching cities
        self.markers[mapKey].setVisible(true);
        if (searchInput.length > 0) { dropdownCities.push(mapKey); }
      } else {
        // Hide for anything else
        self.markers[mapKey].setVisible(false);
      }
    });

    // Generate the dropdown HTML and replace anything that might exist

    var $searchInput = $(self.searchControl);

    $(self.mapContainer).find('.search-results').remove();
    var searchResults = $('<ul />', {
      'class': 'search-results'
    }).css({
      position: 'absolute',
      top: $searchInput.offset().top + $searchInput.height() - 6,
      left: $searchInput.offset().left - 7,
      width: $searchInput.width()
    });

    dropdownCities.forEach(function (cityMarkerId) {
      var cityData = self.mapPoints[cityMarkerId],
          listingTextParts = [cityData.city];

      if (cityData.state) {
        listingTextParts.push(cityData.state);
      }
      if (cityData.country) {
        listingTextParts.push(cityData.country);
      }

      searchResults.append(
        $('<li />').
          text(listingTextParts.join(', ')).
          data('markerid', cityMarkerId)
      );
    });

    searchResults.find('li').on('click', function (evt) {
      // Find the appropriate city and navigate to it
      var el = $(evt.currentTarget);
      var markerid = el.data('markerid');
      var mapPoint = self.mapPoints[markerid];

      self.mapRef.setCenter(new maps.LatLng(mapPoint.location[0], mapPoint.location[1]));
      self.mapRef.setZoom(12); // Be sure to zoom in past any potential clustering

      // Close the search results
      $(self.mapContainer).find('.search-results').remove();
    });

    $(self.searchControl).after(searchResults);
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

