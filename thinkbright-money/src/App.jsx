import { useState, useMemo, useEffect, useRef, useCallback, memo } from "react";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CURRENCIES = [
  { code:"JMD", symbol:"$", name:"Jamaican Dollar",    flag:"🇯🇲", locale:"en-JM" },
  { code:"USD", symbol:"$", name:"US Dollar",          flag:"🇺🇸", locale:"en-US" },
  { code:"GBP", symbol:"£", name:"British Pound",      flag:"🇬🇧", locale:"en-GB" },
  { code:"CAD", symbol:"$", name:"Canadian Dollar",    flag:"🇨🇦", locale:"en-CA" },
  { code:"EUR", symbol:"€", name:"Euro",               flag:"🇪🇺", locale:"de-DE" },
  { code:"TTD", symbol:"$", name:"Trinidad Dollar",    flag:"🇹🇹", locale:"en-TT" },
  { code:"BBD", symbol:"$", name:"Barbados Dollar",    flag:"🇧🇧", locale:"en-BB" },
  { code:"NGN", symbol:"₦", name:"Nigerian Naira",     flag:"🇳🇬", locale:"en-NG" },
  { code:"GHS", symbol:"₵", name:"Ghanaian Cedi",      flag:"🇬🇭", locale:"en-GH" },
  { code:"ZAR", symbol:"R", name:"South African Rand", flag:"🇿🇦", locale:"en-ZA" },
  { code:"AUD", symbol:"$", name:"Australian Dollar",  flag:"🇦🇺", locale:"en-AU" },
];

const DEFAULT_INCOME_TREE = [
  { key:"balance_fwd",  label:"Balance B/F",  fixed:true, type:"item" },
  { key:"salary",       label:"Salary",        fixed:true, type:"item" },
  { key:"business",     label:"Business",      fixed:true, type:"item" },
  { key:"other_income", label:"Other",         fixed:true, type:"item" },
];

const DEFAULT_EXPENSE_TREE = [
  { key:"tithes",         label:"Tithes",                  fixed:true,  type:"item" },
  { key:"investments",    label:"Investments",             fixed:true,  type:"item" },
  { key:"savings",        label:"Savings",                 fixed:true,  type:"parent" },
  { key:"sav_sagicor",    label:"Sagicor",                 fixed:false, type:"child", parentKey:"savings" },
  { key:"sav_fgb",        label:"FGB",                     fixed:false, type:"child", parentKey:"savings" },
  { key:"sav_ncb",        label:"NCB (Savings)",           fixed:false, type:"child", parentKey:"savings" },
  { key:"debt_repay",     label:"Debt Repayment",          fixed:true,  type:"parent" },
  { key:"debt_tv",        label:"Television",              fixed:false, type:"child", parentKey:"debt_repay" },
  { key:"debt_cc",        label:"Credit Card",             fixed:false, type:"child", parentKey:"debt_repay" },
  { key:"debt_ncb1",      label:"NCB Loan 1",              fixed:false, type:"child", parentKey:"debt_repay" },
  { key:"debt_ncb2",      label:"NCB Loan 2",              fixed:false, type:"child", parentKey:"debt_repay" },
  { key:"childcare",      label:"Childcare",               fixed:true,  type:"parent" },
  { key:"child_lunch",    label:"Lunch Money",             fixed:false, type:"child", parentKey:"childcare" },
  { key:"child_clothing", label:"Clothing & Accessories",  fixed:false, type:"child", parentKey:"childcare" },
  { key:"child_school",   label:"School Fee",              fixed:false, type:"child", parentKey:"childcare" },
  { key:"child_savings",  label:"Savings/Investments",     fixed:false, type:"child", parentKey:"childcare" },
  { key:"child_bts",      label:"Back to School",          fixed:false, type:"child", parentKey:"childcare" },
  { key:"food",           label:"Food + Groceries",        fixed:true,  type:"parent" },
  { key:"food_eating",    label:"Eating Out",              fixed:false, type:"child", parentKey:"food" },
  { key:"food_grocery",   label:"Groceries",               fixed:false, type:"child", parentKey:"food" },
  { key:"food_lunch",     label:"Lunch",                   fixed:false, type:"child", parentKey:"food" },
  { key:"utilities",      label:"Utilities",               fixed:true,  type:"parent" },
  { key:"util_electric",  label:"Electricity",             fixed:false, type:"child", parentKey:"utilities" },
  { key:"util_water",     label:"Water",                   fixed:false, type:"child", parentKey:"utilities" },
  { key:"util_gas",       label:"Gas",                     fixed:false, type:"child", parentKey:"utilities" },
  { key:"util_phone",     label:"Phone",                   fixed:false, type:"child", parentKey:"utilities" },
  { key:"util_internet",  label:"Internet/Cable",          fixed:false, type:"child", parentKey:"utilities" },
  { key:"insurance_lh",   label:"Life/Health Insurance",   fixed:true,  type:"item" },
  { key:"home",           label:"Home",                    fixed:true,  type:"parent" },
  { key:"home_rent",      label:"Rent",                    fixed:false, type:"child", parentKey:"home" },
  { key:"home_mortgage",  label:"Mortgage",                fixed:false, type:"child", parentKey:"home" },
  { key:"home_maint",     label:"Maintenance",             fixed:false, type:"child", parentKey:"home" },
  { key:"home_access",    label:"Accessories",             fixed:false, type:"child", parentKey:"home" },
  { key:"motor",          label:"Motor Vehicle",           fixed:true,  type:"parent" },
  { key:"motor_maint",    label:"Car Maintenance",         fixed:false, type:"child", parentKey:"motor" },
  { key:"motor_fuel",     label:"Fuel",                    fixed:false, type:"child", parentKey:"motor" },
  { key:"motor_ins",      label:"Insurance",               fixed:false, type:"child", parentKey:"motor" },
  { key:"motor_reg",      label:"Registration/License",    fixed:false, type:"child", parentKey:"motor" },
  { key:"motor_access",   label:"Accessories",             fixed:false, type:"child", parentKey:"motor" },
  { key:"subscriptions",  label:"Subscriptions",           fixed:true,  type:"item" },
  { key:"health",         label:"Health and Wellness",     fixed:true,  type:"parent" },
  { key:"health_dentist", label:"Dentist/Eye",             fixed:false, type:"child", parentKey:"health" },
  { key:"health_ins",     label:"Health Insurance",        fixed:false, type:"child", parentKey:"health" },
  { key:"health_meds",    label:"Medication/Vitamins",     fixed:false, type:"child", parentKey:"health" },
  { key:"celebrations",   label:"Celebrations",            fixed:true,  type:"parent" },
  { key:"cel_birthday",   label:"Birthdays",               fixed:false, type:"child", parentKey:"celebrations" },
  { key:"cel_special",    label:"Other Special Occasions", fixed:false, type:"child", parentKey:"celebrations" },
  { key:"cel_anniv",      label:"Anniversary",             fixed:false, type:"child", parentKey:"celebrations" },
  { key:"cel_xmas",       label:"Christmas",               fixed:false, type:"child", parentKey:"celebrations" },
  { key:"vacation",       label:"Vacation",                fixed:true,  type:"item" },
  { key:"parents",        label:"Parent(s)",               fixed:true,  type:"item" },
  { key:"charity",        label:"Charity/Donations",       fixed:true,  type:"item" },
  { key:"txn_fees",       label:"Transaction Fees",        fixed:true,  type:"item" },
  { key:"personal_spend", label:"Personal Spend",          fixed:true,  type:"item" },
];

