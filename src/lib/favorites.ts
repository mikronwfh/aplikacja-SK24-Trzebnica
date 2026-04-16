import { supabase } from "@/integrations/supabase/client";

export type FavType = "song" | "law";

export async function listFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("item_type, item_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function toggleFavorite(userId: string, type: FavType, itemId: string, on: boolean) {
  if (on) {
    const { error } = await supabase.from("favorites").insert({ user_id: userId, item_type: type, item_id: itemId });
    if (error && !error.message.includes("duplicate")) throw error;
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("item_type", type)
      .eq("item_id", itemId);
    if (error) throw error;
  }
}
