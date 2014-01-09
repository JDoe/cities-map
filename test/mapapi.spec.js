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
        Map: sinon.stub(google.maps, 'Map', function () {
          var controlObject = {
            push: function (arg) { return arg; }
          };
          return {
            controls: [ controlObject, controlObject, controlObject, controlObject ]
          };
        }),
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
            if (instance.hasOwnProperty(prop) && instance[prop] && instance[prop].restore) {
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
                  },
                  {
                    "vertical" : "",
                    "public_registration_url" : "http:\/\/www.eventbrite.com\/event\/7861362547",
                    "website" : "paris.startupweekend.org",
                    "_id" : "5276e3936e401802000002ca",
                    "start_date" : "2013-11-22T00:00:00.000Z",
                    "event_type" : "Startup Weekend",
										"nickname" : "Startup Weekend Oklahoma University"
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

			it('should handle nicknames when present', function () {
				var results = instance.getCityInfoWindowContent(sampleCityData);
				results.should.match(/Oklahoma University/);
			});

			it('should strip out redundant references to Startup Weekend in nicknames', function () {
				var results = instance.getCityInfoWindowContent(sampleCityData);
				results.should.not.match(/Startup Weekend Oklahoma University/);
			});

      it('should call #formatDateString', function () {
        instance.getCityInfoWindowContent(sampleCityData);
        dateSpy.callCount.should.equal(3);
      });

      describe('handling preferred programs', function () {
        describe('when no program specified', function () {
          it('should render all available programs in the window', function () {
            var windowText = instance.getCityInfoWindowContent(sampleCityData);

            var expectedPrograms = [
              "Bootcamp",
              "LeanStartup",
              "Marketing",
              "Meetup",
              "NEXT",
              "SW Corporate",
              "Social",
              "Startup Weekend",
              "Summit"];

            expectedPrograms.forEach(function (program) {
              windowText.should.match(new RegExp(program + " Paris"));
            });
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

        describe('when "SW Corporate" is specified but there is no example in the API data', function () {
          it('should render an entry with a Organize CTA for SW Corporate', function () {
            var corpInstance = new CitiesMap.MapApi(fakeElement, {
              programsOfInterest: ['SW Corporate']
            });

            var windowText = corpInstance.getCityInfoWindowContent(sampleCityData);
            windowText.should.match(/SW Corporate/);
            windowText.should.match(/No upcoming events/);
            windowText.should.match(/Organize an event/);
            windowText.should.match(/Future event alerts/);
          });
        });
      });

      describe('generating an interest notification form', function () {
        it('should open the signup result in a new tab', function () {
          var windowText = instance.getCityInfoWindowContent(sampleCityData);
          windowText.should.match(/form.+target='_blank'/);
        });

        it('should offer a form for registering interest in SW', function () {
          var windowContent = instance.getCityInfoWindowContent(sampleCityData);
          var formTargetRx = /form action='http:\/\/startupweekend.us1.list-manage.com\/subscribe\/post\?u=77bee8d6876e3fd1aa815badb&amp;id=66eed7c427'/;
          var formCityRx = /name='CITY' value='Paris'/;
          var formEventTypeRx = /name='MMERGE3' value='Startup Weekend'/;
          var formVerticalTypeRx = /name='MMERGE4' value=''/;
          windowContent.should.match(formTargetRx);
          windowContent.should.match(formEventTypeRx);
          windowContent.should.match(formVerticalTypeRx);
        });

        it('should offer a form for registering interest in SW Makers', function () {
          var makerCityData = {
            "upcoming_programs" : [
              {
                "event_type" : "Startup Weekend",
                "events" : [
                  {
                    "vertical" : "Makers",
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

          var windowContent = instance.getCityInfoWindowContent(makerCityData);

          var formTargetRx = /form action='http:\/\/startupweekend.us1.list-manage.com\/subscribe\/post\?u=77bee8d6876e3fd1aa815badb&amp;id=66eed7c427'/;
          var formCityRx = /name='CITY' value='Paris'/;
          var formEventTypeRx = /name='MMERGE3' value='Startup Weekend'/;
          var formVerticalTypeRx = /name='MMERGE4' value='Makers'/;
          windowContent.should.match(formTargetRx);
          windowContent.should.match(formEventTypeRx);
          windowContent.should.match(formVerticalTypeRx);
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

    describe('#programOrganizeRegistrationUrl', function () {
      it('should be a function', function () {
        instance.should.have.property('programOrganizeRegistrationUrl');
        instance.programOrganizeRegistrationUrl.should.be.a('function');
      });

      it('should return the Organizer registration URL for Startup Weekend', function () {
        instance.programOrganizeRegistrationUrl('Startup Weekend').should.eq('http://startupweekend.org/organizer/application/');
      });

      it('should return the Coordinator registration URL for NEXT', function () {
        instance.programOrganizeRegistrationUrl('NEXT').should.eq('http://www.swnext.co/get-involved/apply');
      });

      it('should return the UP Become a Leader registration URL for anything else', function () {
        instance.programOrganizeRegistrationUrl('Ignite').should.eq('http://www.up.co/get-involved/become-leader');
        instance.programOrganizeRegistrationUrl('Meow').should.eq('http://www.up.co/get-involved/become-leader');
        instance.programOrganizeRegistrationUrl('').should.eq('http://www.up.co/get-involved/become-leader');
        instance.programOrganizeRegistrationUrl(undefined).should.eq('http://www.up.co/get-involved/become-leader');
        instance.programOrganizeRegistrationUrl(null).should.eq('http://www.up.co/get-involved/become-leader');
      });
    });

    describe('#addFilterControlToMap', function () {
      it('should be a function', function () {
        instance.should.have.property('addFilterControlToMap');
        instance.addFilterControlToMap.should.be.a('function');
      });

      it('should get called when an instance is created', function () {
        var spy = sinon.spy(CitiesMap.MapApi.prototype, 'addFilterControlToMap')
        var inst = new CitiesMap.MapApi(fakeElement);
        spy.calledOnce.should.be.true;
      });

      it('should add a search box to the map controls', function () {
        var testControlObj = { push: function () { } };
        var controlPushSpy = sinon.spy(testControlObj, 'push');

        google.maps.Map.restore();
        sinon.stub(google.maps, 'Map', function () {
          return {
            controls: [ testControlObj, testControlObj, testControlObj, testControlObj ]
          };
        });

        var inst = new CitiesMap.MapApi(fakeElement);

        controlPushSpy.calledOnce.should.be.true;
        var callArgs = controlPushSpy.getCall(0).args;

        var inputArg = callArgs[0];
        inputArg.should.have.property('tagName');
        inputArg.tagName.should.equal('INPUT');

        google.maps.Map.restore();
      });
    });

    describe('#handleSearchFilter', function () {
      var searchControl,
        setVisibleA, setVisibleB, setVisibleC; 

      beforeEach(function () {
        searchControl = instance.searchControl;
        instance.mapPoints = {
          a: { city: 'Seattle' },
          b: { city: 'Spokane' },
          c: { city: 'Bellevue' }
        };

        instance.markers = {
          a: { setVisible: function () { } },
          b: { setVisible: function () { } },
          c: { setVisible: function () { } }
        };

        setVisibleA = sinon.spy(instance.markers.a, 'setVisible');
        setVisibleB = sinon.spy(instance.markers.b, 'setVisible');
        setVisibleC = sinon.spy(instance.markers.c, 'setVisible');
      });

      afterEach(function () {
        instance.markers.a.setVisible.restore();
        instance.markers.b.setVisible.restore();
        instance.markers.c.setVisible.restore();
      });

      it('should call hide on Bellevue and show on all else when search is "s"', function () {
        searchControl.value = 'S';
        $(searchControl).trigger('keyup');

        setVisibleA.calledOnce.should.be.true;
        setVisibleA.calledWith(true).should.be.true;
        setVisibleB.calledOnce.should.be.true;
        setVisibleB.calledWith(true).should.be.true;
        setVisibleC.calledOnce.should.be.true;
        setVisibleC.calledWith(false).should.be.true;
      });

      it('should only show Seattle as the search gets more specific', function () {
        searchControl.value = 'Se';
        $(searchControl).trigger('keyup');

        setVisibleA.calledOnce.should.be.true;
        setVisibleA.calledWith(true).should.be.true;
        setVisibleB.calledOnce.should.be.true;
        setVisibleB.calledWith(false).should.be.true;
        setVisibleC.calledOnce.should.be.true;
        setVisibleC.calledWith(false).should.be.true;
      });

      it('should show all markers if the search query is empty or cleared', function () {
        searchControl.value = '';
        $(searchControl).trigger('keyup');

        setVisibleA.calledOnce.should.be.true;
        setVisibleA.calledWith(true).should.be.true;
        setVisibleB.calledOnce.should.be.true;
        setVisibleB.calledWith(true).should.be.true;
        setVisibleC.calledOnce.should.be.true;
        setVisibleC.calledWith(true).should.be.true;      });
    });

		describe('#mapControlsContainer', function () {
			it('should not exist on the map by default', function () {
				(instance.mapControlsContainer == null).should.be.true;
			});

			it('should exist if active cities toggle is enabled', function () {
				var enabled = new CitiesMap.MapApi(fakeElement, {
					showActiveCityToggle: true
				});
				(enabled.mapControlsContainer == null).should.be.false;
			});
		});

		describe('#addActiveCityToggle', function () {
			it('should be a function', function () {
				instance.should.have.property('addActiveCityToggle');
				instance.addActiveCityToggle.should.be.a('function');
			});

			it('should not be called by default', function () {
				var spy = sinon.spy(CitiesMap.MapApi.prototype, 'addActiveCityToggle');
				var spiedInstance = new CitiesMap.MapApi(fakeElement);
				spy.calledOnce.should.be.false;
				CitiesMap.MapApi.prototype.addActiveCityToggle.restore();
			});

			it('should be called if the option is passed', function () {
				var spy = sinon.spy(CitiesMap.MapApi.prototype, 'addActiveCityToggle');
				var spiedInstance = new CitiesMap.MapApi(fakeElement, {
					showActiveCityToggle: true
				});

				spy.calledOnce.should.be.true;
				CitiesMap.MapApi.prototype.addActiveCityToggle.restore();
			});
		});

		describe('#findNextMonday', function () {
			var nextMonday = (new Date(2014,0,13)).getTime();
			it('should return 2014-01-12 on 2014-01-05', function () {
				var sunday = new Date(2014,0,5);
				instance.findNextMonday(sunday).getTime().should.equal((new Date(2014,0,6)).getTime());
			});

			it('should return 2014-01-12 on 2014-01-06', function () {
				var monday = new Date(2014,0,6);
				instance.findNextMonday(monday).getTime().should.equal(nextMonday)
			});

			it('should return 2014-01-12 on 2014-01-07', function () {
				var tuesday = new Date(2014,0,7);
				instance.findNextMonday(tuesday).getTime().should.equal(nextMonday)
			});

			it('should return 2014-01-12 on 2014-01-08', function () {
				var wednesday = new Date(2014,0,8);
				instance.findNextMonday(wednesday).getTime().should.equal(nextMonday)
			});

			it('should return 2014-01-12 on 2014-01-09', function () {
				var thursday = new Date(2014,0,9);
				instance.findNextMonday(thursday).getTime().should.equal(nextMonday)
			});

			it('should return 2014-01-12 on 2014-01-10', function () {
				var friday = new Date(2014,0,10);
				instance.findNextMonday(friday).getTime().should.equal(nextMonday)
			});

			it('should return 2014-01-12 on 2014-01-11', function () {
				var saturday = new Date(2014,0,6);
				instance.findNextMonday(saturday).getTime().should.equal(nextMonday)
			});

		});
  });
});
