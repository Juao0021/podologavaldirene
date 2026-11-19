import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------
// DADOS DO CONSULTÓRIO (para mudar algo no site, altere aqui)
// ---------------------------------------------------------------
const NOME = "Podóloga Valdirene Espindola";
const TELEFONE_EXIBIDO = "(47) 98829-6502";
const TELEFONE_INTERNACIONAL = "5547988296502";
const INSTAGRAM_URL = "https://www.instagram.com/podologa_valdirene/";
const INSTAGRAM_USUARIO = "@podologa_valdirene";
const ENDERECO_LINHA_1 = "Av. Eugênio Krause, 3115";
const ENDERECO_LINHA_2 = "Armação, Penha - SC";
const ENDERECO_CEP = "CEP 88385-000";
const ENDERECO_COMPLETO =
  "Av. Eugênio Krause, 3115 - Armação, Penha - SC, 88385-000";

const WHATSAPP_URL = `https://wa.me/${TELEFONE_INTERNACIONAL}?text=${encodeURIComponent(
  "Olá! Gostaria de agendar um horário."
)}`;
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  ENDERECO_COMPLETO
)}`;

const SERVICOS = [
  {
    titulo: "Procedimentos em Unhas",
    itens: [
      "Manutenção de corte",
      "Manutenção de onicofose ou espícula (unha encravada)",
      "Manutenção com órtese ou reconstrução de unha",
      "Unha encravada com 1 retorno incluso",
      "Unha encravada com 2 retornos inclusos",
      "Reconstrução de unha",
      "Aplicação somente de órtese",
    ],
  },
  {
    titulo: "Tratamentos Específicos",
    itens: [
      "Limpeza para tratamento de fungos",
      "Manutenção de tratamento de fungos",
      "Tratamento de verruga (com 4 retornos inclusos)",
    ],
  },
  {
    titulo: "Calosidades",
    itens: [
      "Retirada somente de calosidades",
      "Limpeza completa de calosidade e unha",
      "Retirada de calo interno ou interdigital (com 1 retorno incluso)",
    ],
  },
  {
    titulo: "Avaliação e Atendimento Inicial",
    itens: [
      "Limpeza das lâminas preventiva – 1º atendimento",
      "Somente avaliação",
    ],
  },
];

// Dados para o Google entender o negócio (SEO local)
const DADOS_ESTRUTURADOS = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: NOME,
  description:
    "Podologia especializada. Cuidado, saúde e bem-estar para seus pés.",
  telephone: "+" + TELEFONE_INTERNACIONAL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Eugênio Krause, 3115 - Armação",
    addressLocality: "Penha",
    addressRegion: "SC",
    postalCode: "88385-000",
    addressCountry: "BR",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "14:00",
    closes: "20:00",
  },
  sameAs: [INSTAGRAM_URL],
};

// ---------------------------------------------------------------
// ÍCONES
// ---------------------------------------------------------------
function IconeWhatsApp({ cor }: { cor: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}

function IconeInstagram({ cor }: { cor: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill={cor} />
    </svg>
  );
}

function IconeGota() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#14683a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3c3 4 5 6.5 5 10a5 5 0 0 1-10 0c0-3.5 2-6 5-10z" />
    </svg>
  );
}

function IconeRelogio() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#14683a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// ---------------------------------------------------------------
// PÁGINA
// ---------------------------------------------------------------
export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#12261b]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DADOS_ESTRUTURADOS) }}
      />

      {/* Cabeçalho */}
      <header data-reveal="down" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-12">
        <a href="#inicio" className="flex items-center gap-3 no-underline">
          <Image
            src="/imagens/logo.png"
            alt="Logo da Podóloga Valdirene Espindola"
            width={481}
            height={510}
            className="h-14 w-14 object-contain"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold text-[#12261b]">
              Podóloga Valdirene
            </span>
            <span className="text-[13px] text-[#4b5f54]">
              Cuidado profissional para os pés
            </span>
          </span>
        </a>
        <nav className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[15px] font-semibold">
          <a href="#sobre" className="hidden text-[#12261b] md:inline">
            Sobre
          </a>
          <a href="#servicos" className="hidden text-[#12261b] md:inline">
            Serviços
          </a>
          <a href="#horarios" className="hidden text-[#12261b] md:inline">
            Horários
          </a>
          <a href="#local" className="hidden text-[#12261b] md:inline">
            Localização
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="motion-interactive inline-flex min-h-11 items-center gap-2 rounded-full bg-[#14683a] px-5 font-bold text-white hover:bg-[#0d4a28]"
          >
            <IconeWhatsApp cor="#ffffff" />
            Agendar pelo WhatsApp
          </a>
        </nav>
      </header>

      <main>
        {/* Início */}
        <section
          id="inicio"
          className="mx-auto flex max-w-6xl flex-wrap items-center gap-10 px-6 pb-16 pt-10 md:px-12 md:pb-20"
        >
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
            <span data-reveal="up" data-reveal-delay="0" className="self-start rounded-full bg-[#e1f3e8] px-4 py-1.5 text-[13px] font-bold text-[#14683a]">
              Podologia Especializada
            </span>
            <h1 data-reveal="up" data-reveal-delay="1" className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              Cuidado, saúde e{" "}
              <span className="text-[#14683a]">bem-estar para seus pés.</span>
            </h1>
            <p data-reveal="up" data-reveal-delay="2" className="max-w-xl text-lg leading-relaxed text-[#3d5246]">
              Atendimento podológico cuidadoso e acolhedor. Agende seu horário
              de forma rápida, direto pelo WhatsApp.
            </p>
            <div data-reveal="up" data-reveal-delay="3" className="flex flex-wrap gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-interactive inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-[#14683a] px-7 py-3.5 text-base font-bold text-white hover:bg-[#0d4a28]"
              >
                <IconeWhatsApp cor="#ffffff" />
                Agendar pelo WhatsApp
              </a>
              <a
                href="#servicos"
                className="motion-interactive inline-flex min-h-13 items-center justify-center rounded-full border-2 border-[#14683a] px-7 py-3.5 text-base font-bold text-[#14683a] hover:bg-[#e1f3e8]"
              >
                Ver serviços
              </a>
            </div>
            <div data-reveal="up" data-reveal-delay="4" className="flex items-center gap-2.5 text-[15px] text-[#3d5246]">
              <IconeRelogio />
              Segunda a sexta, das 14h às 20h
            </div>
          </div>
          <div data-reveal="right" className="flex min-w-0 flex-[1_1_280px] justify-center">
            <div className="hero-orbit flex aspect-square w-full max-w-[420px] items-center justify-center rounded-full bg-[#e1f3e8]">
              <Image
                src="/imagens/logo.png"
                alt="Logo da Podóloga Valdirene Espindola"
                width={481}
                height={510}
                priority
                className="hero-logo-motion h-[84%] w-[84%] object-contain"
              />
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section id="sobre" className="bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-10 px-6 py-16 md:px-12 md:py-20">
            <div data-reveal="left" className="flex min-w-0 flex-[1_1_280px] flex-col gap-3">
              <span className="text-[13px] font-bold tracking-[0.08em] text-[#14683a]">
                SOBRE
              </span>
              <Image
                src="/imagens/valdirene.png"
                alt="Podóloga Valdirene Espindola"
                width={1254}
                height={1254}
                sizes="320px"
                data-parallax="true" className="portrait-parallax my-2 aspect-square w-full max-w-[320px] rounded-full object-cover"
              />
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                Valdirene Espindola
              </h2>
              <span className="text-base text-[#4b5f54]">Podóloga</span>
              <div className="mt-3 flex flex-col gap-2.5">
                <span className="self-start rounded-full bg-[#e1f3e8] px-3.5 py-2 text-sm font-bold text-[#0d4a28]">
                  Mais de 10 anos de experiência
                </span>
                <span className="self-start rounded-full bg-[#e1f3e8] px-3.5 py-2 text-sm font-bold text-[#0d4a28]">
                  Graduação em Podologia · Fisiomar, Itajaí–SC
                </span>
              </div>
            </div>
            <div data-reveal="right" className="flex min-w-0 flex-[2_1_380px] flex-col gap-4 text-[17px] leading-[1.7] text-[#3d5246]">
              <p>
                Olá! Sou Valdirene Espindola, profissional da área de Podologia,
                com mais de 10 anos de experiência dedicados ao cuidado e à
                saúde dos pés.
              </p>
              <p>
                Possuo formação técnica e graduação em Podologia, realizadas na
                Fisiomar, em Itajaí–SC. Ao longo da minha trajetória, também
                participei de congressos e atividades de atualização
                profissional, buscando aprimorar meus conhecimentos e
                acompanhar a evolução da podologia.
              </p>
              <p>
                Acredito que cuidar dos pés é também cuidar da saúde, do
                conforto e da qualidade de vida. Por isso, valorizo um
                atendimento humanizado e individualizado, respeitando as
                necessidades de cada paciente.
              </p>
              <p>
                Meu compromisso é oferecer um atendimento responsável,
                atencioso e acolhedor, proporcionando confiança e cuidado em
                cada consulta.
              </p>
              <p className="font-bold text-[#12261b]">
                Será um prazer receber você e cuidar da saúde dos seus pés!
              </p>
              <p className="text-[15px] text-[#4b5f54]">
                Valdirene Espindola | Podóloga
              </p>
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section id="servicos" className="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20">
          <div data-reveal="up" className="mb-9 flex max-w-2xl flex-col gap-3">
            <span className="text-[13px] font-bold tracking-[0.08em] text-[#14683a]">
              SERVIÇOS
            </span>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Como posso cuidar de você
            </h2>
            <p className="text-[17px] leading-relaxed text-[#3d5246]">
              Podologia especializada: cuidado, saúde e bem-estar para seus
              pés.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICOS.map((grupo) => (
              <div
                key={grupo.titulo}
                data-reveal="up"
                data-reveal-delay={SERVICOS.indexOf(grupo) + 1}
                className="motion-card flex flex-col gap-4 rounded-[20px] border border-[#d6e7dc] bg-white p-7"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#e1f3e8]">
                    <IconeGota />
                  </div>
                  <h3 className="text-xl font-bold leading-tight">
                    {grupo.titulo}
                  </h3>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {grupo.itens.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-[15px] leading-normal text-[#3d5246]"
                    >
                      <span className="mt-[7px] h-2 w-2 flex-none rounded-full bg-[#14683a]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Horários e localização */}
        <section className="bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-6 px-6 py-16 md:px-12 md:py-20">
            <div
              id="horarios"
              data-reveal="left"
              className="motion-card flex min-w-0 flex-[1_1_320px] flex-col gap-3.5 rounded-[20px] border border-[#d6e7dc] bg-[#f6faf7] p-8"
            >
              <span className="text-[13px] font-bold tracking-[0.08em] text-[#14683a]">
                HORÁRIOS
              </span>
              <h2 className="text-[28px] font-extrabold leading-tight">
                Horário de atendimento
              </h2>
              <div className="flex justify-between gap-4 border-t border-[#d6e7dc] py-3.5 text-base">
                <span>Segunda a sexta</span>
                <strong>14h às 20h</strong>
              </div>
              <p className="text-sm leading-relaxed text-[#4b5f54]">
                Agende pelo WhatsApp. A duração varia conforme o procedimento.
              </p>
            </div>
            <div
              id="local"
              data-reveal="right"
              className="motion-card flex min-w-0 flex-[1_1_320px] flex-col gap-3.5 rounded-[20px] border border-[#d6e7dc] bg-[#f6faf7] p-8"
            >
              <span className="text-[13px] font-bold tracking-[0.08em] text-[#14683a]">
                LOCALIZAÇÃO
              </span>
              <h2 className="text-[28px] font-extrabold leading-tight">
                Onde estamos
              </h2>
              <p className="text-base leading-relaxed text-[#3d5246]">
                {ENDERECO_LINHA_1}
                <br />
                {ENDERECO_LINHA_2}
                <br />
                {ENDERECO_CEP}
              </p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-interactive mt-auto inline-flex min-h-12 items-center justify-center self-start rounded-full border-2 border-[#14683a] px-6 text-[15px] font-bold text-[#14683a] hover:bg-[#e1f3e8]"
              >
                Ver no Google Maps
              </a>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section id="contato" className="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20">
          <div data-reveal="zoom" className="motion-card flex flex-col items-center gap-5 rounded-[28px] bg-[#14683a] px-6 py-14 text-center md:px-10">
            <h2 className="max-w-xl text-4xl font-extrabold leading-tight text-white">
              Pronta para cuidar dos seus pés?
            </h2>
            <p className="max-w-md text-[17px] leading-relaxed text-[#d6efe0]">
              Chame no WhatsApp e escolha o melhor horário para você.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="motion-interactive inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-base font-extrabold text-[#14683a] hover:bg-[#e1f3e8]"
            >
              <IconeWhatsApp cor="#14683a" />
              Chamar no WhatsApp
            </a>
            <span className="text-sm text-[#d6efe0]">{TELEFONE_EXIBIDO}</span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 px-2 text-[15px] font-bold text-white underline"
            >
              <IconeInstagram cor="#ffffff" />
              {INSTAGRAM_USUARIO}
            </a>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer data-reveal="up" className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 border-t border-[#d6e7dc] px-6 pb-10 pt-7 text-sm text-[#4b5f54] md:px-12">
        <span>
          © {new Date().getFullYear()} {NOME}
        </span>
        <span className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacidade" className="font-semibold text-[#14683a]">
            Política de privacidade
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#14683a]"
          >
            Instagram {INSTAGRAM_USUARIO}
          </a>
        </span>
      </footer>
    </div>
  );
}
