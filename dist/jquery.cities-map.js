/*! cities-map - v0.0.3 - 2014-07-28
* https://github.com/StartupWeekend/cities-map
* Copyright (c) 2014 David Pierce; Licensed MIT */
/*! cities-map - v0.0.3 - 2014-07-28
* https://github.com/StartupWeekend/cities-map
* Copyright (c) 2014 David Pierce; Licensed MIT */
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
      urlBase: 'https://swoop.up.co'
    };

    options = $.extend(defaultOptions, opts);

    return $.get('' + options.urlBase + '/cities');
  };
})(window, (typeof jQuery203 === 'undefined' ? jQuery : jQuery203));
;(function (root) {
  var google = window.google;
  var $ = typeof window.jQuery203 === 'undefined' ? window.jQuery : window.jQuery203;
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
          disableDefaultUI: true,
          zoomControl: true,
          showActiveCityToggle: false,
          styles: [
            // Turn off everything
            { 'stylers': [{ visibility: 'off' }] },
            // Turn water back on and flatten the color
            { 'featureType': 'water', 'stylers': [{ 'visibility': 'on'}, { 'color': '#e0ded8' }] },
            // Turn terrain back on
            { 'featureType': 'landscape', 'stylers': [{ visibility: 'on' }, { 'color': '#f4f2eb' }] },
            // Turn administrative and location names back on
            { 'featureType': 'administrative', 'stylers': [{ visibility: 'on' }] }
          ]
        };
    // Helpful reference for any function scopes in the constructor
    var self = this;
    // A jQuery reference to the custom map controls container
    var $mapControls;

    this.mapContainer  = mapContainer;
    this.options       = $.extend(configDefaults, (mapOptions || {}));
    this.options.notificationUrl = 'http://startupweekend.us1.list-manage.com/subscribe/post?u=77bee8d6876e3fd1aa815badb&amp;id=66eed7c427';
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

    this.mapRef               = null;
    this.mapPoints            = {};
    this.markers              = {};
    this.searchControl        = null;

    // A div to contain custom map behavior controls
    // It should only show up if custom controls are enabled
    this.mapControlsContainer = null;
    // The toggle control for filtering to active cities
    this.activeCityToggle     = null;

    this.writeMapToElement();
    this.addFilterControlToMap();

    // As our list of custom map controls grows, we want to see if at least
    // one is turned on so we can add the controls container div to the map
    var turnOnCustomControls = ['showActiveCityToggle'].reduce(function (state, customOption) {
      // Turn on custom controls if we are already in the on state
      // or if this current custom option is marked as True by the client
      return state || (self.options[customOption] === true);
    }, false);

    if (turnOnCustomControls) {
      // We have custom controls, so let's add a container
      this.mapControlsContainer = document.createElement('div');
      this.mapControlsContainer.setAttribute('class', 'mapCustomControls');

      // Add a click handler to open and close the controls container
      $mapControls = $(this.mapControlsContainer);
      $mapControls.click(function () {
        if($mapControls.hasClass('open')) {
          $mapControls.removeClass('open');
        } else {
          $mapControls.addClass('open');
        }
      });

      // Add it to the top of the map next to the filter search bar
      this.mapRef.controls[maps.ControlPosition.TOP_RIGHT].push(this.mapControlsContainer);
    }

    if (this.options.showActiveCityToggle) {
      this.addActiveCityToggle();
    }

    // If the MarkerClustererPlus library is available, enable it on the map
    if (root.MarkerClusterer) {
      this.clusterManager = new root.MarkerClusterer(this.mapRef, [], {
        maxZoom: 8,
        minimumClusterSize: 4,
        calculator: function (markersArray) {

          return {
            'text': (typeof markersArray.length === 'undefined') ? 0 : markersArray.length,
            'index': 0 // Always use the first style available
          };
        },
        styles: [{
          height: 53,
          width: 53,
          url: 'https://s3.amazonaws.com/up-global-cms/misc-assets/up-global-map-grouping.png'
        }]
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

      mapOptions.center    = mapOptions.center ?
        new maps.LatLng(mapOptions.center[0], mapOptions.center[1]) :
        new maps.LatLng(51.4791, 0); // Default to Greenwich, London, UK
      mapOptions.zoom      = mapOptions.zoom || 2;
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
        position : new maps.LatLng(city.location[0], city.location[1]),
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00f09d|00f09d|00f09d'
      });

      marker.addListener('click', markerShowHandler);

      var _id = this.markerId(marker);
      this.mapPoints[_id] = city;
      this.markers[_id] = marker;
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
        markerId   = self.markerId(marker),
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

          // Make sure protocols are correct
          if (programEvent.website && programEvent.website.length > 0) {
            infoUrl = /^https?\:\/\//.test(programEvent.website) ? program.website : 'http://' + programEvent.website;
          }
          if (programEvent.public_registration_url && programEvent.public_registration_url.length > 0) {
            registrationUrl = /^https?:\/\//.test(programEvent.public_registration_url) ? programEvent.public_registration_url : 'http://' + programEvent.public_registration_url;
          }

          // Make sure nothing is undefined
          infoUrl = infoUrl || registrationUrl || 'http://www.startupweekend.org';
          registrationUrl = registrationUrl || infoUrl || 'http://www.startupweekend.org';

          var nickname = '';
          if (programEvent.nickname && programEvent.nickname.length > 0) {
            if (/^startup weekend/i.test(programEvent.nickname)) {
              nickname = ' - ' + programEvent.nickname.replace(/^startup weekend/i, '').trim();
            } else {
              nickname = ' - ' + programEvent.nickname;
            }
          }

          return "<div class='event-row'><p class='event-row__date'>" +
              formattedDate +
                nickname +
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
    var day, mon, days = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday"
      ],
      months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
        ];

    if (typeof date === 'string') {
      date = new Date(date);
    }

    day = days[date.getUTCDay()];
    mon = months[date.getUTCMonth()];

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
   * #addActiveCityToggle
   *
   * Intended to be called in the constructor, this adds a checkbox
   * to toggle the visible map points to those that have a program event
   * in the upcoming weekend for the programs of interest that are
   * active in the map.
   *
   * Note, this will be added to the map controls container when added to the map.
   *
   * Turn this on by passing true for the 'activeCityToggle' option in the
   * map constructor options.
   */
  MapApi.prototype.addActiveCityToggle = function () {
    var self = this,
        checkbox = document.createElement('input'),
        label = document.createElement('label');

    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', 'activeCityCheckbox');

    label.setAttribute('for', 'activeCityCheckbox');
    label.textContent = 'Show Cities This Weekend';

    $(checkbox).change(bind(self.toggleActiveCities, self));

    // Add to map control widget
    self.mapControlsContainer.appendChild(checkbox);
    self.mapControlsContainer.appendChild(label);

    self.activeCityToggle = checkbox;
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
        $searchInput = $(self.searchControl),
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


    $(self.mapContainer).find('.search-results').children().remove();
    $(self.mapContainer).find('.search-results').remove();

    if (searchInput && searchInput.length > 0) {
      var searchResults = $('<ul />', {
        'class': 'search-results'
      }).css({
        position: 'absolute',
        top: $searchInput.position().top + $searchInput.outerHeight() + parseInt($searchInput.css('margin-top'), 10),
        left: $searchInput.position().left,
        width: $searchInput.outerWidth() - 1
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

        // Update the search box to indicate the selected result
        $searchInput.val($(el).text());

        // Close the search results
        $(self.mapContainer).find('.search-results').remove();
      });

      $(self.searchControl).after(searchResults);
    }
  };

  /**
   * Given a Date object, find the most immediate Monday in the calendar
   * and return its date.
   *
   * For example, if it is Sunday, it would return the following date. If it
   * is Tuesday, it will return the date object for 6 days following to get to
   * 'next Monday'
   */
  MapApi.prototype.findNextMonday = function (today) {
    var daysUntilNextMonday, nextMonday;

    // Monday is 1
    daysUntilNextMonday = 8 - today.getDay();
    daysUntilNextMonday = (daysUntilNextMonday === 8) ? 1 : daysUntilNextMonday; // Sunday is 0

    // Add the days in milliseconds
    nextMonday = new Date(today.getTime() + (1000 * 60 * 60 * 24 * daysUntilNextMonday));
    return nextMonday;
  };

  /**
   * Called by the browser event dispatcher when a user clicks on the active city
   * toggle checkbox.
   *
   * It leverages the knowledge of the current date to determine when the following Monday
   * is. It is fair to assume this covers all events that are considered 'this weekend', regardless
   * of whether they start on Thursday, Friday, or Saturday.
   *
   * Once that is determined, it loops through each city and detects the following:
   *    1. Does this city have upcoming events for programs of interest?
   *    2. Of those programs, do any events exist whose start date is the upcoming weekend?
   *
   * For events that pass all detection logic, the corresponding map pin is activated and all others
   * are turned off. It also disables clustering when filtering, and turns it back on when filtering
   * is removed.
   */
  MapApi.prototype.toggleActiveCities = function () {
    var self = this,
        showActiveCities = self.activeCityToggle.checked,
        nextMonday;

    nextMonday = self.findNextMonday(new Date());

    if (this.clusterManager) {
      if (showActiveCities) {
        // Turn off clustering if enabled
        this.clusterManager.setMinimumClusterSize(9999);
      } else {
        // Turn on clustering
        this.clusterManager.setMinimumClusterSize(4);
      }
      this.clusterManager.repaint();
    }

    Object.keys(self.markers).forEach(function (mapKey) {
      var desiredProgramsForCity,
          programsOfInterest = self.options.programsOfInterest,
          hasEventsThisWeekend,
          showThisCity = false;

      if (showActiveCities) {
        desiredProgramsForCity = self.mapPoints[mapKey].upcoming_programs.filter(function (program) {
          // Is this program among the desired programs for this map?
          return (programsOfInterest.indexOf(program.event_type) >= 0);
        });

        hasEventsThisWeekend = desiredProgramsForCity.some(function (program) {
          // Does this program have any events this weekend?
          return program.events.some(function (programEvent) {
            // Does this event start before next Monday?
            return (new Date(programEvent.start_date)) <= nextMonday;
          });
        });

        if (hasEventsThisWeekend) {
          showThisCity = true;
        } else {
          showThisCity = false;
        }
      } else {
        showThisCity = true;
      }

      self.markers[mapKey].setVisible(showThisCity);
    });
  };

  // markers have an id at a property `closure_uid_NNNNNN`
  MapApi.prototype.markerId = function(marker) {
    var _id;
    Object.keys(marker).forEach(function(key){
      if (key.indexOf("closure_uid_") === 0) { _id = key; }
    });
    return marker[_id];
  };

})(window);
;(function ($, CitiesMap) {
  var Data = CitiesMap.Data;

  // Write out the base css for the maps
  var mapStyle = document.createElement('style');
  var css = ".sw-cities-map input[type=checkbox]{visibility:hidden}.sw-cities-map .event-row{border-bottom:1px solid #e1e1e1;padding-bottom:1em}.sw-cities-map .event-row:last-child{border-bottom:0}.sw-cities-map .event-row__notification-trigger{color:green;text-decoration:underline;cursor:pointer}.sw-cities-map .event-row__form-controls:after{content:' | '}.sw-cities-map .event-row__form-target{display:block;height:0;opacity:0;overflow:hidden;transition:height .4s ease-in}.sw-cities-map .event-row__activate-form:checked+.event-row__form-target{display:block;height:1.5em;opacity:1;font-size:2em}.search-results{margin:0;list-style:none;padding-left:0;height:60%;overflow:scroll}.search-results li{background-color:#fff;cursor:pointer;padding:.8em .5em;width:auto;font-family:Helvetica,sans-serif}.search-results li:hover{background-color:#77a5cf}.gm-style-iw{padding-bottom:4em}";
  mapStyle.type = 'text/css';
  if (mapStyle.styleSheet) {
    mapStyle.styleSheet.cssText = css;
  } else {
    mapStyle.appendChild(document.createTextNode(css));
  }

  var head = (document.head || document.getElementsByTagName('head')[0]);
  // Insert base styles high up so they can be overridden
  head.insertBefore(mapStyle, head.firstChild);

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

}((typeof jQuery203 === 'undefined' ? jQuery : jQuery203), CitiesMap));

