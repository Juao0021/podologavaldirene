import { criarClienteServidor } from "../../../../../lib/supabase/server";
import { dataValida, hojeSP } from "../../../../../lib/datas";
import { carregarAtendimentos } from "../../atendimentos";
import FormularioPagamento from "../../formulario-pagamento";

export default async function PaginaNovoPagamento({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  const dataInicial = data && dataValida(data) ? data : hojeSP();

  const supabase = await criarClienteServidor();
  const atendimentos = await carregarAtendimentos(supabase);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Novo pagamento</h1>
      <FormularioPagamento atendimentos={atendimentos} dataInicial={dataInicial} />
    </div>
  );
}
