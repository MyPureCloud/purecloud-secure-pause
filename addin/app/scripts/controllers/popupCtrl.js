'use strict';

/**
 * @ngdoc function
 * @name app.controller:popupCtrl
 * @description
 * # popupCtrl
 * Controller of the app
**/

angular.module('app', ['chromeStorage', 'pureCloudService'])
    .controller('popupCtrl', function ($scope, $log, $window, chromeStorage, pureCloudService) {

        var _BgController;

        function init() {
            var bgPage = chrome.extension.getBackgroundPage();
            _BgController = bgPage.getController();
            $scope.isPCConnected = _BgController.getPCService().GetLoginStatus();

            var bCall = _BgController.getPCService().GetIsCallActive();

            if (bCall) {
                if (_BgController.getPCService().GetSecurePauseStatus()) {
                    $scope.lblSecurePause = 'Resume';
                    $scope.isSecurePause = true;
                } else {
                    $scope.lblSecurePause = 'Pause Rec.';
                    $scope.isSecurePause = false;
                }
            } else {
                $scope.lblSecurePause = 'No active Call';
                $scope.isSecurePause = true;
            }


            if ($scope.isPCConnected) {
                $scope.btnLogin = _BgController.getPCService().GetUserName();

            } else {
                $scope.btnLogin = 'Login';
            }

        }

        init();


        $scope.togglePCConnectionIndicator = function () {

            if ($scope.isPCConnected) {
                // $scope.isPCConnected = false;
                // Disconnect from PC
            } else {
                $scope.pcConnecting = true;
                try {
                    _BgController.getPCService().setEnvironment().then(function success(response) {
                        if (response) {
                            $scope.isPCConnected = true;
                            $scope.pcConnecting = false;
                            $scope.btnLogin = _BgController.getPCService().GetUserName();
                            $scope.$apply();

                        } else {
                            $scope.isPCConnected = false;
                            $scope.pcConnecting = false;
                            $scope.$apply();
                        }
                    }, function error() {
                        $scope.isPCConnected = false;
                        $scope.pcConnecting = false;
                        $scope.$apply();
                    });
                } catch (Err) {
                    $scope.pcConnecting = false;
                    $log.error(Err);
                    
                }
            }
        };

        $scope.toggleStartSecurePauseIndicator = function () {

            try {
                if (_BgController.getPCService().GetIsCallActive()) {
                    if ($scope.isSecurePause) {
                        _BgController.getPCService().ResumeRecording().then(function success(response) {
                            $scope.isSecurePause = false;
                            $scope.lblSecurePause = 'Pause rec.';
                            $scope.$apply();

                        }, function error() {
                            _BgController.Log('Failed to ResumeRecording !');
                            
                        });
                    } else {

                        _BgController.getPCService().StartSecurePause().then(function success(response) {
                            $scope.isSecurePause = true;
                            $scope.lblSecurePause = 'Resume';
                            $scope.$apply();

                        }, function error() {
                            _BgController.Log('Failed to StartSecurePause !');

                        });
                    }
                } else {
                    $log.debug('No active call, do nothing...');
                }

            } catch (Err) {

                $log.error(Err);
            }

        };

    });