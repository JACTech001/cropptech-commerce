"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Ticket } from "lucide-react";

const filters = [["ALL","All requests"],["OPEN","Open"],["IN_PROGRESS","In progress"],["WAITING_FOR_CUSTOMER","Waiting for customer"],["RESOLVED","Resolved"],["CLOSED","Closed"]];
export default function AdminSupportInbox() {
  const [tickets,setTickets] = useState([]);
  const [counts,setCounts] = useState({});
  const [status,setStatus] = useState("ALL");
  const [query,setQuery] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    let active=true;
    const timer=setTimeout(async()=>{try{setLoading(true);const params=new URLSearchParams();if(status!=="ALL")params.set("status",status);if(query.trim())params.set("q",query.trim());const response=await fetch("/api/admin/support/tickets?"+params.toString(),{cache:"no-store"});const responseText=await response.text();let data={};if(responseText){try{data=JSON.parse(responseText);}catch{throw new Error("The support inbox returned an invalid response (HTTP "+response.status+"). Please check the admin support API.");}}if(!response.ok)throw new Error(data.error||"Support inbox unavailable (HTTP "+response.status+").");if(active){setTickets(data.tickets||[]);setCounts(data.counts||{});setError("");}}catch(err){if(active)setError(err.message);}finally{if(active)setLoading(false);}},180);
    return()=>{active=false;clearTimeout(timer);};
  },[status,query]);
  return <section className="admin-support-inbox">
    <div className="admin-support-summary">{filters.slice(1,5).map(([key,label])=><button type="button" key={key} className={status===key?"active":""} onClick={()=>setStatus(status===key?"ALL":key)}><strong>{counts[key]||0}</strong><span>{label}</span></button>)}</div>
    <div className="admin-support-toolbar"><div className="admin-support-filter-tabs">{filters.map(([key,label])=><button type="button" key={key} className={status===key?"active":""} onClick={()=>setStatus(key)}>{label}</button>)}</div><label className="admin-support-search"><Search size={16}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search ticket, customer or email..."/></label></div>
    {error&&<p className="customer-support-error">{error}</p>}
    {loading?<p className="admin-support-empty">Loading support requests...</p>:tickets.length?<div className="admin-support-table">{tickets.map((ticket)=><Link href={"/admin/support/"+ticket.id} className="admin-support-row" key={ticket.id}><div className="admin-support-ticket-icon"><Ticket size={18}/></div><div className="admin-support-ticket-main"><strong>{ticket.subject}</strong><span className="admin-support-issue-type">{(ticket.issueType||"GENERAL_ENQUIRY").replaceAll("_"," ")} · {ticket.ticketNumber} · {ticket.customer?.fullName||ticket.customer?.email||"Customer"}{ticket.order?.orderNumber?" · "+ticket.order.orderNumber:""}</span><small>{ticket.messages?.[0]?.body||"No message preview"}</small></div><div className="admin-support-ticket-meta"><span className={"customer-support-status status-"+ticket.status.toLowerCase()}>{ticket.status.replaceAll("_"," ")}</span><small>{ticket.priority} PRIORITY</small><time>{new Date(ticket.lastMessageAt).toLocaleDateString("en-NG",{dateStyle:"medium"})}</time></div><ArrowUpRight size={16}/></Link>)}</div>:<div className="admin-support-empty"><Ticket size={27}/><h3>No matching requests</h3><p>New customer requests will appear here.</p></div>}
  </section>;
}
