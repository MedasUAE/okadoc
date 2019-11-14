const logger = require('../lib/logger');
const doctor = {};
const execParamQuery = require('../lib/mysql').execParamQuery;

doctor.getDoctorList = async function () {
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

doctor.getDoctorAvbleSlot = async function ({ doctorId, clinicId, aptDate }) {
    if (!aptDate) throw new Error("'aptDate' not given.");
    if (!doctorId) throw new Error("'doctorId' not given.");
    if (!clinicId) throw new Error("'clinicId' not given.");

    try {
        const doctorSlot = await doctor.getDoctorSlots({ aptDate, doctorId, clinicId, SHOW_SLOT_INTERVAL:true });
        const bookedSlot = await doctor.getBookedSlots({ aptDate, doctorId, clinicId });
        const filterDocSlot = filterBookedSlot(doctorSlot,bookedSlot); // filter the booked slot from doctorSlots

        return { doctorSlot:filterDocSlot };
    } catch (error) {
        logger.error("doctors.js, Handlers: getDoctorAvbleSlot" + error.stack);
        throw new Error("Error while getting doctor slot.");
    }
}

/**
 * Method for filtering the doctorslot based on booked slot
 * @param {Array} doctorSlot 
 * @param {Array} bookedSlot 
 */
function filterBookedSlot(doctorSlot, bookedSlot) {
    const checkInBetweenApt = require('./common').checkInBetweenApt;
    doctorSlot.forEach(dSlot=>{
        bookedSlot.forEach(bSlot => {
            if(checkInBetweenApt(bSlot.time, bSlot.slot, dSlot.time, dSlot.slot)) {
                dSlot.found = true;
            }
        });
    });
    return doctorSlot.filter(slot => !slot.found).map(slot => ({ time: slot.time}) );
    // return doctorSlot;
}


doctor.getBookedSlots = async function ({ aptDate, doctorId, clinicId }) {

    if (!aptDate) throw new Error("'aptDate' not given.");
    if (!doctorId) throw new Error("'doctorId' not given.");
    if (!clinicId) throw new Error("'clinicId' not given.");
    const aptQuery = `SELECT 
        appoint_hr time,  
        slot_nos slot FROM 
        appointments WHERE 
        appoint_date = ? AND 
        doctors_id = ? AND 
        office_id = ? AND 
        cancel_status != 'Y'
        ORDER BY appoint_hr ASC`;

    let aptParams = [];

    //params for aptParams
    aptParams.push(aptDate); //param for appoint_date 
    aptParams.push(doctorId); //param for doctors_id 
    aptParams.push(clinicId); //param for office_id

    try {
        const bookedSlot = await execParamQuery(aptQuery, aptParams);
        return bookedSlot;
    } catch (error) {
        logger.error("doctors.js, Handlers: getBookedSlots" + error.stack);
        throw new Error("Error while getting doctor booked slot.");
    }

}

doctor.getDoctorSlots = async function ({ aptDate, doctorId, clinicId, SHOW_SLOT_INTERVAL }) {

    let docSlotQuery = "SELECT apt_mstr.slots time ";
        if(SHOW_SLOT_INTERVAL) docSlotQuery = docSlotQuery + ", apt_sch.slots slot "
        docSlotQuery = docSlotQuery + `FROM 
        appointment_schmaster apt_mstr 
        JOIN appointment_sch apt_sch ON
        apt_mstr.period_id = apt_sch.period_id
        WHERE 
            apt_sch.fromdate <= ? AND 
            apt_sch.todate >= ? AND 
            apt_sch.doctors_id = ? AND 
            apt_sch.slot_day = ? AND 
            apt_sch.office_id = ? AND
            apt_sch.active_status = 'Y'`;

    let docSlotParams = [];

    try {
        const date = new Date(aptDate);
        const slotDay = date.getDay();

        //params for docSlotQuery
        docSlotParams.push(aptDate); //param for fromdate 
        docSlotParams.push(aptDate); //param for todate 
        docSlotParams.push(doctorId); //param for doctors_id 
        docSlotParams.push(slotDay); //param for slot_day
        docSlotParams.push(clinicId); //param for office_id

        const doctorSlot = await execParamQuery(docSlotQuery, docSlotParams);
        return doctorSlot;
    } catch (error) {
        logger.error("doctors.js, Handlers: getDoctorSlots" + error.stack);
        throw new Error("Error while getting doctor slot.");
    }

}

module.exports = doctor;