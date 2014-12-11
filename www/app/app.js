'use strict';

// Declare app level module which depends on views, and components
var appModule = angular.module('homeui', [
  'homeui.mqttServiceModule',
  'homeui.deviceModule',
  'ngRoute'
]);

appModule.config(function ($routeProvider) {
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $routeProvider
        // setup an abstract state for the tabs directive
        .when('/', {
            templateUrl: "templates/splash.html"
        })
        .when('/login', {
            templateUrl: "templates/login.html",
            controller: 'AppController'
        })
        // the pet tab has its own child nav-view and history
        .when('/devices', {
            templateUrl: 'templates/devices.html',
            controller: 'DeviceController'
        })
        .when('/logout', {
            controller: 'DisconnectController'
        });
    // if none of the above states are matched, use this as the fallback
    $routeProvider.otherwise('/devices');
});

appModule.run(function($rootScope, $location, $window, MQTTClient) {
    var host = window.localStorage['host'];
    var port = window.localStorage['port'];
    var user = window.localStorage['user'];
    var password = window.localStorage['password'];
    console.log("Verifying User Session..." + user);
    if(host == null && port == null){
        console.log('Going to login');
        $location.path('/login');
    }else{
        console.log('Going to devices');
        try {
            MQTTClient.connect(host, port, user, password);
            $location.path('/devices');
        } catch(e) {
            console.log(e.toString());
        }
    }
});