/* ============================================================
   swiftMed Kenya — Application Script (v4)
   Author: UI/UX Audit & Redesign

   ARCHITECTURE NOTES
   ------------------
   • All DOM access is guarded — this file is loaded on every page.
   • All user-supplied strings go through textContent, never innerHTML.
   • All storage calls are wrapped (Safari private mode throws).
   • MOCK DATA: this build is a portfolio demonstration. See the
     MOCK DATA block below. In production these values would come
     from a booking API and a real-time events stream.

   ICON STRATEGY
   -------------
   Font Awesome via CDN is used here for reviewer convenience.
   In a production build, replace with an inline SVG sprite:
   ~250 KB saved and two third-party origins removed from the
   critical path. See README.md → "Production checklist".
   ============================================================ */
'use strict';

/* ---------- Constants ---------- */
const WHATSAPP_NUMBER = '254702555093';
const WA_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

/* ---------- Tiny DOM helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ---------- Safe storage ---------- */
const safeStore = {
  get(k)     { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v)  { try { sessionStorage.setItem(k, v); } catch { /* noop */ } },
  getL(k)    { try { return localStorage.getItem(k); } catch { return null; } },
  setL(k, v) { try { localStorage.setItem(k, v); } catch { /* noop */ } }
};

/* ==================== MOCK DATA ====================
   Everything below is demonstration data for this portfolio build.
   Replace with real API responses in production.
   ==================================================== */

const MOCK_RECENT_BOOKINGS = [
  { name: 'Grace W.', service: 'General Consultation',    time: '2 mins ago'  },
  { name: 'Brian O.', service: 'Teleconsult',             time: '5 mins ago'  },
  { name: 'Amina Y.', service: 'Specialist Consultation', time: '8 mins ago'  },
  { name: 'Peter K.', service: 'Lab Tests',               time: '12 mins ago' },
  { name: 'Lucy N.',  service: 'General Consultation',    time: '15 mins ago' },
  { name: 'David M.', service: 'Teleconsult',             time: '20 mins ago' },
  { name: 'Sarah J.', service: 'General Consultation',    time: '25 mins ago' },
  { name: 'Kevin O.', service: 'Specialist Consultation', time: '30 mins ago' }
];

const MOCK_DOCTOR_SHIFTS = {
  weekday:  { start: 8, end: 20, onShift: 4 },
  saturday: { start: 9, end: 18, onShift: 3 },
  sunday:   { onShift: 0 }
};

/* ==================== Toast ==================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const icon = document.createElement('i');
  icon.className = `fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`;
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.textContent = message;              // ← never innerHTML

  toast.append(icon, text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ==================== WhatsApp helper (popup-blocker safe) ==================== */
function openWhatsApp(message, { replace = false } = {}) {
  const url = `${WA_BASE}?text=${encodeURIComponent(message)}`;
  if (replace) window.location.href = url;
  else window.open(url, '_blank', 'noopener,noreferrer');
}

/* ==================== Throttle ==================== */
function throttle(fn, limit = 100) {
  let waiting = false;
  return function (...args) {
    if (waiting) return;
    fn.apply(this, args);
    waiting = true;
    setTimeout(() => { waiting = false; }, limit);
  };
}

/* ==================== Mobile Menu ==================== */
function closeMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  const cta = document.getElementById('header-cta');
  const ctaMobile = document.getElementById('header-cta-mobile');
  const hamburger = $('.hamburger');
  if (nav) nav.classList.remove('open');
  if (cta) cta.classList.remove('open');
  if (ctaMobile) ctaMobile.classList.remove('open');
  if (hamburger) {
    hamburger.setAttribute('aria-expanded', 'false');
    const icon = hamburger.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-bars';
  }
}

function toggleMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  const cta = document.getElementById('header-cta');
  const ctaMobile = document.getElementById('header-cta-mobile');
  const hamburger = $('.hamburger');
  if (!nav || !hamburger) return;

  const isOpen = !nav.classList.contains('open');
  if (isOpen) {
    nav.classList.add('open');
    if (ctaMobile) ctaMobile.classList.add('open');
    if (cta) cta.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'true');
    const icon = hamburger.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-xmark';
  } else {
    closeMobileMenu();
  }
}

