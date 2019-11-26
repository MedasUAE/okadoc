const logger = require('../lib/logger');
const appointment = {};

appointment.create = async function({
    aptTime, //appoint_hr 
    remarks, // appoint_purpose
    aptDate, 
    patientName, // appoint_name
    mobile,  
    doctorId,
    mobileCode,
    patientEmail,
    clinicId,
    patientAge,
    sex,
    departmentId 

}) {
    /** 
     * ToDo: 
     * 1. Past Date Appointment Block
     * 2. Create only when OKADOC Users only
     * 3. Create Only when Active Branch
     * */
    logger.info("starting appointment.js, Handlers: appointment.create");

    //mandatory fields check
    if(!doctorId) throw new Error("'doctorId' is required for creating the appointment."); 
    if(!clinicId) throw new Error("'clinicId' is required for creating the appointment."); 
    if(!aptDate) throw new Error("'aptDate' is required for creating the appointment.");     
    if(!aptTime) throw new Error("'aptTime' is required for creating the appointment."); 
    if(!patientName) throw new Error("'patientName' is required for creating the appointment.");
    if(!departmentId) throw new Error("'departmentId' is required for creating the appointment.");
    
    //checking time from doctor master slot
    if(!(await checkCorrectSlot({aptDate,doctorId,clinicId,aptTime}))) throw new Error(`Please select available slot. '${aptTime}' is not in available slot.`);
    //checking time from booked slot 
    if(await checkBookedApt({aptDate,doctorId,clinicId,aptTime})) throw new Error(`'${aptTime}' already booked. Try another available slot.`);
    
    const execParamQuery = require('../lib/mysql').execParamQuery;
    const getAppointMin = require('./common').getAppointMin;
    const APOINT_TYPE = require('./constants').APOINT_TYPE;
    let aptParams = [
        APOINT_TYPE, 
        aptTime, // appoint_hr
        getAppointMin(aptTime), // appoint_min
        remarks, // appoint_purpose
        aptDate, 
        patientName, // appoint_name
        mobile,  
        doctorId,
        mobileCode,
        505, // enteredby default
        1, // slot_nos
        patientEmail,
        clinicId, // office_id
        patientAge,
        sex,
        departmentId 
    ];

    aptQuery = `INSERT INTO appointments
                (
                    appoint_type, 
                    appoint_hr, 
                    appoint_min, 
                    appoint_purpose, 
                    appoint_date, 
                    appoint_name, 
                    mobile,  
                    doctors_id,
                    entry_date,
                    mobile_code,
                    enteredby,
                    slot_nos,
                    patient_email,
                    office_id,
                    patient_age,
                    sex,
                    department_id           
                )
                VALUES
                (
                    ?,?,?,?,?,?,?,?,sysdate(),?,?,?,?,?,?,?,?     
                )`;
    try {
        const createApt = await execParamQuery(aptQuery, aptParams); 
        return { aptId: createApt.insertId }
    } catch (error) {
        logger.error("appointment.js, Handlers: appointment.create" + error.stack);
        throw new Error("Error while creating appointment."); 
    }
}

// function getAppointMin(aptTime, noOfSlots) {
//     const times = aptTime.split(":");
//     if(!times.length || times.length < 2) throw new Error("'aptTime' is not in correct format.(hh:mm)"); ; // if no length
//     let hrs = parseInt(times[0]), mins = parseInt(times[1]);
//     const SLOT_INTERVAL = 20;
//     const nextTime = mins + SLOT_INTERVAL*noOfSlots; // adding interval
    
    
//     hrs = (nextTime >= 60) ? hrs + 1 : hrs; //hr increase by one incase of mins grater than 60
//     hrs = (hrs == 24) ? 0 : hrs; // 24 hrs check
//     mins = (nextTime >= 60) ? (nextTime - 60) : nextTime; // if mins > 60
    
//     hrs = (hrs < 10) ? "0" + hrs.toString() : hrs.toString(); //padding to Zero
//     mins = (mins < 10) ? "0" + mins.toString() : mins.toString(); //padding Zero
//     return hrs + ":" + mins;
// }

// function getAppointMin(aptTime) {
//     const times = aptTime.split(":");
//     if(!times.length || times.length < 2) throw new Error("'aptTime' is not in correct format.(hh:mm)"); ; // if no length
//     let hrs = parseInt(times[0]), mins = parseInt(times[1]);
//     const SLOT_INTERVAL = 15;
//     // const nextTime = mins + SLOT_INTERVAL; // adding interval
//     const nextTime = mins + 40; // adding interval
    
//     hrs = (nextTime >= 60) ? hrs + 1 : hrs; //hr increase by one incase of mins grater than 60
//     hrs = (hrs == 24) ? 0 : hrs; // 24 hrs check
//     mins = (nextTime >= 60) ? (nextTime - 60) : nextTime; // if mins > 60
    
//     hrs = (hrs < 10) ? "0" + hrs.toString() : hrs.toString(); //padding to Zero
//     mins = (mins < 10) ? "0" + mins.toString() : mins.toString(); //padding Zero
//     return hrs + ":" + mins;
// }

