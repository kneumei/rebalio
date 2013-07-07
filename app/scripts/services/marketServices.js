'use strict';

angular.module('rebalioApp')
  .service('marketServices', function marketServices() {
        function getMarketPrice( $http, _, tickers, callback){
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
	      _.each(tickers, function(t){
	        retVal.push({ticker:t, marketPrice:null});
	      })

	      $http.jsonp(url, config).success(function(data){
	        var rows = []
	        if(data.query.count ==1){
	         rows.push(data.query.results.row);
	        }else{
	          rows = data.query.results.row;
	        }

	        _.each(rows, function(row){
	          var item = _.findWhere(retVal, {ticker:row.symbol});
	          if(item!=null){
	            item.marketPrice = row.price;
	          }
	        });
	        callback(retVal);
	        }).error(function(data, status, header){
	          callback(retVal);
	        })
    	}
    	return{
    		"getMarketPrice": getMarketPrice
    	}
  });
