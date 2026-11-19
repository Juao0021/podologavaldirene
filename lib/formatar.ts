// Funções para mostrar e ler valores no padrão brasileiro.

const formatadorReais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// 12000 -> "R$ 120,00"
export function formatarReais(centavos: number): string {
  return formatadorReais.format(centavos / 100);
}

// 12000 -> "120,00" (para preencher o campo do formulário)
export function centavosParaCampo(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

// "120,00" ou "R$ 1.200,50" -> 12000 ou 120050. Retorna null se for inválido.
export function reaisParaCentavos(texto: string): number | null {
  let t = texto.replace(/R\$/gi, "").replace(/\s/g, "");
  if (t.includes(",")) {
    t = t.replace(/\./g, "").replace(",", ".");
  }
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(parseFloat(t) * 100);
}

// 90 -> "1h30", 30 -> "30 min", 120 -> "2h"
export function formatarDuracao(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

// "47988296502" ou "(47) 98829-6502" -> "(47) 98829-6502".
// Texto vazio é válido (telefone é opcional). Aceita o prefixo 55 do Brasil.
export function formatarTelefone(texto: string): {
  valido: boolean;
  valor: string | null;
} {
  let d = texto.replace(/\D/g, "");
  if (d === "") return { valido: true, valor: null };
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) {
    d = d.slice(2);
  }
  if (d.length === 11) {
    return { valido: true, valor: `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` };
  }
  if (d.length === 10) {
    return { valido: true, valor: `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` };
  }
  return { valido: false, valor: null };
}

// Data e hora do banco -> "31/10/2026" (fuso de São Paulo)
export function formatarData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}
