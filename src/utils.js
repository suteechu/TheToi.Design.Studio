// src/utils.js

// --- 1. ข้อมูลทีมช่าง (จากไฟล์ ทีมช่าง.csv) ---
export const DEFAULT_TEAMS = [
    { id: 'T1', name: 'ช่างรับเหมา นิติพันธ์ เปือยยะ (อุดรธานี)', ratePerSqm: 80 },
    { id: 'T2', name: 'ช่างรับเหมา มนตรี อุ่นแก้ว (ปทุมธานี)', ratePerSqm: 70 },
    { id: 'T3', name: 'ช่างรับเหมา นิพนธ์ ชัยจรินันท์ (สระบุรี)', ratePerSqm: 85 },
    { id: 'T4', name: 'ช่างรับเหมา สุธีร์ ชุยรัมย์ (สระบุรี)', ratePerSqm: 85 }
];
  
// --- 2. ประเภทงาน (Project Type - จากไฟล์ ประเภทงาน.csv) ---
export const DEFAULT_PROJECT_TYPES = [
    "บ้านพักอาศัยชั้นเดียว",
    "บ้านพักอาศัยชั้นครึ่ง",
    "บ้านพักอาศัยสองชั้น",
    "บ้านพักอาศัยน็อคดาวน์",
    "อาคารหอพัก",
    "อพาร์ทเม้นท์",
    "อื่น"
];

// --- 3. ชนิดงาน (Service Type - จากไฟล์ ชนิดงาน.csv) ---
export const DEFAULT_SERVICE_TYPES = [
    "แบบก่อสร้าง+3D",
    "แบบก่อสร้าง",
    "ชุดเรนเดอร์3D",
    "ผังบริเวณ",
    "อื่น"
];

// --- Helper Functions ---
export const getLocalDateStr = (addDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + addDays);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

export const formatCurrency = (amount) => 
    `฿${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// --- สร้างข้อมูลตัวอย่างให้ตรงกับไฟล์ Excel ---
export const INITIAL_JOBS = [
    {
        id: 'J25-001',
        client: 'คุณแววมยุรา',
        teamId: 'T1',
        projectType: 'บ้านพักอาศัยชั้นเดียว', // ประเภทงาน
        serviceType: 'แบบก่อสร้าง+3D',       // ชนิดงาน
        area: 150,
        unitPrice: 150, // ราคาขายต่อ ตร.ม.
        feeEng: 5000, feeArch: 5000, feeSuper: 5000, // ค่าวิชาชีพ
        actualOutsourceFee: 11500, // ค่าดำเนินวิชาชีพ (ต้นทุน)
        totalPrice: 37500, // (150*150) + 15000
        receivedAmount: 0,
        deliveryDate: getLocalDateStr(14),
        jobYear: '2025', quarter: 'Q3',
        image: null
    },
    {
        id: 'J25-002',
        client: 'คุณสวัสดี นาเชียงใต้',
        teamId: 'T1',
        projectType: 'บ้านพักอาศัยชั้นครึ่ง',
        serviceType: 'แบบก่อสร้าง',
        area: 60,
        unitPrice: 150,
        feeEng: 5000, feeArch: 0, feeSuper: 5000,
        actualOutsourceFee: 3000,
        totalPrice: 19000, // (60*150) + 10000
        receivedAmount: 19000,
        deliveryDate: getLocalDateStr(20),
        jobYear: '2025', quarter: 'Q3',
        image: null
    }
];