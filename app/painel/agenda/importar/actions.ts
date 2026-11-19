"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { criarClienteServidor } from "../../../../lib/supabase/server";
import { dataValida, horaValida, montarInstante } from "../../../../lib/datas";
import { normalizar } from "../../../../lib/importar-agenda";

export type EstadoImportacao = {
  erro: string | null;
  concluido: boolean;
  importados: number;
  clientesNovos: number;
  ignorados: { rotulo: string; motivo: string }[];
};

export const estadoInicialImportacao: EstadoImportacao = {
  erro: null,
  concluido: false,
  importados: 0,
  clientesNovos: 0,
  ignorados: [],
};

const esquemaLinha = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Nome da cliente muito curto.")
    .max(120, "Nome da cliente muito longo."),
  data: z.string().refine(dataValida, "Data inválida."),
  hora: z.string().refine(horaValida, "Horário inválido."),
  duracao: z.number().int().min(5).max(480),
  servicoId: z.string().uuid("Serviço inválido."),
  observacoes: z.string().trim().max(1000, "Observação muito longa."),
});

const esquemaPedido = z.object({
  status: z.enum(["confirmado", "solicitado"]),
  linhas: z.array(esquemaLinha).min(1, "Nenhuma linha selecionada.").max(300),
});

function rotuloDaLinha(l: { nome: string; data: string; hora: string }): string {
  return `${l.data.slice(8, 10)}/${l.data.slice(5, 7)} ${l.hora} - ${l.nome}`;
}

export async function importarAgendamentos(
  _anterior: EstadoImportacao,
  formData: FormData
): Promise<EstadoImportacao> {
  // 1) Lê e valida tudo de novo no servidor (o navegador não é confiável)
  let bruto: unknown;
  try {
    bruto = JSON.parse(String(formData.get("dados") ?? ""));
  } catch {
    return { ...estadoInicialImportacao, erro: "Dados da importação inválidos." };
  }
  const pedido = esquemaPedido.safeParse(bruto);
  if (!pedido.success) {
    return {
      ...estadoInicialImportacao,
      erro: pedido.error.issues[0]?.message ?? "Dados da importação inválidos.",
    };
  }
  const { status, linhas } = pedido.data;

  const supabase = await criarClienteServidor();
  const { data: usuario } = await supabase.auth.getUser();
  if (!usuario.user) {
    return { ...estadoInicialImportacao, erro: "Sessão expirada. Entre de novo." };
  }

  // 2) Clientes que já existem (comparados pelo nome, sem acento e sem maiúsculas)
  const { data: existentes, error: erroClientes } = await supabase
    .from("clientes")
    .select("id, nome")
    .limit(5000);
  if (erroClientes) {
    console.error("Erro ao listar clientes:", erroClientes.code);
    return { ...estadoInicialImportacao, erro: "Não foi possível ler os clientes." };
  }

  type Cliente = { id: string; nova: boolean; agendamentos: number };
  const clientes = new Map<string, Cliente>();
  const ambiguos = new Set<string>();
  for (const c of existentes ?? []) {
    const chave = normalizar(c.nome);
    if (clientes.has(chave)) ambiguos.add(chave);
    else clientes.set(chave, { id: c.id, nova: false, agendamentos: 0 });
  }

  // 3) Agendamentos que já existem no período (evita duplicar se importar duas vezes)
  const ordenadas = [...linhas].sort((a, b) =>
    (a.data + a.hora).localeCompare(b.data + b.hora)
  );
  const primeira = montarInstante(ordenadas[0].data, ordenadas[0].hora);
  const ultima = montarInstante(
    ordenadas[ordenadas.length - 1].data,
    ordenadas[ordenadas.length - 1].hora
  );
  const { data: jaMarcados } = await supabase
    .from("agendamentos")
    .select("cliente_id, inicio")
    .neq("status", "cancelado")
    .gte("inicio", primeira.toISOString())
    .lte("inicio", ultima.toISOString())
    .limit(5000);
  const ocupados = new Set(
    (jaMarcados ?? []).map((a) => `${a.cliente_id}|${new Date(a.inicio).toISOString()}`)
  );

  // 4) Grava linha por linha
  const ignorados: { rotulo: string; motivo: string }[] = [];
  let importados = 0;

  for (const l of ordenadas) {
    const rotulo = rotuloDaLinha(l);
    const chaveNome = normalizar(l.nome);

    if (ambiguos.has(chaveNome)) {
      ignorados.push({
        rotulo,
        motivo:
          "Há mais de uma cliente com esse nome. Use o nome completo na prévia.",
      });
      continue;
    }

    let cliente = clientes.get(chaveNome);
    if (!cliente) {
      const { data: criada, error } = await supabase
        .from("clientes")
        .insert({ nome: l.nome, consentimento_lgpd: false })
        .select("id")
        .single();
      if (error || !criada) {
        console.error("Erro ao criar cliente:", error?.code);
        ignorados.push({ rotulo, motivo: "Não foi possível cadastrar a cliente." });
        continue;
      }
      cliente = { id: criada.id, nova: true, agendamentos: 0 };
      clientes.set(chaveNome, cliente);
    }

    const inicio = montarInstante(l.data, l.hora);
    const fim = new Date(inicio.getTime() + l.duracao * 60_000);

    if (ocupados.has(`${cliente.id}|${inicio.toISOString()}`)) {
      ignorados.push({ rotulo, motivo: "Já existe um agendamento igual no painel." });
      continue;
    }

    const { error } = await supabase.from("agendamentos").insert({
      cliente_id: cliente.id,
      servico_id: l.servicoId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      status,
      observacoes: l.observacoes === "" ? null : l.observacoes,
    });

    if (error) {
      if (error.code === "23P01") {
        ignorados.push({ rotulo, motivo: "Horário já ocupado por outro agendamento." });
      } else if (error.code === "23503") {
        ignorados.push({ rotulo, motivo: "Serviço não encontrado." });
      } else {
        console.error("Erro ao importar agendamento:", error.code);
        ignorados.push({ rotulo, motivo: "Não foi possível salvar." });
      }
      continue;
    }

    cliente.agendamentos += 1;
    importados += 1;
  }

  // 5) Clientes criados agora que ficaram sem nenhum agendamento são removidos
  const semUso = [...clientes.values()].filter((c) => c.nova && c.agendamentos === 0);
  if (semUso.length > 0) {
    await supabase
      .from("clientes")
      .delete()
      .in(
        "id",
        semUso.map((c) => c.id)
      );
  }
  const clientesNovos = [...clientes.values()].filter(
    (c) => c.nova && c.agendamentos > 0
  ).length;

  revalidatePath("/painel/agenda");
  revalidatePath("/painel/clientes");
  return { erro: null, concluido: true, importados, clientesNovos, ignorados };
}
