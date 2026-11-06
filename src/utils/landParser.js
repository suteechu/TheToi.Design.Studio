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
    const isUnverified = /ตรวจสอบข้อมูล|ติดต่อสำนักงาน/i.test(extracted.evalPrice);
    if (includePrice && !isUnverified) {
      const cleanPrice = extracted.evalPrice.replace(/\(กรมธนารักษ์\)/g, '').trim();
      outputLines.push(`ราคาประเมินที่ดิน ${cleanPrice || extracted.evalPrice}`);
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

  return {
    text: outputText,
    data: extracted,
    hasCoords,
    googleMapsUrl,
    stats: {
      fieldsFound: fieldsCount,
      outputLinesCount: outputLines.length
    }
  };
}
