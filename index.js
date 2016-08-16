var client;
var messageQueue = [];
var timerId;

var onlySubscribers;
var filterByWords;
var wordsToFilterBy;
var filterByUsers;
var usersToFilterBy;

var volume = 100;
var voice = 'm4';
var filterChatCommands = true;

function addChangeListener(name, callback) {
  document.getElementsByName(name)[0].addEventListener('change', callback);
}

function intersection(source, comparison) {
  return source.filter(function(element) {
    return comparison.indexOf(element) !== -1;
  });
}

function containsWord(string, filterBy) {
  var wordArray = string.split('').filter(function(character) {
    return character.match(new RegExp(/[\w\s]/));
  }).join('').toLowerCase().split(/\s/);

  return intersection(wordArray, filterBy).length > 0;
}

addChangeListener('channel', function(e) {
  if (client) client.disconnect();
  client = new irc.client({
    channels: [e.target.value]
  });

  messageQueue = [];

  client.on('message', function(channel, user, message) {
    if (onlySubscribers && !user.subscriber) return;
    if (filterByWords && !containsWord(message, wordsToFilterBy)) return;
    if (filterChatCommands && message.substring(0, 1) === '!') return;
    if (filterByUsers && usersToFilterBy.indexOf(user.username) !== -1) return;

    messageQueue.unshift(message);
  });

  client.connect();
});

addChangeListener('subscriber', function(e) {
  onlySubscribers = e.target.checked;
});

addChangeListener('word_enable', function(e) {
  filterByWords = e.target.checked;
});

addChangeListener('word_list', function(e) {
  wordsToFilterBy = e.target.value.trim().toLowerCase().split('\n');
});

addChangeListener('volume', function(e) {
  volume = e.target.value;
});

addChangeListener('voice', function(e) {
  voice = e.target.value;
});

addChangeListener('exclamation', function(e) {
  filterChatCommands = e.target.checked;
});

addChangeListener('user_enable', function(e) {
  filterByUsers = e.target.checked;
});

addChangeListener('user_list', function(e) {
  usersToFilterBy = e.target.value.trim().toLowerCase().split('\n');
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

  meSpeak.speak(message, {
    amplitude: volume,
    variant: voice
  }, function() {
    if (messageQueue.length > 0) {
      readMessage();
    } else {
      pollForMessages();
    }
  });
}

pollForMessages();
