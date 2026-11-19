import Link from "next/link";
import { criarClienteServidor } from "../../../lib/supabase/server";
import {
  dataCurta,
  dataSP,
  formatarMesAno,
  hojeSP,
  inicioDoDiaISO,
  somarMeses,
} from "../../../lib/datas";
import { formatarReais } from "../../../lib/formatar";
import { mesValido, primeiroDe, rotuloForma } from "../../../lib/financeiro";
import BotaoImprimir from "./botao-imprimir";

type Nome = { nome: string };
type LinhaPagamento = {
  id: string;
  valor_centavos: number;
  forma: string;
  pago_em: string;
  observacao: string | null;
  agendamentos:
    | { clientes: Nome | Nome[] | null; servicos: Nome | Nome[] | null }
    | { clientes: Nome | Nome[] | null; servicos: Nome | Nome[] | null }[]
    | null;
};
type LinhaDespesa = {
  id: string;
  descricao: string;
  categoria: string | null;
  valor_centavos: number;
  data: string;
};

const LIMITE = 1000;

function somarPor<T>(
  itens: T[],
  chave: (i: T) => string,
  valor: (i: T) => number
): [string, number][] {
  const mapa = new Map<string, number>();
  for (const i of itens) {
    mapa.set(chave(i), (mapa.get(chave(i)) ?? 0) + valor(i));
  }
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function PaginaFinanceiro({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const mesAtual = hojeSP().slice(0, 7);
  const mesEscolhido = mes && mesValido(mes) ? mes : mesAtual;
  const primeiro = `${mesEscolhido}-01`;
  const proximoPrimeiro = somarMeses(primeiro, 1);
  const mesAnterior = somarMeses(primeiro, -1).slice(0, 7);
  const mesSeguinte = proximoPrimeiro.slice(0, 7);

  const supabase = await criarClienteServidor();
  const [pagamentosResp, despesasResp] = await Promise.all([
    supabase
      .from("pagamentos")
      .select(
        "id, valor_centavos, forma, pago_em, observacao, agendamentos(clientes(nome), servicos(nome))"
      )
      .gte("pago_em", inicioDoDiaISO(primeiro))
      .lt("pago_em", inicioDoDiaISO(proximoPrimeiro))
      .order("pago_em", { ascending: false })
      .limit(LIMITE),
    supabase
      .from("despesas")
      .select("id, descricao, categoria, valor_centavos, data")
      .gte("data", primeiro)
      .lt("data", proximoPrimeiro)
      .order("data", { ascending: false })
      .limit(LIMITE),
  ]);

  const pagamentos = (pagamentosResp.data ?? []) as LinhaPagamento[];
  const despesas = (despesasResp.data ?? []) as LinhaDespesa[];
  const deuErro = Boolean(pagamentosResp.error || despesasResp.error);
  const truncou = pagamentos.length >= LIMITE || despesas.length >= LIMITE;

  const faturamento = pagamentos.reduce((s, p) => s + p.valor_centavos, 0);
  const totalDespesas = despesas.reduce((s, d) => s + d.valor_centavos, 0);
  const resultado = faturamento - totalDespesas;

  const porForma = somarPor(
    pagamentos,
    (p) => rotuloForma(p.forma),
    (p) => p.valor_centavos
  );
  const porCategoria = somarPor(
    despesas,
    (d) => d.categoria ?? "Sem categoria",
    (d) => d.valor_centavos
  );

  const ligacaoMes = (m: string) => `/painel/financeiro?mes=${m}`;
  const botaoNav =
    "inline-flex min-h-11 items-center rounded-full border border-[#b7cdbe] bg-white px-4 text-sm font-bold hover:bg-[#e1f3e8]";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Financeiro</h1>
          <p className="text-lg font-semibold capitalize text-[#3d5246]">
            {formatarMesAno(primeiro)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 print:hidden">
          <Link
            href={`/painel/financeiro/despesa/novo?data=${mesEscolhido === mesAtual ? hojeSP() : primeiro}`}
            className="inline-flex min-h-12 items-center rounded-full border border-[#14683a] px-6 font-bold text-[#14683a] hover:bg-[#e1f3e8]"
          >
            Nova despesa
          </Link>
          <Link
            href={`/painel/financeiro/pagamento/novo?data=${mesEscolhido === mesAtual ? hojeSP() : primeiro}`}
            className="inline-flex min-h-12 items-center rounded-full bg-[#14683a] px-6 font-bold text-white hover:bg-[#0d4a28]"
          >
            Novo pagamento
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap gap-2">
          <Link href={ligacaoMes(mesAnterior)} className={botaoNav}>
            ← Mês anterior
          </Link>
          <Link href={ligacaoMes(mesAtual)} className={botaoNav}>
            Este mês
          </Link>
          <Link href={ligacaoMes(mesSeguinte)} className={botaoNav}>
            Próximo mês →
          </Link>
        </div>
        <BotaoImprimir />
      </div>

      {deuErro && (
        <p
          role="alert"
          className="rounded-xl border border-[#e59a9a] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1f1f]"
        >
          Não foi possível carregar o financeiro. Tente atualizar a página.
        </p>
      )}
      {truncou && (
        <p
          role="alert"
          className="rounded-xl border border-[#c99200] bg-[#fff4d6] px-4 py-3 text-sm text-[#6b4300]"
        >
          Este mês tem mais de {LIMITE} lançamentos. Os totais abaixo podem
          estar incompletos.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-[#d6e7dc] bg-white p-5">
          <span className="text-sm text-[#4b5f54]">Faturamento</span>
          <strong className="text-3xl">{formatarReais(faturamento)}</strong>
          <span className="text-xs text-[#4b5f54]">
            {pagamentos.length} {pagamentos.length === 1 ? "pagamento" : "pagamentos"}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-[#d6e7dc] bg-white p-5">
          <span className="text-sm text-[#4b5f54]">Despesas</span>
          <strong className="text-3xl">{formatarReais(totalDespesas)}</strong>
          <span className="text-xs text-[#4b5f54]">
            {despesas.length} {despesas.length === 1 ? "despesa" : "despesas"}
          </span>
        </div>
        <div
          className={`flex flex-col gap-1 rounded-2xl border p-5 ${
            resultado >= 0
              ? "border-[#bfe0cc] bg-[#e1f3e8] text-[#0d4a28]"
              : "border-[#e59a9a] bg-[#fde8e8] text-[#8a1f1f]"
          }`}
        >
          <span className="text-sm">Resultado do mês</span>
          <strong className="text-3xl">{formatarReais(resultado)}</strong>
          <span className="text-xs">{resultado >= 0 ? "Sobrou no mês" : "Gastou mais do que recebeu"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-2 rounded-2xl border border-[#d6e7dc] bg-white p-5">
          <h2 className="text-lg font-bold">Recebido por forma de pagamento</h2>
          {porForma.length === 0 ? (
            <p className="text-sm text-[#4b5f54]">Nenhum pagamento no mês.</p>
          ) : (
            porForma.map(([nome, valor]) => (
              <div key={nome} className="flex justify-between gap-3 border-t border-[#eef5f0] py-2 text-sm">
                <span>{nome}</span>
                <strong>{formatarReais(valor)}</strong>
              </div>
            ))
          )}
        </section>
        <section className="flex flex-col gap-2 rounded-2xl border border-[#d6e7dc] bg-white p-5">
          <h2 className="text-lg font-bold">Despesas por categoria</h2>
          {porCategoria.length === 0 ? (
            <p className="text-sm text-[#4b5f54]">Nenhuma despesa no mês.</p>
          ) : (
            porCategoria.map(([nome, valor]) => (
              <div key={nome} className="flex justify-between gap-3 border-t border-[#eef5f0] py-2 text-sm">
                <span>{nome}</span>
                <strong>{formatarReais(valor)}</strong>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Pagamentos recebidos</h2>
        {pagamentos.length === 0 && (
          <p className="rounded-2xl border border-[#d6e7dc] bg-white p-5 text-[#3d5246]">
            Nenhum pagamento registrado neste mês.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {pagamentos.map((p) => {
            const ag = primeiroDe(p.agendamentos);
            const cliente = primeiroDe(ag?.clientes ?? null)?.nome;
            const servico = primeiroDe(ag?.servicos ?? null)?.nome;
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d6e7dc] bg-white p-4"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-bold">
                    {dataCurta(dataSP(p.pago_em))} · {rotuloForma(p.forma)}
                  </span>
                  <span className="text-sm text-[#3d5246]">
                    {cliente ? `${cliente} · ${servico ?? "—"}` : "Sem atendimento ligado"}
                  </span>
                  {p.observacao && (
                    <span className="text-xs text-[#4b5f54]">{p.observacao}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <strong>{formatarReais(p.valor_centavos)}</strong>
                  <Link
                    href={`/painel/financeiro/pagamento/${p.id}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-[#14683a] px-4 text-sm font-bold text-[#14683a] hover:bg-[#e1f3e8] print:hidden"
                  >
                    Editar
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Despesas</h2>
        {despesas.length === 0 && (
          <p className="rounded-2xl border border-[#d6e7dc] bg-white p-5 text-[#3d5246]">
            Nenhuma despesa registrada neste mês.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {despesas.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d6e7dc] bg-white p-4"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-bold">{d.descricao}</span>
                <span className="text-sm text-[#3d5246]">
                  {dataCurta(d.data)} · {d.categoria ?? "Sem categoria"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <strong>{formatarReais(d.valor_centavos)}</strong>
                <Link
                  href={`/painel/financeiro/despesa/${d.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-[#14683a] px-4 text-sm font-bold text-[#14683a] hover:bg-[#e1f3e8] print:hidden"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
