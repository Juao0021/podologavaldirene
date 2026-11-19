import { notFound } from "next/navigation";
import { criarClienteServidor } from "../../../../lib/supabase/server";
import { formatarData } from "../../../../lib/formatar";
import FormularioCliente from "../formulario-cliente";

const formatoUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaginaEditarCliente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!formatoUuid.test(id)) {
    notFound();
  }

  const supabase = await criarClienteServidor();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, telefone, observacoes, consentimento_lgpd, consentimento_em")
    .eq("id", id)
    .maybeSingle();

  if (!cliente) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Editar cliente</h1>
      <FormularioCliente
        cliente={{
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone ?? "",
          observacoes: cliente.observacoes ?? "",
          consentimento: cliente.consentimento_lgpd,
          consentimentoEm: cliente.consentimento_em
            ? formatarData(cliente.consentimento_em)
            : null,
        }}
      />
    </div>
  );
}
