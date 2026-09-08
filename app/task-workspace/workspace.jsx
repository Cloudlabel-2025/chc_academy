"use client";
import {useEffect,useState} from "react";
import "./workspace.css";

function mondayOf(date=new Date()){
  const d=new Date(date),day=d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()-day+1);
  return d.toISOString().slice(0,10);
}

const areas=[
  ["Foundations","FND",10],["DFF","DFF",5],["EFF","EFF",5],["KFF","KFF",5],["Approvals","APP",5],["Learning","LRN",10],
  ["Absence","ABS",10],["Checklists","JRN",10],["Workforce Structures","WFS",5],["Department Trees","TREE",5],
  ["OTBI","OTBI",5],["Alert Composer","ALERT",5],["HDL/HSDL","HDL",5],["Fast Formula","FF",5],["Work Schedules","WS",5],
  ["Operations","OPS",5],["Redwood/VBS","RW",5],["BIP/Extracts","BIP",5],["Security/AOR","SEC",5],
  ["Technical HDL","THDL",10],["Technical HCM Extracts","TEXT",10],["API Connections","API",10],["SSO and Identity","SSO",10],
  ["Technical BI Publisher","TBIP",10],["Technical OTBI","TOTBI",10],["Technical Fast Formula","TFF",10],["OIC","OIC",10],
  ["Integration Patterns","PAT",10],["SQL and HCM Data Model","SQL",10],["Files and Security","FILE",10],
  ["Migration and Release","REL",10],["Technical Redwood/VBS","VBS",10],["Payroll Interfaces","PAY",10],
  ["Monitoring and Support","MON",10]
];

