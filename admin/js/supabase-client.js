(() => {
  const cfg = window.SDN11_CONFIG || {};
  const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("PASTE_")
    && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  window.SDN11 = {
    configured,
    client: configured ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null,
    bucket: cfg.STORAGE_BUCKET || "school-media"
  };
})();