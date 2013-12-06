var fakeElement = {
  data: function () { return undefined; }
, css: function () { return 0; }
};

describe('CitiesMap.MapApi', function () {
  it('should make the constructor available', function () {
    CitiesMap.MapApi.should.exist.and.be.a('function');
  });

  describe('expected constructor result', function () {
    var instance, gMapsStub;
    beforeEach(function () {

      gMapsStub = {
        Map: sinon.spy(google.maps, 'Map'),
        Marker: sinon.stub(google.maps, 'Marker', function () {
          return {
            addListener: function (event, func) {
              this.func = func;
            },
            trigger: function () {
              this.func({
               target: {
                  getMap: function () { }
                 }
              , stop: function () {}
              }
            );
            }
          };
        }),
        LatLng: sinon.spy(google.maps, 'LatLng'),
        InfoWindow: sinon.stub(google.maps, 'InfoWindow', function () {
          return {
            setContent: function () {},
            open: function () {}
          };
        })
      };

      instance = new CitiesMap.MapApi(fakeElement);
    });

    afterEach(function () {
      var prop;
      for (prop in gMapsStub) {
        if (gMapsStub.hasOwnProperty(prop) && gMapsStub[prop].restore) {
          gMapsStub[prop].restore();
        }
      }
      delete instance;
    });

    it('should have a writeMapToElement instance method', function () {
      instance.should.have.property('writeMapToElement');
      instance.writeMapToElement.should.be.a('function');
    });

    it('should try to call Google Maps when instantiating', function () {
      gMapsStub.Map.calledOnce.should.be.true;
    });

    describe('#createCityPoint', function () {
      it('should have an instance method to add map points', function () {
        instance.should.have.property('createCityPoint');
        instance.createCityPoint.should.be.a('function');
      });

      it('should call the GMaps Marker function', function () {
        var prop = instance.createCityPoint({ location: [100, 100] }, function () { });
        gMapsStub.Marker.calledOnce.should.be.true;
      });

      it('should add a new marker to the instance collection of markers', function () {
        instance.should.have.property('mapPoints');
        Object.keys(instance.mapPoints).length.should.eq(0);
        instance.createCityPoint({ location: [100, 100] }, function () { });
        Object.keys(instance.mapPoints).length.should.eq(1);
      });

      it('should bind #getMarkerShowHandler result to click event when clicked', function () {
        var getMarkerShowHandlerSpy = sinon.spy(instance, 'getMarkerShowHandler');
        var marker = instance.createCityPoint({ location: [100, 100] }, getMarkerShowHandlerSpy);
        marker.trigger('click');

        getMarkerShowHandlerSpy.calledOnce.should.be.true;
      });
    });

    describe('#getMarkerShowHandler', function () {
      it('should return another function', function () {
        var func = instance.getMarkerShowHandler();
        func.should.be.a('function');
      });

      describe('the generated handler function', function () {
        var generatedHandler,
            eventStub,
            markerStub,
            setContentSpy,
            openSpy,
            getContentSpy,
            dateSpy;

        beforeEach(function () {
          generatedHandler = instance.getMarkerShowHandler();
          getContentSpy = sinon.spy(instance, 'getCityInfoWindowContent');
          dateSpy = sinon.stub(instance, 'formatDateString').returns('');
          eventStub = { stop: function () {} };
          markerStub = { '__gm_id': 1 };
          instance.mapPoints = {
            1: {
              city: 'Test City',
              upcoming_programs: [
                {
                  "event_type" : "Startup Weekend",
                  "events" : [
                    {
                      "vertical" : "",
                      "public_registration_url" : "http:\/\/www.eventbrite.com\/event\/7861362547",
                      "website" : "paris.startupweekend.org",
                      "_id" : "5276e3936e401802000002ca",
                      "start_date" : "2013-11-22T00:00:00.000Z",
                      "event_type" : "Startup Weekend"
                    }
                  ]
                }
              ]
            }
          };

          setContentSpy = sinon.spy(instance.infoWindowInstance, 'setContent'),
          openSpy = sinon.spy(instance.infoWindowInstance, 'open');
        });

        afterEach(function () {
          var prop;
          for(prop in instance) {
            if (instance.hasOwnProperty(prop) && instance[prop].restore) {
              instance[prop].restore();
            }
          }
        });

        it('should call #setContent on the infoWindow instance reference', function () {
          generatedHandler.call(markerStub, eventStub);
          setContentSpy.calledOnce.should.be.true;
        });

        it('should call #open on the infoWindow instance reference', function () {
          generatedHandler.call(markerStub, eventStub);
          openSpy.calledOnce.should.be.true;
          openSpy.calledWith(instance.mapRef, markerStub);
        });

        it('should call #getCityInfoWindowContent', function () {
          generatedHandler.call(markerStub, eventStub);
          getContentSpy.calledOnce.should.be.true;
          getContentSpy.calledWith(instance.mapPoints[1]).should.be.true;
        });
      });
    });

    describe('#getCityInfoWindowContent', function () {
      var dateSpy,
          sampleCityData = {
            "upcoming_programs" : [
              {
                "event_type" : "Startup Weekend",
                "events" : [
                  {
                    "vertical" : "",
                    "public_registration_url" : "http:\/\/www.eventbrite.com\/event\/7861362547",
                    "website" : "paris.startupweekend.org",
                    "_id" : "5276e3936e401802000002ca",
                    "start_date" : "2013-11-22T00:00:00.000Z",
                    "event_type" : "Startup Weekend"
                  }
                ]
              },
              {
                "event_type" : "NEXT",
                "events" : [
                  {
                    "vertical" : "",
                    "public_registration_url" : "http:\/\/www.eventbrite.com\/event\/7861362547",
                    "website" : "paris.startupweekend.org",
                    "_id" : "5276e3936e401802000002ca",
                    "start_date" : "2013-11-22T00:00:00.000Z",
                    "event_type" : "Startup Weekend"
                  }
                ]
              }
            ],
            "state" : null,
            "region" : "Europe",
            "city" : "Paris",
            "location" : [
              48.8666667,
              2.3333333
            ],
            "country" : "France"
          };

      beforeEach(function () {
        dateSpy = sinon.stub(instance, 'formatDateString').returns('');
      });

      afterEach(function () {
        instance.formatDateString.restore();
      });

      it('should be a function', function () {
        instance.should.have.property('getCityInfoWindowContent');
        instance.getCityInfoWindowContent.should.be.a('function');
    });

      it('should return a string', function () {
        instance.getCityInfoWindowContent(sampleCityData).should.be.a('string');
      });

      it('should call #formatDateString', function () {
        instance.getCityInfoWindowContent(sampleCityData);
        dateSpy.calledTwice.should.be.true;
      });

      describe('handling preferred programs', function () {
        describe('when no program specified', function () {
          it('should render all available programs in the window', function () {
            var windowText = instance.getCityInfoWindowContent(sampleCityData);
            windowText.should.match(/Startup Weekend Paris/);
            windowText.should.match(/NEXT Paris/);
          });
        });

        describe('when only Startup Weekend specified', function () {
          it('should only render Startup Weekend events', function () {
            var swInstance = new CitiesMap.MapApi(fakeElement, {
              programsOfInterest: ['Startup Weekend']
            });

            var windowText = swInstance.getCityInfoWindowContent(sampleCityData);
            windowText.should.match(/Startup Weekend Paris/);
            windowText.should.not.match(/NEXT Paris/);
          });
        });

        describe('when only NEXT is specified', function () {
          it('should only render NEXT events', function () {
            var nextInstance = new CitiesMap.MapApi(fakeElement, {
              programsOfInterest: ['NEXT']
            });

            var windowText = nextInstance.getCityInfoWindowContent(sampleCityData);
            windowText.should.match(/NEXT Paris/);
            windowText.should.not.match(/Startup Weekend Paris/);
          });
        });

        describe('when both Startup Weekend and NEXT are specified', function () {
          it('should render events for both programs', function () {
            var multipleInstance = new CitiesMap.MapApi(fakeElement, {
              programsOfInterest: ['Startup Weekend', 'NEXT']
            });
            var windowText = multipleInstance.getCityInfoWindowContent(sampleCityData);
            windowText.should.match(/Startup Weekend Paris/);
            windowText.should.match(/NEXT Paris/);
          });
        });
      });
    });

    describe('#formatDateString', function () {
      it('should be a function', function () {
        instance.should.have.property('formatDateString');
        instance.formatDateString.should.be.a('function');
      });

      it('should return a string', function () {
        instance.formatDateString(new Date()).should.be.a('string');
      });

      it('should format a date in DD MMM, YYYY format', function () {
        instance.formatDateString(new Date(2013, 0, 1)).should.eq('Wednesday, January 1');
        instance.formatDateString(new Date(2013, 1, 1)).should.eq('Saturday, February 1');
        instance.formatDateString(new Date(2013, 2, 1)).should.eq('Saturday, March 1');
        instance.formatDateString(new Date(2013, 3, 1)).should.eq('Tuesday, April 1');
        instance.formatDateString(new Date(2013, 4, 1)).should.eq('Thursday, May 1');
        instance.formatDateString(new Date(2013, 5, 1)).should.eq('Sunday, June 1');
        instance.formatDateString(new Date(2013, 6, 1)).should.eq('Tuesday, July 1');
        instance.formatDateString(new Date(2013, 7, 1)).should.eq('Friday, August 1');
        instance.formatDateString(new Date(2013, 8, 1)).should.eq('Monday, September 1');
        instance.formatDateString(new Date(2013, 9, 1)).should.eq('Wednesday, October 1');
        instance.formatDateString(new Date(2013, 10, 1)).should.eq('Saturday, November 1');
        instance.formatDateString(new Date(2013, 11, 1)).should.eq('Monday, December 1');
      });
    });

  });
});
