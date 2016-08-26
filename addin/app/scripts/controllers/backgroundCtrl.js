'use strict';

/**
 * @ngdoc function
 * @name app.controller: backgroundCtrl
 * @description
 * # backgroundCtrl
 * Controller of the app
**/

angular.module('app', ['pureCloudService'])
    .controller('backgroundCtrl', function ($scope, $log, $interval, pureCloudService, $window) {

        // var CICTimer;

        $scope.getPCService = function () {
            return pureCloudService;
        };

        $scope.Login = function () {
            pcService.Login();
        };

        $scope.Log = function (sMessage) {
            console.log(sMessage);
        }


        $scope.ShowMessage = function (sMessage) {
            console.log(sMessage);
            var txt;
            var r = confirm(sMessage);
            if (r == true) {
                var x = screen.width / 2 - 800 / 2;
                var y = screen.height / 2 - 400 / 2;
                $window.open('options.html', '_Blank', 'toolbar=no, modal=yes, alwaysRaised=yes, width=800,height=400, top=' + y + ' left=' + x);
            }
        }


    });