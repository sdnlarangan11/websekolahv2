const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const dateID=d=>d?new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}):"";
const fallbackProfile={name:"SDN Larangan 11",npsn:"20607216",status:"Negeri",level:"Sekolah Dasar",accreditation:"A",logo_url:"assets/logo-sekolah.jpeg",address:"Jl. H. Majuk No. 180, Larangan Utara, Kecamatan Larangan, Kota Tangerang, Banten 15154",city:"Kota Tangerang",description:"Website ini menjadi pusat informasi digital SDN Larangan 11 untuk murid, orang tua/wali, guru, tenaga kependidikan, dan masyarakat.",vision:"Membentuk generasi yang religius, disiplin, jujur, kreatif dan berkarakter yang peduli terhadap lingkungan.",mission:[],spmb_title:"Informasi SPMB",spmb_description:"Jadwal, persyaratan, jalur, daya tampung dan tautan pendaftaran dapat diperbarui oleh admin.",spmb_url:"https://spmb.tangerangkota.go.id/"};

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
  const name=p.name||"SDN Larangan 11"; const logo=p.logo_url||"assets/logo-sekolah.jpeg";
  ["brandLogo","heroLogo","profileLogo","contactLogo"].forEach(id=>{if($(id))$(id).src=logo});
  $("brandName").textContent=name;$("brandCity").textContent=p.city||"Kota Tangerang";$("topNpsn").textContent="NPSN "+(p.npsn||"-");$("heroSchool").textContent=name;$("heroSubtitle").textContent=p.hero_subtitle||p.vision||"";$("statStudents").textContent=p.students??"—";$("statRombel").textContent=rombel.length||"—";$("statEskul").textContent=eskul.length||"—";$("statAccreditation").textContent=p.accreditation||"—";$("profileTitle").textContent=p.profile_title||"Rumah Belajar yang Aman, Aktif, dan Berkarakter";$("profileDescription").textContent=p.description||"";$("visionText").textContent=p.vision||"";
  $("missionText").innerHTML=(Array.isArray(p.mission)?p.mission:[]).map(x=>`<div>${esc(x)}</div>`).join("");
  $("profileInfo").innerHTML=[["NPSN",p.npsn],["Status",p.status],["Jenjang",p.level],["Kepala Sekolah",p.principal],["Alamat",p.address]].filter(x=>x[1]).map(([l,v])=>`<div><b>${esc(l)}</b><span>${esc(v)}</span></div>`).join("");
  $("spmbTitle").textContent=p.spmb_title||"Informasi SPMB";$("spmbDescription").textContent=p.spmb_description||"";$("spmbLink").href=p.spmb_url||"#";$("contactBox").innerHTML=[["📍",p.address],["☎️",p.phone],["✉️",p.email],["🌐 NPSN:",p.npsn]].filter(x=>x[1]).map(([i,v])=>`<p>${i} ${esc(v)}</p>`).join("");$("mapBox").href=p.maps_url||"#";$("footerSchool").textContent=name;$("copyrightSchool").textContent=name+" "+(p.city||"");
}
function renderPrograms(items){$("programList").innerHTML=items.length?items.map(x=>`<article class="card"><div class="card-icon">📚</div><h3>${esc(x.title)}</h3><p>${esc(x.description||"")}</p></article>`).join(""):'<p class="muted">Belum ada program yang dipublikasikan.</p>'}

