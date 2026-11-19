import type { NextRequest } from "next/server";
import { atualizarSessao } from "./lib/supabase/sessao";

// Next.js 16 ou mais novo: este arquivo se chama proxy.ts.
// (No Next.js 15 o nome do arquivo é middleware.ts e a função se chama middleware.)
export async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  matcher: ["/painel/:path*"],
};
