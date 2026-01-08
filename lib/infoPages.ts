export type InfoSection =
  | {
      type: "columns";
      title: string;
      columns: { title: string; items: string[] }[];
    }
  | {
      type: "faq";
      title: string;
      items: { question: string; answer: string; ctaLabel?: string; ctaHref?: string }[];
    }
  | {
      type: "faq-group";
      title: string;
      items: { question: string; answer: string; ctaLabel?: string; ctaHref?: string }[];
    }
  | {
      type: "cta";
      title: string;
      body: string;
      primaryLabel: string;
      primaryHref: string;
      secondaryLabel?: string;
      secondaryHref?: string;
    }
  | {
      type: "contact-info";
      title: string;
      items: { label: string; value: string }[];
    }
  | {
      type: "form";
      title: string;
      description?: string;
      fields: {
        name: string;
        label: string;
        type: string;
        required?: boolean;
        options?: string[];
        placeholder?: string;
      }[];
      submitLabel: string;
    }
  | {
      type: "steps";
      title: string;
      steps: { label: string; description: string }[];
    }
  | {
      type: "text";
      title: string;
      body: string[];
    }
  | {
      type: "bullets";
      title: string;
      items: string[];
    }
  | {
      type: "list";
      title: string;
      items: string[];
    }
  | {
      type: "legal-section";
      title: string;
      body: string[];
    };

export type InfoPage = {
  key: string;
  category: string;
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    layout: "standard" | "narrow";
  };
  sections: InfoSection[];
};

