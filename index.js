const server = require('./lib/server');
const mysql = require('./lib/mysql');

//init
const app = {}

//init defination
app.init = function(){
    _mysqldb = mysql.init();
    server.init();
}

app.init();