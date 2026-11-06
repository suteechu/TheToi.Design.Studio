// src/utils/landParser.js

/**
 * ฟังก์ชันสำหรับแปลงข้อความข้อมูลที่ดิน (LandsMaps)
 * ให้อยู่ในรูปแบบบรรทัดกระชับ พร้อมนำไปใช้งาน
 */

export const SAMPLE_LAND_INPUT = `เลขโฉนดที่ดิน

68866

หน้าสำรวจ

5785

เลขที่ดิน

808

ระวาง

5137 I 0290-00 (4000)

ตำบล

ห้วยขมิ้น

อำเภอ

หนองแค

จังหวัด

สระบุรี

เนื้อที่

0 ไร่ 0 งาน 71.1 ตารางวา

ราคาประเมินที่ดิน

(กรมธนารักษ์)

กรุณาตรวจสอบข้อมูลผ่านทาง เว็บไซต์กรมธนารักษ์ หรือติดต่อสำนักงานที่ดิน

ค่าพิกัดแปลง

14.38994290,100.87582267`;

export const FIELD_DEFINITIONS = [
  { key: 'chanoed', match: /^(เลขโฉนด(ที่ดิน)?|โฉนดที่ดิน(เลขที่)?|เลขที่โฉนด)/i, label: 'เลขโฉนดที่ดิน' },
  { key: 'survey', match: /^หน้าสำรวจ/i, label: 'หน้าสำรวจ' },
  { key: 'landNo', match: /^เลขที่ดิน/i, label: 'เลขที่ดิน' },
  { key: 'rawang', match: /^ระวาง/i, label: 'ระวาง' },
  { key: 'subdistrict', match: /^(ตำบล|แขวง)/i, label: 'ตำบล' },
  { key: 'district', match: /^(อำเภอ|เขต)/i, label: 'อำเภอ' },
  { key: 'province', match: /^จังหวัด/i, label: 'จังหวัด' },
  { key: 'area', match: /^เนื้อที่/i, label: 'เนื้อที่' },
  { key: 'evalPrice', match: /^ราคาประเมิน(ทุนทรัพย์)?(ที่ดิน)?/i, label: 'ราคาประเมินที่ดิน' },
  { key: 'coords', match: /^(ค่า)?พิกัด(แปลง)?/i, label: 'ค่าพิกัดแปลง' },
];

export const COORD_REGEX = /([+-]?\d{1,3}\.\d+)\s*,\s*([+-]?\d{1,3}\.\d+)/;

