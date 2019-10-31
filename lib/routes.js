const logger = require('../lib/logger');


module.exports = function (server) {
    //master request api
    server.get('/doctors', getDoctorListHandler);
    server.get('/doctorslots', getAvailableSlotsHandler);  
    
    //appointment APIs
    server.post('/appointment', createAppointmentHandler);

} 

async function getAvailableSlotsHandler(req,res,next) {
    try {
        const getDoctorAvbleSlot = require('../businessLogic/doctors').getDoctorAvbleSlot;
        
        //calling doctor available slot API
        const response = await getDoctorAvbleSlot(req.query);
        res.send(200, {data: response});
        
         //go to after handler
         return next();
    } catch (error) {
        logger.error("route.js, Handlers: get_Available_Slots_Handler " + error.stack);
        //error when parsing data
         res.send(400, {
            error: error.message
        });  //ToDo Error Code
        return next();
    }
}

async function getDoctorListHandler(req, res, next) {
    try {
        const getDoctorList = require('../businessLogic/doctors').getDoctorList;
        //calling openjet API
        const response = await getDoctorList(req.body);
        res.send(200, {data: response});
        
         //go to after handler
         return next();
    } catch (error) {
        // logger.error("route.js, Handlers: getDoctorListHandler " + error.stack);
        //error when parsing data
        res.send(400, {
            message: error.message
        }); //ToDo Error Code
        return next();
    }
}

async function createAppointmentHandler(req, res, next) {
    try {
        const create = require('../businessLogic/appointment').create;
        //calling openjet API
        const response = await create(req.body);
        res.send(200, {data: response});
        
         //go to after handler
         return next();
    } catch (error) {
        // logger.error("route.js, Handlers: getDoctorListHandler " + error.stack);
        //error when parsing data
        res.send(400, {
            message: error.message
        }); //ToDo Error Code
        return next();
    }
}