// src/components/JobModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle2, Clock } from 'lucide-react';

export default function JobModal({ job, teams, projectTypes, serviceTypes, onClose, onSave }) {
  // ตั้งค่าเริ่มต้น
  const [formData, setFormData] = useState({
    id: `J${Math.floor(Math.random() * 100000)}`,
    client: '',
    projectType: projectTypes[0] || '',
    serviceType: serviceTypes[0] || '',
    teamId: teams[0]?.id || '',
    area: '',
    unitPrice: '',
    totalPrice: 0,
    startDate: new Date().toISOString().split('T')[0], // วันเริ่มงาน (Default วันนี้)
    deliveryDate: '', 
    status: 'IN_PROGRESS' // สถานะเริ่มต้น
  });

  useEffect(() => {
    if (job) {
      setFormData({
        ...job,
        startDate: job.startDate || new Date().toISOString().split('T')[0],
        status: job.status || 'IN_PROGRESS'
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };
    
    // คำนวณราคาอัตโนมัติเฉพาะเมื่อแก้พื้นที่ หรือ ราคาต่อหน่วย
    if (name === 'area' || name === 'unitPrice') {
       const area = parseFloat(name === 'area' ? value : formData.area) || 0;
       const price = parseFloat(name === 'unitPrice' ? value : formData.unitPrice) || 0;
       newData.totalPrice = area * price;
    }
    // ถ้าแก้ Total Price เอง ก็จะใช้ค่าที่พิมพ์เข้าไปเลย (ไม่ต้องคำนวณทับ)
    
    setFormData(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // คำนวณไตรมาสอัตโนมัติจากวันส่งงาน
    const d = new Date(formData.deliveryDate || new Date());
    const m = d.getMonth() + 1;
    const q = m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4';
    
    onSave({
        ...formData,
        jobYear: d.getFullYear().toString(),
        quarter: q
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg">{job ? 'แก้ไขงาน (Edit)' : 'สร้างงานใหม่ (New Job)'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* ส่วนเลือกสถานะ (Status) */}
          <div className="p-1 bg-slate-100 rounded-xl flex gap-1">
             <button 
               type="button"
               onClick={() => setFormData({...formData, status: 'IN_PROGRESS'})}
               className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.status !== 'FINISHED' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <Clock size={14}/> กำลังดำเนินการ
             </button>
             <button 
               type="button"
               onClick={() => setFormData({...formData, status: 'FINISHED'})}
               className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.status === 'FINISHED' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <CheckCircle2 size={14}/> เสร็จสิ้นแล้ว
             </button>
          </div>

          {/* ชื่อลูกค้า */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ชื่อลูกค้า (Client)</label>
            <input name="client" required value={formData.client} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="ระบุชื่อลูกค้า..." />
          </div>

          {/* ประเภทงาน */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ประเภท (Type)</label>
                <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                    {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">บริการ (Service)</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                    {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
          </div>

          {/* วันที่ */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
             <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">วันเริ่มสัญญา</label>
                <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white" />
             </div>
             <div>
                <label className="block text-xs font-bold uppercase text-red-500 mb-1">กำหนดส่งงาน</label>
                <input type="date" name="deliveryDate" required value={formData.deliveryDate} onChange={handleChange} className="w-full p-2 border rounded-lg border-red-100 focus:border-red-500 bg-white" />
             </div>
          </div>

          {/* ทีมงาน */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ทีมงาน (Team)</label>
            <select name="teamId" value={formData.teamId} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} (฿{t.ratePerSqm}/ตร.ม.)</option>)}
            </select>
          </div>

          {/* ราคา */}
          <div className="grid grid-cols-3 gap-4">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">พื้นที่ (ตร.ม.)</label>
                <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full p-2 border rounded-lg text-right" placeholder="0" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ราคา/หน่วย</label>
                <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full p-2 border rounded-lg text-right" placeholder="0" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-emerald-600 mb-1">ราคารวม (Total)</label>
                {/* เปลี่ยนเป็น Input เพื่อให้แก้ไขได้ */}
                <input 
                    type="number"
                    name="totalPrice"
                    value={formData.totalPrice}
                    onChange={handleChange}
                    className="w-full p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-right font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                />
            </div>
          </div>
          
          <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4">
            <Save size={18} /> บันทึกข้อมูล (Save)
          </button>
        </form>
      </div>
    </div>
  );
}