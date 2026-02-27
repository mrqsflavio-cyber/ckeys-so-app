import { useState, useEffect, useCallback, useRef } from "react";

// ─── Firebase — Configuration ─────────────────────────────────────────────────
// INSTRUCTIONS : Remplace les valeurs ci-dessous par celles de ton projet Firebase
// (firebase.google.com → Paramètres projet → Configuration web)
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCiGkCCXDl4wID4tWOZFpNFpcraWkgccDs",
  authDomain:        "ckeys-28750.firebaseapp.com",
  projectId:         "ckeys-28750",
  storageBucket:     "ckeys-28750.firebasestorage.app",
  messagingSenderId: "809643703173",
  appId:             "1:809643703173:web:ca7fde3394f6dd0bb222ec",

};
const FIREBASE_DOC_PATH = "app/ckeys-data"; // chemin Firestore — ne pas modifier

// ─── Loader Firebase SDK (CDN) ────────────────────────────────────────────────
let _db = null;
let _getDoc, _setDoc, _doc, _onSnapshot;
let _fbReady = false;
const _fbListeners = [];

async function initFirebase() {
  if (_fbReady) return true;
  if (FIREBASE_CONFIG.apiKey === "REMPLACE_MOI") return false;
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore, doc, getDoc, setDoc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    _db = getFirestore(app);
    _doc = doc; _getDoc = getDoc; _setDoc = setDoc; _onSnapshot = onSnapshot;
    _fbReady = true;
    return true;
  } catch(e) {
    console.warn("Firebase init failed:", e);
    return false;
  }
}

// ─── Palette CKeys Conciergerie — Thème Prestige ─────────────────────────────
const GOLD        = "#c9a84c";  // or signature CKeys
const GOLD_LIGHT  = "#e4c97e";  // or clair hover
const GOLD_DARK   = "#9a7530";  // or foncé
const GOLD_BG     = "#fdf8ed";  // fond or très clair
const GOLD_BG2    = "#f0e6cc";  // fond or moyen
const NOIR        = "#0a0a0a";  // noir profond login
const NOIR2       = "#141414";  // noir cartes login
const NOIR3       = "#0c0c10";  // noir topbar
const SURFACE     = "#f5f4f0";  // fond app — ivoire chaud (thème prestige)
const CARD        = "#ffffff";
const BORDER      = "#e8e4d8";  // bordure ivoire
const TXT         = "#1c1a14";  // texte principal (chaud)
const TXT2        = "#5a5342";  // texte secondaire (chaud)
const TXT3        = "#a09880";  // texte muted (chaud)
const ACCENT      = "#c9a84c";
const MSG_BLUE    = "#3b82f6";
const APP_VERSION = "1.9.0";

const LOGO="data:image/jpeg;base64,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";

