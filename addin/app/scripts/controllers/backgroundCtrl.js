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
    var _accessToken;
    var myUrl;


    chrome.runtime.onMessageExternal.addListener(
      function (request, sender, sendResponse) {
        // if (sender.url == blacklistedWebsite)
        //     return;  // don't allow this web page access
        if (request.openUrlInEditor)
          console.log(request.openUrlInEditor);
      });

   
    function GetTabs() {

      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (arrayOfTabs) {
        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        var activeTab = arrayOfTabs[0];
        var activeTabId = activeTab.id; // or do whatever you need
        console.log(activeTab.url);
        pureCloudService.GetStatus(_accessToken);
      });
    }



    chrome.tabs.onUpdated.addListener(function (tabId, info) {
      if (!myUrl) {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function (arrayOfTabs) {
          // since only one tab should be active and in the current window at once
          // the return variable should only have one entry
          try {
            var activeTab = arrayOfTabs[0];
            if (activeTab) {
              if (activeTab.url.indexOf('login.mypurecloud') !== -1) {
                console.log('Detected PureCloud domain:', activeTab.url.substr(activeTab.url.length - 4, 3));
                myUrl = 'https://apps.mypurecloud' + activeTab.url.substr(activeTab.url.length - 4, 3);
              }

            }
          } catch (error) {

          }
        });

      }
      if (myUrl && info.status == "complete") {

        if (GetPureCloudToken()) {
            pureCloudService.GetStatus(_accessToken);
          //GetTabs();
        }

        //var activeTabId = activeTab.id; // or do whatever you need
      }
    });

    $scope.getPCService = function () {
      return pureCloudService;
    };

    $scope.Login = function () {
      pcService.Login();
    };

    $scope.Log = function (sMessage) {
      console.log(sMessage);
    }

    //myUrl = "https://apps.mypurecloud.ie"; // assuming that this is the url

    function GetPureCloudToken() {

      if (_accessToken) return true;
      chrome.cookies.get({
        url: myUrl,
        name: 'ININ-Auth-Api'
      }, function (cookie) {
        // do something with the cookie
        if (cookie) {
          console.log(cookie.value);
          _accessToken = cookie.value;
          pureCloudService.GetStatus(_accessToken);
          return true;
        } else
          console.log('ININ-Auth-Api Cookie not found.');

      });

      return false;

      // pureCloudService._accessToken = _accessToken;


    }


    $scope.ShowMessage = function (sMessage) {
      console.log(sMessage);
      var txt;
      var r = alert(sMessage);
      if (r == true) {
        var x = screen.width / 2 - 800 / 2;
        var y = screen.height / 2 - 400 / 2;
        $window.open('options.html', '_Blank', 'toolbar=no, modal=yes, alwaysRaised=yes, width=800,height=400, top=' + y + ' left=' + x);
      }
    }


  });