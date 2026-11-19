"use client";

export default function BotaoExcluir({
  acao,
  id,
  pergunta,
}: {
  acao: (formData: FormData) => Promise<void>;
  id: string;
  pergunta: string;
}) {
  return (
    <form
      action={acao}
      onSubmit={(e) => {
        if (!window.confirm(pergunta)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="min-h-12 rounded-full border border-[#c25b5b] px-6 text-base font-bold text-[#8a1f1f] hover:bg-[#fde8e8]"
      >
        Excluir
      </button>
    </form>
  );
}
