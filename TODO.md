# TODO - FKTR.cz Development Tasks

## ✅ Fáze A – Bezpečnost + GDPR (2026-02-03)

- Základní implementace hotová v kódu (RLS, audit log, GDPR export/mazání, rate limit, signed session)
- Detailní checklist a ruční kroky v `TODO-LIST.md`

## 🎯 Payment QR Code Improvements

### Current Implementation ✅

- Basic SPAYD QR code generation
- Uses existing data: bank_account, invoice_number (as VS), total_amount, currency, due_date
- QR code displays on invoice print page
- Works with Czech bank account format and IBAN

### Recommended Improvements 🔄

#### 1. **IBAN Conversion** (High Priority)

- [ ] Implement proper Czech bank account → IBAN conversion
- [ ] Add bank code mapping table (e.g., 0800 → Česká spořitelna)
- [ ] Validate IBAN format with checksum
- [ ] Store both formats in database (bank_account + iban field)

**Database Migration:**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS swift_bic TEXT;
```

#### 2. **Payment Symbols** (Medium Priority)

- [ ] Add `constant_symbol` field to users table (default for all invoices)
- [ ] Add `specific_symbol` field to invoices table (per-invoice identifier)
- [ ] Common constant symbols:
  - `0308` - Services
  - `0558` - Goods delivery
  - `1148` - Insurance

**Database Migration:**

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_constant_symbol TEXT;

-- Add to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS constant_symbol TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS specific_symbol TEXT;
```

#### 3. **Enhanced Payment Information**

- [ ] Add payment-specific message field (separate from note)
- [ ] Add beneficiary address to QR code (improves bank app display)
- [ ] Consider adding `X-PER` (payment period) for recurring payments

#### 4. **QR Code Validation & Testing**

- [ ] Test QR codes with Czech banking apps:
  - Česká spořitelna
  - Komerční banka
  - ČSOB
  - mBank
  - Airbank
  - Fio banka
- [ ] Validate SPAYD format compliance
- [ ] Add error handling for missing data
- [ ] Add fallback if QR generation fails

#### 5. **Alternative Payment Methods**

- [ ] Support for EUR payments with SEPA format
- [ ] Add BIC/SWIFT for international payments
- [ ] Consider adding payment gateway links (GoPay, Stripe)

#### 6. **User Interface Improvements**

- [ ] Add QR code size control in settings
- [ ] Option to hide/show QR code on invoices
- [ ] Preview QR code before printing
- [ ] Add "Payment Instructions" section

#### 7. **Documentation**

- [ ] Document SPAYD format usage
- [ ] Add user guide for QR payments
- [ ] Create FAQ for clients about QR codes

---

## 📋 Other Feature Ideas

### Invoice Management

- [ ] Invoice templates (multiple designs)
- [ ] Bulk invoice generation
- [ ] Recurring invoices
- [ ] Invoice preview before sending
- [ ] PDF generation and storage

### Client Management

- [ ] Client portal (view invoices)
- [ ] Email notifications for new invoices
- [ ] Payment reminders automation
- [ ] Client payment history

### Reporting & Analytics

- [ ] Monthly revenue reports
- [ ] Tax reports (DPH)
- [ ] Overdue invoices dashboard
- [ ] Payment statistics

### Integrations

- [ ] Email service (SendGrid, Mailgun)
- [ ] Accounting software export (Money S3, Pohoda)
- [ ] Bank statement import
- [ ] Payment gateway integration

### Security & Compliance

- [ ] Two-factor authentication
- [ ] Invoice number uniqueness validation
- [ ] Audit log for all changes
- [ ] GDPR compliance features
- [ ] Data export for clients

---

## 🔧 Technical Debt

### Code Quality

- [ ] Add comprehensive error handling
- [ ] Implement loading states
- [ ] Add form validation feedback
- [ ] Write unit tests
- [ ] Add E2E tests
- [ ] Improve accessibility (ARIA labels)

### Performance

- [ ] Optimize database queries
- [ ] Add caching layer
- [ ] Lazy load components
- [ ] Image optimization
- [ ] Bundle size reduction

### Infrastructure

- [ ] Set up CI/CD pipeline
- [ ] Database backup automation
- [ ] Monitoring and logging
- [ ] Rate limiting
- [ ] Error tracking (Sentry)

---

## 📝 Notes

**QR Code Resources:**

- SPAYD Specification: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
- Czech Banking Codes: https://www.cnb.cz/cs/platebni-styk/
- IBAN Calculator: https://www.cnb.cz/cs/platebni-styk/iban/

**Priority:** Focus on IBAN conversion and payment symbols first for better banking app compatibility.

**Last Updated:** October 10, 2025
