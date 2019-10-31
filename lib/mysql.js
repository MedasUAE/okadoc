const mysql = require('mysql');
const log = require('./logger');
const dbConfig = require('../config/config').db;

const mysqlDB = {};

mysqlDB.init = function(){
    let pool = mysql.createPool(dbConfig)
    pool.getConnection((err, connection) => {
        if (err) {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                log.error('Database connection was closed. DB:' + dbConfig.database + ', host:' + dbConfig.host);
            }
            if (err.code === 'ER_CON_COUNT_ERROR') {
                log.error('Database has too many connections. DB:' + dbConfig.database + ', host:' + dbConfig.host)
            }
            if (err.code === 'ECONNREFUSED') {
                log.error('Database connection was refused. DB:' + dbConfig.database + ', host:' + dbConfig.host)
            }
        }
        if (connection) connection.release()
        return 
    });
    return pool;
}

mysqlDB.execQuery = function(query, next){
    if(!query) return next("No query");
    log.debug(query);
    _mysqldb.query(query, (err, result)=>{
        if(err) return next(err);
        return next(null,result);
    })
}

mysqlDB.execParamQuery = function(query, params){
    log.debug(`mysql.js, function: execParamQuery, 
                Query: ${query} 
                Params:  ${params}`);
    return new Promise((resolve,reject)=>{
        _mysqldb.query(query, params,(err, result)=>{
            if(err) return reject(err);
            return resolve(result);
        })
    })
}

module.exports = mysqlDB;