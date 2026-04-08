import { Link } from "wouter";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">rotinaFlow</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-slate-400 mb-10">Última atualização: março de 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">1. Quem somos</h2>
            <p>
              O <strong>rotinaFlow</strong> é um serviço de organização de rotina semanal com inteligência artificial,
              disponível em <a href="https://rotina-flow.replit.app" className="text-primary underline">rotina-flow.replit.app</a>.
              Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">2. Dados que coletamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dados de conta Google:</strong> nome, endereço de e-mail e foto de perfil, obtidos via Google OAuth no momento do login.</li>
              <li><strong>Dados do Google Calendar:</strong> lemos e criamos eventos no calendário somente com sua autorização explícita e para os fins do serviço.</li>
              <li><strong>Dados de pagamento:</strong> processados pelo Stripe. Não armazenamos dados de cartão — apenas o ID da sessão de pagamento e o status da transação.</li>
              <li><strong>Conteúdo da rotina:</strong> as informações que você fornece para gerar sua rotina personalizada (horários, objetivos, preferências).</li>
              <li><strong>Dados de uso:</strong> logs de acesso, erros e métricas de desempenho para manter a qualidade do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Autenticar sua conta e manter sua sessão ativa.</li>
              <li>Gerar rotinas personalizadas com inteligência artificial (OpenAI).</li>
              <li>Sincronizar eventos aprovados com o seu Google Calendar.</li>
              <li>Processar e registrar suas compras de créditos.</li>
              <li>Melhorar o serviço com base em dados agregados e anônimos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. Compartilhamento de dados</h2>
            <p>Não vendemos seus dados pessoais. Compartilhamos informações apenas com:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Google LLC</strong> — para autenticação e integração com o Google Calendar.</li>
              <li><strong>OpenAI</strong> — para processamento de linguagem natural e geração de rotinas. Os dados enviados são usados somente para gerar sua resposta e não são usados para treinar modelos, conforme a política da API da OpenAI.</li>
              <li><strong>Stripe</strong> — para processamento de pagamentos.</li>
              <li><strong>Replit</strong> — infraestrutura de hospedagem onde o serviço opera.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">5. Retenção de dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Você pode solicitar a exclusão de seus dados a qualquer
              momento pelo e-mail de contato abaixo. Após a exclusão, os dados são removidos dos nossos sistemas em até 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">6. Seus direitos (LGPD)</h2>
            <p>De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento de seus dados.</li>
              <li>Acessar, corrigir ou atualizar seus dados.</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Solicitar a portabilidade dos seus dados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">7. Segurança</h2>
            <p>
              Utilizamos HTTPS em todas as comunicações, sessões criptografadas armazenadas em banco de dados seguro,
              e não armazenamos senhas (o login é feito exclusivamente via Google). Ainda assim, nenhum sistema é 100% seguro —
              caso identifique qualquer irregularidade, entre em contato conosco imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">8. Cookies e armazenamento local</h2>
            <p>
              Utilizamos cookies de sessão para manter você autenticado. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">9. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas por e-mail ou
              por aviso no próprio serviço. O uso continuado do rotinaFlow após as alterações implica aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">10. Contato</h2>
            <p>
              Para dúvidas, solicitações ou exercício dos seus direitos, entre em contato pelo e-mail:{" "}
              <a href="mailto:davi26031@gmail.com" className="text-primary underline">davi26031@gmail.com</a>
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100 bg-slate-50 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span>© 2025 rotinaFlow. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-slate-600 transition-colors">Política de Privacidade</Link>
            <Link href="/termos" className="hover:text-slate-600 transition-colors">Termos de Serviço</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
