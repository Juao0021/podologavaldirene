import { notFound } from "next/navigation";
import { criarClienteServidor } from "../../../../../lib/supabase/server";
import { dataSP } from "../../../../../lib/datas";
import { centavosParaCampo } from "../../../../../lib/formatar";
import { carregarAtendimentos } from "../../atendimentos";
import { excluirPagamento } from "../../actions";
import BotaoExcluir from "../../botao-excluir";
import FormularioPagamento from "../../formulario-pagamento";

const formatoUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaginaEditarPagamento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!formatoUuid.test(id)) {
    notFound();
  }

  const supabase = await criarClienteServidor();
  const { data: pag } = await supabase
    .from("pagamentos")
    .select("id, agendamento_id, valor_centavos, forma, pago_em, observacao")
    .eq("id", id)
    .maybeSingle();

  if (!pag) {
    notFound();
  }

  const atendimentos = await carregarAtendimentos(supabase, pag.agendamento_id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Editar pagamento</h1>
      <FormularioPagamento
        atendimentos={atendimentos}
        dataInicial={dataSP(pag.pago_em)}
        pagamento={{
          id: pag.id,
          agendamentoId: pag.agendamento_id ?? "",
          valor: centavosParaCampo(pag.valor_centavos),
          forma: pag.forma,
          data: dataSP(pag.pago_em),
          observacao: pag.observacao ?? "",
        }}
      />
      <BotaoExcluir
        acao={excluirPagamento}
        id={pag.id}
        pergunta="Excluir este pagamento? Isso não pode ser desfeito."
      />
    </div>
  );
}
