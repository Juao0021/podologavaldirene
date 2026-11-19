"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { criarClienteServidor } from "../../../lib/supabase/server";
import { reaisParaCentavos } from "../../../lib/formatar";

const esquemaServico = z.object({
  id: z.string().uuid().optional(),
  nome: z
    .string()
    .trim()
    .min(2, "Digite o nome do serviço (mínimo 2 letras).")
    .max(150, "O nome pode ter no máximo 150 letras."),
  descricao: z
    .string()
    .trim()
    .max(500, "A descrição pode ter no máximo 500 letras."),
  preco: z.string().trim().min(1, "Digite o preço."),
  duracao: z
    .string()
    .trim()
    .regex(/^\d+$/, "A duração deve ser um número inteiro de minutos."),
});

export async function salvarServico(
  _estadoAnterior: { erro: string | null },
  formData: FormData
): Promise<{ erro: string | null }> {
  const idTexto = String(formData.get("id") ?? "");

  // 1) Valida o que foi digitado
  const dados = esquemaServico.safeParse({
    id: idTexto === "" ? undefined : idTexto,
    nome: String(formData.get("nome") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    preco: String(formData.get("preco") ?? ""),
    duracao: String(formData.get("duracao") ?? ""),
  });
  if (!dados.success) {
    return { erro: dados.error.issues[0].message };
  }

  const precoCentavos = reaisParaCentavos(dados.data.preco);
  if (precoCentavos === null) {
    return { erro: "Preço inválido. Use o formato 120,00." };
  }

  const duracaoMin = Number(dados.data.duracao);
  if (duracaoMin < 5 || duracaoMin > 480) {
    return { erro: "A duração deve ficar entre 5 e 480 minutos." };
  }

  const registro = {
    nome: dados.data.nome,
    descricao: dados.data.descricao === "" ? null : dados.data.descricao,
    preco_centavos: precoCentavos,
    duracao_min: duracaoMin,
    ativo: formData.get("ativo") === "on",
  };

  // 2) Grava no banco (as regras RLS garantem que só a proprietária consegue)
  const supabase = await criarClienteServidor();

  if (dados.data.id) {
    const { data, error } = await supabase
      .from("servicos")
      .update(registro)
      .eq("id", dados.data.id)
      .select("id");
    if (error) {
      console.error("Erro ao atualizar serviço:", error.message);
      return { erro: "Não foi possível salvar. Tente de novo." };
    }
    if (!data || data.length === 0) {
      return { erro: "Serviço não encontrado." };
    }
  } else {
    const { error } = await supabase.from("servicos").insert(registro);
    if (error) {
      console.error("Erro ao criar serviço:", error.message);
      return { erro: "Não foi possível salvar. Tente de novo." };
    }
  }

  revalidatePath("/painel/servicos");
  redirect("/painel/servicos");
}
