angular.module('nourish.services', [])

// Chat socket factory
.factory('ChatSocket', function(socketFactory, AppSettings) {
  return socketFactory({
    ioSocket: io(AppSettings.chatUrl)
  });
})

// Chats factory
.factory('Chats', function(ChatSocket, AppSettings) {
  var factory = {};

  // The flexer's current hall
  factory.hallChoice = undefined;

  // List of halls with offers
  factory.halls = [];

  /**
   * Get a hall and its offers
   * @param  {string} hallName name of hall
   * @return {object|null}
   */
  factory.getHallOffers = function(hallName) {
    var result = null;

    // Loop halls
    factory.halls.some(function(hall) {
      // Test
      if (hall.name === hallName) {
        // Set our result
        result = hall;
        // Break from loop
        return true;
      }
    })

    // Return result's offers
    return result.offers;
  };

  /**
   * Sync current offer (hallChoice) with server
   */
  factory.updateOffer = function() {
    // Is the user currently offering?
    if (!factory.hallChoice) {
      // Quality assurance
      factory.hallChoice = undefined;
      // Leave offer
      ChatSocket.emit('offer leave');
    } else {
      // Send new offer
      ChatSocket.emit('offer new', factory.hallChoice);
    }
  };

  // Loop halls in settings
  AppSettings.halls.forEach(function(hall) {
    // Add hall to halls
    factory.halls.push({
      name: hall.name,
      offers: []
    });
  });

  // Listen for offer count updates
  ChatSocket.on('offer update', function(offers) {
    // Loop our halls
    factory.halls.forEach(function(hall) {
      // If the retrieved offers includes one of our halls...
      if (offers.hasOwnProperty(hall.name) && Array.isArray(offers[hall.name])) {
        // Update our hall's offers
        hall.offers = offers[hall.name];
      } else {
        // Clear array without removing reference
        hall.offers.splice(0, hall.offers.length);
      }
    });
  });

  return factory;
})

/**
 * The monolithic factory for hall, menu, and item data
 */
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

  /**
   * The factory
   * @type {Object}
   */
  var factory = {};

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

  /**
   * Get list of upcoming dates
   * @return {array} list of upcoming dates (Moment objects)
   */
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

  /**
   * Get all halls
   * @return {Promise} Promise w/ items array
   */
  factory.allHalls = function() {
    return setup().then(function(data) {
      return Object.keys(data.halls).map(function(k) { return data.halls[k] });
    });
  };

  /**
   * Get all meals
   * @return {Promise} Promise w/ items array
   */
  factory.allMeals = function() {
    return setup().then(function(data) {
      return Object.keys(data.meals).map(function(k) { return data.meals[k] });
    });
  };

  /**
   * Get all items
   * @return {Promise} Promise w/ items array
   */
  factory.allItems = function() {
    return setup().then(function(data) {
      return Object.keys(data.items).map(function(k) { return data.items[k] });
    });
  };

  /**
   * Get hall with given id
   * Must be called within a promise callback
   * since it assumes data has been filled
   * @param  {string} hallId
   * @return {object}
   */
  factory.hall = function(hallId) {
    return data.halls[hallId];
  };

  /**
   * Get meal with given id
   * Must be called within a promise callback
   * since it assumes data has been filled
   * @param  {string} mealId
   * @return {object}
   */
  factory.meal = function(mealId) {
    return data.meals[mealId];
  };

  /**
   * Get item with given id
   * Must be called within a promise callback
   * since it assumes data has been filled
   * @param  {string} itemId
   * @return {object}
   */
  factory.item = function(itemId) {
    return data.items[itemId];
  };

  return factory;
});