const NW_ASSETS = {
  current:    [{key:"sav_ac1",label:"Savings A/C #1"},{key:"sav_ac2",label:"Savings A/C #2"},{key:"sav_ac3",label:"Savings A/C #3"},{key:"checking",label:"Checking A/C"},{key:"cash",label:"Cash"},{key:"owed_you",label:"Amounts Owed to You"},{key:"cur_other",label:"Other"}],
  securities: [{key:"cash_dep",label:"Cash Deposits"},{key:"life_ins",label:"Life Insurance"},{key:"stocks",label:"Stocks, Bonds, Unit Trusts"},{key:"sec_other",label:"Other"}],
  real_estate:[{key:"family_home",label:"Family Home Estimate"},{key:"invest1",label:"Investment #1"},{key:"invest2",label:"Investment #2"},{key:"re_other",label:"Other"}],
  retirement: [{key:"ars",label:"ARS"},{key:"super",label:"Superannuation Plan"},{key:"pension",label:"Pension"},{key:"ret_other",label:"Other Investment"}],
  personal:   [{key:"motor_v",label:"Motor Vehicle(s)"},{key:"per_other",label:"Other"}],
  other:      [{key:"biz1",label:"Business #1"},{key:"biz2",label:"Business #2"},{key:"oth_other",label:"Other"}],
};
const NW_LIABILITIES = {
  current:   [{key:"cc1",label:"Credit Card #1"},{key:"cc2",label:"Credit Card #2"},{key:"cc3",label:"Credit Card #3"},{key:"cc4",label:"Credit Card #4"},{key:"taxes",label:"Taxes"},{key:"furniture",label:"Furniture"},{key:"tv",label:"TV"},{key:"store_debt",label:"Store Debt"},{key:"cur_other",label:"Other"}],
  long_term: [{key:"car1",label:"Car #1"},{key:"car2",label:"Car #2"},{key:"mort1",label:"Mortgage #1"},{key:"mort2",label:"Mortgage #2"},{key:"mort3",label:"Mortgage #3"},{key:"loan1",label:"Loan #1"},{key:"loan2",label:"Loan #2"},{key:"loan3",label:"Loan #3"},{key:"loan4",label:"Loan #4"},{key:"lt_other",label:"Other"}],
  personal:  [{key:"pd1",label:"Personal Debt #1"},{key:"pd2",label:"Personal Debt #2"},{key:"pd3",label:"Personal Debt #3"},{key:"pd4",label:"Personal Debt #4"},{key:"pd5",label:"Personal Debt #5"}],
};

const VEHICLE_ROWS = [
  {key:"insurance",label:"Insurance"},{key:"fitness",label:"Fitness"},
  {key:"licensing",label:"Licensing"},{key:"maintenance",label:"Maintenance"},
  {key:"tires",label:"Tires"},{key:"repairs",label:"Repairs"},
  {key:"payments",label:"Payments"},{key:"depreciation",label:"Depreciation"},
  {key:"fuel",label:"Fuel"},
];

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const p$ = v => { const n = parseFloat(String(v ?? "").replace(/,/g,"")); return isNaN(n) ? 0 : n; };
const uid = () => "k" + Math.random().toString(36).slice(2,9);
const sumKeys = (obj, keys) => keys.reduce((s,k) => s + p$(obj?.[k]), 0);
const saveLS = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };
const loadLS = key => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };

