import { useState, useMemo, useEffect } from "react";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const MONTHS      = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CURRENCIES = [
  { code:"JMD", symbol:"$",  name:"Jamaican Dollar",    flag:"🇯🇲", locale:"en-JM" },
  { code:"USD", symbol:"$",  name:"US Dollar",          flag:"🇺🇸", locale:"en-US" },
  { code:"GBP", symbol:"£",  name:"British Pound",      flag:"🇬🇧", locale:"en-GB" },
  { code:"CAD", symbol:"$",  name:"Canadian Dollar",    flag:"🇨🇦", locale:"en-CA" },
  { code:"EUR", symbol:"€",  name:"Euro",               flag:"🇪🇺", locale:"de-DE" },
  { code:"TTD", symbol:"$",  name:"Trinidad Dollar",    flag:"🇹🇹", locale:"en-TT" },
  { code:"BBD", symbol:"$",  name:"Barbados Dollar",    flag:"🇧🇧", locale:"en-BB" },
  { code:"XCD", symbol:"$",  name:"Eastern Caribbean",  flag:"🌴",  locale:"en-AG" },
  { code:"NGN", symbol:"₦",  name:"Nigerian Naira",     flag:"🇳🇬", locale:"en-NG" },
  { code:"GHS", symbol:"₵",  name:"Ghanaian Cedi",      flag:"🇬🇭", locale:"en-GH" },
  { code:"ZAR", symbol:"R",  name:"South African Rand", flag:"🇿🇦", locale:"en-ZA" },
  { code:"AUD", symbol:"$",  name:"Australian Dollar",  flag:"🇦🇺", locale:"en-AU" },
];

// ── Budget categories (exact from Excel) ──────────────────
const DEFAULT_INCOME = [
  { key:"balance_fwd",  label:"Balance B/F",   fixed:true },
  { key:"salary",       label:"Salary",         fixed:true },
  { key:"business",     label:"Business",       fixed:true },
  { key:"other_income", label:"Other",          fixed:true },
];

const DEFAULT_EXPENSES = [
  { key:"tithes",        label:"Tithes",                  fixed:true },
  { key:"investments",   label:"Investments",             fixed:true },
  { key:"savings",       label:"Savings",                 fixed:true, sub:true },
  { key:"sav_sagicor",   label:"↳ Sagicor",               fixed:true, indent:true },
  { key:"sav_fgb",       label:"↳ FGB",                   fixed:true, indent:true },
  { key:"sav_ncb",       label:"↳ NCB (Savings)",         fixed:true, indent:true },
  { key:"debt_repay",    label:"Debt Repayment",          fixed:true },
  { key:"childcare",     label:"Childcare",               fixed:true },
  { key:"food_grocery",  label:"Food + Groceries",        fixed:true },
  { key:"utilities",     label:"Utilities",               fixed:true },
  { key:"life_insurance",label:"Life/Health Insurance",   fixed:true },
  { key:"home",          label:"Home",                    fixed:true },
  { key:"motor_vehicle", label:"Motor Vehicle",           fixed:true },
  { key:"car_maintenance",label:"Car Maintenance",        fixed:true },
  { key:"fuel",          label:"Fuel",                    fixed:true },
  { key:"insurance",     label:"Insurance",               fixed:true },
  { key:"reg_license",   label:"Registration/License",    fixed:true },
  { key:"accessories",   label:"Accessories",             fixed:true },
  { key:"subscriptions", label:"Subscriptions",           fixed:true },
  { key:"health_wellness",label:"Health and Wellness",    fixed:true },
  { key:"celebrations",  label:"Celebrations",            fixed:true },
  { key:"vacation",      label:"Vacation",                fixed:true },
  { key:"parents",       label:"Parent(s)",               fixed:true },
  { key:"school_fee",    label:"School Fee",              fixed:true },
  { key:"charity",       label:"Charity/Donations",       fixed:true },
  { key:"txn_fees",      label:"Transaction Fees",        fixed:true },
  { key:"personal_spend",label:"Personal Spend",          fixed:true },
];

// ── Net Worth asset/liability structure ───────────────────
const NW_ASSETS = {
  current: [
    { key:"sav_ac1",   label:"Savings A/C #1" },
    { key:"sav_ac2",   label:"Savings A/C #2" },
    { key:"sav_ac3",   label:"Savings A/C #3" },
    { key:"checking",  label:"Checking A/C" },
    { key:"cash",      label:"Cash" },
    { key:"owed_you",  label:"Amounts Owed to You" },
    { key:"cur_other", label:"Other" },
  ],
  securities: [
    { key:"life_ins",  label:"Life Insurance" },
    { key:"stocks",    label:"Stocks, Bonds, Unit Trusts" },
    { key:"sec_other", label:"Other" },
  ],
  real_estate: [
    { key:"family_home", label:"Family Home Estimate" },
    { key:"invest1",     label:"Investment #1" },
    { key:"invest2",     label:"Investment #2" },
    { key:"re_other",    label:"Other" },
  ],
  retirement: [
    { key:"ars",       label:"ARS" },
    { key:"super",     label:"Superannuation Plan" },
    { key:"pension",   label:"Pension" },
    { key:"ret_other", label:"Other Investment" },
  ],
  personal: [
    { key:"motor_v",   label:"Motor Vehicle(s)" },
    { key:"per_other", label:"Other" },
  ],
  other: [
    { key:"biz1",      label:"Business #1" },
    { key:"biz2",      label:"Business #2" },
    { key:"oth_other", label:"Other" },
  ],
};

const NW_LIABILITIES = {
  current: [
    { key:"cc1",       label:"Credit Card #1" },
    { key:"cc2",       label:"Credit Card #2" },
    { key:"cc3",       label:"Credit Card #3" },
    { key:"cc4",       label:"Credit Card #4" },
    { key:"taxes",     label:"Taxes" },
    { key:"furniture", label:"Furniture" },
    { key:"tv",        label:"TV" },
    { key:"store_debt",label:"Store Debt" },
    { key:"cur_other", label:"Other" },
  ],
  long_term: [
    { key:"car1",      label:"Car #1" },
    { key:"car2",      label:"Car #2" },
    { key:"mort1",     label:"Mortgage #1" },
    { key:"mort2",     label:"Mortgage #2" },
    { key:"mort3",     label:"Mortgage #3" },
    { key:"loan1",     label:"Loan #1" },
    { key:"loan2",     label:"Loan #2" },
    { key:"loan3",     label:"Loan #3" },
    { key:"loan4",     label:"Loan #4" },
    { key:"lt_other",  label:"Other" },
  ],
  personal: [
    { key:"pd1",       label:"Personal Debt #1" },
    { key:"pd2",       label:"Personal Debt #2" },
    { key:"pd3",       label:"Personal Debt #3" },
    { key:"pd4",       label:"Personal Debt #4" },
    { key:"pd5",       label:"Personal Debt #5" },
  ],
};

