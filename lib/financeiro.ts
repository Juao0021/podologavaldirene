export type FormaPagamento =
  | "pix"
  | "dinheiro"
  | "cartao_debito"
  | "cartao_credito"
  | "outro";

export const FORMAS: Record<FormaPagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao_debito: "Cartão de débito",
  cartao_credito: "Cartão de crédito",
  outro: "Outro",
};

export const FORMAS_VALIDAS = Object.keys(FORMAS) as FormaPagamento[];

export function rotuloForma(valor: string): string {
  return (FORMAS as Record<string, string>)[valor] ?? valor;
}

export const CATEGORIAS_SUGERIDAS = [
  "Material",
  "Aluguel",
  "Equipamentos",
  "Esterilização",
  "Marketing",
  "Impostos e taxas",
  "Outros",
];

// "2026-11" -> true
export function mesValido(texto: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(texto);
}

// O Supabase devolve uma relação como objeto ou como lista; aceita os dois.
export function primeiroDe<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}
