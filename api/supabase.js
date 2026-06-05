
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase: URL ou clé ANON manquante dans .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/** Lire toutes les idées */
export async function fetchIdees() {
  const { data, error } = await supabase.from("Idees").select("*");
  if (error) {
    console.error("Supabase fetchIdees error:", error);
    throw error;
  }
  return data || [];
}

/** Ajouter une idée */
export async function insertIdee({ titre, categorie, description }) {
  const { data, error } = await supabase
    .from("Idees")
    .insert([{ titre, categorie, description }])
    .select();
  if (error) {
    console.error("Supabase insertIdee error:", error);
    throw error;
  }
  return data?.[0] ?? null;
}

/** Charger une idée par id */
export async function fetchIdeeById(id) {
  const { data, error } = await supabase
    .from("Idees")
    .select()
    .eq("id", id)
    .single();
  if (error) {
    console.error("Supabase fetchIdeeById error:", error);
    throw error;
  }
  return data;
}

/** Mettre à jour une idée */
export async function updateIdee(id, { titre, categorie, description }) {
  const { data, error } = await supabase
    .from("Idees")
    .update({ titre, categorie, description })
    .eq("id", id)
    .select();
  if (error) {
    console.error("Supabase updateIdee error:", error);
    throw error;
  }
  return data?.[0] ?? null;
}

/** Supprimer une idée */
export async function deleteIdee(id) {
  const { error } = await supabase.from("Idees").delete().eq("id", id);
  if (error) {
    console.error("Supabase deleteIdee error:", error);
    throw error;
  }
}

