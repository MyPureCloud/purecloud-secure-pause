PureCloud SecurePause
=============

>Extension for the GoogleChrome that allow to log-in to PureCloud platform. After log-in, you are able to use Functionality of the SecurePause during a recorded call.

![Zrzut ekranu 2016-08-26 o 11.15.56.png](https://bitbucket.org/repo/rLgzEa/images/1330784784-Zrzut%20ekranu%202016-08-26%20o%2011.15.56.png)


___

How to Install
--------------

Just download it, and load extension from the package.
Link to ghe Google ChromeStore: https://chrome.google.com/webstore/detail/purecloud-securepause/ebdcapllgmgffnhpaoidagomecjbcjbl


After install, go to the setting page and enter your environment and ClientID (generated earlier at PureCloud page)

* Environment: either mypurecloud.com (US & Canada), mypurecloud.ie (EMEA), mypurecloud.jp (Japan), mypurecloud.com.au (Australia) or ininsca.com (development - internal to ININ only)
* Client Id: Your oAuth client id from the oAuth page under Admin/Integrations in your PureCloud org

![Screen3.png](https://bitbucket.org/repo/rLgzEa/images/1309031361-Screen3.png)


* Open the dashboard and voilà!

Important
--------------
This example assume that you're using https://apps.mypurecloud.ie. This value is hardcoded, not dynamic in this exmaple.
Also ClientID is Hardcoded.