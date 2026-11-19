// Leitura de arquivos .ics (Google Agenda) e interpretação dos títulos.
// Roda no navegador: o arquivo não é enviado a lugar nenhum nesta etapa.
// Só as linhas que você marcar na prévia vão para o servidor.

import { dataSP, horaSP } from "./datas";
import { reaisParaCentavos } from "./formatar";

export type EventoLido = {
  chave: string;
  titulo: string;
  descricao: string;
  data: string; // 2026-11-10 (fuso de São Paulo)
  hora: string; // 14:00
  duracaoMin: number | null;
};

export type EventoIgnorado = { titulo: string; motivo: string };

export type ResultadoLeitura = {
  eventos: EventoLido[];
  ignorados: EventoIgnorado[];
  passados: number;
};

// ---------------------------------------------------------------------
// Datas
// ---------------------------------------------------------------------

function deslocamentoMin(fuso: string, instanteMs: number): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: fuso,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instanteMs));
  const pega = (tipo: string) =>
    Number(partes.find((p) => p.type === tipo)?.value ?? "0");
  const comoUTC = Date.UTC(
    pega("year"),
    pega("month") - 1,
    pega("day"),
    pega("hour"),
    pega("minute"),
    pega("second")
  );
  return (comoUTC - Math.floor(instanteMs / 1000) * 1000) / 60000;
}

function localParaInstante(
  a: number,
  m: number,
  d: number,
  h: number,
  min: number,
  fuso: string
): Date {
  const chute = Date.UTC(a, m - 1, d, h, min, 0);
  const off1 = deslocamentoMin(fuso, chute);
  let instante = chute - off1 * 60000;
  const off2 = deslocamentoMin(fuso, instante);
  if (off2 !== off1) instante = chute - off2 * 60000;
  return new Date(instante);
}

type Propriedade = { parametros: Record<string, string>; valor: string };

// "20261110T140000Z" | "20261110T140000" (+ TZID) | "20261110" (dia inteiro)
function lerDataICS(
  p: Propriedade | undefined
): { instante: Date; diaInteiro: boolean } | null {
  if (!p) return null;
  const m = p.valor.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, a, mes, d, h, min, , z] = m;
  if (h === undefined) {
    return {
      instante: new Date(`${a}-${mes}-${d}T12:00:00Z`),
      diaInteiro: true,
    };
  }
  if (z) {
    return {
      instante: new Date(Date.UTC(+a, +mes - 1, +d, +h, +min, 0)),
      diaInteiro: false,
    };
  }
  const fuso = p.parametros["TZID"]?.replace(/"/g, "") || "America/Sao_Paulo";
  try {
    return {
      instante: localParaInstante(+a, +mes, +d, +h, +min, fuso),
      diaInteiro: false,
    };
  } catch {
    return {
      instante: localParaInstante(+a, +mes, +d, +h, +min, "America/Sao_Paulo"),
      diaInteiro: false,
    };
  }
}

// ---------------------------------------------------------------------
// Arquivo .ics
// ---------------------------------------------------------------------

