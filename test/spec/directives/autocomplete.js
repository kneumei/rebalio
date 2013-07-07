'use strict';

describe('Directive: autocomplete', function () {
  beforeEach(module('rebalioApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<autocomplete></autocomplete>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the autocomplete directive');
  }));
});
