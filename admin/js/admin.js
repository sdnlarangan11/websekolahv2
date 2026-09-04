```javascript
/* =========================================================
   SDN LARANGAN 11 - ADMIN PANEL
   ========================================================= */

const $ = (id) => document.getElementById(id);

const c = window.SDN11?.client;

const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[ch]));

let cache = {
    rombel: [],
    eskul: [],
    activity: [],
    program: [],
    news: [],
    announcement: [],
    achievement: [],
    gallery: [],
    document: [],
    schedule: [],
    staging: []
};

let profile = {};

/* =========================================================
   DEFINISI DATA
   ========================================================= */

const defs = {
    rombel: {
        table: "class_groups",
        title: "Rombel",
        fields: [
            ["name", "Nama Rombel", "text"],
            ["grade", "Tingkat", "number"],
            ["academic_year", "Tahun Ajaran", "text"],
            ["semester", "Semester", "text"],
            ["student_count", "Jumlah Siswa", "number"],
            ["male_count", "Laki-laki", "number"],
            ["female_count", "Perempuan", "number"],
            ["homeroom_teacher", "Wali Kelas", "text"],
            ["room", "Ruang", "text"],
            ["source_note", "Sumber Data", "text"],
            ["published", "Tampilkan", "checkbox"]
        ]
    },

    eskul: {
        table: "extracurriculars",
        title: "Ekstrakurikuler",
        fields: [
            ["name", "Nama Eskul", "text"],
            ["day", "Hari", "text"],
            ["start_time", "Jam Mulai", "time"],
            ["end_time", "Jam Selesai", "time"],
            ["location", "Lokasi", "text"],
            ["coach", "Pembina", "text"],
            ["trainer", "Pelatih", "text"],
            ["participant_grades", "Kelas Peserta", "text"],
            ["capacity", "Kuota", "number"],
            ["description", "Deskripsi", "textarea"],
            ["image_url", "URL Foto", "text"],
            ["image_file", "Upload Foto", "file"],
            ["active", "Aktif", "checkbox"]
        ]
    },

    activity: {
        table: "extracurricular_activities",
        title: "Kegiatan Eskul",
        fields: [
            ["extracurricular_id", "Eskul", "eskul"],
            ["title", "Judul", "text"],
            ["activity_date", "Tanggal", "date"],
            ["description", "Deskripsi", "textarea"],
            ["image_url", "URL Foto", "text"],
            ["image_file", "Upload Foto", "file"],
            ["published", "Publish", "checkbox"]
        ]
    },

    program: {
        table: "programs",
        title: "Program Sekolah",
        fields: [
            ["title", "Nama Program", "text"],
            ["description", "Deskripsi", "textarea"],
            ["sort_order", "Urutan", "number"],
            ["published", "Tampilkan", "checkbox"]
        ]
    },

    news: {
        table: "news",
        title: "Berita",
        fields: [
            ["title", "Judul", "text"],
            ["published_at", "Tanggal", "date"],
            ["excerpt", "Ringkasan", "textarea"],
            ["content", "Isi", "textarea"],
            ["image_url", "URL Foto", "text"],
            ["image_file", "Upload Foto", "file"],
            ["published", "Publish", "checkbox"]
        ]
    },

    announcement: {
        table: "announcements",
        title: "Pengumuman",
        fields: [
            ["title", "Judul", "text"],
            ["published_at", "Tanggal", "date"],
            ["body", "Isi", "textarea"],
            ["published", "Publish", "checkbox"]
        ]
    },

    achievement: {
        table: "achievements",
        title: "Prestasi",
        fields: [
            ["title", "Judul", "text"],
            ["category", "Kategori", "text"],
            ["level", "Tingkat", "text"],
            ["year", "Tahun", "number"],
            ["description", "Deskripsi", "textarea"],
            ["published", "Publish", "checkbox"]
        ]
    },

    gallery: {
        table: "gallery",
        title: "Galeri",
        fields: [
            ["title", "Judul Foto", "text"],
            ["image_url", "URL Foto", "text"],
            ["image_file", "Upload Foto", "file"],
            ["published", "Publish", "checkbox"]
        ]
    },

    document: {
        table: "documents",
        title: "Dokumen",
        fields: [
            ["title", "Nama Dokumen", "text"],
            ["category", "Kategori", "text"],
            ["description", "Deskripsi", "textarea"],
            ["file_url", "URL Dokumen", "text"],
            ["file_upload", "Upload File", "file"],
            ["published", "Publish", "checkbox"]
        ]
    },

    schedule: {
        table: "school_schedules",
        title: "Jadwal",
        fields: [
            ["day", "Hari", "text"],
            ["title", "Kegiatan/Judul", "text"],
            ["time_text", "Waktu", "text"],
            ["class_name", "Kelas", "text"],
            ["description", "Keterangan", "textarea"],
            ["sort_order", "Urutan", "number"],
            ["published", "Publish", "checkbox"]
        ]
    }
};

/* =========================================================
   VALIDASI CLIENT
   ========================================================= */

function isReady() {
    if (!window.SDN11) {
        console.error("SDN11 belum tersedia.");
        return false;
    }

    if (!SDN11.configured) {
        console.error("Supabase belum dikonfigurasi.");
        return false;
    }

    if (!c) {
        console.error("Supabase client tidak ditemukan.");
        return false;
    }

    return true;
}

/* =========================================================
   AUTHENTICATION
   ========================================================= */

async function authCheck() {
    if (!isReady()) {
        const msg = $("loginMsg");

        if (msg) {
            msg.textContent =
                "Supabase belum dikonfigurasi. Periksa admin/js/config.js.";
        }

        return;
    }

    try {
        const {
            data: { session },
            error
        } = await c.auth.getSession();

        if (error) {
            console.error("Gagal mengambil session:", error);

            showLogin();

            if ($("loginMsg")) {
                $("loginMsg").textContent = error.message;
            }

            return;
        }

        if (session) {
            showApp();
        } else {
            showLogin();
        }
    } catch (err) {
        console.error("Auth error:", err);
        showLogin();

        if ($("loginMsg")) {
            $("loginMsg").textContent = err.message;
        }
    }
}

/* =========================================================
   TAMPILAN LOGIN / APP
   ========================================================= */

function showApp() {
    $("loginView")?.classList.add("hidden");
    $("appView")?.classList.remove("hidden");

    loadAll();
}

function showLogin() {
    $("loginView")?.classList.remove("hidden");
    $("appView")?.classList.add("hidden");
}

/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(e) {
    e.preventDefault();

    if (!isReady()) {
        if ($("loginMsg")) {
            $("loginMsg").textContent =
                "Supabase belum siap. Periksa konfigurasi.";
        }

        return;
    }

    const email = $("email")?.value.trim();
    const password = $("password")?.value;

    if (!email || !password) {
        $("loginMsg").textContent =
            "Email dan password wajib diisi.";

        return;
    }

    $("loginMsg").textContent = "Memeriksa…";

    try {
        const { error } = await c.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            $("loginMsg").textContent = error.message;
            return;
        }

        $("loginMsg").textContent = "";

        showApp();

    } catch (err) {
        console.error("Login error:", err);

        $("loginMsg").textContent =
            err.message || "Login gagal.";
    }
}

/* =========================================================
   LOGOUT
   ========================================================= */

async function handleLogout() {
    if (!c) return;

    try {
        const { error } = await c.auth.signOut();

        if (error) {
            console.error("Logout error:", error);
            return;
        }

        showLogin();

    } catch (err) {
        console.error("Logout error:", err);
    }
}

/* =========================================================
   UPLOAD STORAGE
   ========================================================= */

async function upload(file, folder) {
    if (!file) return null;

    if (!c) {
        throw new Error("Supabase client belum tersedia.");
    }

    if (!SDN11.bucket) {
        throw new Error(
            "Storage bucket belum dikonfigurasi."
        );
    }

    const ext =
        (file.name.split(".").pop() || "bin").toLowerCase();

    const path =
        `${folder}/${crypto.randomUUID()}.${ext}`;

    const {
        error
    } = await c.storage
        .from(SDN11.bucket)
        .upload(path, file, {
            contentType: file.type,
            upsert: false
        });

    if (error) {
        throw error;
    }

    return c.storage
        .from(SDN11.bucket)
        .getPublicUrl(path)
        .data
        .publicUrl;
}

/* =========================================================
   LOAD SEMUA DATA
   ========================================================= */

async function loadAll() {
    if (!isReady()) return;

    try {
        const defsEntries = Object.entries(defs);

        const profileRequest =
            c.from("school_profile")
                .select("*")
                .eq("id", 1)
                .maybeSingle();

        const dataRequests =
            defsEntries.map(([_, d]) =>
                c.from(d.table)
                    .select("*")
                    .order("created_at", {
                        ascending: false
                    })
            );

        const stagingRequest =
            c.from("sync_staging")
                .select("*")
                .order("created_at", {
                    ascending: false
                });

        const [
            profileResult,
            ...results
        ] = await Promise.all([
            profileRequest,
            ...dataRequests,
            stagingRequest
        ]);

        if (profileResult.error) {
            console.error(
                "Gagal memuat profil:",
                profileResult.error
            );
        }

        profile = profileResult.data || {};

        fillProfile();

        defsEntries.forEach(([key], index) => {
            const result = results[index];

            if (result?.error) {
                console.error(
                    `Gagal memuat ${key}:`,
                    result.error
                );

                cache[key] = [];
            } else {
                cache[key] = result?.data || [];
            }
        });

        const stagingResult =
            results[defsEntries.length];

        cache.staging =
            stagingResult?.data || [];

        renderAll();

    } catch (err) {
        console.error(
            "Gagal memuat seluruh data:",
            err
        );

        alert(
            "Gagal memuat data admin: " +
            err.message
        );
    }
}

/* =========================================================
   PROFIL SEKOLAH
   ========================================================= */

function fillProfile() {
    const mapping = {
        schoolName: "name",
        schoolNpsn: "npsn",
        schoolStatus: "status",
        schoolLevel: "level",
        schoolAccreditation: "accreditation",
        schoolPrincipal: "principal",
        schoolStudents: "students",
        schoolStaff: "staff",
        schoolAddress: "address",
        schoolCity: "city",
        schoolPhone: "phone",
        schoolEmail: "email",
        schoolMaps: "maps_url",
        schoolProfileTitle: "profile_title",
        schoolDescription: "description",
        schoolVision: "vision",
        schoolHeroSubtitle: "hero_subtitle",
        schoolSpmbTitle: "spmb_title",
        schoolSpmbUrl: "spmb_url",
        schoolSpmbDescription: "spmb_description"
    };

    for (const [id, key] of Object.entries(mapping)) {
        const el = $(id);

        if (el) {
            el.value = profile[key] ?? "";
        }
    }

    const mission = $("schoolMission");

    if (mission) {
        mission.value =
            Array.isArray(profile.mission)
                ? profile.mission.join("\n")
                : "";
    }
}

/* =========================================================
   SIMPAN PROFIL
   ========================================================= */

async function saveProfile() {
    if (!isReady()) return;

    const payload = {
        id: 1,
        name: $("schoolName")?.value || "",
        npsn: $("schoolNpsn")?.value || "",
        status: $("schoolStatus")?.value || "",
        level: $("schoolLevel")?.value || "",
        accreditation:
            $("schoolAccreditation")?.value || "",
        principal:
            $("schoolPrincipal")?.value || "",
        students:
            Number($("schoolStudents")?.value) || null,
        staff:
            Number($("schoolStaff")?.value) || null,
        address:
            $("schoolAddress")?.value || "",
        city:
            $("schoolCity")?.value || "",
        phone:
            $("schoolPhone")?.value || "",
        email:
            $("schoolEmail")?.value || "",
        maps_url:
            $("schoolMaps")?.value || "",
        profile_title:
            $("schoolProfileTitle")?.value || "",
        description:
            $("schoolDescription")?.value || "",
        vision:
            $("schoolVision")?.value || "",
        mission:
            ($("schoolMission")?.value || "")
                .split("\n")
                .map(x => x.trim())
                .filter(Boolean),
        hero_subtitle:
            $("schoolHeroSubtitle")?.value || "",
        spmb_title:
            $("schoolSpmbTitle")?.value || "",
        spmb_url:
            $("schoolSpmbUrl")?.value || "",
        spmb_description:
            $("schoolSpmbDescription")?.value || "",
        updated_at:
            new Date().toISOString()
    };

    const msg = $("profileMsg");

    if (msg) {
        msg.textContent = "Menyimpan…";
    }

    try {
        const { error } =
            await c
                .from("school_profile")
                .upsert(payload);

        if (error) {
            throw error;
        }

        profile = payload;

        if (msg) {
            msg.textContent =
                "Profil berhasil disimpan.";
        }

        renderAll();

    } catch (err) {
        console.error(
            "Gagal menyimpan profil:",
            err
        );

        if (msg) {
            msg.textContent =
                "Gagal: " + err.message;
        }
    }
}

/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function renderAll() {
    if ($("kpiStudents")) {
        $("kpiStudents").textContent =
            profile.students ?? "—";
    }

    if ($("kpiRombel")) {
        $("kpiRombel").textContent =
            cache.rombel.length;
    }

    if ($("kpiEskul")) {
        $("kpiEskul").textContent =
            cache.eskul.length;
    }

    if ($("kpiStaging")) {
        $("kpiStaging").textContent =
            cache.staging.filter(
                x => x.status === "pending"
            ).length;
    }

    for (const key of Object.keys(defs)) {
        renderTable(key);
    }

    renderStaging();
}

/* =========================================================
   RENDER TABLE
   ========================================================= */

function renderTable(type) {
    const d = defs[type];
    const box = $(type + "Editor");

    if (!box) return;

    const fields =
        d.fields
            .filter(f => f[2] !== "file")
            .slice(0, 5);

    if (!cache[type].length) {
        box.innerHTML =
            '<p class="empty">Belum ada data. Klik “+ Tambah”.</p>';

        return;
    }

    box.innerHTML = `
        <div class="table-wrap">
            <table class="editor-table">
                <thead>
                    <tr>
                        ${fields.map(
                            f => `<th>${esc(f[1])}</th>`
                        ).join("")}
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    ${cache[type].map(x => `
                        <tr>
                            ${fields.map(f => `
                                <td>
                                    ${esc(
                                        displayValue(
                                            f,
                                            x[f[0]]
                                        )
                                    )}
                                </td>
                            `).join("")}

                            <td>
                                <div class="editor-actions">

                                    <button
                                        class="secondary"
                                        onclick="openEditor('${type}','${x.id}')">
                                        Edit
                                    </button>

                                    <button
                                        class="danger"
                                        onclick="deleteItem('${type}','${x.id}')">
                                        Hapus
                                    </button>

                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

/* =========================================================
   DISPLAY VALUE
   ========================================================= */

function displayValue(f, v) {
    if (f[2] === "checkbox") {
        return v ? "Ya" : "Tidak";
    }

    if (f[2] === "eskul") {
        const item =
            cache.eskul.find(
                e => e.id === v
            );

        return item?.name || "-";
    }

    return v ?? "-";
}

/* =========================================================
   OPEN EDITOR
   ========================================================= */

function openEditor(type, id) {
    const d = defs[type];

    if (!d) return;

    const item =
        id
            ? cache[type].find(
                x => String(x.id) === String(id)
            )
            : {};

    $("modalTitle").textContent =
        (id ? "Edit " : "Tambah ") +
        d.title;

    $("modalForm").innerHTML =
        d.fields
            .map(f =>
                fieldHTML(
                    f,
                    item?.[f[0]],
                    type
                )
            )
            .join("") +

        `
            <div class="form-actions">
                <button
                    type="button"
                    class="secondary"
                    onclick="closeModal()">
                    Batal
                </button>

                <button
                    type="submit"
                    class="primary">
                    Simpan
                </button>
            </div>
        `;

    $("modal").classList.remove("hidden");

    $("modalForm").onsubmit =
        (e) => saveEditor(
            e,
            type,
            id
        );
}

window.openEditor = openEditor;

/* =========================================================
   FIELD HTML
   ========================================================= */

function fieldHTML(f, v, type) {
    const [name, label, kind] = f;

    if (kind === "checkbox") {
        return `
            <label class="full">
                <input
                    type="checkbox"
                    name="${name}"
                    ${v !== false ? "checked" : ""}>
                ${esc(label)}
            </label>
        `;
    }

    if (kind === "textarea") {
        return `
            <label class="full">
                ${esc(label)}

                <textarea
                    name="${name}">${esc(v || "")}</textarea>
            </label>
        `;
    }

    if (kind === "file") {
        return `
            <label class="full">
                ${esc(label)}

                <input
                    type="file"
                    name="${name}">

                <span class="file-note">
                    File akan disimpan ke Supabase Storage.
                </span>
            </label>
        `;
    }

    if (kind === "eskul") {
        return `
            <label>
                ${esc(label)}

                <select
                    name="${name}"
                    required>

                    <option value="">
                        Pilih Eskul
                    </option>

                    ${cache.eskul.map(x => `
                        <option
                            value="${x.id}"
                            ${String(x.id) === String(v)
                                ? "selected"
                                : ""}>
                            ${esc(x.name)}
                        </option>
                    `).join("")}

                </select>
            </label>
        `;
    }

    const value =
        kind === "date" && v
            ? String(v).slice(0, 10)
            : (v ?? "");

    return `
        <label>
            ${esc(label)}

            <input
                type="${kind}"
                name="${name}"
                value="${esc(value)}">
        </label>
    `;
}

/* =========================================================
   SAVE EDITOR
   ========================================================= */

async function saveEditor(e, type, id) {
    e.preventDefault();

    const d = defs[type];

    if (!d) return;

    const fd =
        new FormData(e.target);

    const payload = {};

    for (const f of d.fields) {
        const [name, , kind] = f;

        if (kind === "file") {
            continue;
        }

        if (kind === "checkbox") {
            payload[name] =
                fd.get(name) === "on";

        } else if (kind === "number") {
            payload[name] =
                fd.get(name)
                    ? Number(fd.get(name))
                    : null;

        } else if (
            kind === "date" &&
            fd.get(name) &&
            ["news", "announcement"].includes(type)
        ) {
            payload[name] =
                fd.get(name) +
                "T00:00:00+07:00";

        } else {
            payload[name] =
                fd.get(name) || null;
        }
    }

    try {
        /* Upload gambar */

        const imageFile =
            fd.get("image_file");

        if (
            imageFile &&
            imageFile.size
        ) {
            payload.image_url =
                await upload(
                    imageFile,
                    type
                );
        }

        /* Upload dokumen */

        const docFile =
            fd.get("file_upload");

        if (
            docFile &&
            docFile.size
        ) {
            payload.file_url =
                await upload(
                    docFile,
                    "documents"
                );
        }

        let request;

        if (id) {
            request =
                c
                    .from(d.table)
                    .update(payload)
                    .eq("id", id);
        } else {
            request =
                c
                    .from(d.table)
                    .insert(payload);
        }

        const { error } =
            await request;

        if (error) {
            throw error;
        }

        closeModal();

        await loadAll();

    } catch (err) {
        console.error(
            "Gagal menyimpan data:",
            err
        );

        alert(
            "Gagal menyimpan data:\n" +
            err.message
        );
    }
}

/* =========================================================
   DELETE
   ========================================================= */

async function deleteItem(type, id) {
    if (!confirm("Hapus data ini?")) {
        return;
    }

    const d = defs[type];

    if (!d) return;

    try {
        const { error } =
            await c
                .from(d.table)
                .delete()
                .eq("id", id);

        if (error) {
            throw error;
        }

        await loadAll();

    } catch (err) {
        console.error(
            "Gagal menghapus data:",
            err
        );

        alert(
            "Gagal menghapus data:\n" +
            err.message
        );
    }
}

window.deleteItem = deleteItem;

/* =========================================================
   MODAL
   ========================================================= */

function closeModal() {
    $("modal")?.classList.add("hidden");
}

window.closeModal = closeModal;

/* =========================================================
   SYNC DATA
   ========================================================= */

async function syncData() {
    const url =
        $("syncUrl")?.value.trim();

    if (!url) {
        $("syncResult").innerHTML =
            "<p class='warn'>Masukkan URL endpoint.</p>";

        return;
    }

    $("syncResult").innerHTML =
        "<p>Memuat…</p>";

    try {
        const r =
            await fetch(url);

        if (!r.ok) {
            throw new Error(
                "HTTP " + r.status
            );
        }

        const data =
            await r.json();

        const {
            error
        } = await c
            .from("sync_staging")
            .insert({
                source_url: url,
                payload: data,
                status: "pending"
            });

        if (error) {
            throw error;
        }

        await c
            .from("sync_runs")
            .insert({
                source_url: url,
                status: "success"
            });

        $("syncResult").innerHTML =
            "<p>Data kandidat tersimpan di staging.</p>";

        await loadAll();

    } catch (err) {
        console.error(
            "Sync error:",
            err
        );

        try {
            await c
                .from("sync_runs")
                .insert({
                    source_url: url,
                    status: "failed",
                    note: err.message
                });
        } catch (logError) {
            console.error(
                "Gagal mencatat sync error:",
                logError
            );
        }

        $("syncResult").innerHTML =
            `<p class="warn">
                Gagal: ${esc(err.message)}.
                Periksa CORS/endpoint.
            </p>`;
    }
}

/* =========================================================
   STAGING
   ========================================================= */

function renderStaging() {
    const list =
        $("stagingList");

    if (!list) return;

    const pending =
        cache.staging.slice(0, 10);

    list.innerHTML =
        pending.length

            ? pending.map(x => `
                <div class="staging-item">

                    <b>
                        ${esc(x.status)}
                    </b>

                    <small>
                        ${esc(x.source_url || "")}
                        ·
                        ${new Date(
                            x.created_at
                        ).toLocaleString("id-ID")}
                    </small>

                    <div class="editor-actions">

                        ${
                            x.status === "pending"
                                ? `
                                    <button
                                        class="secondary"
                                        onclick="setStaging('${x.id}','accepted')">
                                        Terima sebagai referensi
                                    </button>

                                    <button
                                        class="danger"
                                        onclick="setStaging('${x.id}','rejected')">
                                        Tolak
                                    </button>
                                `
                                : ""
                        }

                    </div>
                </div>
            `).join("")

            : `
                <p class="empty">
                    Belum ada data staging.
                </p>
            `;
}

async function setStaging(id, status) {
    try {
        const { error } =
            await c
                .from("sync_staging")
                .update({
                    status,
                    reviewed_at:
                        new Date().toISOString()
                })
                .eq("id", id);

        if (error) {
            throw error;
        }

        await loadAll();

    } catch (err) {
        console.error(
            "Gagal memperbarui staging:",
            err
        );

        alert(
            "Gagal memperbarui staging:\n" +
            err.message
        );
    }
}

window.setStaging = setStaging;

/* =========================================================
   INISIALISASI ADMIN
   ========================================================= */

function initAdmin() {

    /* Login */

    $("loginForm")?.addEventListener(
        "submit",
        handleLogin
    );

    /* Logout */

    $("logoutBtn")?.addEventListener(
        "click",
        handleLogout
    );

    /* Simpan profil */

    $("saveProfileBtn")?.addEventListener(
        "click",
        saveProfile
    );

    /* Tambah data */

    document
        .querySelectorAll("[data-add]")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => openEditor(
                    button.dataset.add,
                    null
                )
            );
        });

    /* Tutup modal */

    $("modalClose")?.addEventListener(
        "click",
        closeModal
    );

    $("modal")?.addEventListener(
        "click",
        (e) => {
            if (
                e.target === $("modal")
            ) {
                closeModal();
            }
        }
    );

    /* Sinkronisasi */

    $("syncBtn")?.addEventListener(
        "click",
        syncData
    );

    /* Jalankan authentication */

    authCheck();
}

/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initAdmin
    );
} else {
    initAdmin();
}
```
