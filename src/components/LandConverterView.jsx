import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Copy, Check, Trash2, ExternalLink, FileText, 
  Layers, Compass, Share2, History, Sparkles, Clipboard, 
  CheckCircle2, ArrowRight, Map
} from 'lucide-react';
import { parseLandInfo, SAMPLE_LAND_INPUT } from '../utils/landParser';
import { safeJSONParse } from '../utils/helpers';

export default function LandConverterView() {
  const [inputText, setInputText] = useState('');
  const [coordsOnNewline, setCoordsOnNewline] = useState(true);
  const [includePrice, setIncludePrice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // ประวัติการแปลงล่าสุด บันทึกใน LocalStorage
  const [history, setHistory] = useState(() => safeJSONParse('stu_land_history', []));

  useEffect(() => {
    try {
      localStorage.setItem('stu_land_history', JSON.stringify(history));
    } catch {
      /* ignore storage error */
    }
  }, [history]);

  // ผลลัพธ์การแปลง
  const parsed = useMemo(() => {
    return parseLandInfo(inputText, {
      coordsOnNewline,
      includePrice,
    });
  }, [inputText, coordsOnNewline, includePrice]);

  // แสดง Toast แจ้งเตือน
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // คัดลอกผลลัพธ์
  const handleCopy = async () => {
    if (!parsed.text) return;
    try {
      await navigator.clipboard.writeText(parsed.text);
      setCopied(true);
      showToast('คัดลอกข้อความสำเร็จแล้ว!');
      setTimeout(() => setCopied(false), 2000);

      // บันทึกลงประวัติถ้ามีเลขโฉนดหรือพิกัด
      if (parsed.data.chanoed || parsed.data.coords) {
        setHistory(prev => {
          const item = {
            id: Date.now(),
            date: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            chanoed: parsed.data.chanoed || 'ไม่ระบุโฉนด',
            location: [parsed.data.subdistrict, parsed.data.district, parsed.data.province].filter(Boolean).join(' ') || '-',
            area: parsed.data.area || '-',
            coords: parsed.data.coords || null,
            text: parsed.text,
            raw: inputText
          };
          // หลีกเลี่ยงรายการซ้ำ
          const filtered = prev.filter(p => p.text !== parsed.text);
          return [item, ...filtered].slice(0, 8);
        });
      }
    } catch {
      showToast('ไม่สามารถเข้าถึงคลิปบอร์ดได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // วางจากคลิปบอร์ด
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        showToast('วางข้อความจากคลิปบอร์ดแล้ว');
      }
    } catch {
      showToast('กรุณากด Ctrl+V เพื่อวางข้อความ');
    }
  };

  // โหลดตัวอย่างข้อมูล
  const handleLoadSample = () => {
    setInputText(SAMPLE_LAND_INPUT);
    showToast('โหลดตัวอย่างข้อมูลเรียบร้อย');
  };

  // ล้างข้อมูล
  const handleClear = () => {
    setInputText('');
    setCopied(false);
  };

  // โหลดจากประวัติ
  const handleSelectHistory = (item) => {
    setInputText(item.raw || item.text);
    showToast(`โหลดข้อมูลโฉนด ${item.chanoed}`);
  };

  // ลบประวัติ
  const handleClearHistory = () => {
    if (window.confirm('คุณต้องการลบประวัติการแปลงทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
      showToast('ลบประวัติเรียบร้อย');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-lg shadow-gold-500/20">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              เครื่องมือแปลงข้อมูลโฉนดที่ดิน
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-700 font-semibold border border-gold-200">
                LandsMaps Formatter
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              นำข้อความที่คัดลอกมาจากระบบค้นหารูปแปลงที่ดิน (กรมที่ดิน) มาวางเพื่อจัดระเบียบให้กระชับ สะอาดตา และพร้อมส่งต่อทันที
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://landsmaps.dol.go.th"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-gold-600 hover:border-gold-300 transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
          >
            <Map size={14} /> เว็บไซต์ LandsMaps <ExternalLink size={12} />
          </a>
          <button
            onClick={handleLoadSample}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gold-50 border border-gold-200 text-gold-700 hover:bg-gold-100 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} /> ใส่ข้อความตัวอย่าง
          </button>
        </div>
      </div>

      {/* Structured Summary Cards (ถ้าสกัดพบข้อมูล) */}
      {parsed.stats.fieldsFound > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">โฉนดที่ดินเลขที่</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block truncate">
              {parsed.data.chanoed || '-'}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              น.ส. {parsed.data.survey || '-'} | ดิน {parsed.data.landNo || '-'}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ทำเลที่ตั้ง</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block truncate">
              {parsed.data.province || '-'}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {[parsed.data.subdistrict, parsed.data.district].filter(Boolean).join(', ') || '-'}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ขนาดเนื้อที่</span>
            <span className="text-base font-bold text-emerald-600 mt-0.5 block truncate">
              {parsed.data.area || '-'}
            </span>
            <span className="text-[11px] text-slate-400 block">
              ขนาดแปลงที่ดิน
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ระวางที่ดิน</span>
            <span className="text-sm font-semibold text-slate-800 mt-1 block truncate" title={parsed.data.rawang}>
              {parsed.data.rawang || '-'}
            </span>
            <span className="text-[11px] text-slate-400 block">ระวางแผนที่</span>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ค่าพิกัดแปลง GPS</span>
            {parsed.hasCoords ? (
              <a
                href={parsed.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1 group truncate"
                title="คลิกเพื่อเปิดใน Google Maps"
              >
                <Compass size={13} className="text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="truncate">{parsed.data.coords}</span>
                <ExternalLink size={10} className="shrink-0" />
              </a>
            ) : (
              <span className="text-xs text-slate-400 mt-1 block">-</span>
            )}
            <span className="text-[11px] text-slate-400 block">คลิกดูแผนที่จริง</span>
          </div>
        </div>
      )}

      {/* Main Two-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Box: Input */}
        <div className="glass-card p-5 rounded-2xl flex flex-col h-full border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              <label htmlFor="land-raw-input" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. ข้อความต้นทาง (วางข้อความที่นี่)
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePaste}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                title="วางข้อความจากคลิปบอร์ด"
              >
                <Clipboard size={12} /> วาง
              </button>
              {inputText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                  title="ล้างข้อความทั้งหมด"
                >
                  <Trash2 size={12} /> ล้าง
                </button>
              )}
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              id="land-raw-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="นำข้อความแบบนี้มาวางได้เลยครับ เช่น:&#10;&#10;เลขโฉนดที่ดิน&#10;68866&#10;หน้าสำรวจ&#10;5785&#10;...&#10;ค่าพิกัดแปลง&#10;14.38994290,100.87582267"
              className="w-full h-80 lg:h-96 p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs md:text-sm font-mono leading-relaxed text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 outline-none resize-none transition-all custom-scrollbar"
            />
          </div>

          <div className="mt-3 flex justify-between items-center text-[11px] text-slate-400">
            <span>ความยาว: {inputText.length} ตัวอักษร ({inputText.split('\n').filter(Boolean).length} บรรทัด)</span>
            {inputText && (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} /> ประมวลผลอัตโนมัติแล้ว
              </span>
            )}
          </div>
        </div>

        {/* Right Box: Output */}
        <div className="glass-card p-5 rounded-2xl flex flex-col h-full border border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-gold-500" />
              <label htmlFor="land-formatted-output" className="text-xs font-bold uppercase tracking-wider text-slate-800">
                2. ผลลัพธ์ที่แปลงแล้ว (พร้อมใช้งาน)
              </label>
            </div>

            <div className="flex items-center gap-2">
              {parsed.hasCoords && (
                <a
                  href={parsed.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-1 shadow-sm"
                  title="เปิดตำแหน่งแปลงที่ดินใน Google Maps"
                >
                  <MapPin size={13} /> แผนที่ Google <ExternalLink size={11} />
                </a>
              )}

              <button
                type="button"
                onClick={handleCopy}
                disabled={!parsed.text}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : parsed.text
                    ? 'bg-slate-900 text-white hover:bg-gold-600 shadow-slate-900/20 hover:shadow-gold-600/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="คัดลอกข้อความผลลัพธ์ทั้งหมด"
              >
                {copied ? <Check size={14} className="animate-bounce" /> : <Copy size={14} />}
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอกผลลัพธ์'}
              </button>
            </div>
          </div>

          {/* Options / Customization */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-slate-100/70 border border-slate-200/60 flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={coordsOnNewline}
                onChange={(e) => setCoordsOnNewline(e.target.checked)}
                className="w-4 h-4 rounded text-gold-500 focus:ring-gold-400 focus:ring-offset-0 border-slate-300"
              />
              <span>พิกัดขึ้นบรรทัดใหม่ (ตามตัวอย่างมาตรฐาน)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includePrice}
                onChange={(e) => setIncludePrice(e.target.checked)}
                className="w-4 h-4 rounded text-gold-500 focus:ring-gold-400 focus:ring-offset-0 border-slate-300"
              />
              <span>รวมราคาประเมินที่ดิน (ถ้ามีระบุราคา)</span>
            </label>
          </div>

          {/* Output Display */}
          <div className="relative flex-1">
            <textarea
              id="land-formatted-output"
              readOnly
              value={parsed.text}
              placeholder="ผลลัพธ์ที่แปลงแล้วจะแสดงที่นี่อัตโนมัติ..."
              className="w-full h-80 lg:h-96 p-4 rounded-xl bg-white border border-slate-200 text-xs md:text-sm font-mono leading-relaxed text-slate-900 focus:outline-none resize-none custom-scrollbar shadow-inner"
            />
          </div>

          <div className="mt-3 flex justify-between items-center text-[11px] text-slate-400">
            <span>
              {parsed.stats.fieldsFound > 0
                ? `พบข้อมูล ${parsed.stats.fieldsFound} ฟิลด์ | รวม ${parsed.stats.outputLinesCount} บรรทัด`
                : 'รอการวางข้อมูลเพื่อแปลง'}
            </span>
            {parsed.hasCoords && (
              <span className="text-blue-600 font-mono">
                📍 {parsed.data.coords}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="glass-card p-5 rounded-2xl border border-slate-200/70">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                ประวัติการแปลงล่าสุด ({history.length})
              </h3>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              ล้างประวัติ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistory(item)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-gold-50/50 border border-slate-200 hover:border-gold-300 cursor-pointer transition-all hover-lift group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-gold-700">
                      โฉนด {item.chanoed}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {item.location}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                    {item.area}
                  </p>
                </div>
                
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-400 group-hover:text-gold-600">
                  <span>คลิกเพื่อเรียกข้อมูล</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help / Tip Card */}
      <div className="p-4 rounded-xl bg-gold-50/50 border border-gold-200/60 text-xs text-slate-600 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gold-100 text-gold-700 shrink-0 mt-0.5">
          <Layers size={16} />
        </div>
        <div>
          <span className="font-bold text-slate-800 block">วิธีใช้งาน</span>
          <p className="mt-0.5 leading-relaxed text-slate-600">
            1. ค้นหาแปลงที่ดินจากเว็บไซต์ <strong>LandsMaps</strong> ของกรมที่ดิน แล้วใช้เมาส์ลากคลุมข้อความข้อมูลแปลงที่ดินทั้งหมดแล้วกด Copy (Ctrl+C)<br />
            2. นำมากดปุ่ม <strong>"วาง"</strong> หรือกด Ctrl+V ในช่องด้านซ้าย<br />
            3. ระบบจะตัดบรรทัดว่างและจัดรูปแบบเรียงหัวข้อกับค่าข้อมูลให้ตรงกันทันที จากนั้นกดปุ่ม <strong>"คัดลอกผลลัพธ์"</strong> เพื่อนำไปส่ง LINE หรือเอกสารได้ทันที
          </p>
        </div>
      </div>

    </div>
  );
}
