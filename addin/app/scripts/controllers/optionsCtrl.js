'use strict';

/**
 * @ngdoc function
 * @name app.controller:optionsCtrl
 * @description
 * # optionsCtrl
 * Controller of the app
**/

angular.module('app', ['chromeStorage'])
    .controller('optionsCtrl', function ($rootScope, $scope, $log, chromeStorage) {

        // <PureCloud options>
        $scope.pcOptionsChanged = function(){                                
            try {
                var pcOptions = {}; 
                pcOptions.pcEnv = $scope.pcEnv;                
                pcOptions.pcTimer = $scope.pcTimer;
                pcOptions.pcClientId = $scope.pcClientId;
                pcOptions.pcClientSecret = $scope.pcClientSecret;            
                var storageItem = {};
                storageItem.pcOptions = pcOptions;                 
                chrome.storage.local.set(storageItem);
            } 
            catch (err) {
                $log.error(err);
            }                
        };
            
        function getPcOptions() {
            try {                       
                chromeStorage.get('pcOptions').then(function(pcOptions) {
                    $scope.pcEnv = pcOptions.pcEnv;
                    $scope.pcTimer = pcOptions.pcTimer;
                    $scope.pcClientId = pcOptions.pcClientId;
                    $scope.pcClientSecret = pcOptions.pcClientSecret;
                });
            }  
            catch (err) {
                $log.error(err);
            }         
        }
        // </PureCloud options>
        
       
        // <Initializing>      
        getPcOptions();

        // </Initializing>

  });