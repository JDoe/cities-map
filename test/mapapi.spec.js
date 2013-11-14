describe('CitiesMap.MapApi', function () {
  it('should make the constructor available', function () {
    CitiesMap.MapApi.should.exist.and.be.a('function');
  });

  describe('expected constructor result', function () {
    var instance, gMapsStub;
    before(function () {
      var fakeElement = {
        data: function () { return undefined; }
      , css: function () { return 0; }
      };

      gMapsStub = {
        Map: sinon.spy(google.maps, 'Map')
      };

      instance = new CitiesMap.MapApi(fakeElement);
    });

    it('should have a writeMapToElement instance method', function () {
      instance.should.have.property('writeMapToElement');
      instance.writeMapToElement.should.be.a('function');
    });

    it('should try to call Google Maps when instantiating', function () {
      gMapsStub.Map.calledOnce.should.be.true;
    });
  });
});