export default function TaskWorkspace({signOut}){
 const[area,setArea]=useState("Absence"),[number,setNumber]=useState(1),[progress,setProgress]=useState([]),[docs,setDocs]=useState([]),[logs,setLogs]=useState([]),[weekStart,setWeekStart]=useState(mondayOf()),[designHours,setDesignHours]=useState(0),[configurationHours,setConfigurationHours]=useState(0),[uatHours,setUatHours]=useState(0),[uploading,setUploading]=useState(""),[savingHours,setSavingHours]=useState(false),[message,setMessage]=useState("");
 const selected=areas.find(a=>a[0]===area)||areas[0];
 const taskId=`${selected[1]}-${String(number).padStart(2,"0")}`,record=progress.find(p=>p.itemId===taskId),level=selected[2]===10?Math.ceil(number/2):Math.min(5,number);
 const taskDocs=docs.filter(d=>d.taskId===taskId),total=(record?.requirementScore||0)+(record?.designScore||0)+(record?.uatScore||0)+(record?.evidenceScore||0),weekTotal=designHours+configurationHours+uatHours;

 async function load(){
   const[t,d,h]=await Promise.all([fetch("/api/trainee").then(r=>r.json()),fetch("/api/documents").then(r=>r.json()),fetch("/api/time-logs").then(r=>r.json())]);
   setProgress(t.progress||[]);
   setDocs(d.documents||[]);
   setLogs(h.logs||[]);
 }
 useEffect(()=>{load()},[]);

 useEffect(()=>{
   const x=logs.find(l=>l.taskId===taskId&&l.weekStart===weekStart);
   setDesignHours((x?.designMinutes||0)/60);
   setConfigurationHours((x?.configurationMinutes||0)/60);
   setUatHours((x?.uatMinutes||0)/60);
 },[logs,taskId,weekStart]);

 async function upload(type,file){
   if(!file)return;
   setUploading(type);
   setMessage("");
   const f=new FormData();
   f.set("file",file);
   f.set("taskId",taskId);
   f.set("documentType",type);
   const r=await fetch("/api/documents",{method:"POST",body:f});
   const d=await r.json();
   setUploading("");
   setMessage(r.ok?`${type==="design"?"Design":"UAT"} document uploaded`:d.error);
   if(r.ok)load();
 }

 async function saveHours(){
   setSavingHours(true);
   const r=await fetch("/api/time-logs",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({taskId,area,weekStart,designHours,configurationHours,uatHours})});
   setSavingHours(false);
   setMessage(r.ok?`${weekTotal.toFixed(1)} hours saved for week commencing ${weekStart}`:"Hours could not be saved.");
   if(r.ok)load();
 }

 return (
   <main className="workspace-shell">
     <header>
       <a href="/">CHC · ORACLE HCM <span>TASK WORKSPACE</span></a>
       <nav><a href="/dashboard">Dashboard</a><a href="/interview">Mock interviews</a><a href={signOut}>Sign out</a></nav>
     </header>
     <section className="workspace-head">
       <div>
         <small>SUBMISSION AND SCORECARD</small>
         <h1>Build. Submit. Improve.</h1>
         <p>Keep the design, UAT evidence, weekly effort and trainer score together for every academy task.</p>
       </div>
       <div className="task-picker">
         <label>Area
           <select value={area} onChange={e=>{setArea(e.target.value);setNumber(1)}}>
             {areas.map(a=><option key={a[0]}>{a[0]}</option>)}
           </select>
         </label>
         <label>Task
           <select value={number} onChange={e=>setNumber(Number(e.target.value))}>
             {Array.from({length:selected[2]},(_,i)=><option key={i+1} value={i+1}>{selected[1]}-{String(i+1).padStart(2,"0")}</option>)}
           </select>
         </label>
       </div>
     </section>
     <section className="task-panel">
       <div className="task-title">
         <span>{taskId}</span>
         <div>
           <small>LEVEL {level} · {area.toUpperCase()}</small>
           <h2>{record?.title||`${area} Task ${number}`}</h2>
           <p>{record?.notes||"Start this task in My Training, then return here to record effort and upload your completed documents."}</p>
         </div>
         <em className={record?.status||"not_started"}>{(record?.status||"not started").replace("_"," ")}</em>
       </div>
       <section className="weekly-effort">
         <div>
           <small>WEEKLY EFFORT LOG</small>
           <h3>{weekTotal.toFixed(1)} hours</h3>
           <p>Record actual focused time—not elapsed calendar time.</p>
         </div>
         <label>Week commencing
           <input type="date" value={weekStart} onChange={e=>setWeekStart(e.target.value)}/>
         </label>
         {[["Design document",designHours,setDesignHours],["Configuration / build",configurationHours,setConfigurationHours],["UAT and evidence",uatHours,setUatHours]].map(([label,value,setter])=>(
           <label key={String(label)}>{String(label)}
             <div>
               <input type="number" min="0" max="100" step="0.25" value={Number(value)} onChange={e=>setter(Number(e.target.value))}/>
               <span>hours</span>
             </div>
           </label>
         ))}
         <button onClick={saveHours} disabled={savingHours}>{savingHours?"Saving…":"Save weekly hours →"}</button>
       </section>
       <div className="panel-grid">
         <section className="scoreboard">
           <div>
             <small>TRAINER SCORECARD</small>
             <b>{total}<span>/20</span></b>
           </div>
           {[["Requirement interpretation",record?.requirementScore||0],["Solution design",record?.designScore||0],["UAT coverage",record?.uatScore||0],["Evidence & clarity",record?.evidenceScore||0]].map(([label,score])=>(
             <article key={String(label)}>
               <span>{label}</span>
               <i><em style={{width:`${Number(score)*20}%`}}/></i>
               <b>{score}/5</b>
             </article>
           ))}
           <aside>
             <b>Trainer feedback</b>
             <p>{record?.trainerFeedback||"No trainer feedback yet."}</p>
           </aside>
         </section>
         <section className="uploads">
           <small>MANDATORY DOCUMENTS</small>
           {["design","uat"].map(type=>(
             <article key={type}>
               <div>
                 <b>{type==="design"?"Design Document":"UAT Document"}</b>
                 <p>{type==="design"?"Requirement interpretation, assumptions, solution and configuration design.":"Positive, negative, boundary and end-to-end test scenarios with expected results."}</p>
               </div>
               <label>{uploading===type?"Uploading…":"Upload file"}
                 <input type="file" accept=".pdf,.doc,.docx,.xlsx" disabled={!!uploading} onChange={e=>upload(type,e.target.files?.[0]||null)}/>
               </label>
               {taskDocs.filter(d=>d.documentType===type).map(d=>(
                 <a key={d.id} href={`/api/documents?id=${d.id}`}>
                   <span>{d.fileName}</span>
                   <small>{Math.round(d.sizeBytes/1024)} KB · {new Date(d.uploadedAt).toLocaleDateString()}</small>
                 </a>
               ))}
             </article>
           ))}
           <p className="upload-rule">Accepted: PDF, DOC, DOCX or XLSX · Maximum 12 MB per file.</p>
           {message&&<div className="workspace-message">{message}</div>}
         </section>
       </div>
     </section>
   </main>
 );
}
