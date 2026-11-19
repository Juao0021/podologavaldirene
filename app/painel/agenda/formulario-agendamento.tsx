"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { salvarAgendamento } from "./actions";
import { STATUS, STATUS_VALIDOS } from "../../../lib/status";

type OpcaoCliente = { id: string; nome: string };
type OpcaoServico = { id: string; nome: string; duracao: number };

type AgendamentoParaEditar = {
  id: string;
  clienteId: string;
  servicoId: string;
  data: string; // 2026-10-31
  hora: string; // 14:30
  duracao: number;
  status: string;
  observacoes: string;
};

const classeCampo =
  "min-h-12 rounded-xl border border-[#b7cdbe] bg-white px-4 text-base font-normal text-[#12261b]";

export default function FormularioAgendamento({
  clientes,
  servicos,
  dataInicial,
  agendamento,
}: {
  clientes: OpcaoCliente[];
  servicos: OpcaoServico[];
  dataInicial: string;
  agendamento?: AgendamentoParaEditar;
}) {
  const [estado, acao, pendente] = useActionState(salvarAgendamento, {
    erro: null as string | null,
  });

  const [servicoId, setServicoId] = useState(agendamento?.servicoId ?? "");
  const [duracao, setDuracao] = useState(
    agendamento ? String(agendamento.duracao) : ""
  );

  // Ao escolher o serviço, preenche a duração padrão dele (pode ser alterada)
  function aoMudarServico(id: string) {
    setServicoId(id);
    const escolhido = servicos.find((s) => s.id === id);
    if (escolhido) setDuracao(String(escolhido.duracao));
  }

  return (
    <form
      action={acao}
      className="flex max-w-xl flex-col gap-5 rounded-2xl border border-[#d6e7dc] bg-white p-6"
    >
      <input type="hidden" name="id" defaultValue={agendamento?.id ?? ""} />

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Cliente
        <select
          name="clienteId"
          required
          defaultValue={agendamento?.clienteId ?? ""}
          className={classeCampo}
        >
          <option value="" disabled>
            Escolha a cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {clientes.length === 0 && (
          <span className="text-xs font-normal text-[#8a1f1f]">
            Nenhuma cliente cadastrada. Cadastre uma em Clientes primeiro.
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Serviço
        <select
          name="servicoId"
          required
          value={servicoId}
          onChange={(e) => aoMudarServico(e.target.value)}
          className={classeCampo}
        >
          <option value="" disabled>
            Escolha o serviço
          </option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Data
          <input
            type="date"
            name="data"
            required
            defaultValue={agendamento?.data ?? dataInicial}
            className={classeCampo}
          />
        </label>
        <label className="flex min-w-32 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Horário de início
          <input
            type="time"
            name="hora"
            required
            step={300}
            defaultValue={agendamento?.hora ?? ""}
            className={classeCampo}
          />
        </label>
        <label className="flex min-w-32 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Duração (min)
          <input
            type="text"
            name="duracao"
            required
            inputMode="numeric"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            className={classeCampo}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Status
        <select
          name="status"
          defaultValue={agendamento?.status ?? "confirmado"}
          className={classeCampo}
        >
          {STATUS_VALIDOS.map((s) => (
            <option key={s} value={s}>
              {STATUS[s].rotulo}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Observações (opcional)
        <textarea
          name="observacoes"
          rows={3}
          maxLength={1000}
          defaultValue={agendamento?.observacoes ?? ""}
          className="rounded-xl border border-[#b7cdbe] bg-white px-4 py-3 text-base font-normal text-[#12261b]"
        />
      </label>

      <label className="flex items-start gap-3 rounded-xl bg-[#f6faf7] p-4 text-sm leading-relaxed">
        <input type="checkbox" name="foraHorario" className="mt-0.5 h-5 w-5 flex-none" />
        <span>
          Permitir fora do horário de atendimento (segunda a sexta, das 14h às
          20h). Use só em exceções.
        </span>
      </label>

      {estado.erro && (
        <p
          role="alert"
          className="rounded-xl border border-[#e59a9a] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1f1f]"
        >
          {estado.erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pendente}
          className="min-h-12 rounded-full bg-[#14683a] px-8 text-base font-bold text-white hover:bg-[#0d4a28] disabled:opacity-60"
        >
          {pendente ? "Salvando..." : "Salvar"}
        </button>
        <Link
          href="/painel/agenda"
          className="inline-flex min-h-12 items-center rounded-full border border-[#b7cdbe] px-6 text-base font-bold text-[#12261b] hover:bg-[#f6faf7]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
