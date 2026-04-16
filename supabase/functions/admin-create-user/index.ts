import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

type Role = "parent" | "scout" | "instructor";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uErr } = await userClient.auth.getUser();
    if (uErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Caller must be instructor
    const { data: rolesRows } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const isInstructor = (rolesRows ?? []).some((r: any) => r.role === "instructor");
    if (!isInstructor) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const display_name = String(body.display_name ?? "").trim() || null;
    const role = String(body.role ?? "scout") as Role;

    if (!email || !password) return json({ error: "email and password required" }, 400);
    if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);
    if (!["parent", "scout", "instructor"].includes(role)) return json({ error: "invalid role" }, 400);

    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: display_name ? { display_name } : undefined,
    });
    if (cErr || !created.user) return json({ error: cErr?.message ?? "create failed" }, 400);

    if (display_name) {
      await admin.from("profiles").update({ display_name }).eq("id", created.user.id);
    }
    await admin.from("user_roles").insert({ user_id: created.user.id, role });

    return json({ ok: true, user_id: created.user.id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
