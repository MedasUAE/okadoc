const logger = require('../lib/logger');


module.exports = function (server) {
    //master request api
    server.get('/doctors', getDoctorListHandler);
    server.get('/doctorslots', getAvailableSlotsHandler);  
    
    //create appointment APIs
    server.post('/appointment', createAppointmentHandler);

    //update appointment APIs
    server.put('/appointment', updateAppointmentHandler);

    //cancel appointment APIs
    server.del('/appointment', cancelAppointmentHandler);

} 

async function getAvailableSlotsHandler(req,res,next) {
    try {
        const getDoctorAvbleSlot = require('../businessLogic/doctors').getDoctorAvbleSlot;
        
        //calling doctor available slot API
        const response = await getDoctorAvbleSlot(req.query);
        responseSend(req, res, 200, response, undefined);
        
        //go to after handler
        return next();
    } catch (error) {
        //error when parsing data
        logger.error("route.js, Handlers: get_Available_Slots_Handler " + error.stack);
        responseSend(req, res, 400, undefined, error.message);  //ToDo Error Code
        return next();
    }
}

async function getDoctorListHandler(req, res, next) {
    try {
        const getDoctorList = require('../businessLogic/doctors').getDoctorList;
        //calling openjet API
        const response = await getDoctorList(req.body);
        responseSend(req, res, 200, response, undefined);
        
         //go to after handler
         return next();
    } catch (error) {
        //error when parsing data
        logger.error("route.js, Handlers: getDoctorListHandler " + error.stack);
        responseSend(req, res, 400, undefined, error.message);  //ToDo Error Code//ToDo Error Code
        return next();
    }
}

async function createAppointmentHandler(req, res, next) {
    try {
        const create = require('../businessLogic/appointment').create;
        //calling openjet API
        const response = await create(req.body);
        responseSend(req, res, 200, response, undefined);
        
         //go to after handler
         return next();
    } catch (error) {
        //error when parsing data
        logger.error("route.js, Handlers: getDoctorListHandler " + error.stack);
        responseSend(req, res, 400, undefined, error.message);  //ToDo Error Code
        return next();
    }
}

async function updateAppointmentHandler(req, res, next) {
    try {
        const reschedule = require('../businessLogic/appointment').reschedule;
        //calling openjet API
        const response = await reschedule(req.body);
        responseSend(req, res, 200, response, undefined);
        
         //go to after handler
         return next();
    } catch (error) {
        //error when parsing data
        logger.error("route.js, Handlers: getDoctorListHandler " + error.stack);
        responseSend(req, res, 400, undefined, error.message);  //ToDo Error Code
        return next();
    }
}

async function cancelAppointmentHandler(req, res, next) {
    try {
        const reschedule = require('../businessLogic/appointment').cancel;
        //calling openjet API
        const response = await reschedule(req.body);
        responseSend(req, res, 200, response, undefined);
        
         //go to after handler
         return next();
    } catch (error) {
        //error when parsing data
        logger.error("route.js, Handlers: getDoctorListHandler " + error.stack);
        responseSend(req, res, 400, undefined, error.message); 
        return next();
    }
}

function responseSend(req, res, code, data, error) {
    const response = {
        data,
        requestId: req.getId(),
        code:code,
        error
    }
    res.send(code, response);
}