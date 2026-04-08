import { Link } from "wouter";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Termos de Serviço</h1>
        <p className="text-sm text-slate-400 mb-10">Última atualização: março de 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">1. Aceitação dos termos</h2>
            <p>
              Ao acessar ou usar o <strong>rotinaFlow</strong>, você concorda com estes Termos de Serviço.
              Se você não concordar com algum dos termos, não utilize o serviço. O uso do rotinaFlow implica
              aceitação integral destas condições.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">2. Descrição do serviço</h2>
            <p>
              O rotinaFlow é uma plataforma de organização de rotina semanal que utiliza inteligência artificial
              para criar rotinas personalizadas e sincronizá-las com o Google Calendar. O serviço oferece:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Criação de rotinas personalizadas por IA com base nas suas preferências e objetivos.</li>
              <li>Sincronização automática de eventos com o Google Calendar.</li>
              <li>Um modelo de créditos para utilização do serviço após a primeira rotina gratuita.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">3. Conta e acesso</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>O acesso ao rotinaFlow é feito exclusivamente via conta Google.</li>
              <li>Você é responsável pela segurança da sua conta Google e por todas as atividades realizadas com ela.</li>
              <li>Você deve ter pelo menos 13 anos de idade para usar o serviço.</li>
              <li>É proibido criar contas falsas, usar o serviço de forma automatizada sem autorização ou compartilhar seu acesso com terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. Créditos e pagamentos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>A primeira rotina é gratuita. Rotinas adicionais requerem créditos.</li>
              <li>Créditos são adquiridos mediante pagamento via Stripe e não expiram.</li>
              <li>Os preços estão em Reais (BRL) e podem ser alterados com aviso prévio.</li>
              <li>Pagamentos são processados pelo Stripe e não são reembolsáveis, exceto em casos de erro técnico comprovado do serviço.</li>
              <li>Em caso de problema com um pagamento, entre em contato em até 7 dias úteis após a transação.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">5. Google Calendar</h2>
            <p>
              Ao autorizar o acesso ao Google Calendar, você permite que o rotinaFlow crie, edite e exclua eventos
              em seu calendário conforme sua aprovação explícita dentro do app. Você pode revogar esse acesso a
              qualquer momento nas configurações da sua conta Google.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">6. Uso aceitável</h2>
            <p>Você concorda em não usar o rotinaFlow para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Violar leis ou regulamentações aplicáveis.</li>
              <li>Enviar conteúdo ofensivo, abusivo ou que infrinja direitos de terceiros.</li>
              <li>Tentar acessar sistemas ou dados de outros usuários.</li>
              <li>Realizar engenharia reversa, modificar ou distribuir o software sem autorização.</li>
              <li>Sobrecarregar intencionalmente a infraestrutura do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">7. Disponibilidade e qualidade</h2>
            <p>
              Nos esforçamos para manter o serviço disponível continuamente, mas não garantimos disponibilidade
              ininterrupta. Podemos suspender o serviço para manutenção com ou sem aviso prévio. A qualidade
              das rotinas geradas por IA pode variar — o serviço não substitui orientação profissional de saúde,
              nutrição ou carreira.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">8. Propriedade intelectual</h2>
            <p>
              Todo o conteúdo, design e código do rotinaFlow são de propriedade do serviço e protegidos por direitos
              autorais. As rotinas geradas para você são de seu uso pessoal. Você mantém a propriedade do conteúdo
              que fornece para gerar suas rotinas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">9. Limitação de responsabilidade</h2>
            <p>
              O rotinaFlow é fornecido "como está". Não nos responsabilizamos por danos indiretos, incidentais ou
              consequentes decorrentes do uso ou impossibilidade de uso do serviço. Nossa responsabilidade total
              fica limitada ao valor pago pelos créditos nos últimos 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">10. Rescisão</h2>
            <p>
              Podemos suspender ou encerrar sua conta caso você viole estes termos. Você pode encerrar sua conta a
              qualquer momento solicitando a exclusão dos seus dados pelo e-mail de contato. Créditos não utilizados
              não são reembolsáveis em caso de encerramento por violação dos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">11. Alterações nos termos</h2>
            <p>
              Podemos atualizar estes termos periodicamente. Notificaremos você por e-mail ou aviso no serviço sobre
              mudanças relevantes. O uso continuado após as alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">12. Lei aplicável</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Eventuais disputas serão
              resolvidas no foro da comarca de domicílio do usuário, conforme o Código de Defesa do Consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">13. Contato</h2>
            <p>
              Para dúvidas sobre estes termos:{" "}
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
