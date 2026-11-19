"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { salvarPagamento } from "./actions";
import { FORMAS, FORMAS_VALIDAS } from "../../../lib/financeiro";

type OpcaoAtendimento = { id: string; rotulo: string; precoCampo: string };

type PagamentoParaEditar = {
  id: string;
  agendamentoId: string;
  valor: string; // "120,00"
  forma: string;
  data: string; // 2026-11-02
  observacao: string;
};

const classeCampo =
  "min-h-12 rounded-xl border border-[#b7cdbe] bg-white px-4 text-base font-normal text-[#12261b]";

export default function FormularioPagamento({
  atendimentos,
  dataInicial,
  pagamento,
}: {
  atendimentos: OpcaoAtendimento[];
  dataInicial: string;
  pagamento?: PagamentoParaEditar;
}) {
  const [estado, acao, pendente] = useActionState(salvarPagamento, {
    erro: null as string | null,
  });
  const [valor, setValor] = useState(pagamento?.valor ?? "");

  // Ao escolher o atendimento, sugere o preço do serviço (pode ser alterado)
  function aoEscolherAtendimento(id: string) {
    const escolhido = atendimentos.find((a) => a.id === id);
    if (escolhido) setValor(escolhido.precoCampo);
  }

  return (
    <form
      action={acao}
      className="flex max-w-xl flex-col gap-5 rounded-2xl border border-[#d6e7dc] bg-white p-6"
    >
      <input type="hidden" name="id" defaultValue={pagamento?.id ?? ""} />

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Atendimento (opcional)
        <select
          name="agendamentoId"
          defaultValue={pagamento?.agendamentoId ?? ""}
          onChange={(e) => aoEscolherAtendimento(e.target.value)}
          className={classeCampo}
        >
          <option value="">Sem atendimento ligado</option>
          {atendimentos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.rotulo}
            </option>
          ))}
        </select>
        <span className="text-xs font-normal text-[#4b5f54]">
          Ao escolher, o valor é preenchido com o preço do serviço. Você pode
          alterar.
        </span>
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Valor recebido (R$)
          <input
            type="text"
            name="valor"
            required
            inputMode="decimal"
            placeholder="120,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className={classeCampo}
          />
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Data do pagamento
          <input
            type="date"
            name="data"
            required
            defaultValue={pagamento?.data ?? dataInicial}
            className={classeCampo}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Forma de pagamento
        <select
          name="forma"
          required
          defaultValue={pagamento?.forma ?? "pix"}
          className={classeCampo}
        >
          {FORMAS_VALIDAS.map((f) => (
            <option key={f} value={f}>
              {FORMAS[f]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Observação (opcional)
        <textarea
          name="observacao"
          rows={2}
          maxLength={500}
          defaultValue={pagamento?.observacao ?? ""}
          className="rounded-xl border border-[#b7cdbe] bg-white px-4 py-3 text-base font-normal text-[#12261b]"
        />
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
          href="/painel/financeiro"
          className="inline-flex min-h-12 items-center rounded-full border border-[#b7cdbe] px-6 text-base font-bold text-[#12261b] hover:bg-[#f6faf7]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
