import Link from "next/link";
import { criarClienteServidor } from "../../../lib/supabase/server";
import { formatarDuracao, formatarReais } from "../../../lib/formatar";

export default async function PaginaServicos() {
  const supabase = await criarClienteServidor();

  const { data: servicos, error } = await supabase
    .from("servicos")
    .select("id, nome, descricao, preco_centavos, duracao_min, ativo")
    .order("ativo", { ascending: false })
    .order("nome", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Serviços</h1>
          <p className="text-[#4b5f54]">
            Preços e durações usados na agenda e no financeiro. Estes valores
            não aparecem no site público.
          </p>
        </div>
        <Link
          href="/painel/servicos/novo"
          className="inline-flex min-h-12 items-center rounded-full bg-[#14683a] px-6 font-bold text-white hover:bg-[#0d4a28]"
        >
          Novo serviço
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#e59a9a] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1f1f]"
        >
          Não foi possível carregar os serviços.
        </p>
      )}

      {servicos && servicos.length === 0 && (
        <p className="rounded-2xl border border-[#d6e7dc] bg-white p-6 text-[#3d5246]">
          Nenhum serviço cadastrado ainda. Clique em Novo serviço.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {servicos?.map((s) => (
          <li
            key={s.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d6e7dc] p-5 ${
              s.ativo ? "bg-white" : "bg-[#eef3f0] opacity-75"
            }`}
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-base">{s.nome}</strong>
                {!s.ativo && (
                  <span className="rounded-full bg-[#e8ecef] px-2.5 py-0.5 text-xs font-bold text-[#3b4650]">
                    Inativo
                  </span>
                )}
              </div>
              <span className="text-sm text-[#4b5f54]">
                {formatarReais(s.preco_centavos)} ·{" "}
                {formatarDuracao(s.duracao_min)}
              </span>
              {s.descricao && (
                <span className="text-sm text-[#4b5f54]">{s.descricao}</span>
              )}
            </div>
            <Link
              href={`/painel/servicos/${s.id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[#14683a] px-5 text-sm font-bold text-[#14683a] hover:bg-[#e1f3e8]"
            >
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
