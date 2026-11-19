"use client";

import { useActionState } from "react";
import Link from "next/link";
import { salvarCliente } from "./actions";

type ClienteParaEditar = {
  id: string;
  nome: string;
  telefone: string;
  observacoes: string;
  consentimento: boolean;
  consentimentoEm: string | null; // já formatada, ex.: 31/10/2026
};

const classeCampo =
  "min-h-12 rounded-xl border border-[#b7cdbe] bg-white px-4 text-base font-normal text-[#12261b]";

export default function FormularioCliente({
  cliente,
}: {
  cliente?: ClienteParaEditar;
}) {
  const [estado, acao, pendente] = useActionState(salvarCliente, {
    erro: null as string | null,
  });

  return (
    <form
      action={acao}
      className="flex max-w-xl flex-col gap-5 rounded-2xl border border-[#d6e7dc] bg-white p-6"
    >
      <input type="hidden" name="id" defaultValue={cliente?.id ?? ""} />

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Nome
        <input
          type="text"
          name="nome"
          required
          maxLength={120}
          autoComplete="off"
          defaultValue={cliente?.nome ?? ""}
          className={classeCampo}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Telefone / WhatsApp (opcional)
        <input
          type="text"
          name="telefone"
          inputMode="tel"
          autoComplete="off"
          placeholder="(47) 98829-6502"
          defaultValue={cliente?.telefone ?? ""}
          className={classeCampo}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Observações de atendimento (opcional)
        <textarea
          name="observacoes"
          rows={5}
          maxLength={2000}
          defaultValue={cliente?.observacoes ?? ""}
          className="rounded-xl border border-[#b7cdbe] bg-white px-4 py-3 text-base font-normal text-[#12261b]"
        />
        <span className="text-xs font-normal text-[#4b5f54]">
          Visível só para você. Anote apenas o necessário para o atendimento.
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-xl bg-[#f6faf7] p-4 text-sm leading-relaxed">
        <input
          type="checkbox"
          name="consentimento"
          defaultChecked={cliente?.consentimento ?? false}
          className="mt-0.5 h-5 w-5 flex-none"
        />
        <span>
          <strong>Consentimento (LGPD).</strong> A cliente autorizou o uso dos
          seus dados para agendamento, atendimento e contato.
          {cliente?.consentimento && cliente.consentimentoEm && (
            <span className="block text-xs text-[#4b5f54]">
              Registrado em {cliente.consentimentoEm}.
            </span>
          )}
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
          href="/painel/clientes"
          className="inline-flex min-h-12 items-center rounded-full border border-[#b7cdbe] px-6 text-base font-bold text-[#12261b] hover:bg-[#f6faf7]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
