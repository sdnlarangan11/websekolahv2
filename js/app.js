const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const dateID=d=>d?new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}):"";
const fallbackProfile={name:"SDN Larangan 11",npsn:"20607216",status:"Negeri",level:"Sekolah Dasar",accreditation:"A",hero_image_url:"https://cdn-sekolah.annibuku.com/20607216/1.jpg",logo_url:"assets/logo-sekolah.jpeg",city:"Kota Tangerang"};

async function q(table,select="*",filters=[]){
  if(!SDN11.configured)return [];
  let req=SDN11.client.from(table).select(select);
  for(const f of filters){if(f.op==="eq")req=req.eq(f.col,f.val);if(f.op==="order")req=req.order(f.col,{ascending:f.asc??false});if(f.op==="limit")req=req.limit(f.val)}
  const {data,error}=await req; if(error){console.warn(table,error.message);return []} return data||[];
}
async function init(){
  $("year").textContent=new Date().getFullYear();
  let profile=fallbackProfile, rombel=[], eskul=[], activities=[], programs=[], news=[], announcements=[], achievements=[], gallery=[], documents=[], schedules=[];
  if(SDN11.configured){
    const [p,r,e,a,pr,n,an,ac,g,d,s]=await Promise.all([
      SDN11.client.from("school_profile").select("*").eq("id",1).maybeSingle(),
      q("class_groups","*",[{op:"eq",col:"published",val:true},{op:"order",col:"grade",asc:true}]),
      q("extracurriculars","*",[{op:"eq",col:"active",val:true},{op:"order",col:"name",asc:true}]),
      q("extracurricular_activities","*, extracurriculars(name)",[{op:"eq",col:"published",val:true},{op:"order",col:"activity_date",asc:false},{op:"limit",val:6}]),
      q("programs","*",[{op:"eq",col:"published",val:true},{op:"order",col:"sort_order",asc:true}]),
      q("news","*",[{op:"eq",col:"published",val:true},{op:"order",col:"published_at",asc:false},{op:"limit",val:6}]),
      q("announcements","*",[{op:"eq",col:"published",val:true},{op:"order",col:"published_at",asc:false},{op:"limit",val:6}]),
      q("achievements","*",[{op:"eq",col:"published",val:true},{op:"order",col:"year",asc:false},{op:"limit",val:8}]),
      q("gallery","*",[{op:"eq",col:"published",val:true},{op:"order",col:"created_at",asc:false},{op:"limit",val:12}]),
      q("documents","*",[{op:"eq",col:"published",val:true},{op:"order",col:"created_at",asc:false}]),
      q("school_schedules","*",[{op:"eq",col:"published",val:true},{op:"order",col:"sort_order",asc:true}])
    ]);
    if(p.data)profile={...profile,...p.data};rombel=r;eskul=e;activities=a;programs=pr;news=n;announcements=an;achievements=ac;gallery=g;documents=d;schedules=s;
  }
  renderProfile(profile,rombel,eskul);renderPrograms(programs);renderRombel(rombel);renderEskul(eskul);renderActivities(activities);renderNews(news);renderAnnouncements(announcements);renderAchievements(achievements);renderGallery(gallery);renderDocuments(documents);renderSchedules(schedules);
  const toggle=$("menuBtn"),nav=$("mainNav");toggle?.addEventListener("click",()=>nav.style.display=nav.style.display==="flex"?"none":"flex");
}
function renderProfile(p,rombel,eskul){
  const name=p.name||"SDN Larangan 11", logo=p.logo_url||"assets/logo-sekolah.jpeg";
  ["brandLogo","heroLogo","contactLogo","footerLogo"].forEach(id=>{if($(id))$(id).src=logo});
  if($("heroBg")) $("heroBg").style.backgroundImage=`url("${String(p.hero_image_url||"https://cdn-sekolah.annibuku.com/20607216/1.jpg").replace(/"/g,"%22")}")`;
  $("brandName").textContent=name.toUpperCase();$("brandCity").textContent=(p.city||"Kota Tangerang").toUpperCase();$("heroSchool").textContent=name.toUpperCase();$("heroCity").textContent=p.city||"Kota Tangerang";
  $("statStudents").textContent=p.students??"—";$("statStaff").textContent=p.staff??"—";$("statRombel").textContent=rombel.length||"—";$("statAccreditation").textContent=p.accreditation||"—";
  $("profileTitle").textContent=p.profile_title||"Rumah Belajar yang Aman, Aktif, dan Berkarakter";$("profileDescription").textContent=p.description||"";$("visionText").textContent=p.vision||"";$("missionText").innerHTML=(Array.isArray(p.mission)?p.mission:[]).map(x=>`<div>${esc(x)}</div>`).join("");
  $("profileInfo").innerHTML=[["NPSN",p.npsn],["Status",p.status],["Jenjang",p.level],["Kepala Sekolah",p.principal],["Alamat",p.address]].filter(x=>x[1]).map(([l,v])=>`<div><b>${esc(l)}</b><span>${esc(v)}</span></div>`).join("");
  $("spmbTitle").textContent=p.spmb_title||"Informasi SPMB";$("spmbDescription").textContent=p.spmb_description||"";$("spmbLink").href=p.spmb_url||"#";$("contactBox").innerHTML=[["📍",p.address],["📞",p.phone],["📧",p.email]].filter(x=>x[1]).map(([i,v])=>`<div>${i} ${esc(v)}</div>`).join("");
  $("footerSchool").textContent=name.toUpperCase();$("copyrightSchool").textContent=name;$("footerAddress").textContent=p.address||"";
}
function renderPrograms(items){$("programList").innerHTML=items.length?items.map(x=>`<article class="card"><div class="card-icon">📚</div><h3>${esc(x.title)}</h3><p>${esc(x.description||"")}</p></article>`).join(""):'<p class="muted">Belum ada program yang dipublikasikan.</p>';}

