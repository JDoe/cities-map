# UP Global Cities Map

_A smarter map showcasing UP Global cities and programs_

Startup Weekend and its sister programs have always used maps to showcase their reach and impact.

In fact, you can can see the event map plugin [on GitHub](https://github.com/StartupWeekend/swmap) in your
site today if you wanted.

There were a few limitations to this event-centric view of mapping the world:

* Cities without upcoming events wouldn't show up on the map
* There was no way to register interest for future events
* There was no way to apply to organize an event if there wasn't one available

With this map, we are able to showcase all cities in the UP Global family--whether they have
an upcoming event or not.

The only dependencies are on Google Maps and jQuery.

## Usage

Make sure you include [jQuery]() and the [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/tutorial) 
on your page.

You can get a copy of the distribution [development](https://raw.github.com/StartupWeekend/cities-map/master/dist/jquery.cities-map.js) and [production](https://raw.github.com/StartupWeekend/cities-map/master/dist/jquery.cities-map.min.js) versions from GitHub.

Include that on your page as well.

From there, add an HTML element to your page to contain the map. You can either specify
its demensions in pixels in the plugin options, or in the data tags of the element. For example:

`<div id='mapArea' data-width="1000" data-height="600"></div>`

Once that is done, call the jQuery plugin on your map container and pass any options you want to customize:

`$('#mapArea').citiesMap();`

### Options

The plugin takes a set of expected options that you can configure. Pass these in the options array when you
call the plugin. All are optional and have reasonable defaults except for `programsOfInterest`, which you should
specify yourself.

* `programsOfInterest` - An array of programs in a city that you want rendered on the map. If you don't specify this, we will render a program listing for every program we know about. We don't recommend doing this. The known programs are:
    * `Bootcamp`
    * `LeanStartup`
    * `Marketing`
    * `Meetup`
    * `NEXT`
    * `SW Corporate`
    * `Social`
    * `Startup Weekend`
    * `Summit`
* `disableDefaultUI` - A boolean indicating whether Google Maps should render its default map controls. This value is passed directly to Google Maps. Defaults to `false`
* `styles` - An array of [Google Maps style objects](https://developers.google.com/maps/documentation/javascript/styling#style_syntax). This value is passed directly to Google Maps. Defaults to a flat map with most objects turned off except state labels
* `urlBase` - A string indicating the API source of the cities data. This is mostly useful for the UP Global core team since we have access to local test servers. Defaults to `http://swoop.startupweekend.org`
* `center` - An array of length 2 containing two floating point numbers representing the desired central focal point of the map in terms of latitude and longitude. It defaults to Greenwich in London, UK, or `[51.4791, 0]`. This value is passed directly to Google Maps
* `zoom` - An integer value representing the initial zoom level of the map. It defaults to `2`, or zoomed out enough to show the entire world at once. This value is passed directly to Google Maps. Read the [Google Maps Documentation](https://developers.google.com/maps/documentation/javascript/tutorial#MapOptions) for more information.
* `width` - An integer value representing the width of the map object in pixels. If a value is not supplied, the plugin will attempt to read it from the target element's data tags. If not available there, this value defaults to `600`. This value is passed directly to Google Maps.
* `height` - Behaves exactly like `height`, except it affects the height of the map and defaults to `400`

### Styling

The map elements and city information window all have default styles that can be extended. See [our demo page](https://github.com/StartupWeekend/cities-map/blob/master/demo.html) for an example of how we styled the map
controls to match the UP Global branding.

## Release History

* 0.0.1 - 2013-12-18 - Initial release
