angular.module('nourish.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('ItemService', function($q, $http, AppSettings) {
  var dataLoaded = false;

  var data = {
    all: [],
    halls: {},
    meals: {},
    items: {}
  };

  // Get initial data, then organize
  function setup() {
    if (!dataLoaded) {
      return getInit().then(function(hallsRaw) {
        // Store raw halls -> meals -> items
        data.all = hallsRaw;

        // Associate items with their parent meals and halls
        var items = {};
        hallsRaw.forEach(function(hall) {
          data.halls[hall._id] = hall;

          hall.meals.forEach(function(meal) {
            // Convert meal type id to meal type string
            meal.type = mealType(meal.type);

            data.meals[meal._id] = meal;

            meal.items.forEach(function(item) {
              if (!items.hasOwnProperty(item._id)) {
                items[item._id] = item;
                items[item._id].hallmeals = [];
              }

              items[item._id].hallmeals.push({
                'hall': hall._id,
                'meal': meal._id
              });
            });
          });
        });

        data.items = items;

        dataLoaded = true;

        return data;
      });
    } else {
      var deferred = $q.defer();
      deferred.resolve(data);
      return deferred.promise;
    }
  }

  // Get initial data from API
  function getInit() {
    var deferred = $q.defer();

    $http.get(AppSettings.apiUrl + '/init').success(function(data) {
      deferred.resolve(data);
    }).error(function(err, status) {
      deferred.reject(err, status);
    });

    return deferred.promise;
  }

  function mealType(mealTypeId) {
    return AppSettings.mealTypes[mealTypeId];
  };

  // Factory

  var factory = {};

  factory.allHalls = function() {
    return setup().then(function(data) {
      return Object.keys(data.halls).map(function(k) { return data.halls[k] });
    });
  };

  factory.allMeals = function() {
    return setup().then(function(data) {
      return Object.keys(data.meals).map(function(k) { return data.meals[k] });
    });
  };

  factory.today = function() {
    //var today = moment().startOf('day');
    var today = moment('2015-07-08').startOf('day');

    return this.day(today);
  };

  factory.day = function(date) {
    return setup().then(function(data) {
      var halls = [];

      var day = moment(date).startOf('day');

      data.all.forEach(function(hall) {
        var newHall = {
          __v: hall.__v,
          _id: hall._id,
          name: hall.name,
          meals: []
        };

        hall.meals.forEach(function(meal) {
          if (moment(meal.date).startOf('day').isSame(day)) {
            newHall.meals.push(meal);
          }
        });

        if (newHall.meals.length) {
          halls.push(newHall);
        }
      });

      return halls;
    });
  };

  factory.daysList = function() {
    return setup().then(function(data) {
      var days = [];
      data.all.forEach(function(hall) {
        hall.meals.forEach(function(meal) {
          var mom = moment(meal.date).startOf('day').toString();
          if (days.indexOf(mom) === -1) {
            days.push(mom);
          }
        });
      });

      return days;
    });
  };

  factory.allItems = function() {
    return setup().then(function(data) {
      return Object.keys(data.items).map(function(k) { return data.items[k] });
    });
  };

  factory.hall = function(hallId) {
    return data.halls[hallId];
  };

  factory.meal = function(mealId) {
    return data.meals[mealId];
  };

  factory.item = function(itemId) {
    return data.items[itemId];
  };

  return factory;

});
