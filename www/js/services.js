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

.factory('ItemService', function($q, $http, AppSettings, Helpers) {

  /**
   * If menu data has been retrieved by setup
   * @type {Boolean}
   */
  var dataLoaded = false;

  /**
   * All menu data
   * @type {Object}
   */
  var data = {
    // Raw halls/meals/items from api
    all: [],
    halls: {},
    meals: {},
    items: {}
  };

  /**
   * Get all menu data from API
   * @return {Promise} with raw halls data
   */
  function getInit() {
    var deferred = $q.defer();

    $http.get(AppSettings.apiUrl + '/init').success(function(data) {
      deferred.resolve(data);
    }).error(function(err, status) {
      deferred.reject(err, status);
    });

    return deferred.promise;
  }

  /**
   * Grab menu data and organize it
   * @return {[Promise]} Promise w/ data
   */
  function setup() {
    // Only one call to our API is needed for menu data
    // Check if we've done it yet
    if (!dataLoaded) {
      // Grab our raw data (halls)
      return getInit().then(function(hallsRaw) {
        // Store raw halls -> meals -> items
        data.all = hallsRaw;

        // Loop halls
        data.all.forEach(function(hall) {
          // Keep track of hall in data.halls by hall._id
          data.halls[hall._id] = hall;

          // Loop meals in hall
          hall.meals.forEach(function(meal) {
            // Convert meal type id (0-3) to meal type string
            meal.type = Helpers.mealTypeToString(meal.type);

            // Keep track of meal in data.meals by meal._id
            data.meals[meal._id] = meal;

            // Loop items in meal
            meal.items.forEach(function(item) {
              // Check if item already exists in data.items
              if (!data.items.hasOwnProperty(item._id)) {
                // If it doesn't, then add it
                data.items[item._id] = item;
              }
            });
          });
        });

        // Mark our data as loaded and organized
        dataLoaded = true;

        // Return data for promise callback
        return data;
      });
    } else {
      // Since we already have our data, create a
      // 'fake' promise and return it
      var deferred = $q.defer();
      deferred.resolve(data);
      return deferred.promise;
    }
  }

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

  /**
   * Gets halls/meals/items for given date
   * @param  {String|Moment} date ISO string or Moment; can have any H:M:S
   * @return {Promise}            Promise w/ halls
   */
  factory.date = function(date) {
    return setup().then(function(data) {
      var halls = [];

      // Make sure we're working with the start of the day
      date = moment(date).startOf('day');

      // Loop halls from all data
      data.all.forEach(function(hall) {
        // Copy hall; set empty meals array
        var newHall = {
          __v: hall.__v,
          _id: hall._id,
          name: hall.name,
          meals: []
        };

        // Loop meals in hall
        hall.meals.forEach(function(meal) {
          // If meal is on given date, add to newHall
          if (moment(meal.date).startOf('day').isSame(date)) {
            newHall.meals.push(meal);
          }
        });

        // Only add hall to result if it had meals on given date
        if (newHall.meals.length) {
          halls.push(newHall);
        }
      });

      return halls;
    });
  };

  /**
   * Gets halls/meals/items for today
   * @return {Promise} Promise w/ halls
   */
  factory.today = function() {
    // TODO var today = moment().startOf('day');
    var today = moment('2015-07-08').startOf('day');

    return this.date(today);
  };

  factory.datesList = function() {
    return setup().then(function(data) {
      var dates = [];
      data.all.forEach(function(hall) {
        hall.meals.forEach(function(meal) {
          var mom = moment(meal.date).startOf('day').toString();
          if (dates.indexOf(mom) === -1) {
            dates.push(mom);
          }
        });
      });

      return dates;
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