export function parseLandInfo(rawText, options = {}) {
  const {
    includePrice = false,
    coordsOnNewline = true,
  } = options;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return {
      text: '',
      data: {},
      hasCoords: false,
      googleMapsUrl: null,
      stats: { fieldsFound: 0 }
    };
  }

  // ล้างอักขระพิเศษและแยกบรรทัด
  const cleanText = rawText
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ');

  const rawLines = cleanText.split(/\r?\n/);
  const lines = rawLines
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const extracted = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ตรวจสอบว่าตรงกับหัวข้อใด
    let matchedDef = null;
    for (const def of FIELD_DEFINITIONS) {
      if (def.match.test(line)) {
        matchedDef = def;
        break;
      }
    }

    if (matchedDef) {
      // กรณีที่ 1: หัวข้อและค่าอยู่บรรทัดเดียวกัน
      let restOfLine = line.replace(matchedDef.match, '').replace(/^[:\s-]+/, '').trim();
      
      if (restOfLine) {
        if (matchedDef.key === 'coords') {
          const m = restOfLine.match(COORD_REGEX);
          extracted[matchedDef.key] = m ? `${m[1]},${m[2]}` : restOfLine;
        } else {
          extracted[matchedDef.key] = restOfLine;
        }
      } else {
        // กรณีที่ 2: ค่าอยู่บรรทัดถัดไป
        let val = '';
        let nextIdx = i + 1;
        while (nextIdx < lines.length) {
          const nextLine = lines[nextIdx];
          const isAnotherLabel = FIELD_DEFINITIONS.some(d => d.match.test(nextLine));
          if (isAnotherLabel) {
            break;
          }

          if (matchedDef.key === 'coords') {
            const m = nextLine.match(COORD_REGEX);
            val = m ? `${m[1]},${m[2]}` : nextLine;
            i = nextIdx;
            break;
          } else if (matchedDef.key === 'evalPrice') {
            val = val ? `${val} ${nextLine}` : nextLine;
            nextIdx++;
          } else {
            val = nextLine;
            i = nextIdx;
            break;
          }
        }

        if (val) {
          extracted[matchedDef.key] = val;
          if (matchedDef.key === 'evalPrice') {
            i = nextIdx - 1;
          }
        }
      }
      continue;
    }

    // กรณีสำรอง: ถ้าบรรทัดนี้มีตัวเลขพิกัด GPS แต่ยังไม่ถูกสกัด
    if (!extracted.coords) {
      const match = line.match(COORD_REGEX);
      if (match) {
        extracted.coords = `${match[1]},${match[2]}`;
      }
    }
  }

  // รวบรวมข้อความผลลัพธ์
  const outputLines = [];

  if (extracted.chanoed) outputLines.push(`เลขโฉนดที่ดิน ${extracted.chanoed}`);
  if (extracted.survey) outputLines.push(`หน้าสำรวจ ${extracted.survey}`);
  if (extracted.landNo) outputLines.push(`เลขที่ดิน ${extracted.landNo}`);
  if (extracted.rawang) outputLines.push(`ระวาง ${extracted.rawang}`);
  if (extracted.subdistrict) outputLines.push(`ตำบล ${extracted.subdistrict}`);
  if (extracted.district) outputLines.push(`อำเภอ ${extracted.district}`);
  if (extracted.province) outputLines.push(`จังหวัด ${extracted.province}`);
  if (extracted.area) outputLines.push(`เนื้อที่ ${extracted.area}`);

  // ราคาประเมิน (แสดงเฉพาะเมื่อติ๊กเลือก และมีราคาที่เป็นตัวเลข)
  if (extracted.evalPrice) {
    const priceNumberMatch = extracted.evalPrice.match(/(\d[\d,]*(\.\d+)?\s*บาท(\s*ต่อ\s*ตารางวา)?)/);
    const hasUnverifiedText = /ตรวจสอบข้อมูล|ติดต่อสำนักงาน/i.test(extracted.evalPrice);
    const isUnverified = hasUnverifiedText && !priceNumberMatch;

    if (includePrice && !isUnverified) {
      const cleanPrice = priceNumberMatch
        ? priceNumberMatch[0].trim()
        : extracted.evalPrice.replace(/\(กรมธนารักษ์\)/g, '').trim();
      outputLines.push(`ราคาประเมินที่ดิน ${cleanPrice}`);
    }
  }

  // พิกัดแปลง
  if (extracted.coords) {
    if (coordsOnNewline) {
      outputLines.push(`ค่าพิกัดแปลง\n${extracted.coords}`);
    } else {
      outputLines.push(`ค่าพิกัดแปลง ${extracted.coords}`);
    }
  }

  const outputText = outputLines.join('\n');
  const hasCoords = !!extracted.coords;
  const googleMapsUrl = hasCoords ? `https://www.google.com/maps?q=${extracted.coords}` : null;
  const fieldsCount = Object.keys(extracted).length;

  const areaSqmInfo = parseThaiAreaToSqm(extracted.area);

  return {
    text: outputText,
    data: extracted,
    hasCoords,
    googleMapsUrl,
    areaSqmInfo,
    stats: {
      fieldsFound: fieldsCount,
      outputLinesCount: outputLines.length
    }
  };
}

/**
 * คำนวณเนื้อที่ไทย (ไร่-งาน-วา) เป็น ตารางเมตร และ ตารางวา
 */
