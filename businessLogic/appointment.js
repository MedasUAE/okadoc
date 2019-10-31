const logger = require('../lib/logger');
const appointment = {};

appointment.create = async function({
    apointTime, //appoint_hr 
    remarks, // appoint_purpose
    appointDate, 
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
    logger.info("starting appointment.js, Handlers: appointment.create");

    //mandatory fields check
    if(!doctorId) throw new Error("'doctorId' is required for creating the appointment."); 
    if(!clinicId) throw new Error("'clinicId' is required for creating the appointment."); 
    if(!appointDate) throw new Error("'appointDate' is required for creating the appointment.");     
    if(!apointTime) throw new Error("'apointTime' is required for creating the appointment."); 
    if(!patientName) throw new Error("'patientName' is required for creating the appointment.");
    if(!departmentId) throw new Error("'departmentId' is required for creating the appointment.");

    const execParamQuery = require('../lib/mysql').execParamQuery;
    const APOINT_TYPE = require('./constants').APOINT_TYPE;
    let aptParams = [
        APOINT_TYPE, 
        apointTime, // appoint_hr
        getAppointMin(apointTime), // appoint_min
        remarks, // appoint_purpose
        appointDate, 
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
    if(!times.length) return; // if no length
    let hrs = parseInt(times[0]), mins = parseInt(times[1]);
    const SLOT_INTERVAL = 15;

    const nextTime = mins + SLOT_INTERVAL; // adding interval
    hrs = (nextTime >= 60 && hrs == 23) ? 0 : hrs + 1 ; //24 hrs check
    mins = (nextTime >= 60) ? (nextTime - 60) : nextTime; // if mins > 60
    
    hrs = (hrs < 10) ? "0" + hrs.toString() : hrs.toString(); //padding to Zero
    mins = (mins < 10) ? "0" + mins.toString() : mins.toString(); //padding Zero
    return hrs + ":" + mins;
}

appointment.cancel = function() {
    logger.info("starting appointment.js, Handlers: appointment.cancel");
    
}

appointment.reschedule = function() {
    logger.info("starrting appointment.js, Handlers: appointment.reschedule");
}

module.exports = appointment;