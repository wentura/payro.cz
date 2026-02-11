export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/clients",
          "/dashboard",
          "/invoices",
          "/payment",
          "/reset-password",
          "/settings",
          "/subscription",
          "/verify-email",
        ],
      },
    ],
    sitemap: "https://www.fktr.cz/sitemap.xml",
  };
}