function makeFmt(currency) {
  return n => {
    try { return new Intl.NumberFormat(currency.locale,{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0); }
    catch { return (Number(n)||0).toFixed(2); }
  };
}

/* ══════════════════════════════════════════════════════════
   PALETTE
══════════════════════════════════════════════════════════ */
const C = {
  gold:"#F5C842", bg:"#0c0e14", surface:"#131620", surfaceUp:"#1a1e2e",
  text:"#e8eaf2", textMid:"#8a90a8", textDim:"#4a5068",
  green:"#4ade80", red:"#f87171", blue:"#60a5fa", purple:"#c084fc",
};
const B = {border:"none",cursor:"pointer",borderRadius:"8px",fontFamily:"inherit",fontWeight:"700",transition:"all 0.15s"};
const M = {fontFamily:"'Fira Code',monospace"};

/* ══════════════════════════════════════════════════════════
   CELL INPUT
   ─────────────────────────────────────────────────────────
   The key insight: we keep a LOCAL string state for what's
   displayed while the user types. We only push to the parent
   store on BLUR (when they leave the field). The parent
   calculation store is updated separately via a shared ref
   map so totals stay live without re-rendering the inputs.
══════════════════════════════════════════════════════════ */
const CellInput = memo(({ storeValue, onBlurCommit, placeholder="0.00", align="right", isLabel=false, style={} }) => {
  const [local, setLocal] = useState(storeValue ?? "");
  const focused = useRef(false);

  // Sync from store only when not focused (avoids clobbering typing)
  useEffect(() => {
    if (!focused.current) setLocal(storeValue ?? "");
  }, [storeValue]);

  return (
    <input
      type="text"
      inputMode={isLabel ? "text" : "decimal"}
      value={local}
      onChange={e => setLocal(e.target.value)}
      onFocus={() => { focused.current = true; }}
      onBlur={e => {
        focused.current = false;
        onBlurCommit(e.target.value);
      }}
      placeholder={placeholder}
      style={{
        width:"100%", background:"transparent", border:"none",
        borderBottom:`1px solid ${C.textDim}44`,
        color:C.text,
        fontSize: isLabel ? "0.82rem" : "0.8rem",
        fontWeight: isLabel ? "600" : "400",
        padding:"5px 2px", outline:"none",
        textAlign: isLabel ? "left" : align,
        fontFamily: isLabel ? "inherit" : "'Fira Code',monospace",
        ...style,
      }}
    />
  );
});

/* ── A numeric cell that also keeps a live ref for totals ── */
// We use a context-free approach: each BudgetCell writes to a
// shared mutable ref object (liveRef) AND to React state on blur.
// The summary bar reads from state (updated on blur), which is
// fine because the user sees totals after finishing each field.
// This completely prevents focus loss.

/* ══════════════════════════════════════════════════════════
   CURRENCY MODAL
══════════════════════════════════════════════════════════ */
function CurrencyModal({ current, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const list = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:"480px",maxHeight:"75vh",display:"flex",flexDirection:"column",border:`1px solid ${C.gold}22`,borderBottom:"none"}}>
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
          {list.map(cur => {
            const active = cur.code === current.code;
            return (
              <button key={cur.code} onClick={()=>{onSelect(cur);onClose();}}
                style={{...B,display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"11px 12px",marginBottom:"3px",textAlign:"left",background:active?`${C.gold}22`:"transparent",border:active?`1px solid ${C.gold}55`:"1px solid transparent",borderRadius:"10px"}}>
                <span style={{fontSize:"1.4rem",lineHeight:1,minWidth:"28px",textAlign:"center"}}>{cur.flag}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.83rem",fontWeight:"700",color:active?C.gold:C.text}}>{cur.name}</div>
                  <div style={{fontSize:"0.62rem",color:C.textMid,marginTop:"1px"}}>{cur.code} · {cur.symbol}</div>
                </div>
                {active && <span style={{color:C.gold}}>✓</span>}
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
function BudgetModule({ year, currency, fmt }) {
  const SK = `tbm_budget_v4_${year}`;
  const saved = loadLS(SK) || {};

  const [incTree,   setIncTree]   = useState(() => saved.incTree   || DEFAULT_INCOME_TREE);
  const [expTree,   setExpTree]   = useState(() => saved.expTree   || DEFAULT_EXPENSE_TREE);
  const [allData,   setAllData]   = useState(() => saved.allData   || {});
  const [collapsed, setCollapsed] = useState(() => saved.collapsed || {});
  const [tab,       setTab]       = useState(MONTHS[new Date().getMonth()]);
  const [view,      setView]      = useState("month");
  const [editMode,  setEditMode]  = useState(false);

  useEffect(() => { saveLS(SK, { incTree, expTree, allData, collapsed }); }, [incTree, expTree, allData, collapsed]);

  // Current month data — plain objects, stable references per tab
  const monthIncome  = allData[tab]?.income   || {};
  const monthExpense = allData[tab]?.expenses || {};

  // Commit a value (called on blur) — only updates allData, doesn't affect input focus
  const commit = useCallback((section, key, field, val) => {
    setAllData(prev => {
      const m = prev[tab] || {};
      const s = m[section] || {};
      return { ...prev, [tab]: { ...m, [section]: { ...s, [key]: { ...(s[key]||{}), [field]: val } } } };
    });
  }, [tab]);

  // ── Derived totals (recalc on allData change, not on keystrokes) ──
  const nonParentInc  = incTree.filter(c => c.type !== "parent");
  const nonParentExp  = expTree.filter(c => c.type !== "parent");

  const totalIB = useMemo(() => nonParentInc.reduce((s,c) => s + p$(monthIncome[c.key]?.budget), 0), [monthIncome, incTree]);
  const totalIA = useMemo(() => nonParentInc.reduce((s,c) => s + p$(monthIncome[c.key]?.actual), 0), [monthIncome, incTree]);
  const totalEB = useMemo(() => nonParentExp.reduce((s,c) => s + p$(monthExpense[c.key]?.budget), 0), [monthExpense, expTree]);
  const totalEA = useMemo(() => nonParentExp.reduce((s,c) => s + p$(monthExpense[c.key]?.actual), 0), [monthExpense, expTree]);
  const defBudget = totalIB - totalEB;
  const defActual = totalIA - totalEA;

  const parentSum = (parentKey, section, field) => {
    const data = section === "income" ? monthIncome : monthExpense;
    const tree = section === "income" ? incTree : expTree;
    return tree.filter(c => c.parentKey === parentKey).reduce((s,c) => s + p$(data[c.key]?.[field]), 0);
  };

  // ── Edit helpers ──
  const renameItem = (section, key, val) => {
    if (section === "income") setIncTree(p => p.map(c => c.key===key ? {...c,label:val} : c));
    else setExpTree(p => p.map(c => c.key===key ? {...c,label:val} : c));
  };
  const deleteItem = (section, key) => {
    const filter = (p, k) => p.filter(c => c.key!==k && c.parentKey!==k);
    if (section === "income") setIncTree(p => filter(p,key));
    else setExpTree(p => filter(p,key));
  };
  const addChild = (section, parentKey) => {
    const item = { key:uid(), label:"New Item", fixed:false, type:"child", parentKey };
    if (section === "income") { setIncTree(p=>[...p,item]); return; }
    setExpTree(p => {
      const last = [...p].reverse().findIndex(c=>c.parentKey===parentKey);
      const idx = last>=0 ? p.length-last : p.length;
      const cp = [...p]; cp.splice(idx,0,item); return cp;
    });
  };
  const addGroup = () => setExpTree(p=>[...p,{key:uid(),label:"New Category",fixed:false,type:"parent"}]);
  const addItem  = section => {
    const item = {key:uid(),label:"New Item",fixed:false,type:"item"};
    if (section==="income") setIncTree(p=>[...p,item]); else setExpTree(p=>[...p,item]);
  };
  const toggleCollapse = key => setCollapsed(p=>({...p,[key]:!p[key]}));

  // ── Table styles ──
  const TH = {fontSize:"0.57rem",color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase",paddingBottom:"8px",textAlign:"right",fontWeight:"600"};

  function VarDisplay({ b, a, invert }) {
    const v = invert ? b-a : a-b;
    const show = b!==0 || a!==0;
    return (
      <td style={{...M,textAlign:"right",fontSize:"0.79rem",fontWeight:"600",padding:"5px 2px",width:"17%",color:show?(v>=0?C.green:C.red):C.textDim}}>
        {show ? ((v>=0?"+":"")+fmt(v)) : "—"}
      </td>
    );
  }

  // Each TableRow is memoized — it only re-renders when its own stored value changes
  const TableRow = memo(({ item, section }) => {
    const isParent = item.type === "parent";
    const isChild  = item.type === "child";
    const data     = section === "income" ? monthIncome : monthExpense;

    const bVal = isParent ? parentSum(item.key, section, "budget") : p$(data[item.key]?.budget);
    const aVal = isParent ? parentSum(item.key, section, "actual") : p$(data[item.key]?.actual);

    return (
      <tr style={{borderBottom:"1px solid rgba(255,255,255,0.025)",background:isParent?`${C.gold}07`:"transparent"}}>
        {/* Label */}
        <td style={{padding:"5px 0",paddingLeft:isChild?"18px":"0",width:"35%"}}>
          <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
            {isParent && (
              <button onClick={()=>toggleCollapse(item.key)}
                style={{...B,background:"transparent",color:C.gold,fontSize:"0.65rem",padding:"0 3px",lineHeight:1,minWidth:"14px",flexShrink:0}}>
                {collapsed[item.key]?"▶":"▼"}
              </button>
            )}
            {editMode ? (
              <CellInput
                storeValue={item.label}
                onBlurCommit={v => renameItem(section, item.key, v)}
                placeholder="Name"
                isLabel={true}
              />
            ) : (
              <span style={{color:isParent?C.gold:isChild?C.textMid:C.text,fontSize:isChild?"0.75rem":"0.82rem",fontWeight:isParent?"800":isChild?"400":"600",lineHeight:1.3}}>
                {item.label}
              </span>
            )}
          </div>
        </td>

        {/* Budget */}
        {isParent ? (
          <td style={{...M,textAlign:"right",fontSize:"0.79rem",color:C.textMid,padding:"5px 2px",width:"19%",fontWeight:"700"}}>
            {bVal>0?fmt(bVal):""}
          </td>
        ) : (
          <td style={{width:"19%",padding:"2px 2px"}}>
            <CellInput storeValue={data[item.key]?.budget||""} onBlurCommit={v=>commit(section,item.key,"budget",v)}/>
          </td>
        )}

        {/* Actual */}
        {isParent ? (
          <td style={{...M,textAlign:"right",fontSize:"0.79rem",color:C.textMid,padding:"5px 2px",width:"19%",fontWeight:"700"}}>
            {aVal>0?fmt(aVal):""}
          </td>
        ) : (
          <td style={{width:"19%",padding:"2px 2px"}}>
            <CellInput storeValue={data[item.key]?.actual||""} onBlurCommit={v=>commit(section,item.key,"actual",v)}/>
          </td>
        )}

        <VarDisplay b={bVal} a={aVal} invert={section==="expenses"}/>

        {/* Edit actions */}
        <td style={{textAlign:"right",width:"10%",padding:"2px 0"}}>
          {editMode && (
            <div style={{display:"flex",gap:"2px",justifyContent:"flex-end"}}>
              {isParent && (
                <button onClick={()=>addChild(section,item.key)}
                  style={{...B,background:`${C.blue}22`,color:C.blue,fontSize:"0.58rem",padding:"2px 5px"}}>+</button>
              )}
              {!item.fixed && (
                <button onClick={()=>deleteItem(section,item.key)}
                  style={{...B,background:`${C.red}18`,color:C.red,fontSize:"0.58rem",padding:"2px 5px"}}>✕</button>
              )}
            </div>
          )}
        </td>
      </tr>
    );
  });

  function BudgetTable({ tree, section }) {
    return (
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${C.surfaceUp}`}}>
            <th style={{...TH,textAlign:"left",width:"35%"}}>Category</th>
            <th style={{...TH,width:"19%"}}>Budget</th>
            <th style={{...TH,width:"19%"}}>Actual</th>
            <th style={{...TH,width:"17%"}}>Variance</th>
            <th style={{width:"10%"}}/>
          </tr>
        </thead>
        <tbody>
          {tree.map(item => {
            if (item.type==="child" && collapsed[item.parentKey]) return null;
            return <TableRow key={item.key} item={item} section={section}/>;
          })}
        </tbody>
      </table>
    );
  }

  function TotalsRow({ labelBgt, bgt, act, invert }) {
    const bgtVar = act - bgt;
    const col = (invert ? bgt-act : act-bgt) >= 0 ? C.green : C.red;
    return (
      <table style={{width:"100%",borderCollapse:"collapse",marginTop:"2px"}}>
        <tbody>
          <tr style={{borderTop:`2px solid ${C.gold}44`,background:`${C.gold}0d`}}>
            <td style={{width:"35%",padding:"7px 0",fontSize:"0.78rem",fontWeight:"800",color:C.gold,textTransform:"uppercase"}}>{labelBgt}</td>
            <td style={{...M,textAlign:"right",width:"19%",fontSize:"0.82rem",fontWeight:"800",color:C.gold,padding:"7px 2px"}}>{fmt(bgt)}</td>
            <td style={{...M,textAlign:"right",width:"19%",fontSize:"0.82rem",fontWeight:"800",color:C.gold,padding:"7px 2px"}}>{fmt(act)}</td>
            <td style={{...M,textAlign:"right",width:"17%",fontSize:"0.82rem",fontWeight:"800",padding:"7px 2px",color:col}}>
              {(invert?(bgt-act>=0):(act-bgt>=0))?"+":""}{fmt(invert?bgt-act:act-bgt)}
            </td>
            <td style={{width:"10%"}}/>
          </tr>
        </tbody>
      </table>
    );
  }

  // ── Annual view ──
  if (view==="year") {
    const rows = MONTHS.map(m => {
      const inc = allData[m]?.income   || {};
      const exp = allData[m]?.expenses || {};
      const tib = incTree.filter(c=>c.type!=="parent").reduce((s,c)=>s+p$(inc[c.key]?.budget),0);
      const tia = incTree.filter(c=>c.type!=="parent").reduce((s,c)=>s+p$(inc[c.key]?.actual),0);
      const teb = expTree.filter(c=>c.type!=="parent").reduce((s,c)=>s+p$(exp[c.key]?.budget),0);
      const tea = expTree.filter(c=>c.type!=="parent").reduce((s,c)=>s+p$(exp[c.key]?.actual),0);
      return { month:m, tib, tia, teb, tea, net:tia-tea };
    });
    const tot = rows.reduce((a,r)=>({tib:a.tib+r.tib,tia:a.tia+r.tia,teb:a.teb+r.teb,tea:a.tea+r.tea}),{tib:0,tia:0,teb:0,tea:0});
    const th2 = {fontSize:"0.57rem",color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase",padding:"6px 4px",textAlign:"right",fontWeight:"600"};
    const td2 = {...M,fontSize:"0.76rem",color:C.text,textAlign:"right",padding:"6px 4px"};
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <span style={{fontSize:"0.62rem",letterSpacing:"0.15em",color:C.gold,textTransform:"uppercase",fontWeight:"800"}}>📅 Annual Overview · {currency.flag} {currency.code}</span>
          <button onClick={()=>setView("month")} style={{...B,background:`${C.gold}12`,color:C.gold,padding:"5px 12px",fontSize:"0.7rem"}}>← Monthly</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:"480px"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.gold}33`}}>
                <th style={{...th2,textAlign:"left"}}>Month</th>
                <th style={th2}>Inc Budget</th><th style={th2}>Inc Actual</th>
                <th style={th2}>Exp Budget</th><th style={th2}>Exp Actual</th>
                <th style={th2}>Deficit/Overage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const has = r.tib||r.tia||r.teb||r.tea;
                return (
                  <tr key={r.month} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{...td2,textAlign:"left",color:C.gold,fontWeight:"700"}}>{r.month}</td>
                    {[r.tib,r.tia,r.teb,r.tea].map((v,i)=><td key={i} style={td2}>{has?fmt(v):"—"}</td>)}
                    <td style={{...td2,fontWeight:"700",color:has?(r.net>=0?C.green:C.red):C.textDim}}>
                      {has?((r.net>=0?"+":"")+fmt(r.net)):"—"}
                    </td>
                  </tr>
                );
              })}
              <tr style={{borderTop:`2px solid ${C.gold}44`,background:`${C.gold}0d`}}>
                <td style={{...td2,textAlign:"left",color:C.gold,fontWeight:"800"}}>TOTAL</td>
                {[tot.tib,tot.tia,tot.teb,tot.tea].map((v,i)=><td key={i} style={{...td2,color:C.gold,fontWeight:"700"}}>{fmt(v)}</td>)}
                <td style={{...td2,fontWeight:"800",color:(tot.tia-tot.tea)>=0?C.green:C.red}}>
                  {((tot.tia-tot.tea)>=0?"+":"")+fmt(tot.tia-tot.tea)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Monthly view ──
  return (
    <div>
      {/* Month tabs */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",gap:"6px"}}>
        <div style={{overflowX:"auto",display:"flex",gap:"3px",flex:1,scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          {MONTHS.map(m => {
            const inc = allData[m]?.income||{}, exp = allData[m]?.expenses||{};
            const has = incTree.some(c=>p$(inc[c.key]?.budget)||p$(inc[c.key]?.actual)) || expTree.some(c=>p$(exp[c.key]?.budget)||p$(exp[c.key]?.actual));
            return (
              <button key={m} onClick={()=>setTab(m)} style={{
                ...B,
                background:tab===m?C.gold:has?`${C.gold}18`:`${C.gold}06`,
                border:`1px solid ${tab===m?C.gold:has?C.gold+"33":C.textDim+"22"}`,
                color:tab===m?C.bg:has?C.gold:C.textMid,
                borderRadius:"20px",padding:"4px 10px",fontSize:"0.68rem",
                fontWeight:tab===m?"800":"500",whiteSpace:"nowrap",flexShrink:0,
              }}>{m}</button>
            );
          })}
        </div>
        <button onClick={()=>setView("year")} style={{...B,background:`${C.gold}12`,color:C.gold,padding:"4px 10px",fontSize:"0.68rem",flexShrink:0}}>Annual →</button>
      </div>

      {/* Heading */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
        <div>
          <div style={{fontSize:"1.05rem",fontWeight:"800",color:C.gold}}>{FULL_MONTHS[MONTHS.indexOf(tab)]} {year}</div>
          <div style={{fontSize:"0.58rem",color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase"}}>{currency.flag} {currency.name} · {currency.code}</div>
        </div>
        <button onClick={()=>setEditMode(e=>!e)} style={{...B,background:editMode?C.gold:`${C.gold}15`,color:editMode?C.bg:C.gold,border:`1px solid ${C.gold}44`,padding:"7px 12px",fontSize:"0.7rem",flexShrink:0}}>
          {editMode?"✓ Done":"✏️ Personalise"}
        </button>
      </div>

      {/* Summary bar */}
      <div style={{background:`linear-gradient(135deg,${C.surfaceUp},${C.surface})`,border:`1px solid ${C.gold}33`,borderRadius:"12px",padding:"14px 16px",marginBottom:"20px"}}>
        <div style={{fontSize:"0.6rem",color:C.gold,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:"800",marginBottom:"12px"}}>
          📊 {FULL_MONTHS[MONTHS.indexOf(tab)]} {year} — Overview
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
          {[
            {label:"Income (Budget)",  val:totalIB, color:C.gold},
            {label:"Income (Actual)",  val:totalIA, color:C.gold},
            {label:"Expense (Budget)", val:totalEB, color:C.red},
            {label:"Expense (Actual)", val:totalEA, color:C.red},
            {label:"Balance (Budget)", val:defBudget, color:defBudget>=0?C.green:C.red},
            {label:"Balance (Actual)", val:defActual, color:defActual>=0?C.green:C.red},
          ].map(it => (
            <div key={it.label} style={{textAlign:"center"}}>
              <div style={{fontSize:"0.52rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"3px"}}>{it.label}</div>
              <div style={{...M,fontSize:"0.84rem",fontWeight:"700",color:it.color}}>
                {it.val<0?"-":""}{currency.symbol}{fmt(Math.abs(it.val))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income section */}
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",borderBottom:`1px solid ${C.surfaceUp}`,paddingBottom:"8px"}}>
        <span>💰</span>
        <span style={{fontSize:"0.62rem",letterSpacing:"0.15em",color:C.gold,textTransform:"uppercase",fontWeight:"800"}}>Income</span>
      </div>
      <BudgetTable tree={incTree} section="income"/>
      <TotalsRow labelBgt="Total Income" bgt={totalIB} act={totalIA} invert={false}/>
      {editMode && (
        <button onClick={()=>addItem("income")} style={{...B,background:`${C.gold}0d`,border:`1px dashed ${C.gold}33`,color:C.gold,padding:"6px 12px",fontSize:"0.7rem",width:"100%",marginTop:"6px",borderRadius:"8px"}}>
          + Add Income Category
        </button>
      )}

      {/* Expenses section */}
      <div style={{display:"flex",alignItems:"center",gap:"8px",margin:"20px 0 8px",borderBottom:`1px solid ${C.surfaceUp}`,paddingBottom:"8px"}}>
        <span>💸</span>
        <span style={{fontSize:"0.62rem",letterSpacing:"0.15em",color:C.gold,textTransform:"uppercase",fontWeight:"800"}}>Expenses</span>
      </div>
      <BudgetTable tree={expTree} section="expenses"/>
      <TotalsRow labelBgt="Total Expenses" bgt={totalEB} act={totalEA} invert={true}/>

      {/* Deficit/Overage */}
      <table style={{width:"100%",borderCollapse:"collapse",marginTop:"2px"}}>
        <tbody>
          <tr style={{background:defActual>=0?`${C.green}0d`:`${C.red}0d`,borderTop:`1px solid ${defActual>=0?C.green:C.red}33`}}>
            <td style={{width:"35%",padding:"7px 0",fontSize:"0.78rem",fontWeight:"800",color:defActual>=0?C.green:C.red,textTransform:"uppercase"}}>
              {defActual>=0?"Overage":"Deficit"}
            </td>
            <td style={{...M,textAlign:"right",width:"19%",fontSize:"0.82rem",fontWeight:"800",color:defBudget>=0?C.green:C.red,padding:"7px 2px"}}>
              {(defBudget>=0?"+":"")+fmt(defBudget)}
            </td>
            <td style={{...M,textAlign:"right",width:"19%",fontSize:"0.82rem",fontWeight:"800",color:defActual>=0?C.green:C.red,padding:"7px 2px"}}>
              {(defActual>=0?"+":"")+fmt(defActual)}
            </td>
            <td colSpan={2}/>
          </tr>
        </tbody>
      </table>

      {editMode && (
        <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
          <button onClick={()=>addItem("expenses")} style={{...B,background:`${C.gold}0d`,border:`1px dashed ${C.gold}33`,color:C.gold,padding:"6px 12px",fontSize:"0.7rem",flex:1,borderRadius:"8px"}}>+ Add Item</button>
          <button onClick={addGroup} style={{...B,background:`${C.blue}0d`,border:`1px dashed ${C.blue}33`,color:C.blue,padding:"6px 12px",fontSize:"0.7rem",flex:1,borderRadius:"8px"}}>+ Add Category Group</button>
        </div>
      )}
      {editMode && (
        <div style={{background:`${C.blue}0d`,border:`1px solid ${C.blue}22`,borderRadius:"10px",padding:"12px 14px",marginTop:"14px",fontSize:"0.74rem",color:C.textMid,lineHeight:1.7}}>
          ✏️ <strong style={{color:C.blue}}>Personalise Mode</strong> — tap any name to rename · <strong style={{color:C.blue}}>+</strong> adds sub-item · <strong style={{color:C.red}}>✕</strong> removes · <strong style={{color:C.gold}}>▼▶</strong> collapses groups
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODULE 2 — NET WORTH
══════════════════════════════════════════════════════════ */
function NetWorthModule({ fmt, currency }) {
  const SK = "tbm_nw_v4";
  const [assets,      setAssets]      = useState(() => loadLS(SK)?.assets      || {});
  const [liabs,       setLiabs]       = useState(() => loadLS(SK)?.liabs       || {});
  const [notes,       setNotes]       = useState(() => loadLS(SK)?.notes       || {});
  const [lastUpdated, setLastUpdated] = useState(() => loadLS(SK)?.lastUpdated || "");

  useEffect(() => { saveLS(SK, {assets,liabs,notes,lastUpdated}); }, [assets,liabs,notes,lastUpdated]);

  const setA = (k,v) => setAssets(p=>({...p,[k]:v}));
  const setL = (k,v) => setLiabs(p=>({...p,[k]:v}));
  const setN = (k,v) => setNotes(p=>({...p,[k]:v}));

  const tCA  = sumKeys(assets, NW_ASSETS.current.map(x=>x.key));
  const tSec = sumKeys(assets, NW_ASSETS.securities.map(x=>x.key));
  const tRE  = sumKeys(assets, NW_ASSETS.real_estate.map(x=>x.key));
  const tRet = sumKeys(assets, NW_ASSETS.retirement.map(x=>x.key));
  const tPA  = sumKeys(assets, NW_ASSETS.personal.map(x=>x.key));
  const tOA  = sumKeys(assets, NW_ASSETS.other.map(x=>x.key));
  const totalAssets = tCA+tSec+tRE+tRet+tPA+tOA;

  const tCL  = sumKeys(liabs, NW_LIABILITIES.current.map(x=>x.key));
  const tLT  = sumKeys(liabs, NW_LIABILITIES.long_term.map(x=>x.key));
  const tPL  = sumKeys(liabs, NW_LIABILITIES.personal.map(x=>x.key));
  const totalLiabs = tCL+tLT+tPL;
  const netWorth   = totalAssets - totalLiabs;

  function NWSection({ title, items, data, onChange, total, totalLabel, color }) {
    return (
      <div style={{marginBottom:"12px"}}>
        <div style={{fontSize:"0.6rem",color:C.textMid,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:"700",padding:"7px 0 5px",borderBottom:`1px solid ${C.surfaceUp}`}}>{title}</div>
        {items.map(item => (
          <div key={item.key} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.025)"}}>
            <div style={{color:C.text,fontSize:"0.78rem",display:"flex",alignItems:"center"}}>{item.label}</div>
            <CellInput storeValue={data[item.key]||""} onBlurCommit={v=>onChange(item.key,v)}/>
            <CellInput storeValue={notes[item.key]||""} onBlurCommit={v=>setN(item.key,v)} placeholder="Comments…" isLabel={true}/>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:`1px solid ${color}33`,marginTop:"3px"}}>
          <span style={{fontSize:"0.72rem",fontWeight:"800",color,textTransform:"uppercase"}}>{totalLabel}</span>
          <span style={{...M,fontSize:"0.82rem",fontWeight:"800",color}}>{currency.symbol}{fmt(total)}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <div>
          <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>Net Worth Statement</div>
          <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>{currency.flag} {currency.code}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:"0.56rem",color:C.textMid,marginBottom:"3px"}}>Last Updated</div>
          <input type="date" value={lastUpdated} onChange={e=>setLastUpdated(e.target.value)}
            style={{background:C.surfaceUp,border:`1px solid ${C.textDim}`,borderRadius:"6px",color:C.text,padding:"4px 8px",fontSize:"0.72rem",fontFamily:"inherit",outline:"none"}}/>
        </div>
      </div>

      <div style={{background:netWorth>=0?`linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.04))`:`linear-gradient(135deg,rgba(248,113,113,0.15),rgba(248,113,113,0.04))`,border:`1px solid ${netWorth>=0?C.green:C.red}44`,borderRadius:"14px",padding:"18px 20px",marginBottom:"18px",textAlign:"center"}}>
        <div style={{fontSize:"0.6rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:"6px"}}>NET WORTH</div>
        <div style={{...M,fontSize:"1.8rem",fontWeight:"800",color:netWorth>=0?C.green:C.red}}>
          {netWorth<0?"-":""}{currency.symbol}{fmt(Math.abs(netWorth))}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:"28px",marginTop:"12px"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"0.55rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>Total Assets</div>
            <div style={{...M,fontSize:"0.9rem",fontWeight:"700",color:C.green}}>{currency.symbol}{fmt(totalAssets)}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"0.55rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>Total Liabilities</div>
            <div style={{...M,fontSize:"0.9rem",fontWeight:"700",color:C.red}}>{currency.symbol}{fmt(totalLiabs)}</div>
          </div>
        </div>
      </div>

      <div style={{fontSize:"0.6rem",color:C.textMid,marginBottom:"8px",letterSpacing:"0.08em"}}>AMOUNT · COMMENTS</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <div style={{background:C.surface,borderRadius:"12px",padding:"14px 16px",border:`1px solid ${C.green}22`}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",color:C.green,textTransform:"uppercase",fontWeight:"800",marginBottom:"10px"}}>📈 ASSETS</div>
          <NWSection title="Current Assets"  items={NW_ASSETS.current}     data={assets} onChange={setA} total={tCA}  totalLabel="Total Current"    color={C.green}/>
          <NWSection title="Securities"       items={NW_ASSETS.securities}  data={assets} onChange={setA} total={tSec} totalLabel="Total Securities"  color={C.green}/>
          <NWSection title="Real Estate"      items={NW_ASSETS.real_estate} data={assets} onChange={setA} total={tRE}  totalLabel="Total Real Estate" color={C.green}/>
          <NWSection title="Retirement"       items={NW_ASSETS.retirement}  data={assets} onChange={setA} total={tRet} totalLabel="Total Retirement"  color={C.green}/>
          <NWSection title="Personal"         items={NW_ASSETS.personal}    data={assets} onChange={setA} total={tPA}  totalLabel="Total Personal"    color={C.green}/>
          <NWSection title="Other"            items={NW_ASSETS.other}       data={assets} onChange={setA} total={tOA}  totalLabel="Total Other"       color={C.green}/>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:`2px solid ${C.green}44`,marginTop:"4px"}}>
            <span style={{fontSize:"0.78rem",fontWeight:"800",color:C.green,textTransform:"uppercase"}}>TOTAL ASSETS</span>
            <span style={{...M,fontSize:"0.9rem",fontWeight:"800",color:C.green}}>{currency.symbol}{fmt(totalAssets)}</span>
          </div>
        </div>
        <div style={{background:C.surface,borderRadius:"12px",padding:"14px 16px",border:`1px solid ${C.red}22`}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",color:C.red,textTransform:"uppercase",fontWeight:"800",marginBottom:"10px"}}>📉 LIABILITIES</div>
          <NWSection title="Current Liabilities"   items={NW_LIABILITIES.current}   data={liabs} onChange={setL} total={tCL} totalLabel="Total Current"   color={C.red}/>
          <NWSection title="Long-Term Liabilities" items={NW_LIABILITIES.long_term}  data={liabs} onChange={setL} total={tLT} totalLabel="Total Long-Term" color={C.red}/>
          <NWSection title="Personal Debt"         items={NW_LIABILITIES.personal}   data={liabs} onChange={setL} total={tPL} totalLabel="Total Personal"  color={C.red}/>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:`2px solid ${C.red}44`,marginTop:"4px"}}>
            <span style={{fontSize:"0.78rem",fontWeight:"800",color:C.red,textTransform:"uppercase"}}>TOTAL LIABILITIES</span>
            <span style={{...M,fontSize:"0.9rem",fontWeight:"800",color:C.red}}>{currency.symbol}{fmt(totalLiabs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODULE 3 — DEBT TRACKER
══════════════════════════════════════════════════════════ */
const PRIORITIES = ["High","Med","Low"];
const PCOL = {High:C.red, Med:C.gold, Low:C.green};
const PDESC = {High:"High interest / long duration — bad debt", Med:"Average interest — may be good or bad", Low:"Low interest — good debt, funding an asset"};

function DebtModule({ fmt, currency }) {
  const SK = "tbm_debt_v4";
  const [debts, setDebts] = useState(() => loadLS(SK) || [
    {id:"d1",name:"Credit Card #1",balance:"",maturity:"",rate:"",monthly:"",priority:"High",reason:"",notes:""},
    {id:"d2",name:"Loan #1",       balance:"",maturity:"",rate:"",monthly:"",priority:"Med", reason:"",notes:""},
    {id:"d3",name:"Personal Debt", balance:"",maturity:"",rate:"",monthly:"",priority:"Low", reason:"",notes:""},
  ]);
  useEffect(() => { saveLS(SK, debts); }, [debts]);

  const upd = (id,f,v) => setDebts(p=>p.map(d=>d.id===id?{...d,[f]:v}:d));
  const add = () => setDebts(p=>[...p,{id:uid(),name:"New Debt",balance:"",maturity:"",rate:"",monthly:"",priority:"Med",reason:"",notes:""}]);
  const rem = id => setDebts(p=>p.filter(d=>d.id!==id));

  const totalBalance = debts.reduce((s,d)=>s+p$(d.balance),0);
  const totalMonthly = debts.reduce((s,d)=>s+p$(d.monthly),0);

  const iS = {background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}44`,color:C.text,padding:"3px 2px",outline:"none",width:"100%",fontSize:"0.76rem",fontFamily:"inherit"};

  return (
    <div>
      <div style={{marginBottom:"14px"}}>
        <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>Debt Tracker</div>
        <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>{currency.flag} {currency.code}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"18px"}}>
        {[{label:"Total Debt",val:totalBalance,color:C.red},{label:"Monthly Payments",val:totalMonthly,color:C.gold},{label:"# of Debts",val:debts.length,color:C.blue,count:true}].map(it=>(
          <div key={it.label} style={{background:C.surface,borderRadius:"10px",padding:"12px",border:`1px solid ${it.color}22`,textAlign:"center"}}>
            <div style={{fontSize:"0.52rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>{it.label}</div>
            <div style={{...M,fontSize:"0.88rem",fontWeight:"700",color:it.color}}>{it.count?it.val:`${currency.symbol}${fmt(it.val)}`}</div>
          </div>
        ))}
      </div>
      {PRIORITIES.map(pr => {
        const pd = debts.filter(d=>d.priority===pr);
        if (!pd.length) return null;
        return (
          <div key={pr} style={{marginBottom:"16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",borderBottom:`1px solid ${PCOL[pr]}33`,paddingBottom:"5px"}}>
              <span style={{width:"8px",height:"8px",borderRadius:"50%",background:PCOL[pr],display:"inline-block",flexShrink:0}}/>
              <span style={{fontSize:"0.62rem",color:PCOL[pr],textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:"800"}}>{pr} · {PDESC[pr]}</span>
            </div>
            {pd.map(d => (
              <div key={d.id} style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",marginBottom:"8px",border:`1px solid ${PCOL[d.priority]}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  <input value={d.name} onChange={e=>upd(d.id,"name",e.target.value)} style={{...iS,fontSize:"0.86rem",fontWeight:"700",flex:1}}/>
                  <div style={{display:"flex",gap:"3px",marginLeft:"8px"}}>
                    {PRIORITIES.map(p2=>(
                      <button key={p2} onClick={()=>upd(d.id,"priority",p2)} style={{...B,background:d.priority===p2?PCOL[p2]:`${PCOL[p2]}18`,color:d.priority===p2?C.bg:PCOL[p2],padding:"3px 7px",fontSize:"0.6rem",borderRadius:"6px"}}>{p2}</button>
                    ))}
                    <button onClick={()=>rem(d.id)} style={{...B,background:`${C.red}18`,color:C.red,fontSize:"0.7rem",padding:"3px 7px",borderRadius:"6px"}}>✕</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"10px",marginBottom:"8px"}}>
                  {[["balance","Balance","decimal"],["maturity","Maturity Date","text"],["rate","Interest Rate %","decimal"],["monthly","Monthly Payment","decimal"]].map(([f,lbl,mode])=>(
                    <div key={f}>
                      <div style={{fontSize:"0.54rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px"}}>{lbl}</div>
                      <input value={d[f]} onChange={e=>upd(d.id,f,e.target.value)} placeholder={mode==="decimal"?"0.00":"mm/yyyy"}
                        style={{...iS,fontFamily:mode==="decimal"?"'Fira Code',monospace":"inherit"}}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                  {[["reason","Reason for Debt"],["notes","Special Terms / Notes"]].map(([f,lbl])=>(
                    <div key={f}>
                      <div style={{fontSize:"0.54rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px"}}>{lbl}</div>
                      <input value={d[f]} onChange={e=>upd(d.id,f,e.target.value)} placeholder="…" style={iS}/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
      <button onClick={add} style={{...B,background:`${C.gold}0d`,border:`1px dashed ${C.gold}44`,color:C.gold,padding:"8px 14px",fontSize:"0.72rem",width:"100%",borderRadius:"8px"}}>
        + Add Debt
      </button>
      <div style={{background:C.surface,borderRadius:"10px",padding:"14px 16px",marginTop:"16px",border:`1px solid ${C.gold}22`}}>
        <div style={{fontSize:"0.6rem",color:C.gold,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:"800",marginBottom:"10px"}}>Summary</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Priority","Balance","Monthly","#"].map(h=>(
            <th key={h} style={{fontSize:"0.56rem",color:C.textMid,textAlign:h==="Priority"?"left":"right",paddingBottom:"6px",textTransform:"uppercase",letterSpacing:"0.1em"}}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {PRIORITIES.map(pr=>{
              const pd=debts.filter(d=>d.priority===pr);
              return (
                <tr key={pr} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <td style={{padding:"5px 0",fontSize:"0.8rem",fontWeight:"700",color:PCOL[pr]}}>{pr}</td>
                  <td style={{...M,textAlign:"right",fontSize:"0.8rem",color:C.text,padding:"5px 0"}}>{fmt(pd.reduce((s,d)=>s+p$(d.balance),0))}</td>
                  <td style={{...M,textAlign:"right",fontSize:"0.8rem",color:C.text,padding:"5px 0"}}>{fmt(pd.reduce((s,d)=>s+p$(d.monthly),0))}</td>
                  <td style={{...M,textAlign:"right",fontSize:"0.8rem",color:C.textMid,padding:"5px 0"}}>{pd.length}</td>
                </tr>
              );
            })}
            <tr style={{borderTop:`1px solid ${C.gold}33`}}>
              <td style={{padding:"6px 0",fontSize:"0.8rem",fontWeight:"800",color:C.gold}}>TOTAL</td>
              <td style={{...M,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",color:C.red,padding:"6px 0"}}>{fmt(totalBalance)}</td>
              <td style={{...M,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",color:C.gold,padding:"6px 0"}}>{fmt(totalMonthly)}</td>
              <td style={{...M,textAlign:"right",fontSize:"0.8rem",color:C.textMid,padding:"6px 0"}}>{debts.length}</td>
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

function InvestmentModule({ fmt, currency }) {
  const SK = "tbm_inv_v4";
  const [invs, setInvs] = useState(() => loadLS(SK) || [
    {id:"i1",name:"Equity 1",            type:"Stock",         current:"",purchase:"",notes:""},
    {id:"i2",name:"Life Insurance Pol 1",type:"Life Insurance",current:"",purchase:"",notes:""},
    {id:"i3",name:"CD 1",               type:"CD",            current:"",purchase:"",notes:""},
  ]);
  useEffect(() => { saveLS(SK, invs); }, [invs]);

  const upd = (id,f,v) => setInvs(p=>p.map(i=>i.id===id?{...i,[f]:v}:i));
  const add = () => setInvs(p=>[...p,{id:uid(),name:"New Investment",type:"Stock",current:"",purchase:"",notes:""}]);
  const rem = id => setInvs(p=>p.filter(i=>i.id!==id));

  const tCur = invs.reduce((s,i)=>s+p$(i.current),0);
  const tPur = invs.reduce((s,i)=>s+p$(i.purchase),0);
  const tGL  = tCur-tPur;
  const tPct = tPur?((tGL/tPur)*100).toFixed(2):null;

  const iS = {background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}44`,color:C.text,padding:"3px 2px",outline:"none",fontSize:"0.76rem",width:"100%"};

  return (
    <div>
      <div style={{marginBottom:"14px"}}>
        <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>Investment Portfolio</div>
        <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>{currency.flag} {currency.code}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"10px",marginBottom:"18px"}}>
        {[{label:"Current Value",val:tCur,color:C.gold},{label:"Cost",val:tPur,color:C.textMid},{label:"Gain / Loss",val:tGL,color:tGL>=0?C.green:C.red},{label:"% Change",val:tPct,color:tGL>=0?C.green:C.red,pct:true}].map(it=>(
          <div key={it.label} style={{background:C.surface,borderRadius:"10px",padding:"12px",border:`1px solid ${it.color}22`,textAlign:"center"}}>
            <div style={{fontSize:"0.52rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>{it.label}</div>
            <div style={{...M,fontSize:"0.85rem",fontWeight:"700",color:it.color}}>
              {it.pct?(it.val?`${parseFloat(it.val)>0?"+":""}${it.val}%`:"—"):`${it.val<0?"-":""}${currency.symbol}${fmt(Math.abs(it.val))}`}
            </div>
          </div>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:"540px"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.gold}33`}}>
              {["Name","Type","Current Value","Purchase Price","% Change","Notes",""].map((h,i)=>(
                <th key={i} style={{fontSize:"0.56rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em",padding:"6px 4px",textAlign:i>1&&i<5?"right":"left",fontWeight:"600"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invs.map(inv => {
              const cur=p$(inv.current),pur=p$(inv.purchase),gl=cur-pur;
              const pctC=pur?((gl/pur)*100).toFixed(2):null;
              return (
                <tr key={inv.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <td style={{padding:"5px 4px",width:"22%"}}><input value={inv.name} onChange={e=>upd(inv.id,"name",e.target.value)} style={{...iS,fontWeight:"600"}}/></td>
                  <td style={{padding:"5px 4px",width:"14%"}}>
                    <select value={inv.type} onChange={e=>upd(inv.id,"type",e.target.value)} style={{background:C.surfaceUp,border:"none",borderBottom:`1px solid ${C.textDim}44`,color:C.text,padding:"3px 2px",fontSize:"0.74rem",outline:"none",width:"100%",fontFamily:"inherit"}}>
                      {INV_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"5px 4px",width:"16%"}}><input value={inv.current} onChange={e=>upd(inv.id,"current",e.target.value)} placeholder="0.00" style={{...iS,...M,textAlign:"right"}}/></td>
                  <td style={{padding:"5px 4px",width:"16%"}}><input value={inv.purchase} onChange={e=>upd(inv.id,"purchase",e.target.value)} placeholder="0.00" style={{...iS,...M,textAlign:"right"}}/></td>
                  <td style={{...M,textAlign:"right",fontSize:"0.8rem",fontWeight:"600",padding:"5px 4px",color:(cur||pur)?(gl>=0?C.green:C.red):C.textDim}}>{pctC?`${parseFloat(pctC)>0?"+":""}${pctC}%`:"—"}</td>
                  <td style={{padding:"5px 4px",width:"20%"}}><input value={inv.notes} onChange={e=>upd(inv.id,"notes",e.target.value)} placeholder="Notes…" style={{...iS,color:C.textMid,fontSize:"0.72rem"}}/></td>
                  <td style={{textAlign:"center",padding:"5px 4px"}}><button onClick={()=>rem(inv.id)} style={{...B,background:`${C.red}18`,color:C.red,fontSize:"0.7rem",padding:"2px 6px",borderRadius:"6px"}}>✕</button></td>
                </tr>
              );
            })}
            <tr style={{borderTop:`2px solid ${C.gold}44`,background:`${C.gold}0d`}}>
              <td colSpan={2} style={{padding:"7px 4px",fontSize:"0.78rem",fontWeight:"800",color:C.gold,textTransform:"uppercase"}}>TOTAL</td>
              <td style={{...M,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",color:C.gold,padding:"7px 4px"}}>{fmt(tCur)}</td>
              <td style={{...M,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",color:C.gold,padding:"7px 4px"}}>{fmt(tPur)}</td>
              <td style={{...M,textAlign:"right",fontSize:"0.82rem",fontWeight:"800",padding:"7px 4px",color:tGL>=0?C.green:C.red}}>{tPct?`${parseFloat(tPct)>0?"+":""}${tPct}%`:"—"}</td>
              <td colSpan={2}/>
            </tr>
          </tbody>
        </table>
      </div>
      <button onClick={add} style={{...B,background:`${C.gold}0d`,border:`1px dashed ${C.gold}44`,color:C.gold,padding:"8px 14px",fontSize:"0.72rem",width:"100%",marginTop:"10px",borderRadius:"8px"}}>+ Add Investment</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODULE 5 — VEHICLE
══════════════════════════════════════════════════════════ */
function VehicleModule({ fmt, currency }) {
  const SK = "tbm_veh_v4";
  const saved = loadLS(SK) || {};
  const [sticker, setSticker] = useState(()=>saved.sticker||"");
  const [vName,   setVName]   = useState(()=>saved.vName||"My Vehicle");
  const [data,    setData]    = useState(()=>saved.data||{});
  const YEARS = [1,2,3,4,5];
  useEffect(()=>{ saveLS(SK,{sticker,vName,data}); },[sticker,vName,data]);

  const getV = (row,yr) => data[row]?.[yr]||"";
  const setV = (row,yr,val) => setData(p=>({...p,[row]:{...(p[row]||{}),[yr]:val}}));
  const rowTotal = row => YEARS.reduce((s,yr)=>s+p$(getV(row,yr)),0);
  const yearTotal = yr => VEHICLE_ROWS.reduce((s,r)=>s+p$(getV(r.key,yr)),0);
  const grandTotal = YEARS.reduce((s,yr)=>s+yearTotal(yr),0);
  const thS = {fontSize:"0.58rem",color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase",padding:"6px 4px",textAlign:"right",fontWeight:"600"};

  return (
    <div>
      <div style={{marginBottom:"14px"}}>
        <div style={{fontSize:"1rem",fontWeight:"800",color:C.gold}}>Vehicle Cost of Ownership</div>
        <div style={{fontSize:"0.58rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em"}}>5-Year Projection · {currency.flag} {currency.code}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"18px"}}>
        {[["Vehicle Name","text",vName,setVName,"e.g. Toyota Corolla"],["Sticker Price","decimal",sticker,setSticker,"0.00"]].map(([lbl,mode,val,setter,ph])=>(
          <div key={lbl} style={{background:C.surface,borderRadius:"10px",padding:"12px 14px",border:`1px solid ${C.gold}22`}}>
            <div style={{fontSize:"0.56rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"6px"}}>{lbl}</div>
            <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
              style={{background:"transparent",border:"none",borderBottom:`1px solid ${C.textDim}`,color:C.gold,padding:"4px 2px",outline:"none",fontSize:"0.88rem",fontWeight:"700",fontFamily:mode==="decimal"?"'Fira Code',monospace":"inherit",width:"100%"}}/>
          </div>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:"520px"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.gold}33`}}>
              <th style={{...thS,textAlign:"left",width:"18%"}}>Item</th>
              {YEARS.map(y=><th key={y} style={{...thS,width:"13%"}}>Year {y}</th>)}
              <th style={{...thS,width:"12%"}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {VEHICLE_ROWS.map(row=>(
              <tr key={row.key} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                <td style={{padding:"5px 4px",fontSize:"0.78rem",color:C.text}}>{row.label}</td>
                {YEARS.map(yr=>(
                  <td key={yr} style={{padding:"3px 4px"}}>
                    <CellInput storeValue={getV(row.key,yr)} onBlurCommit={v=>setV(row.key,yr,v)}/>
                  </td>
                ))}
                <td style={{...M,textAlign:"right",fontSize:"0.78rem",fontWeight:"700",color:C.gold,padding:"5px 4px"}}>{rowTotal(row.key)?fmt(rowTotal(row.key)):"—"}</td>
              </tr>
            ))}
            <tr style={{borderTop:`2px solid ${C.gold}44`,background:`${C.gold}0d`}}>
              <td style={{padding:"7px 4px",fontSize:"0.78rem",fontWeight:"800",color:C.gold,textTransform:"uppercase"}}>TOTAL</td>
              {YEARS.map(yr=><td key={yr} style={{...M,textAlign:"right",fontSize:"0.8rem",fontWeight:"700",color:C.gold,padding:"7px 4px"}}>{yearTotal(yr)?fmt(yearTotal(yr)):"—"}</td>)}
              <td style={{...M,textAlign:"right",fontSize:"0.88rem",fontWeight:"800",color:C.gold,padding:"7px 4px"}}>{fmt(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {grandTotal>0&&(
        <div style={{marginTop:"18px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"10px"}}>
            {[{label:"Sticker Price",val:p$(sticker),color:C.gold},{label:"5-Year Running Cost",val:grandTotal,color:C.red},{label:"True Total Cost",val:p$(sticker)+grandTotal,color:C.purple}].map(it=>(
              <div key={it.label} style={{background:C.surface,borderRadius:"10px",padding:"12px",border:`1px solid ${it.color}22`,textAlign:"center"}}>
                <div style={{fontSize:"0.52rem",color:C.textMid,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>{it.label}</div>
                <div style={{...M,fontSize:"0.85rem",fontWeight:"700",color:it.color}}>{currency.symbol}{fmt(it.val)}</div>
              </div>
            ))}
          </div>
          <div style={{background:`${C.purple}0d`,border:`1px solid ${C.purple}33`,borderRadius:"10px",padding:"12px 14px",fontSize:"0.76rem",color:C.textMid,lineHeight:1.6}}>
            💡 <strong style={{color:C.purple}}>Insight:</strong> Running this vehicle costs approximately <strong style={{color:C.gold}}>{currency.symbol}{fmt(grandTotal/60)}/month</strong> beyond the sticker price.
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════ */
const MODULES = [
  {key:"budget",   label:"Budget",    icon:"📋"},
  {key:"networth", label:"Net Worth", icon:"📊"},
  {key:"debt",     label:"Debt",      icon:"💳"},
  {key:"portfolio",label:"Portfolio", icon:"📈"},
  {key:"vehicle",  label:"Vehicle",   icon:"🚗"},
];

export default function App() {
  const now = new Date();
  const [mod,    setMod]    = useState("budget");
  const [year,   setYear]   = useState(now.getFullYear());
  const [showCP, setShowCP] = useState(false);
  const [toast,  setToast]  = useState("");

  const [currency, setCurrency] = useState(() => {
    const s = loadLS("tbm_main_v7");
    return s?.currency ? (CURRENCIES.find(c=>c.code===s.currency.code)||CURRENCIES[0]) : CURRENCIES[0];
  });

  const fmt = useMemo(() => makeFmt(currency), [currency]);
  useEffect(() => { saveLS("tbm_main_v7", {currency}); }, [currency]);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };
  const pickCurrency = cur => { setCurrency(cur); showToast(`${cur.flag} Switched to ${cur.code}`); };

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans','Segoe UI',sans-serif",paddingBottom:"76px"}}>

      {showCP && <CurrencyModal current={currency} onSelect={pickCurrency} onClose={()=>setShowCP(false)}/>}

      {toast && (
        <div style={{position:"fixed",bottom:"80px",left:"50%",transform:"translateX(-50%)",background:C.gold,color:C.bg,borderRadius:"20px",padding:"8px 20px",fontSize:"0.8rem",fontWeight:"700",zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 24px rgba(0,0,0,0.5)"}}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{background:`linear-gradient(180deg,#0e1120,${C.surface})`,borderBottom:`1px solid ${C.gold}22`,padding:"14px 18px 10px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"8px",background:`linear-gradient(135deg,${C.gold},#e8a020)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",fontWeight:"900",color:C.bg,flexShrink:0}}>T</div>
            <div>
              <div style={{fontSize:"0.95rem",fontWeight:"800",color:C.gold,lineHeight:1}}>ThinkBright Money</div>
              <div style={{fontSize:"0.52rem",color:C.textMid,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:"2px"}}>Personal Finance Command Centre</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
            <button onClick={()=>setShowCP(true)} style={{...B,display:"flex",alignItems:"center",gap:"4px",background:`${C.gold}18`,border:`1px solid ${C.gold}44`,color:C.gold,padding:"5px 9px",fontSize:"0.7rem"}}>
              <span style={{fontSize:"0.95rem",lineHeight:1}}>{currency.flag}</span>
              <span style={{...M,fontWeight:"800"}}>{currency.code}</span>
              <span style={{fontSize:"0.55rem",opacity:0.5}}>▼</span>
            </button>
            {mod==="budget" && (
              <>
                <button onClick={()=>setYear(y=>y-1)} style={{...B,background:`${C.gold}14`,color:C.gold,padding:"5px 8px",fontSize:"0.9rem"}}>‹</button>
                <span style={{...M,fontSize:"0.85rem",color:C.gold,fontWeight:"700",minWidth:"40px",textAlign:"center"}}>{year}</span>
                <button onClick={()=>setYear(y=>y+1)} style={{...B,background:`${C.gold}14`,color:C.gold,padding:"5px 8px",fontSize:"0.9rem"}}>›</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"16px 14px"}}>
        {mod==="budget"    && <BudgetModule     year={year} currency={currency} fmt={fmt}/>}
        {mod==="networth"  && <NetWorthModule   fmt={fmt} currency={currency}/>}
        {mod==="debt"      && <DebtModule       fmt={fmt} currency={currency}/>}
        {mod==="portfolio" && <InvestmentModule fmt={fmt} currency={currency}/>}
        {mod==="vehicle"   && <VehicleModule    fmt={fmt} currency={currency}/>}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:`linear-gradient(0deg,${C.surface},rgba(19,22,32,0.97))`,borderTop:`1px solid ${C.gold}22`,padding:"8px 4px 10px",display:"flex",justifyContent:"space-around",zIndex:200,backdropFilter:"blur(12px)"}}>
        {MODULES.map(m => {
          const active = mod===m.key;
          return (
            <button key={m.key} onClick={()=>setMod(m.key)} style={{...B,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",flex:1,padding:"5px 2px",background:"transparent",borderRadius:"10px"}}>
              <span style={{fontSize:active?"1.3rem":"1.1rem",transition:"font-size 0.15s"}}>{m.icon}</span>
              <span style={{fontSize:"0.58rem",fontWeight:active?"800":"500",color:active?C.gold:C.textDim,letterSpacing:"0.04em",textTransform:"uppercase"}}>{m.label}</span>
              {active && <div style={{width:"18px",height:"2px",borderRadius:"1px",background:C.gold}}/>}
            </button>
          );
        })}
      </div>

      <div style={{textAlign:"center",padding:"10px",fontSize:"0.55rem",color:C.textDim,letterSpacing:"0.1em",textTransform:"uppercase"}}>
        ThinkBright Money · {currency.code} · {year} · by ThinkBright
      </div>
    </div>
  );
}
