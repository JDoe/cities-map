describe('Cities Map', function () {
  describe('jQuery function', function () {
    it('should add a "citiesmap" function to jQuery', function () {
      var func = jQuery('body').citiesmap;
      func.should.exist.and.be.a('function');
    });
  });
});