function renderRombel(items){const el=$("rombelList");if(!items.length){el.innerHTML='<p class="muted">Belum ada data rombel yang dipublikasikan.</p>';return}el.innerHTML=`<table class="data-table"><thead><tr><th>Rombel</th><th>Tingkat</th><th>Siswa</th><th>L</th><th>P</th><th>Wali Kelas</th><th>Ruang</th></tr></thead><tbody>${items.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.grade)}</td><td>${esc(x.student_count??"-")}</td><td>${esc(x.male_count??"-")}</td><td>${esc(x.female_count??"-")}</td><td>${esc(x.homeroom_teacher||"-")}</td><td>${esc(x.room||"-")}</td></tr>`).join("")}</tbody></table>`}
function renderEskul(items){const el=$("eskulList");if(!items.length){el.innerHTML='<p class="muted">Belum ada ekstrakurikuler aktif.</p>';return}el.innerHTML=items.map(x=>`<article class="eskul-card">${x.image_url?`<img class="eskul-image" src="${esc(x.image_url)}" alt="${esc(x.name)}">`:`<div class="card-icon">🏆</div>`}<h3>${esc(x.name)}</h3><p><b>${esc(x.day||"-")}</b> • ${esc(x.start_time||"-")}${x.end_time?"–"+esc(x.end_time):""}</p><p>📍 ${esc(x.location||"-")}</p><p>${x.coach?"Pembina: "+esc(x.coach):""}${x.trainer?" · Pelatih: "+esc(x.trainer):""}</p>${x.capacity?`<p>Kuota: ${esc(x.capacity)}</p>`:""}<p>${esc(x.description||"")}</p></article>`).join("")}
function renderActivities(items){$("eskulActivityList").innerHTML=items.length?items.map(x=>`<article class="news-card">${x.image_url?`<img class="news-image" src="${esc(x.image_url)}" alt="${esc(x.title)}">`:""}<small>${dateID(x.activity_date)} · ${esc(x.extracurriculars?.name||"Eskul")}</small><h3>${esc(x.title)}</h3><p>${esc(x.description||"")}</p></article>`).join(""):'<p class="muted">Belum ada update kegiatan eskul.</p>'}
function renderNews(items){$("newsList").innerHTML=items.length?items.map(x=>`<article class="news-card">${x.image_url?`<img class="news-image" src="${esc(x.image_url)}" alt="${esc(x.title)}">`:""}<small>${dateID(x.published_at)||"INFORMASI"}</small><h3>${esc(x.title)}</h3><p>${esc(x.excerpt||"")}</p></article>`).join(""):'<article class="news-card"><h3>Belum ada berita</h3><p>Konten dapat ditambahkan melalui Admin.</p></article>'}
function renderAnnouncements(items){$("announcementList").innerHTML=items.length?items.map(x=>`<article class="news-card"><small>${dateID(x.published_at)}</small><h3>${esc(x.title)}</h3><p>${esc(x.body||"")}</p></article>`).join(""):'<p class="muted">Belum ada pengumuman.</p>'}
function renderAchievements(items){$("achievementList").innerHTML=items.length?items.map(x=>`<article class="card"><div class="card-icon">🥇</div><h3>${esc(x.title)}</h3><p>${esc(x.level||"")}${x.year?" · "+esc(x.year):""}</p><p>${esc(x.description||"")}</p></article>`).join(""):'<p class="muted">Belum ada prestasi.</p>'}
function renderGallery(items){$("galleryList").innerHTML=items.length?items.map(x=>`<div class="gallery-item" style="${x.image_url?`background-image:url('${esc(x.image_url)}');background-size:cover;background-position:center`:''}">${x.image_url?"":esc(x.title||"Foto kegiatan")}</div>`).join(""):'<div class="gallery-item">Galeri dapat ditambahkan melalui Admin</div>'}
function renderDocuments(items){$("documentList").innerHTML=items.length?items.map(x=>`<article class="document-item"><h3>${esc(x.title)}</h3><small>${esc(x.category||"Dokumen")}</small><p>${esc(x.description||"")}</p><a href="${esc(x.file_url||"#")}" target="_blank" rel="noopener">Buka Dokumen →</a></article>`).join(""):'<p class="muted">Belum ada dokumen publik.</p>'}
function renderSchedules(items){$("scheduleList").innerHTML=items.length?items.slice(0,9).map(x=>`<article class="schedule-item"><span class="status-pill">${esc(x.day||"Jadwal")}</span><h3>${esc(x.title)}</h3><small>${esc(x.time_text||"")}${x.class_name?" · "+esc(x.class_name):""}</small><p>${esc(x.description||"")}</p></article>`).join(""):""}
init();