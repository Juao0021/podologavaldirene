import { criarClienteServidor } from "../../lib/supabase/server";

export default async function PaginaInicialPainel() {
  const supabase = await criarClienteServidor();

  // Só contamos as linhas (não baixamos dados de clientes).
  const [clientes, servicos, agendamentos] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("servicos").select("*", { count: "exact", head: true }),
    supabase
      .from("agendamentos")
      .select("*", { count: "exact", head: true })
      .neq("status", "cancelado"),
  ]);

  const deuErro = Boolean(clientes.error || servicos.error || agendamentos.error);

  const hoje = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const cartoes = [
    { titulo: "Clientes cadastrados", valor: clientes.count ?? 0 },
    { titulo: "Serviços cadastrados", valor: servicos.count ?? 0 },
    { titulo: "Agendamentos ativos", valor: agendamentos.count ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Bem-vinda</h1>
        <p className="text-[#4b5f54]">{hoje}</p>
      </div>

      {deuErro && (
        <p
          role="alert"
          className="rounded-xl border border-[#e59a9a] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1f1f]"
        >
          Não foi possível ler os dados do banco. Confira se as tabelas foram
          criadas e se o e-mail está cadastrado em proprietarios.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {cartoes.map((c) => (
          <div
            key={c.titulo}
            className="flex flex-col gap-1 rounded-2xl border border-[#d6e7dc] bg-white p-5"
          >
            <span className="text-sm text-[#4b5f54]">{c.titulo}</span>
            <strong className="text-3xl">{c.valor}</strong>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#d6e7dc] bg-white p-6">
        <h2 className="mb-2 text-lg font-bold">Próximas telas</h2>
        <p className="text-[15px] leading-relaxed text-[#3d5246]">
          Agenda, clientes, serviços e financeiro serão adicionados nas
          próximas etapas.
        </p>
      </div>
    </div>
  );
}
