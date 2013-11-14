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
  $.fn.citiesmap = function () {
    var mapContainer = $(this);

    var data = Data.loadCitiesData();
    data.error(function (errorMsg) {
      window.alert(errorMsg);
    });

    data.success(function (cities) {
      var map = new CitiesMap.MapApi(mapContainer);
      cities.forEach(map.createCityPoint);
    });
  };

}(jQuery, CitiesMap));
