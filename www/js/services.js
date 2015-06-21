angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('Panels', function( $db ) {

  return {
    all: function( callback ) {

      var query = "SELECT title, message, style FROM TB_PANEL ";
      query += "ORDER BY pid ASC ;";

      $db.query( query ).then(function(result) {
        callback( $db.fetchAll(result) );
      });
    },
    remove: function( callback ) {

      var query = "DELETE FROM TB_PANEL ";

      $db.query( query ).then(function(result) {
        callback();
      });
    },
    addAll: function(jsonArray, callback) {

      var querys = [];
      var conds = [];

      for( var inx = 0 ; inx < jsonArray.length ; inx++ ){
        var jsonObj = jsonArray[inx];

        var query = "INSERT OR REPLACE INTO TB_PANEL( pid, title, message, style, time ) ";
        query +=" VALUES ( ?, ?, ?, ?, ? )";

        var currentTimestamp = Date.now();
        var cond = [
          jsonObj.pid,
          jsonObj.title,
          jsonObj.message,
          jsonObj.style,
          currentTimestamp
        ];

        querys.push( query );
        conds.push( cond );
      }

      $db.queryAll(querys, conds).then(function(result) {
        callback( result );
      });
    },
    generateData : function( callback ){
      var datas = [
        {'pid' : '1', 'title' : 'Title1', 'message':'calm', 'style':'calm'},
        {'pid' : '2', 'title' : 'Title2', 'message':'positive', 'style':'positive'},
        {'pid' : '3', 'title' : 'Title3', 'message':'assertive', 'style':'assertive'},
        {'pid' : '4', 'title' : 'Title4', 'message':'balanced', 'style':'balanced'},
        {'pid' : '5', 'title' : 'Title5', 'message':'royal', 'style':'royal'}
      ];

      this.addAll( datas, function() {
        callback();
      } );
    }
  };
})


