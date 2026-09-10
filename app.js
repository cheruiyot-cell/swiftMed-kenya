/* ============================================================
   swiftMed Kenya – Application Script (v3)
   All DOM access is guarded so the file works on every page.
   ============================================================ */
'use strict';

/* ---------- Constants ---------- */
const WHATSAPP_NUMBER = '254702555093';

/* ---------- Tiny DOM helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ==================== Toast ==================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ==================== WhatsApp helper (popup-blocker safe) ==================== */
function openWhatsApp(message, { replace = false } = {}) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  if (replace) window.location.href = url;
  else window.open(url, '_blank', 'noopener,noreferrer');
}

/* ==================== Throttle ==================== */
function throttle(fn, limit = 100) {
  let waiting = false;
  return function (...args) {
    if (!waiting) {
      fn.apply(this, args);
      waiting = true;
      setTimeout(() => (waiting = false), limit);
    }
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
  if (e.target.closest('.hamburger')) return;
  if (e.target.closest('#mobile-nav')) return;
  closeMobileMenu();
});

/* ==================== Live availability ticker ==================== */
function getNextAvailableSlot() {
  const now = new Date();
  const next = new Date(now.getTime() + 30 * 60000);
  const mins = next.getMinutes();
  if (mins < 30) next.setMinutes(30, 0, 0);
  else next.setMinutes(0, 0, 0), next.setHours(next.getHours() + 1);

  const isToday = next.getDate() === now.getDate();
  const dayLabel = isToday ? 'Today' : 'Tomorrow';
  const timeLabel = next.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${dayLabel}, ${timeLabel}`;
}

function getDoctorsOnShift() {
  const now = new Date();
  const h = now.getHours();
  const d = now.getDay();
  if (d >= 1 && d <= 5) return h >= 8 && h < 20 ? '4 on shift' : 'By appointment';
  if (d === 6) return h >= 9 && h < 18 ? '3 on shift' : 'By appointment';
  return 'By appointment';
}

function updateWaitlist() {
  const slot = getNextAvailableSlot();
  $$('.js-next-slot').forEach((el) => (el.textContent = slot));
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
      // Replace (not open) so popup blockers can't interfere after the async delay
      openWhatsApp(message, { replace: true });
      verifyBtn.disabled = false;
      btnText.textContent = 'Verify My Coverage Instantly';
      spinner.style.display = 'none';
      form.reset();
    }, 1200);
  });
})();

/* ==================== Testimonials ==================== */
const testimonials = [
  { name: 'Grace Wanjiru', role: 'Entrepreneur, Westlands', text: 'I used to spend half a day at the clinic waiting. Now I book on WhatsApp, walk in at my slot, and I’m out in 20 minutes. This is how healthcare should be.' },
  { name: 'Brian Ochieng', role: 'Software Developer, Kilimani', text: 'The insurance verification saved me from a huge bill. They confirmed my SHA cover in under a minute before I even visited. No hidden charges, no stress.' },
  { name: 'Amina Yusuf', role: 'HR Manager, Upper Hill', text: 'Our company moved all staff health to swiftMed. Employees love it because they don’t lose work time. I love it because the billing is automatic. Win-win.' },
  { name: 'Peter Kariuki', role: 'Small Business Owner, CBD', text: 'I saw the live wait ticker showing zero minutes, so I just walked in. It was true – I was in and out before my tea got cold. Unbelievable.' },
  { name: 'Lucy Njeri', role: 'Teacher, South B', text: 'The teleconsult option is a lifesaver. I didn’t need to leave the house when my son was sick. The doctor called, gave a prescription, and we were done.' },
  { name: 'David Mwangi', role: 'Sales Executive, Nairobi', text: 'I always hate the queueing part of visiting a doctor. swiftMed made it feel like a premium experience. The doctor even explained everything clearly.' }
];

function renderTestimonials() {
  const grid = document.getElementById('testimonial-grid');
  if (!grid) return;
  grid.innerHTML = testimonials.map((t) => `
    <div class="testimonial-card animate-on-scroll">
      <div class="testimonial-stars" aria-hidden="true">★★★★★</div>
      <p class="testimonial-quote">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar" aria-hidden="true">${t.name.charAt(0)}</div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-role">${t.role}</div>
        </div>
      </div>
    </div>`).join('');
}

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
    // Only hide it once we KNOW JS is running
    el.classList.add('will-animate');
    observer.observe(el);
  });
}

/* ==================== Corporate ==================== */
(function initCorporateLogin() {
  const form = document.getElementById('corp-login-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showToast('Redirecting to secure HR Dashboard…', 'success');
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

(function initCorporateAccess() {
  const form = document.getElementById('corp-access-form');
  if (!form) return;
  const steps = $$('.form-step', form);
  const progressBar = document.getElementById('corp-progress-bar');
  let currentStep = 1;

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
      const currentPane = form.querySelector(`.form-step[data-step="${currentStep}"]`);
      let valid = true;
      $$('input', currentPane).forEach((field) => {
        const error = field.parentElement.querySelector('.error-msg');
        if (!field.value.trim()) {
          field.classList.add('invalid');
          if (error) error.classList.add('visible');
          valid = false;
        } else {
          field.classList.remove('invalid');
          if (error) error.classList.remove('visible');
        }
      });
      if (valid) showStep(currentStep + 1);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showStep(currentStep - 1));

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const inputs = $$('input', form);
    const hrName = inputs[0]?.value || '';
    const company = inputs[1]?.value || '';
    const phone = inputs[2]?.value || '';
    const employees = inputs[3]?.value || '';
    const message =
      `Hi swiftMed Corporate Concierge,\n\n` +
      `I'd like to request corporate access.\n\n` +
      `HR Manager: ${hrName}\nCompany: ${company}\n` +
      `Office Phone: ${phone}\nEmployees: ${employees}`;
    showToast('Request sent! Our concierge will call you within 2 hours.', 'success');
    openWhatsApp(message, { replace: true });
  });

  showStep(1);
})();

