'use strict';

angular.module('rebalioApp')
  .controller('ModelPortfolioCtrl', function ($scope, $http, _, marketServices) {
	$scope.data={};
    $scope.modelPortfolio = [];
    $scope.data.totalWeight = 0;


    $scope.addSecurity = function() {
      marketServices.getMarketPrice($http, _, [$scope.ticker], function(priceMap){
        $scope.modelPortfolio.push(
          {
            ticker:$scope.ticker
            , modelWeight:Number(parseFloat($scope.weight).toFixed(2))
            , shareQuantity: Number(parseInt($scope.shareQuantity))
            , marketPrice: 0
            , marketValue: 0
            , marketWeight: 0
          });
        var index = $scope.modelPortfolio.length - 1;
        
        //watch expression to calculate the market value
        $scope.$watch('modelPortfolio['+index+']', function(newVal, oldVal, scope){
          newVal.marketValue = newVal.shareQuantity*newVal.marketPrice;
        }, true)

        //watch expression to calculate the market weight
        $scope.$watch('modelPortfolio', function(newVal, oldVal, scope){
          var totalMarketValue = _.reduce(newVal, function(accum, security){
            return accum + security.marketValue;
          },0);

          _.each(newVal, function(security){
            security.marketWeight = (security.marketValue / totalMarketValue).toFixed(2) * 100;
          });

           scope.data.totalWeight = _.reduce($scope.modelPortfolio, function(accum, security){
             return Number(accum) + Number(security.modelWeight);
           }, 0);

           //$rootScope.data.totalWeight = scope.data.totalWeight;


        }, true)

        $scope.modelPortfolio[index].marketPrice = priceMap[0].marketPrice
      })
      };

      // $scope.$watch('totalWeight', function(newVal, oldVal, scope){
      //   $scope.cashForm.$setValidity('cashForm', newVal==100);      
      // });

      $scope.deleteSecurity = function(index){
        $scope.modelPortfolio.splice(index,1);
      }
  });
