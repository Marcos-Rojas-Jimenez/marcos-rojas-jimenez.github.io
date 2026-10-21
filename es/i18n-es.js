/* Spanish texts for main.js. Loaded only by /es/ before main.js.
   Card details are keyed by each card's <h3> heading on the Spanish page. */
window.PORTFOLIO_I18N = {
  cvPath: "assets/cv/marcos-rojas-jimenez-cv-es.pdf",

  ui: {
    bootTip: "[ TIP ] Para una mejor experiencia, abre este portfolio en un ordenador",
    bootWelcome: "> acceso concedido — bienvenido",
    backToTop: "Volver arriba",
    sideDots: "Navegación rápida por secciones",
    certViewer: "Visor de certificados",
    paletteLabel: "Paleta de comandos",
    palettePlaceholder: "Escribe un comando o busca...",
    paletteSearch: "Buscar comandos",
    paletteEmpty: "No hay comandos que coincidan",
    kbdNavigate: "navegar",
    kbdRun: "ejecutar",
    kbdClose: "cerrar",
    cardDetails: "Detalle de la tarjeta",
    close: "Cerrar",
    moreSoon: "Pronto habrá más detalle."
  },

  roles: [
    "Analista SOC L1 · en formación",
    "Blue Team Junior",
    "Seguridad del correo · SPF / DKIM / DMARC"
  ],

  palette: {
    "Go to About": "Ir a Sobre mí",
    "Go to Skills": "Ir a Habilidades",
    "Go to Projects": "Ir a Proyectos",
    "Go to Training": "Ir a Formación",
    "Go to Certifications": "Ir a Certificaciones",
    "Go to Contact": "Ir a Contacto",
    "Download CV": "Descargar CV",
    "Open featured case study": "Abrir el caso de estudio destacado",
    "Open LinkedIn": "Abrir LinkedIn",
    "Email me": "Enviarme un email",
    "Enter the matrix": "Entrar en Matrix"
  },

  details: {
    "Base técnica": {
      kicker: "Fundamentos",
      lead: "Un perfil centrado en ciberseguridad: la seguridad defensiva es el foco, apoyada en una base sólida de redes y sistemas.",
      sections: [
        {
          title: "De dónde viene",
          items: [
            "<strong>Especialización en ciberseguridad</strong> (2025–2026, DigitechFP): gestión de incidentes, análisis forense, bastionado, puesta en producción segura y hacking ético — el núcleo de mi perfil.",
            "<strong>Formación continua en ciberseguridad:</strong> ruta SOC Analyst L1 de TryHackMe, aprendizaje Blue Team y el laboratorio PhisDefense.",
            "<strong>Técnico Superior en Sistemas de Telecomunicaciones e Informáticos</strong> (2022–2024): la base de redes e infraestructura que lo sostiene todo."
          ]
        },
        {
          title: "Hábitos de trabajo que me dejó",
          items: [
            "Aislamiento metódico de fallos: reproducir, acotar y confirmar la causa raíz.",
            "Documentación técnica e informes de incidentes claros que otro analista puede seguir.",
            "Soltura en la línea de comandos de Linux y Windows y leyendo logs."
          ]
        }
      ],
      close: "La misma disciplina que sirve para diagnosticar una red caída se aplica directamente al triaje de alertas SOC y al manejo de evidencias.",
      tags: ["Redes", "Linux", "Windows", "Resolución de incidencias", "Documentación"]
    },

    "Enfoque en ciberseguridad": {
      kicker: "Seguridad defensiva",
      lead: "Centrado en el lado Blue Team de las operaciones de seguridad: monitorización, detección y defensa del correo, siempre respaldado por evidencias.",
      sections: [
        {
          title: "Monitorización y detección",
          items: [
            "Leer y correlacionar logs de varios sistemas para reconstruir qué ha pasado.",
            "Triaje de alertas: priorizar por severidad, confirmar verdaderos positivos y descartar ruido.",
            "Fundamentos de respuesta a incidentes: contener, investigar, documentar y aprender."
          ]
        },
        {
          title: "Seguridad del correo (mi punto fuerte)",
          items: [
            "SPF, DKIM y una política DMARC progresiva llevada hasta <strong>p=reject</strong>.",
            "Suplantación (spoofing) simulada y bloqueo demostrado con respuestas SMTP y logs.",
            "Todo validado en un VPS Ubuntu real, no en una presentación."
          ]
        }
      ],
      close: "Mi principio de trabajo: un control que no está probado y documentado no cuenta como control.",
      tags: ["SOC", "Blue Team", "Análisis de logs", "Seguridad del correo", "Detección"]
    },

    "Objetivo profesional": {
      kicker: "Hacia dónde voy",
      lead: "Busco activamente mi primer puesto junior en seguridad defensiva, donde pueda aportar desde el primer día y seguir creciendo rápido.",
      sections: [
        {
          title: "Puestos que busco",
          items: [
            "Operaciones IAM junior · Analista SOC L1 · Analista de ciberseguridad junior · Blue Team junior.",
            "Ubicación: Albacete, resto de España o 100% remoto."
          ]
        },
        {
          title: "Lo que ya puedo hacer",
          items: [
            "Triaje de alertas y análisis de logs sobre eventos de seguridad reales.",
            "Configuración y validación de seguridad del correo (SPF / DKIM / DMARC).",
            "Convertir eventos en bruto en datasets saneados y dashboards legibles.",
            "Redactar documentación de incidentes clara y basada en evidencias."
          ]
        }
      ],
      close: "Ahora mismo avanzo en la ruta SOC Analyst L1 y preparo BTL1 para profundizar en investigación.",
      tags: ["Analista SOC L1", "Operaciones IAM", "Blue Team", "Respuesta a incidentes", "Remoto / España"]
    },

    "Gestión de Identidades y Accesos (IAM)": {
      kicker: "01 · Foco actual",
      lead: "Operaciones IAM prácticas contra un proveedor de identidad real: el núcleo del IAM Operations & CyberIAM Monitoring Lab.",
      sections: [
        {
          title: "Identidad y SSO",
          items: [
            "<strong>Keycloak:</strong> realm dedicado (iam-ops-lab), cliente OIDC confidencial, usuarios y asignación de roles.",
            "<strong>OpenID Connect:</strong> Authorization Code Flow completo — login, validación del callback, rutas protegidas y logout iniciado por la aplicación.",
            "<strong>RBAC:</strong> cuatro roles de laboratorio (user, admin, auditor, support) validados de extremo a extremo, filtrando los roles técnicos en la interfaz.",
            "<strong>OAuth2 / SAML / MFA:</strong> base conceptual sobre tokens, claims, federación y factores de autenticación."
          ]
        },
        {
          title: "Operaciones IAM",
          items: [
            "<strong>Inventario de identidades:</strong> exportación de usuarios y roles mediante la Admin REST API de Keycloak.",
            "<strong>Revisión de cuentas privilegiadas:</strong> detección y marcado automático de quien tiene rol admin.",
            "<strong>Cumplimiento de roles:</strong> control de usuarios sin rol de laboratorio para mantener la higiene RBAC.",
            "<strong>Monitorización de eventos IAM:</strong> logins, logins fallidos y eventos de administración normalizados con severidad."
          ]
        }
      ],
      close: "Todo está demostrado en el laboratorio IAM: 4 usuarios, 4 roles, 1 cuenta privilegiada detectada, 10 eventos IAM normalizados y un dashboard CyberIAM en Streamlit que lee las evidencias.",
      tags: ["Keycloak", "OpenID Connect", "RBAC", "SSO", "Accesos privilegiados", "Admin REST API", "Eventos IAM"]
    },

    "Operaciones de Seguridad": {
      kicker: "02 · Disciplina principal",
      lead: "Detectar, priorizar e investigar eventos de seguridad con mentalidad defensiva: el día a día de un analista SOC.",
      sections: [
        {
          title: "Qué incluye",
          items: [
            "<strong>Triaje de alertas:</strong> priorizar por severidad, confirmar verdaderos positivos y quitar ruido.",
            "<strong>Análisis de logs y eventos:</strong> seguir un incidente a través de syslog, respuestas SMTP, flujos de eventos IAM y dashboards.",
            "<strong>Detección de amenazas:</strong> reconocer suplantación, abuso de SMTP, sondeos de open relay y fallos de autenticación.",
            "<strong>Revisión de logins fallidos y eventos de administración:</strong> errores de autenticación y cambios en el realm listos para revisión.",
            "<strong>Fundamentos de SIEM y conceptos ITIL:</strong> agregación, correlación y gestión de cambios, eventos e incidentes.",
            "<strong>Respuesta a incidentes básica:</strong> contener, documentar e informar."
          ]
        }
      ],
      close: "Aplicado de verdad en ambos laboratorios: 190 eventos SOC procesados en PhisDefense y un pipeline de eventos IAM normalizado y clasificado por severidad en el laboratorio de Keycloak.",
      tags: ["Triaje de alertas", "Análisis de logs", "Detección de amenazas", "SIEM", "Manejo de evidencias", "ITIL", "Respuesta a incidentes"]
    },

    "Seguridad del Correo Electrónico": {
      kicker: "03 · Mi especialidad",
      lead: "Una plataforma de correo defensiva completa, diseñada, desplegada y validada en un VPS Ubuntu real: el núcleo del proyecto PhisDefense.",
      sections: [
        {
          title: "Autenticación",
          items: [
            "SPF probado tanto en condiciones de pass como de fail.",
            "DKIM validado con firmas válidas, rotas y ausentes, más una rotación real del selector a <strong>s2026</strong>.",
            "Política DMARC endurecida paso a paso hasta <strong>p=reject</strong>, rechazando la suplantación externa."
          ]
        },
        {
          title: "Transporte e informes",
          items: [
            "DNSSEC, MTA-STS y TLS-RPT documentados y activos.",
            "STARTTLS en SMTP e IMAPS con TLS para el transporte cifrado.",
            "Estado de los informes visible en el dashboard SOC."
          ]
        },
        {
          title: "La plataforma",
          items: [
            "Postfix (SMTP), Dovecot (IMAPS), OpenDKIM, OpenDMARC y OpenARC.",
            "Syslog como única fuente de evidencia técnica."
          ]
        }
      ],
      tags: ["SPF", "DKIM", "DMARC p=reject", "DNSSEC", "MTA-STS", "TLS-RPT", "Postfix", "Dovecot"]
    },

    "Sistemas y Redes": {
      kicker: "04 · Base de infraestructura",
      lead: "Los conocimientos de sistemas y redes que sostienen un buen trabajo defensivo: no puedes proteger un tráfico que no entiendes.",
      sections: [
        {
          title: "Redes",
          items: [
            "Modelo TCP/IP, direccionamiento y subnetting.",
            "Fundamentos de DNS, DHCP, enrutamiento y conmutación.",
            "Conceptos de firewall y resolución de problemas de red."
          ]
        },
        {
          title: "Sistemas",
          items: [
            "Administración de Linux y Windows.",
            "Configuración segura de servicios y TLS.",
            "Diagnóstico estructurado capa por capa, de la red a la aplicación."
          ]
        }
      ],
      tags: ["Linux", "Windows", "TCP/IP", "DNS", "DHCP", "Enrutamiento", "Firewalls", "TLS"]
    },

    "Automatización, Dashboards e Informes": {
      kicker: "05 · Multiplicador",
      lead: "Convertir datos de seguridad en bruto en evidencias legibles y automatización repetible, en lugar de trabajo manual propenso a errores.",
      sections: [
        {
          title: "Scripting y APIs",
          items: [
            "Python para parseo, enriquecimiento y tareas repetitivas; nociones de Bash y PowerShell.",
            "<strong>Automatización con REST API:</strong> inventario de identidades, detección de cuentas privilegiadas y extracción de eventos con la Admin REST API de Keycloak.",
            "pandas, procesado de CSV/JSON y normalización de datos para obtener datasets saneados.",
            "Informes en Markdown: informe diario consolidado de operaciones IAM."
          ]
        },
        {
          title: "Dashboards y publicación",
          items: [
            "<strong>Streamlit + pandas + Altair:</strong> la consola de operaciones IAM/CyberIAM (KPIs, revisiones, índice de evidencias).",
            "<strong>Python/Dash + Plotly:</strong> el dashboard SOC de PhisDefense (KPIs, categorías de eventos, seguridad SMTP).",
            "Publicados con Git, GitHub Pages y Render como casos de estudio públicos."
          ]
        }
      ],
      close: "En ambos laboratorios esto convirtió logs en bruto y exportaciones de API en dashboards e informes que un revisor puede leer de verdad.",
      tags: ["Python", "PowerShell", "REST APIs", "pandas", "Streamlit", "Altair", "Dash", "Git"]
    },

    "Metodología de Seguridad": {
      kicker: "06 · Cómo trabajo",
      lead: "Un método repetible y basado en evidencias que aplico a cada tarea: el hábito que une todas las habilidades técnicas.",
      sections: [
        {
          title: "El método",
          items: [
            "<strong>Validar, no suponer:</strong> probar cada control y guardar la prueba.",
            "<strong>Documentarlo todo:</strong> documentación técnica e informes de incidentes claros.",
            "<strong>Tratar los datos con responsabilidad:</strong> sanear antes de publicar nada — sin claves, credenciales, logs en bruto ni IPs sensibles.",
            "<strong>Tener presente el riesgo:</strong> detección de anomalías y diagnóstico de fallos integrados en el proceso."
          ]
        }
      ],
      close: "Por eso el caso de estudio público de PhisDefense solo contiene datasets y evidencias saneados.",
      tags: ["Documentación técnica", "Informes de incidentes", "Validación defensiva", "Saneamiento de datos", "Gestión del riesgo"]
    },

    "Máster Profesional en Ciberseguridad en Entornos de las Tecnologías de la Información": {
      kicker: "Oct 2025 – Jun 2026 · DigitechFP (Barcelona, a distancia)",
      lead: "Curso de especialización oficial — <strong>Curso de Especialización en Ciberseguridad en Entornos de las Tecnologías de la Información</strong> (Real Decreto 479/2020) — superado con una nota final de <strong>7,35</strong>.",
      modules: [
        { code: "5021", name: "Incidentes de ciberseguridad", hours: 99, grade: 7 },
        { code: "5022", name: "Fortalecimiento de redes y sistemas", hours: 132, grade: 8 },
        { code: "5023", name: "Puesta en producción segura", hours: 99, grade: 8 },
        { code: "5024", name: "Análisis forense informático", hours: 99, grade: 8 },
        { code: "5025", name: "Hacking ético", hours: 99, grade: 5 },
        { code: "5026", name: "Normativa de ciberseguridad", hours: 66, grade: 8 },
        { code: "C087", name: "Proyecto de ciberseguridad en entornos de las TI", hours: 126, grade: 8 }
      ],
      sections: [
        {
          title: "Qué aporta cada módulo",
          items: [
            "<strong>Gestión de incidentes:</strong> detectar, responder y documentar incidentes de seguridad.",
            "<strong>Bastionado de redes y sistemas:</strong> configuración segura y defensa en profundidad.",
            "<strong>Puesta en producción segura:</strong> desplegar software y servicios de forma segura (SDLC seguro, nociones de DevSecOps).",
            "<strong>Análisis forense:</strong> adquisición y análisis de evidencias y cadena de custodia.",
            "<strong>Hacking ético:</strong> técnicas ofensivas entendidas desde el punto de vista del defensor.",
            "<strong>Normativa:</strong> RGPD/LOPDGDD, ENS y el marco legal de la seguridad."
          ]
        }
      ],
      close: "El proyecto final (C087) se convirtió en el PhisDefense SOC & Email Security Lab.",
      tags: ["Respuesta a incidentes", "Bastionado", "Forense", "Puesta en producción segura", "Hacking ético", "Cumplimiento normativo"]
    },

    "Técnico Superior en Sistemas de Telecomunicaciones e Informáticos": {
      kicker: "Sep 2022 – Jun 2024 · IES Universidad Laboral",
      lead: "<strong>Técnico Superior en Sistemas de Telecomunicaciones e Informáticos</strong> (Real Decreto 883/2011): la base técnica que da solidez al trabajo de seguridad.",
      sections: [
        {
          title: "Módulos principales del ciclo",
          items: [
            "Sistemas informáticos y redes locales.",
            "Redes telemáticas.",
            "Configuración de infraestructuras de sistemas de telecomunicaciones.",
            "Elementos y técnicas/procesos en infraestructuras de telecomunicaciones.",
            "Sistemas de radiocomunicaciones y de telefonía fija y móvil.",
            "Sistemas de producción audiovisual e integrados / hogar digital.",
            "Gestión de proyectos de instalaciones de telecomunicaciones."
          ]
        },
        {
          title: "Lo que me llevé a la seguridad",
          items: [
            "Comprensión real de redes, conectividad e infraestructura.",
            "Instalación, configuración, mantenimiento y resolución de averías en la práctica.",
            "Gestión de proyectos y documentación técnica estructurada."
          ]
        }
      ],
      tags: ["Redes", "TCP/IP", "Infraestructura", "Radiocomunicaciones", "Telefonía", "Gestión de proyectos"]
    },

    "Experiencia profesional": {
      kicker: "Experiencia transferible",
      lead: "Habilidades de puestos técnicos anteriores que encajan directamente con el trabajo en un SOC: la capacidad analítica detrás del conocimiento de seguridad.",
      sections: [
        {
          title: "Qué se traslada a un SOC",
          items: [
            "<strong>Detección de anomalías:</strong> ver lo que se desvía de un comportamiento normal conocido.",
            "<strong>Diagnóstico de fallos:</strong> aislar la causa raíz rápido y bajo presión.",
            "<strong>Informes estructurados:</strong> informes basados en evidencias sobre los que otros pueden actuar.",
            "<strong>Control de calidad:</strong> verificación metódica y atención al detalle."
          ]
        }
      ],
      close: "Un analista SOC hace exactamente esto cada día, solo que con eventos de seguridad en lugar de averías técnicas.",
      tags: ["Detección de anomalías", "Diagnóstico de fallos", "Informes", "Documentación", "Atención al detalle"]
    },

    "Certificaciones y laboratorios prácticos": {
      kicker: "Aprendizaje continuo",
      lead: "Una ruta activa redes → SOC → Blue Team que combina certificaciones reconocidas con práctica constante en laboratorios.",
      sections: [
        {
          title: "Progreso",
          items: [
            "<strong>Completada:</strong> CCNA — Introduction to Networks (Cisco Networking Academy).",
            "<strong>En curso:</strong> ruta SOC Analyst Level 1 de TryHackMe.",
            "<strong>Prevista:</strong> Blue Team Level 1 (BTL1)."
          ]
        },
        {
          title: "Práctica continua",
          items: [
            "Laboratorios prácticos habituales en entornos reales y simulados.",
            "Ejercicios de monitorización de seguridad y detección.",
            "Construcción y documentación de laboratorios propios como PhisDefense."
          ]
        }
      ],
      tags: ["CCNA ITN", "SOC Analyst L1", "Ruta BTL1", "Laboratorios prácticos", "Monitorización de seguridad"]
    },

    "CCNA: Introduction to Networks": {
      kicker: "Completada · Cisco Networking Academy",
      lead: "El primer curso del CCNA: los fundamentos de redes que todo defensor necesita antes de poder proteger el tráfico.",
      sections: [
        {
          title: "Qué cubre",
          items: [
            "Los modelos TCP/IP y OSI y cómo viajan realmente los datos.",
            "Direccionamiento IPv4/IPv6 y subnetting.",
            "Ethernet, conmutación y conceptos básicos de enrutamiento.",
            "Montaje y resolución de problemas de una red pequeña, en la práctica."
          ]
        }
      ],
      close: "Por qué importa en seguridad: no puedes defender, monitorizar ni investigar un tráfico que no entiendes del todo.",
      tags: ["TCP/IP", "OSI", "Subnetting", "Enrutamiento", "Conmutación", "Resolución de problemas"]
    },

    "SOC Analyst Level 1": {
      kicker: "En curso · TryHackMe",
      lead: "Una ruta práctica de analista SOC centrada en las habilidades que un analista de nivel 1 usa desde el primer día.",
      sections: [
        {
          title: "Áreas principales",
          items: [
            "Fundamentos de SOC y flujo de trabajo del analista.",
            "Triaje de alertas y análisis de logs con datos realistas.",
            "Conceptos de SIEM, inteligencia de amenazas y monitorización de seguridad de red.",
            "Nociones de análisis de endpoints y de phishing."
          ]
        }
      ],
      close: "Refuerza directamente el trabajo de monitorización y triaje ya demostrado en PhisDefense.",
      tags: ["Fundamentos SOC", "Triaje de alertas", "Análisis de logs", "SIEM", "Threat intel", "Blue Team"]
    },

    "Blue Team Level 1": {
      kicker: "Prevista · Security Blue Team (BTL1)",
      lead: "Una certificación Blue Team reconocida y totalmente práctica: el siguiente hito en la ruta defensiva.",
      sections: [
        {
          title: "Dominios que valida",
          items: [
            "Análisis de phishing e investigación de amenazas por correo.",
            "SIEM: construir consultas y buscar en logs.",
            "Metodología de respuesta a incidentes de principio a fin.",
            "Análisis forense digital e inteligencia de amenazas.",
            "Fundamentos de operaciones de seguridad."
          ]
        }
      ],
      close: "Se evalúa con un examen práctico de 24 horas en un laboratorio: prueba de capacidad real de investigación, no solo teoría. Encaja de forma natural con el trabajo SOC y de seguridad del correo ya hecho.",
      tags: ["Análisis de phishing", "SIEM", "Respuesta a incidentes", "Forense", "Threat intel"]
    }
  }
};
