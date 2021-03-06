(function() {
  'use strict';

  angular
    .module('ammo.services.providers', [
      'ammo.services.providers.youtube'
    ])
    .factory('providersService', providersService);

    function providersService($log, youtubeService) {
      var providers,
          service;

      providers = {
        youtube: youtubeService
      };

      service = {
        get: get
      };

      return service;

      ////////////
      /**
       * @name get
       * @param {String} providerName name of the provider to return
       */
      function get(providerName) {
        if (!providers[providerName]) {
          $log.error('Unknown provider ' + JSON.stringify(providerName))
        }
        return providers[providerName];
      }
    }
})();
