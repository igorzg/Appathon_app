// Ionic Starter App
(function (window) {
  window.TRANSPORT_URL = "ws://localhost:9000/transport";
  window.SESSION_ID_KEY = "myshare_session_id";
  window.TOKEN_ID_KEY = "token";

  //console.log('WebSocketClient', WebSocketClient in window);
  console.log('haveWebsocket support', WebSocket in window);

  var app = angular.module('starter', ['ionic', 'starter.controllers']);

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      if (c === 'x') {
        return r.toString(16);
      }
      return (r & 0x3 | 0x8).toString(16);
    });
  }

  app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  });


  app.service("cookies", function () {
    /**
     * Cookie handler
     * @type {{set: CookieHandler.set, get: CookieHandler.get, has: CookieHandler.has, clear: CookieHandler.clear}}
     */
    return {
      set: function (name, value, secs) {
        if (secs) {
          var date = new Date();
          date.setTime(date.getTime() + ( secs * 1000 ));
          var expires = "; expires=" + date.toGMTString();
        } else {
          var expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
      },
      get: function (name) {
        var cn = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(cn) == 0) return c.substring(cn.length, c.length);
        }
        return null;
      },
      has: function (name) {
        return this.get(name) !== null;
      },
      clear: function (name) {
        this.set(name, "", -1);
      }
    };
  });

  /**
   * Custom modules
   */
  app.service('transport', [
    "$q", "atLocalEventHandler", "$rootScope", "$timeout", "cookies",
    function ($q, events, $rootScope, $timeout, cookies) {
      var atTransportSocket = new window.WebSocket(TRANSPORT_URL),
        isConnected = false,
        lazyConnectEvents = [];

      console.log('INIT_SOCKET', atTransportSocket);

      if (!cookies.has(SESSION_ID_KEY)) {
        cookies.set(SESSION_ID_KEY, uuid());
      }

      /**
       * On receive fire event
       * @param event
       */
      atTransportSocket.onclose = function atTransportSocketClose(event) {
        console.log('socket close', event);
        //events.trigger("close", JSON.parse(event.data));
      };

      /**
       * On receive fire event
       * @param event
       */
      atTransportSocket.onerror = function atTransportSocketError(event) {
        console.log('socket error', event);
        events.trigger("error", JSON.parse(event.data));
      };
      /**
       * On receive fire event
       * @param event
       */
      atTransportSocket.onmessage = function atTransportSocketMessage(event) {
        console.log('socket message', event);
        events.trigger("receive", JSON.parse(event.data));
      };
      /**
       * On open process lazy events
       */
      atTransportSocket.onopen = function atTransportSocketOpen(e) {
        console.log('socket open', e, cookies.get(SESSION_ID_KEY));
        var event;
        isConnected = true;
        while (lazyConnectEvents.length) {
          event = lazyConnectEvents.shift();
          atTransportSocket.send(JSON.stringify(event));
        }
      };
      /**
       * Register send event
       */
      events.add("send", function (event) {
        if (isConnected) {
          atTransportSocket.send(JSON.stringify(event));
        } else {
          lazyConnectEvents.push(event);
        }
      });

      /**
       * On unload terminate
       */
      angular.element(window).bind('unload', function () {
        events.trigger("send", {
          name: "unload",
          id: "unload",
          terminate: false,
          session_id: cookies.get(SESSION_ID_KEY),
          params: {}
        });
      });

      /**
       * Crete user event
       * @param name
       * @returns {*}
       */
      function createEvent(name) {
        return function processEvent(params, fireEvents) {
          var deferred = $q.defer(),
            id = uuid(),
            timeout = $timeout(function () {
              deferred.reject("no_response");
              events.remove("receive", receiveEvent);
            }, 30000);


          events.trigger("send", {
            name: name,
            id: id,
            terminate: false,
            session_id: cookies.get(SESSION_ID_KEY),
            params: params || {}
          });

          console.log("client_send", {
            name: name,
            id: id,
            session_id: cookies.get(SESSION_ID_KEY),
            params: params || {}
          });

          events.add("receive", receiveEvent);

          /**
           * Terminate event
           */
          deferred.promise.terminate = function terminate() {
            events.trigger("send", {
              name: name,
              id: id,
              terminate: true,
              params: {}
            });
            deferred.reject("terminated");
          };

          return deferred.promise;

          function receiveEvent(response) {
            if (response.name === name && response.id === id) {
              console.log("client_received", response);
              deferred.notify(angular.copy(response.data));
              $timeout.cancel(timeout);
              $rootScope.$apply();
            }
          }
        }
      }

      /**
       * Return api
       */
      return {
        linkBank: createEvent("linkBank"),
        getAccounts: createEvent("getAccounts"),
        getUser: createEvent("getUser"),
        createUser: createEvent("createUser"),
        logIn: createEvent("logIn"),
        updateUser: createEvent("updateUser")
      };
    }
  ]);
  /**
   * Local event handler
   */
  app.factory('atLocalEventHandler', function () {
    return new EventHandler();
  });
  /**
   * Global event handler
   */
  app.service('atGlobalEventHandler', EventHandler);

  /**
   * Event handler
   * @constructor
   */
  function EventHandler() {
    this.events = [];
  }

  /**
   * Remove all events by name
   * @param name
   * @constructor
   */
  EventHandler.prototype.removeAllByName = function EventHandler_removeAllByName(name) {
    this.events.filter(function (item) {
      return item.name === name;
    }).forEach(function (event) {
      this.events.splice(this.events.indexOf(event), 1);
    }.bind(this));
  };
  /**
   * Remove event
   * @param name
   * @param callback
   * @constructor
   */
  EventHandler.prototype.remove = function EventHandler_remove(name, callback) {
    var item = this.events.filter(function (item) {
      return item.name === name && item.callback === callback
    }).shift();
    if (item) {
      this.events.splice(this.events.indexOf(item), 1);
    }
  };

  /**
   * Trigger event
   * @param name
   * @constructor
   */
  EventHandler.prototype.trigger = function EventHandler_trigger(name) {
    var args = Array.prototype.slice.call(arguments, 1);
    this.events.forEach(function (item) {
      if (item.name === name) {
        item.callback.apply({}, args);
      }
    });
  };
  /**
   * Add event
   * @param name
   * @param callback
   * @constructor
   */
  EventHandler.prototype.add = function EventHandler_add(name, callback) {
    this.events.push({
      name: name,
      callback: callback
    });
  };

  app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/user',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.profile', {
        url: '/profile',
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl'
          }
        }
      })

      .state('app.account', {
        url: '/account',
        views: {
          'menuContent': {
            templateUrl: 'templates/accounts.html',
            controller: 'MyAccountsCtrl'
          }
        }
      })

      .state('app.link', {
        url: '/link-account',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/link-account.html',
            controller: 'AccountCtrlLink'
          }
        }
      })


      .state('app.stocks', {
        url: '/stocks',
        views: {
          'menuContent': {
            templateUrl: 'templates/stocks.html',
            controller: 'StocksCtrl'
          }
        }
      })
      .state('app.portofolio', {
        url: '/portofolio',
        views: {
          'menuContent': {
            templateUrl: 'templates/portofolio.html',
            controller: 'PortfolioCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/user/portofolio');
  });

}(window));
