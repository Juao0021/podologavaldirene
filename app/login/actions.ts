"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { criarClienteServidor } from "../../lib/supabase/server";

const esquemaLogin = z.object({
  email: z.string().trim().email("Digite um e-mail válido."),
  senha: z.string().min(1, "Digite a senha."),
});

export async function entrar(
  _estadoAnterior: { erro: string | null },
  formData: FormData
): Promise<{ erro: string | null }> {
  // 1) Valida o que foi digitado
  const dados = esquemaLogin.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!dados.success) {
    return { erro: dados.error.issues[0].message };
  }

  // 2) Tenta entrar no Supabase
  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });

  // Mensagem genérica de propósito: não revela se o e-mail existe.
  if (error) {
    return { erro: "E-mail ou senha incorretos." };
  }

  redirect("/painel");
}
