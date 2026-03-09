// src/utils/helpers.js

// แปลง JSON อย่างปลอดภัย
export const safeJSONParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return fallback;
  }
};

// จัดรูปแบบเงิน (เช่น 1000 -> ฿1,000)
export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '฿0';
  return `฿${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// จัดรูปแบบวันที่ไทย (เช่น 2024-01-01 -> 1 ม.ค. 67)
export const formatThaiDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit' 
    });
  } catch (e) { return '-'; }
};

// แปลงวันที่จาก Google Sheet ให้เป็น format มาตรฐาน
export const convertSheetDate = (dateStr) => {
  if (!dateStr) return '';
  dateStr = dateStr.split(' ')[0];
  const parts = dateStr.split(/[\-/]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (d.length === 4) return `${d}-${m.padStart(2,'0')}-${y.padStart(2,'0')}`; // กรณี yyyy-mm-dd
    if (parseInt(y) > 2400) y = (parseInt(y) - 543).toString(); // แปลง พ.ศ. เป็น ค.ศ.
    if (y.length === 2) y = '20' + y;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  return '';
};

// แปลงลิงก์ Google Drive เป็นรูปภาพที่แสดงผลได้
export const processImageLink = (url) => {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.includes('drive.google.com')) {
    let idMatch = trimmed.match(/\/d\/([a-zA-Z0-9_\-]+)/);
    if (!idMatch) idMatch = trimmed.match(/id=([a-zA-Z0-9_\-]+)/);
    if (idMatch) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
  }
  return trimmed;
};