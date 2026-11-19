import Link from "next/link";
import { criarClienteServidor } from "../../../lib/supabase/server";
import { formatarMesAno } from "../../../lib/datas";
import { formatarReais } from "../../../lib/formatar";
import BotaoImprimir from "../financeiro/botao-imprimir";

type LinhaResumo = {
  mes: string; // 2026-11-01
  faturamento_centavos: number;
  despesas_centavos: number;
};

export default async function PaginaRelatorios() {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("resumo_mensal", { p_meses: 12 });

  const linhas = (data ?? []) as LinhaResumo[];
  const totalFat = linhas.reduce((s, l) => s + Number(l.faturamento_centavos), 0);
  const totalDesp = linhas.reduce((s, l) => s + Number(l.despesas_centavos), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Relatório mensal
          </h1>
          <p className="text-[#4b5f54]">Últimos 12 meses, do mais recente ao mais antigo.</p>
        </div>
        <BotaoImprimir />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#e59a9a] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1f1f]"
        >
          Não foi possível gerar o relatório. Confira se o arquivo
          04-financeiro.sql foi executado no Supabase.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#d6e7dc] bg-white">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d6e7dc] text-xs uppercase tracking-wide text-[#4b5f54]">
              <th className="px-4 py-3">Mês</th>
              <th className="px-4 py-3 text-right">Faturamento</th>
              <th className="px-4 py-3 text-right">Despesas</th>
              <th className="px-4 py-3 text-right">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const fat = Number(l.faturamento_centavos);
              const desp = Number(l.despesas_centavos);
              const res = fat - desp;
              return (
                <tr key={l.mes} className="border-b border-[#eef5f0]">
                  <td className="px-4 py-3 font-semibold capitalize">
                    <Link
                      href={`/painel/financeiro?mes=${l.mes.slice(0, 7)}`}
                      className="text-[#14683a] underline"
                    >
                      {formatarMesAno(l.mes)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">{formatarReais(fat)}</td>
                  <td className="px-4 py-3 text-right">{formatarReais(desp)}</td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
                      res < 0 ? "text-[#8a1f1f]" : "text-[#0d4a28]"
                    }`}
                  >
                    {formatarReais(res)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {linhas.length > 0 && (
            <tfoot>
              <tr className="font-extrabold">
                <td className="px-4 py-3">Total de {linhas.length} meses</td>
                <td className="px-4 py-3 text-right">{formatarReais(totalFat)}</td>
                <td className="px-4 py-3 text-right">{formatarReais(totalDesp)}</td>
                <td className="px-4 py-3 text-right">
                  {formatarReais(totalFat - totalDesp)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
