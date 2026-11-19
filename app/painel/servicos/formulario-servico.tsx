"use client";

import { useActionState } from "react";
import Link from "next/link";
import { salvarServico } from "./actions";

type ServicoParaEditar = {
  id: string;
  nome: string;
  descricao: string;
  preco: string; // já no formato "120,00"
  duracao: number;
  ativo: boolean;
};

const classeCampo =
  "min-h-12 rounded-xl border border-[#b7cdbe] bg-white px-4 text-base font-normal text-[#12261b]";

export default function FormularioServico({
  servico,
}: {
  servico?: ServicoParaEditar;
}) {
  const [estado, acao, pendente] = useActionState(salvarServico, {
    erro: null as string | null,
  });

  return (
    <form
      action={acao}
      className="flex max-w-xl flex-col gap-5 rounded-2xl border border-[#d6e7dc] bg-white p-6"
    >
      <input type="hidden" name="id" defaultValue={servico?.id ?? ""} />

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Nome do serviço
        <input
          type="text"
          name="nome"
          required
          maxLength={150}
          defaultValue={servico?.nome ?? ""}
          className={classeCampo}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Observação (opcional)
        <textarea
          name="descricao"
          rows={3}
          maxLength={500}
          defaultValue={servico?.descricao ?? ""}
          className="rounded-xl border border-[#b7cdbe] bg-white px-4 py-3 text-base font-normal text-[#12261b]"
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Preço (R$)
          <input
            type="text"
            name="preco"
            required
            inputMode="decimal"
            placeholder="120,00"
            defaultValue={servico?.preco ?? ""}
            className={classeCampo}
          />
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Duração (minutos)
          <input
            type="text"
            name="duracao"
            required
            inputMode="numeric"
            placeholder="60"
            defaultValue={servico?.duracao ?? ""}
            className={classeCampo}
          />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={servico?.ativo ?? true}
          className="h-5 w-5"
        />
        Serviço ativo (aparece na hora de agendar)
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
          href="/painel/servicos"
          className="inline-flex min-h-12 items-center rounded-full border border-[#b7cdbe] px-6 text-base font-bold text-[#12261b] hover:bg-[#f6faf7]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