document.addEventListener('click', (e) => {
  if (window.innerWidth > 768) return;
  const nav = document.getElementById('mobile-nav');
  if (!nav || !nav.classList.contains('open')) return;
  if (e.target.closest('.hamburger, #mobile-nav')) return;
  closeMobileMenu();
});

/* ==================== Live availability ticker (MOCK) ==================== */
function getNextAvailableSlot() {
  const now = new Date();
  const next = new Date(now.getTime() + 30 * 60000);
  const mins = next.getMinutes();
  if (mins < 30) {
    next.setMinutes(30, 0, 0);
  } else {
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
  }
  const isToday = next.getDate() === now.getDate();
  const dayLabel = isToday ? 'Today' : 'Tomorrow';
  const timeLabel = next.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${dayLabel}, ${timeLabel}`;
}

function getDoctorsOnShift() {
  const now = new Date();
  const h = now.getHours();
  const d = now.getDay();
  if (d >= 1 && d <= 5) {
    const { start, end, onShift } = MOCK_DOCTOR_SHIFTS.weekday;
    return h >= start && h < end ? `${onShift} on shift` : 'By appointment';
  }
  if (d === 6) {
    const { start, end, onShift } = MOCK_DOCTOR_SHIFTS.saturday;
    return h >= start && h < end ? `${onShift} on shift` : 'By appointment';
  }
  return 'By appointment';
}

function updateWaitlist() {
  const slot = getNextAvailableSlot();
  $$('.js-next-slot').forEach((el) => { el.textContent = slot; });
  const docsEl = document.getElementById('wait-doctors');
  if (docsEl) docsEl.textContent = getDoctorsOnShift();
}

/* ==================== Insurance Pre-Verification ==================== */
(function initInsurance() {
  const form = document.getElementById('insurance-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = (document.getElementById('patient-name')?.value || '').trim();
    const provider = document.getElementById('provider')?.value || '';
    const memberId = (document.getElementById('member-id')?.value || '').trim();

    $$('.error-msg', form).forEach((el) => el.classList.remove('visible'));
    let hasError = false;
    if (!name) { document.getElementById('name-error')?.classList.add('visible'); hasError = true; }
    if (!provider) { document.getElementById('provider-error')?.classList.add('visible'); hasError = true; }
    if (!memberId) { document.getElementById('member-error')?.classList.add('visible'); hasError = true; }
    if (hasError) { showToast('Please fill in all required fields.', 'error'); return; }

    const verifyBtn = document.getElementById('verify-btn');
    const btnText = verifyBtn.querySelector('.btn-text');
    const spinner = verifyBtn.querySelector('.spinner');
    verifyBtn.disabled = true;
    btnText.textContent = 'Verifying…';
    spinner.style.display = 'inline-block';

    setTimeout(() => {
      const message =
        `Hi swiftMed Kenya, I'd like a pre-verification check.\n` +
        `Name: ${name}\nInsurance: ${provider}\nMember ID: ${memberId}`;
      showToast(`Thanks ${name} — opening WhatsApp…`, 'success');
      openWhatsApp(message, { replace: true });
      verifyBtn.disabled = false;
      btnText.textContent = 'Verify My Coverage Instantly';
      spinner.style.display = 'none';
      form.reset();
    }, 1200);
  });
})();

/* ==================== Scroll animation (no-JS safe) ==================== */
function observeAnimations() {
  const elements = $$('.animate-on-scroll');
  if (!elements.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduceMotion) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach((el) => {
    el.classList.add('will-animate');   // only hide once JS is confirmed running
    observer.observe(el);
  });
}

/* ==================== Corporate login (demo) ==================== */
(function initCorporateLogin() {
  const form = document.getElementById('corp-login-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showToast('Demo build — HR dashboard not connected.', 'success');
    this.reset();
  });
})();

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector('i');
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  if (icon) icon.className = showing ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
  btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}