/* ==================== Booking Modal ==================== */
const DOCTOR_FEES = {
  'Dr. Mwangi': 2500,   // General Physician
  'Dr. Achieng': 3000,  // Cardiologist
  'Dr. Kamau': 3000,    // Pediatrician
  'Dr. Otieno': 3000    // Dermatologist
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
  const allSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
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

function nextStep(step) {
  if (step === 2) {
    if (!bookingState.apptType) { showToast('Please select the type of visit.', 'error'); return; }
    if (!bookingState.doctor) { showToast('Please select a doctor.', 'error'); return; }
  }

  if (step === 3) {
    if (!bookingState.time) { showToast('Please select a time slot.', 'error'); return; }
    const form = document.getElementById('patient-form');
    if (form && !form.checkValidity()) { form.reportValidity(); return; }

    const nameEl = document.getElementById('patient-fullname');
    const phoneEl = document.getElementById('patient-phone');
    const emailEl = document.getElementById('patient-email');
    const notesEl = document.getElementById('patient-notes');
    const dateEl = document.getElementById('booking-date');

    bookingState.patient.name = (nameEl?.value || '').trim();
    bookingState.patient.phone = normalizePhone(phoneEl?.value || '');
    bookingState.patient.email = (emailEl?.value || '').trim();
    bookingState.patient.notes = (notesEl?.value || '').trim();
    bookingState.fee = computeFee();

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('summary-type', bookingState.apptType === 'in-clinic' ? 'In-Clinic' : 'Teleconsult');
    set('summary-doctor', bookingState.doctor);
    set('summary-date', dateEl ? dateEl.options[dateEl.selectedIndex].text : '');
    set('summary-time', bookingState.time);
    set('summary-patient', bookingState.patient.name);
    set('summary-phone', bookingState.patient.phone);
    set('mpesa-phone', bookingState.patient.phone);
    set('summary-fee', `KES ${bookingState.fee.toLocaleString()}`);
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
    try {
      localStorage.setItem('lastBooking', JSON.stringify({ ...bookingState, ref }));
    } catch (_) { /* storage may be unavailable */ }
  }, 1800);
}

function resetBookingModal() {
  bookingState = { apptType: '', doctor: '', date: '', time: '', patient: {}, fee: 0 };
  $$('.type-card').forEach((c) => c.classList.remove('selected'));
  $$('.doctor-card').forEach((c) => c.classList.remove('selected'));
  $$('.slot-btn').forEach((b) => b.classList.remove('selected'));
  document.getElementById('patient-form')?.reset();
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

/* Modal keyboard + overlay behaviour */
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
    const last = focusable[focusable.length - 1];

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
  if (!select) return;
  const symptom = select.value;
  if (!symptom) { showToast('Please select a symptom.', 'error'); return; }
  showToast(`Based on your symptoms, we recommend our ${symptom}.`, 'success');
  setTimeout(() => openBookingModal(), 900);
}

/* ==================== Emergency ==================== */
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
function toggleChat() {
  const win = document.getElementById('chat-window');
  const badge = document.querySelector('.chat-badge');
  const toggle = document.getElementById('chat-toggle');
  if (!win) return;

  const open = win.classList.toggle('open');
  if (badge) badge.style.display = 'none';
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('chat-open', open);

  if (open) {
    setTimeout(() => document.getElementById('chat-input')?.focus(), 250);
  }
}

function closeChat() {
  const win = document.getElementById('chat-window');
  if (!win) return;
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
  sentMsg.textContent = message;
  chatBody.appendChild(sentMsg);
  chatBody.scrollTop = chatBody.scrollHeight;
  input.value = '';

  openWhatsApp(message);

  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot-message';
    botMsg.innerHTML = `<p>Thanks! Opening WhatsApp so a real person can help.</p><p>For urgent issues call <strong>0702 555 093</strong>.</p>`;
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 900);
}

