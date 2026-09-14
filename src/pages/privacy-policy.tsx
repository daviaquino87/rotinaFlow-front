import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation("legal");
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/images/icon-192.png" alt="rotinaFlow" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-slate-800">rotinaFlow</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t("privacy.title")}</h1>
        <p className="text-sm text-slate-500 mb-10">{t("common.lastUpdated")}</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.whoWeAre.title")}
            </h2>
            <p>
              {t("privacy.sections.whoWeAre.lead")} <strong>rotinaFlow</strong>{" "}
              {t("privacy.sections.whoWeAre.body")}{" "}
              <a href="https://app.rotinaflow.com.br" className="text-primary underline">
                app.rotinaflow.com.br
              </a>
              {t("privacy.sections.whoWeAre.outro")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.dataCollected.title")}
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>{t("privacy.sections.dataCollected.items.googleAccount.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.items.googleAccount.description")}
              </li>
              <li>
                <strong>{t("privacy.sections.dataCollected.items.googleCalendar.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.items.googleCalendar.description")}
              </li>
              <li>
                <strong>{t("privacy.sections.dataCollected.items.payment.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.items.payment.description")}
              </li>
              <li>
                <strong>{t("privacy.sections.dataCollected.items.routineContent.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.items.routineContent.description")}
              </li>
              <li>
                <strong>{t("privacy.sections.dataCollected.items.usageData.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.items.usageData.description")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.dataUse.title")}
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacy.sections.dataUse.items.authenticate")}</li>
              <li>{t("privacy.sections.dataUse.items.generate")}</li>
              <li>{t("privacy.sections.dataUse.items.sync")}</li>
              <li>{t("privacy.sections.dataUse.items.processCredits")}</li>
              <li>{t("privacy.sections.dataUse.items.improve")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.dataSharing.title")}
            </h2>
            <p>{t("privacy.sections.dataSharing.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>{t("privacy.sections.dataSharing.items.google.label")}</strong>{" "}
                {t("privacy.sections.dataSharing.items.google.description")}
              </li>
              <li>
                <strong>{t("privacy.sections.dataSharing.items.groq.label")}</strong>{" "}
                {t("privacy.sections.dataSharing.items.groq.description")}
              </li>
              <li>
                <strong>{t("privacy.sections.dataSharing.items.stripe.label")}</strong>{" "}
                {t("privacy.sections.dataSharing.items.stripe.description")}
              </li>
              <li>
                <strong>{t("privacy.sections.dataSharing.items.railway.label")}</strong>{" "}
                {t("privacy.sections.dataSharing.items.railway.description")}
              </li>
              <li>
                <strong>{t("privacy.sections.dataSharing.items.supabase.label")}</strong>{" "}
                {t("privacy.sections.dataSharing.items.supabase.description")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.retention.title")}
            </h2>
            <p>{t("privacy.sections.retention.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.rights.title")}
            </h2>
            <p>{t("privacy.sections.rights.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacy.sections.rights.items.confirm")}</li>
              <li>{t("privacy.sections.rights.items.access")}</li>
              <li>{t("privacy.sections.rights.items.anonymize")}</li>
              <li>{t("privacy.sections.rights.items.revoke")}</li>
              <li>{t("privacy.sections.rights.items.portability")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.security.title")}
            </h2>
            <p>{t("privacy.sections.security.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.cookies.title")}
            </h2>
            <p>{t("privacy.sections.cookies.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.changes.title")}
            </h2>
            <p>{t("privacy.sections.changes.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("privacy.sections.contact.title")}
            </h2>
            <p>
              {t("privacy.sections.contact.lead")}{" "}
              <a href="mailto:approtinaflow@gmail.com" className="text-primary underline">
                approtinaflow@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100 bg-slate-50 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>{t("common.copyright")}</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-slate-600 transition-colors">
              {t("common.footerNav.privacy")}
            </Link>
            <Link href="/termos" className="hover:text-slate-600 transition-colors">
              {t("common.footerNav.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
