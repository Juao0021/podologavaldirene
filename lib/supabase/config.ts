// Lê as duas informações PÚBLICAS do Supabase que estão no arquivo .env.local.
// A chave "publishable" é segura no navegador: quem protege os dados são as
// regras (RLS) do banco. NUNCA coloque aqui a chave "secret" ou "service_role".
export function obterConfigSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !chave) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local. Depois de criar ou editar o arquivo, pare o servidor (Ctrl + C) e rode npm run dev de novo."
    );
  }

  return { url, chave };
}
