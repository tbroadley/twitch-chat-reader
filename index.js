var client;
var messageQueue = [];
var timerId;
var onlySubscribers;

function addChangeListener(name, callback) {
  document.getElementsByName(name)[0].addEventListener('change', callback);
}

addChangeListener('channel', function(e) {
  if (client) client.disconnect();
  client = new irc.client({
    channels: [e.target.value]
  });

  messageQueue = [];

  client.on('message', function(channel, user, message) {
    if (onlySubscribers && !user.subscriber) return;

    messageQueue.unshift(message);
  });

  client.connect();
});

addChangeListener('subscriber', function(e) {
  onlySubscribers = e.target.checked;
});

function pollForMessages() {
  timerId = setInterval(function() {
    if (messageQueue.length > 0) {
      clearInterval(timerId);
      readMessage();
    }
  }, 1000);
}

function readMessage() {
  var message = messageQueue.pop();

  meSpeak.speak(message, undefined, function() {
    if (messageQueue.length > 0) {
      readMessage();
    } else {
      pollForMessages();
    }
  });
}

pollForMessages();
