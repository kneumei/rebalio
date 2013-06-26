var rebalio = angular.module('Rebalio', []).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:ModelPortfolioCtrl, templateUrl:'createmodel.html'}).
      when('/createportfolio', {controller:ModelPortfolioCtrl, templateUrl:'createportfolio.html'}).
      otherwise({redirectTo:'/'});
  });

 rebalio.service('dataService', function(){
 	var modelPortfolio = [];
 	var portfolio = []
 	return{
 		getModelPortfolio: function(){
 			return modelPortfolio;
 		},
 		setModelPortfolio: function(mpf){
 			modelPortfolio = mpf;
 		},
 		getPortfolio: function(){
 			return portfolio;
 		},
 		setPortfolio: function(pf){
 			portfolio = pf;
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

function ModelPortfolioCtrl ($scope, $location, dataService, $http){
	$scope.modelPortfolio = dataService.getModelPortfolio();
	

	$scope.addSecurity = function() {
    	$scope.modelPortfolio.push(
    		{
    			ticker:$scope.ticker
    			, weight:Number(parseFloat($scope.weight).toFixed(2))
    		});
    	dataService.setModelPortfolio ($scope.modelPortfolio);
  	};

  	$scope.deleteSecurity = function(index){
  		$scope.modelPortfolio.splice(index,1);
  		dataService.setModelPortfolio ($scope.modelPortfolio);
  	}

  	$scope.totalWeight = function(){
  		var sum =  window._.reduce($scope.modelPortfolio, 
  			function(accum, security){
  				return accum + security.weight;
  			}, 
  			0);
  		return Number(sum.toFixed(2) );
  	}

  	$scope.isNotComplete = function(){
  		var sum =  window._.reduce($scope.modelPortfolio, 
  			function(accum, security){
  				return accum + security.weight;
  			}, 
  			0);
  		var w =  Number(sum.toFixed(2) );
  		return !moneycomp(w, "==", 100, 2);
  	}

  	$scope.save = function(){
  		var  pf = [];
  		window._.each($scope.modelPortfolio, function(mpf){
  			pf.push({
  				ticker : mpf.ticker,
  				shareQuantity : 0,
  				marketPrice : 0,
  				marketValue : 0,
  				modelWeight : mpf.weight,
  				marketWeight : 0  				
  			});


  		});

  		var url = "http://query.yahooapis.com/v1/public/yql";
      var cvsUrl = "http://download.finance.yahoo.com/d/quotes.csv?s="+window._.pluck(pf, 'ticker').join()+"&f=sp&e=.csv";
  		var config={
  				params : {
  					format:"json",
  					callback:"JSON_CALLBACK",
  					q:"select symbol, price from csv where url='"+cvsUrl+"' and columns='symbol,price'"
  				}
  		};

  		$http.jsonp(url, config).success(function(data){
        var rows = []
        if(data.query.count ==1){
          rows.push(data.query.results.row);
        }else{
          rows = data.query.results.row;
        }
        window._.each(rows, function(row){
          var item = window._.findWhere(pf, {ticker:row.symbol});
          if(item!=null){
            item.marketPrice = row.price;
          }
        });
        dataService.setPortfolio(pf);
  			$location.path('/createportfolio');	
  		}).error(function(data, status, header){
  			$location.path('/createportfolio');
  		})

  		
  	}

  	function moneycomp(a,comp,b,decimals) {
	if (!decimals)
		decimals = 2;
	var multiplier = Math.pow(10,decimals);
	a = Math.round(a * multiplier); // multiply to do integer comparison instead of floating point
	b = Math.round(b * multiplier);
	switch (comp) {
		case ">":
			return (a > b);
		case ">=":
			return (a >= b);
		case "<":
			return (a < b);
		case "<=":
			return (a <= b);
		case "==":
			return (a == b);
	}
	
	return null;
	}
}

function CreatePortfolioCtrl ($scope, $location, dataService){
	$scope.portfolio = dataService.getPortfolio();
}
