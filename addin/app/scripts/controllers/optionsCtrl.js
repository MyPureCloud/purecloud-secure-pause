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
                pcOptions.pcClientId = $scope.pcClientId;
                pcOptions.pcCalbackURI = $scope.pcCalbackURI;

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
                    $scope.pcClientId = pcOptions.pcClientId;
                    $scope.pcCalbackURI = pcOptions.pcCalbackURI;
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