const logger = require('../lib/logger');
const common = {};

common.checkInBetweenApt = function(bookedAptTime, noOfSlots, reqAptTime, slot_interval){
    let args = [...arguments];
    logger.debug("Starting common.js, Handler: checkInBetweenApt with params: bookedAptTime, noOfSlots, reqAptTime, slot_interval: " + args.join(','))
    let found = false
    console.log(noOfSlots + "----------");
    if(!noOfSlots) noOfSlots = 0;
    // loop for the slots to check if appointment time is in between the booked slot
    while(noOfSlots>0){
        noOfSlots--;
        if(common.getAppointMin(bookedAptTime, noOfSlots, slot_interval) == reqAptTime){
            found = true;
            noOfSlots = 0;
        }
    }
    return found;
}

common.getAppointMin = function(aptTime, noOfSlots, SLOT_INTERVAL) {
    logger.debug("Starting common.js, Handler: getAppointMin with params: aptTime: " + aptTime + ", noOfSlots: " + noOfSlots +", SLOT_INTERVAL: " +  SLOT_INTERVAL)
    const times = aptTime.split(":");
    logger.debug("times: " + times)
    if(!times.length || times.length < 2) throw new Error("'aptTime' is not in correct format.(hh:mm)"); ; // if no length
    let hrs = parseInt(times[0]), mins = parseInt(times[1]);
    logger.debug("hrs: " + hrs + "mins: " + mins)
    if(!SLOT_INTERVAL) SLOT_INTERVAL = 15;
    
    const nextTime = mins + SLOT_INTERVAL*noOfSlots; // adding interval
    logger.debug("adding interval mins + SLOT_INTERVAL*noOfSlots: " + nextTime)
    
    hrs = (nextTime >= 60) ? hrs + 1 : hrs; //hr increase by one incase of mins grater than 60
    hrs = (hrs == 24) ? 0 : hrs; // 24 hrs check
    mins = (nextTime >= 60) ? (nextTime - 60) : nextTime; // if mins > 60
    
    hrs = (hrs < 10) ? "0" + hrs.toString() : hrs.toString(); //padding to Zero
    mins = (mins < 10) ? "0" + mins.toString() : mins.toString(); //padding Zero
    logger.debug("returning - hrs : mins;" + hrs + ":" + mins)
    return hrs + ":" + mins;
}

module.exports = common;