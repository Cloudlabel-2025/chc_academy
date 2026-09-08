"use client";
import {useEffect,useState} from "react";
import "./roles.css";

export default function RoleManager(){
  const[roles,setRoles]=useState([]),[email,setEmail]=useState(""),[message,setMessage]=useState("");
  async function load(){
    const d=await fetch("/api/roles").then(r=>r.json());
    setRoles(d.roles||[]);
  }
  useEffect(()=>{load()},[]);
  async function add(e){
    e.preventDefault();
    const r=await fetch("/api/roles",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,role:"trainer"})});
    const d=await r.json();
    setMessage(r.ok?`${email} now has Trainer access`:d.error);
    if(r.ok){setEmail("");load()}
  }
  async function remove(x){
    if(!confirm(`Remove Trainer access from ${x}?`))return;
    await fetch(`/api/roles?email=${encodeURIComponent(x)}`,{method:"DELETE"});
    setMessage(`${x} removed`);
    load();
  }
  return (
    <main className="roles-shell">
      <header>
        <a href="/">CHC · ORACLE HCM <span>ROLE ADMINISTRATION</span></a>
        <nav><a href="/trainer-approvals">Trainer requests</a><a href="/trainer">Trainer console</a><a href="/dashboard">Dashboard</a></nav>
      </header>
      <section>
        <div>
          <small>ADMIN ONLY</small>
          <h1>Academy role management</h1>
          <p>You remain the permanent Academy Admin. New trainers now request access and must be approved by you or Stephen Praveen. You can still grant access directly using an exact sign-in email.</p>
        </div>
        <form onSubmit={add}>
          <label>Trainer sign-in email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="trainer@example.com" required/></label>
          <button>Grant Trainer role →</button>
          {message&&<em>{message}</em>}
        </form>
      </section>
      <article className="role-table">
        <div><b>ADMIN</b><span>chcacademy2026@gmail.com</span><small>Permanent academy owner</small><em>Full access</em></div>
        {roles.map(r=>(
          <div key={r.email}>
            <b>{r.role==="approver"?"TRAINER APPROVER":"TRAINER"}</b>
            <span>{r.email}</span>
            <small>Added {new Date(r.grantedAt).toLocaleDateString()}</small>
            <button onClick={()=>remove(r.email)}>Revoke</button>
          </div>
        ))}
        {!roles.length&&<p>No additional trainers have been added.</p>}
      </article>
    </main>
  );
}
