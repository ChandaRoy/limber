var ScopedSocket = function(socket, $rootScope) {
  this.socket = socket;
  this.$rootScope = $rootScope;
  this.listeners = [];
};

ScopedSocket.prototype.removeAllListeners = function() {
  // Remove each of the stored listeners
  for (var i = 0; i < this.listeners.length; i++) {
    var details = this.listeners[i];
      this.socket.removeListener(details.event, details.fn);
      // console.log("removed ", details.event);
  };
};

ScopedSocket.prototype.on = function(event, callback) {
  var socket = this.socket;
  var $rootScope = this.$rootScope;

  var wrappedCallback = function() {
    var args = arguments;
    $rootScope.$apply(function() {
      callback.apply(socket, args);
    });
  };

  // Store the event name and callback so we can remove it later
  this.listeners.push({
    event: event,
    fn: wrappedCallback
  });

  socket.on(event, wrappedCallback);
};

ScopedSocket.prototype.emit = function(event, data, callback) {
  var socket = this.socket;
  var $rootScope = this.$rootScope;

  socket.emit(event, data, function() {
    var args = arguments;
    $rootScope.$apply(function() {
      if (callback) {
        callback.apply(socket, args);
      }
    });
  });
};

fragileApp.factory('Socket', function($rootScope) {
  var socket = io.connect();

  return function(scope) {
    var scopedSocket = new ScopedSocket(socket, $rootScope);
    if(scope)
    scope.$on('$destroy', function() {
      scopedSocket.removeAllListeners();
    });
    return scopedSocket;
  };

});
