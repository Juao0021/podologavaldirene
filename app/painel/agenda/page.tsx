import Link from "next/link";
import { criarClienteServidor } from "../../../lib/supabase/server";
import {
  dataCurta,
  dataSP,
  dataValida,
  diaDaSemana,
  diasNoMes,
  formatarDataLonga,
  formatarDiaCurto,
  formatarMesAno,
  horaSP,
  hojeSP,
  inicioDaSemana,
  inicioDoDiaISO,
  primeiroDiaDoMes,
  somarDias,
  somarMeses,
} from "../../../lib/datas";
import { STATUS, statusConhecido } from "../../../lib/status";

type Vista = "dia" | "semana" | "mes";

type Linha = {
  id: string;
  inicio: string;
  fim: string;
  status: string;
  observacoes: string | null;
  clientes: { nome: string } | { nome: string }[] | null;
  servicos: { nome: string } | { nome: string }[] | null;
};

// O Supabase devolve a relação como objeto (ou lista, dependendo do caso)
function nomeDe(x: { nome: string } | { nome: string }[] | null): string {
  if (!x) return "—";
  return Array.isArray(x) ? (x[0]?.nome ?? "—") : x.nome;
}

function ligacao(vista: Vista, data: string): string {
  return `/painel/agenda?vista=${vista}&data=${data}`;
}

function CartaoAgendamento({ a }: { a: Linha }) {
  const status = statusConhecido(a.status);
  const info = STATUS[status];
  const cancelado = status === "cancelado";

  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d6e7dc] border-l-4 p-4 ${info.cartao}`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-bold">
          {horaSP(a.inicio)} – {horaSP(a.fim)}
        </span>
        <span className={`text-base font-semibold ${cancelado ? "line-through" : ""}`}>
          {nomeDe(a.clientes)}
        </span>
        <span className="text-sm text-[#4b5f54]">{nomeDe(a.servicos)}</span>
        {a.observacoes && (
          <span className="text-sm text-[#4b5f54]">{a.observacoes}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${info.selo}`}>
          {info.rotulo}
        </span>
        <Link
          href={`/painel/agenda/${a.id}`}
          className="inline-flex min-h-11 items-center rounded-full border border-[#14683a] px-4 text-sm font-bold text-[#14683a] hover:bg-[#e1f3e8]"
        >
          Editar
        </Link>
      </div>
    </li>
  );
}

