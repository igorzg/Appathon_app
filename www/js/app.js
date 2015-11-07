// Ionic Starter App

var app = angular.module('starter', ['ionic', 'starter.controllers']);

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
          templateUrl: 'templates/profile.html'
        }
      }
    })

    .state('app.redeemcode', {
      url: '/redeemcode',
      views: {
        'menuContent': {
          templateUrl: 'templates/redeemcode.html'
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
