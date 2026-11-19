import { notFound } from "next/navigation";
import { criarClienteServidor } from "../../../../lib/supabase/server";
import { centavosParaCampo } from "../../../../lib/formatar";
import FormularioServico from "../formulario-servico";

const formatoUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaginaEditarServico({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!formatoUuid.test(id)) {
    notFound();
  }

  const supabase = await criarClienteServidor();
  const { data: servico } = await supabase
    .from("servicos")
    .select("id, nome, descricao, preco_centavos, duracao_min, ativo")
    .eq("id", id)
    .maybeSingle();

  if (!servico) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Editar serviço</h1>
      <FormularioServico
        servico={{
          id: servico.id,
          nome: servico.nome,
          descricao: servico.descricao ?? "",
          preco: centavosParaCampo(servico.preco_centavos),
          duracao: servico.duracao_min,
          ativo: servico.ativo,
        }}
      />
    </div>
  );
}
