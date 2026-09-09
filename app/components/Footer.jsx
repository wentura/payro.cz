import Link from "next/link";

export default function Footer({ user = null }) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-fktr-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-fktr-muted text-center md:text-left mb-12">
          <div>
            <Link
              href="/"
              className="font-display text-xl font-medium text-fktr-accent tracking-tight"
            >
              FKTR.cz
            </Link>
            <p className="text-sm mt-4 leading-relaxed">
              Službu provozuje
              <br />
              <a
                href="https://www.zbyneksvoboda.cz"
                className="text-fktr-accent underline underline-offset-2 font-medium"
              >
                Zbyněk Svoboda
              </a>
            </p>
          </div>
          <div className="flex flex-col gap-3 items-center md:items-start text-sm">
            <Link href="/vseobecne-obchodni-podminky" className="hover:text-fktr-fg transition-colors">
              VOP
            </Link>
            <Link href="/ochrana-osobnich-udaju" className="hover:text-fktr-fg transition-colors">
              GDPR
            </Link>
            <Link href="/pricing" className="hover:text-fktr-fg transition-colors">
              Ceník
            </Link>
          </div>
          <div className="flex flex-col gap-3 items-center md:items-start text-sm">
            <Link href="/login" className="hover:text-fktr-fg transition-colors">
              Přihlásit se
            </Link>
            <Link href="/register" className="hover:text-fktr-fg transition-colors">
              Registrace
            </Link>
          </div>
        </div>
        <div className="text-center text-sm text-fktr-muted border-t border-fktr-border pt-8">
          {user && (
            <div className="mb-2">
              Přihlášen jako:{" "}
              <span className="font-medium text-fktr-fg">
                {user.contact_email}
              </span>
              {user.company_id && <span> • IČO: {user.company_id}</span>}
            </div>
          )}
          <div>
            © {currentYear} FKTR.cz •{" "}
            <a
              href="https://www.zbyneksvoboda.cz"
              className="text-fktr-accent underline underline-offset-2 font-medium"
            >
              Zbyněk Svoboda
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
