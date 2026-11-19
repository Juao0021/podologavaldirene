// Funções de data e hora no fuso de São Paulo.
// Datas viram texto no formato "2026-10-31" (ano-mês-dia).
// O Brasil não usa mais horário de verão, então o fuso é sempre -03:00.

const FUSO = "America/Sao_Paulo";
const DESLOCAMENTO = "-03:00";

export function hojeSP(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: FUSO }).format(new Date());
}

// Data (dia no fuso de São Paulo) de um instante guardado no banco
export function dataSP(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: FUSO }).format(new Date(iso));
}

// "14:30" a partir de um instante do banco
export function horaSP(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  }).format(new Date(iso));
}

export function dataValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  return new Date(`${texto}T12:00:00Z`).toISOString().slice(0, 10) === texto;
}

export function horaValida(texto: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(texto);
}

// Dia + hora digitados (no horário de São Paulo) -> instante exato
export function montarInstante(data: string, hora: string): Date {
  return new Date(`${data}T${hora}:00${DESLOCAMENTO}`);
}

// Início do dia (00:00 em São Paulo) em formato ISO, para consultar o banco
export function inicioDoDiaISO(data: string): string {
  return new Date(`${data}T00:00:00${DESLOCAMENTO}`).toISOString();
}

export function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function primeiroDiaDoMes(data: string): string {
  return `${data.slice(0, 7)}-01`;
}

export function somarMeses(data: string, meses: number): string {
  const ano = Number(data.slice(0, 4));
  const mes = Number(data.slice(5, 7));
  const d = new Date(Date.UTC(ano, mes - 1 + meses, 1));
  return d.toISOString().slice(0, 10);
}

export function diasNoMes(data: string): number {
  const ano = Number(data.slice(0, 4));
  const mes = Number(data.slice(5, 7));
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

// 0 = domingo ... 6 = sábado
export function diaDaSemana(data: string): number {
  return new Date(`${data}T12:00:00Z`).getUTCDay();
}

// Segunda-feira da semana que contém a data
export function inicioDaSemana(data: string): string {
  const atras = (diaDaSemana(data) + 6) % 7;
  return somarDias(data, -atras);
}

// "sábado, 31 de outubro de 2026"
export function formatarDataLonga(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${data}T12:00:00Z`));
}

// "outubro de 2026"
export function formatarMesAno(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${data}T12:00:00Z`));
}

// "seg., 26"
export function formatarDiaCurto(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${data}T12:00:00Z`));
}

// "2026-10-31" -> "31/10"
export function dataCurta(data: string): string {
  return `${data.slice(8, 10)}/${data.slice(5, 7)}`;
}

// Horário de atendimento: segunda a sexta, das 14h às 20h
export const ATENDIMENTO = {
  diasUteis: [1, 2, 3, 4, 5],
  inicioMin: 14 * 60,
  fimMin: 20 * 60,
};

export function dentroDoHorarioDeAtendimento(
  data: string,
  hora: string,
  duracaoMin: number
): boolean {
  const dia = diaDaSemana(data);
  if (!ATENDIMENTO.diasUteis.includes(dia)) return false;
  const [h, m] = hora.split(":").map(Number);
  const inicio = h * 60 + m;
  return inicio >= ATENDIMENTO.inicioMin && inicio + duracaoMin <= ATENDIMENTO.fimMin;
}
