/**
 * SEO Configuration for PetQuotes
 * Improves search engine visibility and page rankings
 */

export const SEO_CONFIG = {
  siteName: "PET QUOTES",
  siteUrl: "https://petquotes.com",
  description: "Plataforma para agendar citas de mascotas entre clientes y veterinarias",
  language: "es",
  defaultImage: "https://petquotes.com/og-image.jpg",
};

export const PAGE_SEO = {
  home: {
    title: "PET QUOTES | Agendar Citas Veterinarias",
    description: "Plataforma para conectar dueños de mascotas con veterinarios premium",
    keywords: ["veterinario", "citas veterinarias", "mascotas", "agenda"],
  },
  login: {
    title: "Iniciar Sesión | PET QUOTES",
    description: "Accede a tu cuenta para agendar citas veterinarias",
  },
  register: {
    title: "Crear Cuenta | PET QUOTES",
    description: "Regístrate para acceder a servicios veterinarios premium",
  },
  clinics: {
    title: "Directorio de Clínicas | PET QUOTES",
    description: "Encuentra las mejores clínicas veterinarias en tu zona",
    keywords: ["clínicas veterinarias", "veterinarios", "directorio"],
  },
  bookings: {
    title: "Reservar Cita | PET QUOTES",
    description: "Agenda tu cita veterinaria de forma rápida y fácil",
  },
  profile: {
    title: "Mi Perfil | PET QUOTES",
    description: "Gestiona tu perfil y preferencias de notificación",
  },
};

export const STRUCTURED_DATA = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PET QUOTES",
    "url": "https://petquotes.com",
    "logo": "https://petquotes.com/logo.png",
    "description": "Plataforma para agendar citas veterinarias",
    "sameAs": [
      "https://facebook.com/petquotes",
      "https://twitter.com/petquotes",
      "https://linkedin.com/company/petquotes",
    ],
  },
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "PET QUOTES",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR",
    },
    "telephone": "+54 (11) 0000-0000",
    "priceRange": "$$$",
    "serviceArea": "AR",
  },
  service: {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Servicio de Citas Veterinarias",
    "description": "Plataforma de agendamiento de citas veterinarias",
    "provider": {
      "@type": "Organization",
      "name": "PET QUOTES",
    },
    "areaServed": "AR",
    "availableLanguage": "es",
  },
};

export const OPEN_GRAPH = {
  basic: {
    "og:title": "PET QUOTES",
    "og:description": "Agendar citas veterinarias de forma rápida y fácil",
    "og:type": "website",
    "og:url": "https://petquotes.com",
    "og:image": "https://petquotes.com/og-image.jpg",
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:site_name": "PET QUOTES",
    "og:locale": "es_AR",
  },
  twitter: {
    "twitter:card": "summary_large_image",
    "twitter:site": "@petquotes",
    "twitter:creator": "@petquotes",
    "twitter:title": "PET QUOTES",
    "twitter:description": "Agendar citas veterinarias",
    "twitter:image": "https://petquotes.com/og-image.jpg",
  },
};

export const META_TAGS = {
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  charset: "utf-8",
  httpEquiv: "x-ua-compatible",
  content: "ie=edge",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  googleSiteVerification: "YOUR_VERIFICATION_CODE",
  msvalidate: "YOUR_VERIFICATION_CODE",
};

export const ROBOTS_TXT = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /.env
Disallow: /node_modules/

Sitemap: https://petquotes.com/sitemap.xml
`;

export const SITEMAP_ROUTES = [
  { url: "/", changefreq: "weekly", priority: 1.0 },
  { url: "/login", changefreq: "monthly", priority: 0.8 },
  { url: "/register", changefreq: "monthly", priority: 0.8 },
  { url: "/clinics", changefreq: "weekly", priority: 0.9 },
  { url: "/bookings", changefreq: "weekly", priority: 0.9 },
  { url: "/profile", changefreq: "monthly", priority: 0.7 },
  { url: "/forgot-password", changefreq: "monthly", priority: 0.5 },
];

export const BREADCRUMB_SCHEMA = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://petquotes.com${item.url}`,
  })),
});
