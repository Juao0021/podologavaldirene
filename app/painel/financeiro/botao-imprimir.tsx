"use client";

export default function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 items-center rounded-full border border-[#14683a] px-6 font-bold text-[#14683a] hover:bg-[#e1f3e8] print:hidden"
    >
      Imprimir / salvar PDF
    </button>
  );
}
