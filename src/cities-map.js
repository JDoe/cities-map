/*
 * cities-map
 * 
 *
 * Copyright (c) 2013 David Pierce
 * Licensed under the MIT license.
 */

(function ($, CitiesMap) {
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

