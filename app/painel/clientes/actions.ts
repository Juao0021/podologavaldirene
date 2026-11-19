"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { criarClienteServidor } from "../../../lib/supabase/server";
import { formatarTelefone } from "../../../lib/formatar";

const esquemaCliente = z.object({
  id: z.string().uuid().optional(),
  nome: z
    .string()
    .trim()
    .min(2, "Digite o nome da cliente (mínimo 2 letras).")
    .max(120, "O nome pode ter no máximo 120 letras."),
  telefone: z.string().trim().max(30, "Telefone muito longo."),
  observacoes: z
    .string()
    .trim()
    .max(2000, "As observações podem ter no máximo 2000 letras."),
});

export async function salvarCliente(
  _estadoAnterior: { erro: string | null },
  formData: FormData
): Promise<{ erro: string | null }> {
  const idTexto = String(formData.get("id") ?? "");

  // 1) Valida o que foi digitado
  const dados = esquemaCliente.safeParse({
    id: idTexto === "" ? undefined : idTexto,
    nome: String(formData.get("nome") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    observacoes: String(formData.get("observacoes") ?? ""),
  });
  if (!dados.success) {
    return { erro: dados.error.issues[0].message };
  }

  const telefone = formatarTelefone(dados.data.telefone);
  if (!telefone.valido) {
    return {
      erro: "Telefone inválido. Use o DDD e o número, por exemplo (47) 98829-6502.",
    };
  }

  const consentiu = formData.get("consentimento") === "on";
  const supabase = await criarClienteServidor();

  // 2) Mantém a data original do consentimento se já existia
  let consentimentoEm: string | null = null;
  if (consentiu) {
    consentimentoEm = new Date().toISOString();
    if (dados.data.id) {
      const { data: atual } = await supabase
        .from("clientes")
        .select("consentimento_lgpd, consentimento_em")
        .eq("id", dados.data.id)
        .maybeSingle();
      if (atual?.consentimento_lgpd && atual.consentimento_em) {
        consentimentoEm = atual.consentimento_em;
      }
    }
  }

  const registro = {
    nome: dados.data.nome,
    telefone: telefone.valor,
    observacoes: dados.data.observacoes === "" ? null : dados.data.observacoes,
    consentimento_lgpd: consentiu,
    consentimento_em: consentimentoEm,
  };

  // 3) Grava no banco (as regras RLS garantem que só a proprietária consegue)
  if (dados.data.id) {
    const { data, error } = await supabase
      .from("clientes")
      .update(registro)
      .eq("id", dados.data.id)
      .select("id");
    if (error) {
      console.error("Erro ao atualizar cliente:", error.code);
      return { erro: "Não foi possível salvar. Tente de novo." };
    }
    if (!data || data.length === 0) {
      return { erro: "Cliente não encontrada." };
    }
  } else {
    const { error } = await supabase.from("clientes").insert(registro);
    if (error) {
      console.error("Erro ao criar cliente:", error.code);
      return { erro: "Não foi possível salvar. Tente de novo." };
    }
  }

  revalidatePath("/painel/clientes");
  redirect("/painel/clientes");
}
