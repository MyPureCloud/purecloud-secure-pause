'use strict';


angular.module('pureCloudService', ['ab-base64', 'chromeStorage'])
	.service('pureCloudService', function ($http, $log, $httpParamSerializerJQLike, $q, base64, chromeStorage) {
		var _BgController;

		var _accessToken;
		var _environment;
		var _host;
		var _clientId;
		var _authorization;
		var _userID;
		var _webSocket;
		var _userName;
		var _callbackURI;

		var _CallID;
		var _bSecurePause;


		this.GetToken = function () {
			return _accessToken
		}

		this.GetUserName = function () {
			return _userName
		}

		this.GetSecurePauseStatus = function () {
			return _bSecurePause

		}

		this.GetIsCallActive = function () {
			var bStatus = false;
			if (_CallID) {
				bStatus = true
			}
			return bStatus
		}


		this.GetLoginStatus = function () {
			var bStatus = false;
			if (_accessToken)
				bStatus = true
			return bStatus
		}


		function GetOptions() {

			var bgPage = chrome.extension.getBackgroundPage();
			_BgController = bgPage.getController()

			console.log('GetOptions...');
			var deferred = $q.defer();
			// Load Enviroment Options from ChromeLocalStorage
			// HardCoded values for this specific Customer


			_clientId = '06887ffe-f613-4f97-bf22-6b13faade8fd';
			_environment = 'mypurecloud.ie';
			_callbackURI = 'https://ebdcapllgmgffnhpaoidagomecjbcjbl.chromiumapp.org/index.html';

			/*
						chromeStorage.get('pcOptions').then(function (pcOptions) {
							if (pcOptions) {
								_clientId = pcOptions.pcClientId;
								_environment = pcOptions.pcEnv;
								_callbackURI = pcOptions.pcCalbackURI;
							} else {
								console.log('Empty pcOptions ! Go to the options page first.');
								_BgController.ShowMessage('Please first input valid settings into the option panel.\nWant to go there now?');
								deferred.reject();
			
							}
							deferred.resolve();
						}, function error() {
			
							console.log("unable to read the local storage");
							deferred.reject();
						});
			
			*/
			deferred.resolve();
			return deferred.promise;
		}

		this.GetOptions = GetOptions;

		/*
		 * Gets or Sets environment that this is run in.  If set should be mypurecloud.com, mypurecloud.ie, mypurecloud.com.au, etc.
		 * @memberof pureCloudService#
		 * @param environment
		 * { environment : 'purecloud.com' {string} environment PureCloud environment (mypurecloud.com, mypurecloud.ie, mypurecloud.au, etc)
		 *   clienId : 0c731aeb-d7e6-4fe5-8f24-1fb3055f997e 
		 * }  
		 */
		function getParameterByName(name, fromURL) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
				results = regex.exec(fromURL);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		}


		function setEnvironment() {
			var deferred = $q.defer();
			_bSecurePause = false;
			this.GetOptions().then(function () {

				_host = 'api.' + _environment;
				console.log('Start OAuth');

				var redirectUri = _callbackURI;
				console.log('CallbackURI: ' + redirectUri);
				var auth_url = "https://login." + _environment + "/oauth/authorize?client_id=" + _clientId + "&response_type=token&redirect_uri=" + encodeURIComponent(redirectUri);

				chrome.identity.launchWebAuthFlow({ 'url': auth_url, 'interactive': true }, function (redirect_url) {
					_accessToken = getParameterByName('access_token', redirect_url);
					console.log('Received Token: ' + _accessToken);
					_authorization = true;

					// Get Me (We need a UserID)

					var apipath = '/api/v2/users/me';
					var requestBody;
					var queryParameters = {};
					var headers = {};
					var form = {};

					try {
						sendRestRequest('get.users.me', 'GET', apipath + '?' + $httpParamSerializerJQLike(queryParameters), requestBody).then(function success(response) {
							console.log('UserID: ' + response.data.id);

							//console.log(response.data);
							_userID = response.data.id;

							var sUser = response.data.name;
							var iSpaceChar = sUser.indexOf(' ');
							var sShortName = sUser.substring(0, iSpaceChar) + '.' + sUser.substring(iSpaceChar + 1, iSpaceChar + 2);

							_userName = sShortName;
							// We've got userID, time to subscribe for notifications

							subscribeForNotifications();
							deferred.resolve({ "OK": "OK" });
						}, function error(Err) {
							console.error(Err);
							_BgController.ShowMessage(Err.data.message);
							deferred.reject();
						});
					}
					catch (e) {
						console.error('Error: ' + e);
						deferred.reject();
					}
				});
			});
			return deferred.promise;
		}

		function subscribeForNotifications() {
			var apipath = '/api/v2/notifications/channels';
			var requestBody = {};
			var queryParameters = {};
			var headers = {};
			var form = {};

			try {
				sendRestRequest('channel.create', 'POST', apipath + '?' + $httpParamSerializerJQLike(queryParameters), requestBody).then(function success(response) {
					console.log('Channel for notificataions created...');

					_webSocket = new WebSocket(response.data.connectUri);
					var _channelID = response.data.id;
					console.log('Try to open socket ...');
					_webSocket.onopen = function () {
						console.log('Socket opened. Subscribe for notifications...');

						var apipath = '/api/v2/notifications/channels/' + _channelID + '/subscriptions'
						var requestBody = [
							{
								"id": "v2.users." + _userID + ".conversations"
							}
						]
						var queryParameters = {};
						var headers = {};
						var form = {};

						sendRestRequest('channel.subscribeForNotifications', 'POST', apipath + '?' + $httpParamSerializerJQLike(queryParameters), requestBody).then(function success(response) {
							console.debug('Success. User subscribed for notifictions.');

						}, function error() {
							console.error('Error. User failed for subscribe for notifictions. !!');
						});
					};

					_webSocket.onmessage = function (message) {
						var data = JSON.parse(message.data);
						if (data.topicName !== 'channel.metadata') {
							var sObject = data.eventBody.participants[0];
							if (sObject.calls[0]) {
								// Check if this is DISCONNECT EVENT (it TRUE, clear CallID var)
								if (sObject.calls[0].state == "DISCONNECTED") {
									_CallID = "";
									_bSecurePause = false;
								} else if (sObject.calls[0].state == "CONNECTED") {
									_CallID = data.eventBody.id; // Save CallID of this interaction
									//console.log('Received callID: ' + _CallID);
								}
								console.log(sObject.calls[0].state + '(' + _CallID + ')');
							}
						}
					}

					_webSocket.onclose = function (message) {
						$log.warn('Notification socket has been closed: ' + JSON.stringify(message.data));
						_accessToken = "";
					};

					_webSocket.onerror = function (message) {
						$log.error('Notification socket error: ' + JSON.stringify(message.data));
						_accessToken = "";
					};

					//deferred.resolve({ 'Response': response });
				}, function error() {
					console.error('Error !!');
					//deferred.reject();
				});
			}
			catch (e) {
				console.error('Error: ' + e);
				//deferred.reject();
			}
		}


		this.StartSecurePause = function () {

			var deferred = $q.defer();
			var requestBody = {
				"recordingState": "paused"
			};

			var apipath = '/api/v2/conversations/calls/' + _CallID;
			var queryParameters = {};
			var headers = {};
			var form = {};

			try {
				sendRestRequest('conversation.calls.pauseRecording', 'PATCH', apipath + '?' + $httpParamSerializerJQLike(queryParameters), requestBody).then(function success(response) {
					console.log('Success. SecurePause enabled');
					_bSecurePause = true;
					deferred.resolve({ "OK": "OK" });
				}, function error() {
					console.error('Failed to pauseRecording !');
					_bSecurePause = false;
					deferred.reject();
				});
			}
			catch (e) {
				console.error('Failed to pauseRecording ! Error: ' + e);
				_bSecurePause = false;
				deferred.reject();
			}
			return deferred.promise;
		}

		this.ResumeRecording = function () {
			var deferred = $q.defer();

			var requestBody = {
				"recordingState": "active"
			};
			var apipath = '/api/v2/conversations/calls/' + _CallID;
			var queryParameters = {};
			var headers = {};
			var form = {};

			try {
				sendRestRequest('conversation.calls.ResumeRecording', 'PATCH', apipath + '?' + $httpParamSerializerJQLike(queryParameters), requestBody).then(function success(response) {
					_bSecurePause = false;
					deferred.resolve({ "OK": "OK" });
				}, function error() {
					console.error('Failed to ResumeRecording !');
					_bSecurePause = true;
					deferred.reject();
				});
			}
			catch (e) {
				console.error('Failed to ResumeRecording : ' + e);
				_bSecurePause = true;
				deferred.reject();
			}
			return deferred.promise;
		}



		this.setEnvironment = setEnvironment;

		function sendRestRequest(requestName, method, path, body) {
			console.log('Start sendRestRequest');
			if (!_authorization) {
				throw new Error('Authentication required!');
			}
			if (!_host) {
				throw new Error('setEnvironment first!');
			}
			if (!requestName) {
				throw new Error('Missing required parameter: requestName');
			}
			if (!method) {
				throw new Error('Missing required parameter: method');
			}
			if (!path) {
				throw new Error('Missing required parameter: path');
			}

			var options = {
				method: method,
				url: 'https://' + _host + path,
				headers: {
					'Authorization': "Bearer " + _accessToken
				},
				data: body
			};

			var request = $http(options);
			console.log('Start Request: ' + requestName);
			request.then(function success(response) {
				//console.log('End Request: ' + requestName + ' (' + JSON.stringify(response.data) + ')');
			}, function error(response) {
				if (response.status === 400 && response.data) {
					console.error('Request: ' + requestName + ': ' + response.data.code + ': ' + response.data.message + ' (' + JSON.stringify(response.data) + ')');
				}
				else {
					console.error('Request: ' + requestName + ': HTTP ' + response.status + ' (' + response.statusText + ')');
				}
				console.error('End Request: ' + requestName);
			});

			return request;
		}

	});