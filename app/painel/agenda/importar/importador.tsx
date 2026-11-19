"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  importarAgendamentos,
  estadoInicialImportacao,
} from "./actions";
import {
  interpretarTitulo,
  lerICS,
  normalizar,
  sugerirServico,
  type EventoIgnorado,
} from "../../../../lib/importar-agenda";
import {
  dentroDoHorarioDeAtendimento,
  hojeSP,
} from "../../../../lib/datas";
import { formatarReais } from "../../../../lib/formatar";

type Servico = { id: string; nome: string; duracao: number; preco: number };

type Linha = {
  chave: string;
  marcada: boolean;
  nome: string;
  data: string;
  hora: string;
  duracao: string;
  servicoId: string;
  observacoes: string;
  valorCentavos: number | null;
  avisoHorario: boolean;
};

const classeCampo =
  "min-h-11 w-full rounded-xl border border-[#b7cdbe] bg-white px-3 text-base font-normal text-[#12261b]";

function dataBR(data: string): string {
  return `${data.slice(8, 10)}/${data.slice(5, 7)}/${data.slice(0, 4)}`;
}

export default function Importador({
  servicos,
  nomesClientes,
}: {
  servicos: Servico[];
  nomesClientes: string[];
}) {
  const [estado, acao, pendente] = useActionState(
    importarAgendamentos,
    estadoInicialImportacao
  );

  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [ignorados, setIgnorados] = useState<EventoIgnorado[]>([]);
  const [passados, setPassados] = useState(0);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [lido, setLido] = useState(false);
  const [status, setStatus] = useState<"confirmado" | "solicitado">("confirmado");

  const nomesExistentes = useMemo(
    () => new Set(nomesClientes.map((n) => normalizar(n))),
    [nomesClientes]
  );

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    setErroArquivo(null);
    setLido(false);
    setLinhas([]);
    if (!arquivo) return;

    if (arquivo.name.toLowerCase().endsWith(".zip")) {
      setErroArquivo(
        "Esse é o arquivo .zip. Abra o .zip e escolha o arquivo .ics que está dentro."
      );
      return;
    }
    if (!arquivo.name.toLowerCase().endsWith(".ics")) {
      setErroArquivo("Escolha um arquivo terminado em .ics.");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setErroArquivo("O arquivo é grande demais (máximo 5 MB).");
      return;
    }

    const texto = await arquivo.text();
    if (!texto.includes("BEGIN:VCALENDAR")) {
      setErroArquivo("Esse arquivo não parece ser uma agenda (.ics).");
      return;
    }

    const leitura = lerICS(texto, hojeSP());
    const novas: Linha[] = leitura.eventos.map((ev) => {
      const t = interpretarTitulo(ev.titulo);
      const observacoes = [t.nota, ev.descricao]
        .filter((x) => x !== "")
        .join(" | ")
        .slice(0, 1000);
      const servicoId = sugerirServico(
        t.valorCentavos,
        t.nota,
        servicos.map((s) => ({ id: s.id, nome: s.nome, preco_centavos: s.preco }))
      );
      const servico = servicos.find((s) => s.id === servicoId);
      const duracao = ev.duracaoMin ?? servico?.duracao ?? null;
      const duracaoParaChecar = duracao ?? 30;
      const dentro = dentroDoHorarioDeAtendimento(ev.data, ev.hora, duracaoParaChecar);
      return {
        chave: ev.chave,
        marcada: dentro && t.nome.length >= 2,
        nome: t.nome,
        data: ev.data,
        hora: ev.hora,
        duracao: duracao === null ? "" : String(duracao),
        servicoId: servicoId ?? "",
        observacoes,
        valorCentavos: t.valorCentavos,
        avisoHorario: !dentro,
      };
    });

    setLinhas(novas);
    setIgnorados(leitura.ignorados);
    setPassados(leitura.passados);
    setLido(true);
  }

  function mudar(chave: string, mudanca: Partial<Linha>) {
    setLinhas((atuais) =>
      atuais.map((l) => (l.chave === chave ? { ...l, ...mudanca } : l))
    );
  }

  function aoMudarServico(l: Linha, servicoId: string) {
    const servico = servicos.find((s) => s.id === servicoId);
    mudar(l.chave, {
      servicoId,
      duracao: l.duracao === "" && servico ? String(servico.duracao) : l.duracao,
    });
  }

  const marcadas = linhas.filter((l) => l.marcada);
  const incompletas = marcadas.filter((l) => {
    const d = Number(l.duracao);
    return (
      l.servicoId === "" ||
      l.nome.trim().length < 2 ||
      !Number.isInteger(d) ||
      d < 5 ||
      d > 480
    );
  });
  const podeImportar = marcadas.length > 0 && incompletas.length === 0 && !pendente;

  const dadosParaEnviar = JSON.stringify({
    status,
    linhas: marcadas.map((l) => ({
      nome: l.nome.trim(),
      data: l.data,
      hora: l.hora,
      duracao: Number(l.duracao),
      servicoId: l.servicoId,
      observacoes: l.observacoes.trim(),
    })),
  });

  // ---------- Resultado depois de importar ----------
  if (estado.concluido) {
    return (
      <div className="flex max-w-2xl flex-col gap-4 rounded-2xl border border-[#d6e7dc] bg-white p-6">
        <h2 className="text-xl font-extrabold">Importação concluída</h2>
        <p className="text-base">
          <strong>{estado.importados}</strong> agendamento(s) importado(s)
          {estado.clientesNovos > 0 && (
            <>
              , com <strong>{estado.clientesNovos}</strong> cliente(s) nova(s)
              cadastrada(s)
            </>
          )}
          .
        </p>
        {estado.clientesNovos > 0 && (
          <p className="rounded-xl bg-[#fff4d6] p-4 text-sm text-[#6b4300]">
            As clientes novas foram cadastradas <strong>sem telefone e sem o
            consentimento de privacidade</strong>. Abra cada uma em Clientes
            para completar o telefone e registrar o consentimento quando ela
            autorizar.
          </p>
        )}
        {estado.ignorados.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold">
              {estado.ignorados.length} não foram importados:
            </p>
            <ul className="flex list-disc flex-col gap-1 pl-6 text-sm text-[#3d5246]">
              {estado.ignorados.map((i, n) => (
                <li key={n}>
                  <strong>{i.rotulo}</strong>: {i.motivo}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href="/painel/agenda"
          className="inline-flex min-h-12 w-fit items-center rounded-full bg-[#14683a] px-6 font-bold text-white hover:bg-[#0d4a28]"
        >
          Ver a agenda
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <label className="flex max-w-xl flex-col gap-1.5 text-sm font-semibold">
        Arquivo da agenda (.ics)
        <input
          type="file"
          accept=".ics,text/calendar"
          onChange={aoEscolherArquivo}
          className="min-h-12 rounded-xl border border-[#b7cdbe] bg-white p-3 text-base font-normal"
        />
      </label>

      {erroArquivo && (
        <p role="alert" className="max-w-xl rounded-xl bg-[#fde8e8] p-4 text-sm font-semibold text-[#8a1f1f]">
          {erroArquivo}
        </p>
      )}

      {lido && (
        <>
          <div className="flex max-w-2xl flex-col gap-1 rounded-2xl border border-[#d6e7dc] bg-[#f1faf4] p-4 text-base">
            <p>
              <strong>{linhas.length}</strong> compromisso(s) futuro(s)
              encontrado(s).
            </p>
            {passados > 0 && (
              <p className="text-sm text-[#3d5246]">
                {passados} compromisso(s) antigo(s) foram deixados de fora de
                propósito.
              </p>
            )}
            {ignorados.length > 0 && (
              <details className="text-sm text-[#3d5246]">
                <summary className="cursor-pointer font-semibold">
                  {ignorados.length} não podem ser importados (ver lista)
                </summary>
                <ul className="mt-2 flex list-disc flex-col gap-1 pl-6">
                  {ignorados.map((i, n) => (
                    <li key={n}>
                      <strong>{i.titulo}</strong>: {i.motivo}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          {linhas.length === 0 ? (
            <p className="text-base text-[#3d5246]">
              Não há compromissos futuros para importar neste arquivo.
            </p>
          ) : (
            <form action={acao} className="flex flex-col gap-4">
              <input type="hidden" name="dados" value={dadosParaEnviar} />

              <label className="flex max-w-sm flex-col gap-1.5 text-sm font-semibold">
                Situação dos agendamentos importados
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "confirmado" | "solicitado")
                  }
                  className={classeCampo}
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="solicitado">Solicitado</option>
                </select>
              </label>

              <p className="max-w-2xl text-sm text-[#3d5246]">
                Confira cada linha. Desmarque o que não quiser importar. Se a
                agenda tiver só o primeiro nome, corrija para o nome completo
                (duas clientes com o mesmo nome viram uma só).
              </p>

              <ul className="flex flex-col gap-3">
                {linhas.map((l) => {
                  const existe = nomesExistentes.has(normalizar(l.nome));
                  const semServico = l.marcada && l.servicoId === "";
                  return (
                    <li
                      key={l.chave}
                      className={`flex flex-col gap-3 rounded-2xl border p-4 ${
                        l.marcada
                          ? "border-[#b7cdbe] bg-white"
                          : "border-[#e2e8e4] bg-[#f5f7f6] opacity-80"
                      }`}
                    >
                      <label className="flex items-center gap-3 text-base font-bold">
                        <input
                          type="checkbox"
                          checked={l.marcada}
                          onChange={(e) => mudar(l.chave, { marcada: e.target.checked })}
                          className="h-5 w-5 accent-[#14683a]"
                        />
                        {dataBR(l.data)} às {l.hora}
                        {l.valorCentavos !== null && (
                          <span className="text-sm font-semibold text-[#3d5246]">
                            (valor na agenda: {formatarReais(l.valorCentavos)})
                          </span>
                        )}
                      </label>

                      {l.avisoHorario && (
                        <p className="rounded-lg bg-[#fff4d6] px-3 py-2 text-sm font-semibold text-[#6b4300]">
                          Fora do horário de atendimento (segunda a sexta, 14h às 20h).
                          Por isso veio desmarcado.
                        </p>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm font-semibold">
                          Cliente{" "}
                          <span
                            className={`text-xs font-bold ${
                              existe ? "text-[#0d4a28]" : "text-[#6b4300]"
                            }`}
                          >
                            {existe ? "já cadastrada" : "será cadastrada"}
                          </span>
                          <input
                            value={l.nome}
                            onChange={(e) => mudar(l.chave, { nome: e.target.value })}
                            maxLength={120}
                            className={classeCampo}
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-sm font-semibold">
                          Serviço
                          <select
                            value={l.servicoId}
                            onChange={(e) => aoMudarServico(l, e.target.value)}
                            className={`${classeCampo} ${
                              semServico ? "border-[#c25b5b]" : ""
                            }`}
                          >
                            <option value="">Escolha o serviço…</option>
                            {servicos.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nome} ({formatarReais(s.preco)})
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex flex-col gap-1 text-sm font-semibold">
                          Duração (minutos)
                          <input
                            inputMode="numeric"
                            value={l.duracao}
                            onChange={(e) =>
                              mudar(l.chave, { duracao: e.target.value.replace(/\D/g, "") })
                            }
                            className={classeCampo}
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-sm font-semibold">
                          Observação
                          <input
                            value={l.observacoes}
                            onChange={(e) => mudar(l.chave, { observacoes: e.target.value })}
                            maxLength={1000}
                            className={classeCampo}
                          />
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {estado.erro && (
                <p role="alert" className="rounded-xl bg-[#fde8e8] p-4 text-sm font-semibold text-[#8a1f1f]">
                  {estado.erro}
                </p>
              )}

              <div className="sticky bottom-0 flex flex-col gap-2 border-t border-[#d6e7dc] bg-[#f6fbf8] py-4">
                {incompletas.length > 0 && (
                  <p className="text-sm font-semibold text-[#8a1f1f]">
                    {incompletas.length} linha(s) marcada(s) estão sem serviço, nome ou
                    duração válida.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!podeImportar}
                  className="min-h-12 w-fit rounded-full bg-[#14683a] px-8 font-bold text-white hover:bg-[#0d4a28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendente
                    ? "Importando…"
                    : `Importar ${marcadas.length} agendamento(s)`}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
