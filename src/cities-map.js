/*
 * cities-map
 * 
 *
 * Copyright (c) 2013 David Pierce
 * Licensed under the MIT license.
 */

(function ($, CitiesMap) {
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

