describe('CitiesMap.MapApi', function () {
  it('should make the constructor available', function () {
    CitiesMap.MapApi.should.exist.and.be.a('function');
  });

  describe('expected constructor result', function () {
    var instance, gMapsStub;
    beforeEach(function () {
      var fakeElement = {
        data: function () { return undefined; }
      , css: function () { return 0; }
      };

      gMapsStub = {
        Map: sinon.spy(google.maps, 'Map'),
        Marker: sinon.spy(google.maps, 'Marker'),
        LatLng: sinon.spy(google.maps, 'LatLng')
      };

      instance = new CitiesMap.MapApi(fakeElement);
    });

    afterEach(function () {
      var prop;
      for (prop in gMapsStub) {
        if (gMapsStub.hasOwnProperty(prop)) {
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
        var prop = instance.createCityPoint({ location: [100, 100] });
        gMapsStub.Marker.calledOnce.should.be.true;
      });

      it('should add a new marker to the instance collection of markers', function () {
        instance.should.have.property('mapPoints');
        instance.mapPoints.length.should.eq(0);
        instance.createCityPoint({ location: [100, 100] });
        instance.mapPoints.length.should.eq(1);
      });
    });
  });
});
