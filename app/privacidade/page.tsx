import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | Podóloga Valdirene Espindola",
  description:
    "Como a Podóloga Valdirene Espindola trata os dados pessoais de seus pacientes, de acordo com a LGPD.",
};

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function PaginaPrivacidade() {
  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#12261b]">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12 text-[17px] leading-relaxed text-[#3d5246]">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="self-start text-sm font-semibold text-[#14683a] underline"
          >
            ← Voltar ao site
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#12261b]">
            Política de Privacidade
          </h1>
          <p className="text-sm text-[#4b5f54]">
            Última atualização: novembro de 2026
          </p>
        </div>

        <p>
          Esta política explica como seus dados pessoais são tratados no
          atendimento da Podóloga Valdirene Espindola, de acordo com a Lei Geral
          de Proteção de Dados (Lei nº 13.709/2018, a LGPD).
        </p>

        <Secao titulo="1. Quem é a responsável pelos seus dados">
          <p>
            Valdirene Espindola, podóloga, com atendimento na Av. Eugênio
            Krause, 3115, Armação, Penha - SC, CEP 88385-000. Para qualquer
            assunto sobre seus dados, fale conosco pelo WhatsApp (47) 98829-6502.
          </p>
        </Secao>

        <Secao titulo="2. Quais dados tratamos">
          <p>Tratamos apenas o necessário para o atendimento:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>nome e telefone (WhatsApp);</li>
            <li>
              observações de atendimento, que podem conter informações sobre a
              sua saúde, como dados sobre a condição dos pés e das unhas;
            </li>
            <li>datas, horários e tipos de atendimentos agendados e realizados;</li>
            <li>registros de pagamento dos atendimentos.</li>
          </ul>
          <p>
            Informações de saúde são dados pessoais sensíveis e recebem cuidado
            adicional.
          </p>
        </Secao>

        <Secao titulo="3. Para que usamos seus dados">
          <ul className="list-disc space-y-1 pl-6">
            <li>agendar, realizar e acompanhar seus atendimentos;</li>
            <li>entrar em contato para confirmar, lembrar ou remarcar horários;</li>
            <li>controlar pagamentos e a organização financeira do consultório;</li>
            <li>cumprir obrigações legais e profissionais.</li>
          </ul>
          <p>Não vendemos seus dados e não os usamos para publicidade de terceiros.</p>
        </Secao>

        <Secao titulo="4. Em que nos baseamos para tratar seus dados">
          <p>
            O tratamento é feito com o seu consentimento, para a tutela da saúde
            em procedimentos realizados por profissional de saúde, e para o
            cumprimento de obrigações legais ou regulatórias, conforme o caso.
          </p>
        </Secao>

        <Secao titulo="5. Com quem os dados podem ser compartilhados">
          <p>
            Usamos serviços de tecnologia para guardar e organizar as
            informações, como hospedagem e banco de dados. Esses fornecedores
            tratam os dados em nosso nome e somente para esse fim, e alguns
            podem processar dados fora do Brasil. Também podemos compartilhar
            dados quando a lei exigir.
          </p>
          <p>
            Quando você nos chama pelo WhatsApp, a conversa passa a seguir
            também as regras desse aplicativo.
          </p>
        </Secao>

        <Secao titulo="6. Como protegemos seus dados">
          <ul className="list-disc space-y-1 pl-6">
            <li>acesso restrito à profissional, com login e senha;</li>
            <li>conexão criptografada (HTTPS);</li>
            <li>regras de acesso no banco de dados, que impedem a leitura por pessoas não autorizadas;</li>
            <li>coleta do mínimo necessário.</li>
          </ul>
        </Secao>

        <Secao titulo="7. Por quanto tempo guardamos">
          <p>
            Pelo tempo necessário para cumprir as finalidades acima e as
            obrigações legais e profissionais. Depois disso, os dados são
            eliminados ou anonimizados.
          </p>
        </Secao>

        <Secao titulo="8. Seus direitos">
          <p>
            Você pode pedir, a qualquer momento: confirmação de que tratamos
            seus dados; acesso a eles; correção de dados incorretos;
            anonimização ou eliminação, quando cabível; informações sobre
            compartilhamento; e a revogação do seu consentimento. Basta nos
            enviar uma mensagem pelo WhatsApp (47) 98829-6502.
          </p>
        </Secao>

        <Secao titulo="9. Este site">
          <p>
            O site público não usa cookies de rastreamento nem ferramentas de
            publicidade. Os links para WhatsApp, Instagram e Google Maps levam a
            serviços de terceiros, com políticas próprias.
          </p>
        </Secao>

        <Secao titulo="10. Mudanças nesta política">
          <p>
            Podemos atualizar esta política. A data da última atualização fica
            sempre no início desta página.
          </p>
        </Secao>
      </div>
    </div>
  );
}
