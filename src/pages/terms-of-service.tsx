import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TermsOfService() {
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
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t("terms.title")}</h1>
        <p className="text-sm text-slate-500 mb-10">{t("common.lastUpdated")}</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.acceptance.title")}
            </h2>
            <p>
              {t("terms.sections.acceptance.lead")} <strong>rotinaFlow</strong>
              {t("terms.sections.acceptance.outro")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.description.title")}
            </h2>
            <p>{t("terms.sections.description.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("terms.sections.description.items.aiRoutine")}</li>
              <li>{t("terms.sections.description.items.calendarSync")}</li>
              <li>{t("terms.sections.description.items.creditsModel")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.account.title")}
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("terms.sections.account.items.googleOnly")}</li>
              <li>{t("terms.sections.account.items.responsibility")}</li>
              <li>{t("terms.sections.account.items.minAge")}</li>
              <li>{t("terms.sections.account.items.prohibited")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.credits.title")}
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("terms.sections.credits.items.freeFirst")}</li>
              <li>{t("terms.sections.credits.items.noExpiry")}</li>
              <li>{t("terms.sections.credits.items.pricing")}</li>
              <li>{t("terms.sections.credits.items.nonRefundable")}</li>
              <li>{t("terms.sections.credits.items.paymentIssue")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.googleCalendar.title")}
            </h2>
            <p>{t("terms.sections.googleCalendar.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.acceptableUse.title")}
            </h2>
            <p>{t("terms.sections.acceptableUse.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("terms.sections.acceptableUse.items.laws")}</li>
              <li>{t("terms.sections.acceptableUse.items.offensive")}</li>
              <li>{t("terms.sections.acceptableUse.items.unauthorizedAccess")}</li>
              <li>{t("terms.sections.acceptableUse.items.reverseEngineer")}</li>
              <li>{t("terms.sections.acceptableUse.items.overload")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.availability.title")}
            </h2>
            <p>{t("terms.sections.availability.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.ip.title")}
            </h2>
            <p>{t("terms.sections.ip.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.liability.title")}
            </h2>
            <p>{t("terms.sections.liability.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.termination.title")}
            </h2>
            <p>{t("terms.sections.termination.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.changes.title")}
            </h2>
            <p>{t("terms.sections.changes.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.governingLaw.title")}
            </h2>
            <p>{t("terms.sections.governingLaw.body")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t("terms.sections.contact.title")}
            </h2>
            <p>
              {t("terms.sections.contact.lead")}{" "}
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
