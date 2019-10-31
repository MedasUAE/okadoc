const logger = require('../lib/logger');
const doctor = {};

doctor.getDoctorList = async function() {
    const execParamQuery = require('../lib/mysql').execParamQuery;
    const query = `SELECT  
    DS.doctors_id doctorId, 
    DS.doctors_name doctorName, 
    DS.clinician_code doctorCode, 
    DOf.office_id clinicId, 
    OD.office_Name clinicName, 
    DOf.department_id departmentId
    FROM doctors_setup DS INNER JOIN doctors_office DOf 
    ON DS.doctors_id = DOf.doctors_id
    LEFT JOIN office_details OD ON 
    DOf.office_id = OD.office_Id
    WHERE 
    DS.clinician_code != ''
    AND DS.active_status = 'Y';`
    const doctors = await execParamQuery(query);
    return doctors;
} 

doctor.getDoctorAvbleSlot = async function({doctorId, clinicId, aptDate}) {
    const execParamQuery = require('../lib/mysql').execParamQuery;
    let docSlotParams = [], aptParams = [];

    if(!aptDate) throw new Error("'aptDate' not given.");
    if(!doctorId) throw new Error("'doctorId' not given.");
    if(!clinicId) throw new Error("'clinicId' not given.");

    const docSlotQuery = `SELECT 
    apt_mstr.slots time FROM 
    appointment_schmaster apt_mstr 
    WHERE period_id = 
    (SELECT period_id FROM 
        appointment_sch apt_sch  WHERE 
        apt_sch.fromdate <= ? AND 
        apt_sch.todate >= ? AND 
        apt_sch.doctors_id = ? AND 
        apt_sch.slot_day = ? AND 
        apt_sch.office_id=? AND
        apt_sch.active_status = 'Y')`;

    const aptQuery = `SELECT 
        appoint_hr time, 
        slot_nos slot FROM 
        appointments WHERE 
        appoint_date = ? AND 
        doctors_id = ? AND 
        office_id = ? 
        ORDER BY appoint_hr ASC`;

    try {
        
        const date = new Date(aptDate);
        const slotDay = date.getDay();

        //params for docSlotQuery
        docSlotParams.push(aptDate); //param for fromdate 
        docSlotParams.push(aptDate); //param for todate 
        docSlotParams.push(doctorId); //param for doctors_id 
        docSlotParams.push(slotDay); //param for slot_day
        docSlotParams.push(clinicId); //param for office_id

        //params for aptParams
        aptParams.push(aptDate); //param for appoint_date 
        aptParams.push(doctorId); //param for doctors_id 
        aptParams.push(clinicId); //param for office_id

        const doctorSlot = await execParamQuery(docSlotQuery, docSlotParams);
        const bookedSlot = await execParamQuery(aptQuery, aptParams);

        return {doctorSlot, bookedSlot};
    } catch (error) {
        logger.error("doctors.js, Handlers: getDoctorAvbleSlot" + error.stack);
        throw new Error("Error while getting doctor slot.");
    }
} 

module.exports = doctor;