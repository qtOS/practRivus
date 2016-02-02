jQuery(function($){
  var socket = io.connect();
  var $nameForm = $('#set-name-form');
  var $nameError = $('#login-fail');
  var $userBox = $('#username');
  var $users = $('#users');
  var $messageForm = $('#send-message');
  var $messageBox = $('#message');
  var $chat = $('#chat');
  var $chatwrap = $('#chat-wrapper');
  //need to add more bgs.
  // var bgArr = ['one.jpg', 'two.jpg', 'three.jpg'];
  // var bg = bgArr[Math.floor(Math.random() * bgArr.length)];
  // var path = '/../imgs/';
  // var imageUrl = path + bg;

  //$('#content-wrapper').css('background-image', 'url(' + imageUrl +')');

  //user form submission
  $nameForm.submit(function(e){
    e.preventDefault();
    //calls to the socket to emit the new user into the chat field
    socket.emit('new user', $userBox.val(), function(data){
      if(data){
        //do more here
        $('#username-login-form').hide(); // change this
        $('#content-wrapper').show(); //change this
      } else{
        $nameError.html('Please enter a valid username! That one may be taken or invalid.  Try again.');
      }
    });
    $userBox.val('');
  });

	String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
	}
  //users list
  socket.on('usernames', function(data){
    var user = '';
    //loops through users data and displays them
    for(var i=0; i < data.length; i++){
      data[i] = data[i].capitalizeFirstLetter();
      user += '<span class="usersList">'+data[i] + '</span>'
      console.log(data[i]+ ' has logged in.');
    //  console.log(user + ' - '+ i);
    }
    $users.html(user);

  });
  //sends error if whisper cannot be made
  $messageForm.submit(function(e){
    e.preventDefault();
    socket.emit('send message', $messageBox.val(), function(data){
      // $chat.append('<span class="error">' + data + "</span>");
      var height = $chat[0].scrollHeight;
      $chat.scrollTop(height);
    });
    $messageBox.val('');
  });




  //loops through old messages
  socket.on('load old msgs', function(docs){
    for(var i=docs.length-1; i >= 0; i--){
      displayMsg(docs[i]);
    }
  });

  socket.on('new message', function(data){
    displayMsg(data);
  });

  //display message to everyone
  function displayMsg(data){
    // if(data.nick == socket.nickname){
    //
    // }
    $chat.append('<p class="msg"><b>' + data.nick + ': </b>' + data.msg + "</p>");
    // console.log($chat[0].children);
    // for(var i = 0; i < $chat.children; i++ ){
    //   console.log($chat[0].children);
    // }
    var height = $chat[0].scrollHeight;
    $chat.scrollTop(height);
  }

  //whisper users
  socket.on('whisper', function(data){
    $chat.append('<span class="whisper"><b>' + data.nick + ': </b>' + data.msg + "</span>");
    var height = $chat[0].scrollHeight;
    $chat.scrollTop(height);
  });
});
