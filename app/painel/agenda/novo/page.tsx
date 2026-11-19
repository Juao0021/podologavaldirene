import { criarClienteServidor } from "../../../../lib/supabase/server";
import { dataValida, hojeSP } from "../../../../lib/datas";
import FormularioAgendamento from "../formulario-agendamento";

export default async function PaginaNovoAgendamento({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  const dataInicial = data && dataValida(data) ? data : hojeSP();

  const supabase = await criarClienteServidor();
  const [clientes, servicos] = await Promise.all([
    supabase.from("clientes").select("id, nome").order("nome").limit(1000),
    supabase
      .from("servicos")
      .select("id, nome, duracao_min")
      .eq("ativo", true)
      .order("nome"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Novo agendamento
      </h1>
      <FormularioAgendamento
        clientes={(clientes.data ?? []).map((c) => ({ id: c.id, nome: c.nome }))}
        servicos={(servicos.data ?? []).map((s) => ({
          id: s.id,
          nome: s.nome,
          duracao: s.duracao_min,
        }))}
        dataInicial={dataInicial}
      />
    </div>
  );
}