export default async function PaginaAgenda({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; data?: string }>;
}) {
  const params = await searchParams;
  const vista: Vista =
    params.vista === "semana" || params.vista === "mes" ? params.vista : "dia";
  const hoje = hojeSP();
  const data = params.data && dataValida(params.data) ? params.data : hoje;

  // Intervalo de dias a consultar: [de, ate) — o "ate" não entra
  let de: string;
  let ate: string;
  let anterior: string;
  let proximo: string;
  let titulo: string;

  if (vista === "dia") {
    de = data;
    ate = somarDias(data, 1);
    anterior = somarDias(data, -1);
    proximo = somarDias(data, 1);
    titulo = formatarDataLonga(data);
  } else if (vista === "semana") {
    de = inicioDaSemana(data);
    ate = somarDias(de, 7);
    anterior = somarDias(data, -7);
    proximo = somarDias(data, 7);
    titulo = `Semana de ${dataCurta(de)} a ${dataCurta(somarDias(de, 6))}`;
  } else {
    de = primeiroDiaDoMes(data);
    ate = primeiroDiaDoMes(somarMeses(de, 1));
    anterior = somarMeses(de, -1);
    proximo = somarMeses(de, 1);
    titulo = formatarMesAno(data);
  }

  const supabase = await criarClienteServidor();
  const { data: linhas, error } = await supabase
    .from("agendamentos")
    .select("id, inicio, fim, status, observacoes, clientes(nome), servicos(nome)")
    .gte("inicio", inicioDoDiaISO(de))
    .lt("inicio", inicioDoDiaISO(ate))
    .order("inicio", { ascending: true })
    .limit(1000);

  const agendamentos = (linhas ?? []) as Linha[];

  // Agrupa por dia (no horário de São Paulo)
  const porDia = new Map<string, Linha[]>();
  for (const a of agendamentos) {
    const dia = dataSP(a.inicio);
    porDia.set(dia, [...(porDia.get(dia) ?? []), a]);
  }

  const abas: { vista: Vista; rotulo: string }[] = [
    { vista: "dia", rotulo: "Dia" },
    { vista: "semana", rotulo: "Semana" },
    { vista: "mes", rotulo: "Mês" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Agenda</h1>
          <p className="text-lg font-semibold capitalize text-[#3d5246]">
            {titulo}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/painel/agenda/importar"
            className="inline-flex min-h-12 items-center rounded-full border border-[#14683a] px-6 font-bold text-[#14683a] hover:bg-[#e1f3e8]"
          >
            Importar do Google Agenda
          </Link>
          <Link
            href={`/painel/agenda/novo?data=${vista === "mes" ? hoje : data}`}
            className="inline-flex min-h-12 items-center rounded-full bg-[#14683a] px-6 font-bold text-white hover:bg-[#0d4a28]"
          >
            Novo agendamento
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {abas.map((aba) => (
            <Link
              key={aba.vista}
              href={ligacao(aba.vista, data)}
              aria-current={aba.vista === vista ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold ${
                aba.vista === vista
                  ? "bg-[#14683a] text-white"
                  : "border border-[#b7cdbe] bg-white text-[#12261b] hover:bg-[#e1f3e8]"
              }`}
            >
              {aba.rotulo}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={ligacao(vista, anterior)}
            className="inline-flex min-h-11 items-center rounded-full border border-[#b7cdbe] bg-white px-4 text-sm font-bold hover:bg-[#e1f3e8]"
          >
            ← Anterior
          </Link>
          <Link
            href={ligacao(vista, hoje)}
            className="inline-flex min-h-11 items-center rounded-full border border-[#b7cdbe] bg-white px-4 text-sm font-bold hover:bg-[#e1f3e8]"
          >
            Hoje
          </Link>
          <Link
            href={ligacao(vista, proximo)}
            className="inline-flex min-h-11 items-center rounded-full border border-[#b7cdbe] bg-white px-4 text-sm font-bold hover:bg-[#e1f3e8]"
          >
            Próximo →
          </Link>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#e59a9a] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1f1f]"
        >
          Não foi possível carregar a agenda.
        </p>
      )}

      {/* ---------------- DIA ---------------- */}
      {vista === "dia" && (
        <>
          {agendamentos.length === 0 ? (
            <p className="rounded-2xl border border-[#d6e7dc] bg-white p-6 text-[#3d5246]">
              Nenhum agendamento neste dia.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {agendamentos.map((a) => (
                <CartaoAgendamento key={a.id} a={a} />
              ))}
            </ul>
          )}
        </>
      )}

      {/* ---------------- SEMANA ---------------- */}
      {vista === "semana" && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 7 }, (_, i) => somarDias(de, i)).map((dia) => {
            const doDia = porDia.get(dia) ?? [];
            const fimDeSemana = diaDaSemana(dia) === 0 || diaDaSemana(dia) === 6;
            if (fimDeSemana && doDia.length === 0) return null;
            return (
              <section
                key={dia}
                className="flex flex-col gap-3 rounded-2xl border border-[#d6e7dc] bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={ligacao("dia", dia)}
                    className={`text-base font-extrabold capitalize hover:underline ${
                      dia === hoje ? "text-[#14683a]" : ""
                    }`}
                  >
                    {formatarDiaCurto(dia)}
                    {dia === hoje && " · hoje"}
                  </Link>
                  <Link
                    href={`/painel/agenda/novo?data=${dia}`}
                    className="text-sm font-semibold text-[#14683a] underline"
                  >
                    Novo neste dia
                  </Link>
                </div>
                {doDia.length === 0 ? (
                  <p className="text-sm text-[#4b5f54]">Sem agendamentos.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {doDia.map((a) => (
                      <CartaoAgendamento key={a.id} a={a} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ---------------- MÊS ---------------- */}
      {vista === "mes" && (
        <div className="flex flex-col gap-2 rounded-2xl border border-[#d6e7dc] bg-white p-4">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-[#4b5f54]">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: diaDaSemana(de) }, (_, i) => (
              <div key={`vazio-${i}`} />
            ))}
            {Array.from({ length: diasNoMes(de) }, (_, i) => {
              const dia = somarDias(de, i);
              const ativos = (porDia.get(dia) ?? []).filter(
                (a) => statusConhecido(a.status) !== "cancelado"
              ).length;
              const ehHoje = dia === hoje;
              return (
                <Link
                  key={dia}
                  href={ligacao("dia", dia)}
                  className={`flex min-h-16 flex-col gap-0.5 rounded-lg border p-1.5 text-left sm:p-2 ${
                    ehHoje
                      ? "border-[#14683a] bg-[#14683a] text-white"
                      : ativos > 0
                        ? "border-[#bfe0cc] bg-[#e1f3e8] text-[#0d4a28]"
                        : "border-[#e3eee7] bg-[#fbfdfb] text-[#4b5f54]"
                  }`}
                >
                  <span className="text-sm font-bold">{Number(dia.slice(8))}</span>
                  {ativos > 0 && (
                    <span className="text-[11px] leading-tight">
                      {ativos} agend.
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-[#3d5246]">
        {(["solicitado", "confirmado", "concluido", "cancelado"] as const).map(
          (s) => (
            <span key={s} className={`rounded-full px-3 py-1 font-bold ${STATUS[s].selo}`}>
              {STATUS[s].rotulo}
            </span>
          )
        )}
      </div>
    </div>
  );
}