// ── Debt tracker columns ───────────────────────────────────
const DEBT_DEFAULTS = [
  { id:"d1", name:"Credit Card #1",  category:"current",   balance:"", maturity:"", rate:"", monthly:"", priority:"High", reason:"", notes:"" },
  { id:"d2", name:"Credit Card #2",  category:"current",   balance:"", maturity:"", rate:"", monthly:"", priority:"Med",  reason:"", notes:"" },
  { id:"d3", name:"Credit Card #3",  category:"current",   balance:"", maturity:"", rate:"", monthly:"", priority:"Med",  reason:"", notes:"" },
  { id:"d4", name:"Furniture",       category:"current",   balance:"", maturity:"", rate:"", monthly:"", priority:"Med",  reason:"", notes:"" },
  { id:"d5", name:"Store Debt",      category:"current",   balance:"", maturity:"", rate:"", monthly:"", priority:"Med",  reason:"", notes:"" },
  { id:"d6", name:"Loan #1",         category:"long_term", balance:"", maturity:"", rate:"", monthly:"", priority:"Med",  reason:"", notes:"" },
  { id:"d7", name:"Loan #2",         category:"long_term", balance:"", maturity:"", rate:"", monthly:"", priority:"Med",  reason:"", notes:"" },
  { id:"d8", name:"Personal Debt #1",category:"personal",  balance:"", maturity:"", rate:"", monthly:"", priority:"Low",  reason:"", notes:"" },
];

// ── Investment portfolio ───────────────────────────────────
const INV_DEFAULTS = [
  { id:"i1", name:"Equity 1",  type:"Stock",    current:"", purchase:"", notes:"" },
  { id:"i2", name:"Equity 2",  type:"Stock",    current:"", purchase:"", notes:"" },
  { id:"i3", name:"Equity 3",  type:"Stock",    current:"", purchase:"", notes:"" },
  { id:"i4", name:"Life Insurance", type:"Insurance", current:"", purchase:"", notes:"" },
  { id:"i5", name:"CD 1",      type:"CD",       current:"", purchase:"", notes:"" },
];

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const parse  = v => parseFloat(String(v).replace(/,/g,"")) || 0;
const uid    = () => "c_" + Math.random().toString(36).slice(2,8);
const pct    = (a,b) => b ? (((a-b)/b)*100).toFixed(2)+"%" : "—";

function makeFmt(currency) {
  return n => {
    try { return new Intl.NumberFormat(currency.locale,{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0); }
    catch { return (Number(n)||0).toFixed(2); }
  };
}

function initMonthData(incCats,expCats) {
  const income={},expenses={};
  incCats.forEach(c=>{ income[c.key]={budget:"",actual:""}; });
  expCats.forEach(c=>{ expenses[c.key]={budget:"",actual:""}; });
  return {income,expenses};
}

function calcTotals(md,incCats,expCats) {
  let tib=0,tia=0,teb=0,tea=0;
  incCats.forEach(c=>{ tib+=parse(md.income?.[c.key]?.budget||0); tia+=parse(md.income?.[c.key]?.actual||0); });
  expCats.forEach(c=>{ teb+=parse(md.expenses?.[c.key]?.budget||0); tea+=parse(md.expenses?.[c.key]?.actual||0); });
  return {tib,tia,teb,tea,netBudget:tib-teb,netActual:tia-tea};
}

function sumNWSection(data, keys) {
  return keys.reduce((s,k)=>s+parse(data[k]||0), 0);
}

/* ══════════════════════════════════════════════════════════
   PALETTE + BASE STYLES
══════════════════════════════════════════════════════════ */
const C = {
  gold:"#F5C842", bg:"#0c0e14", surface:"#131620", surfaceUp:"#1a1e2e",
  text:"#e8eaf2", textMid:"#8a90a8", textDim:"#4a5068",
  green:"#4ade80", red:"#f87171", blue:"#60a5fa", purple:"#c084fc",
};
const btn = {border:"none",cursor:"pointer",borderRadius:"8px",fontFamily:"inherit",fontWeight:"700",transition:"all 0.15s"};
const monoStyle = {fontFamily:"'Fira Code',monospace"};

/* ══════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════ */
function CellInput({value,onChange,placeholder="0.00",align="right",style={}}) {
  return (
    <input type="text" inputMode="decimal" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}`,color:C.text,fontSize:"0.8rem",padding:"4px 2px",outline:"none",textAlign:align,...monoStyle,...style}}/>
  );
}

function TextInput({value,onChange,placeholder=""}) {
  return (
    <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}`,color:C.text,fontSize:"0.8rem",padding:"4px 2px",outline:"none",fontFamily:"inherit"}}/>
  );
}

function SectionHeader({icon,title,sub}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px",borderBottom:`1px solid ${C.surfaceUp}`,paddingBottom:"8px",marginTop:"20px"}}>
      <span>{icon}</span>
      <span style={{fontSize:"0.62rem",letterSpacing:"0.15em",color:C.gold,textTransform:"uppercase",fontWeight:"800"}}>{title}</span>
      {sub&&<span style={{fontSize:"0.6rem",color:C.textMid}}>· {sub}</span>}
    </div>
  );
}

function TotalRow({label,value,fmt,color=C.gold,indent=false}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderTop:`1px solid ${C.gold}33`,marginTop:"4px",paddingLeft:indent?"12px":"0"}}>
      <span style={{fontSize:"0.78rem",fontWeight:"800",color,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</span>
      <span style={{...monoStyle,fontSize:"0.88rem",fontWeight:"800",color}}>{fmt(value)}</span>
    </div>
  );
}

