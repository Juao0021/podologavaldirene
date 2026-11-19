import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { obterConfigSupabase } from "./config";

// Cria a conexão com o Supabase para uso no servidor (páginas e ações).
// A sessão de login fica guardada em cookies.
export async function criarClienteServidor() {
  const { url, chave } = obterConfigSupabase();
  const cookieStore = await cookies();

  return createServerClient(url, chave, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaGravar) {
        try {
          cookiesParaGravar.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Em páginas do servidor não dá para gravar cookies.
          // Tudo bem: a renovação da sessão é feita em proxy.ts.
        }
      },
    },
  });
}
