import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("units");
  const [plan, setPlan] = useState(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const refresh = () => fetch(API + "/pantry").then(r => r.json()).then(setPantry);
  useEffect(() => {
    refresh();
  }, []);

  async function addItem(e){
    e.preventDefault();
    await fetch(API + "/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity: Number(qty), unit })
    });
    setName(""); setQty(1); setUnit("units");
    refresh();
  }

  async function del(id){
    await fetch(API + "/pantry/" + id, { method: "DELETE" });
    refresh();
  }

  async function planMeal(){
    const res = await fetch(API + "/plan-meal", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({}) });
    const data = await res.json();
    setPlan(data);
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pantry & AI Meal Planner</h1>
        <button className="btn" onClick={() => setDark(d => !d)}>{dark ? "Light" : "Dark"} Mode</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="card">
          <h2 className="text-xl font-semibold mb-3">Pantry</h2>
          <form onSubmit={addItem} className="flex gap-2 mb-4">
            <input className="input flex-1" placeholder="Item name" value={name} onChange={e=>setName(e.target.value)} required />
            <input type="number" step="0.5" className="input w-28" value={qty} onChange={e=>setQty(e.target.value)} />
            <input className="input w-32" placeholder="unit" value={unit} onChange={e=>setUnit(e.target.value)} />
            <button className="btn" type="submit">Add / Update</button>
          </form>

          <ul className="space-y-2">
            {pantry.map(p => (
              <li key={p.id} className="flex justify-between bg-slate-800 rounded-lg p-2">
                <span>{p.name} — {p.quantity} {p.unit}</span>
                <button className="btn" onClick={() => del(p.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-3">AI Meal Suggestions</h2>
          <button className="btn mb-3" onClick={planMeal}>Plan Meal</button>
          {plan && (
            <div className="space-y-2">
              <h3 className="text-lg font-bold">{plan.title}</h3>
              <p className="whitespace-pre-wrap">{plan.body}</p>
              {plan.ingredients?.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Ingredients</h4>
                  <ul className="list-disc ml-6">{plan.ingredients.map((i,idx)=><li key={idx}>{i}</li>)}</ul>
                </div>
              )}
              {plan.missing?.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Shopping List</h4>
                  <ul className="list-disc ml-6">{plan.missing.map((i,idx)=><li key={idx}>{i}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="mt-10 opacity-70">
        Tip: set <code>NEXT_PUBLIC_API_BASE</code> in <code>.env.local</code> if your backend is not on <code>localhost:5000</code>.
      </footer>
    </div>
  );
}
