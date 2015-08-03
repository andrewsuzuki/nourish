// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('nourish', ['ionic', 'nourish.controllers', 'nourish.services'])

.constant('AppSettings', {
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
  hallNameBySlug: function(slug) {
    var answer;
    this.halls.some(function(hall) {
      if (slug === hall.slug) {
        answer = hall.name;
        return true;
      }
    });
    return answer;
  },
  mealTypes: [
    'Breakfast', // 0
    'Lunch', // 1
    'Dinner', // 2
    'Brunch' // 3
  ]
})

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

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/menu');

});
