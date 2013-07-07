'use strict';
var YAHOO={Finance:{SymbolSuggest:{}}};
angular.module('rebalioApp')
  .directive('autocomplete', function ($http) {
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
