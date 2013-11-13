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
      cities.forEach(function (city) { window.console.log(city); });
      mapContainer.html(
        "<ul>" +
        cities
          .filter(function (city) { return city.upcoming_programs.length > 0; })
          .map(function (city) { return "<li>" +
            city.city +
            " &ndash; " +
            city.upcoming_programs[0].events[0].website +
            " &ndash; " +
            (new Date(city.upcoming_programs[0].events[0].start_date)).toDateString() +
            "</li>";
          })
          .join('') +
        "</ul>"
      );
    });
  };

}(jQuery, CitiesMap));
