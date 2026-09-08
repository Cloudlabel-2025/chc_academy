"use client";
import {useState} from "react";
import "./academy-guide.css";

const routes=[
 {label:"Continue learning",href:"/#classroom",keys:["lesson","learn","course","video","chapter","syllabus","dff","eff","kff","absence","tree","foundation"]},
 {label:"Open the task bank",href:"/#task-bank",keys:["task","practice","assignment","requirement","bank"]},
 {label:"Submit work",href:"/task-workspace",keys:["submit","upload","design","uat","document","hours","score"]},
 {label:"Start a mock interview",href:"/interview",keys:["interview","voice","record","question"]},
 {label:"View my progress",href:"/dashboard",keys:["progress","level","feedback","status","dashboard"]},
 {label:"Open trainer support",href:"/trainer",keys:["trainer","review","approve","help"]},
];

function reply(input){
  const q=input.toLowerCase();
  const route=routes.find(r=>r.keys.some(k=>q.includes(k)));
  return route
    ? {text:`I can take you to the right place: ${route.label}.`,href:route.href,label:route.label}
    : {text:"I’m the Academy navigation guide, so I can help you find lessons, task banks, submissions, progress, interviews or trainer support. For an Oracle configuration answer, use the lesson resources or ask your trainer."};
}

export default function AcademyGuide(){
  const[open,setOpen]=useState(false),
       [input,setInput]=useState(""),
       [messages,setMessages]=useState([{from:"guide",text:"Hello — tell me what you want to find, or choose a shortcut below."}]);

  function send(text=input){
    if(!text.trim())return;
    const r=reply(text);
    setMessages(m=>[...m,{from:"user",text:text.trim()},{from:"guide",...r}]);
    setInput("");
  }

  return (
    <div className="academy-guide">
      <button className="guide-launch" aria-expanded={open} aria-controls="academy-guide-panel" onClick={()=>setOpen(!open)}>
        <span>?</span><b>Academy Guide</b>
      </button>
      {open&&(
        <section id="academy-guide-panel" className="guide-panel" role="dialog" aria-label="Academy navigation guide">
          <header>
            <div><small>CHC ACADEMY GUIDE</small><b>Where would you like to go?</b></div>
            <button aria-label="Close guide" onClick={()=>setOpen(false)}>×</button>
          </header>
          <div className="guide-messages" aria-live="polite">
            {messages.map((m,i)=>(
              <div key={i} className={m.from}>
                <p>{m.text}</p>
                {m.href&&<a href={m.href}>{m.label} →</a>}
              </div>
            ))}
          </div>
          <div className="guide-actions">
            {routes.slice(0,5).map(r=><button key={r.href+r.label} onClick={()=>send(r.label)}>{r.label}</button>)}
          </div>
          <form onSubmit={e=>{e.preventDefault();send()}}>
            <label htmlFor="guide-question">Ask where to find something</label>
            <div>
              <input id="guide-question" value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. Where do I upload UAT?"/>
              <button>Send</button>
            </div>
          </form>
          <footer>Navigation help only · Your trainer approves learning and levels.</footer>
        </section>
      )}
    </div>
  );
}
