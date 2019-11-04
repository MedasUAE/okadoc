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
     * 2. Multiple Appointment of same Time Block
     * 3. Create only when OKADOC Users only
     * 4. Create Only when Active Branch
     * */
    logger.info("starting appointment.js, Handlers: appointment.create");

    //mandatory fields check
    if(!doctorId) throw new Error("'doctorId' is required for creating the appointment."); 
    if(!clinicId) throw new Error("'clinicId' is required for creating the appointment."); 
    if(!aptDate) throw new Error("'aptDate' is required for creating the appointment.");     
    if(!aptTime) throw new Error("'aptTime' is required for creating the appointment."); 
    if(!patientName) throw new Error("'patientName' is required for creating the appointment.");
    if(!departmentId) throw new Error("'departmentId' is required for creating the appointment.");


    const execParamQuery = require('../lib/mysql').execParamQuery;
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

function getAppointMin(apointTime) {
    const times = apointTime.split(":");
    if(!times.length || times.length < 2) throw new Error("'aptTime' is not in correct format.(hh:mm)"); ; // if no length
    let hrs = parseInt(times[0]), mins = parseInt(times[1]);
    const SLOT_INTERVAL = 15;
    const nextTime = mins + SLOT_INTERVAL; // adding interval
    
    hrs = (nextTime >= 60) ? hrs + 1 : hrs; //hr increase by one incase of mins grater than 60
    hrs = (hrs == 24) ? 0 : hrs; // 24 hrs check
    mins = (nextTime >= 60) ? (nextTime - 60) : nextTime; // if mins > 60
    
    hrs = (hrs < 10) ? "0" + hrs.toString() : hrs.toString(); //padding to Zero
    mins = (mins < 10) ? "0" + mins.toString() : mins.toString(); //padding Zero
    return hrs + ":" + mins;
}

function checkDateFormat(aptDate) {
    const d = aptDate.toString();
    if(d.split("-").length != 3 || 
        d.split("-")[0].length != 4 || 
        d.split("-")[1].length != 2 || 
        d.split("-")[2].length != 2)
            throw new Error("'aptDate' is not in correct format.(YYYY-MM-DD)");
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

module.exports = appointment;