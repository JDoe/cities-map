/*! cities-map - v0.0.1 - 2013-11-05
* https://github.com/TheDahv/cities-map
* Copyright (c) 2013 David Pierce; Licensed MIT */
/*! cities-map - v0.0.1 - 2013-11-05
* https://github.com/TheDahv/cities-map
* Copyright (c) 2013 David Pierce; Licensed MIT */
var root = window;
var CitiesMap = root.CitiesMap = ( root.CitiesMap || {} );

var Data = CitiesMap.Data = {};
var $ = jQuery;

Data.loadCitiesData = function (opts) {
  var defaultOptions, options;

  opts = opts || {};

  defaultOptions = {
    urlBase: 'http://swoop.startupweekend.org'
  };

  options = $.extend(defaultOptions, opts);

  return $.get('' + options.urlBase + '/cities');
};
;(function ($, CitiesMap) {

  // Collection method.
  $.fn.citiesmap = function () {
    CitiesMap.Data.loadCitiesData()
      .error(function () {
      })
      .success(function () {
      });
  };

}(jQuery, CitiesMap));
