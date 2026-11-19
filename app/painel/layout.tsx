import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "../../lib/supabase/server";
import { sair } from "./actions";

export const metadata: Metadata = {
  title: "Painel | Podóloga Valdirene",
  robots: { index: false, follow: false },
};

const MENU = [
  { href: "/painel", nome: "Início" },
  { href: "/painel/agenda", nome: "Agenda" },
  { href: "/painel/clientes", nome: "Clientes" },
  { href: "/painel/servicos", nome: "Serviços" },
  { href: "/painel/financeiro", nome: "Financeiro" },
  { href: "/painel/relatorios", nome: "Relatórios" },
];

export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await criarClienteServidor();

  // 1) Precisa estar logado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2) Precisa estar cadastrado como proprietária.
  // As regras do banco só deixam cada pessoa ver a PRÓPRIA linha desta tabela.
  const { data: proprietaria } = await supabase
    .from("proprietarios")
    .select("user_id")
    .maybeSingle();
  if (!proprietaria) {
    redirect("/login?erro=acesso");
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#12261b]">
      <header className="bg-[#0f3d25] text-white print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/imagens/logo.png"
              alt="Logo"
              width={481}
              height={510}
              className="h-10 w-10 rounded-full bg-white object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold">Podóloga Valdirene</span>
              <span className="text-xs text-[#b9e0c8]">
                Painel do consultório
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-[#b9e0c8] sm:inline">
              {user.email}
            </span>
            <form action={sair}>
              <button
                type="submit"
                className="min-h-11 rounded-full border border-white/40 px-5 text-sm font-bold text-white hover:bg-white/10"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 px-6 pb-3">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-white hover:bg-white/10"
            >
              {item.nome}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
