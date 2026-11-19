import Link from "next/link";
import { criarClienteServidor } from "../../../lib/supabase/server";

export default async function PaginaClientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  // Deixa só letras, números, espaço e . - @ (evita caracteres que alterariam a busca)
  const busca = (q ?? "")
    .replace(/[^\p{L}\p{N}\s.\-@]/gu, "")
    .trim()
    .slice(0, 60);

  const supabase = await criarClienteServidor();
  let consulta = supabase
    .from("clientes")
    .select("id, nome, telefone, consentimento_lgpd")
    .order("nome", { ascending: true })
    .limit(100);

  if (busca !== "") {
    consulta = consulta.or(`nome.ilike.%${busca}%,telefone.ilike.%${busca}%`);
  }

  const { data: clientes, error } = await consulta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Clientes</h1>
          <p className="text-[#4b5f54]">
            Cadastro com o mínimo necessário para o atendimento.
          </p>
        </div>
        <Link
          href="/painel/clientes/novo"
          className="inline-flex min-h-12 items-center rounded-full bg-[#14683a] px-6 font-bold text-white hover:bg-[#0d4a28]"
        >
          Novo cliente
        </Link>
      </div>

      <form method="get" className="flex max-w-xl flex-wrap gap-3">
        <label className="sr-only" htmlFor="busca">
          Buscar cliente
        </label>
        <input
          id="busca"
          type="search"
          name="q"
          defaultValue={busca}
          placeholder="Buscar por nome ou telefone"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#b7cdbe] bg-white px-4 text-base"
        />
        <button
          type="submit"
          className="min-h-12 rounded-full border border-[#14683a] px-6 font-bold text-[#14683a] hover:bg-[#e1f3e8]"
        >
          Buscar
        </button>
        {busca !== "" && (
          <Link
            href="/painel/clientes"
            className="inline-flex min-h-12 items-center px-3 text-sm font-semibold text-[#14683a] underline"
          >
            Limpar
          </Link>
        )}
      </form>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#e59a9a] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1f1f]"
        >
          Não foi possível carregar os clientes.
        </p>
      )}

      {clientes && clientes.length === 0 && (
        <p className="rounded-2xl border border-[#d6e7dc] bg-white p-6 text-[#3d5246]">
          {busca !== ""
            ? "Nenhum cliente encontrado para essa busca."
            : "Nenhum cliente cadastrado ainda. Clique em Novo cliente."}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {clientes?.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d6e7dc] bg-white p-5"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <strong className="text-base">{c.nome}</strong>
              <span className="text-sm text-[#4b5f54]">
                {c.telefone ?? "Sem telefone"}
              </span>
              {!c.consentimento_lgpd && (
                <span className="self-start rounded-full bg-[#fff4d6] px-2.5 py-0.5 text-xs font-bold text-[#6b4300]">
                  Sem consentimento registrado
                </span>
              )}
            </div>
            <Link
              href={`/painel/clientes/${c.id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[#14683a] px-5 text-sm font-bold text-[#14683a] hover:bg-[#e1f3e8]"
            >
              Editar
            </Link>
          </li>
        ))}
      </ul>

      {clientes && clientes.length === 100 && (
        <p className="text-sm text-[#4b5f54]">
          Mostrando os 100 primeiros. Use a busca para achar os demais.
        </p>
      )}
    </div>
  );
}
