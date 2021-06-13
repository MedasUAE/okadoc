const logger = require('../lib/logger');
const common = {};

common.checkInBetweenApt = function(bookedAptTime, noOfSlots, reqAptTime, slot_interval){
    let args = [...arguments];
    //logger.debug("Starting common.js, Handler: checkInBetweenApt with params: bookedAptTime, noOfSlots, reqAptTime, slot_interval: " + args.join(','))
    let found = false;
    console.log(noOfSlots + "----------");
    if(!noOfSlots) noOfSlots = 0;
    // loop for the slots to check if appointment time is in between the booked slot
    while(noOfSlots>0){
        noOfSlots--;
       /*if(common.getAppointMin(bookedAptTime, noOfSlots, slot_interval) == reqAptTime)
        {
            found = true;
            noOfSlots = 0;
        }*/
        if(bookedAptTime == reqAptTime)
        {
            found = true;
            noOfSlots = 0;
        }
        else if(common.slot_check(bookedAptTime, noOfSlots, slot_interval) == reqAptTime)
        {
            found = true;
            noOfSlots = 0;
        }
        else
        {
            found= false;
        }
        
        
   // logger.debug("checker=="+common.slot_check(bookedAptTime, noOfSlots, slot_interval)+"--"+reqAptTime);
            //noOfSlots = 0;
        
    }
   // logger.debug("found out flag="+found);
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


common.slot_check=function(booktime,nslots,slot_interval) 
{
   let convert_slot=end_time='';
   convert_slot=slot_convert(nslots,slot_interval);
   end_time=add_with_slots(convert_slot,booktime);
   return end_time;

}

function slot_convert(nslots,slot_interval) 
{
    let slot_time='';
    slot_time=slot_interval*nslots;
    slot_time=String(parseInt(slot_time/60)+":"+parseInt(slot_time%60));
    return slot_time;
}


function add_with_slots(slot_time,booktime)
{
    let slot_end='';
    let slot_min=slot_hr=0;
    slot_time=String(slot_time).split(":");
    booktime=String(booktime).split(":");
    slot_min=parseInt(slot_time[1])+parseInt(booktime[1]);
    slot_hr=parseInt(slot_time[0])+parseInt(booktime[0]);
    if(slot_min>59)
    {
        if(slot_min==60){slot_min=String("00");slot_hr+=1;}
        else
        {
            slot_min-=60;
            slot_hr+=1;
        }
         slot_end=String(slot_hr)+":"+String(slot_min);
    }
    else
    {
        slot_end=String(slot_hr)+":"+String(slot_min);
    }
    return slot_end;

}

module.exports = common;