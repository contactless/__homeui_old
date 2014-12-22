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

deviceModule.controller('DeviceController', function($scope, $location, $rootScope, $interval, MQTTClient) {
    $scope.devices = {};

    $scope.change = function(device) {

    };

    //$('#container').wookmark();

    var wookmarkOptions = {
        // Prepare layout options.
        autoResize: true, // This will auto-update the layout when the browser window is resized.
        container: $('#devicesContainer'), // Optional, used for some extra CSS styling
        offset: 16, // Optional, the distance between grid items
        outerOffset: 10, // Optional, the distance to the containers border
        itemWidth: 420, // Optional, the width of a grid item
        fillEmptySpace:false
    };

    MQTTClient.onMessage(function(message) {
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

        $scope.$apply(function (){
            $("#devicesContainer .card").wookmark(wookmarkOptions);
        });


    });

    function parseMessage(device, pathItems, message) {
        switch(pathItems[3]) {
            case "meta":
                parseDeviceMeta(device, pathItems, message);
                break;
            case "controls":
                parseControls(device, pathItems, message);
        }
    }

    function parseDeviceMeta(device, pathItems, message) {
        var attributeName = pathItems[4], value = message.payloadString;

        switch(attributeName) {
            case "name":
                device.metaName = value;
                break;
            case "room":
                device.metaRoom = value;
                break;
            default:
                device.meta[attributeName] = value;
                break;
        }
    }

    function parseControlsMeta(control, pathItems, message) {
        var attributeName = pathItems[6], value = message.payloadString;
        switch(attributeName) {
            case "name":
                control.metaName = value;
                break;
            case "type":
                control.metaType = value;
                break;
            case "order":
                control.metaOrder = value;
                break;
            default:
                control.meta[attributeName] = value;
                break;
        }
    }


    function parseControls(device, pathItems, message) {
        var controlName = pathItems[4];
        var control;
        if(device.controls[controlName] == null) {
            // create new control
            control = device.controls[controlName] = {name: controlName, meta: {}, metaType: "NONE"};
        } else
            control = device.controls[controlName];

        switch(pathItems[5]) {
            case "meta":
                parseControlsMeta(control, pathItems, message);
                break;
            case null:
                control.value = new DataView(message.payloadBytes).getInt8(0);
        }

    }
});
