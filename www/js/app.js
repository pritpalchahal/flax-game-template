// angular.module is a global place for creating, registering and retrieving Angular modules
// 'collocationmatching' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'collocationmatching.services' is found in services.js
// 'collocationmatching.controllers' is found in controllers.js
angular.module('collocationmatching', ['ionic', 'collocationmatching.controllers', 'collocationmatching.services',
  'ngDraggable', 'ngCordova','ionic-toast'])

.run(function($ionicPlatform, $ionicHistory, $stateParams, $filter, $ionicPopup, $window, $rootScope,
  Data, StateData, SummaryData, ionicToast, Ids, $ionicLoading) {

  //check network connection
  $rootScope.online = navigator.onLine;
  $window.addEventListener("offline", function () {
    $rootScope.$apply(function() {
      $rootScope.online = false;
      ionicToast.show("offline",'bottom');
    });
  }, false);
  $window.addEventListener("online", function () {
    $rootScope.$apply(function() {
      $rootScope.online = true;
      ionicToast.show("online",'bottom');
    });
  }, false);

  if(!$rootScope.online){
    $ionicPopup.alert({
      title: 'Connection error',
      subTitle: 'No internet connection detected',
      buttons: [
        {
          text: 'Close',
          type: 'button-negative'
        }]
    });
  }

  $rootScope.show = function(){
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner class="spinner-balanced" icon="spiral"></ion-spinner>'
    });
  }
  $rootScope.hide = function(){
    $ionicLoading.hide();
  }

  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $ionicPlatform.registerBackButtonAction(function (event){
    var currentState = $ionicHistory.currentStateName();
    if(currentState == "collections"){
      // navigator.app.exitApp();//exit the app
      backAsHome.trigger();//exitApp as home button (don't kill the app)
      // event.preventDefault();//don't do anything
    }
    else{
      //this can also be accompolished using $ionicPlatform.onHardwareBackButton
      $ionicHistory.goBack();

      if(currentState != "exercise"){
        return;
      }
    
      var exerciseId = $stateParams.exerciseId;
      var name = $stateParams.collectionName;
      var collId = Ids.getCollId(name);
      var exId = Ids.getExId(collId,exerciseId);

      //update end time
      if(StateData.getSingleState(collId,exId) != "Complete"){
        var time = new Date();
        var timeNow = $filter('date')(time,'medium');
        SummaryData.updateEndTime(collId,exId,timeNow);
      }

      /*
      * custom functionality to check if exercise is completed
      */
      var condition = false;
      if(condition){
        StateData.updateState(collId,exId,"Complete");
      }
      else{
        StateData.updateState(collId,exId,"Incomplete");
      }
    }
  }, 100);

  // override default android back button behavior 
  //   $ionicPlatform.onHardwareBackButton(function(){
  // });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  //to override default behaviors of specific platforms (android,ios etc)
  //e.g. android align its titles to left by default, so needs to change it here
  //refer to docs http://ionicframework.com/docs/api/provider/$ionicConfigProvider/
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.backButton.text("");
  $ionicConfigProvider.backButton.icon('my-back-button');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('collections',{
    url: '/collections',
        templateUrl: 'templates/collections.html',
        controller: 'CollectionsCtrl'
  })

  .state('exs', {
    url: '/collections/:collectionName',
        templateUrl: 'templates/exercises.html',
        controller: 'ExsCtrl'
  })

  .state('exercise', {
    url: '/collections/:collectionName/:exerciseId',
        templateUrl: 'templates/ex-detail.html',
        controller: 'ExerciseCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/collections');

});
