import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FormularioLogin from "./formulario";

export const metadata: Metadata = {
  title: "Entrar | Painel da Podóloga Valdirene",
  robots: { index: false, follow: false },
};

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6faf7] px-6 py-10 text-[#12261b]">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-[24px] border border-[#d6e7dc] bg-white p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/imagens/logo.png"
            alt="Logo da Podóloga Valdirene Espindola"
            width={481}
            height={510}
            className="h-20 w-20 object-contain"
          />
          <h1 className="text-2xl font-extrabold">Painel do consultório</h1>
          <p className="text-sm text-[#4b5f54]">
            Acesso restrito. Entre com seu e-mail e senha.
          </p>
        </div>

        {erro === "acesso" && (
          <p
            role="alert"
            className="rounded-xl border border-[#e59a9a] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1f1f]"
          >
            Este usuário não tem permissão para acessar o painel.
          </p>
        )}

        <FormularioLogin />

        <Link
          href="/"
          className="text-center text-sm font-semibold text-[#14683a] underline"
        >
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}