const COLORS=["#e05c5c","#4ecdc4","#45b7d1","#96ceb4","#bb8fce"];
const DEFAULT_TYPES=["Aspirateur","Balayage","Lavage sols","Dépoussiérage","Désinfection","Vitres","Poubelles","Sanitaires","Réapprovisionnement","Repassage","Cuisine","Salle de bain","Literie","Terrasse"];
const RECURRENCES=[{v:"quotidien",l:"Tous les jours"},{v:"hebdo",l:"Chaque semaine"},{v:"mensuel",l:"Chaque mois"},{v:"ponctuel",l:"Ponctuel"}];
const STATUTS={
  planifie:{l:"Planifié", c:GOLD,bg:GOLD_BG},
  en_cours:{l:"En cours", c:GOLD,bg:"#fff8e1"},
  termine: {l:"Terminé",  c:GOLD,bg:GOLD_BG},
  probleme:{l:"Problème", c:"#d9534f",bg:"#fdecea"},
};
const JOURS=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const MOIS_LONG=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_COURT=["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
const TODAY=new Date().toISOString().split("T")[0];
const NOW_Y=new Date().getFullYear();
const NOW_M=new Date().getMonth()+1;

const SEED={
  employes:[
    {id:1,nom:"Sofia",    couleur:COLORS[0],actif:true,photo:null,tel:"",email:"",role:"employe",pin:""},
    {id:2,nom:"Auriane",  couleur:COLORS[1],actif:true,photo:null,tel:"",email:"",role:"employe",pin:""},
    {id:3,nom:"Fabienne", couleur:COLORS[2],actif:true,photo:null,tel:"",email:"",role:"manager",pin:""},
  ],
  zones:[
    {id:1,nom:"Gite 1",  adresse:"",codeBoite:"",photo:null},
    {id:2,nom:"Gite 2",  adresse:"",codeBoite:"",photo:null},
  ],
  taches:[
    {id:1,zoneId:1,employeId:1,type:"Aspirateur",  heure:"08:00",recurrence:"quotidien",statut:"en_cours",checkItems:["Salon","Chambre","Couloir"],checkDone:[]},
    {id:2,zoneId:1,employeId:1,type:"Lavage sols",  heure:"09:30",recurrence:"quotidien",statut:"planifie", checkItems:["Cuisine","Salle de bain"],checkDone:[]},
    {id:3,zoneId:2,employeId:2,type:"Salle de bain",heure:"10:00",recurrence:"ponctuel", statut:"termine",  checkItems:["Lavabo","Douche","WC"],checkDone:["Lavabo","Douche","WC"]},
  ],
  typesPerso:DEFAULT_TYPES,
  notifications:[],
  messages:[
    {id:1,empId:1,nom:"Sofia",texte:'⚠️ Problème signalé sur "Aspirateur" : Tache sur le canapé',ts:"01/01 08:30",zoneId:1,type:"probleme",photoProbleme:null,archive:false,lu:false},
  ],
};

function getWeek(off=0){const d=new Date();d.setDate(d.getDate()-d.getDay()+1+off*7);return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return x;});}
function getDaysInMonth(year,month){return new Date(year,month,0).getDate();}
function getFirstDayOfMonth(year,month){const d=new Date(year,month-1,1).getDay();return d===0?6:d-1;}
function initials(n){return(n||"?").split(" ").map(p=>p[0]).join("").toUpperCase().slice(0,2);}
function fmtDate(d){return d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});}
function mapsUrl(a){return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`;}
function usePhotoPicker(setter){
  const ref=useRef();
  return{ref,pick:()=>ref.current.click(),handle:(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setter(ev.target.result);r.readAsDataURL(f);}};
}
function useBreakpoint(){
  const getW=()=>Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
  const getBp=()=>getW()>=1024?"desktop":getW()>=640?"tablet":"mobile";
  const [bp,setBp]=useState(getBp);
  useEffect(()=>{
    const h=()=>setBp(getBp());
    h(); // appel immédiat au montage
    window.addEventListener("resize",h);
    window.addEventListener("orientationchange",()=>setTimeout(h,100));
    return()=>{window.removeEventListener("resize",h);window.removeEventListener("orientationchange",h);};
  },[]);
  return bp;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S={
  app:    {fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:SURFACE,minHeight:"100vh",maxWidth:480,margin:"0 auto",paddingBottom:82,display:"flex",flexDirection:"column"},
  topbar: {background:NOIR3,color:"white",padding:"10px 16px",position:"sticky",top:0,zIndex:90,borderBottom:`1px solid rgba(255,255,255,.06)`},
  topTit: {fontSize:18,fontWeight:800,letterSpacing:-0.5},
  topSub: {fontSize:11,opacity:.45,marginTop:1},
  nav:    {position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",maxWidth:480,width:"100%",background:"rgba(15,15,20,.97)",backdropFilter:"blur(20px)",borderTop:`1px solid rgba(255,255,255,.08)`,display:"flex",zIndex:200,boxShadow:"0 -4px 30px rgba(0,0,0,.4)"},
  navBtn: a=>({flex:1,border:"none",background:"transparent",padding:"8px 0 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",color:a?GOLD:"rgba(255,255,255,.35)",fontSize:8,fontWeight:a?700:400,letterSpacing:.3,transition:"all .15s"}),
  card:   {background:CARD,borderRadius:18,padding:16,margin:"0 12px 10px",boxShadow:`0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04)`,border:`1px solid ${BORDER}`},
  sec:    {padding:"16px 12px 4px"},
  secTit: {fontSize:10,fontWeight:700,color:TXT3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12},
  inp:    {width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${BORDER}`,fontSize:15,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit",background:"#fafafa",outline:"none",color:TXT,transition:"border .15s"},
  sel:    {width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${BORDER}`,fontSize:15,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit",background:"#fafafa",appearance:"none",color:TXT},
  lbl:    {fontSize:12,fontWeight:600,color:TXT2,marginBottom:4,display:"block"},
  bPri:   {width:"100%",padding:"14px",background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,color:"#1a0d00",border:"none",borderRadius:14,fontSize:15,fontWeight:700,cursor:"pointer",marginTop:4,letterSpacing:.2},
  bSec:   {width:"100%",padding:"11px",background:"#f4f4f5",color:TXT2,border:"1px solid #e4e4e7",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",marginTop:6},
  bDng:   {width:"100%",padding:"11px",background:"#fef2f2",color:"#b91c1c",border:"1px solid #fecaca",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",marginTop:8},
  bGhost: {width:"100%",padding:"11px",background:"transparent",color:TXT3,border:"none",borderRadius:12,fontSize:13,cursor:"pointer"},
  modal:  {position:"fixed",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)",zIndex:300,display:"flex",alignItems:"flex-end"},
  mBox:   {background:CARD,borderRadius:"24px 24px 0 0",padding:"20px 20px 36px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"92vh",overflowY:"auto",borderTop:`3px solid ${GOLD}`},
  mTit:   {fontSize:18,fontWeight:800,marginBottom:16,color:TXT,letterSpacing:-.3},
  fab:    {position:"fixed",bottom:92,right:20,width:56,height:56,borderRadius:"18px",background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,border:"none",color:"#1a0d00",fontSize:28,cursor:"pointer",boxShadow:`0 6px 24px ${GOLD}55`,display:"flex",alignItems:"center",justifyContent:"center",zIndex:150,fontWeight:900},
  toast:  t=>({position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:t==="err"?"#dc2626":NOIR3,color:"white",padding:"10px 22px",borderRadius:50,fontSize:13,fontWeight:600,zIndex:400,boxShadow:"0 4px 20px rgba(0,0,0,.3)",whiteSpace:"nowrap",pointerEvents:"none",border:`1px solid ${t==="err"?"#ef4444":"rgba(255,255,255,.1)"}`}),
  bar:    {height:5,background:"#f4f4f5",borderRadius:10,overflow:"hidden"},
  barF:   c=>({height:"100%",background:c||GOLD,borderRadius:10,transition:"width .4s ease"}),
  sgrid:  {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 12px",marginBottom:10},
  scard:  g=>({background:g,borderRadius:18,padding:"16px",color:"white"}),
  snum:   {fontSize:32,fontWeight:800,lineHeight:1,letterSpacing:-1},
  slbl:   {fontSize:10,opacity:.8,marginTop:4,fontWeight:500,letterSpacing:.3},
  badge:  (c,bg)=>({background:bg,color:c,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,letterSpacing:.2}),
  tab:    a=>({flex:1,padding:"9px 4px",border:"none",background:a?GOLD_DARK:"transparent",color:a?"white":TXT2,borderRadius:10,fontSize:12,fontWeight:a?700:500,cursor:"pointer",transition:"all .15s"}),
};

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({emp,size=36}){
  const base={width:size,height:size,borderRadius:"50%",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"};
  if(emp?.photo) return(<div style={{...base,background:emp.couleur||"#ccc"}}><img src={emp.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>);
  return(<div style={{...base,background:emp?.couleur||"#ccc"}}><span style={{color:"white",fontWeight:900,fontSize:Math.round(size*0.35)}}>{initials(emp?.nom||"?")}</span></div>);
}

// ══════════════════════════════════════════════════════════════════════════════
// ÉCRAN PIN — authentification
// ══════════════════════════════════════════════════════════════════════════════
function EcranPin({employes,onLogin}){
  const [step,setStep]=useState("choix"); // choix | pin
  const [empSel,setEmpSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState(false);

  function choisir(e){
    // Si aucun PIN défini → connexion directe sans code
    if(!e.pin||e.pin.trim()===""){onLogin(e);return;}
    setEmpSel(e);setPin("");setErr(false);setStep("pin");
  }
  function saisir(d){
    if(pin.length>=4) return;
    const np=pin+d;
    setPin(np);
    if(np.length===4){
      if(np===empSel.pin){onLogin(empSel);}
      else{setErr(true);setTimeout(()=>{setPin("");setErr(false);},700);}
    }
  }
  function effacer(){setPin(p=>p.slice(0,-1));setErr(false);}

  if(step==="choix") return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${NOIR},#141408)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <img src={LOGO} alt="CKeys" style={{width:220,height:220,objectFit:"contain",marginBottom:8,borderRadius:28,boxShadow:`0 8px 40px ${GOLD}33`}}/>
      <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:3,marginBottom:32,textTransform:"uppercase",opacity:.7}}>Qui êtes-vous ?</div>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:10}}>
        {employes.filter(e=>e.actif).map(e=>(
          <button key={e.id} onClick={()=>choisir(e)}
            style={{display:"flex",alignItems:"center",gap:14,background:`${GOLD}0f`,border:`1.5px solid ${GOLD}44`,borderRadius:16,padding:"14px 18px",cursor:"pointer",transition:"all .15s"}}>
            <Avatar emp={e} size={46}/>
            <div style={{textAlign:"left"}}>
              <div style={{color:"white",fontWeight:800,fontSize:16}}>{e.nom}</div>
              <div style={{color:GOLD,fontSize:11,marginTop:1,opacity:.75}}>{e.role==="admin"?"Administrateur":e.role==="manager"?"Manager":"Employé"}{!e.pin||e.pin===""?" · Accès libre":""}</div>
            </div>
            <span style={{marginLeft:"auto",color:GOLD,fontSize:20,opacity:.5}}>›</span>
          </button>
        ))}
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${NOIR},#141408)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <button onClick={()=>setStep("choix")} style={{position:"absolute",top:20,left:20,background:`${GOLD}22`,border:`1px solid ${GOLD}44`,color:GOLD,borderRadius:10,padding:"6px 14px",cursor:"pointer",fontSize:13}}>← Retour</button>
      <Avatar emp={empSel} size={70}/>
      <div style={{color:"white",fontSize:20,fontWeight:900,marginTop:12,marginBottom:4}}>{empSel.nom}</div>
      <div style={{color:GOLD,fontSize:13,marginBottom:28,opacity:.7}}>Entrez votre code PIN</div>

      <div style={{display:"flex",gap:14,marginBottom:32}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:18,height:18,borderRadius:"50%",
            background:err?"#c0392b":pin.length>i?GOLD:`${GOLD}33`,
            transition:"all .15s",transform:err?"scale(1.2)":"scale(1)"}}/>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,width:240}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>(
          <button key={i} onClick={()=>d==="⌫"?effacer():d!==""&&saisir(String(d))}
            style={{height:64,borderRadius:16,border:`1px solid ${GOLD}22`,
              background:d===""?"transparent":`${GOLD}11`,
              color:d==="⌫"?GOLD_LIGHT:"white",fontSize:d==="⌫"?20:22,fontWeight:700,cursor:d===""?"default":"pointer",
              transition:"all .1s"}}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CARTE TÂCHE — expandable avec checklist
// ══════════════════════════════════════════════════════════════════════════════
function TacheCard({t,emp,zone,onEdit,onToggleCheck,onUpdateSt,compact=false}){
  const [open,setOpen]=useState(false);
  const st=STATUTS[t.statut]||STATUTS.planifie;
  const items=t.checkItems||[];
  const done=t.checkDone||[];
  const isTermine=t.statut==="termine";
  const isProbleme=t.statut==="probleme";
  const prog=items.length>0?Math.round(done.length/items.length*100):null;

  const cardStyle={
    borderRadius:compact?12:16,margin:compact?"0 0 6px":"0 12px 8px",
    boxShadow:compact?"none":"0 2px 10px rgba(0,0,0,.05)",overflow:"hidden",
    border:isTermine?`1.5px solid ${GOLD}`:isProbleme?"1.5px solid #e07070":compact?"1px solid #e8edf3":"1px solid #f0f4f8",
    background:isTermine?`linear-gradient(135deg,${GOLD_BG},${GOLD_BG2})`:isProbleme?"#fff0f0":"white",
    opacity:isTermine?0.85:1,transition:"all .25s",
  };

  return(
    <div style={cardStyle}>
      <div style={{padding:"13px 14px",cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Avatar emp={emp} size={40}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,color:isTermine?GOLD_DARK:"#1e293b",display:"flex",alignItems:"center",gap:5}}>
              {isTermine&&<span>✅</span>}
              <span style={{textDecoration:isTermine?"line-through":"none",opacity:isTermine?0.7:1}}>{t.type}</span>
            </div>
            <div style={{fontSize:12,color:"#64748b",marginTop:1}}>
              {compact?`👤 ${emp?.nom||"?"}`:`🏠 ${zone?.nom||"?"}`}
              <span style={{marginLeft:6,fontWeight:700,color:GOLD_DARK}}>⏰ {t.heure}</span>
            </div>
            {items.length>0&&!open&&(
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5}}>
                <div style={{...S.bar,flex:1,height:4}}><div style={{...S.barF(isTermine?GOLD:emp?.couleur||GOLD),width:prog+"%"}}></div></div>
                <span style={{fontSize:10,color:"#94a3b8",whiteSpace:"nowrap"}}>{done.length}/{items.length}</span>
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
            <span style={S.badge(st.c,st.bg)}>{st.l}</span>
            <span style={{fontSize:13,color:"#94a3b8",transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>▾</span>
          </div>
        </div>
      </div>
      {open&&(
        <div style={{padding:"0 14px 14px",borderTop:"1px solid rgba(0,0,0,.05)"}}>
          {items.length>0&&(
            <div style={{marginTop:12,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#8897ab",textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>✅ Liste à valider — {done.length}/{items.length}</div>
              {items.map(it=>{
                const checked=done.includes(it);
                return(
                  <div key={it} onClick={()=>onToggleCheck(t.id,it)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:5,borderRadius:11,
                      background:checked?GOLD_BG:"#f8fafc",border:`1.5px solid ${checked?GOLD:"#e2e8f0"}`,cursor:"pointer",transition:"all .15s"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,border:`2px solid ${checked?GOLD:"#cbd5e1"}`,background:checked?GOLD_DARK:"white",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                      {checked&&<span style={{color:"white",fontSize:14,fontWeight:900,lineHeight:1}}>✓</span>}
                    </div>
                    <span style={{fontSize:13,fontWeight:600,color:checked?GOLD_DARK:"#1e293b",textDecoration:checked?"line-through":"none",flex:1}}>{it}</span>
                    {checked&&<span style={{fontSize:11,color:GOLD,fontWeight:700}}>OK</span>}
                  </div>
                );
              })}
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                <div style={{...S.bar,flex:1,height:6}}><div style={{...S.barF(isTermine?GOLD:emp?.couleur||GOLD),width:prog+"%"}}></div></div>
                <span style={{fontSize:12,fontWeight:700,color:isTermine?GOLD_DARK:"#64748b"}}>{prog}%</span>
              </div>
            </div>
          )}
          <div style={{fontSize:11,fontWeight:800,color:"#8897ab",textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Changer le statut</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            {Object.entries(STATUTS).map(([k,v])=>(
              <button key={k} onClick={()=>onUpdateSt(t.id,k)}
                style={{padding:"6px 12px",borderRadius:20,border:"none",background:t.statut===k?v.c:v.bg,color:t.statut===k?"white":v.c,fontSize:11,fontWeight:700,cursor:"pointer",boxShadow:t.statut===k?"0 2px 6px rgba(0,0,0,.2)":"none"}}>
                {v.l}
              </button>
            ))}
          </div>
          {onEdit&&<button onClick={()=>onEdit(t)} style={{...S.bSec,marginTop:0,fontSize:12,padding:"8px 12px"}}>✏️ Modifier / Supprimer</button>}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL TÂCHE — sans champ date, heure déplacée après dates séjour
// ══════════════════════════════════════════════════════════════════════════════
function ModalTache({editMode,form,setForm,employes,zones,types,onSave,onDelete,onClose}){
  const checkItems=form.checkItems||[];
  function toggleType(t){
    const already=checkItems.includes(t);
    const newItems=already?checkItems.filter(x=>x!==t):[...checkItems,t];
    setForm(f=>({...f,checkItems:newItems,checkDone:(f.checkDone||[]).filter(x=>newItems.includes(x)),type:newItems[0]||t}));
  }
  return(
    <div style={S.modal} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.mBox}>
        <div style={S.mTit}>{editMode?"✏️ Modifier la tâche":"➕ Nouvelle tâche"}</div>
        <label style={S.lbl}>Employé</label>
        <select style={S.sel} value={form.employeId||""} onChange={e=>setForm(f=>({...f,employeId:e.target.value}))}>
          <option value="">— Choisir —</option>
          {employes.map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}
        </select>
        <label style={S.lbl}>Logement</label>
        <select style={S.sel} value={form.zoneId||""} onChange={e=>setForm(f=>({...f,zoneId:e.target.value}))}>
          <option value="">— Choisir —</option>
          {zones.map(z=><option key={z.id} value={z.id}>{z.nom}</option>)}
        </select>
        <label style={S.lbl}>Tâches à effectuer <span style={{fontWeight:400,color:"#94a3b8"}}>(cochez tout ce qui est à faire)</span></label>
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          <button type="button" onClick={()=>setForm(f=>({...f,checkItems:[...types],type:types[0]||""}))}
            style={{flex:1,padding:"7px 10px",borderRadius:9,border:`1.5px solid ${GOLD}`,background:GOLD_BG,color:GOLD_DARK,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            ☑️ Tout sélectionner
          </button>
          <button type="button" onClick={()=>setForm(f=>({...f,checkItems:[],checkDone:[],type:""}))}
            style={{flex:1,padding:"7px 10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#94a3b8",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            ☐ Tout désélectionner
          </button>
        </div>
        <div style={{background:"#f8fafc",borderRadius:12,padding:"8px 6px",marginBottom:10,border:"1.5px solid #e2e8f0",maxHeight:220,overflowY:"auto"}}>
          {types.map(t=>{
            const checked=checkItems.includes(t);
            return(
              <div key={t} onClick={()=>toggleType(t)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,marginBottom:3,background:checked?GOLD_BG:"transparent",border:`1.5px solid ${checked?GOLD:"transparent"}`,cursor:"pointer",transition:"all .12s"}}>
                <div style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`2px solid ${checked?GOLD:"#cbd5e1"}`,background:checked?GOLD_DARK:"white",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s"}}>
                  {checked&&<span style={{color:"white",fontSize:13,fontWeight:900,lineHeight:1}}>✓</span>}
                </div>
                <span style={{fontSize:14,fontWeight:checked?700:500,color:checked?GOLD_DARK:"#1e293b"}}>{t}</span>
              </div>
            );
          })}
        </div>
        {checkItems.length>0&&(
          <div style={{fontSize:11,color:GOLD,fontWeight:700,marginBottom:10,marginTop:-6,padding:"0 4px"}}>
            ✓ {checkItems.length} tâche{checkItems.length>1?"s":""} sélectionnée{checkItems.length>1?"s":""}
          </div>
        )}

        {/* Dates séjour locataires */}
        <div style={{background:"#f0f9ff",borderRadius:12,padding:"12px",marginBottom:10,border:"1.5px solid #bae6fd"}}>
          <div style={{fontSize:11,fontWeight:800,color:GOLD_DARK,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>🧳 Séjour locataires</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div>
              <label style={{...S.lbl,color:GOLD_DARK}}>📅 Arrivée</label>
              <input type="date" style={{...S.inp,marginBottom:0,fontSize:14}} value={form.dateArrivee||""} onChange={e=>setForm(f=>({...f,dateArrivee:e.target.value}))}/>
            </div>
            <div>
              <label style={{...S.lbl,color:GOLD_DARK}}>📅 Départ</label>
              <input type="date" style={{...S.inp,marginBottom:0,fontSize:14}} value={form.dateDepart||""} onChange={e=>setForm(f=>({...f,dateDepart:e.target.value}))}/>
            </div>
          </div>
        </div>

        {/* Heure déplacée ici */}
        <label style={S.lbl}>⏰ Heure d'intervention</label>
        <input type="time" style={S.inp} value={form.heure||"08:00"} onChange={e=>setForm(f=>({...f,heure:e.target.value}))}/>

        <label style={S.lbl}>Récurrence</label>
        <select style={S.sel} value={form.recurrence||"quotidien"} onChange={e=>setForm(f=>({...f,recurrence:e.target.value}))}>
          {RECURRENCES.map(r=><option key={r.v} value={r.v}>{r.l}</option>)}
        </select>

        {editMode&&(<>
          <label style={S.lbl}>Statut</label>
          <select style={S.sel} value={form.statut||"planifie"} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}>
            {Object.entries(STATUTS).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
          </select>
        </>)}

        <button style={S.bPri} onClick={onSave}>💾 Enregistrer</button>
        {editMode&&<button style={S.bDng} onClick={()=>onDelete(form.id)}>🗑️ Supprimer cette tâche</button>}
        <button style={S.bGhost} onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL EMPLOYÉ
// ══════════════════════════════════════════════════════════════════════════════
function ModalEmploye({form,setForm,onSave,onDelete,onClose}){
  const {ref,pick,handle}=usePhotoPicker(img=>setForm(f=>({...f,photo:img})));
  const [showPin,setShowPin]=useState(false);
  return(
    <div style={S.modal} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.mBox}>
        <div style={S.mTit}>{form.id?"✏️ Modifier l'employé":"👤 Nouvel employé"}</div>
        <label style={S.lbl}>Photo</label>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <div style={{width:76,height:76,borderRadius:"50%",overflow:"hidden",background:form.couleur||COLORS[0],display:"flex",alignItems:"center",justifyContent:"center",border:"3px solid #e2e8f0",cursor:"pointer",flexShrink:0}} onClick={pick}>
            {form.photo?<img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontWeight:900,fontSize:24,color:"white"}}>{form.nom?initials(form.nom):"👤"}</span>}
          </div>
          <div>
            <button type="button" style={{...S.bSec,marginTop:0,padding:"8px 14px",fontSize:12}} onClick={pick}>📷 {form.photo?"Changer":"Ajouter photo"}</button>
            {form.photo&&<button type="button" style={{...S.bDng,marginTop:6,padding:"6px 14px",fontSize:11}} onClick={()=>setForm(f=>({...f,photo:null}))}>Supprimer</button>}
          </div>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handle}/>
        <label style={S.lbl}>Nom complet</label>
        <input style={S.inp} placeholder="Ex : Marie Dupont" value={form.nom||""} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} autoFocus/>
        <label style={S.lbl}>📞 Téléphone</label>
        <input style={S.inp} type="tel" placeholder="06 12 34 56 78" value={form.tel||""} onChange={e=>setForm(f=>({...f,tel:e.target.value}))}/>
        <label style={S.lbl}>✉️ Email</label>
        <input style={S.inp} type="email" placeholder="prenom@email.fr" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
        <label style={S.lbl}>🔢 Code PIN (4 chiffres)</label>
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
          <input style={{...S.inp,marginBottom:0,flex:1,letterSpacing:8,fontSize:20,textAlign:"center"}}
            type={showPin?"text":"password"} maxLength={4} placeholder="••••"
            value={form.pin||""} onChange={e=>setForm(f=>({...f,pin:e.target.value.replace(/\D/g,"").slice(0,4)}))}/>
          <button type="button" onClick={()=>setShowPin(s=>!s)} style={{...S.bSec,marginTop:0,width:"auto",padding:"10px 14px",flexShrink:0}}>{showPin?"🙈":"👁️"}</button>
        </div>
        {form.id&&(<>
          <label style={S.lbl}>Statut</label>
          <select style={S.sel} value={form.actif?"actif":"inactif"} onChange={e=>setForm(f=>({...f,actif:e.target.value==="actif"}))}>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸ Inactif</option>
          </select>
        </>)}
        <button style={S.bPri} onClick={onSave}>💾 Enregistrer</button>
        {form.id&&<button style={S.bDng} onClick={()=>onDelete(form.id)}>🗑️ Supprimer cet employé</button>}
        <button style={S.bGhost} onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL LOGEMENT
// ══════════════════════════════════════════════════════════════════════════════
function ModalLogement({form,setForm,onSave,onDelete,onClose}){
  const {ref,pick,handle}=usePhotoPicker(img=>setForm(f=>({...f,photo:img})));
  return(
    <div style={S.modal} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.mBox}>
        <div style={S.mTit}>{form.id?"✏️ Modifier le logement":"🏠 Nouveau logement"}</div>
        <label style={S.lbl}>Photo</label>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:80,height:80,borderRadius:14,overflow:"hidden",background:"#f1f5f9",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",border:"2px dashed #e2e8f0",cursor:"pointer"}} onClick={pick}>
            {form.photo?<img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:28}}>🏠</span>}
          </div>
          <div>
            <button type="button" style={{...S.bSec,marginTop:0,padding:"8px 14px",fontSize:12}} onClick={pick}>📷 {form.photo?"Changer":"Ajouter"}</button>
            {form.photo&&<button type="button" style={{...S.bDng,marginTop:6,padding:"6px 14px",fontSize:11}} onClick={()=>setForm(f=>({...f,photo:null}))}>Supprimer</button>}
          </div>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handle}/>
        <label style={S.lbl}>Nom du logement</label>
        <input style={S.inp} placeholder="Ex : Gite du Moulin" value={form.nom||""} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} autoFocus/>
        <label style={S.lbl}>Adresse</label>
        <input style={S.inp} placeholder="12 Rue des Fleurs, 68500 Guebwiller" value={form.adresse||""} onChange={e=>setForm(f=>({...f,adresse:e.target.value}))}/>
        <label style={S.lbl}>🔑 Code boîte à clé</label>
        <input style={{...S.inp,fontWeight:800,fontSize:20,letterSpacing:5,textAlign:"center"}} placeholder="1234" value={form.codeBoite||""} onChange={e=>setForm(f=>({...f,codeBoite:e.target.value}))}/>
        <label style={S.lbl}>📞 Téléphone du propriétaire</label>
        <input style={S.inp} placeholder="06 12 34 56 78" value={form.telProprietaire||""} onChange={e=>setForm(f=>({...f,telProprietaire:e.target.value}))}/> 
        <label style={S.lbl}>📝 Notes (admin seulement)</label>
        <textarea style={{...S.inp,minHeight:60,resize:"vertical"}} placeholder="Instructions particulières, accès, codes..." value={form.notesAdmin||""} onChange={e=>setForm(f=>({...f,notesAdmin:e.target.value}))}/>
        <button style={S.bPri} onClick={onSave}>💾 Enregistrer</button>
        {form.id&&<button style={S.bDng} onClick={()=>onDelete(form.id)}>🗑️ Supprimer ce logement</button>}
        <button style={S.bGhost} onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL TYPES DE TÂCHES
// ══════════════════════════════════════════════════════════════════════════════
function ModalTypes({types,onSave,onClose}){
  const [list,setList]=useState([...types]);
  const [nv,setNv]=useState("");
  function add(){const t=nv.trim();if(!t||list.includes(t))return;setList(l=>[...l,t]);setNv("");}
  return(
    <div style={S.modal} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.mBox}>
        <div style={S.mTit}>⚙️ Types de tâches</div>
        <p style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>Ajoutez ou supprimez les types proposés.</p>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input style={{...S.inp,marginBottom:0,flex:1}} placeholder="Nouveau type..." value={nv} onChange={e=>setNv(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
          <button style={{...S.bPri,marginTop:0,width:"auto",padding:"0 16px",fontSize:20,borderRadius:10}} onClick={add}>+</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {list.map(t=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:6,background:"#f1f5f9",borderRadius:20,padding:"6px 12px"}}>
              <span style={{fontSize:13,fontWeight:600}}>{t}</span>
              <button onClick={()=>setList(l=>l.filter(x=>x!==t))} style={{border:"none",background:"none",cursor:"pointer",color:"#d9534f",fontSize:16,padding:0,lineHeight:1}}>×</button>
            </div>
          ))}
        </div>
        <button style={S.bPri} onClick={()=>onSave(list)}>💾 Enregistrer</button>
        <button style={S.bGhost} onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL NOTE PROBLÈME
// ══════════════════════════════════════════════════════════════════════════════
function ModalProbleme({tacheId,onConfirm,onClose}){
  const [note,setNote]=useState("");
  const [photo,setPhoto]=useState(null);
  const photoRef=useRef();
  function prendrePhoto(e){
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();r.onload=ev=>setPhoto(ev.target.result);r.readAsDataURL(f);
  }
  return(
    <div style={S.modal} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.mBox}>
        <div style={{...S.mTit,color:"#d9534f"}}>⚠️ Signaler un problème</div>
        <p style={{fontSize:13,color:"#64748b",marginBottom:14}}>Décrivez le problème et ajoutez une photo si besoin.</p>
        <label style={S.lbl}>Note / Description</label>
        <textarea autoFocus value={note} onChange={e=>setNote(e.target.value)}
          placeholder="Ex : Tache sur le canapé, ampoule grillée..."
          style={{...S.inp,minHeight:90,resize:"vertical",lineHeight:1.5}}/>
        <label style={S.lbl}>📷 Photo du problème (optionnel)</label>
        <input ref={photoRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={prendrePhoto}/>
        {photo?(
          <div style={{position:"relative",marginBottom:12}}>
            <img src={photo} alt="problème" style={{width:"100%",borderRadius:12,maxHeight:200,objectFit:"cover"}}/>
            <button onClick={()=>setPhoto(null)} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,.55)",border:"none",borderRadius:20,color:"white",fontSize:12,fontWeight:700,padding:"3px 10px",cursor:"pointer"}}>✕ Supprimer</button>
          </div>
        ):(
          <button type="button" onClick={()=>photoRef.current.click()}
            style={{...S.bSec,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10,borderStyle:"dashed"}}>
            📷 Prendre / Choisir une photo
          </button>
        )}
        <button style={{...S.bPri,background:"linear-gradient(135deg,#b03530,#8a2020)"}} onClick={()=>onConfirm(tacheId,note,photo)}>⚠️ Valider le problème</button>
        <button style={S.bGhost} onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CARTE LOGEMENT — accueil avec heure + code boîte affichés
// ══════════════════════════════════════════════════════════════════════════════
function CarteLogement({zone,tachesZone,employes,onToggleCheck,onUpdateSt,validerLot,onSignalerProbleme,onSignalerMessage}){
  const [open,setOpen]=useState(false);
  const [showProbleme,setShowProbleme]=useState(false);
  const [noteProbleme,setNoteProbleme]=useState("");
  const [photoProblemeLog,setPhotoProblemeLog]=useState(null);
  const [selItems,setSelItems]=useState(new Set());
  const photoRefLog=useRef();
  const emp=id=>employes.find(e=>e.id===id);

  const nbTotal=tachesZone.length;
  const nbFin=tachesZone.filter(t=>t.statut==="termine").length;
  const prog=nbTotal>0?Math.round(nbFin/nbTotal*100):0;
  const toutFini=nbTotal>0&&nbFin===nbTotal;
  const aProbleme=tachesZone.some(t=>t.statut==="probleme");

  const borderColor=toutFini?GOLD:aProbleme?"#e07070":"#e2e8f0";
  const bgColor=toutFini?`linear-gradient(135deg,${GOLD_BG},${GOLD_BG2})`:aProbleme?"#fff0f0":"white";

  const allItems=[];
  tachesZone.forEach(t=>{
    const e=emp(t.employeId);
    const done=t.checkDone||[];
    (t.checkItems||[]).forEach(it=>{allItems.push({tacheId:t.id,item:it,checked:done.includes(it),emp:e,statut:t.statut,tache:t});});
    if((t.checkItems||[]).length===0){
      allItems.push({tacheId:t.id,item:t.type,checked:t.statut==="termine",emp:e,statut:t.statut,tache:t,isTacheEntiere:true});
    }
  });

  const nbItemsFin=allItems.filter(i=>i.checked).length;
  const nbItemsTotal=allItems.length;

  // Prochaine heure d'intervention
  const prochaine=tachesZone.filter(t=>t.statut!=="termine").sort((a,b)=>a.heure?.localeCompare(b.heure))[0];

  return(
    <div style={{borderRadius:18,margin:"0 12px 10px",overflow:"hidden",border:`1.5px solid ${borderColor}`,background:bgColor,boxShadow:"0 3px 14px rgba(0,0,0,.06)"}}>
      <div style={{padding:"14px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}} onClick={()=>setOpen(o=>!o)}>
        <div style={{width:54,height:54,borderRadius:11,overflow:"hidden",background:"#f1f5f9",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #e8edf3"}}>
          {zone.photo?<img src={zone.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:24}}>🏠</span>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:2}}>
            <span style={{fontWeight:900,fontSize:16,color:"#1e293b"}}>{zone.nom}</span>
            {toutFini&&<span style={{fontSize:10,background:GOLD_BG2,color:GOLD_DARK,borderRadius:20,padding:"2px 8px",fontWeight:700}}>✅ Tout fait</span>}
            {aProbleme&&<span style={{fontSize:10,background:"#fdecea",color:"#d9534f",borderRadius:20,padding:"2px 8px",fontWeight:700}}>⚠️ Problème</span>}
          </div>
          {/* Heure + code boîte sur la même ligne */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
            {prochaine&&(
              <span style={{display:"inline-flex",alignItems:"center",gap:4,background:GOLD_BG,borderRadius:7,padding:"2px 9px",border:"1px solid #c7d7ff"}}>
                <span style={{fontSize:11}}>⏰</span>
                <span style={{fontSize:12,fontWeight:800,color:GOLD_DARK}}>{prochaine.heure}</span>
              </span>
            )}
            {zone.codeBoite&&(
              <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#fff8e1",borderRadius:7,padding:"2px 9px",border:"1px solid #ffe082"}}>
                <span style={{fontSize:11}}>🔑</span>
                <span style={{fontSize:13,fontWeight:900,letterSpacing:2,color:NOIR}}>{zone.codeBoite}</span>
              </span>
            )}
          </div>
          {/* Adresse avec lien Maps */}
          {zone.adresse&&(
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
              <span style={{fontSize:10}}>📍</span>
              <a href={mapsUrl(zone.adresse)} target="_blank" rel="noreferrer"
                style={{fontSize:11,color:GOLD_DARK,fontWeight:600,textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>
                {zone.adresse}
              </a>
            </div>
          )}
          {zone.telProprietaire&&(
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{fontSize:10}}>📞</span>
              <a href={`tel:${zone.telProprietaire}`}
                style={{fontSize:11,color:"#3b82f6",fontWeight:600,textDecoration:"none"}}>
                Propriétaire : {zone.telProprietaire}
              </a>
            </div>
          )}
          {zone.notesAdmin&&(
            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"5px 9px",marginBottom:4}}>
              <span style={{fontSize:10,color:"#92400e",fontWeight:700}}>📝 </span>
              <span style={{fontSize:11,color:"#78350f"}}>{zone.notesAdmin}</span>
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{...S.bar,flex:1,height:5}}><div style={{...S.barF(toutFini?GOLD:GOLD_DARK),width:(nbItemsTotal>0?Math.round(nbItemsFin/nbItemsTotal*100):0)+"%"}}></div></div>
            <span style={{fontSize:10,color:"#94a3b8",whiteSpace:"nowrap",fontWeight:700}}>{nbItemsFin}/{nbItemsTotal}</span>
            <span style={{fontSize:13,color:"#94a3b8",transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .2s",flexShrink:0}}>▾</span>
          </div>
        </div>
      </div>

      {open&&(
        <div style={{borderTop:"1px solid rgba(0,0,0,.06)",padding:"6px 14px 14px"}}>
          {/* ── Multi-sélection ── */}
          {(()=>{
            const pendingItems=allItems.filter(ai=>!ai.checked);
            const allPendingKeys=pendingItems.map(ai=>`${ai.tacheId}||${ai.item}`);
            const allSelected=allPendingKeys.length>0&&allPendingKeys.every(k=>selItems.has(k));
            const nbSel=selItems.size;

            const toggleSel=(ai)=>{
              const k=`${ai.tacheId}||${ai.item}`;
              setSelItems(s=>{const n=new Set(s);n.has(k)?n.delete(k):n.add(k);return n;});
            };
            const validerSelection=()=>{
              const sels=[...selItems].map(k=>{
                const [tacheId,item]=k.split("||");
                const ai=allItems.find(a=>String(a.tacheId)===tacheId&&a.item===item);
                return ai?{tacheId:parseInt(tacheId),item,isTacheEntiere:ai.isTacheEntiere}:null;
              }).filter(Boolean);
              validerLot(sels);
              setSelItems(new Set());
            };

            return(<>
              {allItems.length===0&&<div style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:"14px"}}>Aucune tâche aujourd'hui</div>}

              {/* Barre multi-sélection */}
              {pendingItems.length>1&&(
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0 6px",marginBottom:4,borderBottom:"1px solid #f1f5f9"}}>
                  {/* Tout sélectionner */}
                  <div onClick={()=>allSelected?setSelItems(new Set()):setSelItems(new Set(allPendingKeys))}
                    style={{width:20,height:20,borderRadius:5,border:`2px solid ${allSelected?GOLD:"#cbd5e1"}`,background:allSelected?GOLD_DARK:"white",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {allSelected&&<span style={{color:"white",fontSize:11,fontWeight:900}}>✓</span>}
                  </div>
                  <span style={{fontSize:12,color:TXT2,flex:1}}>{nbSel>0?`${nbSel} sélectionnée(s)`:"Tout sélectionner"}</span>
                  {nbSel>0&&(
                    <button onClick={validerSelection}
                      style={{background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,border:"none",borderRadius:10,padding:"6px 14px",color:"white",fontSize:12,fontWeight:800,cursor:"pointer",boxShadow:"0 2px 8px rgba(201,168,76,.4)"}}>
                      ✓ Valider ({nbSel})
                    </button>
                  )}
                </div>
              )}

              {allItems.map((ai,idx)=>{
                const isProb=ai.statut==="probleme";
                const isDone=ai.checked;
                const selKey=`${ai.tacheId}||${ai.item}`;
                const isSel=selItems.has(selKey);
                return(
                  <div key={`${ai.tacheId}-${ai.item}`}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",
                      borderBottom:idx<allItems.length-1?"1px solid #f1f5f9":"none",
                      background:isSel?"linear-gradient(90deg,#fffbeb,white)":"transparent",
                      borderRadius:isSel?8:0,
                      transition:"background .15s"}}>
                    {/* Checkbox : coche normale si done, checkbox sélection si pending */}
                    <div onClick={()=>{
                        if(isDone){
                          ai.isTacheEntiere?onUpdateSt(ai.tacheId,"planifie"):onToggleCheck(ai.tacheId,ai.item);
                        } else {
                          // En mode sélection rapide : clic sélectionne
                          toggleSel(ai);
                        }
                      }}
                      style={{width:24,height:24,borderRadius:6,flexShrink:0,cursor:"pointer",
                        border:`2px solid ${isDone?GOLD:isSel?GOLD:isProb?"#d9534f":"#cbd5e1"}`,
                        background:isDone?GOLD_DARK:isSel?GOLD_BG:isProb?"#fdecea":"white",
                        display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                      {isDone&&<span style={{color:"white",fontSize:13,fontWeight:900,lineHeight:1}}>✓</span>}
                      {isSel&&!isDone&&<span style={{color:GOLD_DARK,fontSize:13,fontWeight:900,lineHeight:1}}>○</span>}
                      {isProb&&!isDone&&!isSel&&<span style={{color:"#d9534f",fontSize:13,fontWeight:900,lineHeight:1}}>!</span>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:isDone?GOLD_DARK:isSel?GOLD_DARK:isProb?"#d9534f":"#1e293b",textDecoration:isDone?"line-through":"none"}}>{ai.item}</div>
                      {ai.emp&&<div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>👤 {ai.emp.nom}</div>}
                      {(ai.tache.dateArrivee||ai.tache.dateDepart)&&(
                        <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                          {ai.tache.dateArrivee&&<span style={{fontSize:10,background:GOLD_BG,color:GOLD_DARK,borderRadius:6,padding:"2px 7px",fontWeight:600}}>✈️ Arr. {new Date(ai.tache.dateArrivee).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>}
                          {ai.tache.dateDepart&&<span style={{fontSize:10,background:`${GOLD}22`,color:GOLD_DARK,borderRadius:6,padding:"2px 7px",fontWeight:600}}>🚪 Dép. {new Date(ai.tache.dateDepart).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>}
                        </div>
                      )}
                      {ai.tache.noteProbleme&&(
                        <div style={{fontSize:11,color:"#d9534f",background:"#fdecea",borderRadius:7,padding:"3px 8px",marginTop:4,fontStyle:"italic"}}>📝 {ai.tache.noteProbleme}</div>
                      )}
                      {ai.tache.photoProbleme&&(
                        <img src={ai.tache.photoProbleme} alt="problème" style={{width:"100%",borderRadius:8,marginTop:4,maxHeight:120,objectFit:"cover"}}/>
                      )}
                    </div>
                    {/* Valider individuellement (double-tap rapide) */}
                    {!isDone&&!isSel&&(
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={(e)=>{e.stopPropagation();ai.isTacheEntiere?onUpdateSt(ai.tacheId,"termine"):onToggleCheck(ai.tacheId,ai.item);}}
                          style={{border:`1px solid ${GOLD}44`,background:GOLD_BG,color:GOLD_DARK,borderRadius:8,padding:"4px 8px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>✓</button>
                        <button onClick={(e)=>{e.stopPropagation();onSignalerProbleme(ai.tacheId);}}
                          style={{border:`1px solid ${isProb?"#fecaca":"#e4e4e7"}`,background:isProb?"#fef2f2":"#f4f4f5",color:isProb?"#dc2626":"#a1a1aa",borderRadius:8,padding:"4px 8px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>⚠️</button>
                      </div>
                    )}
                    {/* Si sélectionné : bouton valider individuel */}
                    {isSel&&!isDone&&(
                      <button onClick={(e)=>{e.stopPropagation();validerLot([{tacheId:ai.tacheId,item:ai.item,isTacheEntiere:ai.isTacheEntiere}]);setSelItems(s=>{const n=new Set(s);n.delete(selKey);return n;});}}
                        style={{background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,border:"none",borderRadius:8,padding:"5px 10px",color:"white",fontSize:11,fontWeight:800,cursor:"pointer",flexShrink:0}}>
                        ✓ OK
                      </button>
                    )}
                    {isDone&&(
                      <button onClick={()=>onSignalerProbleme(ai.tacheId)}
                        style={{border:"1px solid #e4e4e7",background:"#f4f4f5",color:"#a1a1aa",borderRadius:8,padding:"4px 8px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>⚠️</button>
                    )}
                  </div>
                );
              })}
            </>);
          })()}

          {/* ── Case signalement problème logement ── */}
          {onSignalerMessage&&(
            <div style={{marginTop:8,borderTop:"1px solid #f4f4f5",paddingTop:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"8px 0"}}
                onClick={()=>{setShowProbleme(s=>!s);setNoteProbleme("");setPhotoProblemeLog(null);}}>
                <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${showProbleme?"#dc2626":"#e4e4e7"}`,background:showProbleme?"#fef2f2":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  {showProbleme&&<span style={{color:"#dc2626",fontSize:12,lineHeight:1}}>✓</span>}
                </div>
                <span style={{fontSize:13,fontWeight:600,color:showProbleme?"#dc2626":TXT2}}>⚠️ Signaler un problème sur ce logement</span>
              </div>
              {showProbleme&&(
                <div style={{background:"#fef2f2",borderRadius:12,padding:12,border:"1px solid #fecaca"}}>
                  <textarea
                    autoFocus
                    value={noteProbleme}
                    onChange={e=>setNoteProbleme(e.target.value)}
                    placeholder="Décrivez le problème observé dans ce logement..."
                    style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid #fecaca",fontSize:13,resize:"vertical",minHeight:80,fontFamily:"inherit",boxSizing:"border-box",background:"white",color:TXT,outline:"none"}}
                  />
                  <input ref={photoRefLog} type="file" accept="image/*" capture="environment" style={{display:"none"}}
                    onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setPhotoProblemeLog(ev.target.result);r.readAsDataURL(f);}}/>
                  {photoProblemeLog?(
                    <div style={{position:"relative",marginTop:8,marginBottom:4}}>
                      <img src={photoProblemeLog} alt="photo" style={{width:"100%",borderRadius:10,maxHeight:160,objectFit:"cover"}}/>
                      <button onClick={()=>setPhotoProblemeLog(null)} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,.55)",border:"none",borderRadius:20,color:"white",fontSize:11,fontWeight:700,padding:"3px 10px",cursor:"pointer"}}>✕</button>
                    </div>
                  ):(
                    <button type="button" onClick={()=>photoRefLog.current.click()}
                      style={{width:"100%",padding:"8px",background:"white",border:"1px dashed #fecaca",borderRadius:10,color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:6,marginBottom:4}}>
                      📷 Ajouter une photo
                    </button>
                  )}
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={()=>{
                      if(!noteProbleme.trim()) return;
                      onSignalerMessage({texte:noteProbleme.trim(),zoneId:zone.id,photo:photoProblemeLog||null});
                      setShowProbleme(false);setNoteProbleme("");setPhotoProblemeLog(null);
                    }} style={{flex:1,padding:"9px",background:"#dc2626",border:"none",borderRadius:10,color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                      📤 Envoyer à l'admin
                    </button>
                    <button onClick={()=>{setShowProbleme(false);setNoteProbleme("");setPhotoProblemeLog(null);}} style={{padding:"9px 14px",background:"#f4f4f5",border:"none",borderRadius:10,color:TXT2,fontSize:13,cursor:"pointer"}}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VUE ACCUEIL
// ══════════════════════════════════════════════════════════════════════════════
function Accueil({data,updateSt,onEditTache,onToggleCheck,validerLot,onSignalerProbleme,onSignalerMessage,isAdmin}){
  const tAuj=data.taches.filter(t=>t.date===TODAY);
  const tFin=tAuj.filter(t=>t.statut==="termine").length;
  const pb=tAuj.filter(t=>t.statut==="probleme").length;

  const logsMoisEmp=id=>new Set(data.taches.filter(t=>{
    if(!t.date) return false;
    const [y,m]=t.date.split("-");
    return parseInt(y)===NOW_Y&&parseInt(m)===NOW_M&&t.employeId===id&&t.statut==="termine";
  }).map(t=>t.zoneId)).size;

  const logsAvecTaches=data.zones.filter(z=>tAuj.some(t=>t.zoneId===z.id));
  const logsSansTaches=data.zones.filter(z=>!tAuj.some(t=>t.zoneId===z.id));

  return(<>
    <div style={S.sgrid}>
      <div style={S.scard("linear-gradient(135deg,#1a1408,#c9a84c)")}><div style={S.snum}>{tAuj.length}</div><div style={S.slbl}>Tâches aujourd'hui</div></div>
      <div style={S.scard("linear-gradient(135deg,#2d7a2d,#1a5c1a)")}><div style={S.snum}>{tFin}</div><div style={S.slbl}>Terminées</div></div>
    </div>

    <div style={S.sec}>
      <div style={S.secTit}>Logements — {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
    </div>

    {data.zones.length===0&&(
      <div style={{...S.card,color:"#94a3b8",textAlign:"center",fontSize:14,padding:"28px 16px"}}>
        🏠 Aucun logement — Ajoutez-en dans l'onglet Logements
      </div>
    )}

    {logsAvecTaches.map(z=>(
      <CarteLogement key={z.id} zone={z}
        tachesZone={tAuj.filter(t=>t.zoneId===z.id)}
        employes={data.employes}
        onToggleCheck={onToggleCheck} onUpdateSt={updateSt} validerLot={validerLot}
        onSignalerProbleme={onSignalerProbleme}
        onSignalerMessage={onSignalerMessage}/>
    ))}

    {logsSansTaches.length>0&&(
      <>
        <div style={{...S.sec,paddingTop:8}}>
          <div style={{...S.secTit,opacity:.5}}>Libres aujourd'hui</div>
        </div>
        {logsSansTaches.map(z=>(
          <div key={z.id} style={{margin:"0 12px 8px",borderRadius:14,border:"1px dashed #e2e8f0",background:"#fafbfc",padding:"12px 14px",display:"flex",alignItems:"center",gap:12,opacity:.7}}>
            <div style={{width:38,height:38,borderRadius:9,overflow:"hidden",background:"#f1f5f9",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {z.photo?<img src={z.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:18}}>🏠</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13,color:"#64748b"}}>{z.nom}</div>
              {z.adresse&&<a href={mapsUrl(z.adresse)} target="_blank" rel="noreferrer" style={{fontSize:11,color:GOLD_DARK,textDecoration:"none"}}>📍 {z.adresse}</a>}
              {z.codeBoite&&<div style={{fontSize:11,color:"#94a3b8"}}>🔑 {z.codeBoite}</div>}
            </div>
            <span style={{fontSize:10,background:"#f1f5f9",color:"#94a3b8",borderRadius:20,padding:"2px 9px",fontWeight:700}}>Libre</span>
          </div>
        ))}
      </>
    )}

    <div style={S.sec}>
      <div style={S.secTit}>Suivi de l'équipe — {MOIS_LONG[NOW_M-1]}</div>
    </div>
    <div style={S.card}>
      {data.employes.filter(e=>e.actif).map((e,i,arr)=>{
        const tot=tAuj.filter(t=>t.employeId===e.id).length;
        const done=tAuj.filter(t=>t.employeId===e.id&&t.statut==="termine").length;
        const p=tot>0?Math.round(done/tot*100):0;
        const logsM=logsMoisEmp(e.id);
        return(
          <div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:i<arr.length-1?"1px solid #f1f5f9":"none"}}>
            <Avatar emp={e} size={46}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <span style={{fontWeight:700,fontSize:14}}>{e.nom}</span>
                <span style={{fontSize:10,background:GOLD_BG,color:GOLD,borderRadius:20,padding:"2px 9px",fontWeight:700}}>🏠 {logsM} ce mois</span>
              </div>
              <div style={{...S.bar,marginBottom:3}}><div style={{...S.barF(e.couleur),width:p+"%"}}></div></div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>{done}/{tot} tâches · {p}%</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {e.tel&&<a href={`tel:${e.tel}`} style={{fontSize:11,background:GOLD_BG,color:GOLD_DARK,borderRadius:8,padding:"4px 10px",textDecoration:"none",fontWeight:700}}>📞 Appeler</a>}
                {e.email&&<a href={`mailto:${e.email}`} style={{fontSize:11,background:GOLD_BG,color:GOLD_DARK,borderRadius:8,padding:"4px 10px",textDecoration:"none",fontWeight:700}}>✉️ Email</a>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </>);
}

// ══════════════════════════════════════════════════════════════════════════════
// VUE PLANNING — 3 modes : jour / semaine / mois
// ══════════════════════════════════════════════════════════════════════════════
function Planning({data,weekOff,setWeekOff,filterEmp,setFilterEmp,onEditTache,onNewTache,isReadOnly=false}){
  const [planMode,setPlanMode]=useState("semaine"); // jour | semaine | mois
  const [dayOff,setDayOff]=useState(0);
  const [moisOff,setMoisOff]=useState(0);

  const week=getWeek(weekOff);
  const emp=id=>data.employes.find(e=>e.id===id);

  // ── Calcul date courante pour mode jour
  const curDay=new Date();curDay.setDate(curDay.getDate()+dayOff);
  const curDayStr=curDay.toISOString().split("T")[0];

  // ── Calcul mois courant
  const moisDate=new Date(NOW_Y,NOW_M-1+moisOff,1);
  const moisY=moisDate.getFullYear();
  const moisM=moisDate.getMonth()+1;
  const nbJours=getDaysInMonth(moisY,moisM);
  const premierJour=getFirstDayOfMonth(moisY,moisM);

  function filtrerTaches(taches){
    if(filterEmp==="tous") return taches;
    return taches.filter(t=>t.employeId===parseInt(filterEmp));
  }

  const isPlanning=true;

  // ──────────────────────────────────────────────────────
  // MODE JOUR
  // ──────────────────────────────────────────────────────
  const vueJour=()=>{
    const taches=filtrerTaches(data.taches.filter(t=>t.date===curDayStr))
      .sort((a,b)=>a.heure?.localeCompare(b.heure));
    const isToday=curDayStr===TODAY;
    return(
      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{padding:"12px 12px 4px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>setDayOff(d=>d-1)} style={{border:"none",background:"#f1f5f9",borderRadius:9,width:36,height:36,cursor:"pointer",fontSize:18,fontWeight:700,color:GOLD_DARK,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontWeight:800,fontSize:14,color:GOLD_DARK}}>{curDay.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
            {isToday&&<div style={{fontSize:10,color:GOLD,fontWeight:700}}>Aujourd'hui</div>}
          </div>
          <button onClick={()=>setDayOff(d=>d+1)} style={{border:"none",background:"#f1f5f9",borderRadius:9,width:36,height:36,cursor:"pointer",fontSize:18,fontWeight:700,color:GOLD_DARK,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        </div>
        {taches.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:"#94a3b8"}}>
            <div style={{fontSize:32,marginBottom:8}}>📭</div>
            <div style={{fontSize:14}}>Aucune tâche ce jour</div>
            {!isReadOnly&&<button onClick={()=>onNewTache&&onNewTache(curDayStr)} style={{...S.bPri,width:"auto",padding:"9px 20px",marginTop:12,fontSize:13}}>+ Ajouter une tâche</button>}
          </div>
        )}
        {taches.map(t=>{
          const e=emp(t.employeId);
          const zone=data.zones.find(z=>z.id===t.zoneId);
          const st=STATUTS[t.statut]||STATUTS.planifie;
          return(
            <div key={t.id} onClick={()=>onEditTache&&onEditTache(t)}
              style={{margin:"0 12px 8px",borderRadius:14,background:"white",border:`1.5px solid ${st.bg}`,padding:"12px 14px",cursor:onEditTache?"pointer":"default",boxShadow:"0 2px 8px rgba(0,0,0,.04)",borderLeft:`4px solid ${st.c}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Avatar emp={e} size={38}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{t.type}</div>
                  <div style={{fontSize:12,color:"#64748b"}}>🏠 {zone?.nom||"?"} · ⏰ {t.heure}</div>
                  {zone?.codeBoite&&<div style={{fontSize:11,color:GOLD,fontWeight:700,marginTop:2}}>🔑 {zone.codeBoite}</div>}
                </div>
                <span style={S.badge(st.c,st.bg)}>{st.l}</span>
              </div>
            </div>
          );
        })}
        {!isReadOnly&&(
        <div style={{padding:"0 12px 12px",marginTop:4}}>
          <button onClick={()=>onNewTache&&onNewTache(curDayStr)} style={{...S.bSec,fontSize:13}}>+ Ajouter une tâche ce jour</button>
        </div>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────
  // MODE SEMAINE
  // ──────────────────────────────────────────────────────
  const vueSemaine=()=>(
    <div style={{display:"flex",flex:1,overflowY:"hidden",overflowX:"hidden",gap:0}}>
      {week.map((date,i)=>{
        const ds=date.toISOString().split("T")[0];
        const isToday=ds===TODAY;
        const taches=filtrerTaches(data.taches.filter(t=>t.date===ds));
        return(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",background:isToday?"linear-gradient(180deg,#1a1408 0%,#0d0d0d 100%)":"white",borderRight:i<6?"1px solid #e8edf3":"none",minWidth:0,overflow:"hidden"}}>
            <div style={{padding:"8px 4px 6px",textAlign:"center",background:isToday?"rgba(255,255,255,.08)":"#f8fafc",borderBottom:`2px solid ${isToday?"rgba(255,255,255,.2)":"#e8edf3"}`,flexShrink:0}}>
              <div style={{fontSize:9,fontWeight:800,color:isToday?"rgba(255,255,255,.7)":"#94a3b8",textTransform:"uppercase",letterSpacing:.5}}>{JOURS[i]}</div>
              <div style={{fontSize:16,fontWeight:900,color:isToday?"white":"#1e293b",lineHeight:1.1}}>{date.getDate()}</div>
              <div style={{fontSize:8,color:isToday?"rgba(255,255,255,.5)":"#94a3b8"}}>{MOIS_COURT[date.getMonth()]}</div>
            </div>
            <div style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"4px 3px 4px"}}>
              {taches.length===0&&<div style={{textAlign:"center",fontSize:8,color:isToday?"rgba(255,255,255,.2)":"#cbd5e1",marginTop:10,padding:"0 2px"}}>libre</div>}
              {taches.map(t=>{
                const e=emp(t.employeId);
                const st=STATUTS[t.statut]||STATUTS.planifie;
                const isTer=t.statut==="termine";
                const zone=data.zones.find(z=>z.id===t.zoneId);
                return(
                  <div key={t.id} onClick={()=>onEditTache(t)}
                    style={{background:isToday?"rgba(255,255,255,.13)":isTer?GOLD_BG2:((e?.couleur||"#ccc")+"28"),borderLeft:`3px solid ${isToday?"rgba(255,255,255,.6)":isTer?GOLD:e?.couleur||"#ccc"}`,borderRadius:"0 6px 6px 0",padding:"4px 4px 4px 5px",marginBottom:4,cursor:"pointer",opacity:(isTer&&!isToday)?0.75:1}}>
                    <div style={{fontSize:9,fontWeight:900,color:isToday?"white":"#1e293b",lineHeight:1.2,marginBottom:1}}>{t.heure}</div>
                    <div style={{fontSize:9,fontWeight:700,color:isToday?"rgba(255,255,255,.9)":"#1e293b",lineHeight:1.2,wordBreak:"break-word",textDecoration:isTer?"line-through":"none"}}>{t.type}</div>
                    <div style={{fontSize:8,color:isToday?"rgba(255,255,255,.55)":"#94a3b8",marginTop:1}}>{e?.nom?.split(" ")[0]||"?"}</div>
                    {zone?.codeBoite&&<div style={{fontSize:7,color:isToday?"rgba(255,255,255,.6)":GOLD,fontWeight:800,marginTop:1}}>🔑{zone.codeBoite}</div>}
                    <div style={{marginTop:2,display:"inline-block",background:isTer?GOLD_DARK:isToday?"rgba(255,255,255,.2)":st.bg,color:isTer?"white":isToday?"white":st.c,borderRadius:6,padding:"1px 4px",fontSize:7,fontWeight:700}}>{st.l}</div>
                  </div>
                );
              })}
            </div>
            <div onClick={()=>!isReadOnly&&onNewTache&&onNewTache(ds)} style={{textAlign:"center",fontSize:18,padding:"6px 0",cursor:isReadOnly?"default":"pointer",flexShrink:0,color:isToday?"rgba(255,255,255,.35)":"#cbd5e1",background:isToday?"rgba(255,255,255,.04)":"#f8fafc",borderTop:`1px solid ${isToday?"rgba(255,255,255,.1)":"#f1f5f9"}`}}>{isReadOnly?"":"+"}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ──────────────────────────────────────────────────────
  // MODE MOIS
  // ──────────────────────────────────────────────────────
  const vueMois=()=>{
    const cells=[];
    for(let i=0;i<premierJour;i++) cells.push(null);
    for(let d=1;d<=nbJours;d++) cells.push(d);

    return(
      <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
        {/* Entêtes jours */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
          {JOURS.map(j=><div key={j} style={{textAlign:"center",fontSize:9,fontWeight:800,color:"#94a3b8",padding:"4px 0"}}>{j}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
          {cells.map((d,idx)=>{
            if(!d) return <div key={idx}/>;
            const ds=`${moisY}-${String(moisM).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const taches=filtrerTaches(data.taches.filter(t=>t.date===ds));
            const isToday=ds===TODAY;
            const hasFin=taches.some(t=>t.statut==="termine");
            const hasPb=taches.some(t=>t.statut==="probleme");
            return(
              <div key={idx} onClick={()=>{if(!isReadOnly&&onNewTache)onNewTache(ds);}}
                style={{minHeight:56,borderRadius:10,background:isToday?GOLD_DARK:hasPb?"#fff0f0":hasFin&&taches.length>0&&taches.every(t=>t.statut==="termine")?"#e8fdf0":"white",border:`1.5px solid ${isToday?GOLD_DARK:hasPb?"#e07070":"#f0f4f8"}`,padding:"4px 5px",cursor:"pointer",position:"relative"}}>
                <div style={{fontSize:11,fontWeight:900,color:isToday?"white":hasPb?"#d9534f":"#1e293b",marginBottom:2}}>{d}</div>
                {taches.slice(0,3).map(t=>{
                  const e=emp(t.employeId);
                  return(
                    <div key={t.id} onClick={ev=>{ev.stopPropagation();if(onEditTache)onEditTache(t);}}
                      style={{fontSize:8,fontWeight:700,color:isToday?"rgba(255,255,255,.85)":"#1e293b",background:isToday?"rgba(255,255,255,.15)":(e?.couleur||"#ccc")+"33",borderRadius:4,padding:"1px 4px",marginBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {t.heure} {t.type}
                    </div>
                  );
                })}
                {taches.length>3&&<div style={{fontSize:7,color:"#94a3b8",fontWeight:700}}>+{taches.length-3} autre{taches.length-3>1?"s":""}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",minHeight:0}}>
      {/* ── Barre contrôles ── */}
      <div style={{padding:"8px 10px 6px",background:"white",borderBottom:"1px solid #e8edf3",flexShrink:0}}>
        {/* Sélecteur de mode */}
        <div style={{display:"flex",background:"#f1f5f9",borderRadius:12,padding:3,gap:2,marginBottom:8}}>
          {[{id:"jour",l:"Jour"},{id:"semaine",l:"Semaine"},{id:"mois",l:"Mois"}].map(m=>(
            <button key={m.id} style={S.tab(planMode===m.id)} onClick={()=>setPlanMode(m.id)}>{m.l}</button>
          ))}
        </div>

        {/* Navigation + filtre */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <button onClick={()=>planMode==="jour"?setDayOff(d=>d-1):planMode==="mois"?setMoisOff(d=>d-1):setWeekOff(w=>w-1)}
            style={{border:"none",background:"#f1f5f9",borderRadius:9,width:34,height:34,cursor:"pointer",fontSize:18,fontWeight:700,color:GOLD_DARK,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <span style={{fontWeight:800,fontSize:12,color:GOLD_DARK,textAlign:"center"}}>
            {planMode==="jour"&&curDay.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}
            {planMode==="semaine"&&(weekOff===0?"Cette semaine":weekOff===1?"Sem. suivante":weekOff===-1?"Sem. passée":"Sem. "+(weekOff>0?"+":"")+weekOff)}
            {planMode==="mois"&&`${MOIS_LONG[moisM-1]} ${moisY}`}
          </span>
          <button onClick={()=>planMode==="jour"?setDayOff(d=>d+1):planMode==="mois"?setMoisOff(d=>d+1):setWeekOff(w=>w+1)}
            style={{border:"none",background:"#f1f5f9",borderRadius:9,width:34,height:34,cursor:"pointer",fontSize:18,fontWeight:700,color:GOLD_DARK,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        </div>

        <select style={{...S.sel,marginBottom:0,fontSize:13,padding:"7px 10px"}} value={filterEmp} onChange={e=>setFilterEmp(e.target.value)}>
          <option value="tous">👥 Tous les employés</option>
          {data.employes.map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}
        </select>
      </div>

      {/* Contenu selon mode */}
      {planMode==="jour"&&{vueJour()}}
      {planMode==="semaine"&&{vueSemaine()}}
      {planMode==="mois"&&{vueMois()}}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VUE ÉQUIPE
// ══════════════════════════════════════════════════════════════════════════════
function Equipe({data,onEdit}){
  return(
    <div style={S.sec}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={S.secTit}>Équipe ({data.employes.length})</div>
        <button onClick={()=>onEdit(null)} style={{...S.bPri,width:"auto",padding:"7px 14px",fontSize:12}}>+ Ajouter</button>
      </div>
      {data.employes.map(e=>{
        const nb=data.taches.filter(t=>t.employeId===e.id).length;
        const done=data.taches.filter(t=>t.employeId===e.id&&t.statut==="termine").length;
        const p=nb>0?Math.round(done/nb*100):0;
        const logsM=new Set(data.taches.filter(t=>{
          if(!t.date) return false;
          const [y,m]=t.date.split("-");
          return parseInt(y)===NOW_Y&&parseInt(m)===NOW_M&&t.employeId===e.id&&t.statut==="termine";
        }).map(t=>t.zoneId)).size;
        const ROLES=[{id:"admin",label:"Admin",color:GOLD},{id:"manager",label:"Manager",color:GOLD_DARK},{id:"employe",label:"Employé",color:GOLD}];
        const role=ROLES.find(r=>r.id===(e.role||"employe"))||ROLES[2];
        return(
          <div key={e.id} style={S.card} onClick={()=>onEdit(e)}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Avatar emp={e} size={54}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                  <span style={{fontWeight:700,fontSize:15}}>{e.nom}</span>
                  <span style={{fontSize:9,background:role.color+"22",color:role.color,borderRadius:20,padding:"2px 8px",fontWeight:700}}>{role.label}</span>
                  <span style={{fontSize:10,color:e.actif?GOLD:TXT3,fontWeight:700}}>{e.actif?"● Actif":"● Inactif"}</span>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                  {e.tel&&<a href={`tel:${e.tel}`} onClick={ev=>ev.stopPropagation()} style={{fontSize:11,background:GOLD_BG,color:GOLD_DARK,borderRadius:8,padding:"3px 10px",textDecoration:"none",fontWeight:700}}>📞 {e.tel}</a>}
                  {e.email&&<a href={`mailto:${e.email}`} onClick={ev=>ev.stopPropagation()} style={{fontSize:11,background:GOLD_BG,color:GOLD_DARK,borderRadius:8,padding:"3px 10px",textDecoration:"none",fontWeight:700}}>✉️ {e.email}</a>}
                </div>
                <div style={{fontSize:11,color:"#94a3b8",marginBottom:4}}>{nb} tâche(s) · {done} ✓ · <span style={{color:GOLD,fontWeight:700}}>🏠 {logsM} ce mois</span></div>
                <div style={S.bar}><div style={{...S.barF(e.couleur),width:p+"%"}}></div></div>
              </div>
              <span style={{color:"#cbd5e1",fontSize:18}}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STREET VIEW
// ══════════════════════════════════════════════════════════════════════════════
function StreetViewThumb({adresse}){
  const [show,setShow]=useState(false);
  if(!adresse) return null;
  return(
    <div style={{marginBottom:8}}>
      {!show?(
        <button onClick={()=>setShow(true)} style={{width:"100%",background:"linear-gradient(135deg,#0d0d0d,#1c1808)",border:"none",borderRadius:10,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:"white"}}>
          <span style={{fontSize:20}}>🛣️</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:12,fontWeight:700}}>Vue Street View</div>
            <div style={{fontSize:10,opacity:.6,marginTop:1}}>Appuyez pour voir la rue</div>
          </div>
          <span style={{marginLeft:"auto",fontSize:14,opacity:.5}}>▸</span>
        </button>
      ):(
        <div style={{borderRadius:12,overflow:"hidden",position:"relative"}}>
          <iframe title="street-view" width="100%" height="180" frameBorder="0" style={{display:"block",borderRadius:12}}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(adresse)}&layer=c&cbll=0,0&cbp=12,0,,0,0&output=svembed`} allowFullScreen/>
          <button onClick={()=>setShow(false)} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,.55)",border:"none",borderRadius:20,color:"white",fontSize:11,fontWeight:700,padding:"3px 10px",cursor:"pointer"}}>✕ Fermer</button>
          <a href={mapsUrl(adresse)} target="_blank" rel="noreferrer" style={{position:"absolute",bottom:6,right:6,background:"rgba(15,52,96,.85)",border:"none",borderRadius:8,color:"white",fontSize:10,fontWeight:700,padding:"4px 10px",textDecoration:"none",display:"block"}}>📍 Ouvrir Maps</a>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VUE LOGEMENTS
// ══════════════════════════════════════════════════════════════════════════════
function Logements({data,onEdit,onOpenTypes,isReadOnly=false}){
  return(
    <div style={S.sec}>
      {!isReadOnly&&(
      <div style={{background:"linear-gradient(135deg,#1a1408,#c9a84c)",borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={onOpenTypes}>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:"white"}}>⚙️ Types de tâches personnalisés</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",marginTop:2}}>{(data.typesPerso||[]).length} types · Appuyez pour modifier</div>
        </div>
        <span style={{color:"rgba(255,255,255,.5)",fontSize:20}}>›</span>
      </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={S.secTit}>Logements ({data.zones.length})</div>
        {!isReadOnly&&onEdit&&<button onClick={()=>onEdit(null)} style={{...S.bPri,width:"auto",padding:"7px 14px",fontSize:12}}>+ Ajouter</button>}
      </div>
      {data.zones.map(z=>{
        const nb=data.taches.filter(t=>t.zoneId===z.id).length;
        const done=data.taches.filter(t=>t.zoneId===z.id&&t.statut==="termine").length;
        const p=nb>0?Math.round(done/nb*100):0;
        return(
          <div key={z.id} style={S.card}>
            <div style={{display:"flex",gap:12,marginBottom:10,cursor:onEdit&&!isReadOnly?"pointer":"default"}} onClick={()=>onEdit&&!isReadOnly&&onEdit(z)}>
              <div style={{width:72,height:72,borderRadius:12,overflow:"hidden",background:"#f1f5f9",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {z.photo?<img src={z.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:30}}>🏠</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:5}}>{z.nom}</div>
                <div style={S.bar}><div style={{...S.barF(GOLD_DARK),width:p+"%"}}></div></div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>{done}/{nb} tâches · ✏️ Modifier</div>
              </div>
            </div>
            <StreetViewThumb adresse={z.adresse}/>
            {z.adresse&&(
              <div style={{display:"flex",alignItems:"flex-start",gap:8,background:"#f8fafc",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <span style={{fontSize:16,flexShrink:0}}>📍</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:"#1e293b",fontWeight:600,marginBottom:4}}>{z.adresse}</div>
                  <a href={mapsUrl(z.adresse)} target="_blank" rel="noreferrer" style={{fontSize:11,color:GOLD_DARK,fontWeight:700,textDecoration:"none",background:GOLD_BG,borderRadius:8,padding:"3px 10px",display:"inline-block"}}>🗺️ Ouvrir dans Maps</a>
                </div>
              </div>
            )}
            {z.codeBoite&&(
              <div style={{display:"flex",alignItems:"center",gap:10,background:"#fff8e1",borderRadius:10,padding:"10px 12px",border:"1px solid #ffe082"}}>
                <span style={{fontSize:20}}>🔑</span>
                <div>
                  <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Code boîte à clé</div>
                  <div style={{fontSize:24,fontWeight:900,letterSpacing:5}}>{z.codeBoite}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VUE HISTORIQUE
// ══════════════════════════════════════════════════════════════════════════════
function Historique({data,currentUser,isEmp,toast_}){
  const now=new Date();
  const [moisSel,setMoisSel]=useState(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`);
  const moisDispo=Array.from({length:12},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    return{v:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,l:`${MOIS_LONG[d.getMonth()]} ${d.getFullYear()}`};
  });
  const tachesMois=data.taches.filter(t=>{if(!t.date)return false;const[y,m]=t.date.split("-");return`${y}-${m}`===moisSel&&t.statut==="termine";});
  const emp=id=>data.employes.find(e=>e.id===id);
  const zone=id=>data.zones.find(z=>z.id===id);
  const parLog={};
  tachesMois.forEach(t=>{if(!parLog[t.zoneId]){parLog[t.zoneId]={zone:zone(t.zoneId),taches:[]};}parLog[t.zoneId].taches.push(t);});
  const nbTotal=tachesMois.length;
  const empActifs=[...new Set(tachesMois.map(t=>t.employeId))];

  return(
    <div>
      <div style={{...S.sec,paddingBottom:10}}>
        <div style={S.secTit}>Historique mensuel</div>
        <select style={S.sel} value={moisSel} onChange={e=>setMoisSel(e.target.value)}>
          {moisDispo.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 12px",marginBottom:10}}>
        <div style={{background:"linear-gradient(135deg,#2d7a2d,#1a5c1a)",borderRadius:12,padding:"12px 8px",color:"white",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900}}>{nbTotal}</div><div style={{fontSize:9,opacity:.85,marginTop:2}}>Tâches ✓</div></div>
        <div style={{background:"linear-gradient(135deg,#1a1408,#c9a84c)",borderRadius:12,padding:"12px 8px",color:"white",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900}}>{Object.keys(parLog).length}</div><div style={{fontSize:9,opacity:.85,marginTop:2}}>Logements</div></div>
        <div style={{background:"linear-gradient(135deg,#c9a84c,#9a7530)",borderRadius:12,padding:"12px 8px",color:"white",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900}}>{empActifs.length}</div><div style={{fontSize:9,opacity:.85,marginTop:2}}>Employés</div></div>
      </div>
      {nbTotal===0&&<div style={{...S.card,color:"#94a3b8",textAlign:"center",fontSize:14,padding:"32px 16px"}}>📭 Aucune tâche terminée ce mois-ci</div>}
      {Object.values(parLog).map(({zone:z,taches})=>(
        <div key={z?.id} style={S.card}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #f1f5f9"}}>
            <div style={{width:44,height:44,borderRadius:10,overflow:"hidden",background:"#f1f5f9",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {z?.photo?<img src={z.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:20}}>🏠</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:14}}>{z?.nom||"?"}</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{taches.length} tâche(s) terminée(s)</div>
            </div>
            <div style={{background:GOLD_BG,color:GOLD,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700}}>{taches.length} ✓</div>
          </div>
          {taches.sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(t=>{
            const e=emp(t.employeId);
            const d=t.date?new Date(t.date):null;
            return(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #f8fafc"}}>
                <Avatar emp={e} size={28}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{t.type}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{e?.nom||"?"} · {t.heure}</div>
                </div>
                {d&&<div style={{fontSize:11,color:"#64748b",fontWeight:600}}>{d.getDate()} {MOIS_COURT[d.getMonth()]}</div>}
              </div>
            );
          })}
        </div>
      ))}
      {nbTotal>0&&(
        <div style={{padding:"0 12px 12px"}}>
          <button style={S.bSec} onClick={()=>{
            const ml=moisDispo.find(m=>m.v===moisSel)?.l||moisSel;
            let txt=`=== RÉCAPITULATIF ${ml.toUpperCase()} ===\n\n`;
            Object.values(parLog).forEach(({zone:z,taches})=>{
              txt+=`📍 ${z?.nom||"?"}\n`;
              if(z?.adresse)txt+=`   Adresse : ${z.adresse}\n`;
              taches.forEach(t=>{const e=emp(t.employeId);txt+=`   ✓ ${t.date||"?"} ${t.heure} — ${t.type} (${e?.nom||"?"})\n`;});
              txt+=`   Sous-total : ${taches.length} tâche(s)\n\n`;
            });
            txt+=`TOTAL : ${nbTotal} tâche(s) terminée(s) · ${Object.keys(parLog).length} logement(s)`;
            navigator.clipboard.writeText(txt).then(()=>toast_("📋 Récapitulatif copié !")).catch(()=>toast_("Copie impossible","err"));
          }}>📋 Copier le récapitulatif (pour facture)</button>
        </div>
      )}
    </div>
  );
}

// ── HistoriqueInline — version intégrée dans Paramètres ─────────────────────
function HistoriqueInline({data,toast_,nightMode}){
  const now=new Date();
  const [moisSel,setMoisSel]=useState(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`);
  const MOIS_LONG_H=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const MOIS_COURT_H=["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
  const moisDispo=Array.from({length:12},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    return{v:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,l:`${MOIS_LONG_H[d.getMonth()]} ${d.getFullYear()}`};
  });
  const tachesMois=data.taches.filter(t=>{if(!t.date)return false;const[y,m]=t.date.split("-");return`${y}-${m}`===moisSel&&t.statut==="termine";});
  const empH=id=>data.employes.find(e=>e.id===id);
  const zoneH=id=>data.zones.find(z=>z.id===id);
  const parLog={};
  tachesMois.forEach(t=>{if(!parLog[t.zoneId]){parLog[t.zoneId]={zone:zoneH(t.zoneId),taches:[]};}parLog[t.zoneId].taches.push(t);});
  const nbTotal=tachesMois.length;
  const empActifs=[...new Set(tachesMois.map(t=>t.employeId))];

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{fontWeight:900,fontSize:15,color:TXT}}>⧗ Historique mensuel</div>
        <select style={{borderRadius:8,border:"1px solid #e2e8f0",padding:"5px 8px",fontSize:12,background:"white",color:TXT,cursor:"pointer"}}
          value={moisSel} onChange={e=>setMoisSel(e.target.value)}>
          {moisDispo.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        <div style={{background:"linear-gradient(135deg,#2d7a2d,#1a5c1a)",borderRadius:12,padding:"12px 8px",color:"white",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900}}>{nbTotal}</div><div style={{fontSize:9,opacity:.85,marginTop:2}}>Tâches ✓</div></div>
        <div style={{background:"linear-gradient(135deg,#1a1408,#c9a84c)",borderRadius:12,padding:"12px 8px",color:"white",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900}}>{Object.keys(parLog).length}</div><div style={{fontSize:9,opacity:.85,marginTop:2}}>Logements</div></div>
        <div style={{background:"linear-gradient(135deg,#c9a84c,#9a7530)",borderRadius:12,padding:"12px 8px",color:"white",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900}}>{empActifs.length}</div><div style={{fontSize:9,opacity:.85,marginTop:2}}>Employés</div></div>
      </div>
      {nbTotal===0&&<div style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:"24px 0"}}>📭 Aucune tâche terminée ce mois-ci</div>}
      {Object.values(parLog).map(({zone:z,taches})=>(
        <div key={z?.id} style={{background:"white",borderRadius:14,padding:14,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #f1f5f9"}}>
            <div style={{width:40,height:40,borderRadius:10,overflow:"hidden",background:"#f1f5f9",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {z?.photo?<img src={z.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:18}}>🏠</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:13}}>{z?.nom||"?"}</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{taches.length} tâche(s)</div>
            </div>
            <div style={{background:GOLD_BG,color:GOLD,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{taches.length} ✓</div>
          </div>
          {taches.sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(t=>{
            const e=empH(t.employeId);
            const d=t.date?new Date(t.date):null;
            return(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid #f8fafc"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:e?.couleur||"#ccc",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white",fontWeight:900,overflow:"hidden"}}>
                  {e?.photo?<img src={e.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(e?.nom||"?")[0]}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:12}}>{t.type}</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{e?.nom||"?"} · {t.heure}</div>
                </div>
                {d&&<div style={{fontSize:10,color:"#64748b",fontWeight:600}}>{d.getDate()} {MOIS_COURT_H[d.getMonth()]}</div>}
              </div>
            );
          })}
        </div>
      ))}
      {nbTotal>0&&(
        <button style={{width:"100%",padding:"11px",background:GOLD_BG,color:GOLD_DARK,border:`1px solid ${GOLD}44`,borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}
          onClick={()=>{
            const ml=moisDispo.find(m=>m.v===moisSel)?.l||moisSel;
            let txt=`=== RÉCAPITULATIF ${ml.toUpperCase()} ===\n\n`;
            Object.values(parLog).forEach(({zone:z,taches})=>{
              txt+=`📍 ${z?.nom||"?"}\n`;
              if(z?.adresse)txt+=`   Adresse : ${z.adresse}\n`;
              taches.forEach(t=>{const e=empH(t.employeId);txt+=`   ✓ ${t.date||"?"} ${t.heure} — ${t.type} (${e?.nom||"?"})\n`;});
              txt+=`   Sous-total : ${taches.length} tâche(s)\n\n`;
            });
            txt+=`TOTAL : ${nbTotal} tâche(s) · ${Object.keys(parLog).length} logement(s)`;
            navigator.clipboard.writeText(txt).then(()=>toast_("📋 Récapitulatif copié !")).catch(()=>toast_("Copie impossible","err"));
          }}>📋 Copier le récapitulatif</button>
      )}
    </div>
  );
}


// ── PinRow — composant isolé pour éviter hooks dans .map() ──────────────────
function PinRow({emp,onSavePin}){
  const [edit,setEdit]=useState(false);
  const [val,setVal]=useState(emp.pin||"");
  const hasPins=emp.pin&&emp.pin.trim()!=="";
  return(
    <div style={S.card}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:edit?12:0}}>
        <Avatar emp={emp} size={44}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:TXT}}>{emp.nom}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
            {hasPins
              ?<span style={{fontSize:13,letterSpacing:5,color:GOLD}}>••••</span>
              :<span style={{fontSize:11,background:`${GOLD}18`,color:GOLD_DARK,borderRadius:20,padding:"2px 10px",fontWeight:700}}>🔓 Accès libre (sans PIN)</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {hasPins&&<button onClick={()=>{onSavePin(emp.id,"");setVal("");setEdit(false);}} style={{...S.bDng,marginTop:0,width:"auto",padding:"6px 10px",fontSize:11}}>Supprimer</button>}
          <button onClick={()=>{setVal(emp.pin||"");setEdit(e=>!e);}} style={{...S.bSec,marginTop:0,width:"auto",padding:"6px 14px",fontSize:12}}>{edit?"Annuler":"✏️ Définir"}</button>
        </div>
      </div>
      {edit&&(
        <div>
          <div style={{fontSize:11,color:TXT2,marginBottom:8}}>Saisir un nouveau code PIN à 4 chiffres :</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input style={{...S.inp,marginBottom:0,flex:1,letterSpacing:10,fontSize:24,textAlign:"center",fontWeight:900}}
              type="password" maxLength={4} placeholder="••••"
              value={val} onChange={ev=>setVal(ev.target.value.replace(/\D/g,"").slice(0,4))}/>
            <button style={{...S.bPri,marginTop:0,width:"auto",padding:"10px 16px",fontSize:13}} onClick={()=>{onSavePin(emp.id,val);setEdit(false);}}>💾</button>
          </div>
          {val===""&&<div style={{fontSize:11,color:GOLD_DARK,marginTop:6}}>💡 Laisser vide = supprimer le PIN (accès libre)</div>}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VUE PARAMÈTRES — avec onglets : Équipe + Gestion droits + PIN + Général
// ══════════════════════════════════════════════════════════════════════════════
function Parametres({data,setData,onEditEmp,toast_,nightMode,toggleNightMode}){
  const [onglet,setOnglet]=useState(null); // null = menu principal
  const [notifDetail,setNotifDetail]=useState(null);

  // Mark notifications as read when opening notifs tab
  function ouvrirNotifs(){
    setData(d=>({...d,notifications:(d.notifications||[]).map(n=>({...n,lu:true}))}));
    setOnglet("notifs");
  }

  const ROLES=[
    {id:"admin",   label:"Administrateur", desc:"Accès complet",   color:GOLD, bg:"#f3f0ff"},
    {id:"manager", label:"Manager",         desc:"Crée et gère les tâches", color:GOLD_DARK, bg:GOLD_BG},
    {id:"employe", label:"Employé",         desc:"Ses tâches uniquement", color:GOLD, bg:GOLD_BG},
  ];

  function setRole(empId,role){
    setData(d=>({...d,employes:d.employes.map(e=>e.id===empId?{...e,role}:e)}));
    toast_("Rôle mis à jour ✓");
  }
  function setPin(empId,pin){
    setData(d=>({...d,employes:d.employes.map(e=>e.id===empId?{...e,pin}:e)}));
  }
  function toggleActif(empId){
    setData(d=>({...d,employes:d.employes.map(e=>e.id===empId?{...e,actif:!e.actif}:e)}));
    toast_("Statut mis à jour ✓");
  }

  const nbNotifsBadge=(data.notifications||[]).filter(n=>n.type==="probleme"&&!n.lu).length;

  const menuItems=[
    {id:"gestion_equipe", icon:"👥", label:"Gestion Équipe",   desc:"Membres, rôles, droits et PIN"},
    {id:"historique",     icon:"⧗", label:"Historique",       desc:"Tâches terminées & récapitulatif"},
    {id:"notifs",         icon:"🔔", label:"Notifications",    desc:"Activité récente", badge:nbNotifsBadge},
    {id:"nuit",           icon:"🌙", label:"Mode nuit",        desc:"Interface sombre"},
  ];

  // ── Menu principal vertical ──
  if(!onglet) return(
    <div style={{padding:"14px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontWeight:900,fontSize:16,color:TXT}}>⚙️ Admin</div>
        <div style={{fontSize:11,color:GOLD_DARK,fontWeight:700,background:GOLD_BG,borderRadius:20,padding:"3px 10px",border:`1px solid ${GOLD}44`}}>v{APP_VERSION}</div>
      </div>
      {menuItems.map((item,i)=>(
        <div key={item.id} onClick={()=>item.id==="notifs"?ouvrirNotifs():setOnglet(item.id)}
          style={{display:"flex",alignItems:"center",gap:14,background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${BORDER}`,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
          <div style={{width:44,height:44,borderRadius:12,background:GOLD_BG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{item.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:TXT}}>{item.label}</div>
            <div style={{fontSize:12,color:TXT2,marginTop:2}}>{item.desc}</div>
          </div>
          {item.badge>0&&<span style={{background:"#ef4444",color:"white",borderRadius:20,minWidth:20,height:20,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{item.badge}</span>}
          <span style={{color:TXT3,fontSize:20}}>›</span>
        </div>
      ))}
    </div>
  );

  // ── Bouton retour ──
  const retourEl==>(
    <button onClick={()=>setOnglet(null)} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:GOLD_DARK,fontWeight:700,fontSize:13,cursor:"pointer",padding:"12px 12px 4px"}}>
      ← Retour
    </button>
  );

  return(
    <div>
      {retourEl}

      {/* ── GESTION ÉQUIPE (Équipe + Droits + PIN fusionnés) ── */}
      {onglet==="gestion_equipe"&&(
        <div style={{padding:"0 12px 14px"}}>
          <div style={{fontWeight:900,fontSize:16,color:TXT,marginBottom:14}}>👥 Gestion Équipe</div>

          {/* Liste membres */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={S.secTit}>Membres ({data.employes.length})</div>
            <button onClick={()=>onEditEmp(null)} style={{...S.bPri,width:"auto",padding:"7px 14px",fontSize:12}}>+ Ajouter</button>
          </div>
          {data.employes.map(e=>{
            const role=ROLES.find(r=>r.id===(e.role||"employe"))||ROLES[2];
            return(
              <div key={e.id} style={{...S.card,marginBottom:10}}>
                {/* Infos employé */}
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}} onClick={()=>onEditEmp(e)}>
                  <Avatar emp={e} size={50}/>
                  <div style={{flex:1,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <span style={{fontWeight:700,fontSize:15}}>{e.nom}</span>
                      <span style={{fontSize:9,background:role.color+"22",color:role.color,borderRadius:20,padding:"2px 8px",fontWeight:700}}>{role.label}</span>
                      <span style={{fontSize:10,color:e.actif?GOLD:TXT3,fontWeight:700}}>{e.actif?"● Actif":"● Inactif"}</span>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {e.tel&&<span style={{fontSize:10,color:"#64748b"}}>📞 {e.tel}</span>}
                      {e.email&&<span style={{fontSize:10,color:"#64748b"}}>✉️ {e.email}</span>}
                    </div>
                  </div>
                  <span style={{color:"#cbd5e1",fontSize:18}}>›</span>
                </div>

                {/* Rôle */}
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:11,fontWeight:700,color:TXT2,marginBottom:5}}>🔐 Rôle</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {ROLES.map(r=>(
                      <button key={r.id} onClick={()=>setRole(e.id,r.id)}
                        style={{padding:"5px 10px",borderRadius:20,border:`1.5px solid ${(e.role||"employe")===r.id?r.color:"#e2e8f0"}`,background:(e.role||"employe")===r.id?r.color:"white",color:(e.role||"employe")===r.id?"white":r.color,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PIN admin */}
                <PinRow emp={e} onSavePin={(id,pin)=>{setPin(id,pin);toast_("PIN mis à jour ✓");}}/>

                {/* Actif/Inactif */}
                <button onClick={()=>toggleActif(e.id)} style={{...S.bSec,marginTop:6,fontSize:12,padding:"7px"}}>
                  {e.actif?"⏸ Désactiver":"✅ Réactiver"} {e.nom.split(" ")[0]}
                </button>
              </div>
            );
          })}
          {data.employes.length===0&&<div style={{...S.card,textAlign:"center",color:"#94a3b8",padding:"28px",fontSize:13}}>👥 Aucun employé</div>}
        </div>
      )}


      {/* ── HISTORIQUE ── */}
      {onglet==="historique"&&(
        <div style={{padding:"0 12px 14px"}}>
          <HistoriqueInline data={data} toast_={toast_} nightMode={nightMode}/>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {onglet==="notifs"&&(
        <div style={{padding:"0 12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontWeight:900,fontSize:16,color:TXT}}>🔔 Notifications</div>
            {(data.notifications||[]).some(n=>n.type==="probleme")&&(
              <button onClick={()=>setData(d=>({...d,notifications:(d.notifications||[]).filter(n=>n.type!=="probleme")}))}
                style={{border:"1px solid #fecaca",background:"#fef2f2",color:"#dc2626",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                🗑️ Tout effacer
              </button>
            )}
          </div>
          {(data.notifications||[]).length===0&&(
            <div style={{...S.card,textAlign:"center",color:"#94a3b8",padding:"32px",fontSize:13}}>
              🔔 Aucune notification pour l'instant<br/>
              <span style={{fontSize:11,marginTop:6,display:"block"}}>Les problèmes signalés apparaîtront ici</span>
            </div>
          )}
          {(data.notifications||[]).slice().reverse().map((n,i)=>{
            const empN=data.employes.find(e=>e.id===n.empId);
            const zoneN=data.zones.find(z=>z.id===n.zoneId);
            const isProbleme=n.type==="probleme";
            const hasDetail=isProbleme&&(n.note||n.photo);
            return(
              <div key={i}
                onClick={()=>hasDetail&&setNotifDetail(n)}
                style={{...S.card,display:"flex",gap:12,alignItems:"flex-start",
                  cursor:hasDetail?"pointer":"default",
                  border:isProbleme?"1.5px solid #fecaca":undefined,
                  background:isProbleme?(nightMode?"#2a1010":"#fff8f8"):undefined,
                  position:"relative",overflow:"hidden"}}>
                {isProbleme&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:"#dc2626",borderRadius:"18px 0 0 18px"}}/>}
                <div style={{width:40,height:40,borderRadius:12,background:isProbleme?"#fdecea":GOLD_BG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,marginLeft:isProbleme?4:0}}>
                  {n.type==="nouvelle"?"📋":isProbleme?"⚠️":"✅"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:isProbleme?"#b91c1c":TXT}}>{n.msg}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:3,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {empN&&<span style={{background:(empN.couleur||"#ccc")+"22",color:empN.couleur||"#888",borderRadius:20,padding:"1px 7px",fontWeight:600}}>👤 {empN.nom}</span>}
                    {zoneN&&<span style={{background:"#f1f5f9",borderRadius:20,padding:"1px 7px"}}>🏠 {zoneN.nom}</span>}
                  </div>
                  {n.note&&(
                    <div style={{fontSize:11,color:"#6b7280",marginTop:4,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      📝 {n.note}
                    </div>
                  )}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
                    <div style={{fontSize:10,color:"#cbd5e1"}}>{n.ts}</div>
                    {hasDetail&&<div style={{fontSize:11,color:"#dc2626",fontWeight:700}}>{n.photo?"📷 ":""}Voir détail →</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL DÉTAIL PROBLÈME ── */}
      {notifDetail&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",backdropFilter:"blur(8px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>e.target===e.currentTarget&&setNotifDetail(null)}>
          <div style={{background:nightMode?"#1e1e2e":"white",borderRadius:"24px 24px 0 0",padding:"20px 20px 40px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",borderTop:"3px solid #dc2626"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{width:44,height:44,borderRadius:12,background:"#fdecea",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>⚠️</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,fontSize:15,color:"#b91c1c"}}>{notifDetail.msg}</div>
                <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{notifDetail.ts}</div>
              </div>
              <button onClick={()=>setNotifDetail(null)}
                style={{border:"none",background:"#f4f4f5",borderRadius:10,width:34,height:34,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",color:"#52525b",flexShrink:0}}>✕</button>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {(()=>{const e=data.employes.find(x=>x.id===notifDetail.empId);return e&&(
                <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:12,padding:"8px 12px",border:"1px solid #e2e8f0",flex:1}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:e.couleur||"#ccc",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
                    {e.photo?<img src={e.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:"white",fontWeight:900,fontSize:13}}>{(e.nom||"?")[0]}</span>}
                  </div>
                  <div><div style={{fontWeight:700,fontSize:13}}>{e.nom}</div><div style={{fontSize:10,color:"#94a3b8"}}>Employé(e)</div></div>
                </div>
              );})()}
              {(()=>{const z=data.zones.find(x=>x.id===notifDetail.zoneId);return z&&(
                <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:12,padding:"8px 12px",border:"1px solid #e2e8f0",flex:1}}>
                  <span style={{fontSize:22}}>🏠</span>
                  <div><div style={{fontWeight:700,fontSize:13}}>{z.nom}</div><div style={{fontSize:10,color:"#94a3b8"}}>Logement</div></div>
                </div>
              );})()}
            </div>

            {notifDetail.note&&(
              <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:"#dc2626",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>📝 Note de l'employé</div>
                <div style={{fontSize:14,color:"#1e293b",lineHeight:1.65,fontStyle:"italic"}}>"{notifDetail.note}"</div>
              </div>
            )}

            {notifDetail.photo&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:"#dc2626",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>📷 Photo du problème</div>
                <img src={notifDetail.photo} alt="photo problème"
                  onClick={()=>window.open(notifDetail.photo,"_blank")}
                  style={{width:"100%",borderRadius:14,objectFit:"cover",maxHeight:280,border:"2px solid #fecaca",cursor:"zoom-in",display:"block"}}/>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:5,textAlign:"center"}}>Appuyer sur la photo pour l'agrandir</div>
              </div>
            )}

            {notifDetail.tacheId&&(()=>{
              const t=data.taches.find(x=>x.id===notifDetail.tacheId);
              return t?(
                <div style={{background:"#f8fafc",borderRadius:14,padding:"12px 14px",border:"1px solid #e2e8f0",marginBottom:14}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>📋 Tâche concernée</div>
                  <div style={{fontWeight:700,fontSize:14}}>{t.type}</div>
                  <div style={{fontSize:12,color:"#64748b",marginTop:2}}>⏰ {t.heure} · {t.date}</div>
                </div>
              ):null;
            })()}

            <button onClick={()=>{
              const idx=(data.notifications||[]).slice().reverse().indexOf(notifDetail);
              setData(d=>{const rev=[...(d.notifications||[])].reverse();rev.splice(idx,1);return{...d,notifications:rev.reverse()};});
              setNotifDetail(null);
            }} style={{width:"100%",padding:"13px",background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>
              🗑️ Effacer cette notification
            </button>
          </div>
        </div>
      )}


      {/* ── MODE NUIT ── */}
      {onglet==="nuit"&&(
        <div style={{padding:"0 12px 14px"}}>
          <div style={{fontWeight:900,fontSize:16,color:TXT,marginBottom:14}}>🌙 Mode nuit</div>
          <div style={{...S.card,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:nightMode?"#120f00":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,transition:"all .3s"}}>
                {nightMode?"🌙":"☀️"}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{nightMode?"Mode nuit activé":"Mode jour"}</div>
                <div style={{fontSize:12,color:"#94a3b8",marginTop:1}}>{nightMode?"Interface sombre":"Interface claire"}</div>
              </div>
            </div>
            <div onClick={toggleNightMode}
              style={{width:52,height:28,borderRadius:14,background:nightMode?GOLD:"#e2e8f0",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"white",position:"absolute",top:3,left:nightMode?27:3,transition:"left .3s",boxShadow:"0 2px 6px rgba(0,0,0,.25)"}}/>
            </div>
          </div>
        </div>
      )}
      {/* ── Numéro de version ── */}
      <div style={{textAlign:"center",padding:"20px 0 10px",color:TXT3,fontSize:10,letterSpacing:.5}}>
        CKeys · v{APP_VERSION}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VUE MESSAGES — chat entre employés et admin
// ══════════════════════════════════════════════════════════════════════════════
function Messages({data,setData,currentUser,toast_}){
  const isAdmin=currentUser.role==="admin"||currentUser.role==="manager";
  // onglet: "conversations" | "archives"
  const [onglet,setOnglet]=useState("conversations");
  // conversation sélectionnée: {type:"employe"|"zone", id}
  const [convSel,setConvSel]=useState(null);
  const [texte,setTexte]=useState("");
  const [zoneId,setZoneId]=useState("");
  const endRef=useRef(null);

  const allMsgs=(data.messages||[]);
  // Zones où l'employé a des tâches (pour accéder aux conv de logement)
  const mesZoneIds=isAdmin
    ? data.zones.map(z=>z.id)
    : [...new Set(data.taches.filter(t=>t.employeId===currentUser.id).map(t=>t.zoneId))];
  // Messages visibles: admin=tout, employé=ses msgs + msgs adressés + msgs de ses zones
  const msgVisibles=allMsgs.filter(m=>{
    if(isAdmin) return true;
    return m.empId===currentUser.id
      || m.destinataireId===currentUser.id
      || (m.zoneId&&mesZoneIds.includes(m.zoneId));
  });

  const msgActifs=msgVisibles.filter(m=>!m.archive);
  function ouvrirConversation(conv){
    // mark messages in this conversation as read
    setData(d=>({...d,messages:(d.messages||[]).map(m=>{
      if(m.lu) return m;
      const match=conv.type==="employe"
        ?(m.empId===conv.id&&(m.destinataireId===currentUser.id||!m.destinataireId))
        :conv.type==="zone"?(m.zoneId===conv.id)
        :(m.empId!==currentUser.id);
      return match?{...m,lu:true}:m;
    })}));
    setConvSel(conv);
  }
  const msgArchives=msgVisibles.filter(m=>m.archive);

  const emp=id=>data.employes.find(e=>e.id===id);
  const zone=id=>data.zones.find(z=>z.id===id);

  // Construire liste conversations (par employé pour admin, par zone pour tous)
  const convEmployes=isAdmin?data.employes.filter(e=>e.id!==currentUser.id&&msgActifs.some(m=>m.empId===e.id||m.destinataireId===e.id)):[];
  const convZones=data.zones.filter(z=>msgActifs.some(m=>m.zoneId===z.id));

  // Obtenir messages d'une conversation
  function getMsgsConv(conv){
    if(!conv) return msgActifs;
    if(conv.type==="employe"){
      // messages entre currentUser et cet employé
      return msgActifs.filter(m=>
        (m.empId===currentUser.id&&m.destinataireId===conv.id)||
        (m.empId===conv.id&&(m.destinataireId===currentUser.id||!m.destinataireId))
      );
    }
    if(conv.type==="zone") return msgActifs.filter(m=>m.zoneId===conv.id);
    return msgActifs;
  }

  const msgsConv=getMsgsConv(convSel);

  useEffect(()=>{if(endRef.current)endRef.current.scrollIntoView({behavior:"smooth"});},[msgsConv.length,convSel]);

  function envoyer(){
    if(!texte.trim()) return;
    const curZoneId=convSel?.type==="zone"?convSel.id:null;
    const msg={
      id:Date.now(),
      empId:currentUser.id,
      nom:currentUser.nom,
      texte:texte.trim(),
      ts:new Date().toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}),
      zoneId:curZoneId,
      destinataireId:convSel?.type==="employe"?convSel.id:null,
      type:"message",
      archive:false,
      lu:false,
    };
    setData(d=>({...d,messages:[...(d.messages||[]),msg]}));
    setTexte("");
    toast_("Message envoyé ✓");
  }

  function archiverConv(conv){
    setData(d=>({...d,messages:(d.messages||[]).map(m=>{
      const match=conv.type==="employe"
        ?(m.empId===conv.id||m.destinataireId===conv.id)
        :(m.zoneId===conv.id);
      return match?{...m,archive:true}:m;
    })}));
    setConvSel(null);
    toast_("Conversation archivée ✓");
  }

  function desarchiverMsg(id){
    setData(d=>({...d,messages:(d.messages||[]).map(m=>m.id===id?{...m,archive:false}:m)}));
    toast_("Message restauré ✓");
  }

  function supprimerMsg(id){
    if(!isAdmin) return;
    setData(d=>({...d,messages:(d.messages||[]).filter(m=>m.id!==id)}));
  }

  // ── Vue liste conversations ──
  const listeConversations=()=>{
    const allConvsEmployes=isAdmin?data.employes.filter(e=>e.id!==currentUser.id):[];
    const allConvsZones=data.zones;
    return(
      <div style={{flex:1,overflowY:"auto"}}>
        {/* Nouvelle conversation (admin seulement) */}
        {isAdmin&&(
          <div style={{padding:"10px 12px 4px"}}>
            <div style={{fontSize:10,fontWeight:700,color:TXT3,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>💬 Conversations privées</div>
            {allConvsEmployes.map(e=>{
              const dernierMsg=msgActifs.filter(m=>m.empId===e.id||m.destinataireId===e.id).slice(-1)[0];
              const nbNonLus=msgActifs.filter(m=>m.empId===e.id&&m.destinataireId===currentUser.id&&!m.lu).length;
              return(
                <div key={e.id} onClick={()=>ouvrirConversation({type:"employe",id:e.id})}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"white",borderRadius:14,marginBottom:6,border:`1px solid ${BORDER}`,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <Avatar emp={e} size={44}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontWeight:700,fontSize:14,color:TXT}}>{e.nom}</span>
                      {dernierMsg&&<span style={{fontSize:10,color:TXT3}}>{dernierMsg.ts?.split(" ")[1]||""}</span>}
                    </div>
                    <div style={{fontSize:12,color:TXT3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1}}>
                      {dernierMsg?dernierMsg.texte:"Démarrer une conversation"}
                    </div>
                  </div>
                  {nbNonLus>0&&<span style={{background:"#ef4444",color:"white",borderRadius:"50%",minWidth:18,height:18,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{nbNonLus}</span>}
                  <span style={{color:TXT3,fontSize:16}}>›</span>
                </div>
              );
            })}
          </div>
        )}
        {/* Conversations par logement */}
        {allConvsZones.length>0&&(
          <div style={{padding:"8px 12px 4px"}}>
            <div style={{fontSize:10,fontWeight:700,color:TXT3,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>🏠 Par logement</div>
            {allConvsZones.map(z=>{
              const msgsZone=msgActifs.filter(m=>m.zoneId===z.id);
              const dernierMsg=msgsZone.slice(-1)[0];
              const nbNonLusZone=msgsZone.filter(m=>!m.lu&&m.empId!==currentUser.id).length;
              const aProblemeNonLu=msgsZone.some(m=>m.type==="probleme"&&!m.lu&&m.empId!==currentUser.id);
              const borderCol=aProblemeNonLu?"#fecaca":BORDER;
              const bgCol=aProblemeNonLu?"#fff8f8":"white";
              return(
                <div key={z.id} onClick={()=>ouvrirConversation({type:"zone",id:z.id})}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:bgCol,borderRadius:14,marginBottom:6,border:`1.5px solid ${borderCol}`,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{position:"relative",flexShrink:0}}>
                    <div style={{width:44,height:44,borderRadius:10,overflow:"hidden",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {z.photo?<img src={z.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:20}}>🏠</span>}
                    </div>
                    {aProblemeNonLu&&<span style={{position:"absolute",top:-4,right:-4,fontSize:14}}>⚠️</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontWeight:700,fontSize:14,color:TXT}}>{z.nom}</span>
                      {dernierMsg&&<span style={{fontSize:10,color:TXT3}}>{dernierMsg.ts?.split(" ")[1]||""}</span>}
                    </div>
                    <div style={{fontSize:12,color:aProblemeNonLu?"#dc2626":TXT3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1,fontWeight:aProblemeNonLu?600:400}}>
                      {dernierMsg?dernierMsg.texte:"Aucun message"}
                    </div>
                  </div>
                  {nbNonLusZone>0&&<span style={{background:"#ef4444",color:"white",borderRadius:"50%",minWidth:18,height:18,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{nbNonLusZone}</span>}
                  <span style={{color:TXT3,fontSize:16}}>›</span>
                </div>
              );
            })}
          </div>
        )}
        {/* Bouton nouvelle conv pour employé */}
        {!isAdmin&&(
          <div style={{padding:"10px 12px"}}>
            <button onClick={()=>ouvrirConversation({type:"admin",id:"admin"})}
              style={{...S.bPri,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              💬 Écrire à l'admin / manager
            </button>
          </div>
        )}
        {msgActifs.length===0&&allConvsZones.length===0&&(
          <div style={{textAlign:"center",padding:"48px 20px",color:TXT3}}>
            <div style={{fontSize:40,marginBottom:10}}>💬</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Aucune conversation</div>
            <div style={{fontSize:12}}>Les messages apparaîtront ici</div>
          </div>
        )}
      </div>
    );
  };

  // ── Vue conversation ouverte ──
  const vueConversation=()=>{
    const titreConv=convSel?.type==="employe"?emp(convSel.id)?.nom:convSel?.type==="zone"?zone(convSel.id)?.nom:"Admin";
    const parDate={};
    msgsConv.forEach(m=>{const d=m.ts?.split(" ")[0]||"";if(!parDate[d])parDate[d]=[];parDate[d].push(m);});
    return(
      <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
        {/* Header conversation */}
        <div style={{padding:"10px 14px",background:"white",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <button onClick={()=>setConvSel(null)} style={{border:"none",background:"transparent",color:GOLD_DARK,fontSize:20,cursor:"pointer",padding:"0 4px",fontWeight:700}}>‹</button>
          {convSel?.type==="employe"&&<Avatar emp={emp(convSel.id)} size={34}/>}
          {convSel?.type==="zone"&&<div style={{width:34,height:34,borderRadius:8,overflow:"hidden",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{zone(convSel.id)?.photo?<img src={zone(convSel.id).photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🏠"}</div>}
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:TXT}}>{titreConv}</div>
            <div style={{fontSize:10,color:TXT3}}>{msgsConv.length} message{msgsConv.length>1?"s":""}</div>
          </div>
          {isAdmin&&<button onClick={()=>archiverConv(convSel)}
            style={{border:`1px solid ${BORDER}`,background:"#f8fafc",color:TXT2,borderRadius:9,padding:"5px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
            🗄️ Archiver
          </button>}
        </div>
        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 12px 4px",background:"#f8fafc"}}>
          {msgsConv.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:TXT3}}>
              <div style={{fontSize:32,marginBottom:8}}>💬</div>
              <div style={{fontSize:13}}>Aucun message dans cette conversation</div>
            </div>
          )}
          {Object.entries(parDate).map(([date,msgs])=>(
            <div key={date}>
              <div style={{textAlign:"center",marginBottom:8}}>
                <span style={{fontSize:10,color:TXT3,background:"#f0f0f0",borderRadius:20,padding:"3px 10px",fontWeight:600}}>{date}</span>
              </div>
              {msgs.map(m=>{
                const isMe=m.empId===currentUser.id;
                const e=emp(m.empId);
                const isProbleme=m.type==="probleme";
                return(
                  <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",marginBottom:10}}>
                    {!isMe&&<div style={{fontSize:10,color:TXT3,marginBottom:3,marginLeft:10,fontWeight:600}}>{m.nom}</div>}
                    <div style={{display:"flex",alignItems:"flex-end",gap:6,flexDirection:isMe?"row-reverse":"row"}}>
                      {!isMe&&<Avatar emp={e} size={28}/>}
                      <div style={{maxWidth:"82%"}}>
                        {isProbleme&&<div style={{fontSize:9,fontWeight:800,color:"#dc2626",textTransform:"uppercase",letterSpacing:.8,marginBottom:4,display:"flex",alignItems:"center",gap:4}}><span>⚠️</span>Problème signalé</div>}
                        <div style={{background:isProbleme?"#fef2f2":isMe?GOLD_DARK:"white",color:isProbleme?"#b91c1c":isMe?"white":TXT,borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:14,lineHeight:1.4,boxShadow:"0 2px 8px rgba(0,0,0,.10)",border:isProbleme?"1.5px solid #fecaca":isMe?"none":"1px solid #f0f0f0"}}>
                          <span style={{fontWeight:isProbleme?600:400}}>{m.texte}</span>
                          {m.photoProbleme&&(
                            <div style={{marginTop:10}}>
                              <img src={m.photoProbleme} alt="photo problème"
                                style={{display:"block",width:"100%",borderRadius:10,maxHeight:260,objectFit:"cover",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}
                                onClick={()=>window.open(m.photoProbleme,"_blank")}
                              />
                              <div style={{fontSize:9,color:"#dc2626",marginTop:4,fontWeight:600,opacity:.7}}>📷 Appuyez pour agrandir</div>
                            </div>
                          )}
                        </div>
                        <div style={{fontSize:9,color:TXT3,marginTop:3,textAlign:isMe?"right":"left"}}>{m.ts?.split(" ")[1]||""}</div>
                      </div>
                      {isAdmin&&<button onClick={()=>supprimerMsg(m.id)} style={{border:"none",background:"none",cursor:"pointer",color:"#d0d0d0",fontSize:14,padding:2,flexShrink:0}}>×</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={endRef}/>
        </div>
        {/* Saisie */}
        <div style={{background:"white",borderTop:"1px solid #f0f0f0",padding:"10px 12px 12px",flexShrink:0}}>
          {convSel?.type==="zone"&&(
            <div style={{fontSize:11,color:GOLD_DARK,fontWeight:600,marginBottom:6,padding:"4px 8px",background:GOLD_BG,borderRadius:8}}>🏠 Logement : {zone(convSel.id)?.nom}</div>
          )}
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea value={texte} onChange={e=>setTexte(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();envoyer();}}}
              placeholder="Écrivez un message..."
              style={{...S.inp,marginBottom:0,flex:1,minHeight:44,maxHeight:100,resize:"none",lineHeight:1.4,fontSize:14,padding:"10px 12px",borderRadius:14}} rows={1}/>
            <button onClick={()=>envoyer()} disabled={!texte.trim()}
              style={{width:44,height:44,borderRadius:14,background:texte.trim()?GOLD_DARK:"#e4e4e7",border:"none",cursor:texte.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
              <span style={{fontSize:18,color:"white"}}>↑</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Vue archives ──
  const [selArchives,setSelArchives]=useState(new Set());
  const [modeSelection,setModeSelection]=useState(false);
  const vueArchives=()=>(
    <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
      {/* Header archives avec gestion */}
      {msgArchives.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <button
            onClick={()=>{setModeSelection(s=>!s);setSelArchives(new Set());}}
            style={{flex:1,padding:"8px 12px",background:modeSelection?"#fef2f2":"#f8fafc",border:`1px solid ${modeSelection?"#fecaca":"#e2e8f0"}`,borderRadius:10,fontSize:12,fontWeight:700,color:modeSelection?"#dc2626":TXT2,cursor:"pointer"}}>
            {modeSelection?"✕ Annuler":"☑️ Sélectionner"}
          </button>
          {modeSelection&&selArchives.size>0&&(
            <button
              onClick={()=>{
                setData(d=>({...d,messages:(d.messages||[]).filter(m=>!selArchives.has(m.id))}));
                setSelArchives(new Set());setModeSelection(false);
              }}
              style={{padding:"8px 14px",background:"#dc2626",border:"none",borderRadius:10,fontSize:12,fontWeight:700,color:"white",cursor:"pointer"}}>
              🗑️ Supprimer ({selArchives.size})
            </button>
          )}
          {modeSelection&&(
            <button
              onClick={()=>setSelArchives(new Set(msgArchives.map(m=>m.id)))}
              style={{padding:"8px 12px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:10,fontSize:11,fontWeight:700,color:TXT2,cursor:"pointer"}}>
              Tout
            </button>
          )}
        </div>
      )}
      {msgArchives.length===0&&(
        <div style={{textAlign:"center",padding:"48px 20px",color:TXT3}}>
          <div style={{fontSize:36,marginBottom:8}}>🗄️</div>
          <div style={{fontSize:14,fontWeight:600}}>Aucun message archivé</div>
        </div>
      )}
      {msgArchives.map(m=>{
        const e=emp(m.empId);const z=zone(m.zoneId);
        const isSel=selArchives.has(m.id);
        return(
          <div key={m.id}
            onClick={()=>{if(modeSelection){setSelArchives(s=>{const n=new Set(s);n.has(m.id)?n.delete(m.id):n.add(m.id);return n;});}}}
            style={{...S.card,marginBottom:8,opacity:modeSelection&&!isSel?.55:1,
              border:isSel?"2px solid #dc2626":undefined,
              background:isSel?"#fef2f2":undefined,
              cursor:modeSelection?"pointer":"default",transition:"all .15s"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              {modeSelection&&(
                <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${isSel?"#dc2626":"#d1d5db"}`,background:isSel?"#dc2626":"white",flexShrink:0,marginTop:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {isSel&&<span style={{color:"white",fontSize:12,fontWeight:900}}>✓</span>}
                </div>
              )}
              <Avatar emp={e} size={32}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13}}>{m.nom}</div>
                {z&&<div style={{fontSize:10,color:GOLD_DARK,marginBottom:2}}>🏠 {z.nom}</div>}
                <div style={{fontSize:13,color:TXT2,marginTop:2}}>{m.texte}</div>
                <div style={{fontSize:10,color:TXT3,marginTop:3}}>{m.ts}</div>
              </div>
              {!modeSelection&&(
                <button onClick={()=>desarchiverMsg(m.id)}
                  style={{border:`1px solid ${BORDER}`,background:"#f8fafc",color:TXT2,borderRadius:8,padding:"4px 8px",fontSize:10,cursor:"pointer",flexShrink:0}}>
                  Restaurer
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)",overflow:"hidden"}}>
      {/* Onglets + header */}
      {!convSel&&(
        <div style={{padding:"10px 12px 0",background:"white",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <div style={{fontWeight:700,fontSize:15,color:TXT,marginBottom:8}}>💬 Messagerie</div>
          <div style={{display:"flex",background:"#f1f5f9",borderRadius:10,padding:3,gap:2}}>
            <button style={S.tab(onglet==="conversations")} onClick={()=>{setOnglet("conversations");setConvSel(null);}}>Conversations</button>
            <button style={S.tab(onglet==="archives")} onClick={()=>{setOnglet("archives");setConvSel(null);}}>🗄️ Archives ({msgArchives.length})</button>
          </div>
        </div>
      )}
      {/* Contenu */}
      {convSel?{vueConversation()}:onglet==="conversations"?{listeConversations()}:{vueArchives()}}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VUE PARAMÈTRES EMPLOYÉ — Pin + Mode nuit
// ══════════════════════════════════════════════════════════════════════════════
function EmpParametres({emp,setData,setCurrentUser,toast_,nightMode,toggleNightMode}){
  const [step,setStep]=useState("menu"); // menu | changer
  const [oldPin,setOldPin]=useState("");
  const [newPin,setNewPin]=useState("");
  const [confirmPin,setConfirmPin]=useState("");
  const [show,setShow]=useState(false);

  function sauvegarder(){
    if(emp.pin&&emp.pin.trim()!==""){
      if(oldPin!==emp.pin) return toast_("Ancien PIN incorrect","err");
    }
    if(newPin.length!==4) return toast_("Le nouveau PIN doit contenir 4 chiffres","err");
    if(newPin!==confirmPin) return toast_("Les PIN ne correspondent pas","err");
    setData(d=>({...d,employes:d.employes.map(e=>e.id===emp.id?{...e,pin:newPin}:e)}));
    setCurrentUser(u=>({...u,pin:newPin}));
    toast_("PIN mis à jour ✓");
    setStep("menu");setOldPin("");setNewPin("");setConfirmPin("");
  }

  const menuItems=[
    {id:"pin",  icon:"🔢", label:"Mon code PIN",    desc:"Modifier votre PIN de connexion"},
    {id:"nuit", icon:"🌙", label:"Mode nuit",        desc:nightMode?"Interface sombre activée":"Interface claire activée"},
  ];

  return(
    <div style={{padding:"14px 12px"}}>
      <div style={{fontWeight:800,fontSize:16,color:TXT,marginBottom:4}}>⚙️ Paramètres</div>
      <div style={{fontSize:13,color:TXT2,marginBottom:16}}>Connecté en tant que <b>{emp.nom}</b></div>

      {/* Mode nuit toggle card */}
      <div style={{...S.card,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:12,background:nightMode?"#0f0e00":"#f4f4f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{nightMode?"🌙":"☀️"}</div>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:TXT}}>Mode nuit</div>
            <div style={{fontSize:12,color:TXT3,marginTop:1}}>{nightMode?"Interface sombre":"Interface claire"}</div>
          </div>
        </div>
        <div onClick={toggleNightMode}
          style={{width:50,height:28,borderRadius:14,background:nightMode?GOLD:"#e4e4e7",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:"white",position:"absolute",top:3,left:nightMode?25:3,transition:"left .3s",boxShadow:"0 2px 6px rgba(0,0,0,.2)"}}/>
        </div>
      </div>

      {/* PIN */}
      <div style={S.card} onClick={()=>setStep(step==="changer"?"menu":"changer")}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Avatar emp={emp} size={44}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:TXT}}>{emp.nom}</div>
            <div style={{fontSize:12,color:TXT2,marginTop:2}}>
              {emp.pin&&emp.pin.trim()!==""
                ?<span style={{letterSpacing:4,color:GOLD,fontWeight:700}}>● ● ● ●</span>
                :<span style={{color:TXT3}}>🔓 Sans PIN</span>}
            </div>
          </div>
          <span style={{fontSize:13,color:TXT3,fontWeight:600}}>{step==="changer"?"✕":">✏️"}</span>
        </div>
      </div>

      {step==="changer"&&(
        <div style={S.card}>
          {emp.pin&&emp.pin.trim()!==""&&(
            <>
              <label style={S.lbl}>Ancien PIN</label>
              <input style={{...S.inp,letterSpacing:8,fontSize:22,textAlign:"center"}}
                type="password" maxLength={4} placeholder="••••"
                value={oldPin} onChange={e=>setOldPin(e.target.value.replace(/\D/g,"").slice(0,4))}/>
            </>
          )}
          <label style={S.lbl}>Nouveau PIN (4 chiffres)</label>
          <input style={{...S.inp,letterSpacing:8,fontSize:22,textAlign:"center"}}
            type={show?"text":"password"} maxLength={4} placeholder="••••"
            value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,"").slice(0,4))}/>
          <label style={S.lbl}>Confirmer</label>
          <input style={{...S.inp,letterSpacing:8,fontSize:22,textAlign:"center"}}
            type={show?"text":"password"} maxLength={4} placeholder="••••"
            value={confirmPin} onChange={e=>setConfirmPin(e.target.value.replace(/\D/g,"").slice(0,4))}/>
          <button type="button" onClick={()=>setShow(s=>!s)} style={{...S.bSec,marginBottom:6,fontSize:12}}>
            {show?"🙈 Masquer":"👁️ Afficher"}
          </button>
          <button style={S.bPri} onClick={sauvegarder}>💾 Enregistrer le PIN</button>
        </div>
      )}

      {/* Prochainement */}
      <div style={{...S.sec,paddingTop:20}}>
        <div style={S.secTit}>Prochainement</div>
      </div>
      {[
        {icon:"📱",label:"Notifications push",desc:"Alertes automatiques"},
        {icon:"🌐",label:"Langue",desc:"Français, English..."},
      ].map((f,i)=>(
        <div key={i} style={{...S.card,display:"flex",alignItems:"center",gap:12,opacity:.5}}>
          <span style={{fontSize:22}}>{f.icon}</span>
          <div>
            <div style={{fontWeight:600,fontSize:13,color:TXT2}}>{f.label}</div>
            <div style={{fontSize:11,color:TXT3,marginTop:1}}>{f.desc}</div>
          </div>
          <span style={{marginLeft:"auto",fontSize:10,background:"#f4f4f5",color:TXT3,borderRadius:20,padding:"2px 8px",fontWeight:600}}>Bientôt</span>
        </div>
      ))}
      <div style={{textAlign:"center",padding:"20px 0 10px",color:TXT3,fontSize:10,letterSpacing:.5}}>
        CKeys · v{APP_VERSION}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════

// ─── Firebase helpers ─────────────────────────────────────────────────────────
function mergeData(prev, incoming) {
  // Fusionne les données entrantes avec l'état local en préservant les photos locales
  const merged = { ...prev, ...incoming };
  // Restaurer les photos locales si absentes dans Firestore
  if (prev.zones && incoming.zones) {
    merged.zones = incoming.zones.map(iz => {
      const lz = prev.zones.find(z => z.id === iz.id);
      return { ...iz, photo: iz.photo || lz?.photo || null };
    });
  }
  if (prev.employes && incoming.employes) {
    merged.employes = incoming.employes.map(ie => {
      const le = prev.employes.find(e => e.id === ie.id);
      return { ...ie, photo: ie.photo || le?.photo || null };
    });
  }
  if (prev.taches && incoming.taches) {
    merged.taches = incoming.taches.map(it => {
      const lt = prev.taches.find(t => t.id === it.id);
      return { ...it, photoProbleme: it.photoProbleme || lt?.photoProbleme || null };
    });
  }
  return merged;
}

function stripPhotos(data) {
  // Retire les grandes photos base64 pour rester sous 1MB Firestore
  // Les photos sont gardées localement et restaurées via mergeData
  return {
    ...data,
    zones: (data.zones||[]).map(z => ({ ...z, photo: z.photo && z.photo.length < 50000 ? z.photo : null })),
    employes: (data.employes||[]).map(e => ({ ...e, photo: e.photo && e.photo.length < 50000 ? e.photo : null })),
    taches: (data.taches||[]).map(t => ({ ...t, photoProbleme: t.photoProbleme && t.photoProbleme.length < 50000 ? t.photoProbleme : null })),
  };
}

export default function App(){
  const bp=useBreakpoint();
  const isDesktop=bp==="desktop";
  const isTablet=bp==="tablet";
  const [data,setData]=useState({...SEED});
  const [fbStatus,setFbStatus]=useState("init"); // "init"|"online"|"offline"|"syncing"|"unconfigured"
  const saveTimeoutRef=useRef(null);

  // ── Firebase : init + écoute temps réel ──────────────────────────────────
  useEffect(()=>{
    let unsub=null;
    initFirebase().then(ok=>{
      if(!ok){setFbStatus("unconfigured");return;}
      const ref=_doc(_db,...FIREBASE_DOC_PATH.split("/"));
      // Charge les données initiales
      _getDoc(ref).then(snap=>{
        if(snap.exists()){
          const d=snap.data()?.data;
          if(d){try{setData(prev=>mergeData(prev,d));}catch(e){console.warn(e);}}
        }
      });
      // Écoute les changements en temps réel
      unsub=_onSnapshot(ref,snap=>{
        if(snap.exists()){
          const d=snap.data()?.data;
          const ts=snap.data()?._ts||0;
          if(d&&ts>(_lastSaveTs.current||0)){
            try{setData(prev=>mergeData(prev,d));}catch(e){console.warn(e);}
          }
        }
        setFbStatus("online");
      },()=>setFbStatus("offline"));
    });
    return()=>{unsub&&unsub();};
  },[]);

  const _lastSaveTs=useRef(0);

  // ── Firebase : sauvegarde auto avec debounce 1.5s ───────────────────────
  useEffect(()=>{
    if(fbStatus==="unconfigured"||fbStatus==="init") return;
    if(saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current=setTimeout(async()=>{
      if(!_fbReady) return;
      setFbStatus("syncing");
      try{
        const ts=Date.now();
        _lastSaveTs.current=ts;
        const ref=_doc(_db,...FIREBASE_DOC_PATH.split("/"));
        // Strip large base64 photos pour ne pas dépasser 1MB Firestore
        const slim=stripPhotos(data);
        await _setDoc(ref,{data:slim,_ts:ts},{merge:false});
        setFbStatus("online");
      }catch(e){
        console.warn("Firebase save error:",e);
        setFbStatus("offline");
      }
    },1500);
  },[data]);
  const [view,setView]=useState("accueil");
  const [weekOff,setWeekOff]=useState(0);
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const [filterEmp,setFilterEmp]=useState("tous");
  const [toast,setToast]=useState(null);
  const [problemeId,setProblemeId]=useState(null);
  const [currentUser,setCurrentUser]=useState(null);
  const [nightMode,setNightMode]=useState(false);

  const toggleNightMode=useCallback(()=>{
    setNightMode(n=>!n);
  },[]);


  const toast_=useCallback((m,t="ok")=>{setToast({m,t});setTimeout(()=>setToast(null),2400);},[]);
  const close=useCallback(()=>setModal(null),[]);

  // Notif helper
  function addNotif(type,msg,empId,zoneId){
    const ts=new Date().toLocaleString("fr-FR");
    setData(d=>({...d,notifications:[...(d.notifications||[]),{type,msg,empId,zoneId,ts,lu:false}].slice(-50)}));
  }

  const updateSt=useCallback((id,st)=>{
    setData(d=>({...d,taches:d.taches.map(t=>t.id===id?{...t,statut:st}:t)}));
    toast_("Statut mis à jour ✓");
  },[toast_]);

  const confirmerProbleme=useCallback((tacheId,note,photoProbleme=null)=>{
    const t=data.taches.find(x=>x.id===tacheId);
    const emp=data.employes.find(e=>e.id===t?.employeId);
    const zone=data.zones.find(z=>z.id===t?.zoneId);
    const msgProbleme={
      id:Date.now(),
      empId:t?.employeId||currentUser.id,
      nom:emp?.nom||currentUser.nom,
      texte:`⚠️ Problème signalé sur "${t?.type||"tâche"}"${note?` : ${note}`:""}`,
      ts:new Date().toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}),
      zoneId:t?.zoneId||null,
      type:"probleme",
      photoProbleme:photoProbleme||null,
      archive:false,
      lu:false,
    };
    setData(d=>({
      ...d,
      taches:d.taches.map(x=>x.id===tacheId?{...x,statut:"probleme",noteProbleme:note,photoProbleme:photoProbleme||null}:x),
      messages:[...(d.messages||[]),msgProbleme],
      notifications:[...(d.notifications||[]),{type:"probleme",msg:`Problème signalé : ${t?.type||"tâche"}`,empId:t?.employeId,zoneId:t?.zoneId,tacheId:tacheId,note:note||null,photo:photoProbleme||null,ts:new Date().toLocaleString("fr-FR"),lu:false}].slice(-50),
    }));
    setProblemeId(null);
    toast_("Problème signalé ✓");
  },[data.taches,data.employes,data.zones,currentUser,toast_]);

  const toggleCheck=useCallback((tacheId,item)=>{
    setData(d=>({...d,taches:d.taches.map(t=>{
      if(t.id!==tacheId)return t;
      const done=t.checkDone||[];
      const newDone=done.includes(item)?done.filter(x=>x!==item):[...done,item];
      const allDone=(t.checkItems||[]).length>0&&newDone.length===(t.checkItems||[]).length;
      return{...t,checkDone:newDone,statut:allDone?"termine":t.statut==="termine"&&newDone.length<(t.checkItems||[]).length?"en_cours":t.statut};
    })}));
  },[]);

  // Validation en lot : valide toutes les tâches sélectionnées d'un coup
  const validerLot=useCallback((selections)=>{
    // selections = [{tacheId, item, isTacheEntiere}]
    setData(d=>({...d,taches:d.taches.map(t=>{
      const selsForT=selections.filter(s=>s.tacheId===t.id);
      if(selsForT.length===0)return t;
      let done=[...(t.checkDone||[])];
      selsForT.forEach(s=>{
        if(!s.isTacheEntiere&&!done.includes(s.item)) done.push(s.item);
      });
      const hasTacheEntiere=selsForT.some(s=>s.isTacheEntiere);
      const allDone=(t.checkItems||[]).length>0&&done.length>=(t.checkItems||[]).length;
      const newStatut=hasTacheEntiere||allDone?"termine":t.statut;
      return{...t,checkDone:done,statut:newStatut};
    })}));
  },[]);

  const saveTache=useCallback(()=>{
    const f={...form,zoneId:parseInt(form.zoneId),employeId:parseInt(form.employeId)};
    if(!f.zoneId||!f.employeId)return toast_("Remplissez tous les champs","err");
    if((!f.checkItems||f.checkItems.length===0)&&!f.type)return toast_("Sélectionnez au moins une tâche","err");
    if(!f.type&&f.checkItems?.length>0) f.type=f.checkItems[0];
    if(f.id){
      setData(d=>({...d,taches:d.taches.map(t=>t.id===f.id?f:t)}));
      toast_("Tâche modifiée ✓");
    } else {
      const newT={...f,id:Date.now(),statut:"planifie",checkDone:[],date:f.date||TODAY};
      setData(d=>({...d,taches:[...d.taches,newT]}));
      addNotif("nouvelle",`Nouvelle tâche : ${f.type||f.checkItems[0]}`,f.employeId,f.zoneId);
      toast_("Tâche ajoutée ✓");
    }
    close();
  },[form,toast_,close]);

  const delTache=useCallback((id)=>{setData(d=>({...d,taches:d.taches.filter(t=>t.id!==id)}));close();toast_("Tâche supprimée");},[toast_,close]);
  const saveEmp=useCallback(()=>{
    if(!form.nom)return toast_("Nom requis","err");
    if(form.id){setData(d=>({...d,employes:d.employes.map(e=>e.id===form.id?form:e)}));}
    else{setData(d=>({...d,employes:[...d.employes,{...form,id:Date.now(),couleur:COLORS[d.employes.length%COLORS.length],actif:true,photo:null,tel:form.tel||"",email:form.email||"",pin:form.pin||"",role:form.role||"employe"}]}));}
    close();toast_("Employé enregistré ✓");
  },[form,toast_,close]);

  const delEmp=useCallback((id)=>{setData(d=>({...d,employes:d.employes.filter(e=>e.id!==id)}));close();toast_("Employé supprimé");},[toast_,close]);
  const saveZone=useCallback(()=>{
    if(!form.nom)return toast_("Nom du logement requis","err");
    if(form.id){setData(d=>({...d,zones:d.zones.map(z=>z.id===form.id?form:z)}));}
    else{setData(d=>({...d,zones:[...d.zones,{...form,id:Date.now()}]}));}
    close();toast_("Logement enregistré ✓");
  },[form,toast_,close]);

  const delZone=useCallback((id)=>{setData(d=>({...d,zones:d.zones.filter(z=>z.id!==id)}));close();toast_("Logement supprimé");},[toast_,close]);
  const saveTypes=useCallback((types)=>{setData(d=>({...d,typesPerso:types}));close();toast_("Types mis à jour ✓");},[close,toast_]);

  const openNewTache=(date=TODAY)=>{setForm({date,type:(data.typesPerso||DEFAULT_TYPES)[0],heure:"08:00",recurrence:"quotidien",checkItems:[],checkDone:[]});setModal("tache");};
  const openEditTache=(t)=>{setForm({...t,checkItems:t.checkItems||[],checkDone:t.checkDone||[]});setModal("tache_edit");};
  const openEditEmp=(e)=>{setForm(e?{...e}:{actif:true,photo:null,tel:"",email:"",pin:"",role:"employe"});setModal("employe");};
  const openEditZone=(z)=>{setForm(z?{...z}:{});setModal("zone");};

  // Écran PIN si pas connecté
  if(!currentUser){
    return <EcranPin employes={data.employes.filter(e=>e.actif)} onLogin={u=>{setCurrentUser(u);if(u.role==="employe")setView("planning");}}/>;
  }

  const isAdmin=currentUser?.role==="admin"||currentUser?.role==="manager";
  const isEmp=!isAdmin;
  // Zones de l'utilisateur courant (pour badge messages)
  const myZoneIds=isAdmin
    ? (data.zones||[]).map(z=>z.id)
    : [...new Set((data.taches||[]).filter(t=>t.employeId===currentUser.id).map(t=>t.zoneId))];
  const nbMsgs=(data.messages||[]).filter(m=>
    !m.archive&&m.empId!==currentUser.id&&!m.lu&&
    (isAdmin||(m.destinataireId===currentUser.id)||(m.zoneId&&myZoneIds.includes(m.zoneId)))
  ).length;
  const nbNotifs=(data.notifications||[]).filter(n=>n.type==="probleme"&&!n.lu).length;
  const appBg=nightMode?"#0a0a0f":SURFACE;

  const navItems=isEmp?[
    {id:"planning",   icon:"⊟",label:"Planning"},
    {id:"parametres", icon:"⊞",label:"Paramètres"},
  ]:[
    {id:"accueil",    icon:"◉",label:"Accueil"},
    {id:"planning",   icon:"⊟",label:"Planning"},
    ...(isAdmin?[{id:"zones",icon:"⌂",label:"Logements"}]:[]),
    {id:"messages",   icon:"✉",label:"Messages"},

    {id:"parametres", icon:"⊞",label:"Admin"},
  ];

  const isPlanning=view==="planning";
  const isFullscreen=!isDesktop&&!isTablet&&(view==="planning"||view==="messages");

  // ── Contenu partagé ──
  const contentArea==>(
    <>
      {view==="accueil"    &&<Accueil    isAdmin={isAdmin} data={isEmp?{...data,employes:data.employes.filter(e=>e.id===currentUser.id)}:data} updateSt={updateSt} onEditTache={isAdmin?openEditTache:null} onToggleCheck={toggleCheck} validerLot={validerLot} onSignalerProbleme={setProblemeId} onSignalerMessage={(msg)=>{setData(d=>({...d,messages:[...(d.messages||[]),{id:Date.now(),empId:currentUser.id,nom:currentUser.nom,texte:`⚠️ Problème signalé par ${currentUser.nom} sur "${(data.zones.find(z=>z.id===msg.zoneId)||{}).nom||"logement"}" : ${msg.texte}`,zoneId:msg.zoneId,ts:new Date().toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}),type:"probleme",photoProbleme:msg.photo||null,archive:false,lu:false}]}));toast_("Problème envoyé ✓");}}/>}
      {view==="planning"   &&<Planning   data={isEmp?{...data,taches:data.taches.filter(t=>t.employeId===currentUser.id)}:data} weekOff={weekOff} setWeekOff={setWeekOff} filterEmp={filterEmp} setFilterEmp={setFilterEmp} onEditTache={isAdmin?openEditTache:null} onNewTache={isAdmin?openNewTache:null} isReadOnly={isEmp}/>}
      {view==="zones"      &&isAdmin&&<Logements  data={data} onEdit={openEditZone} onOpenTypes={()=>setModal("types")} isReadOnly={false}/>}
      {view==="messages"   &&<Messages   data={data} setData={setData} currentUser={currentUser} toast_={toast_}/>}

      {view==="parametres" &&isAdmin&&<Parametres data={data} setData={setData} onEditEmp={openEditEmp} toast_={toast_} nightMode={nightMode} toggleNightMode={toggleNightMode}/>}
      {view==="parametres" &&isEmp&&<EmpParametres emp={currentUser} setData={setData} setCurrentUser={setCurrentUser} toast_={toast_} nightMode={nightMode} toggleNightMode={toggleNightMode}/>}
    </>
  );

  const modals==>(
    <>
      {(modal==="tache"||modal==="tache_edit")&&(
        <ModalTache editMode={modal==="tache_edit"} form={form} setForm={setForm}
          employes={data.employes} zones={data.zones} types={data.typesPerso||DEFAULT_TYPES}
          onSave={saveTache} onDelete={delTache} onClose={close}/>
      )}
      {modal==="employe"&&<ModalEmploye form={form} setForm={setForm} onSave={saveEmp} onDelete={delEmp} onClose={close}/>}
      {modal==="zone"   &&<ModalLogement form={form} setForm={setForm} onSave={saveZone} onDelete={delZone} onClose={close}/>}
      {modal==="types"  &&<ModalTypes types={data.typesPerso||DEFAULT_TYPES} onSave={saveTypes} onClose={close}/>}
      {problemeId&&<ModalProbleme tacheId={problemeId} onConfirm={confirmerProbleme} onClose={()=>setProblemeId(null)}/>}
    </>
  );

  const renderNavItem=(item)=>{
    const active=view===item.id;
    const hasBadge=(item.id==="messages"&&nbMsgs>0)||(item.id==="parametres"&&nbNotifs>0);
    const badgeCount=item.id==="messages"?nbMsgs:nbNotifs;
    return(
      <button key={item.id} onClick={()=>setView(item.id)}
        style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:"none",background:active?`${GOLD}18`:"transparent",color:active?GOLD:"rgba(255,255,255,.5)",cursor:"pointer",transition:"all .15s",width:"100%",fontWeight:active?700:500,fontSize:14,position:"relative"}}>
        <span style={{fontSize:18,width:22,textAlign:"center"}}>{item.icon}</span>
        <span>{item.label}</span>
        {hasBadge&&<span style={{marginLeft:"auto",background:"#ef4444",color:"white",borderRadius:20,minWidth:18,height:18,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{badgeCount>9?"9+":badgeCount}</span>}
        {active&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:20,background:GOLD,borderRadius:"0 3px 3px 0"}}/>}
      </button>
    );
  };

  // ══════════════════════════════════════════════════════
  // DESKTOP (≥1024px) — sidebar + contenu large
  // ══════════════════════════════════════════════════════
  if(isDesktop) return(
    <div style={{display:"flex",height:"100vh",background:nightMode?"#0a0a0f":"#f0f2f5",fontFamily:"'SF Pro Display',-apple-system,sans-serif",overflow:"hidden"}}>
      {/* Sidebar */}
      <div style={{width:240,background:NOIR3,display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
        <div style={{padding:"22px 20px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
          <div style={{position:"relative",display:"inline-flex"}}><img src={LOGO} alt="CKeys" style={{width:48,height:48,objectFit:"contain",borderRadius:12,background:"rgba(255,255,255,.06)",padding:3}}/>
              <div style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,borderRadius:"50%",background:fbStatus==="online"?"#22c55e":fbStatus==="syncing"?"#f59e0b":fbStatus==="offline"?"#ef4444":"#94a3b8",border:"2px solid white",boxShadow:fbStatus==="online"?"0 0 6px #22c55e55":"none",transition:"all .5s"}}/></div>
          <div>
            <div style={{color:"white",fontWeight:900,fontSize:16,letterSpacing:-.5}}>CKeys</div>
            <div style={{color:GOLD,fontSize:10,fontWeight:600,opacity:.8}}>{currentUser.nom}{isAdmin&&<span style={{marginLeft:6,color:GOLD_LIGHT}}>v{APP_VERSION}</span>}</div>
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(item=><NavItem key={item.id} item={item}/>)}
        </nav>
        <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          {isAdmin&&(view==="accueil"||view==="planning")&&(
            <button onClick={()=>openNewTache()} style={{width:"100%",padding:"11px",background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,border:"none",borderRadius:12,color:"#1a0d00",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>＋ Nouvelle tâche</button>
          )}
          <button onClick={()=>setCurrentUser(null)} style={{width:"100%",padding:"9px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.5)",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:600}}>↩ Déconnexion</button>
        </div>
      </div>
      {/* Contenu */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:"white",borderBottom:"1px solid #e8edf3",padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div>
            <div style={{fontWeight:800,fontSize:18,color:TXT,letterSpacing:-.3}}>{navItems.find(n=>n.id===view)?.label}</div>
            <div style={{fontSize:12,color:TXT3,marginTop:1}}>{fmtDate(new Date())}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {toast&&<div style={{background:toast.t==="err"?"#dc2626":NOIR3,color:"white",padding:"8px 18px",borderRadius:50,fontSize:13,fontWeight:600}}>{toast.m}</div>}
            <Avatar emp={currentUser} size={36}/>
            <div><div style={{fontWeight:700,fontSize:13,color:TXT}}>{currentUser.nom}</div><div style={{fontSize:10,color:TXT3}}>{currentUser.role==="admin"?"Administrateur":currentUser.role==="manager"?"Manager":"Employé"}</div></div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",background:nightMode?"#0a0a0f":"#f0f2f5"}}>
          <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 24px"}}>{contentArea}</div>
        </div>
      </div>
      {modals}
    </div>
  );

  // ══════════════════════════════════════════════════════
  // TABLETTE (640–1023px) — sidebar icônes + contenu
  // ══════════════════════════════════════════════════════
  if(isTablet) return(
    <div style={{display:"flex",height:"100vh",background:nightMode?"#0a0a0f":"#f0f2f5",fontFamily:"'SF Pro Display',-apple-system,sans-serif",overflow:"hidden"}}>
      {/* Sidebar icônes */}
      <div style={{width:70,background:NOIR3,display:"flex",flexDirection:"column",alignItems:"center",borderRight:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
        <div style={{padding:"16px 0 12px",borderBottom:"1px solid rgba(255,255,255,.06)",width:"100%",display:"flex",justifyContent:"center"}}>
          <div style={{position:"relative",display:"inline-flex"}}><img src={LOGO} alt="CKeys" style={{width:42,height:42,objectFit:"contain",borderRadius:10,background:"rgba(255,255,255,.06)",padding:3}}/>
              <div style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,borderRadius:"50%",background:fbStatus==="online"?"#22c55e":fbStatus==="syncing"?"#f59e0b":fbStatus==="offline"?"#ef4444":"#94a3b8",border:"2px solid white",boxShadow:fbStatus==="online"?"0 0 6px #22c55e55":"none",transition:"all .5s"}}/></div>
        </div>
        <nav style={{flex:1,padding:"10px 6px",display:"flex",flexDirection:"column",gap:4,width:"100%",alignItems:"center"}}>
          {navItems.map(item=>{
            const active=view===item.id;
            const hasBadge=(item.id==="messages"&&nbMsgs>0)||(item.id==="parametres"&&nbNotifs>0);
            const badgeCount=item.id==="messages"?nbMsgs:nbNotifs;
            return(
              <div key={item.id} style={{position:"relative",width:"100%",display:"flex",justifyContent:"center"}}>
                <button onClick={()=>setView(item.id)}
                  style={{width:46,height:46,borderRadius:12,border:"none",background:active?`${GOLD}22`:"transparent",color:active?GOLD:"rgba(255,255,255,.45)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,transition:"all .15s"}}>
                  {item.icon}
                </button>
                {hasBadge&&<span style={{position:"absolute",top:4,right:6,background:"#ef4444",color:"white",borderRadius:"50%",width:14,height:14,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{badgeCount}</span>}
              </div>
            );
          })}
        </nav>
        <div style={{padding:"8px 0 14px",borderTop:"1px solid rgba(255,255,255,.06)",width:"100%",display:"flex",justifyContent:"center"}}>
          <button onClick={()=>setCurrentUser(null)} style={{width:46,height:46,borderRadius:12,border:"none",background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}} title="Déconnexion">↩</button>
        </div>
      </div>
      {/* Contenu tablette */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:"white",borderBottom:"1px solid #e8edf3",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontWeight:800,fontSize:16,color:TXT}}>{navItems.find(n=>n.id===view)?.label}</div>
            <div style={{fontSize:11,color:TXT3}}>· {fmtDate(new Date())}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {toast&&<div style={{background:toast.t==="err"?"#dc2626":NOIR3,color:"white",padding:"6px 14px",borderRadius:50,fontSize:12,fontWeight:600}}>{toast.m}</div>}
            {isAdmin&&(view==="accueil"||view==="planning")&&(
              <button onClick={()=>openNewTache()} style={{padding:"8px 14px",background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,border:"none",borderRadius:10,color:"#1a0d00",fontSize:12,fontWeight:700,cursor:"pointer"}}>＋ Tâche</button>
            )}
            <Avatar emp={currentUser} size={32}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",background:nightMode?"#0a0a0f":"#f0f2f5"}}>
          <div style={{maxWidth:860,margin:"0 auto",padding:"16px 18px"}}>{contentArea}</div>
        </div>
      </div>
      {modals}
    </div>
  );

  // ══════════════════════════════════════════════════════
  // MOBILE — layout original
  // ══════════════════════════════════════════════════════
  return(
    <div style={{...S.app,background:appBg,...(isFullscreen?{height:"100vh",overflow:"hidden",paddingBottom:0}:{})}}>
      <div style={{...S.topbar,padding:"10px 16px 10px"}}>
        {/* Logo centré */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {/* Quitter à gauche */}
          <button onClick={()=>setCurrentUser(null)} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.5)",borderRadius:10,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600,minWidth:60}}>↩</button>
          {/* Logo + nom centré */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div style={{position:"relative",display:"inline-flex"}}>
              <img src={LOGO} alt="CKeys" style={{width:42,height:42,objectFit:"contain",borderRadius:10,background:"rgba(255,255,255,.08)",padding:3}}/>
              <div style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,borderRadius:"50%",background:fbStatus==="online"?"#22c55e":fbStatus==="syncing"?"#f59e0b":fbStatus==="offline"?"#ef4444":"#94a3b8",border:"2px solid #0c0c10",transition:"all .5s"}}/>
            </div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.45)",fontWeight:600,letterSpacing:.5}}>{currentUser.nom}</div>
          </div>
          {/* Placeholder droit pour symétrie */}
          <div style={{minWidth:60}}/>
        </div>
      </div>
      {toast&&<div style={S.toast(toast.t)}>{toast.m}</div>}
      <div style={isFullscreen?{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}:{paddingTop:12,paddingBottom:82}}>
        {contentArea}
      </div>
      {isAdmin&&(view==="accueil"||view==="planning")&&(
        <button style={{...S.fab,bottom:isPlanning?66:92}} onClick={()=>openNewTache()}>＋</button>
      )}
      {modals}
      <nav style={{...S.nav}}>
        {navItems.map(item=>(
          <button key={item.id} style={S.navBtn(view===item.id)} onClick={()=>setView(item.id)}>
            <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:10,background:view===item.id?`${GOLD}22`:"transparent",transition:"all .2s"}}>
              <span style={{fontSize:17,lineHeight:1}}>{item.icon}</span>
              {item.id==="messages"&&nbMsgs>0&&(<span style={{position:"absolute",top:-3,right:-3,background:"#ef4444",color:"white",borderRadius:"50%",width:14,height:14,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{nbMsgs>9?"9+":nbMsgs}</span>)}
              {item.id==="parametres"&&nbNotifs>0&&(<span style={{position:"absolute",top:-3,right:-3,background:"#ef4444",color:"white",borderRadius:"50%",width:14,height:14,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{nbNotifs}</span>)}
            </div>
            <span style={{marginTop:1}}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
