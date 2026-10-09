import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import SplitText from "../Animacion/SplitText";
import ScrollReveal from "../Animacion/ScrollReveal";
import dashboardImg from "../assets/images/Hero.png";
import dashboard from "../assets/images/dashboard.png";
import modulo from "../assets/images/modulo.png";
import logoGSEA from "../assets/images/logo-gsea.png";
import caosImg from "../assets/images/singsea.png";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  Check,
  ChevronRight,
  FileSpreadsheet,
  Mail,
  Menu,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";
import "./css/Landig.css";

const features = [
  {
    icon: UserRoundPlus,
    title: "Prospectos",
    text: "Captura y organiza cada oportunidad.",
  },
  {
    icon: FileSpreadsheet,
    title: "Cotizaciones",
    text: "Crea y consulta propuestas en minutos.",
  },
  {
    icon: CalendarCheck2,
    title: "Seguimiento",
    text: "Mantén actividades y tareas al día.",
  },
  {
    icon: UsersRound,
    title: "Agentes",
    text: "Gestiona el avance de todo tu equipo.",
  },
  {
    icon: BarChart3,
    title: "Reportes",
    text: "Mide resultados y toma mejores decisiones.",
  },
];

const plans = [
  {
    name: "Inicial",
    description: "Para promotorías que comienzan a digitalizar su operación.",
    price: "$699",
    unit: "MXN por agente / mes",
    features: [
      "Hasta 3 agentes",
      "Prospectos y cotizaciones",
      "Seguimiento de actividades",
      "Reportes básicos",
    ],
  },
  {
    name: "Profesional",
    description: "Para equipos que necesitan crecer con mayor control.",
    price: "$1,299",
    unit: "MXN por agente / mes",
    features: [
      "Agentes ilimitados",
      "Automatizaciones básicas",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
    popular: true,
  },
  {
    name: "Corporativo",
    description: "Para operaciones grandes con necesidades específicas.",
    price: "$2,499",
    unit: "MXN por agente / mes",
    features: [
      "Todo lo del plan Profesional",
      "Personalizaciones",
      "Integraciones avanzadas",
      "Soporte dedicado",
    ],
  },
];

const GSeaLanding = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");
  const [demoForm, setDemoForm] = useState({
    nombre_completo: "",
    correo: "",
    telefono: "",
    promotoria: "",
    necesidades: "",
  });
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState("");
  const [demoError, setDemoError] = useState("");

  const closeMenu = () => setMenuOpen(false);

  const handleHeroLead = (event) => {
    event.preventDefault();
    document.querySelector("#precios")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDemoChange = (event) => {
    const { name, value } = event.target;
    setDemoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDemoSubmit = async (event) => {
    event.preventDefault();
    setDemoLoading(true);
    setDemoSuccess("");
    setDemoError("");

    try {
      const parsedPhone = parsePhoneNumber(demoForm.telefono);

      if (!parsedPhone) {
        throw new Error("Ingresa un número de teléfono válido.");
      }

      const payload = {
        nombre_completo: demoForm.nombre_completo,
        correo: demoForm.correo,
        codigo_pais: `+${parsedPhone.countryCallingCode}`,
        telefono: parsedPhone.nationalNumber,
        promotoria: demoForm.promotoria,
        necesidades: demoForm.necesidades,
      };

      const apiBase = (import.meta.env.VITE_API_URL || "http://localhost/api").replace(/\/$/, "");
      const response = await fetch(`${apiBase}/demo-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const firstValidationError = data.errors
          ? Object.values(data.errors).flat()[0]
          : null;
        throw new Error(firstValidationError || data.message || "No se pudo enviar la solicitud.");
      }

      setDemoSuccess("¡Solicitud enviada correctamente!");
      setDemoForm({
        nombre_completo: "",
        correo: "",
        telefono: "",
        promotoria: "",
        necesidades: "",
      });
    } catch (error) {
      console.error("Error al solicitar demo:", error);
      setDemoError(error.message || "Ocurrió un error al enviar tu solicitud.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="gsea-page">
      <header className="gsea-header">
        <div className="gsea-container gsea-header__inner">
          <a href="#inicio" className="gsea-brand" aria-label="Ir al inicio">
            <img src={logoGSEA} alt="G-SEA" />
          </a>

          <nav className="gsea-nav" aria-label="Navegación principal">
            <a href="#inicio">Inicio</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#precios">Precios</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <div className="gsea-header__actions">
            <Link to="/register" className="gsea-login">
              Iniciar sesión
            </Link>
            <a href="#contacto" className="gsea-button gsea-button--small">
              Solicitar demo
            </a>
            <button
              type="button"
              className="gsea-menu-button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div className={`gsea-mobile-menu ${menuOpen ? "is-open" : ""}`}>
          <a href="#inicio" onClick={closeMenu}>Inicio</a>
          <a href="#funcionalidades" onClick={closeMenu}>Funcionalidades</a>
          <a href="#precios" onClick={closeMenu}>Precios</a>
          <a href="#contacto" onClick={closeMenu}>Contacto</a>
          <Link to="/login" onClick={closeMenu}>Iniciar sesión</Link>
          <a href="#contacto" className="gsea-button" onClick={closeMenu}>Solicitar demo</a>
        </div>
      </header>

      <main>
        <section id="inicio" className="gsea-hero">
          <div className="gsea-hero__glow gsea-hero__glow--one" />
          <div className="gsea-hero__glow gsea-hero__glow--two" />

          <div className="gsea-container gsea-hero__grid">
            <ScrollReveal baseOpacity={0} translateX={-50} duration={1}>
              <div className="gsea-hero__copy">
                <span className="gsea-eyebrow">CRM para promotorías de seguros</span>

                <TitleReveal
                  as="h1"
                  className="gsea-hero__title"
                  aria-label="No pierdas ventas por el caos comercial"
                  delay={120}
                >
                  <span className="gsea-hero__title-line">No pierdas ventas</span>
                  <span className="gsea-hero__title-line">por el caos</span>
                  <span className="gsea-hero__title-line gsea-hero__title-line--accent">comercial.</span>
                </TitleReveal>

                <p className="gsea-hero__text">
                  Centraliza prospectos, cotizaciones, seguimiento, agentes y
                  resultados en un solo lugar. Vende más y trabaja con mayor control.
                </p>

                <form className="gsea-hero-lead" onSubmit={handleHeroLead}>
                  <label htmlFor="hero-email" className="sr-only">Correo electrónico</label>
                  <input
                    id="hero-email"
                    type="email"
                    value={heroEmail}
                    onChange={(event) => setHeroEmail(event.target.value)}
                    placeholder="Tu correo corporativo"
                    required
                  />
                  <button type="submit">
                    Solicitar demo <ArrowRight size={18} />
                  </button>
                </form>

                <div className="gsea-hero__benefits">
                  <Benefit icon={TrendingUp} text="Más visibilidad comercial" />
                  <Benefit icon={UsersRound} text="Equipos más productivos" />
                  
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal baseOpacity={0} translateX={70} duration={1.15}>
              <div className="gsea-hero__visual floating">
                <div className="gsea-product-frame">
                  <div className="gsea-product-frame__bar">
                    <span /><span /><span />
                  </div>
                  <img src={modulo} alt="Vista del dashboard de G-SEA" />
                </div>

                <FloatingMetric className="metric-one" value="+48" label="Nuevos prospectos" />
                <FloatingMetric className="metric-two" value="+72" label="Cotizaciones" />
                <FloatingMetric className="metric-three" value="24%" label="Conversión" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section id="funcionalidades" className="gsea-features-section">
          <div className="gsea-container">
            <ScrollReveal translateY={35} duration={0.9}>
              <div className="gsea-section-heading gsea-section-heading--center">
                <span className="gsea-kicker">Una sola plataforma</span>
                <TitleReveal as="h2">
                  Todo lo que tu promotoría necesita para vender mejor
                </TitleReveal>
              </div>
            </ScrollReveal>

            <div className="gsea-features-grid">
              {features.map((feature, index) => (
                <ScrollReveal key={feature.title} translateY={35} delay={index * 0.08} duration={0.75}>
                  <FeatureCard {...feature} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="gsea-chaos-section">
          <div className="gsea-container gsea-chaos-grid">
            <ScrollReveal baseOpacity={0} translateX={-60} duration={1}>
              <div className="gsea-chaos-copy">
                <span className="gsea-kicker">Antes de G-SEA</span>
                <TitleReveal as="h2" className="gsea-chaos-title">
                  <span>Menos caos.</span>
                  <span>Más control.</span>
                  <span className="gsea-chaos-title__accent">Más ventas.</span>
                </TitleReveal>
                <p>
                  Cuando todo vive entre <strong>Excel, correos y WhatsApp</strong>,
                  los seguimientos se pierden y las oportunidades también.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal baseOpacity={0} translateY={50} duration={1}>
              <div className="gsea-chaos-comparison">
                <div className="gsea-chaos-card gsea-chaos-card--before">
                  <span className="gsea-card-label">Sin G-SEA</span>
                
                  <div className="gsea-chaos-image-wrap">
                    <img
                      src={caosImg}
                      alt="Procesos desorganizados antes de usar G-SEA"
                      className="gsea-chaos-image"
                    />
                  </div>
                </div>

                <div className="gsea-comparison-arrow">
                  <ChevronRight size={25} />
                </div>

                <div className="gsea-chaos-card gsea-chaos-card--after">
                  <span className="gsea-card-label">Con G-SEA</span>
                  <div className="gsea-table-title">Oportunidades</div>
                  <div className="gsea-table-head">
                    <span>Cliente</span><span>Etapa</span><span>Agente</span><span>Valor</span>
                  </div>
                  {[
                    ["Ana Martínez", "Cotización", "Carlos", "$24,500"],
                    ["Roberto Sánchez", "Propuesta", "María", "$18,750"],
                    ["Laura Gómez", "Contacto", "Luis", "$12,300"],
                    ["Jorge Díaz", "Cotización", "Carlos", "$31,200"],
                  ].map((row) => (
                    <div className="gsea-table-row" key={row[0]}>
                      <span>{row[0]}</span>
                      <span><i>{row[1]}</i></span>
                      <span>{row[2]}</span>
                      <span>{row[3]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="gsea-product-section">
          <div className="gsea-container gsea-product-grid">
            <ScrollReveal baseOpacity={0} translateX={-70} duration={1.1}>
              <div className="gsea-product-showcase">
                <img src={dashboard} alt="Panel de control de G-SEA" />
              </div>
            </ScrollReveal>

            <ScrollReveal baseOpacity={0} translateX={70} duration={1}>
              <div className="gsea-product-copy">
                <span className="gsea-kicker">Control total</span>
                <TitleReveal as="div" className="gsea-product-title-group">
                  <h2>Dashboard</h2>
                  <h2 className="gsea-chaos-title__accent">intuitivo y accionable</h2>
                </TitleReveal>
                <p>Toda tu operación comercial en un solo lugar.</p>
                <ul>
                  <CheckItem text="Visualiza tu embudo y conversión en tiempo real." />
                  <CheckItem text="Da seguimiento a actividades y tareas clave." />
                  <CheckItem text="Gestiona cotizaciones y oportunidades sin fricción." />
                  <CheckItem text="Consulta reportes claros para decidir mejor." />
                </ul>
                <a href="#contacto" className="gsea-button">
                  Ver cómo funciona <ArrowRight size={18} />
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section id="precios" className="gsea-pricing-section">
          <div className="gsea-container">
            <ScrollReveal translateY={35} duration={0.9}>
              <div className="gsea-section-heading gsea-section-heading--center">
                <span className="gsea-kicker">Planes flexibles</span>
                <TitleReveal as="h2">
                  Planes diseñados para crecer contigo
                </TitleReveal>
                <p>Elige el nivel que mejor se adapte a tu operación.</p>
              </div>
            </ScrollReveal>

            <div className="gsea-pricing-grid">
              {plans.map((plan, index) => (
                <ScrollReveal key={plan.name} translateY={45} delay={index * 0.12} duration={0.8}>
                  <PricingCard {...plan} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="gsea-contact-section">
          <div className="gsea-container">
            <ScrollReveal translateY={45} duration={1}>
              <div className="gsea-contact-layout">
                <div className="gsea-contact-copy">
                  <span className="gsea-kicker gsea-kicker--light">
                    Demo personalizada
                  </span>
        
                  <TitleReveal as="h2">
                    Conoce cómo <br />
                    <strong>G-SEA</strong> puede adaptarse a tu promotoría
                  </TitleReveal>
        
                  <p>
                    Agenda una demostración y descubre cómo vender más con orden,
                    control y visibilidad.
                  </p>
        
                  <div className="gsea-contact-benefits">
                    <Benefit icon={ShieldCheck} text="Sin compromiso" />
                    <Benefit icon={UsersRound} text="Asesoría personalizada" />
                  </div>
                </div>
        
                <form
                  className="gsea-contact-form"
                  onSubmit={handleDemoSubmit}
                >
                  <div className="gsea-form-grid">
                    <input
                      type="text"
                      name="nombre_completo"
                      placeholder="Nombre completo"
                      aria-label="Nombre completo"
                      value={demoForm.nombre_completo}
                      onChange={handleDemoChange}
                      required
                    />

                    <input
                      type="email"
                      name="correo"
                      placeholder="Correo electrónico"
                      aria-label="Correo electrónico"
                      value={demoForm.correo}
                      onChange={handleDemoChange}
                      required
                    />

                    <div className="gsea-phone-field">
                      <PhoneInput
                        international
                        defaultCountry="MX"
                        placeholder="Teléfono / WhatsApp"
                        value={demoForm.telefono}
                        onChange={(value) =>
                          setDemoForm((prev) => ({ ...prev, telefono: value || "" }))
                        }
                        required
                      />
                    </div>

                    <input
                      type="text"
                      name="promotoria"
                      placeholder="Nombre de tu promotoría"
                      aria-label="Nombre de tu promotoría"
                      value={demoForm.promotoria}
                      onChange={handleDemoChange}
                    />
                  </div>

                  <textarea
                    name="necesidades"
                    placeholder="Cuéntanos brevemente sobre tu equipo y necesidades…"
                    aria-label="Mensaje"
                    value={demoForm.necesidades}
                    onChange={handleDemoChange}
                  />

                  {demoSuccess && (
                    <div
                      role="status"
                      aria-live="polite"
                      style={{
                        padding: "16px 18px",
                        marginTop: "16px",
                        marginBottom: "16px",
                        borderRadius: "12px",
                        background: "#ecfdf3",
                        border: "1px solid #86efac",
                        color: "#166534",
                        fontSize: "15px",
                        lineHeight: "1.5",
                      }}
                    >
                      <strong>✓ {demoSuccess}</strong>
                      <div style={{ marginTop: "4px" }}>
                        Recibimos tus datos. Nos pondremos en contacto contigo muy pronto.
                      </div>
                    </div>
                  )}

                  {demoError && (
                    <p className="gsea-form-message gsea-form-message--error">{demoError}</p>
                  )}

                  <button
                    type="submit"
                    className="gsea-button gsea-button--full"
                    disabled={demoLoading}
                  >
                    {demoLoading ? "Enviando..." : (
                      <>
                        Solicitar demo
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="gsea-footer">
        <div className="gsea-container gsea-footer__inner">
          <img src={logoGSEA} alt="G-SEA" />
          <p>© 2026 G-SEA. Todos los derechos reservados.</p>
          <div>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const TitleReveal = ({
  as: Tag = "h2",
  className = "",
  delay = 0,
  children,
  ...props
}) => {
  const titleRef = useRef(null);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) return undefined;

    // El hero puede estar visible desde el primer render.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-title-visible");
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={titleRef}
      className={`gsea-title-reveal ${className}`.trim()}
      style={{ "--gsea-title-delay": `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
};

const Benefit = ({ icon: Icon, text }) => (
  <div className="gsea-benefit">
    <span><Icon size={17} /></span>
    <p>{text}</p>
  </div>
);

const FloatingMetric = ({ value, label, className }) => (
  <div className={`gsea-floating-metric ${className}`}>
    <span><TrendingUp size={16} /></span>
    <div><strong>{value}</strong><small>{label}</small></div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, text }) => (
  <article className="gsea-feature-card">
    <div className="gsea-feature-card__icon"><Icon size={29} /></div>
    <h3>{title}</h3>
    <p>{text}</p>
  </article>
);

const ChaosItem = ({ icon: Icon, text }) => (
  <div className="gsea-chaos-item">
    <span><Icon size={20} /></span>
    <p>{text}</p>
  </div>
);

const CheckItem = ({ text }) => (
  <li><span><Check size={16} strokeWidth={3} /></span>{text}</li>
);

const PricingCard = ({ name, description, price, unit, features, popular }) => (
  <article className={`plan-card ${popular ? "plan-card--popular" : ""}`}>
    {popular && <span className="plan-badge">Más popular</span>}
    <h3>{name}</h3>
    <p className="plan-subtitle">{description}</p>
    <div className="plan-price">
      <strong className="price-text">{price}</strong>
      <span>{unit}</span>
    </div>
    <ul>
      {features.map((feature) => (
        <li key={feature}>
          <span className="check-icon"><Check size={15} strokeWidth={3} /></span>
          {feature}
        </li>
      ))}
    </ul>
    <a href="#contacto" className="btn-plan">Comenzar</a>
  </article>
);

export default GSeaLanding;