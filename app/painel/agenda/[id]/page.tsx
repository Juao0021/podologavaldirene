import { notFound } from "next/navigation";
import { criarClienteServidor } from "../../../../lib/supabase/server";
import { dataSP, horaSP } from "../../../../lib/datas";
import FormularioAgendamento from "../formulario-agendamento";

const formatoUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaginaEditarAgendamento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!formatoUuid.test(id)) {
    notFound();
  }

  const supabase = await criarClienteServidor();
  const { data: ag } = await supabase
    .from("agendamentos")
    .select("id, cliente_id, servico_id, inicio, fim, status, observacoes")
    .eq("id", id)
    .maybeSingle();

  if (!ag) {
    notFound();
  }

  const [clientes, servicos] = await Promise.all([
    supabase.from("clientes").select("id, nome").order("nome").limit(1000),
    supabase
      .from("servicos")
      .select("id, nome, duracao_min, ativo")
      .order("nome"),
  ]);

  // Mostra os serviços ativos e também o serviço deste agendamento (mesmo inativo)
  const opcoesServicos = (servicos.data ?? [])
    .filter((s) => s.ativo || s.id === ag.servico_id)
    .map((s) => ({
      id: s.id,
      nome: s.ativo ? s.nome : `${s.nome} (inativo)`,
      duracao: s.duracao_min,
    }));

  const duracaoMin = Math.round(
    (new Date(ag.fim).getTime() - new Date(ag.inicio).getTime()) / 60_000
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Editar agendamento
      </h1>
      <FormularioAgendamento
        clientes={(clientes.data ?? []).map((c) => ({ id: c.id, nome: c.nome }))}
        servicos={opcoesServicos}
        dataInicial={dataSP(ag.inicio)}
        agendamento={{
          id: ag.id,
          clienteId: ag.cliente_id,
          servicoId: ag.servico_id,
          data: dataSP(ag.inicio),
          hora: horaSP(ag.inicio),
          duracao: duracaoMin,
          status: ag.status,
          observacoes: ag.observacoes ?? "",
        }}
      />
    </div>
  );
}
