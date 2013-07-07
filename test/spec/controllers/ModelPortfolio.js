'use strict';

describe('Controller: ModelPortfolioCtrl', function () {

  // load the controller's module
  beforeEach(module('rebalioApp'));

  var ModelPortfolioCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ModelPortfolioCtrl = $controller('ModelPortfolioCtrl', {
      $scope: scope
    });
  }));

  it('should attach two ojects to the scope', function () {
    expect(scope.data,totalWeight).toBe(0);
  });
});
