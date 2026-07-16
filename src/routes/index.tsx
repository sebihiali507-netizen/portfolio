import { createFileRoute } from "@tanstack/react-router";
import Portfolio from "@/components/Portfolio";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    return { projects: data ?? [] };
  },
  component: Portfolio,
});
