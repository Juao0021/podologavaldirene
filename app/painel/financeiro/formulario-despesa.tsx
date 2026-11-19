"use client";

import { useActionState } from "react";
import Link from "next/link";
import { salvarDespesa } from "./actions";
import { CATEGORIAS_SUGERIDAS } from "../../../lib/financeiro";

type DespesaParaEditar = {
  id: string;
  descricao: string;
  categoria: string;
  valor: string; // "185,00"
  data: string; // 2026-11-02
};

const classeCampo =
  "min-h-12 rounded-xl border border-[#b7cdbe] bg-white px-4 text-base font-normal text-[#12261b]";

export default function FormularioDespesa({
  dataInicial,
  despesa,
}: {
  dataInicial: string;
  despesa?: DespesaParaEditar;
}) {
  const [estado, acao, pendente] = useActionState(salvarDespesa, {
    erro: null as string | null,
  });

  return (
    <form
      action={acao}
      className="flex max-w-xl flex-col gap-5 rounded-2xl border border-[#d6e7dc] bg-white p-6"
    >
      <input type="hidden" name="id" defaultValue={despesa?.id ?? ""} />

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Descrição
        <input
          type="text"
          name="descricao"
          required
          maxLength={200}
          autoComplete="off"
          defaultValue={despesa?.descricao ?? ""}
          className={classeCampo}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Categoria (opcional)
        <input
          type="text"
          name="categoria"
          list="categorias"
          maxLength={60}
          autoComplete="off"
          defaultValue={despesa?.categoria ?? ""}
          className={classeCampo}
        />
        <datalist id="categorias">
          {CATEGORIAS_SUGERIDAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Valor (R$)
          <input
            type="text"
            name="valor"
            required
            inputMode="decimal"
            placeholder="185,00"
            defaultValue={despesa?.valor ?? ""}
            className={classeCampo}
          />
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Data
          <input
            type="date"
            name="data"
            required
            defaultValue={despesa?.data ?? dataInicial}
            className={classeCampo}
          />
        </label>
      </div>

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
