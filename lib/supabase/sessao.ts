import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { obterConfigSupabase } from "./config";

// Roda antes de cada página do painel:
// 1) renova a sessão de login quando necessário;
// 2) manda para /login quem não estiver logado.
export async function atualizarSessao(request: NextRequest) {
  const { url, chave } = obterConfigSupabase();
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGravar) {
        cookiesParaGravar.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        resposta = NextResponse.next({ request });
        cookiesParaGravar.forEach(({ name, value, options }) =>
          resposta.cookies.set(name, value, options)
        );
      },
    },
  });

  // Importante: não coloque código entre createServerClient e getUser.
  // getUser() confirma o login direto no Supabase (mais seguro que só ler o cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/painel")) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/login";
    destino.search = "";
    const redirecionar = NextResponse.redirect(destino);
    resposta.cookies
      .getAll()
      .forEach((cookie) => redirecionar.cookies.set(cookie));
    return redirecionar;
  }

  return resposta;
}