/* ==================== Corporate access ==================== */
(function initCorporateAccess() {
  const form = document.getElementById('corp-access-form');
  if (!form) return;
  const steps = $$('.form-step', form);
  const progressBar = document.getElementById('corp-progress-bar');
  let currentStep = 1;

  function validatePane(pane) {
    let valid = true;
    let firstInvalid = null;

    $$('input[required]', pane).forEach((field) => {
      const error = field.parentElement.querySelector('.error-msg');
      const empty = !field.value.trim();

      let typeValid = true;
      if (!empty && field.type === 'tel') {
        const digits = field.value.replace(/\D/g, '');
        typeValid = /^(?:254|0)?[71]\d{8}$/.test(digits);
      }
      if (!empty && field.type === 'number') {
        typeValid = Number(field.value) > 0;
      }
      if (!empty && field.type === 'email') {
        typeValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      }

      const ok = !empty && typeValid;
      field.classList.toggle('invalid', !ok);
      field.setAttribute('aria-invalid', String(!ok));
      if (error) error.classList.toggle('visible', !ok);

      if (!ok) {
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  function showStep(step) {
    steps.forEach((s) => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    const target = form.querySelector(`.form-step[data-step="${step}"]`);
    if (target) {
      target.classList.add('active');
      target.style.display = 'block';
    }
    currentStep = step;
    if (progressBar) {
      progressBar.style.width = steps.length > 1
        ? `${((currentStep - 1) / (steps.length - 1)) * 100}%`
        : '100%';
    }
  }

  const nextBtn = form.querySelector('.next-step');
  const prevBtn = form.querySelector('.prev-step');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const pane = form.querySelector(`.form-step[data-step="${currentStep}"]`);
      if (validatePane(pane)) showStep(currentStep + 1);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showStep(currentStep - 1));

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate BOTH panes on submit — never trust that the user reached
    // step 2 through the "Next" button (e.g. Enter key from step 1).
    const pane2 = form.querySelector('.form-step[data-step="2"]');
    if (!validatePane(pane2)) return;

    // Named access — resilient to markup reordering
    const get = (id) => (form.querySelector(`#${id}`)?.value || '').trim();
    const message =
      `Hi swiftMed Corporate Concierge,\n\n` +
      `I'd like to request corporate access.\n\n` +
      `HR Manager: ${get('corp-hr-name')}\n` +
      `Company: ${get('corp-company')}\n` +
      `Office Phone: ${get('corp-phone')}\n` +
      `Employees: ${get('corp-employees')}`;

    showToast('Request sent! Our concierge will call you within 2 hours.', 'success');
    openWhatsApp(message, { replace: true });
  });

  showStep(1);
})();

/* ==================== Booking Modal ==================== */
const DOCTOR_FEES = {
  'Dr. Mwangi':  2500,   // General Physician
  'Dr. Achieng': 3000,   // Cardiologist
  'Dr. Kamau':   3000,   // Pediatrician
  'Dr. Otieno':  3000    // Dermatologist
};
const TELECONSULT_FEE = 2500;

let bookingState = {
  apptType: '',
  doctor: '',
  date: '',
  time: '',
  patient: { name: '', phone: '', email: '', notes: '' },
  fee: 0
};

let lastFocusedElement = null;

function computeFee() {
  if (bookingState.apptType === 'teleconsult') return TELECONSULT_FEE;
  return DOCTOR_FEES[bookingState.doctor] || 2500;
}

function setApptType(type, element) {
  bookingState.apptType = type;
  bookingState.fee = computeFee();
  $$('.type-card').forEach((c) => c.classList.remove('selected'));
  if (element) element.classList.add('selected');
}

function setDoctor(doctor, element) {
  bookingState.doctor = doctor;
  bookingState.fee = computeFee();
  $$('.doctor-card').forEach((c) => c.classList.remove('selected'));
  if (element) element.classList.add('selected');
}

function generateTimeSlots() {
  const container = document.getElementById('time-slots');
  if (!container) return;
  container.innerHTML = '';
  const allSlots = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
  const unavailable = ['11:00 AM', '3:00 PM'];

  allSlots.forEach((slot) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isDisabled = unavailable.includes(slot);
    btn.className = `slot-btn${isDisabled ? ' disabled' : ''}`;
    btn.textContent = slot;
    btn.disabled = isDisabled;
    btn.setAttribute('aria-pressed', 'false');
    if (!isDisabled) {
      btn.addEventListener('click', function () { setTime(slot, this); });
    }
    container.appendChild(btn);
  });
  bookingState.time = '';
}

function setTime(time, element) {
  bookingState.time = time;
  $$('.slot-btn').forEach((btn) => {
    btn.classList.remove('selected');
    btn.setAttribute('aria-pressed', 'false');
  });
  if (element) {
    element.classList.add('selected');
    element.setAttribute('aria-pressed', 'true');
  }
}

function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254')) return '0' + digits.slice(3);
  if (digits.startsWith('0')) return digits;
  if (digits.length === 9) return '0' + digits;
  return digits;
}

