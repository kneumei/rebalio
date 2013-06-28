var rebalio = angular.module('Rebalio', []).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:ModelPortfolioCtrl, templateUrl:'createmodel.html'}).
      otherwise({redirectTo:'/'});
  });

 rebalio.service('dataService', function(){
 	var modelPortfolio = [];
 	return{
 		getModelPortfolio: function(){
 			return modelPortfolio;
 		},
 		setModelPortfolio: function(mpf){
 			modelPortfolio = mpf;
 		}
 	}; 
 })

var YAHOO={Finance:{SymbolSuggest:{}}};

 rebalio.directive('autocomplete', function($timeout){
 	return function postLink(scope, element, attrs){
 		$(function(){
 			$(element).autocomplete({
 				source: function (request, response) {
			    	$.ajax({
			        	type: "GET",
			        	dataType: "jsonp",
			        	jsonp: "callback",
			        	jsonpCallback: "YAHOO.Finance.SymbolSuggest.ssCallback",
			        	data: {
			            	query: request.term
			        	},
			        	cache: true,
			        	url: "http://autoc.finance.yahoo.com/autoc"
			    	});

			    	YAHOO.Finance.SymbolSuggest.ssCallback = function (data) {
			        	response($.map(data.ResultSet.Result, function (item) {
			            	return {
			                	label: item.name + "("+item.symbol+")",
			                	value: item.symbol
			            	}
			        	}));
			    	}
				},
				minLength: 1,
				select: function (event, ui) {
          scope.ticker = ui.item.value;
				},
				open: function () {
			    	$(this).removeClass("ui-corner-all").addClass("ui-corner-top");
				},
				close: function () {
			    	$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
				}
			});
 		});
 	}
 });

function getMarketPrice( $http, tickers, callback){
  var url = "http://query.yahooapis.com/v1/public/yql";
  var cvsUrl = "http://download.finance.yahoo.com/d/quotes.csv?s="+tickers.join()+"&f=sp&e=.csv";
  var config={
    params : {
      format:"json",
      callback:"JSON_CALLBACK",
      q:"select symbol, price from csv where url='"+cvsUrl+"' and columns='symbol,price'"
    }
  };


  var retVal = [];
  window._.each(tickers, function(t){
    retVal.push({ticker:t, marketPrice:null});
  })

  $http.jsonp(url, config).success(function(data){
    var rows = []
    if(data.query.count ==1){
      rows.push(data.query.results.row);
    }else{
      rows = data.query.results.row;
    }


    window._.each(rows, function(row){
      var item = window._.findWhere(retVal, {ticker:row.symbol});
      if(item!=null){
        item.marketPrice = row.price;
      }
    });
    callback(retVal);
  }).error(function(data, status, header){
    callback(retVal);
  })
}

function ModelPortfolioCtrl ($scope, $location, dataService, $http){
	$scope.modelPortfolio = dataService.getModelPortfolio();
	

	$scope.addSecurity = function() {
    getMarketPrice($http, [$scope.ticker], function(priceMap){
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
        var totalMarketValue = window._.reduce(newVal, function(accum, security){
          return accum + security.marketValue;
        },0);

        window._.each(newVal, function(security){
          security.marketWeight = (security.marketValue / totalMarketValue).toFixed(2);
        });
      }, true)

      $scope.modelPortfolio[index].marketPrice = priceMap[0].marketPrice
    	dataService.setModelPortfolio ($scope.modelPortfolio);
  	})
    };

  	$scope.deleteSecurity = function(index){
  		$scope.modelPortfolio.splice(index,1);
  		dataService.setModelPortfolio ($scope.modelPortfolio);
  	}

  	$scope.totalWeight = function(){
  		var sum =  window._.reduce($scope.modelPortfolio, 
  			function(accum, security){
  				return accum + security.modelWeight;
  			}, 
  			0);
  		return Number(sum.toFixed(2) );
  	}
}
