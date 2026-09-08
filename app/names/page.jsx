import "./names.css";

const people=[
 {name:"Jenny",inspiration:"Jenny von Westphalen",note:"Writer, political thinker and lifelong collaborator in movements for social change.",use:"Core HR and workforce examples"},
 {name:"Clara",inspiration:"Clara Zetkin",note:"Advocate for women’s rights, workers and international solidarity.",use:"Security and responsibility examples"},
 {name:"Rosa",inspiration:"Rosa Luxemburg",note:"Thinker and organiser remembered for equality, democracy and social justice.",use:"Oracle Learn examples"},
 {name:"Savitri",inspiration:"Savitribai Phule",note:"Pioneer of education for girls and oppressed communities in India.",use:"Oracle Recruiting Cloud examples"},
 {name:"Fatima",inspiration:"Fatima Sheikh",note:"Educator who helped open learning to communities excluded from formal education.",use:"Journeys, onboarding and learning administration"},
 {name:"Ramabai",inspiration:"Ramabai Ambedkar",note:"Remembered for resilience and the often-unseen labour sustaining social transformation.",use:"Talent, growth and succession examples"},
 {name:"Bhagat",inspiration:"Bhagat Singh",note:"Revolutionary thinker who wrote about freedom, reason and an equal society.",use:"Goals and performance examples"},
 {name:"Birsa",inspiration:"Birsa Munda",note:"Adivasi leader who resisted exploitation and defended community rights.",use:"Career and leadership examples"},
 {name:"Iyothee",inspiration:"Iyothee Thass",note:"Tamil anti-caste thinker, writer and advocate for dignity and education.",use:"Approvals and governance examples"},
 {name:"Engels",inspiration:"Friedrich Engels",note:"Writer and social theorist concerned with labour, class and material inequality.",use:"Reporting and technical examples"},
 {name:"Che",inspiration:"Che Guevara",note:"A globally recognised revolutionary associated with resistance to inequality.",use:"Selected advanced transformation scenarios"},
 {name:"Ayyankali",inspiration:"Ayyankali",note:"Kerala reformer who fought for education, dignity and workers’ rights.",use:"Workforce and equality-related examples"}
];

export default function NamesPage(){
  return (
    <main className="names-page">
      <header className="names-top">
        <a href="/" className="names-brand"><img src="/chc-logo.png" alt="CHC"/><span><b>CHC · ORACLE HCM</b><small>ACADEMY</small></span></a>
        <a href="/">← Return to academy</a>
      </header>
      <section className="names-hero">
        <small>THE NAMES BEHIND THE ACADEMY</small>
        <h1>Learning with a quiet memory of equality.</h1>
        <p>Some fictional people in our Oracle HCM examples carry first names inspired by thinkers, educators and organisers who challenged exclusion. The references are intentional but understated: the training remains practical, professional and open to everyone.</p>
      </section>
      <section className="names-principles">
        <article>
          <b>Fictional personas</b>
          <p>Every employee, candidate, manager and company situation used in the academy is fictional. The scenarios do not represent events from the historical person’s life.</p>
        </article>
        <article>
          <b>A balanced mix</b>
          <p>We retain familiar contemporary names alongside inspired names. This keeps the cases natural while giving the academy a distinctive CHC voice.</p>
        </article>
        <article>
          <b>Values, not endorsement</b>
          <p>A name acknowledges work toward dignity or equality. It does not require trainees to share every political belief associated with that historical figure.</p>
        </article>
      </section>
      <section className="names-list">
        <header>
          <small>PERSONA BANK</small>
          <h2>Who inspired the names?</h2>
        </header>
        <div>
          {people.map((person,i)=>(
            <article key={person.name}>
              <span>{String(i+1).padStart(2,"0")}</span>
              <div>
                <small>ACADEMY PERSONA</small>
                <h3>{person.name}</h3>
                <b>Inspired by {person.inspiration}</b>
                <p>{person.note}</p>
                <em>{person.use}</em>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer>
        <p>Education should expand both capability and dignity.</p>
        <a href="/">Continue learning →</a>
      </footer>
    </main>
  );
}
