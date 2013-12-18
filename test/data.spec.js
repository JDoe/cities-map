describe('CitiesMap.Data', function () {
  it('should make the module available', function () {
    CitiesMap.Data.should.exist.and.be.an('object');
  });

  describe('#loadCitiesData', function () {
    var opts = {
      urlBase: 'http://localhost:3000'
    };

    var testObj = null;
    var ajaxStub = null;
    var deferredStub = null;

    beforeEach(function (done) {
      if (window.localStorage) {
        delete window.localStorage.upGlobalMapExpiration;
        delete window.localStorage.upGlobalMapData;
      }
      ajaxStub = sinon.stub(jQuery, 'get')
        .returns({
          success: function (cb) {
          },
          error: function (cb) { cb('fake error'); }
        });
      deferredStub = sinon.stub(jQuery, 'Deferred')
        .returns({
          resolve: function (cities) { return cities; },
          reject: function (err) { return err; },
          promise: function () {
            return {
              done: function (cb) {
                    cb([
                      {
                        city: 'Seattle'
                      , state: 'WA'
                      , country: 'USA'
                      , location: [ 47.6062095, -122.3320708 ]
                      , region: 'NA USA Northwest'
                      , upcoming_programs: []
                      },
                      {
                        city: 'Omaha'
                      , state: 'NE'
                      , country: 'USA'
                      , location: [ 41.291736, -96.171104 ]
                      , region: 'NA USA Midwest'
                      , upcoming_programs: []
                      }
                    ]);
              },
              fail: function () { }
            }
          }
        });

      testObj = CitiesMap.Data.loadCitiesData(opts);

      done();
    });

    afterEach(function (done) {
      jQuery.get.restore();
      jQuery.Deferred.restore();
      done();
    });

    it('should use jQuery.get to load API data', function () {
      ajaxStub.calledOnce.should.be.true;
      ajaxStub.calledWith('http://localhost:3000/cities').should.be.true;
    });

    it('should return a deferred object', function (done) {
      testObj.should.have.property('done');
      testObj.should.have.property('fail');

      done();
    });

    it('should have a default URL base if one is not provided', function (done) {
      // Unwind existing stub
      jQuery.get.restore();

      // Set up new stub to watch for just this call
      var defaultStub = sinon.stub(jQuery, 'get').returns({ success: function (cb) { cb([]); }, error: function () {} });

      // Call again with the default URL
      CitiesMap.Data.loadCitiesData()
        .done(function (data) {
          defaultStub.calledWith('http://swoop.startupweekend.org/cities').should.be.true;

          done();
        });
    });

    it('should return an array of city objects for a successful query', function (done) {
      testObj.done(function (data) {
        data.should.be.instanceOf(Array);
        done(); 
      });
    });

    it('should return objects with the expected properties', function (done) {
      testObj.done(function (data) {
        var firstItem = data[0];

        ['city', 'state', 'country', 'location', 'region', 'upcoming_programs'].forEach(function (prop) {
          firstItem.should.have.property(prop);
        });
        firstItem.upcoming_programs.should.be.instanceOf(Array);

        done();
      });
    });

    describe('when cached data is available', function () {
      it('should load from cache', function (done) {
        window.localStorage.upGlobalMapExpiration = (new Date()).getTime() + 1000 * 60;
        window.localStorage.upGlobalMapData = JSON.stringify({
          hello: 'world'
        });

        jQuery.Deferred.restore();
        var tmpStorage = null;
        var tmpPromise = {};


        var tmpDeferredStub = sinon.stub(jQuery, 'Deferred').returns({
          resolve: function (data) {
                     data.hello.should.eq('world');
                     done();
                   },
          promise: function () { }
        });

        var cachedObj = CitiesMap.Data.loadCitiesData(opts);
      });
    });
  });
});
