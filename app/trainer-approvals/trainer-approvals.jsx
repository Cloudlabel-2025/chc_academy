"use client";
import {useEffect,useState} from "react";
import "./trainer-approvals.css";

export default function TrainerApprovals({approverName}){
  const[requests,setRequests]=useState([]),[notes,setNotes]=useState({}),[view,setView]=useState("pending"),[message,setMessage]=useState("");
  async function load(){
    const d=await fetch("/api/trainer-requests").then(r=>r.json());
    setRequests(d.requests||[]);
  }
  useEffect(()=>{load()},[]);
  async function decide(email,action){
    const r=await fetch("/api/trainer-requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,action,note:notes[email]||""})});
    setMessage(r.ok?`${email} ${action==="approve"?"approved as Trainer":"rejected"}.`:"The decision could not be saved.");
    if(r.ok)load();
  }
  const visible=requests.filter(r=>view==="all"||r.status===view).sort((a,b)=>b.requestedAt.localeCompare(a.requestedAt));

  return (
    <main className="approval-shell">
      <header>
        <a href="/">CHC · ORACLE HCM <span>TRAINER APPROVALS</span></a>
        <nav><a href="/trainer">Trainer console</a><a href="/dashboard">Dashboard</a></nav>
      </header>
      <section className="approval-head">
        <div>
          <small>AUTHORISED APPROVER · {approverName.toUpperCase()}</small>
          <h1>Trainer access requests</h1>
          <p>Approve only people who should see trainee records, uploaded documents, scores and trainer feedback.</p>
        </div>
        <div><b>{requests.filter(r=>r.status==="pending").length}</b><span>awaiting decision</span></div>
      </section>
      <div className="approval-tabs">
        {["pending","approved","rejected","all"].map(x=><button className={view===x?"active":""} onClick={()=>setView(x)} key={x}>{x}</button>)}
      </div>
      <section className="request-list">
        {visible.map(r=>(
          <article key={r.email}>
            <div className="request-title">
              <span>{r.fullName.split(" ").map(x=>x[0]).slice(0,2).join("")}</span>
              <div><b>{r.fullName}</b><small>{r.email}</small><em>Requested {new Date(r.requestedAt).toLocaleDateString()}</em></div>
              <strong className={r.status}>{r.status}</strong>
            </div>
            <div className="request-reason">
              <small>ACCESS REASON</small>
              <p>{r.reason}</p>
            </div>
            {r.status==="pending"?(
              <>
                <label>Decision note
                  <textarea value={notes[r.email]||""} onChange={e=>setNotes({...notes,[r.email]:e.target.value})} placeholder="Optional approval conditions or rejection reason…"/>
                </label>
                <div className="decision-actions">
                  <button onClick={()=>decide(r.email,"reject")}>Reject</button>
                  <button className="approve" onClick={()=>decide(r.email,"approve")}>Approve Trainer access ✓</button>
                </div>
              </>
            ):(
              <div className="decision-record">
                <b>DECIDED BY</b><span>{r.decidedBy}</span>
                <p>{r.decisionNote||"No decision note."}</p>
              </div>
            )}
          </article>
        ))}
        {!visible.length&&<div className="approval-empty"><b>No {view==="all"?"trainer":view} requests</b><p>New trainer registrations will appear here.</p></div>}
      </section>
      {message&&<aside className="approval-message">{message}</aside>}
    </main>
  );
}
