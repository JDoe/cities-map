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
