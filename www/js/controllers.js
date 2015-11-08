var app = angular.module('starter.controllers', []);

app.controller('AppCtrl', function ($scope, $ionicModal, $timeout, transport, cookies) {
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.loginModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.signupModal = modal;
  });

  // Form data for the login modal
  $scope.loginData = {};
  $scope.isLoggedin = cookies.has(TOKEN_ID_KEY);

  $scope.$watch('isLoggedin', function (nVal) {
    if (!!nVal) {
      $scope.hideLogin();
    } else {
      $scope.login();
    }
  });
  /**
   * Hide login
   */
  $scope.hideLogin = function () {
    if (!$scope.loginModal) {
      return $timeout($scope.hideLogin, 50);
    }
    $scope.signupModal.hide();
    $scope.loginModal.hide();
  };
  // Open the login modal
  $scope.login = function () {
    if (!$scope.loginModal) {
      return $timeout($scope.login, 50);
    }
    $scope.signupModal.hide();
    $scope.loginModal.show();
  };

  // Open the signup modal
  $scope.signup = function ($event) {
    console.log("signup", $event);
    if (!$scope.signupModal) {
      return $timeout($scope.signup, 50);
    }
    $scope.loginModal.hide();
    $scope.signupModal.show();
  };

  $scope.createUser = function () {
    transport.createUser({
      username: $scope.loginData.username,
      password: $scope.loginData.password,
      email: $scope.loginData.email
    }).then(null, function(error) {
      console.log("error", error);
    }, function(data) {
      if (data.error) {
        $scope.loginData.error = true;
        $scope.loginData.message = data.message;
      } else {
        cookies.set(TOKEN_ID_KEY, data.token, parseInt(data.expires));
        $scope.isLoggedin = true;
      }
    });
  };

  // do fake login for now
  $scope.doLogout = function () {
    $scope.isLoggedin = false;
  };

  $scope.doLogin = function () {
    transport.logIn({
      username: $scope.loginData.username,
      password: $scope.loginData.password
    }).then(null, function(error) {
      console.log("error", error);
    }, function(data) {
      if (data.error) {
        $scope.loginData.error = true;
        $scope.loginData.message = data.message;
      } else {
        $scope.isLoggedin = true;
      }
    });
  };

});

app.controller('ProfileCtrl', function ($scope, transport, cookies, $ionicLoading) {
  $scope.userData = {};
  $scope.showSpinner = function () {
    $ionicLoading.show({
      template: '<ion-spinner icon="lines"></ion-spinner>'
    });
  };
  if ($scope.isLoggedin) {
    $scope.showSpinner();
    transport.getUser({
      access_token: cookies.get(TOKEN_ID_KEY)
    }).then(null, null, function(result) {
      $ionicLoading.hide();
      $scope.userData = result;
      console.log('get user', result, $scope);
    });

    $scope.change = function () {
      $scope.showSpinner();

      var data = angular.extend({
        access_token: cookies.get(TOKEN_ID_KEY)
      }, $scope.userData);
      console.log('update user data', data);
      transport.updateUser(data).then(null, null, function(result) {
        $ionicLoading.hide();
        $scope.userData = result;
        console.log('update user result', result, $scope);
      })
    }
  }
});

app.controller('AccountCtrl', function ($scope, transport, cookies, $ionicLoading) {
  $scope.accounts = [];
  $scope.showSpinner = function () {
    $ionicLoading.show({
      template: '<ion-spinner  icon="lines"></ion-spinner>'
    });
  };
  if ($scope.isLoggedin) {
    $scope.showSpinner();
    transport.getAccounts({
      access_token: cookies.get(TOKEN_ID_KEY)
    }).then(null, null, function(result) {
      $ionicLoading.hide();
      $scope.accounts = result;
      console.log('get getAccounts', result, $scope);
    });
  }
});


app.controller('AccountCtrlLink', function ($scope, transport, cookies, $location) {
  $scope.bankData = {};
  $scope.link = function() {
    transport.linkBank({
      access_token: cookies.get(TOKEN_ID_KEY),
      bankCode: $scope.bankData.bank_code,
      credentials: [
        $scope.bankData.username,
        $scope.bankData.password
      ],
      // save_pin: true,
      countryCode: "de"
    }).then(null, null, function(result) {
      //$location.url('/#/user/accounts');
      console.log('link account', result, $scope);
    });
  }
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
