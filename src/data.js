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
    var defaultOptions, options,
        deferred = $.Deferred(),
        htmlComputation,
        hasStorage = (typeof(Storage) !== 'undefined');

    opts = opts || {};

    defaultOptions = {
      urlBase: 'http://swoop.startupweekend.org'
    };

    options = $.extend(defaultOptions, opts);

    if (hasStorage && localStorage.upGlobalMapExpiration && localStorage.upGlobalMapExpiration > (new Date()).getTime()) {
      // Pull from cache
      deferred.resolve(JSON.parse(localStorage.upGlobalMapData));
    } else {
      // Pull from SWOOP and cache for the future
      htmlComputation = $.get('' + options.urlBase + '/cities');
      htmlComputation.success(function (cities) {
        localStorage.upGlobalMapExpiration = (new Date()).getTime() + 1000 * 60 * 60 * 24 * 6; // 6 days worth of milliseconds
        localStorage.upGlobalMapData = JSON.stringify(cities);

        deferred.resolve(cities);
      });

      htmlComputation.error(function (err) {
        deferred.reject(err);
      });
    }

    return deferred.promise();
  };
})(window, jQuery);