function renderRombel(items){const el=$("rombelList");if(!items.length){el.innerHTML='<p class="muted">Belum ada data rombel yang dipublikasikan.</p>';return}el.innerHTML=`<table class="data-table"><tr><th>Tingkat</th><th>Rombel</th><th>Jumlah Siswa</th></tr>${items.map(x=>`<tr><td>${esc(x.grade)}</td><td>${esc(x.name)}</td><td>${x.student_count||"—"}</td></tr>`).join("")}</table>`;}

function renderEskul(items){
  const el=$("eskulList");
  if(!items.length){
    el.innerHTML='<p class="muted">Belum ada ekstrakurikuler aktif.</p>';
    return;
  }
  el.innerHTML=items.map(x=>`<article class="eskul-card">${x.image_url?`<img class="eskul-image" src="${esc(x.image_url)}" alt="${esc(x.name)}">`:''}<div class="eskul-content"><h3>${esc(x.name)}</h3><p>${esc(x.description||"")}</p></div></article>`).join("");
}

function renderActivities(items){$("eskulActivityList").innerHTML=items.length?items.map(x=>`<article class="news-card">${x.image_url?`<img class="news-image" src="${esc(x.image_url)}" alt="${esc(x.title)}">`:''}<small>${dateID(x.activity_date)}</small><h3>${esc(x.title)}</h3><p>${esc(x.description||"")}</p></article>`).join(''):'<p class="muted">Belum ada aktivitas ekstrakurikuler.</p>';}
function renderNews(items){$("newsList").innerHTML=items.length?items.map(x=>`<article class="news-card">${x.image_url?`<img class="news-image" src="${esc(x.image_url)}" alt="${esc(x.title)}">`:""}<small>${dateID(x.published_at)}</small><h3>${esc(x.title)}</h3><p>${esc(x.excerpt||"")}</p></article>`).join(""):'<p class="muted">Belum ada berita yang dipublikasikan.</p>';}
function renderAnnouncements(items){$("announcementList").innerHTML=items.length?items.map(x=>`<article class="news-card"><small>${dateID(x.published_at)}</small><h3>${esc(x.title)}</h3><p>${esc(x.content||"")}</p></article>`).join(""):'<p class="muted">Belum ada pengumuman yang dipublikasikan.</p>';}
function renderAchievements(items){$("achievementList").innerHTML=items.length?items.map(x=>`<article class="card"><div class="card-icon">🥇</div><h3>${esc(x.title)}</h3><p>${esc(x.level||"")}${x.year?` (${x.year})`:''}</p></article>`).join(""):'<p class="muted">Belum ada prestasi yang dicatat.</p>';}
function renderGallery(items){$("galleryList").innerHTML=items.length?items.map(x=>`<div class="gallery-item" style="${x.image_url?`background-image:url('${esc(x.image_url)}');background-size:cover;background-position:center;`:''}" title="${esc(x.title||'')}"></div>`).join(""):'<p class="muted">Belum ada foto galeri.</p>';}
function renderDocuments(items){$("documentList").innerHTML=items.length?items.map(x=>`<article class="document-item"><h3>${esc(x.title)}</h3><small>${esc(x.category||"Dokumen")}</small><p>${esc(x.description||"")}</p><a href="${esc(x.file_url)}" target="_blank" class="btn-small">Unduh</a></article>`).join(""):'<p class="muted">Belum ada dokumen yang dipublikasikan.</p>';}
function renderSchedules(items){$("scheduleList").innerHTML=items.length?items.slice(0,9).map(x=>`<article class="schedule-item"><span class="status-pill">${esc(x.day||"Jadwal")}</span><h3>${esc(x.title)}</h3><p>${esc(x.description||"")}</p></article>`).join(""):'<p class="muted">Belum ada jadwal yang dipublikasikan.</p>';}
init();