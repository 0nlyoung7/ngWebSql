'use strict';

(function() {

  angular.module('ngWebSql', []).

  factory('$db', function($q) {
    var self = this;
    self.db = null;
    var changeDBFlag = false;

    var DB_CONFIG = null;

    /**
     * @ngdoc function
     * @name init
     * @module messengerx.dao
     * @kind function
     *
     * @description Initialize local DB
     * WEB SQL을 사용하는 local DB를 초기화한다.
     */
    self.init = function( dbConfig ) {

      DB_CONFIG = dbConfig;

      try {
        if (!window.openDatabase) {
          alert( "your browser does not support web sql.");
        } else {
          var shortName = DB_CONFIG.name;
          var displayName = 'news database';
          var maxSize = 5 * 1024 * 1024; // 5M in bytes
          self.db = openDatabase(shortName, '', displayName, maxSize);
        }
      } catch(e) {
        // Error handling code goes here.
        console.error(e);
        alert( "your browser does not support web sql.");
        return;
      }

      // DB Version 이 update 되었다면, 기존 메시지를 모두 삭제하고 DB를 변경한다.
      if( self.db.version != DB_CONFIG.version ){

        self.db.changeVersion(self.db.version, DB_CONFIG.version, function (t) {
          changeDBFlag = true;
          self.createTable( changeDBFlag );
        });
      } else {
        self.createTable( changeDBFlag );
      }
    };

    /**
     * @ngdoc function
     * @name createTable
     * @module messengerx.dao
     * @kind function
     *
     * @description Initialize local DB
     * DB_CONFIG의 tables 정보를 이용하여 table을  생성한다.
     * @param {boolean} changeDBFlag 
     */
    self.createTable = function( changeDBFlag ){

      angular.forEach(DB_CONFIG.tables, function(table) {
        var columns = [];

        angular.forEach(table.columns, function(column) {
          columns.push(column.name + ' ' + column.type);
        });

        // version 이 다른 경우 table을 drop 하고 신규생성한다.
        if( changeDBFlag ){
          var query = 'DROP TABLE ' + table.name;
          self.query(query);
        }

        var query1;

        // SCAN을 위한 fts3를 이용한 virtual table 생성
        if( table.virtual ){
          query1 = 'CREATE VIRTUAL TABLE ' + table.name + ' USING fts3(' + columns.join(',') + ')';
        } else {
          query1 = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
        }
        self.query(query1);

        // TABLE info에 index정보가 있다면, index를 생성
        if( table.table_index != undefined ){
          for( var key in table.table_index ){
            var tableInx = table.table_index[key];
            var query2 = 'CREATE '+ tableInx.type +' INDEX IF NOT EXISTS ' + tableInx.name +' ON ' +table.name + ' (' + tableInx.columns.join(',') + ')';
            self.query(query2);
          }
        }
      });
    };

    /**
     * @ngdoc function
     * @name clearAll
     * @module messengerx.dao
     * @kind function
     *
     * @description Remove all data from local DB
     * 모든 DB에서 data를 삭제한다.
     * @param {string} userId 
     */
    self.clearAll = function( userId ){
      var querys = [];
      var conds = [];
      angular.forEach(DB_CONFIG.tables, function(table) {
        var columns = [];

        var query = 'DELETE FROM ' + table.name + ' WHERE owner_id = ? ';
        querys.push( query );
        conds.push( [userId] );
      });  
      self.queryAll(querys, conds);
    };

    /**
     * @ngdoc function
     * @name query
     * @module messengerx.dao
     * @kind function
     *
     * @description executeSql with query and binding
     * query 와 binding을 인자로 받아 query를 실행한다.
     * @param {string} query
     * @param {array} binding
     */
    self.query = function(query, binding) {
      binding = typeof binding !== 'undefined' ? binding : [];
      var deferred = $q.defer();
      self.db.transaction(function(transaction) {
        transaction.executeSql(query, binding, function(transaction, result) {
          deferred.resolve(result);
        }, function(transaction, error) {
          deferred.reject(error);
        });
      });

      return deferred.promise;
    };

    /**
     * @ngdoc function
     * @name queryAll
     * @module messengerx.dao
     * @kind function
     *
     * @description executeSql multi query in single transaction
     * query 와 binding의 array를 인자로 받아 여러개의 query를 하나의 transaction에서 실행한다.
     * @param {array} querys
     * @param {array} bindings
     */
    self.queryAll = function(querys, bindings) {
      var deferred = $q.defer();
      self.db.transaction(function(transaction) {
        var until = querys.length-1;
        for( var inx = 0 ; inx < until ; inx++ ){
          var query = querys[inx];
          var binding = bindings[inx];
          transaction.executeSql(query, binding);
        }

        transaction.executeSql(querys[until] , bindings[until], function(transaction, result) {
          deferred.resolve(result);
        }, function(transaction, error) {
          deferred.reject(error);
        });
      });

      return deferred.promise;
    };

    /**
     * @ngdoc function
     * @name fetchAll
     * @module messengerx.dao
     * @kind function
     *
     * @description convert SQL query result to JSON array
     * sql 실행 결과를 인자로 받아 array로 반환한다.
     * @param {object} resut - SQL query result 
     * @return {array} JSON array
     */
    self.fetchAll = function(result) {
      var output = [];

      for (var i = 0; i < result.rows.length; i++) {
        output.push(result.rows.item(i));
      }

      return output;
    };

    /**
     * @ngdoc function
     * @name fetch
     * @module messengerx.dao
     * @kind function
     *
     * @description executeSql multi query in single transaction
     * query 와 binding의 array를 인자로 받아 여러개의 query를 하나의 transaction에서 실행한다.
     * @param {object} resut - SQL query result 
     * @return {object} JSON object
     */
    self.fetch = function(result) {
      if( result.rows == undefined || result.rows.length == 0 ){
        return undefined;
      } else {
        return result.rows.item(0);
      }
    };

    return self;
  });


})();