function AddRowBtn({onClick,label="+ Add Row"}) {
  return (
    <button onClick={onClick} style={{...btn,background:`${C.gold}12`,border:`1px dashed ${C.gold}44`,color:C.gold,padding:"7px 14px",fontSize:"0.7rem",width:"100%",marginTop:"6px",borderRadius:"8px"}}>
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   CURRENCY MODAL
══════════════════════════════════════════════════════════ */
function CurrencyModal({current,onSelect,onClose}) {
  const [search,setSearch]=useState("");
  const list=CURRENCIES.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.code.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:"480px",maxHeight:"78vh",display:"flex",flexDirection:"column",border:`1px solid ${C.gold}22`,borderBottom:"none"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}>
          <div style={{width:"36px",height:"4px",borderRadius:"2px",background:C.textDim}}/>
        </div>
        <div style={{padding:"8px 20px 12px",borderBottom:`1px solid ${C.surfaceUp}`}}>
          <div style={{fontSize:"0.78rem",fontWeight:"800",color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em"}}>Select Currency</div>
          <div style={{fontSize:"0.62rem",color:C.textMid,marginTop:"3px"}}>Defaults to Jamaican Dollar (JMD)</div>
        </div>
        <div style={{padding:"10px 16px 6px"}}>
          <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            style={{width:"100%",background:C.surfaceUp,border:`1px solid ${C.textDim}`,borderRadius:"8px",color:C.text,padding:"9px 12px",fontSize:"0.82rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"4px 12px 20px"}}>
          {list.map(cur=>{
            const active=cur.code===current.code;
            return (
              <button key={cur.code} onClick={()=>{onSelect(cur);onClose();}} style={{...btn,display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"11px 12px",marginBottom:"3px",textAlign:"left",background:active?`${C.gold}22`:"transparent",border:active?`1px solid ${C.gold}55`:"1px solid transparent",borderRadius:"10px"}}>
                <span style={{fontSize:"1.4rem",lineHeight:1,minWidth:"28px",textAlign:"center"}}>{cur.flag}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.83rem",fontWeight:"700",color:active?C.gold:C.text}}>{cur.name}</div>
                  <div style={{fontSize:"0.62rem",color:C.textMid,marginTop:"1px"}}>{cur.code} · {cur.symbol}</div>
                </div>
                {active&&<span style={{color:C.gold}}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODULE 1 — BUDGET
══════════════════════════════════════════════════════════ */
function BudgetModule({year,currency,fmt}) {
  const SK=`tbm_budget_${year}`;
  const load=()=>{try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch{return null;}};

  const [incCats,setIncCats]=useState(()=>load()?.incCats||DEFAULT_INCOME);
  const [expCats,setExpCats]=useState(()=>load()?.expCats||DEFAULT_EXPENSES);
  const [allData,setAllData]=useState(()=>load()?.allData||{});
  const [tab,setTab]=useState(MONTHS[new Date().getMonth()]);
  const [view,setView]=useState("month");

  useEffect(()=>{try{localStorage.setItem(SK,JSON.stringify({incCats,expCats,allData}));}catch{}},[incCats,expCats,allData]);

  const getMonthData=(m)=>allData[m]||initMonthData(incCats,expCats);
  const md=getMonthData(tab);
  const totals=useMemo(()=>calcTotals(md,incCats,expCats),[md,incCats,expCats]);

  const updateCell=(section,key,field,val)=>{
    setAllData(p=>({...p,[tab]:{...(p[tab]||initMonthData(incCats,expCats)),[section]:{...(p[tab]?.[section]||{}),[key]:{...(p[tab]?.[section]?.[key]||{}),[field]:val}}}}));
  };

  const addCat=(section,label)=>{
    const nc={key:uid(),label,fixed:false};
    if(section==="income")setIncCats(p=>[...p,nc]);else setExpCats(p=>[...p,nc]);
  };
  const remCat=(section,key)=>{
    if(section==="income")setIncCats(p=>p.filter(c=>c.key!==key));else setExpCats(p=>p.filter(c=>c.key!==key));
  };

  const thS={fontSize:"0.58rem",color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase",paddingBottom:"7px",textAlign:"right",fontWeight:"600"};

  function BudgetTable({cats,data,section}) {
    return (
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={{...thS,textAlign:"left",width:"38%"}}>Category</th>
            <th style={{...thS,width:"18%"}}>Budget</th>
            <th style={{...thS,width:"18%"}}>Actual</th>
            <th style={{...thS,width:"18%"}}>Variance</th>
            <th style={{width:"8%"}}></th>
          </tr>
        </thead>
        <tbody>
          {cats.map(c=>{
            const b=parse(data?.[c.key]?.budget||0),a=parse(data?.[c.key]?.actual||0);
            const v=section==="expenses"?b-a:a-b, show=b||a;
            return (
              <tr key={c.key} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                <td style={{color:c.indent?C.textMid:C.text,fontSize:c.indent?"0.74rem":"0.8rem",padding:"5px 0",paddingLeft:c.indent?"14px":"0",fontStyle:c.indent?"italic":"normal"}}>{c.label}</td>
                <td><CellInput value={data?.[c.key]?.budget||""} onChange={v=>updateCell(section,c.key,"budget",v)}/></td>
                <td><CellInput value={data?.[c.key]?.actual||""} onChange={v=>updateCell(section,c.key,"actual",v)}/></td>
                <td style={{textAlign:"right",...monoStyle,fontSize:"0.8rem",fontWeight:"600",padding:"5px 2px",color:show?(v>=0?C.green:C.red):C.textDim}}>
                  {show?((v>=0?"+":"")+fmt(v)):"—"}
                </td>
                <td style={{textAlign:"center"}}>
                  {!c.fixed&&<button onClick={()=>remCat(section,c.key)} style={{...btn,background:"transparent",color:C.red,fontSize:"0.7rem",padding:"2px 5px",opacity:0.6}}>✕</button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  // Year summary
  if(view==="year") {
    const rows=MONTHS.map(m=>{const t=calcTotals(getMonthData(m),incCats,expCats);return{month:m,...t};});
    const tot=rows.reduce((a,r)=>({tib:a.tib+r.tib,tia:a.tia+r.tia,teb:a.teb+r.teb,tea:a.tea+r.tea}),{tib:0,tia:0,teb:0,tea:0});
    const th2={fontSize:"0.58rem",color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase",padding:"6px 4px",textAlign:"right",fontWeight:"600"};
    const td2={...monoStyle,fontSize:"0.76rem",color:C.text,textAlign:"right",padding:"6px 4px"};
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <span style={{fontSize:"0.62rem",letterSpacing:"0.15em",color:C.gold,textTransform:"uppercase",fontWeight:"800"}}>📅 Annual Overview · {currency.flag} {currency.code}</span>
          <button onClick={()=>setView("month")} style={{...btn,background:`${C.gold}12`,color:C.gold,padding:"5px 12px",fontSize:"0.7rem"}}>← Monthly</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:"520px"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.gold}33`}}>
                <th style={{...th2,textAlign:"left"}}>Month</th>
                <th style={th2}>Inc.Bgt</th><th style={th2}>Inc.Act</th>
                <th style={th2}>Exp.Bgt</th><th style={th2}>Exp.Act</th>
                <th style={th2}>Deficit/Overage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>{const net=r.tia-r.tea,has=r.tib||r.teb;return(
                <tr key={r.month} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <td style={{...td2,textAlign:"left",color:C.gold,fontWeight:"700"}}>{r.month}</td>
                  {[r.tib,r.tia,r.teb,r.tea].map((v,i)=><td key={i} style={td2}>{has?fmt(v):"—"}</td>)}
                  <td style={{...td2,fontWeight:"700",color:has?(net>=0?C.green:C.red):C.textDim}}>{has?((net>=0?"+":"")+fmt(net)):"—"}</td>
                </tr>
              );})}
              <tr style={{borderTop:`2px solid ${C.gold}44`,background:`${C.gold}0d`}}>
                <td style={{...td2,textAlign:"left",color:C.gold,fontWeight:"800"}}>TOTAL</td>
                {[tot.tib,tot.tia,tot.teb,tot.tea].map((v,i)=><td key={i} style={{...td2,color:C.gold,fontWeight:"700"}}>{fmt(v)}</td>)}
                <td style={{...td2,fontWeight:"800",color:(tot.tia-tot.tea)>=0?C.green:C.red}}>{((tot.tia-tot.tea)>=0?"+":"")+fmt(tot.tia-tot.tea)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Month tabs + annual toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
        <div style={{overflowX:"auto",display:"flex",gap:"4px",flex:1,scrollbarWidth:"none"}}>
          {MONTHS.map(m=>{
            const t=calcTotals(getMonthData(m),incCats,expCats),has=t.tib||t.teb;
            return(
              <button key={m} onClick={()=>setTab(m)} style={{...btn,background:tab===m?C.gold:has?`${C.gold}18`:`${C.gold}08`,border:`1px solid ${tab===m?C.gold:has?C.gold+"33":C.textDim+"22"}`,color:tab===m?C.bg:has?C.gold:C.textMid,borderRadius:"20px",padding:"4px 10px",fontSize:"0.68rem",fontWeight:tab===m?"800":"500",whiteSpace:"nowrap",flexShrink:0}}>
                {m}
              </button>
            );
          })}
        </div>
        <button onClick={()=>setView("year")} style={{...btn,background:`${C.gold}12`,color:C.gold,padding:"4px 10px",fontSize:"0.68rem",marginLeft:"8px",flexShrink:0}}>Annual →</button>
      </div>

      {/* Month heading */}
      <div style={{marginBottom:"14px"}}>
        <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>{FULL_MONTHS[MONTHS.indexOf(tab)]} {year}</div>
        <div style={{fontSize:"0.58rem",color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase"}}>{currency.flag} {currency.name} · {currency.code}</div>
      </div>

      {/* Summary bar */}
      <div style={{background:`linear-gradient(135deg,${C.surfaceUp},${C.surface})`,border:`1px solid ${C.gold}33`,borderRadius:"12px",padding:"14px 16px",marginBottom:"22px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>
          {[
            {label:"Income Budget",val:totals.tib,color:C.gold},
            {label:"Income Actual",val:totals.tia,color:C.gold},
            {label:"Expense Budget",val:totals.teb,color:`${C.red}bb`},
            {label:"Expense Actual",val:totals.tea,color:`${C.red}bb`},
            {label:"Deficit/Overage (Bgt)",val:totals.netBudget,color:totals.netBudget>=0?C.green:C.red},
            {label:"Deficit/Overage (Act)",val:totals.netActual,color:totals.netActual>=0?C.green:C.red},
          ].map(it=>(
            <div key={it.label} style={{textAlign:"center"}}>
              <div style={{fontSize:"0.52rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"3px"}}>{it.label}</div>
              <div style={{...monoStyle,fontSize:"0.82rem",fontWeight:"700",color:it.color}}>{it.val>=0?"":"-"}{currency.symbol}{fmt(Math.abs(it.val))}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Income */}
      <SectionHeader icon="💰" title="Income"/>
      <BudgetTable cats={incCats} data={md.income} section="income"/>
      <AddCatRow onAdd={l=>addCat("income",l)} placeholder="Add income category…"/>

      {/* Expenses */}
      <SectionHeader icon="💸" title="Expenses"/>
      <BudgetTable cats={expCats} data={md.expenses} section="expenses"/>
      <AddCatRow onAdd={l=>addCat("expenses",l)} placeholder="Add expense category…"/>
    </div>
  );
}

function AddCatRow({onAdd,placeholder}) {
  const [label,setLabel]=useState("");
  const submit=()=>{if(!label.trim())return;onAdd(label.trim());setLabel("");};
  return (
    <div style={{display:"flex",gap:"8px",marginBottom:"20px",marginTop:"6px"}}>
      <input value={label} onChange={e=>setLabel(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={placeholder}
        style={{flex:1,background:C.surfaceUp,border:`1px solid ${C.textDim}`,borderRadius:"8px",color:C.text,padding:"7px 12px",fontSize:"0.78rem",fontFamily:"inherit",outline:"none"}}/>
      <button onClick={submit} style={{...btn,background:C.gold,color:C.bg,padding:"7px 12px",fontSize:"0.72rem"}}>+ Add</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODULE 2 — NET WORTH
══════════════════════════════════════════════════════════ */
function NetWorthModule({fmt,currency}) {
  const SK="tbm_networth";
  const load=()=>{try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch{return null;}};
  const [assets,setAssets]=useState(()=>load()?.assets||{});
  const [liabs,setLiabs]=useState(()=>load()?.liabs||{});
  const [lastUpdated,setLastUpdated]=useState(()=>load()?.lastUpdated||"");
  const [notes,setNotes]=useState(()=>load()?.notes||{});

  useEffect(()=>{try{localStorage.setItem(SK,JSON.stringify({assets,liabs,lastUpdated,notes}));}catch{}},[assets,liabs,lastUpdated,notes]);

  const setA=(key,val)=>setAssets(p=>({...p,[key]:val}));
  const setL=(key,val)=>setLiabs(p=>({...p,[key]:val}));
  const setN=(key,val)=>setNotes(p=>({...p,[key]:val}));

  // Totals
  const totalCurrentAssets  = sumNWSection(assets, NW_ASSETS.current.map(x=>x.key));
  const totalSecurities     = sumNWSection(assets, NW_ASSETS.securities.map(x=>x.key));
  const totalRealEstate     = sumNWSection(assets, NW_ASSETS.real_estate.map(x=>x.key));
  const totalRetirement     = sumNWSection(assets, NW_ASSETS.retirement.map(x=>x.key));
  const totalPersonalAssets = sumNWSection(assets, NW_ASSETS.personal.map(x=>x.key));
  const totalOtherAssets    = sumNWSection(assets, NW_ASSETS.other.map(x=>x.key));
  const totalAssets = totalCurrentAssets+totalSecurities+totalRealEstate+totalRetirement+totalPersonalAssets+totalOtherAssets;

  const totalCurrentLiabs   = sumNWSection(liabs, NW_LIABILITIES.current.map(x=>x.key));
  const totalLongTermLiabs  = sumNWSection(liabs, NW_LIABILITIES.long_term.map(x=>x.key));
  const totalPersonalLiabs  = sumNWSection(liabs, NW_LIABILITIES.personal.map(x=>x.key));
  const totalLiabilities = totalCurrentLiabs+totalLongTermLiabs+totalPersonalLiabs;

  const netWorth = totalAssets - totalLiabilities;

  function NWRow({item,value,onChange,noteVal,onNote}) {
    return (
      <tr style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
        <td style={{color:C.text,fontSize:"0.8rem",padding:"5px 0",width:"40%"}}>{item.label}</td>
        <td style={{width:"28%"}}><CellInput value={value} onChange={onChange}/></td>
        <td style={{width:"32%",paddingLeft:"8px"}}>
          <input value={noteVal||""} onChange={e=>onNote(e.target.value)} placeholder="Comments…"
            style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}44`,color:C.textMid,fontSize:"0.72rem",padding:"4px 2px",outline:"none",fontFamily:"inherit"}}/>
        </td>
      </tr>
    );
  }

  function NWSection({title,items,data,onChange,noteData,onNote,total,totalLabel}) {
    return (
      <div style={{marginBottom:"8px"}}>
        <div style={{fontSize:"0.6rem",color:C.textMid,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:"700",padding:"8px 0 4px"}}>{title}</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={{fontSize:"0.56rem",color:C.textDim,textTransform:"uppercase",letterSpacing:"0.1em",paddingBottom:"5px",textAlign:"left",width:"40%"}}>Item</th>
              <th style={{fontSize:"0.56rem",color:C.textDim,textTransform:"uppercase",letterSpacing:"0.1em",paddingBottom:"5px",textAlign:"right",width:"28%"}}>Amount</th>
              <th style={{fontSize:"0.56rem",color:C.textDim,textTransform:"uppercase",letterSpacing:"0.1em",paddingBottom:"5px",textAlign:"left",width:"32%",paddingLeft:"8px"}}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item=>(
              <NWRow key={item.key} item={item} value={data[item.key]||""} onChange={v=>onChange(item.key,v)} noteVal={noteData?.[item.key]} onNote={v=>onNote(item.key,v)}/>
            ))}
          </tbody>
        </table>
        <TotalRow label={totalLabel} value={total} fmt={fmt}/>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
        <div>
          <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>Net Worth Statement</div>
          <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>{currency.flag} {currency.code}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:"0.58rem",color:C.textMid,marginBottom:"3px"}}>Last Updated</div>
          <input type="date" value={lastUpdated} onChange={e=>setLastUpdated(e.target.value)}
            style={{background:C.surfaceUp,border:`1px solid ${C.textDim}`,borderRadius:"6px",color:C.text,padding:"4px 8px",fontSize:"0.72rem",fontFamily:"inherit",outline:"none"}}/>
        </div>
      </div>

      {/* Net Worth hero */}
      <div style={{background:netWorth>=0?`linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.05))`:`linear-gradient(135deg,rgba(248,113,113,0.15),rgba(248,113,113,0.05))`,border:`1px solid ${netWorth>=0?C.green:C.red}44`,borderRadius:"14px",padding:"18px 20px",marginBottom:"20px",textAlign:"center"}}>
        <div style={{fontSize:"0.6rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:"6px"}}>NET WORTH</div>
        <div style={{...monoStyle,fontSize:"1.8rem",fontWeight:"800",color:netWorth>=0?C.green:C.red}}>
          {netWorth>=0?"":"-"}{currency.symbol}{fmt(Math.abs(netWorth))}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:"28px",marginTop:"10px"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"0.55rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>Total Assets</div>
            <div style={{...monoStyle,fontSize:"0.9rem",fontWeight:"700",color:C.green}}>{currency.symbol}{fmt(totalAssets)}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"0.55rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>Total Liabilities</div>
            <div style={{...monoStyle,fontSize:"0.9rem",fontWeight:"700",color:C.red}}>{currency.symbol}{fmt(totalLiabilities)}</div>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        {/* ASSETS */}
        <div style={{background:C.surface,borderRadius:"12px",padding:"14px 16px",border:`1px solid ${C.green}22`}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",color:C.green,textTransform:"uppercase",fontWeight:"800",marginBottom:"12px"}}>📈 ASSETS</div>
          <NWSection title="Current Assets" items={NW_ASSETS.current} data={assets} onChange={setA} noteData={notes} onNote={setN} total={totalCurrentAssets} totalLabel="Total Current"/>
          <NWSection title="Securities" items={NW_ASSETS.securities} data={assets} onChange={setA} noteData={notes} onNote={setN} total={totalSecurities} totalLabel="Total Securities"/>
          <NWSection title="Real Estate" items={NW_ASSETS.real_estate} data={assets} onChange={setA} noteData={notes} onNote={setN} total={totalRealEstate} totalLabel="Total Real Estate"/>
          <NWSection title="Retirement" items={NW_ASSETS.retirement} data={assets} onChange={setA} noteData={notes} onNote={setN} total={totalRetirement} totalLabel="Total Retirement"/>
          <NWSection title="Personal" items={NW_ASSETS.personal} data={assets} onChange={setA} noteData={notes} onNote={setN} total={totalPersonalAssets} totalLabel="Total Personal"/>
          <NWSection title="Other" items={NW_ASSETS.other} data={assets} onChange={setA} noteData={notes} onNote={setN} total={totalOtherAssets} totalLabel="Total Other"/>
          <TotalRow label="TOTAL ASSETS" value={totalAssets} fmt={fmt} color={C.green}/>
        </div>

        {/* LIABILITIES */}
        <div style={{background:C.surface,borderRadius:"12px",padding:"14px 16px",border:`1px solid ${C.red}22`}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",color:C.red,textTransform:"uppercase",fontWeight:"800",marginBottom:"12px"}}>📉 LIABILITIES</div>
          <NWSection title="Current Liabilities" items={NW_LIABILITIES.current} data={liabs} onChange={setL} noteData={notes} onNote={setN} total={totalCurrentLiabs} totalLabel="Total Current"/>
          <NWSection title="Long-Term Liabilities" items={NW_LIABILITIES.long_term} data={liabs} onChange={setL} noteData={notes} onNote={setN} total={totalLongTermLiabs} totalLabel="Total Long-Term"/>
          <NWSection title="Personal Debt" items={NW_LIABILITIES.personal} data={liabs} onChange={setL} noteData={notes} onNote={setN} total={totalPersonalLiabs} totalLabel="Total Personal"/>
          <TotalRow label="TOTAL LIABILITIES" value={totalLiabilities} fmt={fmt} color={C.red}/>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODULE 3 — DEBT TRACKER
══════════════════════════════════════════════════════════ */
const PRIORITIES = ["High","Med","Low"];
const PRIORITY_COLORS = {High:C.red, Med:C.gold, Low:C.green};
const PRIORITY_DESC = {
  High:"High interest and/or long duration — bad debt funding a liability",
  Med:"Average interest and duration — may be good or bad debt",
  Low:"Low interest — good debt funding an asset",
};

function DebtModule({fmt,currency}) {
  const SK="tbm_debt";
  const load=()=>{try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch{return null;}};
  const [debts,setDebts]=useState(()=>load()||DEBT_DEFAULTS);
  useEffect(()=>{try{localStorage.setItem(SK,JSON.stringify(debts));}catch{}},[debts]);

  const upd=(id,field,val)=>setDebts(p=>p.map(d=>d.id===id?{...d,[field]:val}:d));
  const addDebt=()=>setDebts(p=>[...p,{id:uid(),name:"New Debt",category:"current",balance:"",maturity:"",rate:"",monthly:"",priority:"Med",reason:"",notes:""}]);
  const remDebt=id=>setDebts(p=>p.filter(d=>d.id!==id));

  const totalBalance  = debts.reduce((s,d)=>s+parse(d.balance),0);
  const totalMonthly  = debts.reduce((s,d)=>s+parse(d.monthly),0);
  const byPriority    = PRIORITIES.map(p=>({p, debts:debts.filter(d=>d.priority===p)}));

  const inputS={background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}`,color:C.text,padding:"3px 2px",outline:"none",width:"100%",fontSize:"0.76rem"};

  return (
    <div>
      <div style={{marginBottom:"16px"}}>
        <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>Debt Tracker</div>
        <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>{currency.flag} {currency.code}</div>
      </div>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"20px"}}>
        {[
          {label:"Total Debt",val:totalBalance,color:C.red},
          {label:"Monthly Payments",val:totalMonthly,color:C.gold},
          {label:"Debts Tracked",val:debts.length,color:C.blue,isCount:true},
        ].map(it=>(
          <div key={it.label} style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",border:`1px solid ${it.color}22`,textAlign:"center"}}>
            <div style={{fontSize:"0.55rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>{it.label}</div>
            <div style={{...monoStyle,fontSize:"0.9rem",fontWeight:"700",color:it.color}}>
              {it.isCount?it.val:`${currency.symbol}${fmt(it.val)}`}
            </div>
          </div>
        ))}
      </div>

      {/* Priority Legend */}
      <div style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",marginBottom:"20px",border:`1px solid ${C.textDim}22`}}>
        <div style={{fontSize:"0.6rem",color:C.gold,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:"800",marginBottom:"8px"}}>Priority Guide</div>
        {PRIORITIES.map(p=>(
          <div key={p} style={{display:"flex",alignItems:"flex-start",gap:"8px",marginBottom:"4px"}}>
            <span style={{...monoStyle,fontSize:"0.7rem",fontWeight:"800",color:PRIORITY_COLORS[p],minWidth:"32px"}}>{p}</span>
            <span style={{fontSize:"0.7rem",color:C.textMid}}>{PRIORITY_DESC[p]}</span>
          </div>
        ))}
      </div>

      {/* Debt rows by priority */}
      {byPriority.map(({p,debts:pDebts})=> pDebts.length===0 ? null : (
        <div key={p} style={{marginBottom:"20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",borderBottom:`1px solid ${PRIORITY_COLORS[p]}33`,paddingBottom:"6px"}}>
            <span style={{width:"10px",height:"10px",borderRadius:"50%",background:PRIORITY_COLORS[p],display:"inline-block"}}/>
            <span style={{fontSize:"0.62rem",color:PRIORITY_COLORS[p],textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:"800"}}>{p} Priority</span>
          </div>
          {pDebts.map(d=>(
            <div key={d.id} style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",marginBottom:"8px",border:`1px solid ${PRIORITY_COLORS[d.priority]}22`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                <input value={d.name} onChange={e=>upd(d.id,"name",e.target.value)} style={{...inputS,fontSize:"0.86rem",fontWeight:"700",flex:1}}/>
                <div style={{display:"flex",gap:"6px",marginLeft:"8px"}}>
                  {PRIORITIES.map(pr=>(
                    <button key={pr} onClick={()=>upd(d.id,"priority",pr)} style={{...btn,background:d.priority===pr?PRIORITY_COLORS[pr]:`${PRIORITY_COLORS[pr]}18`,color:d.priority===pr?C.bg:PRIORITY_COLORS[pr],padding:"3px 8px",fontSize:"0.62rem",borderRadius:"6px"}}>
                      {pr}
                    </button>
                  ))}
                  <button onClick={()=>remDebt(d.id)} style={{...btn,background:"transparent",color:C.red,fontSize:"0.7rem",padding:"2px 5px",opacity:0.6}}>✕</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"10px",marginBottom:"8px"}}>
                {[
                  {field:"balance",label:`Balance (${currency.code})`,mono:true},
                  {field:"maturity",label:"Maturity/Due Date",mono:false},
                  {field:"rate",label:"Interest Rate %",mono:true},
                  {field:"monthly",label:`Monthly Payment`,mono:true},
                ].map(f=>(
                  <div key={f.field}>
                    <div style={{fontSize:"0.56rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px"}}>{f.label}</div>
                    <input value={d[f.field]} onChange={e=>upd(d.id,f.field,e.target.value)} placeholder={f.mono?"0.00":"mm/yyyy"}
                      style={{...inputS,fontFamily:f.mono?"'Fira Code',monospace":"inherit"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                <div>
                  <div style={{fontSize:"0.56rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px"}}>Reason for Debt</div>
                  <input value={d.reason} onChange={e=>upd(d.id,"reason",e.target.value)} placeholder="e.g. Purchase car…" style={{...inputS}}/>
                </div>
                <div>
                  <div style={{fontSize:"0.56rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px"}}>Special Loan Terms / Notes</div>
                  <input value={d.notes} onChange={e=>upd(d.id,"notes",e.target.value)} placeholder="Notes…" style={{...inputS}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <AddRowBtn onClick={addDebt} label="+ Add Debt"/>

      {/* Totals */}
      <div style={{background:C.surface,borderRadius:"10px",padding:"14px 16px",marginTop:"16px",border:`1px solid ${C.gold}22`}}>
        <div style={{fontSize:"0.6rem",color:C.gold,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:"800",marginBottom:"10px"}}>Summary</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={{fontSize:"0.58rem",color:C.textMid,textAlign:"left",paddingBottom:"6px",textTransform:"uppercase",letterSpacing:"0.1em"}}>Priority</th>
              <th style={{fontSize:"0.58rem",color:C.textMid,textAlign:"right",paddingBottom:"6px",textTransform:"uppercase",letterSpacing:"0.1em"}}>Balance</th>
              <th style={{fontSize:"0.58rem",color:C.textMid,textAlign:"right",paddingBottom:"6px",textTransform:"uppercase",letterSpacing:"0.1em"}}>Monthly</th>
              <th style={{fontSize:"0.58rem",color:C.textMid,textAlign:"right",paddingBottom:"6px",textTransform:"uppercase",letterSpacing:"0.1em"}}># Debts</th>
            </tr>
          </thead>
          <tbody>
            {byPriority.map(({p,debts:pd})=>(
              <tr key={p} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <td style={{padding:"5px 0",fontSize:"0.8rem",fontWeight:"700",color:PRIORITY_COLORS[p]}}>{p}</td>
                <td style={{...monoStyle,textAlign:"right",fontSize:"0.8rem",color:C.text,padding:"5px 0"}}>{fmt(pd.reduce((s,d)=>s+parse(d.balance),0))}</td>
                <td style={{...monoStyle,textAlign:"right",fontSize:"0.8rem",color:C.text,padding:"5px 0"}}>{fmt(pd.reduce((s,d)=>s+parse(d.monthly),0))}</td>
                <td style={{...monoStyle,textAlign:"right",fontSize:"0.8rem",color:C.textMid,padding:"5px 0"}}>{pd.length}</td>
              </tr>
            ))}
            <tr style={{borderTop:`1px solid ${C.gold}33`}}>
              <td style={{padding:"6px 0",fontSize:"0.8rem",fontWeight:"800",color:C.gold}}>TOTAL</td>
              <td style={{...monoStyle,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",color:C.red,padding:"6px 0"}}>{fmt(totalBalance)}</td>
              <td style={{...monoStyle,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",color:C.gold,padding:"6px 0"}}>{fmt(totalMonthly)}</td>
              <td style={{...monoStyle,textAlign:"right",fontSize:"0.8rem",fontWeight:"700",color:C.textMid,padding:"6px 0"}}>{debts.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODULE 4 — INVESTMENT PORTFOLIO
══════════════════════════════════════════════════════════ */
const INV_TYPES = ["Stock","Unit Trust","Bond","CD","Life Insurance","Real Estate","Other"];

function InvestmentModule({fmt,currency}) {
  const SK="tbm_investments";
  const load=()=>{try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch{return null;}};
  const [investments,setInvestments]=useState(()=>load()||INV_DEFAULTS);
  useEffect(()=>{try{localStorage.setItem(SK,JSON.stringify(investments));}catch{}},[investments]);

  const upd=(id,f,v)=>setInvestments(p=>p.map(i=>i.id===id?{...i,[f]:v}:i));
  const add=()=>setInvestments(p=>[...p,{id:uid(),name:"New Investment",type:"Stock",current:"",purchase:"",notes:""}]);
  const rem=id=>setInvestments(p=>p.filter(i=>i.id!==id));

  const totalCurrent  = investments.reduce((s,i)=>s+parse(i.current),0);
  const totalPurchase = investments.reduce((s,i)=>s+parse(i.purchase),0);
  const totalGainLoss = totalCurrent - totalPurchase;
  const totalPctChange = totalPurchase ? ((totalGainLoss/totalPurchase)*100).toFixed(2) : null;

  const inputS={background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}`,color:C.text,padding:"3px 2px",outline:"none",fontSize:"0.76rem",width:"100%"};

  return (
    <div>
      <div style={{marginBottom:"16px"}}>
        <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>Investment Portfolio</div>
        <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>{currency.flag} {currency.code}</div>
      </div>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"10px",marginBottom:"20px"}}>
        {[
          {label:"Current Value",val:totalCurrent,color:C.gold},
          {label:"Purchase Price",val:totalPurchase,color:C.textMid},
          {label:"Gain / Loss",val:totalGainLoss,color:totalGainLoss>=0?C.green:C.red},
          {label:"% Change",val:totalPctChange,color:totalGainLoss>=0?C.green:C.red,isPct:true},
        ].map(it=>(
          <div key={it.label} style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",border:`1px solid ${it.color}22`,textAlign:"center"}}>
            <div style={{fontSize:"0.52rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>{it.label}</div>
            <div style={{...monoStyle,fontSize:"0.85rem",fontWeight:"700",color:it.color}}>
              {it.isPct ? (it.val?`${it.val>0?"+":""}${it.val}%`:"—") : `${it.val>=0?"":"-"}${currency.symbol}${fmt(Math.abs(it.val))}`}
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio table */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:"600px"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.gold}33`}}>
              {["Name","Type","Current Value","Purchase Price","% Change","Notes",""].map((h,i)=>(
                <th key={i} style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em",padding:"6px 4px",textAlign:i>1&&i<5?"right":"left",fontWeight:"600"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {investments.map(inv=>{
              const cur=parse(inv.current),pur=parse(inv.purchase);
              const gl=cur-pur, pctChange=pur?((gl/pur)*100).toFixed(2):null;
              return (
                <tr key={inv.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <td style={{padding:"6px 4px",width:"22%"}}>
                    <input value={inv.name} onChange={e=>upd(inv.id,"name",e.target.value)} style={{...inputS,fontWeight:"600"}}/>
                  </td>
                  <td style={{padding:"6px 4px",width:"14%"}}>
                    <select value={inv.type} onChange={e=>upd(inv.id,"type",e.target.value)}
                      style={{background:C.surfaceUp,border:"none",borderBottom:`1px solid ${C.textDim}`,color:C.text,padding:"3px 2px",fontSize:"0.74rem",outline:"none",width:"100%",fontFamily:"inherit"}}>
                      {INV_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"6px 4px",width:"16%"}}>
                    <input value={inv.current} onChange={e=>upd(inv.id,"current",e.target.value)} placeholder="0.00"
                      style={{...inputS,...monoStyle,textAlign:"right"}}/>
                  </td>
                  <td style={{padding:"6px 4px",width:"16%"}}>
                    <input value={inv.purchase} onChange={e=>upd(inv.id,"purchase",e.target.value)} placeholder="0.00"
                      style={{...inputS,...monoStyle,textAlign:"right"}}/>
                  </td>
                  <td style={{...monoStyle,textAlign:"right",fontSize:"0.8rem",fontWeight:"600",padding:"6px 4px",color:(cur||pur)?(gl>=0?C.green:C.red):C.textDim}}>
                    {pctChange?`${parseFloat(pctChange)>0?"+":""}${pctChange}%`:"—"}
                  </td>
                  <td style={{padding:"6px 4px",width:"20%"}}>
                    <input value={inv.notes} onChange={e=>upd(inv.id,"notes",e.target.value)} placeholder="Notes…"
                      style={{...inputS,color:C.textMid,fontSize:"0.72rem"}}/>
                  </td>
                  <td style={{textAlign:"center",padding:"6px 4px"}}>
                    <button onClick={()=>rem(inv.id)} style={{...btn,background:"transparent",color:C.red,fontSize:"0.7rem",padding:"2px 5px",opacity:0.6}}>✕</button>
                  </td>
                </tr>
              );
            })}
            {/* Totals row */}
            <tr style={{borderTop:`2px solid ${C.gold}44`,background:`${C.gold}0d`}}>
              <td colSpan={2} style={{padding:"7px 4px",fontSize:"0.78rem",fontWeight:"800",color:C.gold,textTransform:"uppercase",letterSpacing:"0.06em"}}>TOTAL</td>
              <td style={{...monoStyle,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",color:C.gold,padding:"7px 4px"}}>{fmt(totalCurrent)}</td>
              <td style={{...monoStyle,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",color:C.gold,padding:"7px 4px"}}>{fmt(totalPurchase)}</td>
              <td style={{...monoStyle,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",padding:"7px 4px",color:totalGainLoss>=0?C.green:C.red}}>
                {totalPctChange?`${parseFloat(totalPctChange)>0?"+":""}${totalPctChange}%`:"—"}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
      <AddRowBtn onClick={add} label="+ Add Investment"/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODULE 5 — VEHICLE COST OF OWNERSHIP
══════════════════════════════════════════════════════════ */
const VEHICLE_ROWS = [
  {key:"insurance",   label:"Insurance",    note:"Annual premium"},
  {key:"fitness",     label:"Fitness",      note:"Annual fitness certificate"},
  {key:"licensing",   label:"Licensing",    note:"Registration/License"},
  {key:"maintenance", label:"Maintenance",  note:"General upkeep"},
  {key:"tires",       label:"Tires",        note:"Replacement cycle"},
  {key:"repairs",     label:"Repairs",      note:"Unexpected repairs"},
  {key:"payments",    label:"Payments",     note:"Loan payments (annual)"},
  {key:"depreciation",label:"Depreciation", note:"Est. value lost"},
  {key:"fuel",        label:"Fuel",         note:"Annual fuel cost"},
];

function VehicleModule({fmt,currency}) {
  const SK="tbm_vehicle";
  const load=()=>{try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch{return null;}};
  const [sticker,setSticker]=useState(()=>load()?.sticker||"");
  const [vehicleName,setVehicleName]=useState(()=>load()?.vehicleName||"My Vehicle");
  const [data,setData]=useState(()=>load()?.data||{});
  const YEARS=[1,2,3,4,5];
  useEffect(()=>{try{localStorage.setItem(SK,JSON.stringify({sticker,vehicleName,data}));}catch{}},[sticker,vehicleName,data]);

  const setVal=(row,yr,val)=>setData(p=>({...p,[row]:{...(p[row]||{}),[yr]:val}}));
  const getVal=(row,yr)=>data[row]?.[yr]||"";
  const yearTotal=yr=>VEHICLE_ROWS.reduce((s,r)=>s+parse(getVal(r.key,yr)),0);
  const rowTotal=row=>YEARS.reduce((s,yr)=>s+parse(getVal(row,yr)),0);
  const grandTotal=YEARS.reduce((s,yr)=>s+yearTotal(yr),0);

  const thS={fontSize:"0.58rem",color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase",padding:"6px 4px",textAlign:"right",fontWeight:"600"};

  return (
    <div>
      <div style={{marginBottom:"16px"}}>
        <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>Vehicle Cost of Ownership</div>
        <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>5-Year Projection · {currency.flag} {currency.code}</div>
      </div>

      {/* Vehicle info */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"20px"}}>
        <div style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",border:`1px solid ${C.gold}22`}}>
          <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"6px"}}>Vehicle Name / Model</div>
          <input value={vehicleName} onChange={e=>setVehicleName(e.target.value)} placeholder="e.g. Toyota Corolla 2022"
            style={{background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}`,color:C.text,padding:"4px 2px",outline:"none",fontSize:"0.88rem",fontWeight:"700",fontFamily:"inherit",width:"100%"}}/>
        </div>
        <div style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",border:`1px solid ${C.gold}22`}}>
          <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"6px"}}>Sticker Price ({currency.code})</div>
          <input value={sticker} onChange={e=>setSticker(e.target.value)} placeholder="0.00"
            style={{background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}`,color:C.gold,padding:"4px 2px",outline:"none",fontSize:"0.88rem",fontWeight:"700",...monoStyle,width:"100%"}}/>
        </div>
      </div>

      {/* 5-year table */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:"560px"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.gold}33`}}>
              <th style={{...thS,textAlign:"left",width:"18%"}}>Category</th>
              {YEARS.map(y=><th key={y} style={{...thS,width:"14%"}}>Year {y}</th>)}
              <th style={{...thS,width:"12%"}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {VEHICLE_ROWS.map(row=>(
              <tr key={row.key} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                <td style={{padding:"5px 4px",fontSize:"0.78rem",color:C.text}}>{row.label}</td>
                {YEARS.map(yr=>(
                  <td key={yr} style={{padding:"3px 4px"}}>
                    <CellInput value={getVal(row.key,yr)} onChange={v=>setVal(row.key,yr,v)}/>
                  </td>
                ))}
                <td style={{...monoStyle,textAlign:"right",fontSize:"0.78rem",fontWeight:"700",color:C.gold,padding:"5px 4px"}}>
                  {rowTotal(row.key)?fmt(rowTotal(row.key)):"—"}
                </td>
              </tr>
            ))}
            <tr style={{borderTop:`2px solid ${C.gold}44`,background:`${C.gold}0d`}}>
              <td style={{padding:"7px 4px",fontSize:"0.78rem",fontWeight:"800",color:C.gold,textTransform:"uppercase"}}>TOTAL</td>
              {YEARS.map(yr=>(
                <td key={yr} style={{...monoStyle,textAlign:"right",fontSize:"0.8rem",fontWeight:"700",color:C.gold,padding:"7px 4px"}}>
                  {yearTotal(yr)?fmt(yearTotal(yr)):"—"}
                </td>
              ))}
              <td style={{...monoStyle,textAlign:"right",fontSize:"0.88rem",fontWeight:"800",color:C.gold,padding:"7px 4px"}}>{fmt(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary cards */}
      {grandTotal>0&&(
        <div style={{marginTop:"20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px"}}>
            {[
              {label:"Sticker Price",val:parse(sticker),color:C.gold},
              {label:"5-Year Total Cost",val:grandTotal,color:C.red},
              {label:"True Cost (Sticker + 5yr)",val:parse(sticker)+grandTotal,color:C.purple},
            ].map(it=>(
              <div key={it.label} style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",border:`1px solid ${it.color}22`,textAlign:"center"}}>
                <div style={{fontSize:"0.52rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>{it.label}</div>
                <div style={{...monoStyle,fontSize:"0.85rem",fontWeight:"700",color:it.color}}>{currency.symbol}{fmt(it.val)}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"10px",background:`${C.purple}12`,border:`1px solid ${C.purple}33`,borderRadius:"10px",padding:"12px 14px",fontSize:"0.76rem",color:C.textMid,lineHeight:1.5}}>
            💡 <strong style={{color:C.purple}}>Insight:</strong> Beyond the sticker price, owning this vehicle will cost approximately <strong style={{color:C.gold}}>{currency.symbol}{fmt(grandTotal)}</strong> over 5 years — that's <strong style={{color:C.gold}}>{currency.symbol}{fmt(grandTotal/60)}/month</strong> in running costs alone.
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STORAGE KEY + LOAD
══════════════════════════════════════════════════════════ */
const MAIN_SK = "tbm_main_v4";
const loadMain = () => { try { const r=localStorage.getItem(MAIN_SK); return r?JSON.parse(r):null; } catch { return null; } };

/* ══════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════ */
const MODULES = [
  { key:"budget",    label:"Budget",      icon:"📋" },
  { key:"networth",  label:"Net Worth",   icon:"📊" },
  { key:"debt",      label:"Debt",        icon:"💳" },
  { key:"portfolio", label:"Portfolio",   icon:"📈" },
  { key:"vehicle",   label:"Vehicle",     icon:"🚗" },
];

export default function App() {
  const now = new Date();
  const saved = loadMain();

  const [activeModule, setActiveModule] = useState("budget");
  const [year,         setYear]         = useState(now.getFullYear());
  const [showCP,       setShowCP]       = useState(false);
  const [toast,        setToast]        = useState("");
  const [currency,     setCurrency]     = useState(()=>{
    if(saved?.currency) return CURRENCIES.find(c=>c.code===saved.currency.code)||CURRENCIES[0];
    return CURRENCIES[0];
  });

  const fmt = useMemo(()=>makeFmt(currency),[currency]);

  useEffect(()=>{
    try{localStorage.setItem(MAIN_SK,JSON.stringify({currency}));}catch{}
  },[currency]);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };
  const pickCurrency = cur => { setCurrency(cur); showToast(`${cur.flag} Switched to ${cur.code}`); };

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans','Segoe UI',sans-serif",paddingBottom:"80px"}}>

      {showCP&&<CurrencyModal current={currency} onSelect={pickCurrency} onClose={()=>setShowCP(false)}/>}

      {toast&&(
        <div style={{position:"fixed",bottom:"80px",left:"50%",transform:"translateX(-50%)",background:C.gold,color:C.bg,borderRadius:"20px",padding:"8px 20px",fontSize:"0.8rem",fontWeight:"700",zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 24px rgba(0,0,0,0.5)"}}>
          {toast}
        </div>
      )}

      {/* ── Top Header ── */}
      <div style={{background:`linear-gradient(180deg,#0e1120,${C.surface})`,borderBottom:`1px solid ${C.gold}22`,padding:"14px 18px 10px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {/* Brand */}
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"8px",background:`linear-gradient(135deg,${C.gold},#e8a020)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",fontWeight:"900",color:C.bg,flexShrink:0}}>T</div>
            <div>
              <div style={{fontSize:"0.95rem",fontWeight:"800",color:C.gold,lineHeight:1}}>ThinkBright Money</div>
              <div style={{fontSize:"0.52rem",color:C.textMid,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:"2px"}}>Personal Finance Command Centre</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
            <button onClick={()=>setShowCP(true)} style={{...btn,display:"flex",alignItems:"center",gap:"5px",background:`${C.gold}18`,border:`1px solid ${C.gold}44`,color:C.gold,padding:"5px 9px",fontSize:"0.7rem"}}>
              <span style={{fontSize:"0.95rem",lineHeight:1}}>{currency.flag}</span>
              <span style={{...monoStyle,fontWeight:"800"}}>{currency.code}</span>
              <span style={{fontSize:"0.55rem",opacity:0.55}}>▼</span>
            </button>
            {activeModule==="budget"&&(
              <>
                <button onClick={()=>setYear(y=>y-1)} style={{...btn,background:`${C.gold}14`,color:C.gold,padding:"5px 8px",fontSize:"0.9rem"}}>‹</button>
                <span style={{...monoStyle,fontSize:"0.85rem",color:C.gold,fontWeight:"700",minWidth:"40px",textAlign:"center"}}>{year}</span>
                <button onClick={()=>setYear(y=>y+1)} style={{...btn,background:`${C.gold}14`,color:C.gold,padding:"5px 8px",fontSize:"0.9rem"}}>›</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{padding:"18px 16px"}}>
        {activeModule==="budget"    && <BudgetModule     year={year} currency={currency} fmt={fmt}/>}
        {activeModule==="networth"  && <NetWorthModule   fmt={fmt} currency={currency}/>}
        {activeModule==="debt"      && <DebtModule       fmt={fmt} currency={currency}/>}
        {activeModule==="portfolio" && <InvestmentModule fmt={fmt} currency={currency}/>}
        {activeModule==="vehicle"   && <VehicleModule    fmt={fmt} currency={currency}/>}
      </div>

      {/* ── Bottom Navigation ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:`linear-gradient(0deg,${C.surface},rgba(19,22,32,0.97))`,borderTop:`1px solid ${C.gold}22`,padding:"8px 4px 10px",display:"flex",justifyContent:"space-around",zIndex:200,backdropFilter:"blur(12px)"}}>
        {MODULES.map(m=>{
          const active=activeModule===m.key;
          return (
            <button key={m.key} onClick={()=>setActiveModule(m.key)} style={{...btn,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",flex:1,padding:"6px 4px",background:"transparent",borderRadius:"10px"}}>
              <span style={{fontSize:active?"1.3rem":"1.1rem",transition:"font-size 0.15s"}}>{m.icon}</span>
              <span style={{fontSize:"0.58rem",fontWeight:active?"800":"500",color:active?C.gold:C.textDim,letterSpacing:"0.04em",textTransform:"uppercase",transition:"color 0.15s"}}>{m.label}</span>
              {active&&<div style={{width:"20px",height:"2px",borderRadius:"1px",background:C.gold}}/>}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{textAlign:"center",padding:"12px",fontSize:"0.55rem",color:C.textDim,letterSpacing:"0.1em",textTransform:"uppercase"}}>
        ThinkBright Money · {currency.code} · {year} · by ThinkBright
      </div>
    </div>
  );
}
