import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  parseLandInfo, 
  SAMPLE_LAND_INPUT, 
  generateDXFString,
  convexHull,
  douglasPeucker,
  detectRedBoundary
} from '../src/utils/landParser.js';

test('1. แปลงข้อมูลตรงตามตัวอย่างที่ผู้ใช้กำหนด 100%', () => {
  const input = `เลขโฉนดที่ดิน

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

  const expected = `เลขโฉนดที่ดิน 68866
หน้าสำรวจ 5785
เลขที่ดิน 808
ระวาง 5137 I 0290-00 (4000)
ตำบล ห้วยขมิ้น
อำเภอ หนองแค
จังหวัด สระบุรี
เนื้อที่ 0 ไร่ 0 งาน 71.1 ตารางวา
ค่าพิกัดแปลง
14.38994290,100.87582267`;

  const result = parseLandInfo(input);

  assert.equal(result.text, expected);
  assert.equal(result.data.chanoed, '68866');
  assert.equal(result.data.survey, '5785');
  assert.equal(result.data.landNo, '808');
  assert.equal(result.data.rawang, '5137 I 0290-00 (4000)');
  assert.equal(result.data.subdistrict, 'ห้วยขมิ้น');
  assert.equal(result.data.district, 'หนองแค');
  assert.equal(result.data.province, 'สระบุรี');
  assert.equal(result.data.area, '0 ไร่ 0 งาน 71.1 ตารางวา');
  assert.equal(result.data.coords, '14.38994290,100.87582267');
  assert.equal(result.hasCoords, true);
  assert.equal(result.googleMapsUrl, 'https://www.google.com/maps?q=14.38994290,100.87582267');
});

test('2. ทดสอบกรณีหัวข้อและค่าอยู่บรรทัดเดียวกันพร้อมเครื่องหมายโคลอน (:)', () => {
  const input = `เลขโฉนดที่ดิน: 12345
หน้าสำรวจ: 999
เลขที่ดิน: 50
ระวาง: 5136 I 1000
ตำบล: หนองแค
อำเภอ: หนองแค
จังหวัด: สระบุรี
เนื้อที่: 1 ไร่ 0 งาน 0 ตารางวา
ค่าพิกัดแปลง: 14.12345, 100.98765`;

  const result = parseLandInfo(input);

  assert.equal(result.data.chanoed, '12345');
  assert.equal(result.data.survey, '999');
  assert.equal(result.data.landNo, '50');
  assert.equal(result.data.coords, '14.12345,100.98765');
});

test('3. ทดสอบตัวเลือก coordsOnNewline = false (พิกัดอยู่บรรทัดเดียวกับหัวข้อ)', () => {
  const input = `เลขโฉนดที่ดิน
68866
ค่าพิกัดแปลง
14.38994290,100.87582267`;

  const result = parseLandInfo(input, { coordsOnNewline: false });
  assert.equal(result.text, 'เลขโฉนดที่ดิน 68866\nค่าพิกัดแปลง 14.38994290,100.87582267');
});

test('4. ทดสอบตัวเลือก includePrice = true เมื่อมีราคาประเมินจริง', () => {
  const input = `เลขโฉนดที่ดิน
68866
ราคาประเมินที่ดิน
(กรมธนารักษ์)
1,500 บาทต่อตารางวา`;

  const resultWithPrice = parseLandInfo(input, { includePrice: true });
  assert.match(resultWithPrice.text, /ราคาประเมินที่ดิน 1,500 บาทต่อตารางวา/);

  // เมื่อ includePrice = false จะต้องไม่มีบรรทัดราคาประเมิน
  const resultWithoutPrice = parseLandInfo(input, { includePrice: false });
  assert.doesNotMatch(resultWithoutPrice.text, /ราคาประเมินที่ดิน/);
});

test('5. ทดสอบกรณีข้อความว่างเปล่า', () => {
  const result = parseLandInfo('');
  assert.equal(result.text, '');
  assert.equal(result.hasCoords, false);
  assert.equal(result.stats.fieldsFound, 0);
});

test('6. ทดสอบ SAMPLE_LAND_INPUT ค่าเริ่มต้น', () => {
  const result = parseLandInfo(SAMPLE_LAND_INPUT);
  assert.ok(result.text.includes('เลขโฉนดที่ดิน 68866'));
  assert.ok(result.text.includes('14.38994290,100.87582267'));
});

test('7. ทดสอบโฉนด 17880 หนองคาย พร้อมข้อมูลการเดินทาง และราคา 220 บาท', () => {
  const input = `เลขโฉนดที่ดิน
17880
หน้าสำรวจ
2164
เลขที่ดิน
64
ระวาง
5645 III 9804-00 (4000)
ตำบล
กุดบง
อำเภอ
โพนพิสัย
จังหวัด
หนองคาย
เนื้อที่
4 ไร่ 0 งาน 29.9 ตารางวา
ราคาประเมินที่ดิน
(กรมธนารักษ์)
220 บาทต่อตารางวา หรือตรวจสอบข้อมูลผ่านทาง เว็บไซต์กรมธนารักษ์ หรือติดต่อสำนักงานที่ดิน
ค่าพิกัดแปลง
18.13375437,103.09176183
ข้อมูลการเดินทาง
จากที่นี่ไปยังแปลงที่ดิน
จากแปลงที่ดินไปยังสำนักงานที่ดิน`;

  const result = parseLandInfo(input);
  assert.equal(result.data.chanoed, '17880');
  assert.equal(result.data.survey, '2164');
  assert.equal(result.data.landNo, '64');
  assert.equal(result.data.subdistrict, 'กุดบง');
  assert.equal(result.data.district, 'โพนพิสัย');
  assert.equal(result.data.province, 'หนองคาย');
  assert.equal(result.data.area, '4 ไร่ 0 งาน 29.9 ตารางวา');
  assert.equal(result.data.coords, '18.13375437,103.09176183');

  // ตรวจสอบการคำนวณเนื้อที่ ตร.ม.
  assert.equal(result.areaSqmInfo.totalSqm, 6519.6);
  assert.equal(result.areaSqmInfo.totalWa, 1629.9);

  // เมื่อเปิดรวมราคาประเมิน
  const withPrice = parseLandInfo(input, { includePrice: true });
  assert.match(withPrice.text, /ราคาประเมินที่ดิน 220 บาทต่อตารางวา/);
});

test('8. ทดสอบการสร้างไฟล์ AutoCAD DXF', () => {
  const pts = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ];
  const dxf = generateDXFString(pts, 1, { deedInfo: 'Test Plot' });
  assert.ok(dxf.includes('SECTION'));
  assert.ok(dxf.includes('LAND_BOUNDARY'));
  assert.ok(dxf.includes('LINE'));
  assert.ok(dxf.includes('EOF'));
});

test('9. ทดสอบอัลกอริทึม Convex Hull และ Douglas-Peucker', () => {
  const points = [
    { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 },
    { x: 10, y: 5 }, { x: 10, y: 10 },
    { x: 5, y: 10 }, { x: 0, y: 10 },
    { x: 5, y: 5 } // จุดข้างใน
  ];
  const hull = convexHull(points);
  assert.ok(hull.length >= 4);

  const simplified = douglasPeucker([...hull, hull[0]], 1);
  assert.ok(simplified.length >= 4);
});

test('10. ทดสอบฟังก์ชันตรวจจับแนวเขตสีแดง detectRedBoundary', () => {
  const width = 200;
  const height = 200;
  const data = new Uint8ClampedArray(width * height * 4);

  // วาดสี่เหลี่ยมสีแดง
  function drawLine(x0, y0, x1, y1) {
    const steps = Math.hypot(x1 - x0, y1 - y0);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(x0 + (x1 - x0) * t);
      const y = Math.round(y0 + (y1 - y0) * t);
      const idx = (y * width + x) * 4;
      data[idx] = 250;
      data[idx + 1] = 20;
      data[idx + 2] = 20;
      data[idx + 3] = 255;
    }
  }
  drawLine(30, 30, 170, 30);
  drawLine(170, 30, 170, 170);
  drawLine(170, 170, 30, 170);
  drawLine(30, 170, 30, 30);

  const detected = detectRedBoundary({ data, width, height });
  assert.ok(detected.length >= 4);
});
