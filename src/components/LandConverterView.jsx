import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, Copy, Check, Trash2, ExternalLink, FileText, 
  Layers, Compass, History, Sparkles, Clipboard, 
  CheckCircle2, ArrowRight, Map, Download, Image as ImageIcon,
  FileCode, Sliders, RefreshCw, Eye, Undo2, Crosshair, AlertCircle
} from 'lucide-react';
import { 
  parseLandInfo, 
  SAMPLE_LAND_INPUT, 
  parseThaiAreaToSqm, 
  calculatePolygonArea, 
  generateDXFString,
  detectRedBoundary
} from '../utils/landParser';
import { safeJSONParse } from '../utils/helpers';

// จุดยอดของรูปแปลงที่ดินตัวอย่าง (โฉนด 17880 หนองคาย)
const SAMPLE_POLYGON_POINTS = [
  { x: 72, y: 274 },
  { x: 222, y: 195 },
  { x: 344, y: 341 },
  { x: 801, y: 72 },
  { x: 948, y: 423 },
  { x: 794, y: 542 },
  { x: 672, y: 615 },
  { x: 618, y: 634 },
  { x: 517, y: 646 },
  { x: 440, y: 632 },
  { x: 226, y: 456 }
];

export default function LandConverterView() {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'dxf'
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

  // ผลลัพธ์การแปลงข้อความ
  const parsed = useMemo(() => {
    return parseLandInfo(inputText, {
      coordsOnNewline,
      includePrice,
    });
  }, [inputText, coordsOnNewline, includePrice]);

  // --- DXF STATE ---
  const [imageSrc, setImageSrc] = useState('/sample_land_plot.png');
  const [targetAreaSqm, setTargetAreaSqm] = useState(6519.6); // 4 ไร่ 0 งาน 29.9 ตร.ว.
  const [detectedPoints, setDetectedPoints] = useState(SAMPLE_POLYGON_POINTS);
  const [showPoints, setShowPoints] = useState(true);
  const [showLengths, setShowLengths] = useState(true);
  const [hoveredPointIdx, setHoveredPointIdx] = useState(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // อัปเดต Target Area เมื่อมีการแปลงข้อความที่มีเนื้อที่
  useEffect(() => {
    if (parsed.areaSqmInfo && parsed.areaSqmInfo.totalSqm > 0) {
      setTargetAreaSqm(parsed.areaSqmInfo.totalSqm);
    }
  }, [parsed.areaSqmInfo]);

  // คำนวณมาตราส่วน (Meters per pixel)
  const pixelArea = useMemo(() => calculatePolygonArea(detectedPoints), [detectedPoints]);
  const scaleFactor = useMemo(() => {
    if (pixelArea <= 0 || targetAreaSqm <= 0) return 0.1564;
    return Math.sqrt(targetAreaSqm / pixelArea);
  }, [pixelArea, targetAreaSqm]);

  // คำนวณความยาวแต่ละด้านในหน่วยเมตร
  const sidesInfo = useMemo(() => {
    if (!detectedPoints || detectedPoints.length < 2) return { sides: [], totalPerimeter: 0 };
    let totalPerimeter = 0;
    const sides = [];
    const isClosed = detectedPoints.length >= 3;
    const sideCount = isClosed ? detectedPoints.length : detectedPoints.length - 1;

    for (let i = 0; i < sideCount; i++) {
      const j = (i + 1) % detectedPoints.length;
      const dx = (detectedPoints[j].x - detectedPoints[i].x) * scaleFactor;
      const dy = (detectedPoints[j].y - detectedPoints[i].y) * scaleFactor;
      const length = Math.hypot(dx, dy);
      totalPerimeter += length;
      sides.push({
        from: i + 1,
        to: j + 1,
        length: parseFloat(length.toFixed(2))
      });
    }
    return { sides, totalPerimeter: parseFloat(totalPerimeter.toFixed(2)) };
  }, [detectedPoints, scaleFactor]);

  // วาด Canvas เมื่อรูปและจุดเปลี่ยน
  useEffect(() => {
    if (activeTab !== 'dxf' || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // วาดรูปหลายเหลี่ยมที่ตรวจจับได้
      if (detectedPoints.length > 0) {
        ctx.save();

        if (detectedPoints.length > 2) {
          // ระบายสีพื้นแปลงที่ดินกึ่งโปร่งใส
          ctx.beginPath();
          ctx.moveTo(detectedPoints[0].x, detectedPoints[0].y);
          for (let i = 1; i < detectedPoints.length; i++) {
            ctx.lineTo(detectedPoints[i].x, detectedPoints[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
          ctx.fill();

          // เส้นขอบแปลง
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#0284c7'; // ฟ้าเด่นตัดกับสีแดง
          ctx.setLineDash([6, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (detectedPoints.length === 2) {
          ctx.beginPath();
          ctx.moveTo(detectedPoints[0].x, detectedPoints[0].y);
          ctx.lineTo(detectedPoints[1].x, detectedPoints[1].y);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#0284c7';
          ctx.setLineDash([6, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // วาดจุดยอดและตัวเลขกำกับ
        detectedPoints.forEach((p, idx) => {
          const isSelected = hoveredPointIdx === idx || draggingIdx === idx;
          if (showPoints) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, isSelected ? 8 : 6, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? '#f59e0b' : '#dc2626';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // หมายเลขจุด
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#0f172a';
            ctx.fillText(`${idx + 1}`, p.x + 9, p.y - 5);
          }

          // ความยาวแต่ละด้าน
          if (showLengths && detectedPoints.length >= 2) {
            const nextIdx = (idx + 1) % detectedPoints.length;
            if (detectedPoints.length > 2 || idx === 0) {
              const nextP = detectedPoints[nextIdx];
              const midX = (p.x + nextP.x) / 2;
              const midY = (p.y + nextP.y) / 2;
              const side = sidesInfo.sides?.[idx];
              if (side) {
                ctx.save();
                ctx.font = 'bold 11px sans-serif';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.strokeText(`${side.length} ม.`, midX + 5, midY - 5);
                ctx.fillStyle = '#0f172a';
                ctx.fillText(`${side.length} ม.`, midX + 5, midY - 5);
                ctx.restore();
              }
            }
          }
        });

        ctx.restore();
      }
    };
    img.src = imageSrc;
  }, [activeTab, imageSrc, detectedPoints, showPoints, showLengths, sidesInfo, hoveredPointIdx, draggingIdx]);

  // แสดง Toast แจ้งเตือน
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // แปลงพิกัด Client จากเมาส์เป็นพิกัดจริงบน Canvas
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    };
  };

  // ค้นหาจุดยอดที่ใกล้เคอร์เซอร์
  const findPointIndexNear = (coords, radius = 20) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const scale = rect ? (canvas.width / rect.width) : 1;
    const threshold = radius * scale;

    for (let i = 0; i < detectedPoints.length; i++) {
      const p = detectedPoints[i];
      const dist = Math.hypot(p.x - coords.x, p.y - coords.y);
      if (dist <= threshold) return i;
    }
    return -1;
  };

  // ปักหมุด หรือเริ่มลากจุดยอดบน Canvas
  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return; // เฉพาะคลิกซ้าย
    const coords = getCanvasCoords(e);
    const nearIdx = findPointIndexNear(coords);
    if (nearIdx !== -1) {
      setDraggingIdx(nearIdx);
    } else {
      setDetectedPoints(prev => [...prev, coords]);
    }
  };

  // เลื่อนเมาส์บน Canvas (ลากจุด หรือเปลี่ยน Cursor Hover)
  const handleCanvasMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    if (draggingIdx !== null && draggingIdx >= 0) {
      setDetectedPoints(prev => {
        const next = [...prev];
        next[draggingIdx] = coords;
        return next;
      });
    } else {
      const nearIdx = findPointIndexNear(coords);
      setHoveredPointIdx(nearIdx !== -1 ? nearIdx : null);
    }
  };

  // จบการลากจุด
  const handleCanvasMouseUp = () => {
    setDraggingIdx(null);
  };

  // ดับเบิลคลิกเพื่อลบจุดยอด
  const handleCanvasDoubleClick = (e) => {
    const coords = getCanvasCoords(e);
    const nearIdx = findPointIndexNear(coords);
    if (nearIdx !== -1) {
      setDetectedPoints(prev => prev.filter((_, idx) => idx !== nearIdx));
      showToast(`ลบจุดที่ ${nearIdx + 1} แล้ว`);
    }
  };

  // คลิกขวาเพื่อลบจุดที่ชี้ หรือลบจุดล่าสุด
  const handleCanvasContextMenu = (e) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const nearIdx = findPointIndexNear(coords);
    if (nearIdx !== -1) {
      setDetectedPoints(prev => prev.filter((_, idx) => idx !== nearIdx));
      showToast(`ลบจุดที่ ${nearIdx + 1} แล้ว`);
    } else if (detectedPoints.length > 0) {
      setDetectedPoints(prev => prev.slice(0, -1));
      showToast('ลบจุดยอดล่าสุดแล้ว');
    }
  };

  // ฟังก์ชันตรวจจับเส้นสีแดงอัตโนมัติจากภาพ
  const handleAutoDetect = (customCanvas = null) => {
    const canvas = customCanvas || canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    setIsDetecting(true);

    try {
      const ctx = canvas.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const boundary = detectRedBoundary(imgData);

      if (boundary && boundary.length >= 3) {
        setDetectedPoints(boundary);
        showToast(`ตรวจจับเส้นแนวเขตที่ดินสำเร็จ (${boundary.length} จุด) คำนวณระยะด้าน 1:1 เรียบร้อย`);
      } else {
        showToast('ไม่พบเส้นแนวเขตสีแดงที่ชัดเจน กรุณาคลิกปักหมุดจุดยอดตามมุมแปลงได้เลยครับ');
      }
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถสแกนภาพได้ กรุณาคลิกปักหมุดจุดยอดตามมุมแปลง');
    } finally {
      setIsDetecting(false);
    }
  };

  // ย้อนกลับจุดล่าสุด (Undo)
  const handleUndoPoint = () => {
    if (detectedPoints.length > 0) {
      setDetectedPoints(prev => prev.slice(0, -1));
      showToast('ย้อนกลับจุดยอดล่าสุดแล้ว');
    }
  };

  // ล้างจุดทั้งหมด (Clear Points)
  const handleClearPoints = () => {
    setDetectedPoints([]);
    showToast('ล้างจุดยอดแนวเขตออกทั้งหมดแล้ว');
  };

  // โหลดรูปภาพใหม่และตรวจจับอัตโนมัติ
  const loadNewImage = (srcUrl, sourceName = 'ภาพใหม่') => {
    setImageSrc(srcUrl);
    setDetectedPoints([]); // ล้างจุดชุดเก่าออกทันที 100%!
    setActiveTab('dxf');
    showToast(`โหลด${sourceName}เรียบร้อย (ล้างจุดชุดเก่าออกแล้ว)`);

    // รอให้ภาพโหลดเสร็จแล้วลองตรวจจับเส้นสีแดงอัตโนมัติ
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = tempImg.width;
      offscreen.height = tempImg.height;
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(tempImg, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        const boundary = detectRedBoundary(imgData);
        if (boundary && boundary.length >= 3) {
          setDetectedPoints(boundary);
          showToast(`ตรวจจับเส้นแนวเขตที่ดินของ${sourceName}สำเร็จ (${boundary.length} จุด) คำนวณระยะด้าน 1:1 เรียบร้อย!`);
        }
      } catch {
        /* fallback to manual click */
      }
    };
    tempImg.src = srcUrl;
  };

  // ดักจับการกดปุ่ม Ctrl+V (Paste) จากทั่วทั้งหน้าต่าง
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'textarea' || activeTag === 'input') {
        return;
      }
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              loadNewImage(event.target.result, 'ภาพจากคลิปบอร์ด');
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // วางจากคลิปบอร์ด (ปุ่มกด)
  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (e) => {
            loadNewImage(e.target.result, 'ภาพจากคลิปบอร์ด');
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        showToast('วางข้อความจากคลิปบอร์ดแล้ว');
      }
    } catch {
      showToast('กรุณากด Ctrl+V เพื่อวาง');
    }
  };

  // อัปโหลดไฟล์รูปภาพ
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        loadNewImage(event.target.result, 'ภาพอัปโหลด');
      };
      reader.readAsDataURL(file);
    }
  };

  // ดาวน์โหลดไฟล์ DXF
  const handleDownloadDXF = () => {
    if (!detectedPoints || detectedPoints.length < 3) {
      showToast('ไม่พบจุดแนวเขตที่ดินสำหรับสร้างไฟล์ DXF');
      return;
    }

    const deedNumber = parsed.data.chanoed || '17880';
    const label = `โฉนด ${deedNumber} เนื้อที่ ${(targetAreaSqm / 1600).toFixed(2)} ไร่ (${targetAreaSqm.toLocaleString()} ตร.ม.)`;
    const dxfContent = generateDXFString(detectedPoints, scaleFactor, {
      layerName: 'LAND_BOUNDARY',
      deedInfo: label,
      unit: 'Meters'
    });

    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Land_Deed_${deedNumber}_scale1_1.dxf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`ดาวน์โหลดไฟล์ DXF (มาตราส่วน 1:1) สำเร็จ!`);
  };

  // โหลดตัวอย่างข้อมูล
  const handleLoadSample = () => {
    setInputText(`เลขโฉนดที่ดิน
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
จากแปลงที่ดินไปยังสำนักงานที่ดิน`);
    setImageSrc('/sample_land_plot.png');
    setTargetAreaSqm(6519.6);
    setDetectedPoints(SAMPLE_POLYGON_POINTS);
    showToast('โหลดตัวอย่างโฉนด 17880 (หนองคาย) เรียบร้อย');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleImageUpload} 
      />

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
              เครื่องมือแปลงข้อมูลโฉนดที่ดิน & DXF
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-700 font-semibold border border-gold-200">
                AutoCAD 1:1 Ready
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              แปลงข้อความโฉนดให้กระชับ และแปลงภาพเส้นสีแดงของแปลงที่ดินเป็นไฟล์ AutoCAD DXF มาตราส่วน 1:1 ได้ทันที
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSample}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gold-50 border border-gold-200 text-gold-700 hover:bg-gold-100 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} /> โหลดตัวอย่างโฉนด 17880
          </button>
          <a
            href="https://landsmaps.dol.go.th"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-gold-600 hover:border-gold-300 transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
          >
            <Map size={14} /> เปิด LandsMaps <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 shadow-inner max-w-fit">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'text'
              ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText size={16} /> 1. แปลงข้อความโฉนด (Text Formatter)
        </button>

        <button
          onClick={() => setActiveTab('dxf')}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'dxf'
              ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileCode size={16} className={activeTab === 'dxf' ? 'text-gold-400' : ''} /> 
          2. แปลงเส้นสีแดงเป็น DXF (AutoCAD)
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500 text-white font-semibold">New</span>
        </button>
      </div>

      {/* TAB 1: TEXT FORMATTER */}
      {activeTab === 'text' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Structured Summary Cards */}
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ขนาดเนื้อที่จริง</span>
                <span className="text-base font-bold text-emerald-600 mt-0.5 block truncate">
                  {parsed.data.area || '-'}
                </span>
                <span className="text-[11px] text-emerald-700/80 font-medium block">
                  {parsed.areaSqmInfo?.totalSqm ? `≈ ${parsed.areaSqmInfo.totalSqm.toLocaleString()} ตร.ม.` : 'ขนาดแปลงที่ดิน'}
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

          {/* Two Columns: Input vs Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left Box: Input */}
            <div className="glass-card p-5 rounded-2xl flex flex-col h-full border border-slate-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  <label htmlFor="land-raw-input" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    ข้อความต้นทาง (วางข้อความที่นี่)
                  </label>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Clipboard size={12} /> วาง
                  </button>
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> ล้าง
                    </button>
                  )}
                </div>
              </div>

              <textarea
                id="land-raw-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="นำข้อความจาก LandsMaps มาวางที่นี่ได้เลยครับ..."
                className="w-full h-80 lg:h-96 p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs md:text-sm font-mono leading-relaxed text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 outline-none resize-none transition-all custom-scrollbar"
              />

              <div className="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                <span>{inputText.length} ตัวอักษร ({inputText.split('\n').filter(Boolean).length} บรรทัด)</span>
                {inputText && (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> ประมวลผลเรียบร้อย
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
                    ผลลัพธ์ที่แปลงแล้ว (พร้อมนำไปใช้)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  {parsed.hasCoords && (
                    <a
                      href={parsed.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-1 shadow-sm"
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
                  >
                    {copied ? <Check size={14} className="animate-bounce" /> : <Copy size={14} />}
                    {copied ? 'คัดลอกแล้ว!' : 'คัดลอกผลลัพธ์'}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="mb-3 px-3 py-2 rounded-xl bg-slate-100/70 border border-slate-200/60 flex flex-wrap items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={coordsOnNewline}
                    onChange={(e) => setCoordsOnNewline(e.target.checked)}
                    className="w-4 h-4 rounded text-gold-500 focus:ring-gold-400 border-slate-300"
                  />
                  <span>พิกัดขึ้นบรรทัดใหม่</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={includePrice}
                    onChange={(e) => setIncludePrice(e.target.checked)}
                    className="w-4 h-4 rounded text-gold-500 focus:ring-gold-400 border-slate-300"
                  />
                  <span>รวมราคาประเมินที่ดิน (ถ้ามีระบุราคา)</span>
                </label>
              </div>

              <textarea
                id="land-formatted-output"
                readOnly
                value={parsed.text}
                placeholder="ผลลัพธ์ที่แปลงแล้วจะแสดงที่นี่..."
                className="w-full h-80 lg:h-96 p-4 rounded-xl bg-white border border-slate-200 text-xs md:text-sm font-mono leading-relaxed text-slate-900 focus:outline-none resize-none custom-scrollbar shadow-inner"
              />

              <div className="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                <span>
                  {parsed.stats.fieldsFound > 0
                    ? `พบ ${parsed.stats.fieldsFound} ฟิลด์ | รวม ${parsed.stats.outputLinesCount} บรรทัด`
                    : 'รอการวางข้อมูลเพื่อแปลง'}
                </span>
                {parsed.hasCoords && (
                  <span className="text-blue-600 font-mono">📍 {parsed.data.coords}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMAGE TO DXF VECTORIZER */}
      {activeTab === 'dxf' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Control Bar */}
          <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-gold-600 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ImageIcon size={14} /> เลือกรูปภาพ
              </button>
              <button
                onClick={handlePaste}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
                title="กด Ctrl+V หรือคลิกเพื่อวางรูปจากคลิปบอร์ด"
              >
                <Clipboard size={14} /> วางภาพ (Ctrl+V)
              </button>
              <button
                onClick={() => handleAutoDetect()}
                disabled={isDetecting}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                title="สแกนหาเส้นสีแดงของแนวเขตโฉนดที่ดินในรูปภาพอัตโนมัติ"
              >
                <Sparkles size={14} className={isDetecting ? 'animate-spin' : ''} />
                {isDetecting ? 'กำลังตรวจจับ...' : 'ตรวจจับเส้นสีแดงอัตโนมัติ'}
              </button>
              <button
                onClick={handleUndoPoint}
                disabled={detectedPoints.length === 0}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1 ${
                  detectedPoints.length > 0 
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' 
                    : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
                title="ย้อนกลับจุดยอดล่าสุด"
              >
                <Undo2 size={13} /> ย้อนกลับ
              </button>
              <button
                onClick={handleClearPoints}
                disabled={detectedPoints.length === 0}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1 ${
                  detectedPoints.length > 0 
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
                    : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
                title="ล้างจุดยอดทั้งหมดเพื่อเริ่มปักหมุดใหม่"
              >
                <Trash2 size={13} /> ล้างจุด
              </button>
              <button
                onClick={() => {
                  setImageSrc('/sample_land_plot.png');
                  setDetectedPoints(SAMPLE_POLYGON_POINTS);
                  setTargetAreaSqm(6519.6);
                  showToast('รีเซ็ตเป็นตัวอย่างโฉนด 17880');
                }}
                className="px-3 py-2 text-xs font-medium rounded-xl text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                title="โหลดรูปภาพและจุดตัวอย่างโฉนด 17880"
              >
                <RefreshCw size={12} /> รีเซ็ตตัวอย่าง
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">เนื้อที่จริง:</span>
                <input
                  type="number"
                  value={targetAreaSqm}
                  onChange={(e) => setTargetAreaSqm(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-0.5 rounded border border-slate-300 text-right font-bold text-slate-900 outline-none focus:border-gold-500"
                />
                <span className="text-slate-500">ตร.ม.</span>
              </div>

              <button
                onClick={handleDownloadDXF}
                disabled={detectedPoints.length < 3}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-95 ${
                  detectedPoints.length >= 3
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Download size={15} /> ดาวน์โหลดไฟล์ DXF (AutoCAD 1:1)
              </button>
            </div>
          </div>

          {/* DXF Info Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ขนาดเนื้อที่ในโมเดล</span>
              <span className="text-base font-bold text-emerald-600 mt-0.5 block">
                {targetAreaSqm.toLocaleString()} ตร.ม.
              </span>
              <span className="text-[11px] text-slate-500 block">
                {(targetAreaSqm / 1600).toFixed(2)} ไร่ ({((targetAreaSqm % 1600) / 4).toFixed(1)} ตร.ว.)
              </span>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ความยาวรอบรูป (Perimeter)</span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">
                {sidesInfo.totalPerimeter > 0 ? `${sidesInfo.totalPerimeter} ม.` : '-'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {detectedPoints.length >= 3 ? `รวม ${detectedPoints.length} ด้าน` : 'รอปักจุดยอด (อย่างน้อย 3 จุด)'}
              </span>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">มาตราส่วนสเกล (Scale Factor)</span>
              <span className="text-sm font-semibold font-mono text-slate-800 mt-1 block">
                {pixelArea > 0 ? `1 px ≈ ${scaleFactor.toFixed(4)} ม.` : '-'}
              </span>
              <span className="text-[11px] text-slate-400 block">True 1:1 Cad Scale</span>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ความเข้ากันได้ CAD</span>
              <span className="text-xs font-bold text-blue-600 mt-1 block">
                AutoCAD R12 / 2000+
              </span>
              <span className="text-[10px] text-slate-500 block">
                รองรับ SketchUp, Revit, Rhino
              </span>
            </div>
          </div>

          {/* Interactive Canvas Work Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas (2 Columns) */}
            <div className="lg:col-span-2 glass-card p-4 rounded-2xl border border-slate-200 flex flex-col">
              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Eye size={15} className="text-gold-500" />
                    พรีวิวแนวเขตที่ดิน & ปักหมุดมุมแปลง
                  </span>
                  {detectedPoints.length === 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200 flex items-center gap-1">
                      <Crosshair size={10} /> ล้างชุดเก่าแล้ว — คลิกบนภาพเพื่อปักจุดใหม่
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      ปักแล้ว {detectedPoints.length} จุด (คลิกลากเพื่อย้าย)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={showPoints}
                      onChange={(e) => setShowPoints(e.target.checked)}
                      className="rounded text-gold-500"
                    />
                    <span>แสดงจุดยอด</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={showLengths}
                      onChange={(e) => setShowLengths(e.target.checked)}
                      className="rounded text-gold-500"
                    />
                    <span>แสดงระยะความยาว (ม.)</span>
                  </label>
                </div>
              </div>

              <div className="relative w-full overflow-auto bg-slate-950/5 rounded-xl p-2 border border-slate-200 flex items-center justify-center min-h-[420px]">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onDoubleClick={handleCanvasDoubleClick}
                  onContextMenu={handleCanvasContextMenu}
                  style={{
                    cursor: draggingIdx !== null ? 'grabbing' : (hoveredPointIdx !== null ? 'grab' : 'crosshair')
                  }}
                  className="max-w-full h-auto rounded-lg shadow-sm border border-slate-300 select-none"
                  title="คลิกเพื่อปักจุดยอด | คลิกลากเพื่อย้าย | ดับเบิลคลิกหรือคลิกขวาเพื่อลบจุด"
                />
              </div>

              <div className="mt-2 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between gap-1">
                <span>💡 <strong>วิธีใช้งาน:</strong> คลิกบนภาพตามมุมเส้นสีแดงเพื่อปักหมุด | คลิกลากเพื่อปรับตำแหน่งมุม | ดับเบิลคลิกหรือคลิกขวาเพื่อลบจุด</span>
                <span className="text-slate-400">เส้นประสีฟ้า = แนวเขต DXF</span>
              </div>
            </div>

            {/* Side Lengths Table (1 Column) */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    ระยะความยาวแต่ละด้าน (คำนวณจริง 1:1)
                  </h4>
                  {detectedPoints.length >= 3 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ครบ {detectedPoints.length} ด้าน
                    </span>
                  )}
                </div>

                {detectedPoints.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 my-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                      <Crosshair size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-800">ยังไม่ได้ระบุจุดแนวเขตแปลงที่ดิน</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      ระบบได้ล้างจุดชุดเก่าออกแล้วสำหรับรูปใหม่นี้<br />
                      👉 <strong>คลิกบนภาพตามมุมเส้นสีแดง (3 จุดขึ้นไป)</strong> หรือกดปุ่ม <strong>"ตรวจจับเส้นสีแดงอัตโนมัติ"</strong> ด้านบนเพื่อเริ่มคำนวณระยะด้าน 1:1 ทันที
                    </p>
                    <button
                      onClick={() => handleAutoDetect()}
                      className="mt-3.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gold-500 hover:bg-gold-600 text-white shadow-sm transition-all inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={13} /> ตรวจจับเส้นสีแดงอัตโนมัติ
                    </button>
                  </div>
                ) : detectedPoints.length < 3 ? (
                  <div className="text-center py-8 px-4 bg-blue-50/60 rounded-xl border border-dashed border-blue-200 my-4">
                    <p className="text-xs font-bold text-blue-900">กำลังปักหมุด: {detectedPoints.length} จุด</p>
                    <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                      คลิกบนภาพเพิ่มอีก {3 - detectedPoints.length} จุด เพื่อสร้างรูปปิดของแปลงที่ดิน และแสดงระยะความยาวครบทุกด้าน
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100 text-xs">
                    {sidesInfo.sides?.map((side, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center hover:bg-slate-50 px-2 rounded transition-colors">
                        <span className="text-slate-600 font-medium flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {side.from}
                          </span>
                          <span>→</span>
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {side.to}
                          </span>
                        </span>
                        <span className="font-bold font-mono text-slate-900 text-sm">
                          {side.length} เมตร
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 mt-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">ความยาวรอบรูปทั้งหมด:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    {sidesInfo.totalPerimeter > 0 ? `${sidesInfo.totalPerimeter} ม.` : '-'}
                  </span>
                </div>
                <button
                  onClick={handleDownloadDXF}
                  disabled={detectedPoints.length < 3}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                    detectedPoints.length >= 3
                      ? 'bg-slate-900 hover:bg-gold-600 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Download size={15} /> โหลดไฟล์ AutoCAD DXF (.dxf)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => {
                if (window.confirm('ต้องการล้างประวัติทั้งหมดใช่หรือไม่?')) {
                  setHistory([]);
                  showToast('ล้างประวัติเรียบร้อย');
                }
              }}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              ล้างประวัติ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setInputText(item.raw || item.text);
                  setActiveTab('text');
                  showToast(`โหลดข้อมูลโฉนด ${item.chanoed}`);
                }}
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

      {/* Guide Note */}
      <div className="p-4 rounded-xl bg-gold-50/50 border border-gold-200/60 text-xs text-slate-600 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gold-100 text-gold-700 shrink-0 mt-0.5">
          <Layers size={16} />
        </div>
        <div>
          <span className="font-bold text-slate-800 block">เทคนิคการใช้งาน: แปลงภาพเส้นสีแดงเป็น DXF</span>
          <p className="mt-0.5 leading-relaxed text-slate-600">
            เมื่อค้นหาแปลงที่ดินในระบบ LandsMaps แล้ว ให้แคปภาพหน้าจอ (Screenshot) บริเวณแปลงที่ดินที่มีเส้นสีแดง จากนั้นกดปุ่ม <strong>"วางภาพจากคลิปบอร์ด (Ctrl+V)"</strong> ในแท็บ 2 ระบบจะตรวจจับแนวเขตที่ดินและคำนวณระยะความยาวแต่ละด้านในหน่วยเมตรให้ทันที พร้อมกดปุ่ม <strong>"ดาวน์โหลดไฟล์ DXF"</strong> เพื่อนำไปเปิดใน AutoCAD หรือ SketchUp ได้เลยโดยไม่ต้องเสียเวลาดราฟต์ใหม่!
          </p>
        </div>
      </div>

    </div>
  );
}