// function checkInBetweenApt(bookedAptTime, noOfSlots, reqAptTime){
//     let found = false
//     if(!noOfSlots) noOfSlots = 0;
//     // loop for the slots to check if appointment time is in between the booked slot
//     while(noOfSlots>0){
//         noOfSlots--;
//         if(getAppointMin(bookedAptTime,noOfSlots) == reqAptTime){
//             found = true;
//             noOfSlots = 0;
//         }
//     }
//     return found;
// }

function checkDateFormat(aptDate) {
    const d = aptDate.toString();
    if(d.split("-").length != 3 || 
        d.split("-")[0].length != 4 || 
        d.split("-")[1].length != 2 || 
        d.split("-")[2].length != 2)
            throw new Error("'aptDate' is not in correct format.(YYYY-MM-DD)");
}

async function checkBookedApt({aptDate, doctorId, clinicId, aptTime}) {
    const getBookedSlots = require('./doctors').getBookedSlots;
    const checkInBetweenApt = require('./common').checkInBetweenApt;
    const bookedSlots = await getBookedSlots({aptDate, doctorId, clinicId});
    const foundSlot = bookedSlots.filter( slot => (slot.time == aptTime || checkInBetweenApt(slot.time, slot.slot, aptTime)))
    if(foundSlot.length) return true;
    else return false;
}

/**
 * to check if the slot time is matching with doctor slots available in master
 */

async function checkCorrectSlot({aptDate, doctorId, clinicId, aptTime}) {
    const getDoctorSlots = require('./doctors').getDoctorSlots;
    const doctorSlots = await getDoctorSlots({aptDate, doctorId, clinicId});
    const foundSlot = doctorSlots.filter(slot => (slot.time == aptTime));

    if(foundSlot.length) return true; //return 'true' if slot is correct and matches
    else return false; //return 'false' if slot is NOT correct and matches
}

appointment.reschedule = async function({aptDate, aptTime, aptId}) {
    /**
     * ToDo:
     * 1. Reschedule only those appoinement which are created by OKADOC
     */
    logger.info("starting appointment.js, Handlers: appointment.reschedule");
    //mandatory field check
    if(!aptId) throw new Error("'aptId' is required for updating the appointment."); 
    if(!aptTime) throw new Error("'aptTime' is required for updating the appointment.");
    if(!aptDate) throw new Error("'aptDate' is required for updating the appointment.");

    const getAppointMin = require('./common').getAppointMin;
    checkDateFormat(aptDate) //to check the format.
    let aptParams = [aptDate,aptTime, getAppointMin(aptTime), aptId];
    const execParamQuery = require('../lib/mysql').execParamQuery;

    const aptUpdate = `UPDATE appointments SET appoint_date = ?, appoint_hr = ?, appoint_min = ? WHERE id = ?;`;
    try {
        await execParamQuery(aptUpdate, aptParams);
        return {aptId: aptId};
    } catch (error) {
        logger.error("appointment.js, Handlers: appointment.reschedule" + error.stack);
        throw new Error("Error while reschedule appointment. aptId:" + aptId); 
    }
}

appointment.cancel = async function({aptId, cancelReason}) {
    /**
     * ToDo: 
     * 1. Cancel only those appointments which are created by OKADOC
     * 2. Cancel Reason 
     */
    logger.info("starrting appointment.js, Handlers: appointment.cancel");
    if(!aptId) throw new Error("'aptId' is required for calcelling the appointment."); 
    
    let aptParams = [aptId];
    const execParamQuery = require('../lib/mysql').execParamQuery;

    const aptUpdate = `UPDATE appointments SET cancel_status='Y' WHERE id = ?;`;
    try {
        await execParamQuery(aptUpdate, aptParams);
        return {aptId: aptId};
    } catch (error) {
        logger.error("appointment.js, Handlers: appointment.cancel" + error.stack);
        throw new Error("Error while cancelling appointment. aptId:" + aptId); 
    }
}

appointment.get= async function({appoint_date,doctors_id}) {
    if(!appoint_date) throw new Error("Please send appointment Date");
    if(!doctors_id) throw new Error("Please Send doctors Id");
    const execParamQuery = require('../lib/mysql').execParamQuery;
    let aptParams = [appoint_date,doctors_id];
    let query = `SELECT 
        id aptId,
        doctors_id doctorId,
        office_id clinicId,
        concat(trim(mobile_code), '',trim(mobile)) mobile,
        appoint_hr aptTime,
        DATE_FORMAT(appoint_date, "%Y-%m-%d") aptDate,
        appoint_name patientName,
        date_of_birth dob,
        patient_email email,
        sex gender
    FROM  
        appointments
    WHERE 
        appoint_date=? 
    AND
        doctors_id=?
    AND
        cancel_status='N'`;

    try {
        const aptResult = await execParamQuery(query,aptParams);
        console.log(aptResult);
        return {list:aptResult}
        
    } catch (error) {
        logger.error("appointment.js, Handlers: appointment.get" + error.stack);
        throw new Error("Error while getting appointment."); 
    }


}

module.exports = appointment;