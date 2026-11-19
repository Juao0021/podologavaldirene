"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { criarClienteServidor } from "../../../lib/supabase/server";
import {
  dataValida,
  dentroDoHorarioDeAtendimento,
  horaValida,
  montarInstante,
} from "../../../lib/datas";
import { STATUS_VALIDOS } from "../../../lib/status";

const esquemaAgendamento = z.object({
  id: z.string().uuid().optional(),
  clienteId: z.string().uuid("Escolha a cliente."),
  servicoId: z.string().uuid("Escolha o serviço."),
  data: z.string().refine(dataValida, "Escolha uma data válida."),
  hora: z.string().refine(horaValida, "Escolha um horário válido."),
  duracao: z
    .string()
    .trim()
    .regex(/^\d+$/, "A duração deve ser um número inteiro de minutos."),
  status: z.string().refine((s) => (STATUS_VALIDOS as string[]).includes(s), "Status inválido."),
  observacoes: z
    .string()
    .trim()
    .max(1000, "As observações podem ter no máximo 1000 letras."),
});

export async function salvarAgendamento(
  _estadoAnterior: { erro: string | null },
  formData: FormData
): Promise<{ erro: string | null }> {
  const idTexto = String(formData.get("id") ?? "");

  // 1) Valida o que foi digitado
  const dados = esquemaAgendamento.safeParse({
    id: idTexto === "" ? undefined : idTexto,
    clienteId: String(formData.get("clienteId") ?? ""),
    servicoId: String(formData.get("servicoId") ?? ""),
    data: String(formData.get("data") ?? ""),
    hora: String(formData.get("hora") ?? ""),
    duracao: String(formData.get("duracao") ?? ""),
    status: String(formData.get("status") ?? ""),
    observacoes: String(formData.get("observacoes") ?? ""),
  });
  if (!dados.success) {
    return { erro: dados.error.issues[0].message };
  }

  const d = dados.data;
  const duracaoMin = Number(d.duracao);
  if (duracaoMin < 5 || duracaoMin > 480) {
    return { erro: "A duração deve ficar entre 5 e 480 minutos." };
  }

  // 2) Horário de atendimento (segunda a sexta, 14h às 20h), com exceção opcional
  const foraDoHorarioPermitido = formData.get("foraHorario") === "on";
  if (
    !foraDoHorarioPermitido &&
    !dentroDoHorarioDeAtendimento(d.data, d.hora, duracaoMin)
  ) {
    return {
      erro: "Esse horário está fora do atendimento (segunda a sexta, das 14h às 20h). Se for uma exceção, marque a opção abaixo.",
    };
  }

  const inicio = montarInstante(d.data, d.hora);
  const fim = new Date(inicio.getTime() + duracaoMin * 60_000);

  const registro = {
    cliente_id: d.clienteId,
    servico_id: d.servicoId,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    status: d.status,
    observacoes: d.observacoes === "" ? null : d.observacoes,
  };

  // 3) Grava no banco. O banco recusa horários sobrepostos (código 23P01).
  const supabase = await criarClienteServidor();
  let erro: { code?: string; message: string } | null = null;

  if (d.id) {
    const { data, error } = await supabase
      .from("agendamentos")
      .update(registro)
      .eq("id", d.id)
      .select("id");
    erro = error;
    if (!error && (!data || data.length === 0)) {
      return { erro: "Agendamento não encontrado." };
    }
  } else {
    const { error } = await supabase.from("agendamentos").insert(registro);
    erro = error;
  }

  if (erro) {
    if (erro.code === "23P01") {
      return {
        erro: "Já existe um agendamento nesse horário. Escolha outro horário, ou cancele o outro agendamento antes.",
      };
    }
    if (erro.code === "23503") {
      return { erro: "Cliente ou serviço não encontrado." };
    }
    console.error("Erro ao salvar agendamento:", erro.code);
    return { erro: "Não foi possível salvar. Tente de novo." };
  }

  revalidatePath("/painel/agenda");
  redirect(`/painel/agenda?vista=dia&data=${d.data}`);
}
