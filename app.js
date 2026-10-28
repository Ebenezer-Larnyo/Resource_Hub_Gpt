(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const grid = $("resourceGrid"), search = $("search"), count = $("count");
let category = "All", resources = [], lastReply = "", recognized = "";
const fallbackResources = [
{title:"Autism spectrum disorder (ASD)",category:"Getting started",description:"Overview of autism information and public-health resources.",url:"https://www.cdc.gov/autism/",source_name:"CDC",last_checked:"2026-10-28",tags:["autism","overview"]},
{title:"Autistic Self Advocacy Network",category:"Community",description:"Advocacy and educational resources focused on autistic self-advocacy.",url:"https://autisticadvocacy.org/",source_name:"ASAN",last_checked:"2026-10-28",tags:["community","advocacy"]},
{title:"MedlinePlus: Autism",category:"Health information",description:"Health information and an overview of autism spectrum disorder.",url:"https://medlineplus.gov/autismspectrumdisorder.html",source_name:"MedlinePlus",last_checked:"2026-10-28",tags:["health","information"]}
];
function safeHttpUrl(value){try{const u=new URL(value);return u.protocol==="https:"||u.protocol==="http:"?u.href:null}catch{return null}}
function renderResources(){
 const q=search.value.trim().toLowerCase();
 const visible=resources.filter(r=>(category==="All"||r.category===category)&&[r.title,r.description,r.category,r.source_name,...(r.tags||[])].join(" ").toLowerCase().includes(q));
 grid.replaceChildren(); count.textContent=visible.length+" resource"+(visible.length===1?"":"s");
 if(!visible.length){const p=document.createElement("p");p.className="notice";p.textContent="No matching resources. Try another word or category.";grid.append(p);return}
 visible.forEach(r=>{
  const url=safeHttpUrl(r.url);if(!url)return;
  const card=document.createElement("article");card.className="resource-card";
  const tag=document.createElement("span");tag.className="tag";tag.textContent=r.category;card.append(tag);
  const h=document.createElement("h3");h.textContent=r.title;card.append(h);
  const p=document.createElement("p");p.textContent=r.description;card.append(p);
  const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Visit "+(r.source_name||"source")+" ↗";card.append(a);
  const meta=document.createElement("p");meta.className="meta";meta.textContent="Source: "+(r.source_name||"not listed")+" · Checked: "+(r.last_checked||"date not recorded");card.append(meta);grid.append(card);
 });
}
fetch("data/resources.json").then(r=>{if(!r.ok)throw Error("Resource data unavailable");return r.json()}).then(d=>{resources=Array.isArray(d.resources)?d.resources:[];renderResources()}).catch(()=>{resources=fallbackResources;renderResources()});
search.addEventListener("input",renderResources);
$("filters").addEventListener("click",e=>{const b=e.target.closest("button[data-cat]");if(!b)return;category=b.dataset.cat;$("filters").querySelectorAll("button").forEach(x=>{const active=x===b;x.classList.toggle("active",active);x.setAttribute("aria-pressed",String(active))});renderResources()});
function addMessage(text,user=false){const row=document.createElement("div");row.className="msg";if(!user){const avatar=document.createElement("span");avatar.className="bubble-avatar";avatar.textContent="A";row.append(avatar)}const bubble=document.createElement("div");bubble.className="bubble"+(user?" user":"");bubble.textContent=text;if(!user){const small=document.createElement("small");small.textContent="SCRIPTED DEMO · NOT LIVE AI";bubble.append(small);lastReply=text}row.append(bubble);$("chatLog").append(row);$("chatLog").scrollTop=$("chatLog").scrollHeight}
function answerFor(text){
 const t=text.toLowerCase();
 if(/suicid|kill myself|hurt myself|self harm|end my life/.test(t))return "I’m sorry this feels so hard. This demo cannot provide crisis care. If you are in the US, call or text 988 to reach the Suicide & Crisis Lifeline; if you are in immediate danger, call emergency services. If possible, reach out to a trusted person now.";
 if(/diagnos|do i have autism|am i autistic/.test(t))return "I can share general information, but I can’t determine whether someone is autistic. If you want an assessment, a qualified healthcare professional familiar with autism may help you explore options. Would you like a starting resource from the library?";
 if(/support|resource|help me find/.test(t))return "We can take this one step at a time. Use the resource library above and filter by Getting started, Caregivers, Health information, Daily life, or Community. If you tell me the kind of support you’re looking for, I can suggest a topic to explore. This demo does not verify eligibility or local availability.";
 if(/caregiv|supporting someone|my child|my son|my daughter|family/.test(t))return "Supporting someone can bring up many questions. It may help to ask what the person wants, listen without assuming, and look for support that respects their preferences. The Caregivers and Community categories are useful starting points.";
 if(/explain my needs|sensory|overwhelm|communication/.test(t))return "One option is to describe the situation, what makes it harder, and what change would help. For example: “It is hard for me to process several instructions at once. Could you share them in writing, one step at a time?” Adapt this to what feels right for you.";
 if(/treatment|medicine|drug|cure|supplement/.test(t))return "Treatment decisions depend on the person and the question being addressed. Be cautious of claims that promise a cure or ask you to stop prescribed care. Check health information with qualified clinicians and reliable sources. This demo cannot recommend a treatment.";
 return "Thanks for sharing that. I can help you organise the question into smaller steps or point you toward a resource category. I’m a scripted demo, so I may misunderstand and I don’t have live AI or access to professional care. What would be the most useful next step for you?";
}
function send(text){const value=(text||"").trim().slice(0,1200);if(!value)return;addMessage(value,true);addMessage(answerFor(value));$("message").value="";$("stageStatus").textContent="Demo reply ready";if(!$("voicePanel").classList.contains("hidden"))speak(lastReply)}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();send($("message").value)});
$("suggestions").addEventListener("click",e=>{const b=e.target.closest("button");if(b)send(b.textContent)});
$("clearChat").addEventListener("click",()=>{$("chatLog").replaceChildren();addMessage("Conversation cleared. I don’t keep chat history after this page is closed. What would be helpful now?");$("stageStatus").textContent="Ready when you are";if("speechSynthesis"in window)window.speechSynthesis.cancel()});
function setMode(voice){$("voicePanel").classList.toggle("hidden",!voice);$("chatForm").classList.toggle("hidden",voice);$("suggestions").classList.toggle("hidden",voice);$("avatarStage").classList.toggle("hidden",false);$("textMode").classList.toggle("active",!voice);$("voiceMode").classList.toggle("active",voice);$("textMode").setAttribute("aria-pressed",String(!voice));$("voiceMode").setAttribute("aria-pressed",String(voice));if(!voice&&"speechSynthesis"in window)window.speechSynthesis.cancel()}
$("textMode").addEventListener("click",()=>setMode(false));$("voiceMode").addEventListener("click",()=>setMode(true));
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;let recognition=null;
if(SpeechRecognition){recognition=new SpeechRecognition();recognition.lang="en-US";recognition.interimResults=true;recognition.continuous=false;recognition.onresult=e=>{recognized=Array.from(e.results).map(r=>r[0].transcript).join("");$("transcript").textContent=recognized||"Listening…"};recognition.onerror=()=>{$("voiceHelp").textContent="Speech recognition was unavailable or stopped. You can type instead.";};recognition.onend=()=>{$("startVoice").disabled=false;$("stopVoice").disabled=true;$("stageStatus").textContent="Voice input stopped"}}
else{$("startVoice").disabled=true;$("voiceHelp").textContent="Speech recognition is not supported in this browser. You can still use Read last reply or switch to text."}
$("startVoice").addEventListener("click",()=>{if(!recognition)return;recognized="";$("transcript").textContent="Listening…";$("startVoice").disabled=true;$("stopVoice").disabled=false;$("stageStatus").textContent="Listening in your browser";try{recognition.start()}catch{$("startVoice").disabled=false;$("stopVoice").disabled=true;$("voiceHelp").textContent="Could not start speech recognition. Check browser permission or use text."}});
$("stopVoice").addEventListener("click",()=>recognition&&recognition.stop());
$("sendTranscript").addEventListener("click",()=>{if(recognized.trim())send(recognized);else $("transcript").textContent="No recognized text yet. Try speaking or type your message."});
function speak(text){if(!("speechSynthesis"in window)){toast("Speech playback is not supported in this browser.");return}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=$("speed").value==="slow"?.8:1;window.speechSynthesis.speak(u)}
$("readReply").addEventListener("click",()=>lastReply?speak(lastReply):toast("There is no reply to read yet."));
function toast(msg){$("toast").textContent=msg;window.setTimeout(()=>{$("toast").textContent=""},3200)}
const prefs=$("prefs");
function loadPrefs(){let p=null;try{p=JSON.parse(localStorage.getItem("asdHubPrefs")||"null")}catch{}if(!p)return;$("memory").checked=true;$("style").value=p.style||"balanced";$("speed").value=p.speed||"normal";$("motion").checked=!!p.motion;document.body.classList.toggle("reduce-motion",!!p.motion)}
$("openPrefs").addEventListener("click",()=>prefs.showModal());$("privacyLink").addEventListener("click",()=>prefs.showModal());
$("savePrefs").addEventListener("click",()=>{if($("memory").checked){localStorage.setItem("asdHubPrefs",JSON.stringify({style:$("style").value,speed:$("speed").value,motion:$("motion").checked}))}else localStorage.removeItem("asdHubPrefs");document.body.classList.toggle("reduce-motion",$("motion").checked);$("saveStatus").textContent=$("memory").checked?"Preferences saved on this device.":"Preferences not saved; existing saved settings cleared.";toast("Preferences updated.");prefs.close()});
$("deletePrefs").addEventListener("click",()=>{localStorage.removeItem("asdHubPrefs");$("memory").checked=false;$("style").value="balanced";$("speed").value="normal";$("motion").checked=false;document.body.classList.remove("reduce-motion");$("saveStatus").textContent="Saved preferences deleted from this browser."});
$("memory").addEventListener("change",()=>{if(!$("memory").checked)$("saveStatus").textContent="Your settings will not be saved when you close this dialog."});
$("motion").addEventListener("change",()=>document.body.classList.toggle("reduce-motion",$("motion").checked));
loadPrefs();
})();