function desescapar(valor: string): string {
  return valor
    .replace(/\\[nN]/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function lerPropriedades(bloco: string): Map<string, Propriedade> {
  const mapa = new Map<string, Propriedade>();
  for (const linha of bloco.split("\n")) {
    const posDoisPontos = linha.indexOf(":");
    if (posDoisPontos <= 0) continue;
    const cabecalho = linha.slice(0, posDoisPontos);
    const valor = linha.slice(posDoisPontos + 1);
    const [nome, ...params] = cabecalho.split(";");
    const parametros: Record<string, string> = {};
    for (const par of params) {
      const igual = par.indexOf("=");
      if (igual > 0) parametros[par.slice(0, igual).toUpperCase()] = par.slice(igual + 1);
    }
    const chave = nome.toUpperCase();
    if (!mapa.has(chave)) mapa.set(chave, { parametros, valor });
  }
  return mapa;
}

export function lerICS(texto: string, hoje: string): ResultadoLeitura {
  // Junta as linhas que o formato .ics quebra no meio
  const limpo = texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n[ \t]/g, "");

  const eventos: EventoLido[] = [];
  const ignorados: EventoIgnorado[] = [];
  let passados = 0;

  const blocos = limpo.split("BEGIN:VEVENT").slice(1);
  for (const [indice, parte] of blocos.entries()) {
    const bloco = parte.split("END:VEVENT")[0];
    const props = lerPropriedades(bloco);

    const titulo = desescapar(props.get("SUMMARY")?.valor ?? "").trim();
    const descricao = desescapar(props.get("DESCRIPTION")?.valor ?? "").trim();
    const rotulo = titulo || "(sem título)";

    if ((props.get("STATUS")?.valor ?? "").trim().toUpperCase() === "CANCELLED") {
      ignorados.push({ titulo: rotulo, motivo: "Evento cancelado no Google Agenda." });
      continue;
    }

    const inicioLido = lerDataICS(props.get("DTSTART"));
    if (!inicioLido) {
      ignorados.push({ titulo: rotulo, motivo: "Data de início não reconhecida." });
      continue;
    }
    if (inicioLido.diaInteiro) {
      ignorados.push({ titulo: rotulo, motivo: "Evento de dia inteiro (não tem horário)." });
      continue;
    }

    const data = dataSP(inicioLido.instante.toISOString());
    if (data < hoje) {
      passados += 1;
      continue;
    }

    if (props.has("RRULE")) {
      ignorados.push({
        titulo: `${rotulo} (${data.slice(8, 10)}/${data.slice(5, 7)})`,
        motivo: "Evento que se repete. Cadastre manualmente na agenda.",
      });
      continue;
    }

    const fimLido = lerDataICS(props.get("DTEND"));
    let duracaoMin: number | null = null;
    if (fimLido && !fimLido.diaInteiro) {
      const minutos = Math.round(
        (fimLido.instante.getTime() - inicioLido.instante.getTime()) / 60000
      );
      if (minutos >= 5 && minutos <= 480) duracaoMin = minutos;
    }

    eventos.push({
      chave: `${props.get("UID")?.valor ?? "evento"}-${indice}`,
      titulo,
      descricao,
      data,
      hora: horaSP(inicioLido.instante.toISOString()),
      duracaoMin,
    });
  }

  eventos.sort((x, y) => (x.data + x.hora).localeCompare(y.data + y.hora));
  return { eventos, ignorados, passados };
}

// ---------------------------------------------------------------------
// Título do evento: "Maria (120)" ou "Maria (120) Fibra"
// ---------------------------------------------------------------------

export function interpretarTitulo(titulo: string): {
  nome: string;
  valorCentavos: number | null;
  nota: string;
} {
  const t = titulo.trim().replace(/\s+/g, " ");
  const m = t.match(/^(.*?)\s*\(([^)]*)\)\s*(.*)$/);
  if (!m) return { nome: t, valorCentavos: null, nota: "" };

  const nome = m[1].trim();
  const dentro = m[2].trim();
  const resto = m[3].trim();
  const valor = dentro === "" ? null : reaisParaCentavos(dentro);
  const partes = [valor === null ? dentro : "", resto].filter(Boolean);
  const nota = partes.join(" ").replace(/^[-–—:,]\s*/, "");
  return { nome, valorCentavos: valor, nota };
}

// "José  Ávila" -> "jose avila" (para comparar nomes)
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export type ServicoParaSugestao = {
  id: string;
  nome: string;
  preco_centavos: number;
};

// Tenta adivinhar o serviço pelo valor e/ou pela observação ("Fibra").
// Só sugere quando há UMA resposta clara; senão devolve null e ela escolhe.
export function sugerirServico(
  valorCentavos: number | null,
  nota: string,
  servicos: ServicoParaSugestao[]
): string | null {
  const n = normalizar(nota);
  if (n !== "") {
    const porNome = servicos.filter((s) => normalizar(s.nome).includes(n));
    if (porNome.length === 1) return porNome[0].id;
    if (porNome.length > 1 && valorCentavos !== null) {
      const filtrados = porNome.filter((s) => s.preco_centavos === valorCentavos);
      if (filtrados.length === 1) return filtrados[0].id;
    }
  }
  if (valorCentavos !== null) {
    const porPreco = servicos.filter((s) => s.preco_centavos === valorCentavos);
    if (porPreco.length === 1) return porPreco[0].id;
  }
  return null;
}
