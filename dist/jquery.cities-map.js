/*! cities-map - v0.0.1 - 2013-11-05
* https://github.com/TheDahv/cities-map
* Copyright (c) 2013 David Pierce; Licensed MIT */
/*! cities-map - v0.0.1 - 2013-11-05
* https://github.com/TheDahv/cities-map
* Copyright (c) 2013 David Pierce; Licensed MIT */
var root = window;
var CitiesMap = root.CitiesMap = ( root.CitiesMap || {} );

/**
 * CitiesMap.Data
 *
 * A module to manage all functions related to getting data out of the API
 */
var Data = CitiesMap.Data = {};
var $ = jQuery;

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
;(function ($) {

  // Collection method.
  $.fn.citiesmap = function () {};

}(jQuery));
