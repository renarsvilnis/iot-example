/*global jQuery */
/*!
* FitText.js 1.2
*
* Copyright 2011, Dave Rupert http://daverupert.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: Thu May 05 14:23:00 2011 -0600
*/

(function( $ ){

  $.fn.fitText = function( kompressor, options ) {

    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){

      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on('resize.fittext orientationchange.fittext', resizer);

    });

  };

})( jQuery );


$(function(){

  $('h1').fitText(1, {maxFontSize: '64px'});
  $('h2').fitText(1, {maxFontSize: '56px'});
  $('p').fitText(1, {maxFontSize: '32px'});


  var socket = io.connect('http://188.226.253.132/'),
      socketID = null,
      socketActive = false,
      servoStatusEl = $('.servo-status');

  var pot = {
    el: $('.pot'),
    canvas: null,
    ctx: null,
    prevValue: false,

    flag: {
      init: false,
    },

    init: function () {
      pot.canvas = document.getElementById('pot-bar');
      pot.ctx = pot.canvas.getContext('2d');
      pot.resize();
      pot.flag.init = true;
    },

    resize: function () {
      pot.canvas.width = pot.el.width();
      pot.canvas.height = pot.el.height();
      pot.draw(pot.prevValue);
    },

    draw: function (value) {
      if(value ===  false || value < 0 || value > 100)
        return;

      // console.log(value);

      pot.ctx.clearRect(0, 0, pot.canvas.width, pot.canvas.height);
      pot.ctx.fillStyle = "#333333";
      // var width = parseInt((pot.canvas.width / 100) * value, 10);
      var width = (pot.canvas.width / 100) * value;
      pot.ctx.fillRect(0, 0, width, pot.canvas.height);
    }
    
  };

  pot.init();

  socket.on('initID', function (data) {
    socketID =  parseInt(data.id, 10);
    console.log('Socket.io id: ', socketID);
    socketActive = true;

    if(!servoStatusEl.hasClass('disabled'))
      servoStatusEl.html('Interacting');
  });

  socket.on('activeRemove', function (data) {
    console.log('Socket.io your id is not active anymore');
    socketActive = false;

    if(!servoStatusEl.hasClass('disabled'))
      servoStatusEl.html('Not-interacting. Someone else is controlling it right now.');
  });

  socket.on('pot', function (data) {

    var value = parseInt(data.value, 10);

    if(pot.prevValue == value || !pot.flag.init || value < 0 || value > 100)
      return;

    pot.prevValue = value;
    pot.draw(value);
  });


  $(window).on('resize', function() {
    console.log('resize');
    pot.resize();
  });


  init();
  var count = 0;
  var prevTiltFB = 0;

  function init() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', function(eventData) {

        if(!socketActive)
          return;

        // gamma is the left-to-right tilt in degrees, where right is positive
        // var tiltLR = eventData.gamma;
        
        // beta is the front-to-back tilt in degrees, where front is positive
        var tiltFB = eventData.beta;
        
        // alpha is the compass direction the device is facing in degrees
        // var dir = eventData.alpha;
        // 
        deviceOrientationHandler(tiltFB);
        }, false);
    } else {
      servoStatusEl.html('Your device does not support deviceOrientation.').addClass('disabled');
    }
  }

 
  function deviceOrientationHandler(tiltFB) {
    tiltFB = Math.round(tiltFB);

    if(tiltFB !== prevTiltFB) {
      if(tiltFB < -90) {
        tiltFB = -90;
      } else if(tiltFB > 90) {
        tiltFB = 90;
      }

      socket.emit('servo', {id: socketID, tilt: tiltFB});
      prevTiltFB = tiltFB;
    }
  }

});