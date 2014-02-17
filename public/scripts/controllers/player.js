angular.module('ammoApp')

  /*
    ========== PlayerController ==========
    This controller has all the logic of the player, needs QueueService
    as a dependencie.

    Functions:
      - $scope.play(songOrIndex, queueOrSearch)
      - $scope.stopAll();
      - $scope.togglePause();
      - $scope.playNext();
      - $scope.playPrev();
      - $scope.detectYoutubeAd();
  */
  .controller('PlayerController', function($scope, $timeout, QueueService) {
    $scope.playing = false;
    $scope.currentSong = null;
    $scope.currentSongIndex = null;
    $scope.buffering = false;
    $scope.timer = 0;
    $scope.ready = false;
    $scope.songs = QueueService.queue.songs;

    /* 
      ========== $scope.play ==========
      This functino is in charge of playing songs from all the services.

      Params: 
        songsOrIndex
          - This variable depends of who cals the $scope.play() function, if
            the queue controller calls it then it's the index of the queue array
            in the QueueService that contains all the queue songs. $scope.play() 
            will play the song in that specific index of the queue array. 
            
            If the function is called from the search controller then it's a song 
            object and this function will play it.

        queueOrSearch
          - This variable defines who called this function, 'q' refers for queue
            and 's' for search.
    */
    $scope.play = function(songOrIndex, queueOrSearch) { //  = 'q' or 's'
      $scope.buffering = true;
      var song;
      $scope.ready = false;

      if(queueOrSearch === 'q') {
        if(songOrIndex !== null) {
          song = QueueService.queue.songs[songOrIndex];
          $scope.currentSongIndex = songOrIndex;
        }
        else {
          $scope.currentSong = null;
          $scope.playing = false;
          return;
        }
      } 
      else if(queueOrSearch === 's') {
        song = songOrIndex;
      }
      else {
        return;
      }
      $scope.stopAll();
      $scope.currentSong = song;
      $scope.playing = true;

      if(song.service === "youtube") {
        youtube.loadVideoById(song.serviceId, 0, "large");
        youtube.playVideo();
      } 
      else if (song.service === "soundcloud") {
        scPlay(song.serviceId);
      }
      else if (song.service === "deezer") {
        DZ.player.playTracks([song.serviceId]);
      }

      $scope.stopTimer();
      $scope.startTimer();
    };

    /* 
      ========== $scope.stopAll ==========
      This function is in charge to stop all the services from playing (if any)
    */
    $scope.stopAll = function() {
      $scope.playing = false;
      youtube.pauseVideo();
      scPlayer.pause();
      DZ.player.pause();
    };

    /* 
      ========== $scope.togglePause ==========
      Toggles play/pause
    */
    $scope.togglePause = function() {
      // If queue is not empty.
      if($scope.currentSong !== null) {
        if($scope.playing) {
          $scope.stopAll();
        }
        else {
          $scope.playing = true;

          if($scope.currentSong.service === 'youtube') {
            youtube.playVideo();
          }
          else if($scope.currentSong.service === 'soundcloud') {
            scPlayer.play();
          }
          else if($scope.currentSong.service === 'deezer') {
            DZ.player.play();
          }
        }
      }
    };

    // playNext and playPrev can be refactored to one function
    $scope.playNext = function() {
      QueueService.setCurrentSongIndex($scope.currentSongIndex + 1)
        .then(function(index) {
          $scope.play(index, "q");
        })
        .catch(function(err) {
          console.log("Error: ", err);
        });
    };

    $scope.playPrev = function() {
      QueueService.setCurrentSongIndex($scope.currentSongIndex - 1)
        .then(function(index) {
          $scope.play(index, "q");
        })
        .catch(function(err) {
          console.log("Error: ", err);
        });
    };


    /* 
      ========== $scope.detectYoutubeAd ==========
      This function detects if a YoutubeAd is playing, is a callback of YouTube player state
      PAUSE which is the state of the player when there is an ad, but also is the sate of 
      a normal pause. So if this functino is called and $scope.playing = true then it's an ad
    */
    $scope.detectYoutubeAd = function() {
      if($scope.playing) {
        // There is a YouTube ad
      }
    };

    $scope.fixTime = function(seconds) {
      if(!seconds) { 
        return "0:00";
      }
      var mins = (seconds / 60) | 0;
      var secs = seconds % 60;

      if(secs < 10) {
        secs = "0" + secs;
      }
      return mins + ":" + secs;
    };

    // ---------- Progress Bar Logic ----------
    // ========================================
    $scope.onTimeout = function() {
      if($scope.playing && $scope.ready && !$scope.buffering && $scope.timer < $scope.currentSong.duration) {
        $scope.timer++;
      }
      timerTimeout = $timeout($scope.onTimeout, 1000);
    };

    var timerTimeout;

    $scope.startTimer = function() {
      $timeout($scope.onTimeout, 1000);
    };

    $scope.stopTimer = function() {
      $timeout.cancel(timerTimeout);
      $scope.timer = 0;
    };

    /*
      ========== playFromSidebar ==========
      -Triggered from an ng-click on a song in the queue. Takes an index, sets it as the current song index, 
      then passes it along to the play function.

      Params:
        param1: index (number)

      Return: No return
    */

    $scope.playFromSidebar = function(index){
      QueueService.setCurrentSongIndex(index)
        .then(function(ind) {
          $scope.play(ind, "q");
        })
        .catch(function(err) {
          console.log("Error: ", err);
        });
    };
});