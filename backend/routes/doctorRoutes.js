const express = require('express');
const router = express.Router();
const doctorCtrl = require('../controllers/doctorController');
const db = require('../config/db');

router.get('/appointments', doctorCtrl.getAppointments);
router.get('/doctors', doctorCtrl.getAllDoctors);
router.post('/update-price', doctorCtrl.updatePrice);
router.post('/update-profile', doctorCtrl.updateProfile);
router.post('/change-password', doctorCtrl.changePassword);
router.get('/patients', doctorCtrl.getDoctorPatients);
router.post('/upload-pic', doctorCtrl.uploadDoctorPic);

// البحث عن مريض بالاسم
router.get('/search-patient', doctorCtrl.searchPatientByName);

// إضافة موعد طوارئ/عادي من لوحة الدكتور مع إشعار
router.post('/add-appointment', doctorCtrl.addDoctorAppointment);

// حذف موعد مريض واحد فقط
router.delete('/appointment/:appointmentId', doctorCtrl.deletePatientAppointment);

// تحديث حالة الموعد (pending/examined)
router.post('/update-appointment-status', doctorCtrl.updateAppointmentStatus);

// روشتة
router.post('/send-prescription', doctorCtrl.sendPrescription);
router.get('/prescriptions', doctorCtrl.getPatientPrescriptions);

// تقييم الدكتور
router.post('/rate', doctorCtrl.rateDoctor);

// معلومات الدكتور الشخصية
router.get('/info', doctorCtrl.getDoctorInfo);
router.post('/info', doctorCtrl.saveDoctorInfo);

// التحاليل الواصلة للدكتور
router.get('/lab-results', doctorCtrl.getDoctorLabResults);
router.post('/lab-read', doctorCtrl.markLabRead);
router.post('/lab-reply', doctorCtrl.replyToLab);

// حالة الحجوزات (مفتوح/مغلق) - مخزنة في الداتابيز مش في الذاكرة
router.get('/booking-status', async (req, res) => {
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ success: false, message: "doctorId مطلوب" });
    try {
        const [rows] = await db.query(
            'SELECT booking_open, weekly_schedule FROM doctor_booking_settings WHERE doctor_id = ?',
            [parseInt(doctorId)]
        );
        if (rows.length === 0) return res.json({ bookingOpen: true, weeklySchedule: {} });
        res.json({
            bookingOpen: rows[0].booking_open === 1,
            weeklySchedule: JSON.parse(rows[0].weekly_schedule || '{}')
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/booking-status', async (req, res) => {
    const { doctorId, bookingOpen, weeklySchedule } = req.body;
    if (!doctorId) return res.status(400).json({ success: false, message: "doctorId مطلوب" });
    try {
        await db.query(
            `INSERT INTO doctor_booking_settings (doctor_id, booking_open, weekly_schedule)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
             booking_open = VALUES(booking_open),
             weekly_schedule = VALUES(weekly_schedule)`,
            [parseInt(doctorId), bookingOpen ? 1 : 0, JSON.stringify(weeklySchedule || {})]
        );
        res.json({ success: true, bookingOpen, weeklySchedule });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
