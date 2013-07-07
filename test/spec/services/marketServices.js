'use strict';

describe('Service: marketServices', function () {

  // load the service's module
  beforeEach(module('rebalioApp'));

  // instantiate service
  var marketServices;
  beforeEach(inject(function (_marketServices_) {
    marketServices = _marketServices_;
  }));

  it('should do something', function () {
    expect(!!marketServices).toBe(true);
  });

});
