// Language translations for SBA website
export const translations = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_properties: "Properties",
    nav_book_consultation: "Book Consultation",
    nav_about: "About",
    nav_contact: "Contact",
    nav_get_started: "Get Started",
    nav_language: "English",

    // Homepage
    hero_title: "Find Your Perfect Warehouse Space",
    hero_subtitle: "South Florida's premier industrial real estate platform. Discover available warehouse space with live inventory and instant tour booking.",
    hero_cta: "Explore Properties",
    hero_cta_secondary: "Book Consultation",

    // Search
    search_placeholder: "Search by location, size, or features...",
    search_button: "Search",

    // Counties
    county_miami_dade: "Miami-Dade County",
    county_broward: "Broward County",
    county_palm_beach: "Palm Beach County",

    // Property details
    property_sqft: "sq ft",
    property_monthly: "/month",
    property_available: "Available Now",
    property_view_details: "View Details",

    // Booking page
    booking_title: "Book Your Consultation",
    booking_subtitle: "Schedule a meeting with our commercial real estate experts",
    booking_form_name: "Full Name",
    booking_form_email: "Email Address",
    booking_form_phone: "Phone Number",
    booking_form_company: "Company/Organization",
    booking_form_consultation_type: "Consultation Type",
    booking_form_date: "Preferred Date",
    booking_form_time: "Preferred Time",
    booking_form_requirements: "Space Requirements",
    booking_form_submit: "Schedule Consultation",

    // About page
    about_title: "About Shallow Bay Advisors",
    about_subtitle: "Your trusted partner in South Florida commercial real estate",

    // Contact
    contact_title: "Contact Us",
    contact_subtitle: "Get in touch with our team"
  },

  es: {
    // Navigation
    nav_home: "Inicio",
    nav_properties: "Propiedades",
    nav_book_consultation: "Reservar Consulta",
    nav_about: "Acerca de",
    nav_contact: "Contacto",
    nav_get_started: "Comenzar",
    nav_language: "Español",

    // Homepage
    hero_title: "Encuentra tu Espacio de Almacén Perfecto",
    hero_subtitle: "La plataforma líder de bienes raíces industriales del sur de Florida. Descubre espacios de almacén disponibles con inventario en vivo y reservas instantáneas de tours.",
    hero_cta: "Explorar Propiedades",
    hero_cta_secondary: "Reservar Consulta",

    // Search
    search_placeholder: "Buscar por ubicación, tamaño o características...",
    search_button: "Buscar",

    // Counties
    county_miami_dade: "Condado de Miami-Dade",
    county_broward: "Condado de Broward",
    county_palm_beach: "Condado de Palm Beach",

    // Property details
    property_sqft: "pies²",
    property_monthly: "/mes",
    property_available: "Disponible Ahora",
    property_view_details: "Ver Detalles",

    // Booking page
    booking_title: "Reserva tu Consulta",
    booking_subtitle: "Programa una reunión con nuestros expertos en bienes raíces comerciales",
    booking_form_name: "Nombre Completo",
    booking_form_email: "Correo Electrónico",
    booking_form_phone: "Número de Teléfono",
    booking_form_company: "Empresa/Organización",
    booking_form_consultation_type: "Tipo de Consulta",
    booking_form_date: "Fecha Preferida",
    booking_form_time: "Hora Preferida",
    booking_form_requirements: "Requisitos de Espacio",
    booking_form_submit: "Programar Consulta",

    // About page
    about_title: "Acerca de Shallow Bay Advisors",
    about_subtitle: "Tu socio de confianza en bienes raíces comerciales del sur de Florida",

    // Contact
    contact_title: "Contáctanos",
    contact_subtitle: "Ponte en contacto con nuestro equipo"
  }
};

// Get translation for current language
export function getTranslation(key, lang = 'en') {
  return translations[lang]?.[key] || translations.en[key] || key;
}

// Get current language from localStorage or default to English
export function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedLanguage') || 'en';
  }
  return 'en';
}

// Set current language
export function setCurrentLanguage(lang) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedLanguage', lang);
  }
}