export function parseThaiAreaToSqm(areaStr) {
  if (!areaStr || typeof areaStr !== 'string') {
    return { rai: 0, ngan: 0, wa: 0, totalWa: 0, totalSqm: 0 };
  }

  const raiMatch = areaStr.match(/(\d+(\.\d+)?)\s*ไร่/);
  const nganMatch = areaStr.match(/(\d+(\.\d+)?)\s*งาน/);
  const waMatch = areaStr.match(/(\d+(\.\d+)?)\s*(ตารางวา|ตร\.?ว\.?)/);

  const rai = raiMatch ? parseFloat(raiMatch[1]) : 0;
  const ngan = nganMatch ? parseFloat(nganMatch[1]) : 0;
  const wa = waMatch ? parseFloat(waMatch[1]) : 0;

  const totalWa = (rai * 400) + (ngan * 100) + wa;
  const totalSqm = parseFloat((totalWa * 4).toFixed(2));

  return {
    rai,
    ngan,
    wa,
    totalWa: parseFloat(totalWa.toFixed(2)),
    totalSqm
  };
}

/**
 * คำนวณพื้นที่รูปหลายเหลี่ยม (Shoelace formula)
 */
export function calculatePolygonArea(pts) {
  if (!pts || pts.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * สร้างข้อความไฟล์ AutoCAD DXF (.dxf) จากจุดพิกัดเส้นเขตที่ดิน
 */
export function generateDXFString(pts, scaleFactor = 1, options = {}) {
  const {
    layerName = 'LAND_BOUNDARY',
    deedInfo = '',
    unit = 'Meters'
  } = options;

  if (!pts || pts.length < 2) return '';

  const dxfLines = [
    '0', 'SECTION',
    '2', 'HEADER',
    '9', '$ACADVER',
    '1', 'AC1009', // R12 DXF compatibility
    '9', '$INSUNITS',
    '70', '6', // 6 = Meters
    '0', 'ENDSEC',
    '0', 'SECTION',
    '2', 'TABLES',
    '0', 'TABLE',
    '2', 'LAYER',
    '70', '2',
    '0', 'LAYER',
    '2', layerName,
    '70', '0',
    '62', '1', // 1 = Red
    '6', 'CONTINUOUS',
    '0', 'LAYER',
    '2', 'LAND_INFO',
    '70', '0',
    '62', '7', // 7 = White/Black
    '6', 'CONTINUOUS',
    '0', 'ENDTAB',
    '0', 'ENDSEC',
    '0', 'SECTION',
    '2', 'ENTITIES'
  ];

  // กลับแกน Y (ใน CAD แกน Y ชี้ขึ้น) และตั้งจุดอ้างอิงเริ่มต้นที่ (0, 0)
  const minX = Math.min(...pts.map(p => p.x));
  const maxY = Math.max(...pts.map(p => p.y));

  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const x1 = ((pts[i].x - minX) * scaleFactor).toFixed(4);
    const y1 = ((maxY - pts[i].y) * scaleFactor).toFixed(4);
    const x2 = ((pts[j].x - minX) * scaleFactor).toFixed(4);
    const y2 = ((maxY - pts[j].y) * scaleFactor).toFixed(4);

    dxfLines.push(
      '0', 'LINE',
      '8', layerName,
      '10', x1,
      '20', y1,
      '30', '0.0',
      '11', x2,
      '21', y2,
      '31', '0.0'
    );
  }

  // เพิ่ม Label ข้อความในจุดกึ่งกลางแปลง
  if (deedInfo) {
    const avgX = (pts.reduce((acc, p) => acc + (p.x - minX), 0) / pts.length * scaleFactor).toFixed(4);
    const avgY = (pts.reduce((acc, p) => acc + (maxY - p.y), 0) / pts.length * scaleFactor).toFixed(4);

    dxfLines.push(
      '0', 'TEXT',
      '8', 'LAND_INFO',
      '10', avgX,
      '20', avgY,
      '30', '0.0',
      '40', '3.0',
      '1', deedInfo
    );
  }

  dxfLines.push('0', 'ENDSEC', '0', 'EOF');
  return dxfLines.join('\n');
}
