var app = angular.module('starter.controllers', []);

app.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  // Form data for the login modal
  $scope.loginData = {};
  $scope.isLoggedin = false;

  $scope.$watch('isLoggedin', function (nVal) {
    if (!!nVal) {
      $scope.hideLogin();
    } else {
      $scope.login();
    }
  });
  /**
   * Login
   * @returns {*}
   */
  $scope.hideLogin = function () {
    if (!$scope.modal) {
      return $timeout($scope.hideLogin, 50);
    }
    $scope.modal.hide();
  };
  // Open the login modal
  $scope.login = function () {
    if (!$scope.modal) {
      return $timeout($scope.login, 50);
    }
    $scope.modal.show();
  };

  // do fake login for now
  $scope.doLogout = function () {
    $scope.isLoggedin = false;
  };

  $scope.doLogin = function () {
    $scope.isLoggedin = true;
  };

});

app.controller('StocksCtrl', function ($scope, $http) {
  $http.get('js/stocks.json').then(function (response) {
    $scope.stocks = response.data;
  });
});

app.controller('PortfolioCtrl', function ($scope) {
  $scope.stocks = [
    {
      "title": "Adidas NA",
      "value": {
        "current": 87.71,
        "last day": 88.51,
        "change": -0.91,
        "highest": 89.57,
        "lowest": 53.70
      },
      "id": 1
    },
    {
      "title": "Allianz SE vNA",
      "value": {
        "current": 157.11,
        "last day": 159.89,
        "change": -1.77,
        "highest": 170.34,
        "lowest": 129.58
      },
      "id": 2
    },
    {
      "title": "BASF NA",
      "value": {
        "current": 77.44,
        "last day": 75.80,
        "change": 2.12,
        "highest": 97.20,
        "lowest": 64.40
      },
      "id": 3
    },
    {
      "title": "Bayer NA",
      "value": {
        "current": 123.48,
        "last day": 122.75,
        "change": 0.59,
        "highest": 146.26,
        "lowest": 106.50
      },
      "id": 4
    }
  ];
});
