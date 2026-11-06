import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLandInfo, SAMPLE_LAND_INPUT } from '../src/utils/landParser.js';

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