export const infoPages: InfoPage[] = [
  {
    key: "help-center",
    category: "support",
    path: "/help-center",
    title: "Centro de ayuda",
    seoTitle: "Centro de ayuda | Proactivitis",
    seoDescription: "Encuentra respuestas a preguntas frecuentes sobre reservas, pagos, proveedores y tu cuenta en Proactivitis.",
    hero: {
      eyebrow: "Soporte",
      title: "¿Cómo podemos ayudarte hoy?",
      subtitle: "Explora temas, consulta respuestas rápidas o contacta al equipo si necesitas un soporte personalizado.",
      layout: "standard"
    },
    sections: [
      {
        type: "columns",
        title: "Temas populares",
        columns: [
          {
            title: "Reservas y vouchers",
            items: [
              "Cómo confirmar una reserva",
              "Dónde encuentro mi voucher",
              "Cambiar fechas o datos de viajeros",
              "Qué pasa si un tour se cancela"
            ]
          },
          {
            title: "Pagos y reembolsos",
            items: [
              "Métodos de pago aceptados",
              "Cuándo se realiza el cobro",
              "Tiempo de reembolso",
              "Moneda y tipo de cambio"
            ]
          },
          {
            title: "Cuentas y seguridad",
            items: [
              "Crear una cuenta en Proactivitis",
              "Actualizar tu correo o teléfono",
              "Mantener tu cuenta segura",
              "Eliminar tu cuenta"
            ]
          }
        ]
      },
      {
        type: "faq",
        title: "Respuestas rápidas",
        items: [
          {
            question: "No recibí el correo de confirmación. ¿Qué debo hacer?",
            answer:
              "Primero revisa spam o promociones y verifica que el correo sea correcto. Si no aparece, utiliza 'Reenviar voucher' en tu página de reservas o escríbenos con nombre, fecha y tour."
          },
          {
            question: "¿Puedo cambiar la fecha de mi tour?",
            answer:
              "Muchas experiencias permiten cambios hasta cierto plazo. Entra a tu reserva en el panel y busca 'Cambiar fecha'. Si no aparece el botón, contáctanos y coordinamos con el proveedor."
          },
          {
            question: "¿Cuánto tardan los reembolsos?",
            answer:
              "Una vez aprobado, la mayoría de los bancos procesa el reembolso en 5 a 10 días hábiles. Algunas tarjetas internacionales pueden tardar más según su política."
          },
          {
            question: "¿Mis datos de pago están seguros?",
            answer:
              "Sí. Proactivitis trabaja con proveedores de pago que cumplen PCI y nunca guarda los datos completos de la tarjeta."
          }
        ]
      },
      {
        type: "cta",
        title: "¿Necesitas ayuda?",
        body: "Si no encuentras lo que necesitas, nuestro equipo de soporte te puede ayudar.",
        primaryLabel: "Contactar soporte",
        primaryHref: "/contact",
        secondaryLabel: "Ver preguntas frecuentes",
        secondaryHref: "/faqs"
      }
    ]
  },
  {
    key: "contact",
    category: "support",
    path: "/contact",
    title: "Contáctanos",
    seoTitle: "Contáctanos | Proactivitis",
    seoDescription: "Escríbenos para consultas de reservas, soporte al proveedor o alianzas.",
    hero: {
      eyebrow: "Soporte",
      title: "Habla con el equipo de Proactivitis",
      subtitle:
        "Atención local para experiencias globales. Cuéntanos qué necesitas y te respondemos lo antes posible.",
      layout: "standard"
    },
    sections: [
      {
        type: "contact-info",
        title: "Cómo contactarnos",
        items: [
          { label: "Customer support", value: "support@proactivitis.com" },
          { label: "Supplier relations", value: "suppliers@proactivitis.com" },
          { label: "Agency partners", value: "partners@proactivitis.com" },
          { label: "Emergency line (during tours only)", value: "+1 (000) 000 0000" }
        ]
      },
      {
        type: "form",
        title: "Envíanos un mensaje",
        description: "Cuéntanos qué necesitas para dirigir tu solicitud al equipo adecuado.",
        fields: [
          { name: "name", label: "Nombre completo", type: "text", required: true },
          { name: "email", label: "Correo", type: "email", required: true },
          {
            name: "topic",
            label: "Tema",
            type: "select",
            options: [
              "Booking support",
              "Payment & refund",
              "Supplier onboarding",
              "Agency partnership",
              "Technical issue",
              "Other"
            ],
            required: true
          },
          {
            name: "bookingCode",
            label: "Código de reserva (opcional)",
            type: "text",
            required: false,
            placeholder: "Si tu consulta es sobre una reserva"
          },
          { name: "message", label: "Mensaje", type: "textarea", required: true }
        ],
        submitLabel: "Enviar mensaje"
      }
    ]
  },
  {
    key: "how-it-works",
    category: "support",
    path: "/how-it-works",
    title: "Cómo funciona",
    seoTitle: "Cómo funciona Proactivitis | Proactivitis",
    seoDescription: "Procesos simples, pagos blindados y ejecución premium para cada viajero. | Simple processes, secure payments, and premium execution for every traveler.",
    hero: {
      eyebrow: "Proceso",
      title: "Cómo funciona Proactivitis: Su viaje perfecto, simplificado.",
      subtitle: "Desde la selección hasta la ejecución, garantizamos un estándar de seguridad y claridad en cada paso.",
      layout: "standard"
    },
    sections: [
      {
        type: "steps",
        title: "Simplificamos todo en tres pasos",
        steps: [
          {
            label: "Paso 1: Selección Inteligente",
            description: "Explore nuestra red global de servicios. Filtre por destino, tipo de vehículo o categoría de experiencia. Todos nuestros precios son finales, sin cargos ocultos."
          },
          {
            label: "Paso 2: Reserva Blindada",
            description: "Confirme su reserva mediante nuestra pasarela de pago con encriptación de grado bancario. Recibirá un voucher electrónico con todos los detalles técnicos y puntos de encuentro de inmediato."
          },
          {
            label: "Paso 3: Ejecución Premium",
            description: "El día de su servicio, un profesional verificado le asistirá. Monitoreamos cada traslado y tour mediante GPS y comunicación directa para asegurar su tranquilidad."
          }
        ]
      }
    ]
  },

  {
    key: "faqs",
    category: "support",
    path: "/faqs",
    title: "Preguntas frecuentes",
    seoTitle: "Preguntas frecuentes | FAQs | Proactivitis",
    seoDescription: "Resuelve dudas globales sobre cobertura, seguridad y partners. | Resolve global doubts about coverage, security, and partners.",
    hero: {
      eyebrow: "Soporte",
      title: "Preguntas frecuentes",
      subtitle: "Resolución clara de inquietudes sin mencionar ubicación física, con datos de confianza y soporte internacional.",
      layout: "standard"
    },
    sections: [
      {
        type: "faq-group",
        title: "Resolvemos tus dudas",
        items: [
          {
            question: "¿En qué países opera Proactivitis?",
            answer: "Somos una plataforma global en constante expansión. Actualmente cubrimos los principales hubs turísticos y aeropuertos internacionales, conectando viajeros con proveedores locales de élite en múltiples continentes.",
            ctaLabel: "Ver destinos",
            ctaHref: "/destinations"
          },
          {
            question: "¿Cómo garantizan mi seguridad?",
            answer: "Todos los proveedores deben cumplir con licencias comerciales vigentes y seguros de responsabilidad civil internacional. Además, nuestro equipo de soporte supervisa la operativa 24/7 y responde al +1 (809) 394-9877."
          },
          {
            question: "¿Qué métodos de pago aceptan?",
            answer: "Aceptamos todas las tarjetas de crédito internacionales (Visa, Mastercard, Amex) y procesamos los pagos a través de sistemas seguros globales para su total protección."
          },
          {
            question: "¿Cómo puedo ser proveedor?",
            answer: "Si usted es un operador con flota propia o servicios turísticos de alta gama, puede iniciar su proceso de auditoría en nuestra sección de Partners.",
            ctaLabel: "Partners",
            ctaHref: "/become-a-supplier"
          }
        ]
      }
    ]
  },
  {
    key: "about",
    category: "company",
    path: "/about",
    title: "Sobre Proactivitis",
    seoTitle: "Proactivitis: Excelencia en Movilidad Global",
    seoDescription: "Proactivitis es una plataforma tecnológica líder para traslados premium y experiencias curadas, conectando proveedores locales con viajeros globales. | Proactivitis is a leading technology platform for premium transfers and curated experiences, connecting local partners with global travelers.",
    hero: {
      eyebrow: "Empresa",
      title: "Proactivitis: Excelencia en Movilidad y Experiencias Globales",
      subtitle: "Autoridad tecnológica, confianza internacional y operaciones diseñadas para el viajero global.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "Nuestra propuesta",
        body: [
          "Proactivitis es una plataforma tecnológica líder, dedicada a la gestión de traslados privados premium y experiencias de viaje curadas en los destinos más exclusivos del mundo.",
          "Nuestra misión es cerrar la brecha entre los proveedores locales de alta calidad y el viajero global, garantizando estándares de seguridad, puntualidad y soporte que las agencias tradicionales no pueden ofrecer.",
          "Operamos bajo una estructura diseñada para la eficiencia internacional, permitiendo que cada reserva sea procesada con la máxima transparencia y seguridad financiera."
        ]
      },
      {
        type: "bullets",
        title: "Nuestros valores",
        items: [
          "Verificación rigurosa: auditamos a cada socio comercial para asegurar vehículos modernos y guías certificados.",
          "Soporte multi-destino: asistencia coordinada globalmente para resolver cualquier imprevisto en tiempo real.",
          "Innovación en pagos: procesamiento seguro en múltiples divisas para una experiencia sin fronteras."
        ]
      }
    ]
  },  {
    key: "mission",
    category: "company",
    path: "/our-mission",
    title: "Nuestra misión",
    seoTitle: "Nuestra Misión y Visión | El Compromiso de Proactivitis",
    seoDescription: "Descubra los valores que impulsan a Proactivitis: excelencia en traslados privados, tours curados y una infraestructura tecnológica global para el turismo moderno.",
    hero: {
      eyebrow: "Empresa",
      title: "Elevando los estándares del viaje global",
      subtitle: "Transformamos la logística de viajes en una experiencia de lujo, seguridad y simplicidad absoluta.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "Nuestra Visión",
        body: [
          "Convertirnos en la infraestructura tecnológica preferida para la movilidad premium y las experiencias turísticas a nivel mundial.",
          "Conectamos de manera inteligente a los mejores proveedores con los clientes más exigentes."
        ]
      },
      {
        type: "columns",
        title: "Nuestros Valores Fundamentales",
        columns: [
          { title: "Calidad sobre Cantidad", items: ["Selección manual de partners; la tecnología humaniza el servicio."] },
          { title: "Seguridad y Transparencia Global", items: ["Infraestructura de pagos y datos alineada con estándares internacionales."] },
          { title: "Empoderamiento del Socio Local", items: ["Damos herramientas tecnológicas para mantener la autenticidad en cada destino."] },
          { title: "Excelencia Operativa", items: ["Puntualidad, respuesta inmediata y resolución proactiva de imprevistos."] }
        ]
      },
      {
        type: "text",
        title: "Hacia dónde vamos",
        body: [
          "Construimos el ecosistema de viajes más confiable del planeta.",
          "La tecnología y la hospitalidad se encuentran para que el viajero se sienta en casa y el proveedor tenga el control."
        ]
      }
    ]
  },  {
    key: "press",
    category: "company",
    path: "/press",
    title: "Press & media",
    seoTitle: "Sala de Prensa y Media Kit | Proactivitis Global",
    seoDescription: "Acceda a los recursos oficiales de prensa, logotipos y noticias de Proactivitis, la plataforma líder en tecnología para viajes y movilidad.",
    hero: {
      eyebrow: "Prensa",
      title: "Centro de Prensa y Media Kit",
      subtitle: "Llevando la tecnología turística al siguiente nivel con actualizaciones globales y recursos oficiales.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "Sobre Proactivitis",
        body: [
          "Proactivitis es una plataforma tecnológica global que conecta viajeros internacionales con traslados premium y tours curados.",
          "Bajo el lema 'Tourism powered by people, not bots', devolvemos la calidad y el servicio humano al centro de la industria turística."        ]
      },
      {
        type: "columns",
        title: "Recursos de Marca",
        columns: [
          { title: "Logotipos oficiales", items: ["Descargue versiones en alta resolución para fondos claros y oscuros."] },
          { title: "Guía de estilo", items: ["Nuestra paleta de colores y tipografías corporativas."] },
          { title: "Banco de imágenes", items: ["Fotografías curadas con placeholder para el media kit (.ZIP)."] }
        ]
      },
      {
        type: "columns",
        title: "Notas de prensa recientes",
        columns: [
          { title: "Enero 2025", items: ["Proactivitis anuncia nuevos estándares de seguridad en su red global de traslados privados."] },
          { title: "Diciembre 2024", items: ["Expansión del programa 'Agency Partners' para agencias minoristas."] },
          { title: "Noviembre 2024", items: ["Lanzamiento de la nueva interfaz de reserva con confirmación instantánea para mercados internacionales."] }
        ]
      },
      {
        type: "cta",
        title: "Contacto para medios",
        body: "Para periodistas o creadores que necesitan información adicional, entrevistas o materiales, nuestro equipo de comunicación global está disponible.",
        primaryLabel: "Descargar Media Kit (.ZIP)",
        primaryHref: "/press/media-kit.zip",
        secondaryLabel: "Escribir a press@proactivitis.com",
        secondaryHref: "mailto:press@proactivitis.com"
      }
    ]
  },  {
    key: "partners",
    category: "company",
    path: "/partners",
    title: "Aliados",
    seoTitle: "Alianzas estratégicas | Proactivitis",
    seoDescription: "Explore oportunidades de colaboración con Proactivitis. Ofrecemos soluciones de movilidad y tours para hoteles, aerolíneas y empresas del sector lujo.",
    hero: {
      eyebrow: "Empresa",
      title: "Alianzas Estratégicas: Expandiendo los límites del Turismo Global",
      subtitle: "Colaboramos con socios que buscan excelencia, seguridad y servicio humano para sus clientes corporativos.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "¿A quién buscamos como partner?",
        body: [
          "Cadenas hoteleras y resorts integran nuestra flota premium para ofrecer lujo desde el aeropuerto hasta el check-in.",
          "Aerolíneas y OTAs complementan su oferta con servicios de tierra de alta confianza y confirmación inmediata mediante nuestra API.",
          "Servicios financieros y concierge obtienen beneficios exclusivos para titulares de tarjetas premium.",
          "Plataformas tecnológicas colaboran con integraciones que optimizan logística y distribución global."
        ]
      },
      {
        type: "columns",
        title: "El diferencial Proactivitis para socios",
        columns: [
          { title: "Infraestructura global", items: ["Acceso a una red curada en destinos estratégicos."] },
          { title: "Integración flexible", items: ["Desde widgets hasta integraciones v?a API adaptadas a su stack." ] },
          { title: "Seguridad financiera", items: ["Procesamiento robusto y liquidaciones transparentes."] },
          { title: "Brand protection", items: ["Su marca se asocia con un estándar auditado y soporte 24/7."] }
        ]
      },
      {
        type: "cta",
        title: "Inicie una conversación estratégica",
        body: "Nuestro equipo de Desarrollo de Negocio Global está listo para discutir cómo potenciar su oferta.",
        primaryLabel: "Contactar a partners@proactivitis.com",
        primaryHref: "mailto:partners@proactivitis.com",
        secondaryLabel: "Descubra integraciones enterprise",
        secondaryHref: "/partners"
      }
    ]
  },
  {
    key: "become-supplier",
    category: "work-with-us",
    path: "/become-a-supplier",
    title: "Conviértete en supplier",
    seoTitle: "Conviértete en supplier | Proactivitis",
    seoDescription: "Publica tus tours en Proactivitis y accede a herramientas hechas para operadores reales.",
    hero: {
      eyebrow: "Colabora",
      title: "Conviértete en supplier de Proactivitis",
      subtitle: "Publica tus tours, gestiona reservas y cobra con herramientas pensadas para operadores locales.",
      layout: "standard"
    },
    sections: [
      {
        type: "bullets",
        title: "Por qué unirse a Proactivitis",
        items: [
          "Visibilidad en el marketplace y herramientas privadas B2B en la misma plataforma.",
          "Notificaciones en tiempo real de nuevas reservas, cambios y cancelaciones.",
          "Reglas claras de pagos y reportes transparentes."
        ]
      },
      {
        type: "steps",
        title: "Cómo funciona la incorporación",
        steps: [
          { label: "Aplica", description: "Envía los datos de tu empresa, licencias y ejemplos de experiencias." },
          { label: "Revisión y configuración", description: "Verificamos tu información, te ayudamos a estructurar productos y conectamos pagos." },
          { label: "Activa tu producto", description: "Publica tus tours, recibe reservas y administra todo desde el panel." }
        ]
      }
    ]
  },
  {
    key: "agency-partners",
    category: "work-with-us",
    path: "/agency-partners",
    title: "Agency Partners",
    seoTitle: "Programa para Agencias de Viajes | Agency Partners Proactivitis",
    seoDescription:
      "Únase al programa de partners de Proactivitis. Ofrecemos traslados y tours exclusivos con las mejores comisiones para agencias de viajes globales.",
    hero: {
      eyebrow: "B2B",
      title: "Potencie su Agencia con la Tecnología de Proactivitis",
      subtitle:
        "Únase a nuestra red global de agencias aliadas y acceda a un inventario exclusivo de traslados VIP y experiencias curadas.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "Potencie su agencia con infraestructura global",
        body: [
          "Diseñamos soluciones que permiten a agencias tradicionales y digitales competir hoy con eficiencia y mejores márgenes.",
          "El diseño visual refleja autoridad: iconografía de gráficos, alianzas y edificios corporativos respaldan la narrativa de confianza global."
        ]
      },
      {
        type: "columns",
        title: "Por qué elegir Proactivitis como su partner global",
        columns: [
          {
            title: "Comisiones competitivas",
            items: ["Esquemas de rentabilidad superiores para crecer junto al programa."]
          },
          {
            title: "Gestión white-label",
            items: ["Ofrecemos traslados con marca blanca para personalizar la experiencia bajo su identidad."]
          },
          {
            title: "Soporte 24/7",
            items: ["Línea prioritaria +1 (809) 394-9877 para resolver imprevistos operativos en tiempo real."]
          },
          {
            title: "Inventario verificado",
            items: ["Auditoría global de proveedores garantizando satisfacción del cliente final."]
          }
        ]
      },
      {
        type: "columns",
        title: "Nuestras herramientas para agencias",
        columns: [
          {
            title: "Portal de reservas B2B",
            items: ["Interfaz rápida e intuitiva para reservar traslados y tours en segundos."]
          },
          {
            title: "Confirmación inmediata",
            items: ["El sistema responde en tiempo real para que no pierda ventas esperando cotizaciones manuales."]
          },
          {
            title: "Facturación centralizada",
            items: ["Reportes detallados y administración simplificada de reservas mensuales."]
          }
        ]
      },
      {
        type: "cta",
        title: "Conviértase en agency partner hoy mismo",
        body:
          "Complete nuestro formulario de solicitud B2B o escríbanos directamente a agencies@proactivitis.com y acelere su oferta.",
        primaryLabel: "Solicitar Registro de Agencia",
        primaryHref: "/agency-partners",
        secondaryLabel: "Escribir a agencies@proactivitis.com",
        secondaryHref: "mailto:agencies@proactivitis.com"
      }
    ]
  },  {
    key: "affiliates",
    category: "work-with-us",
    path: "/affiliates",
    title: "Afiliados",
    seoTitle: "Programa de afiliados | Proactivitis",
    seoDescription: "Únase al programa de afiliados de Proactivitis. Gane dinero recomendando los mejores tours y traslados privados a nivel global.",
    hero: {
      eyebrow: "Afiliados",
      title: "Monetice su tráfico con el Líder Global en Experiencias y Traslados",
      subtitle: "Únase al programa de afiliados de Proactivitis y empiece a ganar comisiones por cada reserva realizada a través de sus canales.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "Una propuesta de negocio atractiva",
        body: [
          "Ofrecemos una plataforma tecnológica robusta que convierte su audiencia en ingresos constantes.",
          "La experiencia combina iconografía de crecimiento, dinero/comisión y conectividad global para atraer a audiencias jóvenes."
        ]
      },
      {
        type: "columns",
        title: "Ventajas de ser Afiliado de Proactivitis",
        columns: [
          { title: "Comisiones Elevadas", items: ["Tasas de comisión superiores por cada reserva completada."] },
          { title: "Tecnología de Rastreo", items: ["Cookies de larga duración para asegurar que usted reciba la comisión aún si el cliente reserva después."] },
          { title: "Inventario Global", items: ["Proveedores auditados, siempre listos para satisfacer al viajero exigente."] },
          { title: "Panel en Tiempo Real", items: ["Monitoree clics, conversiones y pagos acumulados con total transparencia."] }
        ]
      },
      {
        type: "columns",
        title: "Cómo funciona nuestro programa",
        columns: [
          { title: "Regístrese Gratuitamente", items: ["Complete la solicitud en menos de 5 minutos."] },
          { title: "Promocione su enlace", items: ["Utilice nuestros banners, widgets o enlaces personalizados en web, redes o newsletters."] },
          { title: "Gane dinero", items: ["Reciba pagos mensuales internacionales. Sin límites de ganancias."] }
        ]
      },
      {
        type: "columns",
        title: "¿Quiénes pueden unirse?",
        columns: [
          { title: "Blogueros y creadores", items: ["Especializados en viajes, lifestyle y experiencias exclusivas."] },
          { title: "Agencias de marketing", items: ["Sitios de reseñas y plataformas enfocadas en turismo internacional."] },
          { title: "Influencers", items: ["Audiencias interesadas en experiencias VIP y movilidad premium."] },
          { title: "Cualquier plataforma digital", items: ["Con foco turístico que busque monetizar tráfico global."] }
        ]
      },
      {
        type: "cta",
        title: "Empiece a ganar hoy mismo",
        body: "Transforme su pasión por los viajes en ingresos profesionales con nuestra infraestructura global. Proactivitis paga con métodos internacionales como PayPal o transferencia.",
        primaryLabel: "Aplicar ahora",
        primaryHref: "/affiliates",
        secondaryLabel: "Consultas por email",
        secondaryHref: "mailto:affiliates@proactivitis.com"
      }
    ]
  },  {
    key: "careers",
    category: "work-with-us",
    path: "/careers",
    title: "Carreras",
    seoTitle: "Carreras y Empleo | Únete al Equipo Global de Proactivitis",
    seoDescription: "Descubra oportunidades profesionales en Proactivitis. Buscamos talento global para revolucionar la industria de los tours y traslados privados.",
    hero: {
      eyebrow: "Carreras",
      title: "Construya el Futuro del Turismo Global con Nosotros",
      subtitle: "Para talento que valora libertad de movimiento y tecnología en una empresa Remote-First.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "Nuestra Cultura: 'People, not Bots'",
        body: [
          "Aunque somos tecnología, nuestro motor es el factor humano: proactividad, transparencia y resolución en un entorno global."
        ]
      },
      {
        type: "columns",
        title: "¿Por qué trabajar en Proactivitis?",
        columns: [
          { title: "Libertad Geográfica", items: ["Trabaje desde cualquier lugar del mundo mientras cumple sus objetivos."] },
          { title: "Impacto Real", items: ["Cada línea de código o alianza impacta la experiencia de miles de viajeros."] },
          { title: "Crecimiento Exponencial", items: ["Crecemos globalmente y su carrera crece con la empresa."] },
          { title: "Entorno Multicultural", items: ["Colabore diariamente con profesionales y partners de diversas culturas."] }
        ]
      },
      {
        type: "columns",
        title: "Áreas de Oportunidad",
        columns: [
          { title: "Tecnología y Desarrollo", items: ["Next.js, bases de datos escalables, seguridad en la nube."] },
          { title: "Operaciones y Calidad", items: ["Auditoría de proveedores y optimización de servicios de traslado."] },
          { title: "Growth & Marketing", items: ["SEO internacional, marketing de afiliados y alianzas estratégicas."] },
          { title: "Soporte Global", items: ["Agentes multilingües enfocados en servicio VIP."] }
        ]
      },
      {
        type: "cta",
        title: "¿Listo para el siguiente paso?",
        body: "Si crees que tu perfil encaja con nuestra visión global, queremos conocerte. Envía tu CV y portafolio a careers@proactivitis.com.",
        primaryLabel: "Ver posiciones abiertas",
        primaryHref: "/careers",
        secondaryLabel: "Enviar candidatura espontánea",
        secondaryHref: "mailto:careers@proactivitis.com"
      }
    ]
  },
  {
    key: "terms",
    category: "legal",
    path: "/legal/terms",
    title: "Términos y Condiciones de Uso",
    seoTitle: "Términos y Condiciones Globales | Proactivitis",
    seoDescription: "Marco legal y condiciones de uso para la plataforma global de experiencias y traslados Proactivitis.",
    hero: {
      eyebrow: "Legal",
      title: "Términos y Condiciones de Uso - Proactivitis",
      subtitle: "Normas de uso para nuestra plataforma tecnológica de experiencias y traslados globales.",
      layout: "standard"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. Relación Contractual",
        body: [
          "Proactivitis actúa exclusivamente como una plataforma tecnológica de intermediación entre usuarios finales y proveedores de servicios.",
          "Al utilizar este sitio, usted reconoce que Proactivitis no es un operador de traslados ni una agencia física, sino un facilitador tecnológico global."
        ]
      },
      {
        type: "legal-section",
        title: "2. Uso de la Plataforma",
        body: [
          "Capacidad Legal: El usuario declara ser mayor de edad y tener capacidad legal para contratar servicios internacionales.",
          "Exactitud de Información: Usted es responsable de la veracidad de los datos de reserva, incluidos horarios de vuelo y contactos."
        ]
      },
      {
        type: "legal-section",
        title: "3. Reservas, Pagos y Fiscalidad Global",
        body: [
          "Procesamiento de Pagos: Proactivitis utiliza pasarelas de pago internacionales seguras. El cargo aparecerá bajo el nombre de la plataforma o su procesador global.",
          "Precios y Divisas: Todos los precios se muestran de forma neta. El usuario es responsable de cualquier tasa o comisión de su entidad bancaria internacional."
        ]
      },
      {
        type: "legal-section",
        title: "4. Políticas de Cancelación y Modificaciones",
        body: [
          "Cada servicio está sujeto a las políticas específicas del proveedor, aceptadas por el usuario al momento de la compra.",
          "Las solicitudes de reembolso se procesan según la política seleccionada y se acreditan al método de pago original."
        ]
      },
      {
        type: "legal-section",
        title: "5. Limitación de Responsabilidad Internacional",
        body: [
          "Servicios de Terceros: Proactivitis no se responsabiliza por lesiones, pérdidas, daños o retrasos de proveedores independientes.",
          "Fuerza Mayor: La plataforma no será responsable por incumplimientos derivados de desastres naturales, conflictos civiles o restricciones gubernamentales globales."
        ]
      },
      {
        type: "legal-section",
        title: "6. Propiedad Intelectual",
        body: [
          "Todo el contenido, marcas y tecnología de Proactivitis son propiedad de la entidad matriz global y están protegidos por leyes internacionales."
        ]
      },
      {
        type: "legal-section",
        title: "7. Resolución de Conflictos",
        body: [
          "Cualquier discrepancia se buscará resolver mediante mediación directa con nuestro equipo de Soporte Global antes de recurrir a instancias legales internacionales."
        ]
      }
    ]
  },  {
    key: "privacy",
    category: "legal",
    path: "/legal/privacy",
    title: "Política de privacidad",
    seoTitle: "Política de Privacidad Global | Proactivitis",
    seoDescription:
      "Conozca cómo Proactivitis protege sus datos a nivel internacional bajo los más altos estándares de seguridad y transparencia.",
    hero: {
      eyebrow: "Legal",
      title: "Política de Privacidad - Proactivitis",
      subtitle: "Compromiso global con la transparencia y protección de sus datos personales.",
      layout: "standard"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. Compromiso de Privacidad Global",
        body: [
          "En Proactivitis, la protección de sus datos personales es una prioridad absoluta.",
          "Esta política describe cómo recopilamos, utilizamos y protegemos su información a través de nuestra plataforma global."
        ]
      },
      {
        type: "legal-section",
        title: "2. Información que Recopilamos",
        body: [
          "Datos de Identificación: nombre, correo electrónico y número de teléfono de contacto internacional.",
          "Datos de Reserva: detalles del vuelo, destino y preferencias de servicio.",
          "Datos de Pago: no almacenamos los datos de su tarjeta; son procesados por proveedores certificados (PCI-DSS)."
        ]
      },
      {
        type: "legal-section",
        title: "3. Uso de la Información",
        body: [
          "Gestionamos y confirmamos sus reservas con los proveedores seleccionados.",
          "Brindamos soporte técnico y asistencia en tiempo real a través de nuestros canales.",
          "Mejoramos la seguridad de la plataforma y prevenimos actividades fraudulentas."
        ]
      },
      {
        type: "legal-section",
        title: "4. Transferencia Internacional de Datos",
        body: [
          "Su información puede ser procesada en servidores ubicados fuera de su país de residencia.",
          "Proactivitis garantiza que todas las transferencias se realizan bajo protocolos de seguridad estrictos."
        ]
      },
      {
        type: "legal-section",
        title: "5. Derechos del Usuario",
        body: [
          "Usted puede acceder, rectificar o eliminar sus datos personales.",
          "Puede retirar su consentimiento para marketing y solicitar una copia de la información que mantenemos."
        ]
      },
      {
        type: "legal-section",
        title: "6. Seguridad de la Información",
        body: [
          "Implementamos medidas técnicas y organizativas avanzadas, incluyendo encriptación SSL y firewalls modernos.",
          "Estas protecciones previenen accesos no autorizados o pérdidas accidentales."
        ]
      },
      {
        type: "legal-section",
        title: "7. Contacto de Privacidad",
        body: [
          "Para consultas relacionadas con sus datos personales, escríbanos a privacy@proactivitis.com."
        ]
      }
    ]
  },
  {
    key: "cookies",
    category: "legal",
    path: "/legal/cookies",
    title: "Cookies",
    seoTitle: "Política de Cookies Global | Proactivitis",
    seoDescription: "Información transparente sobre el uso de cookies en la plataforma internacional Proactivitis para mejorar su experiencia de viaje.",
    hero: {
      eyebrow: "Legal",
      title: "Política de Cookies - Proactivitis",
      subtitle: "Uso internacional de cookies, centrado en el funcionamiento técnico, rendimiento y preferencias sin atarnos a leyes locales.",
      layout: "standard"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. ¿Qué son las Cookies?",
        body: [
          "Las cookies son pequeños archivos de texto que se almacenan en su dispositivo al visitar nuestra plataforma global.",
          "Nos permiten reconocer su navegador, mantener su sesión activa y mejorar su experiencia sin identificarlo personalmente."
        ]
      },
      {
        type: "legal-section",
        title: "2. Tipos de Cookies que utilizamos",
        body: [
          "Cookies Técnicas (Esenciales): indispensables para la navegación, el uso del carrito de reservas y el acceso seguro a su cuenta.",
          "Cookies de Rendimiento y Analítica: nos ayudan a comprender cómo usuarios globales interactúan con la plataforma mediante datos agregados.",
          "Cookies de Preferencias: permiten recordar elecciones como idioma o divisa para futuras visitas."
        ]
      },
      {
        type: "legal-section",
        title: "3. Control de Cookies",
        body: [
          "Usted puede configurar su navegador para bloquear o eliminar las cookies en cualquier momento.",
          "Tenga en cuenta que desactivar las cookies técnicas podría afectar la funcionalidad de ciertos procesos de reserva."
        ]
      },
      {
        type: "legal-section",
        title: "4. Servicios de Terceros",
        body: [
          "Podemos utilizar herramientas de análisis global y procesadores de pago que también dependen de cookies para seguridad y prevención de fraudes.",
          "Estos terceros operan bajo sus propias políticas de privacidad internacionales."
        ]
      },
      {
        type: "legal-section",
        title: "5. Actualizaciones de esta Política",
        body: [
          "Esta política puede actualizarse para reflejar cambios en nuestras herramientas digitales.",
          "Cualquier modificación importante se publicará en esta página."
        ]
      }
    ]
  },  {
    key: "legal-info",
    category: "legal",
    path: "/legal/information",
    title: "Información legal",
    seoTitle: "Información Legal Corporativa | Proactivitis",
    seoDescription: "Detalles legales y términos de identidad de la plataforma global Proactivitis.",
    hero: {
      eyebrow: "Legal",
      title: "Información Legal - Proactivitis",
      subtitle: "Transparencia corporativa sin comprometer la estrategia global.",
      layout: "standard"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. Identidad de la Plataforma",
        body: [
          "Proactivitis es una plataforma tecnológica de servicios turísticos y movilidad global.",
          "Operamos como una entidad digital dedicada a la intermediación técnica entre proveedores locales y viajeros internacionales."
        ]
      },
      {
        type: "legal-section",
        title: "2. Propiedad Intelectual y Marcas",
        body: [
          "Todo el contenido disponible en proactivitis.com es propiedad exclusiva de la entidad matriz global de Proactivitis.",
          "Queda prohibida cualquier reproducción o distribución sin autorización expresa por escrito."
        ]
      },
      {
        type: "legal-section",
        title: "3. Naturaleza del Servicio",
        body: [
          "Intermediación: Proactivitis actúa como un marketplace digital que facilita la contratación de servicios de terceros.",
          "Responsabilidad Operativa: La ejecución de tours, traslados y experiencias corresponde a los proveedores locales independientes, con sus respectivas licencias y seguros internacionales."
        ]
      },
      {
        type: "legal-section",
        title: "4. Cumplimiento Normativo Global",
        body: [
          "Nuestra estructura cumple con los estándares de comercio electrónico internacional, garantizando la seguridad en el procesamiento de datos.",
          "Transparencia total en las transacciones financieras globales."
        ]
      },
      {
        type: "legal-section",
        title: "5. Contacto Corporativo",
        body: [
          "Para notificaciones legales, requerimientos de información o asuntos de propiedad intelectual, escriba a legal@proactivitis.com."
        ]
      }
    ]
  },  {
    key: "terms",
    category: "legal",
    path: "/legal/terms",
    title: "Términos y Condiciones de Uso",
    seoTitle: "Términos y Condiciones Globales | Proactivitis",
    seoDescription: "Marco legal y condiciones de uso para la plataforma global de experiencias y traslados Proactivitis.",
    hero: {
      eyebrow: "Legal",
      title: "Términos y Condiciones de Uso - Proactivitis",
      subtitle: "Normas de uso para nuestra plataforma tecnológica de experiencias y traslados globales.",
      layout: "standard"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. Relación Contractual",
        body: [
          "Proactivitis actúa exclusivamente como una plataforma tecnológica de intermediación entre usuarios finales y proveedores de servicios.",
          "Al utilizar este sitio, usted reconoce que Proactivitis no es un operador de traslados ni una agencia física, sino un facilitador tecnológico global."
        ]
      },
      {
        type: "legal-section",
        title: "2. Uso de la Plataforma",
        body: [
          "Capacidad Legal: El usuario declara ser mayor de edad y tener capacidad legal para contratar servicios internacionales.",
          "Exactitud de Información: Usted es responsable de la veracidad de los datos de reserva, incluidos horarios de vuelo y contactos."
        ]
      },
      {
        type: "legal-section",
        title: "3. Reservas, Pagos y Fiscalidad Global",
        body: [
          "Procesamiento de Pagos: Proactivitis utiliza pasarelas de pago internacionales seguras. El cargo aparecerá bajo el nombre de la plataforma o su procesador global.",
          "Precios y Divisas: Todos los precios se muestran de forma neta. El usuario es responsable de cualquier tasa o comisión de su entidad bancaria internacional."
        ]
      },
      {
        type: "legal-section",
        title: "4. Políticas de Cancelación y Modificaciones",
        body: [
          "Cada servicio está sujeto a las políticas específicas del proveedor, aceptadas por el usuario al momento de la compra.",
          "Las solicitudes de reembolso se procesan según la política seleccionada y se acreditan al método de pago original."
        ]
      },
      {
        type: "legal-section",
        title: "5. Limitación de Responsabilidad Internacional",
        body: [
          "Servicios de Terceros: Proactivitis no se responsabiliza por lesiones, pérdidas, daños o retrasos de proveedores independientes.",
          "Fuerza Mayor: La plataforma no será responsable por incumplimientos derivados de desastres naturales, conflictos civiles o restricciones gubernamentales globales."
        ]
      },
      {
        type: "legal-section",
        title: "6. Propiedad Intelectual",
        body: [
          "Todo el contenido, marcas y tecnología de Proactivitis son propiedad de la entidad matriz global y están protegidos por leyes internacionales."
        ]
      },
      {
        type: "legal-section",
        title: "7. Resolución de Conflictos",
        body: [
          "Cualquier discrepancia se buscará resolver mediante mediación directa con nuestro equipo de Soporte Global antes de recurrir a instancias legales internacionales."
        ]
      }
    ]
  },  {
    key: "privacy",
    category: "legal",
    path: "/legal/privacy",
    title: "Política de privacidad",
    seoTitle: "Política de Privacidad Global | Proactivitis",
    seoDescription:
      "Conozca cómo Proactivitis protege sus datos a nivel internacional bajo los más altos estándares de seguridad y transparencia.",
    hero: {
      eyebrow: "Legal",
      title: "Política de Privacidad - Proactivitis",
      subtitle: "Compromiso global con la transparencia y protección de sus datos personales.",
      layout: "standard"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. Compromiso de Privacidad Global",
        body: [
          "En Proactivitis, la protección de sus datos personales es una prioridad absoluta.",
          "Esta política describe cómo recopilamos, utilizamos y protegemos su información a través de nuestra plataforma global."
        ]
      },
      {
        type: "legal-section",
        title: "2. Información que Recopilamos",
        body: [
          "Datos de Identificación: nombre, correo electrónico y número de teléfono de contacto internacional.",
          "Datos de Reserva: detalles del vuelo, destino y preferencias de servicio.",
          "Datos de Pago: no almacenamos los datos de su tarjeta; son procesados por proveedores certificados (PCI-DSS)."
        ]
      },
      {
        type: "legal-section",
        title: "3. Uso de la Información",
        body: [
          "Gestionamos y confirmamos sus reservas con los proveedores seleccionados.",
          "Brindamos soporte técnico y asistencia en tiempo real a través de nuestros canales.",
          "Mejoramos la seguridad de la plataforma y prevenimos actividades fraudulentas."
        ]
      },
      {
        type: "legal-section",
        title: "4. Transferencia Internacional de Datos",
        body: [
          "Su información puede ser procesada en servidores ubicados fuera de su país de residencia.",
          "Proactivitis garantiza que todas las transferencias se realizan bajo protocolos de seguridad estrictos."
        ]
      },
      {
        type: "legal-section",
        title: "5. Derechos del Usuario",
        body: [
          "Usted puede acceder, rectificar o eliminar sus datos personales.",
          "Puede retirar su consentimiento para marketing y solicitar una copia de la información que mantenemos."
        ]
      },
      {
        type: "legal-section",
        title: "6. Seguridad de la Información",
        body: [
          "Implementamos medidas técnicas y organizativas avanzadas, incluyendo encriptación SSL y firewalls modernos.",
          "Estas protecciones previenen accesos no autorizados o pérdidas accidentales."
        ]
      },
      {
        type: "legal-section",
        title: "7. Contacto de Privacidad",
        body: [
          "Para consultas relacionadas con sus datos personales, escríbanos a privacy@proactivitis.com."
        ]
      }
    ]
  },
  {
    key: "cookies",
    category: "legal",
    path: "/legal/cookies",
    title: "Cookies",
    seoTitle: "Política de Cookies Global | Proactivitis",
    seoDescription: "Información transparente sobre el uso de cookies en la plataforma internacional Proactivitis para mejorar su experiencia de viaje.",
    hero: {
      eyebrow: "Legal",
      title: "Política de Cookies - Proactivitis",
      subtitle: "Uso internacional de cookies, centrado en el funcionamiento técnico, rendimiento y preferencias sin atarnos a leyes locales.",
      layout: "standard"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. ¿Qué son las Cookies?",
        body: [
          "Las cookies son pequeños archivos de texto que se almacenan en su dispositivo al visitar nuestra plataforma global.",
          "Nos permiten reconocer su navegador, mantener su sesión activa y mejorar su experiencia sin identificarlo personalmente."
        ]
      },
      {
        type: "legal-section",
        title: "2. Tipos de Cookies que utilizamos",
        body: [
          "Cookies Técnicas (Esenciales): indispensables para la navegación, el uso del carrito de reservas y el acceso seguro a su cuenta.",
          "Cookies de Rendimiento y Analítica: nos ayudan a comprender cómo usuarios globales interactúan con la plataforma mediante datos agregados.",
          "Cookies de Preferencias: permiten recordar elecciones como idioma o divisa para futuras visitas."
        ]
      },
      {
        type: "legal-section",
        title: "3. Control de Cookies",
        body: [
          "Usted puede configurar su navegador para bloquear o eliminar las cookies en cualquier momento.",
          "Tenga en cuenta que desactivar las cookies técnicas podría afectar la funcionalidad de ciertos procesos de reserva."
        ]
      },
      {
        type: "legal-section",
        title: "4. Servicios de Terceros",
        body: [
          "Podemos utilizar herramientas de análisis global y procesadores de pago que también dependen de cookies para seguridad y prevención de fraudes.",
          "Estos terceros operan bajo sus propias políticas de privacidad internacionales."
        ]
      },
      {
        type: "legal-section",
        title: "5. Actualizaciones de esta Política",
        body: [
          "Esta política puede actualizarse para reflejar cambios en nuestras herramientas digitales.",
          "Cualquier modificación importante se publicará en esta página."
        ]
      }
    ]
  },  {
    key: "legal-info",
    category: "legal",
    path: "/legal/information",
    title: "Información legal",
    seoTitle: "Información legal | Proactivitis",
    seoDescription: "Datos legales y corporativos de Proactivitis.",
    hero: {
      eyebrow: "Legal",
      title: "Información legal",
      subtitle: "Detalles corporativos y regulatorios de Proactivitis.",
      layout: "narrow"
    },
    sections: [
      {
        type: "text",
        title: "Datos de la empresa",
        body: [
          "Proactivitis es operada por Owen Dominicanproactivitis Limited.",
          "Registrada como empresa en Estados Unidos mediante Stripe Atlas (jurisdicción y número de registro se añadirán aquí)."
        ]
      },
      {
        type: "text",
        title: "Contacto legal",
        body: ["Para correspondencia legal, avisos y consultas regulatorias, escribe a legal@proactivitis.com."]
      }
    ]
  }
];
