var client;
var messageQueue = [];
var timerId;

document.getElementsByName('channel')[0].addEventListener('change', function(e) {
  if (client) client.disconnect();
  client = new irc.client({
    channels: [e.target.value]
  });

  messageQueue = [];

  client.on('message', function(channel, user, message) {
    messageQueue.unshift(message);
  });

  client.connect();
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
