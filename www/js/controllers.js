angular.module('nourish.controllers', [])

.controller('MenuCtrl', function($scope) {
})

.controller('MenuTodayCtrl', function($scope, AppSettings) {
  $scope.halls = AppSettings.halls;
})

.controller('MenuTodayHallCtrl', function($scope, $stateParams, $ionicModal, ItemService, AppSettings) {
  var hallDayPromise = ItemService.today();
  HallShare($scope, $stateParams, $ionicModal, AppSettings, hallDayPromise);
})

.controller('MenuUpcomingCtrl', function($scope, ItemService) {
  //List dates
  $scope.displayDate = function(date) {
    // TODO: add replacements for "today", "tomorrow", etc
    return moment(date).toString();
  };

  ItemService.daysList().then(function(days) {
    $scope.dates = days;
  });
})

.controller('MenuUpcomingDateCtrl', function($scope, $stateParams, ItemService) {
  // List halls in day
  $scope.date = $stateParams.date;
  ItemService.day($scope.date).then(function(halls) {
    $scope.halls = halls;
    console.log(halls);
  });
})

.controller('MenuUpcomingDateHallCtrl', function($scope, $stateParams, $ionicModal, ItemService, AppSettings) {
  // Display meals in hall for given day
  var mom = moment($stateParams.date);
  var hallDayPromise = ItemService.day(mom);
  HallShare($scope, $stateParams, $ionicModal, AppSettings, hallDayPromise);
})

.controller('MenuWingsCtrl', function($scope) {
  //Wings
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

function HallShare($scope, $stateParams, $ionicModal, AppSettings, hallDayPromise) {
  $scope.loaded = false;

  // TODO: change initial value depending on
  // time of day
  $scope.currentMeal = 'Breakfast';

  hallDayPromise.then(function(halls) {
    halls.some(function(hall) {
      if ($stateParams.hallName === hall.name) {
        $scope.hall = hall;

        hall.meals.forEach(function(meal) {
          meal.cats = $scope.organizeItemsIntoCats(meal.items);
        });

        hall.meals.sort(function(a, b) {
          return a.type > b.type;
        });

        $scope.meals = hall.meals;

        // Break
        return true;
      }
    });

    //$scope.halls = halls;
    $scope.loaded = true;
  });

  $scope.organizeItemsIntoCats = function(items) {
    var cats = [];

    items.forEach(function(item) {
      var catFound = false;

      cats.some(function(cat) {
        if (cat.name === item.cat) {
          catFound = true;

          cat.items.push(item);

          // Break
          return true;
        }
      });

      if (!catFound) {
        cats.push({
          name: item.cat,
          items: [ item ]
        });
      }
    });

    return cats;
  };

  $scope.findItem = function(itemId) {
    var found = false;

    $scope.meals.some(function(meal) {
      meal.items.some(function(item) {
        if (item._id === itemId) {
          found = item;

          // Break
          return true;
        }
      });

      if (found) {
        // Break
        return true;
      }
    });

    return found;
  };

  $scope.showMeal = function(mealType) {
    $scope.currentMeal = mealType;
  };

  /* POPOVER */

  // .fromTemplateUrl() method
  $ionicModal.fromTemplateUrl('templates/tab-menu-item.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openItem = function($event, item) {
    $scope.modalItem = item;
    $scope.modal.show($event);
  };
  $scope.closeItem = function() {
    $scope.modal.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide popover
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  /* END POPOVER */
}
