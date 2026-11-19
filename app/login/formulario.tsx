"use client";

import { useActionState } from "react";
import { entrar } from "./actions";

export default function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(entrar, {
    erro: null as string | null,
  });

  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          className="min-h-12 rounded-xl border border-[#b7cdbe] bg-white px-4 text-base font-normal text-[#12261b]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Senha
        <input
          type="password"
          name="senha"
          required
          autoComplete="current-password"
          className="min-h-12 rounded-xl border border-[#b7cdbe] bg-white px-4 text-base font-normal text-[#12261b]"
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

      <button
        type="submit"
        disabled={pendente}
        className="min-h-12 rounded-full bg-[#14683a] px-6 text-base font-bold text-white hover:bg-[#0d4a28] disabled:opacity-60"
      >
        {pendente ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
