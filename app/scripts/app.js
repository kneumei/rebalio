'use strict';

angular.module('rebalioApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/ModelPortfolio.html',
        controller: 'ModelPortfolioCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
