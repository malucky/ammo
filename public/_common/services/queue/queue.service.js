(function() {
  'use strict';

  angular
    .module('ammo.services.queue', [])
    .factory('queueService', queueService);

  function queueService() {
    var queue = [],
        service;

    service = {
      hasSongs: hasSongs,
      nextSong: nextSong
    };

    return service;

    ////////////
    /**
     * @return {boolean}
     */
    function hasSongs() {
      return queue.length > 0
    }

    function nextSong() {
      return queue.shift();
    }
  }
})();
