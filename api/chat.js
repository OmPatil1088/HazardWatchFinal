/* =========================
   Personality Modes
   ========================= */

let currentMode = "friendly";

const personalities = {
  professional:{ prefix:"📊", style:m=>m },
  friendly:{ prefix:"😊", style:m=>m },
  emergency:{ prefix:"🚨 EMERGENCY:", style:m=>m.toUpperCase() },
  funny:{ prefix:"😎", style:m=>m+" 😄" }
};

const formatReply = msg=>{
  const p=personalities[currentMode];
  return `${p.prefix} ${p.style(msg)}`;
};


/* =========================
   Time Greeting
   ========================= */

function getGreeting(){
  const h=new Date().getHours();
  if(h<12) return "Good Morning";
  if(h<17) return "Good Afternoon";
  return "Good Evening";
}


/* =========================
   Disaster Kits
   ========================= */

const kits={
 tsunami:["Water","Dry food","Flashlight","Radio","First aid kit","Whistle"],
 earthquake:["Helmet","Gloves","Mask","Flashlight","First aid kit"],
 flood:["Waterproof bag","Boots","Water","Food","Power bank"],
 cyclone:["Blanket","Water","Food","Radio","Torch"],
 general:["Water","Food","First aid kit","Light","Contacts"]
};

const formatKit=list=>"Recommended Kit:\n• "+list.join("\n• ");


/* =========================
   Intents Database
   ========================= */

const intents=[

{ tags:["hello","hi","hey"],
  reply:()=>`${getGreeting()}! I am Disaster Guard.` },

{ tags:["how are you","how r u"],
  reply:[
   "I'm fully operational and monitoring Disasters.",
   "All systems running perfectly.",
   "Ready to protect and assist you."
  ]},

{ tags:["what are you","who are you","about you"],
  reply:"I am Disaster Guard, an AI assistant designed to monitor disasters and help keep people safe."},

{ tags:["what can you do","your features","help"],
  reply:"I detect disasters, give safety advice, provide emergency kits, and answer safety questions."},

{ tags:["are you human"],
  reply:"I am an AI assistant, not human — but always here to help you."},

{ tags:["are you real"],
  reply:"I'm real as software and smarter than a storm warning system."},

{ tags:["who made you","your creator"],
  reply:"I was created by developers to help protect lives from disasters."},

{ tags:["thank","thanks"],
  reply:["You're welcome.","Glad I could help.","Anytime. Stay safe."]},

{ tags:["bye","goodbye"],
  reply:"Stay safe. Disaster monitoring continues."},

{ tags:["joke"],
  reply:[
   "Why don't Disasters text back? They wave.",
   "Why was the Disaster calm? It meditated.",
   "Sea-riously funny right?"
  ]},

{ tags:["bored"],
  reply:"Fun fact: More than 80% of the Disaster is unexplored."},

{ tags:["motivate"],
  reply:[
   "Storms don't last forever.",
   "You're stronger than any wave.",
   "Even hurricanes run out of energy."
  ]},

{ tags:["professional mode"], reply:()=>{currentMode="professional"; return"Professional mode activated.";}},
{ tags:["friendly mode"], reply:()=>{currentMode="friendly"; return"Friendly mode activated.";}},
{ tags:["funny mode"], reply:()=>{currentMode="funny"; return"Funny mode activated.";}},
{ tags:["emergency mode"], reply:()=>{currentMode="emergency"; return"Emergency mode activated.";}},
{ tags:["exit","reset","normal mode","default mode"],
  reply:()=>{currentMode="friendly"; return"Exited special mode."; }},

{ tags:["am i safe","is it safe","danger level"],
  reply:"Safety depends on your location and hazard type. Please provide your location."},

{ tags:["what should i do","what to do"],
  reply:"Stay calm, follow official alerts, and move to safe zones if needed."},

{ tags:["emergency number","help number"],
  reply:"Contact your local emergency services immediately."},

{ tags:["tsunami"], reply:"Tsunami warning. Move inland immediately."},
{ tags:["earthquake","quake"], reply:"Drop, Cover, and Hold On."},
{ tags:["flood"], reply:"Move to higher ground immediately."},
{ tags:["cyclone","storm","hurricane"], reply:"Stay indoors and monitor alerts."},
{ tags:["rip current"], reply:"Swim parallel to shore. Do not fight current."},
{ tags:["oil spill"], reply:"Avoid affected water areas."}

];


/* =========================
   Fuzzy Matching
   ========================= */

function levenshtein(a,b){
 const m=Array.from({length:b.length+1},(_,i)=>[i]);
 for(let j=0;j<=a.length;j++) m[0][j]=j;

 for(let i=1;i<=b.length;i++){
  for(let j=1;j<=a.length;j++){
   m[i][j]=b[i-1]==a[j-1]
    ?m[i-1][j-1]
    :Math.min(m[i-1][j-1]+1,m[i][j-1]+1,m[i-1][j]+1);
 }}
 return m[b.length][a.length];
}

const similarity=(a,b)=>1-levenshtein(a,b)/Math.max(a.length,b.length);


/* =========================
   Kit Detection
   ========================= */

function detectKit(msg){

 if(!msg.includes("kit")) return null;

 if(msg.includes("tsunami")) return formatKit(kits.tsunami);
 if(msg.includes("earthquake")) return formatKit(kits.earthquake);
 if(msg.includes("flood")) return formatKit(kits.flood);
 if(msg.includes("cyclone")||msg.includes("storm")) return formatKit(kits.cyclone);

 return formatKit(kits.general);
}


/* =========================
   Intent Engine
   ========================= */

function detectIntent(msg){

 msg=msg.toLowerCase().trim();

 const kit=detectKit(msg);
 if(kit) return formatReply(kit);

 let best=null,scoreMax=0;

 for(const intent of intents){
  for(const tag of intent.tags){

   if(msg.includes(tag)){
    const r=
      typeof intent.reply==="function"?intent.reply():
      Array.isArray(intent.reply)
      ? intent.reply[Math.floor(Math.random()*intent.reply.length)]
      : intent.reply;

    return formatReply(r);
   }

   const s=similarity(msg,tag);
   if(s>scoreMax){scoreMax=s;best=intent;}
 }}

 if(scoreMax>=0.65 && best){
  const r=
   typeof best.reply==="function"?best.reply():
   Array.isArray(best.reply)
   ? best.reply[Math.floor(Math.random()*best.reply.length)]
   : best.reply;

  return formatReply(r);
 }

 return null;
}


/* =========================
   Vercel API Handler
   ========================= */

export default function handler(req,res){

 if(req.method !== "POST"){
  return res.status(405).json({error:"Method not allowed"});
 }

 const msg=req.body.message||"";
 const result=detectIntent(msg);

 res.status(200).json({
  bot:"Disaster Guard",
  mode:currentMode,
  reply: result || formatReply("I didn't understand. Try asking about disasters or safety."),
  time:new Date()
 });

}