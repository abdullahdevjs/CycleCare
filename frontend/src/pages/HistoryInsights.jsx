import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, CalendarDays, Check, ChevronRight, Clock3, Info,
  Pencil, Trash2, TrendingUp, HeartPulse, X, Activity
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/historyInsights.css";

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function formatDate(value) {
  const date = typeof value === "string" ? parseLocalDate(value) : value;
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function daysBetween(a,b) { return Math.round((b.getTime()-a.getTime())/(1000*60*60*24)); }

function HistoryInsights({ onBack, initialSection = "cycle" }) {
  const [user,setUser]=useState(null), [history,setHistory]=useState([]), [checkins,setCheckins]=useState([]);
  const [loading,setLoading]=useState(true), [error,setError]=useState("");
  const [editing,setEditing]=useState(null), [saving,setSaving]=useState(false), [deleting,setDeleting]=useState(null);
  const [editingCheckin,setEditingCheckin]=useState(null);
  const [section,setSection]=useState(initialSection);

  const loadData = async () => {
    setLoading(true); setError("");
    const {data:{user:currentUser}}=await supabase.auth.getUser();
    if(!currentUser){setLoading(false);return;}
    setUser(currentUser);
    const [historyRes, checkinRes]=await Promise.all([
      supabase.from("cycle_history").select("id, period_start_date, period_end_date, cycle_length, period_length, created_at").eq("user_id",currentUser.id).order("period_start_date",{ascending:false}),
      supabase.from("daily_checkins").select("id, checkin_date, mood, energy, pain, sleep, notes").eq("user_id",currentUser.id).order("checkin_date",{ascending:false}).limit(90)
    ]);
    if(historyRes.error){setError(historyRes.error.message);setHistory([]);} else setHistory(historyRes.data||[]);
    setCheckins(checkinRes.error ? [] : (checkinRes.data||[]));
    setLoading(false);
  };
  useEffect(()=>{loadData();},[]);

  const orderedHistory=useMemo(()=>[...history].sort((a,b)=>parseLocalDate(a.period_start_date)-parseLocalDate(b.period_start_date)),[history]);
  const cycleIntervals=useMemo(()=>orderedHistory.slice(1).map((item,i)=>({id:item.id,days:daysBetween(parseLocalDate(orderedHistory[i].period_start_date),parseLocalDate(item.period_start_date))})).filter(x=>x.days>0&&x.days<100),[orderedHistory]);
  const stats=useMemo(()=>{
    const lengths=cycleIntervals.map(x=>x.days);
    const periods=orderedHistory.map(x=>Number(x.period_length)).filter(x=>x>=1&&x<=10);
    const avg=a=>a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length*10)/10:null;
    const avgCycle=lengths.length>=2?avg(lengths):null, avgPeriod=periods.length>=2?avg(periods):null, min=lengths.length?Math.min(...lengths):null, max=lengths.length?Math.max(...lengths):null;
    const dev=avgCycle&&lengths.length?Math.sqrt(lengths.reduce((s,v)=>s+(v-avgCycle)**2,0)/lengths.length):null;
    const consistency=dev===null?null:Math.max(0,Math.min(100,Math.round(100-(dev/avgCycle)*100)));
    const confidence=lengths.length >= 3 ? (consistency >= 90 ? "High" : consistency >= 75 ? "Moderate" : "Variable") : "Building";
    const uncertaintyDays=lengths.length >= 3 ? Math.max(2,Math.min(4,Math.ceil(dev||2))) : 2;
    return {total:orderedHistory.length,avgCycle,avgPeriod,min,max,consistency,confidence,uncertaintyDays};
  },[orderedHistory,cycleIntervals]);

  const wellness=useMemo(()=>{
    const valid=checkins.filter(x=>[x.energy,x.pain,x.sleep].some(v=>v!==null&&v!==undefined&&v!==""));
    const avg=(arr)=>arr.length?Math.round(arr.reduce((s,v)=>s+v,0)/arr.length*10)/10:null;
    const energy=avg(valid.map(x=>Number(x.energy)).filter(v=>Number.isFinite(v)&&v>=0&&v<=5));
    const pain=avg(valid.map(x=>Number(x.pain)).filter(v=>Number.isFinite(v)&&v>=0&&v<=5));
    const sleep=avg(valid.map(x=>Number(x.sleep)).filter(v=>Number.isFinite(v)&&v>=0&&v<=5));
    const score=energy===null?null:Math.round(((energy+(5-(pain??0))+(sleep??0))/3)*20);
    const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const row=checkins.find(x=>x.checkin_date===dateKey(d));return {date:d,row};});
    const trend=Array.from({length:14},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(13-i));const row=checkins.find(x=>x.checkin_date===dateKey(d));return {date:d,row};});
    return {count:valid.length,energy,pain,sleep,score,last7,trend};
  },[checkins]);

  const openEdit=(item)=>setEditing({...item});
  const saveEdit=async(e)=>{e.preventDefault(); if(!editing||saving)return; setSaving(true);setError("");
    const duplicate=history.find(item=>item.id!==editing.id && item.period_start_date===editing.period_start_date);
    if(duplicate){setError("Another period is already saved on that date. Choose a different date.");setSaving(false);return;}
    if(!editing.period_start_date || editing.period_start_date > dateKey(new Date())){setError("A period start date cannot be in the future.");setSaving(false);return;}
    const periodLength=Number(editing.period_length);
    const cycleLength=Number(editing.cycle_length);
    if(!Number.isInteger(periodLength)||periodLength<1||periodLength>10){setError("Bleeding duration must be between 1 and 10 days.");setSaving(false);return;}
    if(!Number.isInteger(cycleLength)||cycleLength<21||cycleLength>45){setError("Cycle length must be between 21 and 45 days.");setSaving(false);return;}
    const start=parseLocalDate(editing.period_start_date);
    if(!start || Number.isNaN(start.getTime())){setError("Please choose a valid period start date.");setSaving(false);return;}
    const end=new Date(start); end.setDate(end.getDate()+periodLength-1);
    const overlaps=history.some(item=>{
      if(item.id===editing.id) return false;
      const otherStart=parseLocalDate(item?.period_start_date);
      const otherLength=Number(item?.period_length);
      if(!otherStart||!Number.isInteger(otherLength)||otherLength<1) return false;
      const otherEnd=new Date(otherStart); otherEnd.setDate(otherEnd.getDate()+otherLength-1);
      return start<=otherEnd && end>=otherStart;
    });
    if(overlaps){setError("These bleeding dates overlap another saved period. Adjust the start date or duration so each record stays distinct.");setSaving(false);return;}
    const {error}=await supabase.from("cycle_history").update({period_start_date:editing.period_start_date,period_end_date:dateKey(end),cycle_length:cycleLength,period_length:periodLength}).eq("id",editing.id).eq("user_id",user.id);
    if(error){setError(error.message);}
    else {
      const refreshed=[...history.filter(item=>item.id!==editing.id),{...editing,period_start_date:editing.period_start_date,period_length:periodLength,cycle_length:cycleLength}].sort((a,b)=>a.period_start_date.localeCompare(b.period_start_date));
      const latest=refreshed.at(-1);
      if(latest){
        await supabase.from("cycle_profiles").update({last_period_date:latest.period_start_date,cycle_length:Number(latest.cycle_length),period_length:Number(latest.period_length),updated_at:new Date().toISOString()}).eq("user_id",user.id);
      }
      setEditing(null); await loadData();
    }
    setSaving(false);
  };
  const saveCheckin=async(e)=>{
    e.preventDefault();
    if(!editingCheckin||saving||!user?.id)return;
    setSaving(true); setError("");
    const payload={
      mood: editingCheckin.mood || null,
      energy: editingCheckin.energy === "" || editingCheckin.energy === null || editingCheckin.energy === undefined ? null : Number(editingCheckin.energy),
      pain: editingCheckin.pain === "" || editingCheckin.pain === null || editingCheckin.pain === undefined ? null : Number(editingCheckin.pain),
      sleep: editingCheckin.sleep === "" || editingCheckin.sleep === null || editingCheckin.sleep === undefined ? null : Number(editingCheckin.sleep),
      notes: String(editingCheckin.notes||"").trim()||null,
      updated_at:new Date().toISOString()
    };
    const {error}=await supabase.from("daily_checkins").update(payload).eq("id",editingCheckin.id).eq("user_id",user.id);
    if(error){setError(error.message);} else {setEditingCheckin(null); await loadData();}
    setSaving(false);
  };

  const deleteCheckin=async(item)=>{
    if(!item||saving||!user?.id)return;
    if(!window.confirm(`Delete the wellness check-in for ${formatDate(item.checkin_date)}?`)) return;
    setSaving(true); setError("");
    const {error}=await supabase.from("daily_checkins").delete().eq("id",item.id).eq("user_id",user.id);
    if(error)setError(error.message); else await loadData();
    setSaving(false);
  };

  const deletePeriod=async()=>{
    if(!deleting)return; setSaving(true); setError("");
    const wasLatest = history.length && deleting.id === [...history].sort((a,b)=>a.period_start_date.localeCompare(b.period_start_date)).at(-1)?.id;
    const {error}=await supabase.from("cycle_history").delete().eq("id",deleting.id).eq("user_id",user.id);
    if(error){setError(error.message);}
    else {
      if(wasLatest){
        const remaining=[...history].filter(x=>x.id!==deleting.id).sort((a,b)=>a.period_start_date.localeCompare(b.period_start_date));
        const replacement=remaining.at(-1);
        if(replacement){
          await supabase.from("cycle_profiles").update({last_period_date:replacement.period_start_date,cycle_length:Number(replacement.cycle_length),period_length:Number(replacement.period_length),updated_at:new Date().toISOString()}).eq("user_id",user.id);
        } else {
          await supabase.from("cycle_profiles").delete().eq("user_id",user.id);
        }
      }
      setDeleting(null); await loadData();
    }
    setSaving(false);
  };

  if(loading)return <main className="history-page history-page-loading"><div className="history-loading-card"><div className="history-loading-mark">C</div><strong>Loading your history</strong><span>Preparing your personal cycle insights…</span></div></main>;
  return <main className="history-page">
    <header className="history-topbar"><button type="button" className="history-back" onClick={onBack}><ArrowLeft size={18}/><span>Back to dashboard</span></button><div className="history-member"><span>PRIVATE MEMBER AREA</span><strong>{user?.user_metadata?.full_name||user?.email?.split("@")[0]||"CycleCare member"}</strong></div></header>
    <div className="history-shell">
      <section className="history-hero"><div><span className="history-eyebrow">HISTORY & INSIGHTS</span><h1>Your personal cycle pattern.</h1><p>Understand your cycle history and wellness trends in one clear, private view.</p></div><div className="history-hero-icon"><TrendingUp size={25}/></div></section>
      {error&&<div className="history-error"><Info size={16}/>{error}</div>}
      <nav className="history-view-tabs" aria-label="History sections">
        <button type="button" className={section==="cycle"?"active":""} onClick={()=>{setSection("cycle");document.getElementById("period-history")?.scrollIntoView({behavior:"smooth",block:"start"})}}>Cycle history</button>
        <button type="button" className={section==="wellness"?"active":""} onClick={()=>{setSection("wellness");document.getElementById("wellness-library")?.scrollIntoView({behavior:"smooth",block:"start"})}}>Wellness library</button>
        <button type="button" className={section==="insights"?"active":""} onClick={()=>{setSection("insights");document.getElementById("wellness-analytics")?.scrollIntoView({behavior:"smooth",block:"start"})}}>Trends & insights</button>
      </nav>
      <section className="history-stats-grid">
        {[['PERIODS TRACKED',stats.total,'Saved period records'],['AVERAGE CYCLE',stats.avgCycle?`${stats.avgCycle}`:'—',stats.avgCycle?'days':'More data needed'],['AVERAGE PERIOD',stats.avgPeriod?`${stats.avgPeriod}`:'—',stats.avgPeriod?'days':'More data needed'],['PREDICTION RANGE',stats.avgCycle?`±${stats.uncertaintyDays} days`:'—',stats.avgCycle?`${stats.confidence} confidence`:'Needs more cycles']].map(([a,b,c])=><article className="history-stat-card" key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></article>)}
      </section>
      <section className="history-main-grid" id="wellness-analytics">
        <article className="history-panel history-pattern-panel"><div className="history-panel-heading"><div><span className="history-card-label">YOUR RANGE</span><h2>Cycle length pattern</h2></div><Clock3 size={19}/></div>{stats.min&&stats.max?<><div className="history-range"><div><span>SHORTEST</span><strong>{stats.min} days</strong></div><div className="history-range-line"><span style={{width:`${Math.max(8,Math.min(92,45+((stats.max-stats.min)/Math.max(stats.max,1))*35))}%`}}/></div><div><span>LONGEST</span><strong>{stats.max} days</strong></div></div><div className="history-average-box"><CalendarDays size={17}/><div><span>PERSONAL AVERAGE</span><strong>{stats.avgCycle} days</strong></div></div></>:<div className="history-empty-inline"><Info size={18}/><div><strong>Keep tracking to build your range.</strong><p>More saved periods will make your personal range clearer.</p></div></div>}</article>
        <article className="history-panel history-insight-panel"><div className="history-panel-heading"><div><span className="history-card-label">WELLNESS ANALYTICS</span><h2>How you've been feeling</h2></div><HeartPulse size={19}/></div><div className="wellness-analytics-grid"><div><span>AVERAGE ENERGY</span><strong>{wellness.energy??'—'}<small>/5</small></strong></div><div><span>AVERAGE PAIN</span><strong>{wellness.pain??'—'}<small>/5</small></strong></div><div><span>AVERAGE SLEEP</span><strong>{wellness.sleep??'—'}<small>/5</small></strong></div></div><div className="wellness-score-strip"><Activity size={17}/><span>RECENT WELLNESS SIGNAL</span><strong>{wellness.score!==null?`${wellness.score}/100`:'Building'}</strong></div></article>
      </section>
      <section className="history-prediction-banner" aria-label="Period prediction guidance"><div className="history-prediction-icon"><TrendingUp size={18}/></div><div><span className="history-card-label">ESTIMATE, NOT A GUARANTEE</span><h3>Your next period can arrive a little earlier or later.</h3><p>CycleCare uses your saved pattern to estimate a date. Your personal range is currently about ±{stats.uncertaintyDays} days, and every new period you log can make the estimate more useful.</p></div></section>
      <section className="history-panel wellness-trend-panel"><div className="history-panel-heading"><div><span className="history-card-label">LAST 14 DAYS</span><h2>Wellness trends</h2><p className="history-panel-subtitle">See how energy, sleep and pain move over time.</p></div><span className="history-count">{wellness.count} logged</span></div><TrendChart data={wellness.trend}/><div className="trend-legend"><span><i className="trend-dot energy"/>Energy</span><span><i className="trend-dot sleep"/>Sleep</span><span><i className="trend-dot pain"/>Pain</span></div><div className="wellness-bars">{wellness.last7.map(({date,row})=>{const score=row?Math.round(((Number(row.energy||0)+(5-Number(row.pain||0))+Number(row.sleep||0))/3)*20):0;return <div className="wellness-bar-day" key={dateKey(date)}><div className="wellness-bar-track"><span style={{height:`${Math.max(score,4)}%`}}/></div><strong>{date.toLocaleDateString('en-IN',{weekday:'short'}).slice(0,2)}</strong><small>{row?score:'—'}</small></div>})}</div></section>
      <section className="history-panel wellness-history-panel" id="wellness-library"><div className="history-panel-heading"><div><span className="history-card-label">WELLNESS HISTORY</span><h2>Your daily check-ins</h2></div><span className="history-count">{checkins.length} recent</span></div>{checkins.length?<div className="wellness-history-list">{checkins.slice(0,14).map((item)=><div className="wellness-history-row" key={item.id||item.checkin_date}><div className="wellness-history-date"><strong>{formatDate(item.checkin_date)}</strong><span>{item.mood ? item.mood.charAt(0).toUpperCase()+item.mood.slice(1) : "Check-in"}</span></div><div className="wellness-history-metrics"><span>Energy {item.energy??"—"}/5</span><span>Pain {item.pain??"—"}/5</span><span>Sleep {item.sleep??"—"}/5</span></div><div className="wellness-history-note">{item.notes||"No note added"}</div><div className="wellness-history-actions"><button type="button" title="Edit wellness record" onClick={()=>setEditingCheckin({...item})}><Pencil size={14}/></button><button type="button" title="Delete wellness record" onClick={()=>deleteCheckin(item)}><Trash2 size={14}/></button></div></div>)}</div>:<div className="wellness-history-empty"><strong>No wellness check-ins yet</strong><span>Your daily wellness records will appear here as you track.</span></div>}</section>
      <section className="history-panel history-table-panel" id="period-history"><div className="history-panel-heading"><div><span className="history-card-label">PERIOD HISTORY</span><h2>Your saved cycles</h2></div><span className="history-count">{stats.total} records</span></div>{history.length?<div className="history-table"><div className="history-table-head"><span>PERIOD START</span><span>CYCLE LENGTH</span><span>PERIOD LENGTH</span><span>STATUS</span><span>ACTIONS</span></div>{[...history].map((item,index)=><div className="history-table-row" key={item.id}><div><CalendarDays size={16}/><strong>{formatDate(item.period_start_date)}</strong></div><span>{item.cycle_length} days</span><span>{item.period_length} days</span><span className="history-saved-status"><Check size={13}/>Saved</span><div className="history-row-actions"><button title="Edit" onClick={()=>openEdit(item)}><Pencil size={15}/></button><button title="Delete" onClick={()=>setDeleting(item)}><Trash2 size={15}/></button></div>{index===0&&<span className="history-latest-tag">LATEST</span>}</div>)}</div>:<div className="history-empty-state"><CalendarDays size={25}/><h3>No period history yet</h3><p>Your saved periods will appear here after you log them.</p></div>}</section>
      <button type="button" className="history-back-bottom" onClick={onBack}><ArrowLeft size={16}/>Back to dashboard<ChevronRight size={15}/></button>
    </div>
    {editing&&<div className="history-modal-backdrop"><form className="history-edit-modal" onSubmit={saveEdit}><button type="button" className="history-modal-close" onClick={()=>setEditing(null)}><X size={18}/></button><span className="history-card-label">EDIT PERIOD</span><h2>Update this record</h2><label>Actual period start<input type="date" value={editing.period_start_date||''} onChange={e=>setEditing({...editing,period_start_date:e.target.value})} required/></label><label>Bleeding duration (days)<input type="number" min="1" max="10" value={editing.period_length} onChange={e=>setEditing({...editing,period_length:e.target.value})} required/></label><label>Cycle length<input type="number" min="21" max="45" value={editing.cycle_length} onChange={e=>setEditing({...editing,cycle_length:e.target.value})} required/></label><div className="history-modal-actions"><button type="button" onClick={()=>setEditing(null)}>Cancel</button><button type="submit" disabled={saving}>{saving?'Saving…':'Save changes'}</button></div></form></div>}
    {editingCheckin&&<div className="history-modal-backdrop"><form className="history-edit-modal" onSubmit={saveCheckin}><button type="button" className="history-modal-close" onClick={()=>setEditingCheckin(null)}><X size={18}/></button><span className="history-card-label">WELLNESS LIBRARY</span><h2>Update your check-in</h2><p className="history-modal-date">{formatDate(editingCheckin.checkin_date)}</p><label>Mood<select value={editingCheckin.mood||""} onChange={e=>setEditingCheckin({...editingCheckin,mood:e.target.value})}><option value="">Choose mood</option><option value="great">Great</option><option value="good">Good</option><option value="okay">Okay</option><option value="low">Low</option><option value="difficult">Difficult</option></select></label><label>Energy (0–5)<input type="number" min="0" max="5" value={editingCheckin.energy??""} onChange={e=>setEditingCheckin({...editingCheckin,energy:e.target.value})}/></label><label>Pain (0–5)<input type="number" min="0" max="5" value={editingCheckin.pain??""} onChange={e=>setEditingCheckin({...editingCheckin,pain:e.target.value})}/></label><label>Sleep (0–5)<input type="number" min="0" max="5" value={editingCheckin.sleep??""} onChange={e=>setEditingCheckin({...editingCheckin,sleep:e.target.value})}/></label><label>Notes<textarea rows="4" value={editingCheckin.notes||""} onChange={e=>setEditingCheckin({...editingCheckin,notes:e.target.value})}/></label><div className="history-modal-actions"><button type="button" onClick={()=>setEditingCheckin(null)}>Cancel</button><button type="submit" disabled={saving}>{saving?'Saving…':'Save update'}</button></div></form></div>}
    {deleting&&<div className="history-modal-backdrop"><div className="history-edit-modal"><button type="button" className="history-modal-close" onClick={()=>setDeleting(null)}><X size={18}/></button><span className="history-card-label">PERMANENT ACTION</span><h2>Delete this period?</h2><p>This removes the saved period record from your CycleCare history. Your other records stay untouched.</p><div className="history-modal-actions"><button type="button" onClick={()=>setDeleting(null)}>Cancel</button><button type="button" className="history-delete-confirm" onClick={deletePeriod} disabled={saving}>{saving?'Deleting…':'Delete period'}</button></div></div></div>}
  </main>;
}
function TrendChart({data}) {
  const width=760, height=210, padX=36, padY=24;
  const series=(key)=>data.map((item,i)=>{
    const raw=item.row?.[key];
    const value=raw===null||raw===undefined||raw===""?null:Number(raw);
    if(!Number.isFinite(value)) return null;
    const x=padX+(i*(width-padX*2))/Math.max(data.length-1,1);
    const y=height-padY-(Math.max(0,Math.min(5,value))/5)*(height-padY*2);
    return {x,y,value,date:item.date};
  });
  const makePath=(key)=>series(key).filter(Boolean).map(p=>`${p.x},${p.y}`).join(' ');
  const lineDefs=[['energy','Energy'],['sleep','Sleep quality'],['pain','Pain']];
  return <div className="trend-chart" role="img" aria-label="Fourteen day wellness trends for energy, sleep quality and pain">
    <div className="trend-y-axis"><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div>
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <g className="trend-grid">{[0,1,2,3,4,5].map(v=>{const y=height-padY-(v/5)*(height-padY*2);return <line key={v} x1={padX} x2={width-padX} y1={y} y2={y}/>})}</g>
      {lineDefs.map(([key])=><polyline key={key} className={`trend-line ${key}`} points={makePath(key)}/>)}
      {lineDefs.map(([key,label])=>series(key).filter(Boolean).map((p,i)=><circle key={`${key}-${i}`} className={`trend-point ${key}`} cx={p.x} cy={p.y} r="3.5"><title>{`${label}: ${p.value}/5 • ${p.date.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`}</title></circle>))}
    </svg>
    <div className="trend-axis"><span>{data[0]?.date.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span><span>Today</span></div>
  </div>;
}

export default HistoryInsights;
