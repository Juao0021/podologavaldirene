export type StatusAgendamento =
  | "solicitado"
  | "confirmado"
  | "concluido"
  | "cancelado";

export const STATUS_VALIDOS: StatusAgendamento[] = [
  "solicitado",
  "confirmado",
  "concluido",
  "cancelado",
];

// Cores (sempre acompanhadas do nome por escrito, não só de cor)
export const STATUS: Record<
  StatusAgendamento,
  { rotulo: string; cartao: string; selo: string }
> = {
  solicitado: {
    rotulo: "Solicitado",
    cartao: "border-l-[#c99200] bg-[#fff9e6]",
    selo: "bg-[#fff4d6] text-[#6b4300]",
  },
  confirmado: {
    rotulo: "Confirmado",
    cartao: "border-l-[#14683a] bg-[#f1faf4]",
    selo: "bg-[#e1f3e8] text-[#0d4a28]",
  },
  concluido: {
    rotulo: "Concluído",
    cartao: "border-l-[#9aa7b1] bg-[#f3f5f7]",
    selo: "bg-[#e8ecef] text-[#3b4650]",
  },
  cancelado: {
    rotulo: "Cancelado",
    cartao: "border-l-[#c25b5b] bg-[#fdf1f1]",
    selo: "bg-[#fde8e8] text-[#8a1f1f]",
  },
};

export function statusConhecido(valor: string): StatusAgendamento {
  return (STATUS_VALIDOS as string[]).includes(valor)
    ? (valor as StatusAgendamento)
    : "solicitado";
}
