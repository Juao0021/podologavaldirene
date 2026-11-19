import { notFound } from "next/navigation";
import { criarClienteServidor } from "../../../../../lib/supabase/server";
import { centavosParaCampo } from "../../../../../lib/formatar";
import { excluirDespesa } from "../../actions";
import BotaoExcluir from "../../botao-excluir";
import FormularioDespesa from "../../formulario-despesa";

const formatoUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaginaEditarDespesa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!formatoUuid.test(id)) {
    notFound();
  }

  const supabase = await criarClienteServidor();
  const { data: d } = await supabase
    .from("despesas")
    .select("id, descricao, categoria, valor_centavos, data")
    .eq("id", id)
    .maybeSingle();

  if (!d) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Editar despesa</h1>
      <FormularioDespesa
        dataInicial={d.data}
        despesa={{
          id: d.id,
          descricao: d.descricao,
          categoria: d.categoria ?? "",
          valor: centavosParaCampo(d.valor_centavos),
          data: d.data,
        }}
      />
      <BotaoExcluir
        acao={excluirDespesa}
        id={d.id}
        pergunta="Excluir esta despesa? Isso não pode ser desfeito."
      />
    </div>
  );
}
