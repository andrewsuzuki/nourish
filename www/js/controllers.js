// Register nourish.controllers as Angular module
angular.module('nourish.controllers', [])

// Home Menu Controller, just supplies a short menu
// that leads to Today, Upcoming, or Wings Finder
.controller('MenuCtrl', function($scope) {})

// Today Menu Controller, shows list of halls for today
.controller('MenuTodayCtrl', function($scope, AppSettings) {
  $scope.halls = AppSettings.halls;
})

// Today Hall Controller, shows meals/items in given hall for today
.controller('MenuTodayHallCtrl', function($scope, $stateParams, $ionicModal, ItemService, AppSettings, Helpers) {
  var hallDatePromise = ItemService.today();
  HallShare($scope, $stateParams, $ionicModal, AppSettings, Helpers, hallDatePromise);
})

// Upcoming Menu Controller, shows list of dates in the future
.controller('MenuUpcomingCtrl', function($scope, ItemService, Helpers) {
  // Reference to displayDate helper
  $scope.displayDate = Helpers.displayDate;

  // Get list of dates
  ItemService.datesList().then(function(dates) {
    // Set into scope
    $scope.dates = dates;
  });
})

// Upcoming Date Controller, shows list of halls for given date
.controller('MenuUpcomingDateCtrl', function($scope, $stateParams, ItemService, Helpers) {
  // Reference to displayDate helper
  $scope.displayDate = Helpers.displayDate;

  // Make date param available in scope
  $scope.date = $stateParams.date;

  // Get all data for given date
  ItemService.date($scope.date).then(function(halls) {
    $scope.halls = halls;
  });
})

// Upcoming Date Hall Controller, shows meals/items in given hall for given date
.controller('MenuUpcomingDateHallCtrl', function($scope, $stateParams, $ionicModal, ItemService, AppSettings, Helpers) {
  // Convert given date into Moment
  var mom = moment($stateParams.date);

  // Get halls/meals/items for this date
  var hallDatePromise = ItemService.date(mom);

  HallShare($scope, $stateParams, $ionicModal, AppSettings, Helpers, hallDatePromise);
})

// Wings Finder Menu Controller, shows all wings in all halls for all
// future dates within a single view
.controller('MenuWingsCtrl', function($scope, ItemService) {

  // Loaded flag
  $scope.loaded = false;

  // Get all items
  ItemService.allItems().then(function(items) {
    var wings = [];

    // Loop items
    items.forEach(function(item) {
      // Determine if item name contains 'wing'
      if (item.name.toLowerCase().indexOf('wing') !== -1) {
        wings.push(item);
      }
    });

    // Set wings onto scope as items
    $scope.items = wings;

    // Mark as loaded
    $scope.loaded = true;
  });
})

// Chats controller, shows list of halls (effective chat rooms)
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

// Chat Detail Controller, show single chat with other person
.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

// Settings controller
.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

// Show meals/items for a hall on a date
// Used by both MenuTodayHallCtrl and MenuUpcomingDateHallCtrl
function HallShare($scope, $stateParams, $ionicModal, AppSettings, Helpers, hallDatePromise) {
  // Loaded flag
  $scope.loaded = false;

  // Meals list
  $scope.meals = [];

  // The current meal
  // TODO: change initial value depending on time of day
  $scope.currentMeal = 'Breakfast';

  // Tack on to the hallDatePromise and recieve its halls
  hallDatePromise.then(function(halls) {
    // Loop halls
    halls.some(function(hall) {
      // Check if we have the right hall (by name)
      if ($stateParams.hallName === hall.name) {
        // Set given hall into scope
        $scope.hall = hall;

        // Loop meals in hall
        hall.meals.forEach(function(meal) {
          // Organize items into categories
          meal.cats = Helpers.organizeItemsIntoCategories(meal.items);
        });

        // Sort meals
        // TODO fix this since now .type is a string
        hall.meals.sort(function(a, b) {
          return a.type > b.type;
        });

        // Set meals into scope
        $scope.meals = hall.meals;

        // Break; we found our target hall
        return true;
      }
    });

    // Set loaded flag
    $scope.loaded = true;
  });

  // $scope.findItem = function(itemId) {
  //   var found = false;
  //
  //   $scope.meals.some(function(meal) {
  //     meal.items.some(function(item) {
  //       if (item._id === itemId) {
  //         found = item;
  //
  //         // Break
  //         return true;
  //       }
  //     });
  //
  //     if (found) {
  //       // Break
  //       return true;
  //     }
  //   });
  //
  //   return found;
  // };

  $scope.showMeal = function(mealType) {
    $scope.currentMeal = mealType;
  };

  /* POPOVER */

  $ionicModal.fromTemplateUrl('templates/tab-menu-item.html', {
    scope: $scope, // set scope to this scope
    animation: 'slide-in-up' // the only option for now
  }).then(function(modal) {
    $scope.modal = modal; // set modal into scope
  });

  $scope.openItem = function($event, item) {
    $scope.modalItem = item; // set item to be modal'd into scope
    $scope.modal.show($event); // show modal
  };
  $scope.closeItem = function() {
    $scope.modal.remove(); // remove modal
    // In the future, might want to use hide method instead
  };

  // Remove the popover when we're done with it
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  /* END POPOVER */
}
