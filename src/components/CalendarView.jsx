// src/components/CalendarView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle, GripHorizontal } from 'lucide-react';

export default function CalendarView({ jobs, onJobClick, onMoveJob }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dragOverDate, setDragOverDate] = useState(null);
    const [isHoveringNav, setIsHoveringNav] = useState(null);
    const navTimeoutRef = useRef(null); 

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

    const prevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const today = () => setCurrentDate(new Date());

    // --- Drag & Drop Navigation Logic ---
    const handleNavDragEnter = (direction) => {
        setIsHoveringNav(direction);
        if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
        
        navTimeoutRef.current = setTimeout(() => {
            if (direction === 'prev') prevMonth();
            else nextMonth();
        }, 500);
    };

    const handleNavDragLeave = () => {
        setIsHoveringNav(null);
        if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };

    useEffect(() => {
        return () => { if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current); };
    }, []);

    // --- Drag & Drop Job Logic ---
    const handleDragStart = (e, jobId) => {
        e.dataTransfer.setData("jobId", jobId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, dateStr) => {
        e.preventDefault();
        setDragOverDate(dateStr);
    };

    const handleDrop = (e, newDate) => {
        e.preventDefault();
        setDragOverDate(null);
        const jobId = e.dataTransfer.getData("jobId");
        if (jobId && onMoveJob) {
            onMoveJob(jobId, newDate);
        }
    };

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-28 md:h-36 bg-slate-50/50 border border-slate-100"></div>);
    }

    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayJobs = jobs.filter(j => j.deliveryDate === dateStr);
        const isToday = todayDate.getDate() === d && todayDate.getMonth() === currentDate.getMonth() && todayDate.getFullYear() === currentDate.getFullYear();
        
        const isDragOver = dragOverDate === dateStr;

        days.push(
            <div 
                key={d} 
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={() => setDragOverDate(null)}
                onDrop={(e) => handleDrop(e, dateStr)}
                className={`h-28 md:h-36 border border-slate-100 p-1 md:p-2 relative overflow-y-auto custom-scrollbar transition-colors duration-200
                    ${isDragOver ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200 inset-0 z-10' : ''}
                    ${isToday && !isDragOver ? 'bg-[#C5A059]/5' : 'bg-white'}
                `}
            >
                <div className={`text-xs font-bold mb-1 flex justify-between items-center ${isToday ? 'text-[#C5A059]' : 'text-slate-400'}`}>
                    <span>{d} {isToday && <span className="text-[9px] uppercase tracking-wide ml-1">(วันนี้)</span>}</span>
                    {dayJobs.length > 0 && <span className="text-[9px] bg-slate-100 px-1.5 rounded-full text-slate-500">{dayJobs.length}</span>}
                </div>
                
                <div className="space-y-1.5 pb-2">
                    {dayJobs.map(job => {
                        const diffTime = new Date(job.deliveryDate) - todayDate;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        let bgClass = "bg-white border-l-4 border-l-emerald-500 text-slate-700 shadow-sm";
                        let urgencyIcon = null;

                        if (diffDays < 0) {
                             bgClass = "bg-slate-100 border-l-4 border-l-slate-400 text-slate-500 opacity-70"; 
                        } else if (diffDays <= 3) {
                            bgClass = "bg-red-50 border-l-4 border-l-red-500 text-red-700 animate-pulse";
                            urgencyIcon = <AlertCircle size={10} className="inline mr-1" />;
                        } else if (diffDays <= 7) {
                            bgClass = "bg-orange-50 border-l-4 border-l-orange-400 text-orange-700"; 
                        }

                        return (
                            <div 
                                key={job.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, job.id)}
                                onClick={(e) => { e.stopPropagation(); onJobClick(job); }} 
                                className={`text-[9px] md:text-[10px] p-1.5 rounded border border-slate-200 cursor-grab active:cursor-grabbing hover:translate-y-[-2px] transition-all relative group ${bgClass}`}
                            >
                                <div className="font-bold truncate pr-4">{urgencyIcon}{job.client}</div>
                                <div className="text-[8px] opacity-80 truncate">{job.projectType}</div>
                                <GripHorizontal size={12} className="absolute top-1.5 right-1 text-slate-300 opacity-0 group-hover:opacity-100" />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const navBtnProps = (dir) => ({
        onDragEnter: () => handleNavDragEnter(dir),
        onDragLeave: handleNavDragLeave,
        onDragOver: (e) => e.preventDefault(),
        className: `p-2 border rounded transition-all active:scale-95 relative
            ${isHoveringNav === dir ? 'bg-black text-white border-black scale-110' : 'bg-white border-slate-200 hover:bg-black hover:text-white'}
        `
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold uppercase text-slate-800 flex items-center gap-2">
                        <CalendarIcon size={24} className="text-[#C5A059]" />
                        {monthNames[currentDate.getMonth()]} <span className="font-light text-slate-400">{currentDate.getFullYear() + 543}</span>
                    </h2>
                </div>
                <div className="flex gap-2">
                    {/* เพิ่ม onClick กลับมาแล้ว! */}
                    <button 
                        onClick={prevMonth} 
                        {...navBtnProps('prev')} 
                        title="คลิกเพื่อย้อนกลับ หรือลากงานมาจ่อเพื่อเปลี่ยนเดือน"
                    >
                        <ChevronLeft size={16} className="pointer-events-none" />
                    </button>
                    
                    <button onClick={today} className="px-4 py-2 bg-white border border-slate-200 rounded text-xs font-bold uppercase hover:bg-black hover:text-white transition-all">วันนี้</button>
                    
                    {/* เพิ่ม onClick กลับมาแล้ว! */}
                    <button 
                        onClick={nextMonth} 
                        {...navBtnProps('next')} 
                        title="คลิกเพื่อถัดไป หรือลากงานมาจ่อเพื่อเปลี่ยนเดือน"
                    >
                        <ChevronRight size={16} className="pointer-events-none" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, i) => (
                    <div key={day} className={`p-3 text-center text-xs font-bold uppercase ${i === 0 || i === 6 ? 'text-red-400' : 'text-slate-400'}`}>{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 bg-slate-50">{days}</div>
        </div>
    );
}