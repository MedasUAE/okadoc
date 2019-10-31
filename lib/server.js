const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
// var plugins = require('restify').plugins;
const config = require('../config/config');
const logger = require('./logger');

// init server 
let restifyServer = {};

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: ['Authorization','Content-Type', 'accept-version'],
    exposeHeaders: ['API-Token-Expiry']
});

/*
init function definition
*/
restifyServer.init = function(){

    restifyServer.server = restify.createServer({
        name: 'okaDocAPI'
    });
    restifyServer.server.use(restify.plugins.bodyParser({ mapParams: false })); //for body data 
    restifyServer.server.use(restify.plugins.queryParser());//for query params 

    //version check
    restifyServer.server.pre((req,res, next)=>versionCheck(req,res,next))

    //preflight setting
    restifyServer.server.pre(cors.preflight);
    restifyServer.server.use(cors.actual);

    //Api Request Log
    restifyServer.server.pre((req,res, next)=>{
        // console.log(req.headers);
        const message =  "\x1b[34m" + "REQUEST:" + "\x1b[0m" +
            req.method  + " " +
            req.url + " " +
            req.getId();
        logger.info(message)
        return next()
    });
    //Api Response Log
    restifyServer.server.on('after',(req,res, route)=>{   
        const message = "\x1b[33m" + "RESPONSE" + "\x1b[0m" +
                "(\x1b[32m" + res.statusCode + "\x1b[0m): " + 
                req.method + " " +
                req.url + " " +
                req.getId();
        logger.info(message);
    });

    //restify server start
    restifyServer.server.listen(config.port,()=>{    
        require('./routes')(restifyServer.server, restify);
        logger.info("Server started on port: " + config.port);
    });
}


function versionCheck(req,res, next){
    const versions = require('../config/config').versions;

    let pieces = req.url.replace(/^\/+/, '').split('/');
    let version = pieces[0];
    
    version = version.replace(/v(\d{1})\.(\d{1})\.(\d{1})/, '$1.$2.$3');
    version = version.replace(/v(\d{1})\.(\d{1})/, '$1.$2.0');
    version = version.replace(/v(\d{1})/, '$1.0.0');

    if (versions.indexOf(version) > -1) {
        req.url = req.url.replace(pieces[0] + '/', '');
        req.headers = req.headers || [];
        // req.headers['accept-version'] = version;
    }
    else if(versions.indexOf(version) == -1)
        return res.send(400, {DisplayMessage:"VERSION NOT SUPPORT"});

    return next();
}
module.exports = restifyServer;
