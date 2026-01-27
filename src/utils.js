export const formatCurrency = (amount) => 
    `฿${(parseFloat(amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  
  // --- รายชื่อทีมช่าง (อัปเดตล่าสุด) ---
  export const DEFAULT_TEAMS = [
    { id: 'T1', name: 'ช่างนิติพันธ์ เปือยยะ (อุดรธานี)', ratePerSqm: 80 },
    { id: 'T2', name: 'ช่างมนตรี อุ่นแก้ว (ปทุมธานี)', ratePerSqm: 70 },
    { id: 'T3', name: 'ช่างนิพนธ์ ชัยจรินันท์ (สระบุรี)', ratePerSqm: 85 },
    { id: 'T4', name: 'ช่างสุธีร์ ชุยรัมย์ (สระบุรี)', ratePerSqm: 85 },
    { id: 'T5', name: 'ช่างต่อเติม (ทั่วไป)', ratePerSqm: 0 },
    { id: 'T6', name: 'อื่น (ระบุเอง)', ratePerSqm: 0 }
  ];
  
  export const DEFAULT_PROJECT_TYPES = [
    "บ้านพักอาศัยชั้นเดียว", "บ้านพักอาศัยชั้นครึ่ง", "บ้านพักอาศัยสองชั้น", 
    "บ้านพักอาศัยน็อคดาวน์", "อาคารหอพัก", "อพาร์ทเม้นท์", "บ้านชั้นเดียว", "อื่น"
  ];
  
  export const DEFAULT_SERVICE_TYPES = [
    "แบบก่อสร้าง+3D", "แบบก่อสร้าง", "ชุดเรนเดอร์3D", "ผังบริเวณ", "อื่น"
  ];
  
  export const INITIAL_JOBS = [
    { 
        id: 'J25001', client: 'คุณแววมยุรา', teamId: 'T1', 
        projectType: 'บ้านพักอาศัยชั้นเดียว', serviceType: 'แบบก่อสร้าง+3D', 
        area: 150, unitPrice: 150, totalPrice: 37500, receivedAmount: 0, 
        feeEng: 5000, feeArch: 5000, feeSuper: 5000, actualOutsourceFee: 11500, 
        deliveryDate: '2025-08-25', note: 'กำไรสุทธิ: 26000', status: 'IN_PROGRESS' 
    }
  ];