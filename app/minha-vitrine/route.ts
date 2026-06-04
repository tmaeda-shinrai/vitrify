import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Atalho do PWA "Ver vitrine" (#0017): redireciona a dona logada para a sua
// vitrine pública. Sem sessão → login; sem vitrine ainda → painel de produtos.
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: vitrine } = await supabase
    .from("vitrines")
    .select("slug")
    .eq("owner_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  const target = vitrine?.slug ? `/${vitrine.slug}` : "/produtos";
  return NextResponse.redirect(new URL(target, request.url));
}
