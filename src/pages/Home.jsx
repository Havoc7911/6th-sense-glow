import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Smartphone, HardDrive, Wifi, Zap, Users, DollarSign, Tag, HeartHandshake, AlertCircle, X, ArrowRight } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import logo from '../assets/logo.jpg';
import './Home.css';

export default function Home() {
  const [promotions, setPromotions] = useState([]);
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from('promotions').select('*').eq('active', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setPromotions(data); });
  }, []);

  const features = [
    { icon: Smartphone, title: 'Device Setup & Optimization', desc: 'Expert software solutions and device configuration for any device, any platform.' },
    { icon: DollarSign, title: 'Cost-Saving Audit', desc: "Let us find discounts, promotions or trials that save you money! Average savings: $80." },
    { icon: HeartHandshake, title: 'Hardship Pricing Support', desc: 'Flexible payment plans and adjustments on a case-by-case basis. Special consideration for children.' },
    { icon: AlertCircle, title: 'Urgent (911) Service', desc: 'Immediate response for critical tech emergencies. Subject to an urgent priority surcharge.' },
  ];

  return (
    <div className="home-page animate-fade-in">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Serving Confluence, PA</div>
          <div className="hero-logo-wrapper">
            <img src={logo} alt="6th Sense Personal" className="hero-logo" />
          </div>
          <p className="hero-subtitle">
            Premium tech support, consulting, and solutions tailored to your unique digital ecosystem.
          </p>
          <div className="hero-actions">
            <Link to="/services" className="button">Explore Services</Link>
            <Link to="/request-info" className="button secondary">Request Information</Link>
          </div>
          {promotions.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                className="promo-hero-btn"
                onClick={() => setPromoOpen(true)}
              >
                <Tag size={16} />
                <span>Current Promotions</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      {promoOpen && (
        <div className="promo-flyout-overlay" onClick={() => setPromoOpen(false)}>
          <div className="promo-flyout glass-panel" onClick={e => e.stopPropagation()}>
            <div className="promo-flyout-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                <Tag size={22} style={{ color: 'var(--primary)' }} /> Current Promotions
              </h2>
              <button className="icon-button" onClick={() => setPromoOpen(false)}><X size={22} /></button>
            </div>
            <div className="promo-flyout-list">
              {promotions.map(p => {
                const parts = (p.description || '').split('|||');
                const desc = parts[0].trim();
                const price = parts.length > 1 ? parts[1].trim() : null;
                return (
                  <div key={p.id} className="promo-flyout-card">
                    <div className="promo-flyout-card-header">
                      <h3>{p.title}</h3>
                      {price && <span className="promo-price-tag">{price}</span>}
                    </div>
                    <p className="promo-flyout-desc">{desc}</p>
                    {p.code && (
                      <div className="promo-code-row">
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Use code:</span>
                        <span className="home-promo-code">{p.code}</span>
                      </div>
                    )}
                    <Link
                      to={`/request-info?service=promo-${encodeURIComponent(p.title)}`}
                      className="button small-btn promo-cta"
                      onClick={() => setPromoOpen(false)}
                    >
                      Request This Service <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <section className="features">
            <h2 className="section-title">How We Help You</h2>
            <div className="features-grid">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="glass-panel feature-card">
                    <div className="feature-icon-wrapper">
                      <Icon size={32} className="feature-icon" />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ paddingTop: 0 }}>
            <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden', borderLeft: '4px solid var(--primary)', background: 'linear-gradient(135deg, rgba(20,20,20,0.8), rgba(249,115,22,0.03))' }}>
              <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.05, transform: 'rotate(15deg)' }}>
                <Shield size={200} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={28} style={{ color: 'var(--primary)' }} />
                From Paramedicine to Personal Tech
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1rem', maxWidth: '800px' }}>
                Many of you in Confluence already know me from my years serving as a local paramedic. As I transition into this new career, my core mission hasn't changed: <strong style={{ color: '#e2e8f0' }}>supporting my neighbors when they need it most.</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '800px' }}>
                The skills I utilized in EMS—rapid problem-solving, calm troubleshooting, and genuine care—transfer directly to resolving your tech issues. While 6th Sense Personal is about standardizing my services and pricing for consistency, I remain committed to our community. I still offer the same local, familiar, and trustworthy support, always considering individual cases and extenuating circumstances.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
