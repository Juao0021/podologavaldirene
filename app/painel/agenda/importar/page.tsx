import Link from "next/link";
import { criarClienteServidor } from "../../../../lib/supabase/server";
import Importador from "./importador";

export default async function PaginaImportarAgenda() {
  const supabase = await criarClienteServidor();
  const [servicos, clientes] = await Promise.all([
    supabase
      .from("servicos")
      .select("id, nome, duracao_min, preco_centavos")
      .eq("ativo", true)
      .order("nome"),
    supabase.from("clientes").select("nome").limit(5000),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/painel/agenda"
          className="text-sm font-bold text-[#14683a] hover:underline"
        >
          ← Voltar para a agenda
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Importar do Google Agenda
        </h1>
        <p className="max-w-2xl text-base text-[#3d5246]">
          Importa só os compromissos <strong>de hoje em diante</strong>. Você
          confere tudo numa prévia antes de gravar.
        </p>
      </div>

      <ol className="flex max-w-2xl list-decimal flex-col gap-1 pl-6 text-base text-[#3d5246]">
        <li>
          No computador, abra <strong>calendar.google.com</strong> com a conta
          dela.
        </li>
        <li>
          Clique na engrenagem, depois em <strong>Configurações</strong>,{" "}
          <strong>Importar e exportar</strong> e <strong>Exportar</strong>.
        </li>
        <li>
          Abra o arquivo <strong>.zip</strong> baixado e escolha o arquivo{" "}
          <strong>.ics</strong> da agenda principal.
        </li>
        <li>Selecione esse arquivo abaixo.</li>
      </ol>

      <Importador
        servicos={(servicos.data ?? []).map((s) => ({
          id: s.id,
          nome: s.nome,
          duracao: s.duracao_min,
          preco: s.preco_centavos,
        }))}
        nomesClientes={(clientes.data ?? []).map((c) => c.nome)}
      />
    </div>
  );
}
