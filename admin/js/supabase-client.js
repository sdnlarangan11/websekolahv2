
(() => {
  const cfg = window.SDN11_CONFIG || {};

  const configured =
    typeof cfg.SUPABASE_URL === "string" &&
    cfg.SUPABASE_URL.startsWith("https://") &&
    !cfg.SUPABASE_URL.includes("PASTE_") &&
    typeof cfg.SUPABASE_ANON_KEY === "string" &&
    cfg.SUPABASE_ANON_KEY.trim() !== "" &&
    !cfg.SUPABASE_ANON_KEY.includes("PASTE_") &&
    typeof window.supabase?.createClient === "function";

  window.SDN11 = {
    configured,
    client: configured
      ? window.supabase.createClient(
          cfg.SUPABASE_URL,
          cfg.SUPABASE_ANON_KEY
        )
      : null,
    bucket: cfg.STORAGE_BUCKET || "school-media"
  };

  console.log("SDN11 Supabase:", {
    configured: window.SDN11.configured,
    bucket: window.SDN11.bucket
  });
})();