/* ---------- Inline form error helpers (WCAG 3.3.1) ---------- */
function setFieldError(input, message) {
  const errorId = input.getAttribute('aria-describedby');
  const errorEl = errorId ? document.getElementById(errorId) : null;
  const invalid = Boolean(message);

  input.setAttribute('aria-invalid', String(invalid));
  input.classList.toggle('invalid', invalid);

  if (errorEl) {
    errorEl.textContent = message || '';
    errorEl.classList.toggle('visible', invalid);
  }
}

function validatePatientForm() {
  let firstInvalid = null;

  const rules = [
    { id: 'patient-fullname', required: true,  message: 'Please enter the patient\'s full name.' },
    { id: 'patient-phone',    required: true,  message: 'Enter a valid Kenyan phone number (e.g. 0712 345 678).', pattern: /^(?:254|0)?[71]\d{8}$/ },
    { id: 'patient-email',    required: false, message: 'Please enter a valid email address.', type: 'email' }
  ];

  rules.forEach(({ id, required, pattern, type, message }) => {
    const input = document.getElementById(id);
    if (!input) return;

    const raw = input.value.trim();
    let ok = true;

    if (required && !raw) {
      ok = false;
    } else if (raw && pattern) {
      ok = pattern.test(raw.replace(/\D/g, ''));
    } else if (raw && type === 'email') {
      ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
    }

    setFieldError(input, ok ? '' : message);
    if (!ok && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function nextStep(step) {
  if (step === 2) {
    if (!bookingState.apptType) { showToast('Please select the type of visit.', 'error'); return; }
    if (!bookingState.doctor)   { showToast('Please select a doctor.', 'error'); return; }
  }

  if (step === 3) {
    if (!bookingState.time) { showToast('Please select a time slot.', 'error'); return; }
    if (!validatePatientForm()) return;

    const nameEl  = document.getElementById('patient-fullname');
    const phoneEl = document.getElementById('patient-phone');
    const emailEl = document.getElementById('patient-email');
    const notesEl = document.getElementById('patient-notes');
    const dateEl  = document.getElementById('booking-date');

    bookingState.patient.name  = (nameEl?.value || '').trim();
    bookingState.patient.phone = normalizePhone(phoneEl?.value || '');
    bookingState.patient.email = (emailEl?.value || '').trim();
    bookingState.patient.notes = (notesEl?.value || '').trim();
    bookingState.fee = computeFee();

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set('summary-type',    bookingState.apptType === 'in-clinic' ? 'In-Clinic' : 'Teleconsult');
    set('summary-doctor',  bookingState.doctor);
    set('summary-date',    dateEl ? dateEl.options[dateEl.selectedIndex].text : '');
    set('summary-time',    bookingState.time);
    set('summary-patient', bookingState.patient.name);
    set('summary-phone',   bookingState.patient.phone);
    set('mpesa-phone',     bookingState.patient.phone);
    set('summary-fee',     `KES ${bookingState.fee.toLocaleString()}`);
  }

  $$('.modal-step').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById('step-' + step);
  if (target) target.classList.add('active');
  updateProgress(step);

  if (step === 2) {
    const container = document.getElementById('time-slots');
    if (container && !container.children.length) generateTimeSlots();
  }
}

function updateProgress(step) {
  $$('.step-dot').forEach((dot, i) => dot.classList.toggle('active', i + 1 <= step));
  $$('.step-line').forEach((line, i) => line.classList.toggle('active', i + 1 < step));
}

function simulatePayment() {
  const payBtn = document.getElementById('pay-btn');
  if (!payBtn) return;
  const btnText = payBtn.querySelector('.btn-text');
  const spinner = payBtn.querySelector('.spinner');
  payBtn.disabled = true;
  btnText.textContent = 'Waiting for PIN…';
  spinner.style.display = 'inline-block';

  setTimeout(() => {
    const ref = 'SM-' + new Date().getFullYear() + '-' +
      Math.random().toString(36).substring(2, 8).toUpperCase();
    const refEl = document.getElementById('booking-ref');
    if (refEl) refEl.textContent = ref;

    showToast('M-PESA payment confirmed! Booking secured.', 'success');

    $$('.modal-step').forEach((s) => s.classList.remove('active'));
    document.getElementById('step-4')?.classList.add('active');
    updateProgress(4);

    payBtn.disabled = false;
    btnText.textContent = 'Send STK Push';
    spinner.style.display = 'none';

    safeStore.setL('lastBooking', JSON.stringify({ ...bookingState, ref }));
  }, 1800);
}

function resetBookingModal() {
  bookingState = { apptType: '', doctor: '', date: '', time: '', patient: {}, fee: 0 };
  $$('.type-card').forEach((c) => c.classList.remove('selected'));
  $$('.doctor-card').forEach((c) => c.classList.remove('selected'));
  $$('.slot-btn').forEach((b) => b.classList.remove('selected'));
  document.getElementById('patient-form')?.reset();
  ['patient-fullname', 'patient-phone', 'patient-email'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) setFieldError(el, '');
  });
  const dateEl = document.getElementById('booking-date');
  if (dateEl) dateEl.selectedIndex = 0;
}

function getFocusable(container) {
  return $$(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    container
  ).filter((el) => el.offsetParent !== null);
}

function openBookingModal() {
  resetBookingModal();
  const modal = document.getElementById('booking-modal');
  if (!modal) return;

  lastFocusedElement = document.activeElement;
  modal.classList.add('active');
  document.body.classList.add('modal-open');

  document.getElementById('step-1')?.classList.add('active');
  ['step-2', 'step-3', 'step-4'].forEach((id) => document.getElementById(id)?.classList.remove('active'));
  updateProgress(1);

  requestAnimationFrame(() => {
    const first = getFocusable(modal)[0];
    if (first) first.focus();
    else modal.querySelector('.modal-content')?.focus();
  });
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

(function initModalBehaviour() {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeBookingModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeBookingModal();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = getFocusable(modal);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

/* ==================== Symptom Checker ==================== */
function routeSpecialist() {
  const select = document.getElementById('symptom-select');
  if (!select || !select.value) {
    showToast('Please select a symptom.', 'error');
    return;
  }
  const opt = select.selectedOptions[0];
  const doctor = opt.dataset.doctor || select.value.split(' (')[0];

  showToast(`Based on your symptoms, we recommend ${doctor}.`, 'success');

  openBookingModal();
  setTimeout(() => {
    document.querySelector('.type-card')?.click();       // default to In-Clinic
    $$('.doctor-card').forEach((card) => {
      if (card.querySelector('strong')?.textContent === doctor) card.click();
    });
  }, 150);
}

/* ==================== Emergency ==================== */
function closeEmergencyMenu() {
  const menu = document.getElementById('emergency-menu');
  const fab = $('.emergency-fab');
  if (!menu) return;
  menu.classList.remove('active');
  if (fab) fab.setAttribute('aria-expanded', 'false');
}

function toggleEmergencyMenu() {
  const menu = document.getElementById('emergency-menu');
  const fab = $('.emergency-fab');
  if (!menu) return;
  const open = menu.classList.toggle('active');
  if (fab) fab.setAttribute('aria-expanded', String(open));
}

function sendEmergencyLocation() {
  showToast('Requesting your location…', 'success');

  const fallback = () => {
    showToast('Could not get your location — opening WhatsApp.', 'error');
    openWhatsApp(
      'EMERGENCY AMBULANCE REQUEST. I could not share my live location. Please call me back immediately.',
      { replace: true }
    );
  };

  if (!navigator.geolocation) { fallback(); return; }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      openWhatsApp(
        `EMERGENCY AMBULANCE REQUEST\n\nMy current location:\n${mapsLink}\n\nCoordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        { replace: true }
      );
    },
    fallback,
    { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
  );
}

/* ==================== FAQ ==================== */
function toggleFaq(button) {
  const answer = button.nextElementSibling;
  if (!answer) return;
  const isOpen = button.classList.contains('open');

  $$('.faq-question.open').forEach((q) => {
    if (q === button) return;
    q.classList.remove('open');
    q.setAttribute('aria-expanded', 'false');
    q.nextElementSibling?.classList.remove('open');
    const icon = q.querySelector('i');
    if (icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
  });

  button.classList.toggle('open', !isOpen);
  button.setAttribute('aria-expanded', String(!isOpen));
  answer.classList.toggle('open', !isOpen);

  const icon = button.querySelector('i');
  if (icon) {
    icon.classList.toggle('fa-chevron-up', !isOpen);
    icon.classList.toggle('fa-chevron-down', isOpen);
  }
}

function initFaqA11y() {
  $$('.faq-question').forEach((btn, i) => {
    const answer = btn.nextElementSibling;
    if (!answer) return;
    const id = `faq-answer-${i + 1}`;
    answer.id = id;
    answer.setAttribute('role', 'region');
    btn.setAttribute('aria-controls', id);
    btn.setAttribute('aria-expanded', 'false');
  });
}

/* ==================== Back to top ==================== */
const onScroll = throttle(() => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.classList.toggle('show', window.scrollY > 300);
}, 100);
window.addEventListener('scroll', onScroll, { passive: true });

/* ==================== Chat Widget ==================== */
function toggleChat({ focus = true } = {}) {
  const win     = document.getElementById('chat-window');
  const badge   = document.querySelector('.chat-badge');
  const toggle  = document.getElementById('chat-toggle');
  if (!win) return;

  const open = win.classList.toggle('open');
  if (badge) badge.style.display = 'none';
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('chat-open', open);

  if (open && focus) {
    setTimeout(() => document.getElementById('chat-input')?.focus(), 250);
  }
}

function closeChat() {
  const win = document.getElementById('chat-window');
  if (!win || !win.classList.contains('open')) return;
  win.classList.remove('open');
  document.body.classList.remove('chat-open');
  document.getElementById('chat-toggle')?.setAttribute('aria-expanded', 'false');
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');
  if (!input || !chatBody) return;
  const message = input.value.trim();
  if (!message) return;

  const sentMsg = document.createElement('div');
  sentMsg.className = 'chat-message user-message';
  sentMsg.textContent = message;                       // ← textContent
  chatBody.appendChild(sentMsg);
  chatBody.scrollTop = chatBody.scrollHeight;
  input.value = '';

  openWhatsApp(message);

  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot-message';
    const p1 = document.createElement('p');
    p1.textContent = 'Thanks! Opening WhatsApp so a real person can help.';
    const p2 = document.createElement('p');
    p2.append('For urgent issues call ');
    const strong = document.createElement('strong');
    strong.textContent = '0702 555 093';
    p2.append(strong, '.');
    botMsg.append(p1, p2);
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 900);
}

/* Outside-click + Escape close for chat & emergency menu */
document.addEventListener('click', (e) => {
  const win = document.getElementById('chat-window');
  if (win?.classList.contains('open') && !e.target.closest('#chat-window, #chat-toggle')) {
    closeChat();
  }
  const em = document.getElementById('emergency-menu');
  if (em?.classList.contains('active') && !e.target.closest('.emergency-fab-container')) {
    closeEmergencyMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // Booking modal handles its own Escape (with preventDefault)
  if (document.getElementById('booking-modal')?.classList.contains('active')) return;
  closeChat();
  closeEmergencyMenu();
  closeMobileMenu();
});

/* ==================== Recent activity widget (MOCK) ==================== */
let bookingIndex = 0;

function showRecentBooking() {
  const content = document.getElementById('recent-bookings-content');
  if (!content) return;
  const booking = MOCK_RECENT_BOOKINGS[bookingIndex % MOCK_RECENT_BOOKINGS.length];

  const p1 = document.createElement('p');
  p1.className = 'recent-booking-item';
  p1.textContent = `${booking.name} booked a ${booking.service}`;

  const p2 = document.createElement('p');
  p2.className = 'recent-booking-time';
  p2.textContent = booking.time;

  content.replaceChildren(p1, p2);
  bookingIndex++;
}

function initRecentBookingsWidget() {
  const widget = document.getElementById('recent-bookings-widget');
  const content = document.getElementById('recent-bookings-content');
  if (!widget || !content) return;
  if (window.matchMedia('(max-width: 900px)').matches) return;

  showRecentBooking();
  setInterval(() => {
    content.style.opacity = '0';
    setTimeout(() => { showRecentBooking(); content.style.opacity = '1'; }, 400);
  }, 12000);

  setTimeout(() => widget.classList.add('show'), 6000);
  setTimeout(() => widget.classList.remove('show'), 32000);
  setInterval(() => {
    widget.classList.add('show');
    setTimeout(() => widget.classList.remove('show'), 26000);
  }, 90000);
}

/* ==================== Book with a specific doctor (About page) ==================== */
function bookWithDoctor(btn) {
  const doctor = btn.getAttribute('data-doctor');
  if (!doctor) return;
  openBookingModal();
  setTimeout(() => {
    $$('.doctor-card').forEach((card) => {
      if (card.querySelector('strong')?.textContent === doctor) card.click();
    });
  }, 150);
}

/* ==================== Global init ==================== */
document.addEventListener('DOMContentLoaded', () => {
  /* 1. Register scroll-reveal targets */
  const animateSelectors = [
    '.how-it-works .step-card',
    '.corporate-section .corporate-text',
    '.corporate-form-box',
    '.faq-section .faq-item',
    '.patient-voices .testimonial-card',
    '.services-section .service-card',
    '.cta-banner .container',
    '.about-story-content',
    '.mission-card',
    '.vision-card',
    '.value-card',
    '.team-card',
    '.accreditations .partner-badge',
    '.blog-card'
  ];
  animateSelectors.forEach((sel) => {
    $$(sel).forEach((el) => el.classList.add('animate-on-scroll'));
  });

  initFaqA11y();
  observeAnimations();
  updateWaitlist();
  setInterval(updateWaitlist, 60000);
  initRecentBookingsWidget();

  /* 2. Wire every .open-booking-modal trigger.
        If the trigger has href="#" we preventDefault; otherwise (a WhatsApp
        fallback link) JS replaces the destination with the modal. */
  $$('.open-booking-modal').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (href === '#') e.preventDefault();
      openBookingModal();
    });
  });

  /* 3. Chat nudge — badge only, never steals focus (WCAG 2.4.3 / 3.2.5) */
  setTimeout(() => {
    if (safeStore.get('chatShown')) return;
    safeStore.set('chatShown', 'true');
    const badge = document.querySelector('.chat-badge');
    if (badge) badge.hidden = false;
  }, 12000);

  /* 4. Re-run scroll handler in case the page loaded already scrolled */
  onScroll();
});