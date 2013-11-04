describe('CitiesMap.Data', function () {
  it('should make the module available', function () {
    CitiesMap.Data.should.exist.and.be.an('object');
  });

  describe('#loadCitiesData', function () {
    var opts = {
      urlBase: 'http://localhost:3000'
    };

    var testObj = null;

    beforeEach(function (done) {
      testObj = CitiesMap.Data.loadCitiesData(opts);
      done();
    });

    it('should return a deferred AJAX object', function (done) {
      testObj.should.have.property('success');
      testObj.should.have.property('error');

      done();
    });

    it('should return an array of city objects for a successful query', function (done) {
      testObj = CitiesMap.Data.loadCitiesData(opts);
      testObj.success(function (data) {
        data.should.be['instanceOf'](Array);
        done(); 
      });
    });
  });
});
