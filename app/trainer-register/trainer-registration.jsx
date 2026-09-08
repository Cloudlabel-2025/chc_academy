"use client";
import {useEffect,useState} from "react";
import "./trainer-register.css";

export default function TrainerRegistration({name,email}){
  const[state,setState]=useState(null),[reason,setReason]=useState(""),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
  async function load(){
    const d=await fetch("/api/trainer-requests").then(r=>r.json());
    setState(d.request||null);
  }
  useEffect(()=>{load()},[]);
  async function submit(e){
    e.preventDefault();
    setSaving(true);
    const r=await fetch("/api/trainer-requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"request",reason})});
    setSaving(false);
    setMessage(r.ok?"Your request has been sent for approval.":"The request could not be sent.");
    if(r.ok)load();
  }
  return (
    <main className="trainer-register">
      <header>
        <a href="/">CHC · ORACLE HCM <span>TRAINER REGISTRATION</span></a>
        <a href="/dashboard">Trainee dashboard</a>
      </header>
      <section>
        <div>
          <small>CONTROLLED TRAINER ACCESS</small>
          <h1>Request trainer access</h1>
          <p>Every trainer account must be approved before trainee records, submissions and scores become visible.</p>
          <dl>
            <div><dt>Signed-in name</dt><dd>{name}</dd></div>
            <div><dt>Sign-in email</dt><dd>{email}</dd></div>
          </dl>
        </div>
        <form onSubmit={submit}>
          <label>Why do you need trainer access?
            <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Your role, cohort and the areas you will review…" required/>
          </label>
          <button disabled={saving||state?.status==="pending"}>
            {saving?"Sending…":state?.status==="pending"?"Awaiting approval":"Submit trainer request →"}
          </button>
          {state&&(
            <aside className={state.status}>
              <b>{state.status.toUpperCase()}</b>
              <p>{state.status==="pending"?"An administrator will review this request.":state.decisionNote||"The decision has been recorded."}</p>
            </aside>
          )}
          {message&&<em>{message}</em>}
        </form>
      </section>
    </main>
  );
}
