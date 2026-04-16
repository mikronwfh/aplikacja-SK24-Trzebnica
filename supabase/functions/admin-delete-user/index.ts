import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uErr } = await userClient.auth.getUser();
    if (uErr || !user) return j({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: rolesRows } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const isInstructor = (rolesRows ?? []).some((r: any) => r.role === "instructor");
    if (!isInstructor) return j({ error: "Forbidden" }, 403);

    const { user_id } = await req.json();
    if (!user_id || typeof user_id !== "string") return j({ error: "user_id required" }, 400);
    if (user_id === user.id) return j({ error: "Nie możesz usunąć własnego konta" }, 400);

    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) return j({ error: error.message }, 400);
    return j({ ok: true });
  } catch (e) {
    return j({ error: (e as Error).message }, 500);
  }
});
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
