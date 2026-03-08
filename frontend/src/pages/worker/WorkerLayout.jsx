import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'

const c={
primary:'#16a34a',
primary2:'#22c55e',
bg:'#f6faf7',
surface:'#eaf4ec',
border:'#d4e5d7',
text:'#0f172a',
muted:'#64748b',
activeText:'#166534',
activeBg:'linear-gradient(90deg,#dcfce7,#bbf7d0)',
headerGrad:'linear-gradient(135deg,#16a34a,#14532d)',
topbarBg:'rgba(246,250,247,.85)',
}

export default function WorkerLayout(){

const{user,logout}=useAuth()
const navigate=useNavigate()

const[open,setOpen]=useState(false)

const[messageCount,setMessageCount]=useState(0)
const[notificationCount,setNotificationCount]=useState(0)

const handleLogout=async()=>{await logout();navigate('/login')}

const initials=user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'WK'


/* ===============================
   FETCH SYSTEM COUNTS
================================ */
useEffect(()=>{
const fetchCounts=async()=>{
try{

const msgRes=await api.get('/worker/messages/unread-count')
const notifRes=await api.get('/worker/notifications/unread-count')

setMessageCount(msgRes.data.count || 0)
setNotificationCount(notifRes.data.count || 0)

}catch(err){
console.log('Sidebar counts error',err)
}
}

fetchCounts()

const interval=setInterval(fetchCounts,10000) // auto refresh every 10s
return()=>clearInterval(interval)

},[])


/* ===============================
   NAVIGATION
================================ */
const nav=[
{to:'dashboard',icon:'🏠',label:'Dashboard'},
{to:'profile',icon:'👷',label:'My Profile'},
{to:'schedule',icon:'📅',label:'My Schedule'},
{to:'salary',icon:'💰',label:'Salary & Rate'},
{to:'browse-job',icon:'🗺️',label:'Browse Jobs'},
{to:'applications',icon:'✉️',label:'My Applications'},
{to:'messages',icon:'💬',label:'Messages',badge:messageCount},
{to:'notifications',icon:'🔔',label:'Notifications',badge:notificationCount},
{to:'reviews',icon:'⭐',label:'Rate & Review'},
{to:'report',icon:'🚨',label:'Report User'},
{to:'security',icon:'🔒',label:'Security & Privacy'},
]


return(
<div style={{display:'flex',minHeight:'100vh',background:c.bg,color:c.text,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>

{open&&<div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.35)',zIndex:190}}/>}

<nav style={{position:'fixed',top:0,left:0,bottom:0,width:'260px',background:c.surface,borderRight:`1px solid ${c.border}`,display:'flex',flexDirection:'column',zIndex:200,boxShadow:'4px 0 20px rgba(0,0,0,.04)'}}>

<div style={{background:c.headerGrad,padding:'22px 18px',position:'relative',overflow:'hidden'}}>
<div style={{position:'absolute',right:'-30px',top:'-30px',width:'120px',height:'120px',borderRadius:'50%',background:'rgba(255,255,255,.08)'}}/>

<div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',position:'relative',zIndex:1}}>
<div style={{width:'38px',height:'38px',background:'rgba(255,255,255,.2)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'16px',color:'#fff',border:'1.5px solid rgba(255,255,255,.3)'}}>L</div>
<div>
<div style={{fontFamily:'Syne,sans-serif',fontSize:'17px',fontWeight:800,color:'#fff'}}>Local Job Finder</div>
<div style={{fontSize:'9px',fontWeight:700,background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.3)',borderRadius:'20px',padding:'2px 8px',color:'#fff',letterSpacing:'.6px',textTransform:'uppercase',display:'inline-block'}}>👷 Worker</div>
</div>
</div>

<div style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.25)',borderRadius:'14px',padding:'12px',display:'flex',alignItems:'center',gap:'12px',position:'relative',zIndex:1}}>
<div style={{width:'34px',height:'34px',borderRadius:'50%',background:'rgba(255,255,255,.25)',border:'2px solid rgba(255,255,255,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff'}}>{initials}</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:'13px',fontWeight:700,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
<div style={{fontSize:'10px',color:'rgba(255,255,255,.8)'}}>Worker Account</div>
</div>
<div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#86efac'}}/>
</div>
</div>

<div style={{flex:1,overflowY:'auto',padding:'12px'}}>

{nav.map(item=>(
<NavLink key={item.to} to={item.to}
style={({isActive})=>({
display:'flex',
alignItems:'center',
gap:'12px',
padding:'9px 14px',
borderRadius:'12px',
fontSize:'13px',
fontWeight:isActive?600:500,
textDecoration:'none',
margin:'3px 0',
transition:'all .2s ease',
color:isActive?c.activeText:c.muted,
background:isActive?c.activeBg:'transparent',
borderRight:isActive?`3px solid ${c.primary}`:'3px solid transparent'
})}
>

<span style={{fontSize:'15px',width:'20px',textAlign:'center'}}>{item.icon}</span>
<span style={{flex:1}}>{item.label}</span>

{item.badge>0&&(
<span style={{background:c.primary,color:'#fff',fontSize:'9px',fontWeight:700,borderRadius:'20px',padding:'2px 7px'}}>
{item.badge}
</span>
)}

</NavLink>
))}

</div>

<div style={{padding:'14px',borderTop:`1px solid ${c.border}`}}>
<div style={{background:'#dcfce7',borderRadius:'14px',padding:'12px',display:'flex',alignItems:'center',gap:'12px'}}>
<div style={{width:'34px',height:'34px',borderRadius:'50%',background:c.headerGrad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff'}}>{initials}</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:'13px',fontWeight:600,color:c.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
<div style={{fontSize:'10px',color:c.muted}}>Worker</div>
</div>
<button onClick={handleLogout} style={{background:'none',border:'none',fontSize:'11px',fontWeight:700,color:'#ef4444',cursor:'pointer'}}>Sign out</button>
</div>
</div>

</nav>

<div style={{marginLeft:'260px',flex:1,display:'flex',flexDirection:'column'}}>
<div style={{position:'sticky',top:0,zIndex:100,height:'64px',background:c.topbarBg,backdropFilter:'blur(14px)',borderBottom:`1px solid ${c.border}`,display:'flex',alignItems:'center',padding:'0 28px'}}>
<span style={{fontFamily:'Syne,sans-serif',fontSize:'18px',fontWeight:800,color:c.text,flex:1}}>Worker Portal</span>
<div style={{display:'flex',alignItems:'center',gap:'10px'}}>
<div style={{width:'34px',height:'34px',borderRadius:'50%',background:c.headerGrad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff'}}>{initials}</div>
<span style={{fontSize:'13px',fontWeight:600,color:c.text}}>{user?.name}</span>
</div>
</div>

<div style={{flex:1}}>
<Outlet/>
</div>

</div>

</div>
)}