/* ==================== Recent activity widget ==================== */
const recentBookings = [
  { name: 'Grace W.', service: 'General Consultation', time: '2 mins ago' },
  { name: 'Brian O.', service: 'Teleconsult', time: '5 mins ago' },
  { name: 'Amina Y.', service: 'Specialist Consultation', time: '8 mins ago' },
  { name: 'Peter K.', service: 'Lab Tests', time: '12 mins ago' },
  { name: 'Lucy N.', service: 'General Consultation', time: '15 mins ago' },
  { name: 'David M.', service: 'Teleconsult', time: '20 mins ago' },
  { name: 'Sarah J.', service: 'General Consultation', time: '25 mins ago' },
  { name: 'Kevin O.', service: 'Specialist Consultation', time: '30 mins ago' }
];

let bookingIndex = 0;

function showRecentBooking() {
  const content = document.getElementById('recent-bookings-content');
  if (!content) return;
  const booking = recentBookings[bookingIndex % recentBookings.length];
  content.innerHTML =
    `<p class="recent-booking-item">${booking.name} booked a ${booking.service}</p>` +
    `<p class="recent-booking-time">${booking.time}</p>`;
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

/* ==================== Blog ==================== */
const blogPosts = [
  { title: "Managing Hypertension in Nairobi's Fast-Paced Life", excerpt: "High blood pressure is on the rise among young professionals. Here's how to keep it under control with simple lifestyle changes.", author: "Dr. Achieng", date: "Aug 20, 2026", readTime: "6 min read", category: "Heart Health", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop", link: "#" },
  { title: "5 Common Skin Problems in Kenya and How to Treat Them", excerpt: "From acne to eczema, our dermatologist Dr. Otieno shares tips for healthy skin in the Kenyan climate.", author: "Dr. Otieno", date: "Aug 15, 2026", readTime: "5 min read", category: "Dermatology", image: "https://images.unsplash.com/photo-1552642986-ccb41e7059e7?q=80&w=400&auto=format&fit=crop", link: "#" },
  { title: "Childhood Vaccinations: What Parents in Nairobi Need to Know", excerpt: "Keep your child safe with the right vaccination schedule. Our pediatrician explains what's required and when.", author: "Dr. Kamau", date: "Aug 10, 2026", readTime: "8 min read", category: "Pediatrics", image: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=400&auto=format&fit=crop", link: "#" },
  { title: "Working from Home? Here's How to Avoid Back Pain", excerpt: "Desk jobs and remote work are causing a spike in back problems. Our general physician shares simple stretches to stay pain-free.", author: "Dr. Mwangi", date: "Aug 5, 2026", readTime: "4 min read", category: "Wellness", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop", link: "#" },
  { title: "The Ultimate Guide to a Balanced Kenyan Diet", excerpt: "Githeri, sukuma wiki, ugali—how to eat healthy without breaking the bank. Our nutritionist-approved tips.", author: "Dr. Mwangi", date: "Jul 28, 2026", readTime: "7 min read", category: "Nutrition", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop", link: "#" },
  { title: "When Should You See a Doctor? Don't Ignore These Symptoms", excerpt: "Persistent fatigue, unexplained weight loss, sudden headaches—know when it's time to get professional help.", author: "Dr. Achieng", date: "Jul 20, 2026", readTime: "5 min read", category: "General Health", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=400&auto=format&fit=crop", link: "#" }
];

function renderBlogPosts() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;
  grid.innerHTML = blogPosts.map((post) => `
    <article class="blog-card">
      <div class="blog-card-image">
        <img src="${post.image}" alt="" loading="lazy">
        <span class="blog-category">${post.category}</span>
      </div>
      <div class="blog-card-content">
        <h3><a href="${post.link}">${post.title}</a></h3>
        <p>${post.excerpt}</p>
        <div class="post-meta">
          <span><i class="fa-solid fa-user-doctor" aria-hidden="true"></i> ${post.author}</span>
          <span><i class="fa-solid fa-clock" aria-hidden="true"></i> ${post.readTime}</span>
          <span><i class="fa-solid fa-calendar" aria-hidden="true"></i> ${post.date}</span>
        </div>
        <a href="${post.link}" class="read-more">Read More <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
      </div>
    </article>`).join('');
}

/* ==================== Book with a specific doctor (About page) ==================== */
function bookWithDoctor(btn) {
  const doctor = btn.getAttribute('data-doctor');
  openBookingModal();
  setTimeout(() => {
    $$('.doctor-card').forEach((card) => {
      const name = card.querySelector('strong')?.textContent;
      if (name === doctor) card.click();
    });
  }, 150);
}

/* ==================== Global init ==================== */
document.addEventListener('DOMContentLoaded', () => {
  /* Register scroll-reveal targets */
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

  renderTestimonials();
  renderBlogPosts();
  initFaqA11y();
  observeAnimations();
  updateWaitlist();
  setInterval(updateWaitlist, 60000);
  initRecentBookingsWidget();

  /* Wire every .open-booking-modal trigger */
  $$('.open-booking-modal').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openBookingModal(); });
  });

  /* Auto-open chat once per session */
  setTimeout(() => {
    if (sessionStorage.getItem('chatShown')) return;
    const toggle = document.getElementById('chat-toggle');
    if (toggle) {
      toggle.click();
      sessionStorage.setItem('chatShown', 'true');
    }
  }, 12000);

  /* Re-run scroll handler once on load in case we're already scrolled */
  onScroll();
});