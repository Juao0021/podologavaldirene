"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { criarClienteServidor } from "../../../lib/supabase/server";
import { dataValida, montarInstante } from "../../../lib/datas";
import { reaisParaCentavos } from "../../../lib/formatar";
import { FORMAS_VALIDAS } from "../../../lib/financeiro";

const VALOR_MAXIMO_CENTAVOS = 100_000_000; // R$ 1.000.000,00

type Estado = { erro: string | null };

// ---------------------------------------------------------------
// PAGAMENTOS
// ---------------------------------------------------------------
const esquemaPagamento = z.object({
  id: z.string().uuid().optional(),
  agendamentoId: z.string().uuid().optional(),
  valor: z.string().trim().min(1, "Digite o valor."),
  forma: z
    .string()
    .refine((f) => (FORMAS_VALIDAS as string[]).includes(f), "Escolha a forma de pagamento."),
  data: z.string().refine(dataValida, "Escolha uma data válida."),
  observacao: z
    .string()
    .trim()
    .max(500, "A observação pode ter no máximo 500 letras."),
});

export async function salvarPagamento(
  _anterior: Estado,
  formData: FormData
): Promise<Estado> {
  const idTexto = String(formData.get("id") ?? "");
  const agTexto = String(formData.get("agendamentoId") ?? "");

  const dados = esquemaPagamento.safeParse({
    id: idTexto === "" ? undefined : idTexto,
    agendamentoId: agTexto === "" ? undefined : agTexto,
    valor: String(formData.get("valor") ?? ""),
    forma: String(formData.get("forma") ?? ""),
    data: String(formData.get("data") ?? ""),
    observacao: String(formData.get("observacao") ?? ""),
  });
  if (!dados.success) {
    return { erro: dados.error.issues[0].message };
  }

  const valorCentavos = reaisParaCentavos(dados.data.valor);
  if (valorCentavos === null || valorCentavos <= 0) {
    return { erro: "Valor inválido. Use o formato 120,00." };
  }
  if (valorCentavos > VALOR_MAXIMO_CENTAVOS) {
    return { erro: "Valor alto demais. Confira o que foi digitado." };
  }

  const registro = {
    agendamento_id: dados.data.agendamentoId ?? null,
    valor_centavos: valorCentavos,
    forma: dados.data.forma,
    // Guardado ao meio-dia no horário de São Paulo, para o dia nunca "virar" por fuso
    pago_em: montarInstante(dados.data.data, "12:00").toISOString(),
    observacao: dados.data.observacao === "" ? null : dados.data.observacao,
  };

  const supabase = await criarClienteServidor();
  let erro: { code?: string } | null = null;

  if (dados.data.id) {
    const { data, error } = await supabase
      .from("pagamentos")
      .update(registro)
      .eq("id", dados.data.id)
      .select("id");
    erro = error;
    if (!error && (!data || data.length === 0)) {
      return { erro: "Pagamento não encontrado." };
    }
  } else {
    const { error } = await supabase.from("pagamentos").insert(registro);
    erro = error;
  }

  if (erro) {
    if (erro.code === "23503") {
      return { erro: "O atendimento escolhido não foi encontrado." };
    }
    console.error("Erro ao salvar pagamento:", erro.code);
    return { erro: "Não foi possível salvar. Tente de novo." };
  }

  revalidatePath("/painel/financeiro");
  revalidatePath("/painel/relatorios");
  redirect(`/painel/financeiro?mes=${dados.data.data.slice(0, 7)}`);
}

export async function excluirPagamento(formData: FormData): Promise<void> {
  const id = z.string().uuid().safeParse(String(formData.get("id") ?? ""));
  if (!id.success) redirect("/painel/financeiro");

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("pagamentos").delete().eq("id", id.data);
  if (error) console.error("Erro ao excluir pagamento:", error.code);

  revalidatePath("/painel/financeiro");
  revalidatePath("/painel/relatorios");
  redirect("/painel/financeiro");
}

// ---------------------------------------------------------------
// DESPESAS
// ---------------------------------------------------------------
const esquemaDespesa = z.object({
  id: z.string().uuid().optional(),
  descricao: z
    .string()
    .trim()
    .min(2, "Descreva a despesa (mínimo 2 letras).")
    .max(200, "A descrição pode ter no máximo 200 letras."),
  categoria: z.string().trim().max(60, "A categoria pode ter no máximo 60 letras."),
  valor: z.string().trim().min(1, "Digite o valor."),
  data: z.string().refine(dataValida, "Escolha uma data válida."),
});

export async function salvarDespesa(
  _anterior: Estado,
  formData: FormData
): Promise<Estado> {
  const idTexto = String(formData.get("id") ?? "");

  const dados = esquemaDespesa.safeParse({
    id: idTexto === "" ? undefined : idTexto,
    descricao: String(formData.get("descricao") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    valor: String(formData.get("valor") ?? ""),
    data: String(formData.get("data") ?? ""),
  });
  if (!dados.success) {
    return { erro: dados.error.issues[0].message };
  }

  const valorCentavos = reaisParaCentavos(dados.data.valor);
  if (valorCentavos === null || valorCentavos <= 0) {
    return { erro: "Valor inválido. Use o formato 120,00." };
  }
  if (valorCentavos > VALOR_MAXIMO_CENTAVOS) {
    return { erro: "Valor alto demais. Confira o que foi digitado." };
  }

  const registro = {
    descricao: dados.data.descricao,
    categoria: dados.data.categoria === "" ? null : dados.data.categoria,
    valor_centavos: valorCentavos,
    data: dados.data.data,
  };

  const supabase = await criarClienteServidor();
  let erro: { code?: string } | null = null;

  if (dados.data.id) {
    const { data, error } = await supabase
      .from("despesas")
      .update(registro)
      .eq("id", dados.data.id)
      .select("id");
    erro = error;
    if (!error && (!data || data.length === 0)) {
      return { erro: "Despesa não encontrada." };
    }
  } else {
    const { error } = await supabase.from("despesas").insert(registro);
    erro = error;
  }

  if (erro) {
    console.error("Erro ao salvar despesa:", erro.code);
    return { erro: "Não foi possível salvar. Tente de novo." };
  }

  revalidatePath("/painel/financeiro");
  revalidatePath("/painel/relatorios");
  redirect(`/painel/financeiro?mes=${dados.data.data.slice(0, 7)}`);
}

export async function excluirDespesa(formData: FormData): Promise<void> {
  const id = z.string().uuid().safeParse(String(formData.get("id") ?? ""));
  if (!id.success) redirect("/painel/financeiro");

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("despesas").delete().eq("id", id.data);
  if (error) console.error("Erro ao excluir despesa:", error.code);

  revalidatePath("/painel/financeiro");
  revalidatePath("/painel/relatorios");
  redirect("/painel/financeiro");
}
