# FKTR.cz – Phase 2 Implementation & Improvements

## ✅ Completed Tasks

### 1. Legal Pages Created

- **Všeobecné obchodní podmínky** (`/vseobecne-obchodni-podminky`)
- **Ochrana osobních údajů (GDPR)** (`/ochrana-osobnich-udaju`)
- Both pages updated with FKTR.cz branding and contact information

### 2. Brand Identity Updates

- **Page Title**: "FKTR – fakturuj v klidu"
- **Meta Description**: "Minimalistická appka pro vystavení faktur. Méně kliků, více klidu."
- **Hero Section**: "Fakturuj v klidu. Méně kliků, více klidu."
- **Pricing Plans**: "FKTR Free" and "FKTR Pro"

### 3. Tone-of-Voice Implementation

- **Success Messages**: "Hotovo. FKTR Pro aktivní."
- **Error Messages**: "Něco se pokazilo. Ale klid, zkus to znovu."
- **Settings**: "Hotovo. Nastavení uložené."
- **Form Validation**: "Vyber si plán, prosím"

### 4. Email & Contact Updates

- All support emails updated to `@fktr.cz`
- Contact information updated in all pages
- User-Agent strings updated to "FKTR.cz/1.0"

---

## 🎯 Phase 2 Improvements & Next Steps

### 1. Visual Identity Enhancements

#### Logo & Typography

```css
/* Recommended font stack */
font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Brand colors */
--fktr-primary: #00bfa6; /* Mint accent */
--fktr-background: #f9f9f8; /* Warm white */
--fktr-text: #0f0f0f; /* Deep black */
--fktr-muted: #9ca3af; /* Muted gray */
```

#### Logo Implementation

- Create SVG logo: `FKTR.` with period (symbol of completion)
- Implement in navigation and favicon
- Add to print templates

### 2. Enhanced Microcopy

#### Dashboard Messages

- **Invoice Created**: "Hotovo. Faktura uložená."
- **Free Limit Reached**: "Vyčerpal jsi 4 faktury. FKTR Pro má neomezeně."
- **Payment Success**: "Platba dorazila. Faktura zaplacená."

#### Error Handling

- **Network Issues**: "Něco se pokazilo. Ale klid, zkus to znovu."
- **Validation**: "Chybí ti něco. Zkontroluj údaje."
- **Server Error**: "Něco se pokazilo. Ale klid, zkus to znovu."

### 3. User Experience Improvements

#### Onboarding Flow

1. **Welcome Message**: "Vítej v FKTR. Fakturuj v klidu."
2. **First Invoice**: "Vytvoř si první fakturu. Je to jednoduché."
3. **Success State**: "Hotovo. Tvoje první faktura je připravená."

#### Dashboard Enhancements

- **Quick Actions**: "Vytvoř fakturu", "Přidej klienta"
- **Status Messages**: "Tvoje data. Tvoje faktury."
- **Usage Indicators**: "FKTR Free: 3/4 faktury tento měsíc"

### 4. Technical Improvements

#### Performance Optimizations

- Implement lazy loading for invoice lists
- Optimize image assets (logo, icons)
- Add loading states with FKTR branding

#### SEO Enhancements

- Update sitemap.xml with new URLs
- Add structured data for business information
- Implement Open Graph images for FKTR.cz

### 5. Domain & Infrastructure

#### DNS Configuration

```bash
# Required DNS records for fktr.cz
A     fktr.cz        → [Netlify IP]
CNAME www.fktr.cz    → fktr.cz
```

#### Redirects Setup

```javascript
// next.config.js
async redirects() {
  return [
    {
      source: '/payro/:path*',
      destination: '/:path*',
      permanent: true,
    },
  ]
}
```

### 6. Content Strategy

#### Landing Page Copy

- **Headline**: "Fakturuj v klidu."
- **Subheadline**: "Méně kliků, více klidu."
- **Value Prop**: "Tvoje data. Tvoje faktury."

#### Feature Descriptions

- **Simple**: "Vytvoř fakturu za 2 minuty"
- **Reliable**: "Tvoje data jsou v bezpečí"
- **Czech**: "Postaveno pro české podnikatele"

### 7. Marketing Assets

#### Social Media

- **Twitter**: "FKTR – fakturuj v klidu. Méně kliků, více klidu."
- **LinkedIn**: "Nový způsob fakturace pro freelancery"
- **Facebook**: "Jednoduchá fakturace bez byrokracie"

#### Email Templates

- **Welcome**: "Vítej v FKTR. Fakturuj v klidu."
- **Upgrade**: "FKTR Pro aktivní. Více faktur, více klidu."
- **Support**: "Tým FKTR.cz"

---

## 🚀 Implementation Priority

### High Priority (Week 1)

1. ✅ Legal pages created
2. ✅ Brand identity updated
3. ✅ Tone-of-voice implemented
4. 🔄 Logo and visual assets
5. 🔄 Domain configuration

### Medium Priority (Week 2)

1. Enhanced microcopy throughout app
2. Dashboard UX improvements
3. SEO optimizations
4. Performance enhancements

### Low Priority (Week 3+)

1. Advanced onboarding flow
2. Social media assets
3. Email template updates
4. Analytics and tracking

---

## 📊 Success Metrics

### Brand Recognition

- [ ] Logo recognition in user testing
- [ ] Brand recall in surveys
- [ ] Tone-of-voice consistency score

### User Experience

- [ ] Time to first invoice creation
- [ ] User satisfaction scores
- [ ] Support ticket reduction

### Business Impact

- [ ] Conversion rate improvement
- [ ] User retention increase
- [ ] Brand sentiment analysis

---

## 🎨 Design System

### Typography Scale

```css
/* Headings */
.fktr-h1 {
  font-size: 3rem;
  font-weight: 800;
}
.fktr-h2 {
  font-size: 2.25rem;
  font-weight: 700;
}
.fktr-h3 {
  font-size: 1.875rem;
  font-weight: 600;
}

/* Body */
.fktr-body {
  font-size: 1rem;
  font-weight: 400;
}
.fktr-small {
  font-size: 0.875rem;
  font-weight: 400;
}
```

### Component Library

- **FKTR Button**: Primary, secondary, ghost variants
- **FKTR Card**: Clean, minimal design
- **FKTR Input**: Consistent form styling
- **FKTR Badge**: Status indicators

---

## 🔧 Technical Debt

### Code Quality

- [ ] Update all hardcoded "payro" references
- [ ] Implement consistent error handling
- [ ] Add comprehensive logging
- [ ] Update API documentation

### Performance

- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add service worker for offline support
- [ ] Optimize images and assets

---

## 📝 Notes

### Brand Guidelines

- **Tone**: Klidný, férový, neformální
- **Voice**: Krátký, jasný, lidský
- **Values**: Jednoduchost, spolehlivost, českost

### Future Considerations

- Multi-language support (EN)
- Advanced reporting features
- Mobile app development
- API for third-party integrations

---

**Status**: Phase 2 implementation in progress  
**Next Review**: Weekly progress check  
**Owner**: Development Team  
**Stakeholders**: Product, Design, Marketing
