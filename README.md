ngWebDb
====================

angularjs에서 Web DB를 쉽게 사용하기 위한 Module

Setup
---------------------
1. ngWebSql.js 를 다운로드

2. html 파일에 추가


```html
<!-- import ngWebSql -->
<script src="lib/ngWebSql.js"></script>
```

3. ngWebSql를 angular모듈에 등록( app.js )

```javascript 
angular.module('yourModule', ['ionic', '...', 'ngWebSql'])
```

4. $db를 시작 설정에 등록 
```javascript 
.run(function($ionicPlatform, $db) {
  .....
	.....
});
```

5. query를 이용한 작업 수행
Web DB의 query는 SQLite 기준으로 작성하면 된다.

Usage
---------------------

### init
#### `init(object config)`

1. JSON 형태로 정의된 Table List 를 기준으로 Table을 생성한다.
 - 기존 DB 가 없을 경우 -> Table 생성
 - 기존 DB와 현재 DB의 version이 같을 경우 -> Table 생성X
 - 기존 DB와 현재 DB의 version이 다를 경우 -> 기존 DB Drop 후 신규 스키마로 DB 생성
   -> DB 스키마를 변경하고자 할 경우, DB 설정의 `version`을 변경하면 된다.

2. `table_index` 를 이용하연 Table Index를 생성할 수 있다.
 - type : INDEX 타입. 일반인덱스를 생성할지, UNIQUE 인덱스를 생성할지 정함
 - name : INDEX 이름
 - columns : INDEX를 사용할 컬럼


![alt tag](https://raw.githubusercontent.com/0nlyoung7/ngWebSql/master/www/img/db.png)

#### Example:
```javascript

    var db_config = {
      name: 'sample.db',
      version: '0.0.2',
      tables: [
        {
          name: 'TB_MESSAGE',
          columns: [
            {name: 'sender_id',  type: 'text'},
            {name: 'sender_name',  type: 'text'},
            {name: 'sender_image',  type: 'text'},
            {name: 'message',    type: 'text'},
            {name: 'time', type: 'integer'}
          ],
          table_index : [{ type : '', name : 'IDX_TB_MESSAGE', columns : [ 'owner_id' ] }]
        },
        {
          name: 'TB_PANEL',
          columns: [
            {name: 'pid',   type: 'text'},
            {name: 'title',  type: 'text'},
            {name: 'message',    type: 'text'},
            {name: 'style', type: 'text DEFAULT "stable" '},
            {name: 'time', type: 'integer' }
          ],
          table_index : [{ type : 'UNIQUE', name : 'IDX_U_TB_PANEL', columns : [ 'id', 'owner_id' ] }, { type : '', name : 'IDX_TB_PANEL', columns : [ 'owner_id' ] }]
        }
      ]
    };

    $db.init( db_config );
```

### query
#### `query( string query, array binding )`

query 와 binding을 인자로 받아 query를 실행한다.

1. SELECT

```javascript
var query = "SELECT title, message, style FROM TB_PANEL ORDER BY pid ASC; ";
$db.query( query ).then(function(result) {
  callback( $db.fetchAll(result) );
});

```

2. INSERT, UPDATE, DELETE
```javascript
var query = "INSERT INTO TB_PANEL( pid, title, message, style, time ) VALUES ( ?, ?, ?, ?, ? );" ;
$db.query( query ).then(function(result) {
  callback( result );
});

```

### fetchAll
#### `fetch( SQLResultSet result )`

SQL `SELECT`을 수행한 결과 수행된 결과를 받아 JSONArray 형태로 변환하여 return 한다.

```javascript
$db.fetchAll(result)
```

### queryAll
#### `queryAll( array querys, array conds)`

다수의 query를 한번에 호출할 때 사용한다. 내부에서 하나의 transaction을 사용하게 되어 있다.

```javascript
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
```

Tips
---------------------

1. WEB DB를 완전히 삭제하기 위해서는 브라우져의 캐쉬와 데이터를 삭제한다.

2. 다른 사용자로 접속할 경우, 조회 범위를 제한하기 위한 컬럼을 사용한다.( owner_id )

3. 중요한 Data일 경우 암호화를 고려해야한다.
