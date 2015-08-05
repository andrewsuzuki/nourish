/**
 * Nourish Mobile App
 */

// Register nourish as Angular module
angular.module('nourish', [
  'ionic',
  'btford.socket-io',
  'nourish.controllers',
  'nourish.services'
])

/**
 * App settings and constants
 */
.constant('AppSettings', {
  chatUrl: 'http://localhost:8080', // TODO
  apiUrl: 'http://localhost:8080/api', // TODO
  halls: [
    { slug: 'whitney', name: 'Whitney' },
    { slug: 'buckley', name: 'Buckley' },
    { slug: 'mcmahon', name: 'McMahon' },
    { slug: 'putnam', name: 'Putnam' },
    { slug: 'north', name: 'North' },
    { slug: 'northwest', name: 'Northwest' },
    { slug: 'south', name: 'South' },
    { slug: 'towers', name: 'Gelfenbein Commons (Towers)' },
  ],
  mealTypes: [
    'Breakfast', // 0
    'Lunch', // 1
    'Dinner', // 2
    'Brunch' // 3
  ]
})

/**
 * Misc injectable helper functions
 */
.factory('Helpers', function(AppSettings) {
  return {
    /**
     * Take a date and format it
     * Turns today's/tomorrow's date into 'Today' and 'Tomorrow'
     * @param date    ISO/Moment date
     * @param format  'long'|'short'|Moment date format
     */
    displayDate: function(date, format) {
      if (format === 'long') {
        format = 'dddd MMMM Do YYYY';
      } else if (typeof format === 'undefined' || format === 'short') {
        format = 'ddd M/D'; // Sun 3/13
      }

      var mom = moment(date).startOf('day');
      var today = moment().startOf('day');
      if (mom.isSame(today)) {
        return 'Today';
      } else if (mom.isSame(today.add(1, 'days'))) {
        return 'Tomorrow';
      } else {
        return mom.format(format);
      }
    },

    /**
     * Convert meal type (0-3) to string
     * @param  {number} mealType 0-3 (see AppSettings)
     * @return {string} 'Breakfast', 'Lunch', etc
     */
    mealTypeToString: function(mealType) {
      return AppSettings.mealTypes[mealType];
    },

    /**
     * Takes an array of items and organizes them by category
     * @param  {array} items list of item objects
     * @return {array}       list of categories with items
     */
    organizeItemsIntoCategories: function(items) {
      var cats = [];

      // Loop items
      items.forEach(function(item) {
        var catFound = false;

        // Loop existing categories
        cats.some(function(cat) {
          // If this item's category already exists,
          // mark flag and add item to category
          if (cat.name === item.cat) {
            catFound = true;

            cat.items.push(item);

            // Break
            return true;
          }
        });

        if (!catFound) {
          // Category doesn't exist yet
          // Create it with item
          cats.push({
            name: item.cat,
            items: [ item ]
          });
        }
      });

      return cats;
    }
  };
})

// Configure Cordova
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

/**
 * Register states/routes
 */
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  // Setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack

  .state('tab.menu', {
    url: '/menu',
    views: {
      'tab-menu': {
        templateUrl: 'templates/tab-menu.html',
        controller: 'MenuCtrl'
      }
    }
  })

  .state('tab.menu-today', {
    url: '/menu/today',
    views: {
      'tab-menu': {
        templateUrl: 'templates/tab-menu-today.html',
        controller: 'MenuTodayCtrl'
      }
    }
  })

  .state('tab.menu-today-hall', {
    url: '/menu/today/hall/:hallName',
    views: {
      'tab-menu': {
        templateUrl: 'templates/tab-menu-hall.html',
        controller: 'MenuTodayHallCtrl'
      }
    }
  })

  .state('tab.menu-upcoming', {
    url: '/menu/upcoming',
    views: {
      'tab-menu': {
        templateUrl: 'templates/tab-menu-upcoming.html',
        controller: 'MenuUpcomingCtrl'
      }
    }
  })

  .state('tab.menu-upcoming-date', {
    url: '/menu/upcoming/date/:date',
    views: {
      'tab-menu': {
        templateUrl: 'templates/tab-menu-upcoming-date.html',
        controller: 'MenuUpcomingDateCtrl'
      }
    }
  })

  .state('tab.menu-upcoming-date-hall', {
    url: '/menu/upcoming/date/:date/hall/:hallName',
    views: {
      'tab-menu': {
        templateUrl: 'templates/tab-menu-hall.html',
        controller: 'MenuUpcomingDateHallCtrl'
      }
    }
  })

  .state('tab.menu-wings', {
    url: '/menu/wings',
    views: {
      'tab-menu': {
        templateUrl: 'templates/tab-menu-wings.html',
        controller: 'MenuWingsCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-hall', {
        url: '/chats/hall/:hallName',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chat-hall.html',
            controller: 'ChatHallCtrl'
          }
        }
      })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  });

  // If none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/menu');

});
