angular.module('collocationmatching.controllers', [])
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

.controller('BackButtonController', function($scope, $ionicHistory, $stateParams, $filter,
  Data, StateData, SummaryData, Ids){
  $scope.customGoBack = function(){

    $ionicHistory.goBack();
    var currentState = $ionicHistory.currentStateName();

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
})

.controller('CollectionsCtrl', function($scope, $timeout, $ionicLoading, $state, $ionicPopover, $ionicPopup, Data, 
  $cordovaNetwork, $rootScope, Ids, ionicToast){
  $scope.title = Data.getTitle();
  $scope.collections = [];

  var getData = function(isRefreshing){
    $rootScope.show();
    Data.getAllColls(isRefreshing).then(function(response){
      if(response && response.status == 404){
        ionicToast.show(Data.get404Msg(),'middle',true);
        return;
      }
      $scope.collections = response;
      return response;
    }).then(function(res){
      $rootScope.hide();
    });
  }

  if($rootScope.online){
    getData(false);
  }
  else{
    ionicToast.show("Not online",'middle',false,2500);
  }

  $scope.doRefresh = function(){
    if($rootScope.online){
      getData(true);
    }
    else{
      ionicToast.show("Not online",'middle',false,2500);
    }
    $scope.$broadcast('scroll.refreshComplete'); 
  };

  $ionicPopover.fromTemplateUrl("templates/collections-popover.html",{
    scope: $scope
  }).then(function(popover){
    $scope.popover = popover;
  });

  $scope.openPopover = function($event){
    $scope.popover.show($event);
  };

  $scope.showAbout = function(){
    var alertPopup = $ionicPopup.alert({
      scope: $scope,
      title: 'About Flax',
      templateUrl: 'templates/aboutFlax.html'
    });

    alertPopup.then(function(response){
      //custom functionality
    });
  }

  $scope.showHelp = function(){
    var alertPopup = $ionicPopup.alert({
      scope: $scope,
      title: 'How to Play',
      templateUrl: 'templates/howToPlay.html'
    });

    alertPopup.then(function(response){
      //custom functionality
    });
  }
})

.controller('ExsCtrl', function($scope, $timeout, $stateParams, $ionicPopup, $ionicPopover, $rootScope,
  Ids, StateData, SummaryData, Data, ionicToast,$ionicLoading,$ionicListDelegate) {
  
  var name = $stateParams.collectionName;
  $scope.collectionName = name;

  var collId = Ids.getCollId($scope.collectionName);

  var desc = Data.getDesc();
  desc.forEach(function(val){
    if(val.key == name){
      $scope.collDesc = val.desc;
      $scope.collName = val.name;
    }
  });

  if(!$scope.collDesc){
    $scope.collDesc = "n/a";
    $scope.collName = "n/a";
  }

  //create new data for this collection
  if(!StateData.isCreated(collId)){
    StateData.createColl(collId);
  }
  if(!SummaryData.isCreated(collId)){
    SummaryData.createColl(collId);
  }

  var getData = function(collId,isRefreshing){
    $rootScope.show();
    Data.getAllEx(collId,isRefreshing).then(function(response){
      if(response.status && response.status == 404){
        ionicToast.show(Data.get404Msg(),'middle',true);
        return;
      }
      $scope.exercises = response;
      for(var i=0;i<$scope.exercises.length;i++){
        var exerciseId = $scope.exercises[i]._id;
        var exId = Ids.getExId(collId,exerciseId);
        var currentState = StateData.getSingleState(collId,exId);
        if(currentState){
          StateData.updateState(collId,exId,currentState);
        }
        else{
          StateData.updateState(collId,exId,"New");
        }
      }
      $scope.states = StateData.getAllStates(collId);
    }).then(function(){
      $rootScope.hide();
    });
  }

  //fetch the data
  getData(collId,false);

  $scope.doRefresh = function(){
    if($rootScope.online){
      getData(collId,true); 
    }
    else{
      ionicToast.show(Data.getErrorMsg(),'middle');
    }
    $scope.$broadcast('scroll.refreshComplete'); 
  };

  $scope.getId = function(exerciseId){
    return Ids.getExId(collId,exerciseId);
  }

  $scope.doRestart = function(ex){
    var exId = Ids.getExId(collId,ex);
    StateData.updateState(collId,exId,"New");
    /*
    * custom restart functionality
    */

    //close the button afterwards
    $ionicListDelegate.closeOptionButtons();
  }

  //use this method to refresh data
  $scope.$on('$ionicView.enter',function(e){
    $scope.states = StateData.getAllStates(collId);//refresh states
  });

  $ionicPopover.fromTemplateUrl("templates/exercises-popover.html",{
    scope: $scope
  }).then(function(popover){
    $scope.popover = popover;
  });

  $scope.openPopover = function($event){
    $scope.popover.show($event);
  };

  $scope.showAbout = function(){
    var alertPopup = $ionicPopup.alert({
      scope: $scope,
      title: 'About '+name,
      templateUrl: 'templates/aboutCollection.html'
    });

    alertPopup.then(function(response){
      //custom functionality
    });
  }

  $scope.showHelp = function(){
    var alertPopup = $ionicPopup.alert({
      scope: $scope,
      title: 'How to Play',
      templateUrl: 'templates/howToPlay.html'
    });

    alertPopup.then(function(response){
      //custom functionality
    });
  }
})

.controller('ExerciseCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup, $ionicPopover,$filter, $timeout,
  ionicToast, Ids, SummaryData, Data, $rootScope) {
  $scope.slideIndex = 0;//index of initial slide
  $scope.hide = false;

  $rootScope.show();
  var exerciseId = $stateParams.exerciseId;
  var collectionName = $stateParams.collectionName;
  var collId = Ids.getCollId(collectionName);

  //exIds already created in 'ExsCtrl'
  var exId = Ids.getExId(collId,exerciseId);
  if(!SummaryData.getSummary(collId,exId)){
    SummaryData.createSummary(collId,exId);
    var time = new Date();
    var timeNow = $filter('date')(time,'medium');//angularjs date format
    SummaryData.updateStartTime(collId,exId,timeNow);
  }

  //Fisher-Yates shuffle
  var shuffle = function(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle
    while (m) {

      // Pick a remaining element
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  $scope.summary = SummaryData.getSummary(collId,exId);
  $scope.drags = [];

  Data.getSingleEx(collId,exId).then(function(response){
    if(response.status == 404){
      ionicToast.show(Data.get404Msg(),'middle',true);
      return;
    }
    $scope.words = response;
    console.log(response);

    /*
    * Deal with data initialization 
    */

  }).then(function(){//finally creates problems here
    $rootScope.hide();
  });

  $scope.title = Data.getExTitle(collId,$stateParams.exerciseId);

  $scope.checkAnswer = function(){
    if(!checkAll()){
      ionicToast.show('Answer Incorrect!','middle',false,2500);
    }
  }

  checkAll = function(){

    /*
    * check answer
    */
    return false;
  }

  $scope.dragSuccess = function(data,evt,index,slideIndex){
    //custom functionality
  }
  $scope.onDragSuccess = function(data,evt,wordId,slideIndex){
    //custom functionality
  }
  $scope.onDropComplete = function(data,evt,wordId,slideIndex){
    //custom functionality
    checkAll();
  }

  $ionicPopover.fromTemplateUrl("templates/ex-detail-popover.html",{
    scope: $scope
  }).then(function(popover){
    $scope.popover = popover;
  });

  $scope.openPopover = function($event){
    $scope.popover.show($event);
  }

  $scope.showSummary = function(){
    //custom functionality

    var alertPopup = $ionicPopup.alert({
      scope: $scope,
      title: 'Summary report',
      templateUrl: 'templates/summary.html'
    });

    alertPopup.then(function(response){
      //custom functionality
    });

    //close popup after 3 seconds
    // $timeout(function(){
    //   alertPopup.close();
    // }, 5000);
  }

  $scope.restartGame = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Restart this Game!',
      template: 'Would you like to restart this game?'
    });

    confirmPopup.then(function(response){
      if(response){
        //custom functionality
      }
      else{
        // console.log("no");
      }
    });
  }
});
