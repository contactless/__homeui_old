/**
 * Created by melges on 03.12.14.
 */

var deviceModule = angular.module('homeui.deviceModule', []);

deviceModule.controller('AppController', function($scope, $location, MQTTClient) {
    // Main app controller
    $scope.loginData = {};
    $scope.loginData.port = 18883;

    $scope.tryConnect = function() {
        console.log('Try to connect as ' + $scope.loginData.user);
        if($scope.loginData.host && $scope.loginData.port){
            window.localStorage.setItem('host',$scope.loginData.host);
            window.localStorage.setItem('port',$scope.loginData.port);
            window.localStorage.setItem('user',$scope.loginData.user);
            window.localStorage.setItem('password',$scope.loginData.password);
            MQTTClient.connect($scope.loginData.host, $scope.loginData.port,
                $scope.loginData.user, $scope.loginData.password);
            console.log('Successfully logged in ' + $scope.loginData.user);
            $location.path('/devices');
        }else{
            $scope.showAlert();
        }

    };

    $scope.disconnect = function() {
        MQTTClient.disconnect();
        window.localStorage.clear();
        $location.path('/login');
    };
});

deviceModule.controller('DeviceController', function($scope, $location, $rootScope, MQTTClient) {
    $scope.devices = {};

    $scope.change = function(device) {

    };

    MQTTClient.onMessage(function(message) {
        console.log("In device callback");
        var pathItems = message.destinationName.split('/');
        if(pathItems[1] != "devices") {
            console.log("Message not about device, ignoring");
            return null;
        }

        var deviceName = pathItems[2];
        var device;
        if($scope.devices[deviceName] != null)
            // We already register the device, change it
            device = $scope.devices[deviceName];
        else {
            device = {name: deviceName, meta: {}, controls: {}};
            $scope.devices[deviceName] = device;
        }

        parseMessage(device, pathItems, message);

        $scope.$apply();
    });

    function parseMessage(device, pathItems, message) {
        switch(pathItems[3]) {
            case "meta":
                var parsedMeta = parseMeta(pathItems, message);
                device.meta[parsedMeta.attributeName] = parsedMeta.value;
        }
    }

    function parseMeta(pathItems, message) {
        return {
            attributeName: pathItems[4],
            value: message.payloadString
        };
    }
});