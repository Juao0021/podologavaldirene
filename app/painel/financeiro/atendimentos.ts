import { criarClienteServidor } from "../../../lib/supabase/server";
import { centavosParaCampo } from "../../../lib/formatar";
import { dataCurta, dataSP, horaSP, hojeSP, somarDias } from "../../../lib/datas";
import { primeiroDe } from "../../../lib/financeiro";

type Cliente = Awaited<ReturnType<typeof criarClienteServidor>>;

type Rel = { nome: string; preco_centavos?: number };
type LinhaAtendimento = {
  id: string;
  inicio: string;
  clientes: Rel | Rel[] | null;
  servicos: Rel | Rel[] | null;
};

function paraOpcao(a: LinhaAtendimento) {
  const cliente = primeiroDe(a.clientes)?.nome ?? "—";
  const servico = primeiroDe(a.servicos);
  return {
    id: a.id,
    rotulo: `${dataCurta(dataSP(a.inicio))} ${horaSP(a.inicio)} · ${cliente} · ${servico?.nome ?? "—"}`,
    precoCampo: centavosParaCampo(servico?.preco_centavos ?? 0),
  };
}

// Atendimentos dos últimos 60 dias (não cancelados) para ligar a um pagamento.
// Se já existe um atendimento escolhido (edição), garante que ele está na lista.
export async function carregarAtendimentos(
  supabase: Cliente,
  incluirId?: string | null
) {
  const desde = new Date(`${somarDias(hojeSP(), -60)}T00:00:00-03:00`).toISOString();

  const { data } = await supabase
    .from("agendamentos")
    .select("id, inicio, clientes(nome), servicos(nome, preco_centavos)")
    .neq("status", "cancelado")
    .gte("inicio", desde)
    .order("inicio", { ascending: false })
    .limit(200);

  const lista = ((data ?? []) as LinhaAtendimento[]).map(paraOpcao);

  if (incluirId && !lista.some((o) => o.id === incluirId)) {
    const { data: extra } = await supabase
      .from("agendamentos")
      .select("id, inicio, clientes(nome), servicos(nome, preco_centavos)")
      .eq("id", incluirId)
      .maybeSingle();
    if (extra) lista.push(paraOpcao(extra as LinhaAtendimento));
  }

  return lista;
}
