/* ==================== Global Helpers ==================== */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==================== Mobile Menu Toggle ==================== */
function closeMobileMenu() {
    const nav = document.getElementById('mobile-nav');
    const cta = document.getElementById('header-cta');
    const hamburger = document.querySelector('.hamburger');
    nav.classList.remove('open');
    cta.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.querySelector('i').className = 'fa-solid fa-bars';
}

function toggleMobileMenu() {
    const nav = document.getElementById('mobile-nav');
    const cta = document.getElementById('header-cta');
    const hamburger = document.querySelector('.hamburger');
    
    const isOpen = !nav.classList.contains('open');
    if (isOpen) {
        nav.classList.add('open');
        cta.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.querySelector('i').className = 'fa-solid fa-xmark';
    } else {
        closeMobileMenu();
    }
}

// Close mobile menu when clicking outside header, nav, or CTA
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        const nav = document.getElementById('mobile-nav');
        const cta = document.getElementById('header-cta');
        const hamburger = document.querySelector('.hamburger');
        const isMenuOpen = nav.classList.contains('open');
        if (isMenuOpen && !e.target.closest('.hamburger') && !e.target.closest('#mobile-nav') && !e.target.closest('#header-cta')) {
            closeMobileMenu();
        }
    }
});

/* ==================== Module 2: Live Waitlist ==================== */
function updateWaitlist() {
    const savedWait = localStorage.getItem('swiftMedWait');
    const waitTime = savedWait ? parseInt(savedWait) : Math.floor(Math.random() * 15); 
    if(savedWait) {
        setTimeout(() => { localStorage.removeItem('swiftMedWait'); updateWaitlist(); }, 60000); 
    }
    const nextSlot = new Date(Date.now() + (Math.floor(Math.random() * 3) + 1) * 60 * 60 * 1000);
    const queueSize = Math.floor(Math.random() * 5); 
    const slotString = `Today, ${nextSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const clinicWaitElement = document.getElementById('wait-clinic');
    clinicWaitElement.innerText = `${waitTime} Mins`;
    document.getElementById('wait-next-slot').innerText = slotString;
    document.getElementById('wait-queue').innerText = `${queueSize} Person${queueSize !== 1 ? 's' : ''} ahead`;
    if (waitTime === 0) clinicWaitElement.style.color = '#25D366';
    else if (waitTime < 10) clinicWaitElement.style.color = '#fbbf24';
    else clinicWaitElement.style.color = '#f87171';
}

/* ==================== Module 1: Insurance Pre-Verification ==================== */
document.getElementById('insurance-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('patient-name').value.trim();
    const provider = document.getElementById('provider').value;
    const memberId = document.getElementById('member-id').value.trim();
    
    // Clear previous errors
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    let hasError = false;
    
    if (!name) {
        document.getElementById('name-error').style.display = 'block';
        hasError = true;
    }
    if (!provider) {
        document.getElementById('provider-error').style.display = 'block';
        hasError = true;
    }
    if (!memberId) {
        document.getElementById('member-error').style.display = 'block';
        hasError = true;
    }
    if (hasError) { showToast("Please fill in all required fields.", "error"); return; }
    
    // Show loading spinner and disable button
    const verifyBtn = document.getElementById('verify-btn');
    const btnText = verifyBtn.querySelector('.btn-text');
    const spinner = verifyBtn.querySelector('.spinner');
    verifyBtn.disabled = true;
    btnText.textContent = "Verifying...";
    spinner.style.display = 'inline-block';
    
    // Simulate a short delay before redirecting
    setTimeout(() => {
        localStorage.setItem('swiftMedWait', '5');
        updateWaitlist();
        const message = `Hi swiftMed Kenya, I need pre-verification.\nName: ${name}\nInsurance: ${provider}\nMember ID: ${memberId}`;
        const waLink = `https://wa.me/254702555093?text=${encodeURIComponent(message)}`;
        showToast(`Hi ${name}, verification request sent to WhatsApp!`, 'success');
        window.open(waLink, '_blank');
        
        // Reset button and form
        verifyBtn.disabled = false;
        btnText.textContent = "Verify My Coverage Instantly";
        spinner.style.display = 'none';
        this.reset();
    }, 1500);
});

/* ==================== Module 3: Feedback Loop ==================== */
function triggerFeedbackCheckout(patientName) {
    const initialMessage = `Hello ${patientName}, this is swiftMed Kenya. We value your time. How was your experience with us today?`;
    const waLink = `https://wa.me/254702555093?text=${encodeURIComponent(initialMessage)}`;
    showToast(`Simulating post-visit WhatsApp to ${patientName}...`, 'success');
    window.open(waLink, '_blank');
    handleFeedbackResponse(3, patientName);
}
function handleFeedbackResponse(rating, patientName) {
    let message = "";
    if (rating >= 4) {
        message = `We're thrilled to hear you had a ${rating}-star experience at swiftMed, ${patientName}! Could you please leave us a quick Google review? [Insert your Google Review Link here]`;
        showToast(`Good rating! Requesting Google Review for ${patientName}.`, 'success');
    } else if (rating <= 3) {
        message = `We are deeply sorry to hear that we fell short of your expectations, ${patientName}. An Executive Patient Care Manager will call you within 15 minutes.`;
        showToast(`Poor rating! Escalating to Executive Manager for ${patientName}.`, 'error');
    }
    const waLink = `https://wa.me/254702555093?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
}

/* ==================== Dynamic Testimonials (Realistic & Local) ==================== */
const testimonials = [
    {
        name: "Grace Wanjiru",
        role: "Entrepreneur, Westlands",
        text: "I used to spend half a day at the clinic waiting. Now I book on WhatsApp, walk in at my slot, and I'm out in 20 minutes. This is how healthcare should be."
    },
    {
        name: "Brian Ochieng",
        role: "Software Developer, Kilimani",
        text: "The insurance verification saved me from a huge bill. They confirmed my SHA cover in under a minute before I even visited. No hidden charges, no stress."
    },
    {
        name: "Amina Yusuf",
        role: "HR Manager, Upper Hill",
        text: "Our company moved all staff health to swiftMed. Employees love it because they don't lose work time. I love it because the billing is automatic. Win-win."
    },
    {
        name: "Peter Kariuki",
        role: "Small Business Owner, CBD",
        text: "I saw the live wait ticker showing zero minutes, so I just walked in. It was true – I was in and out before my tea got cold. Unbelievable."
    },
    {
        name: "Lucy Njeri",
        role: "Teacher, South B",
        text: "The teleconsult option is a lifesaver. I didn't need to leave the house when my son was sick. The doctor called, gave a prescription, and we were done."
    },
    {
        name: "David Mwangi",
        role: "Sales Executive, Nairobi",
        text: "I always hate the queueing part of visiting a doctor. swiftMed made it feel like a premium experience. The doctor even explained everything clearly."
    }
];

function renderTestimonials() {
    const grid = document.getElementById('testimonial-grid');
    grid.innerHTML = testimonials.map(t => `
        <div class="testimonial-card animate-on-scroll">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-quote">"${t.text}"</p>
            <div class="testimonial-author">
                <div class="testimonial-avatar">${t.name.charAt(0)}</div>
                <div>
                    <div class="testimonial-name">${t.name}</div>
                    <div class="testimonial-role">${t.role}</div>
                </div>
            </div>
        </div>
    `).join('');

    // Trigger animation for visible cards
    observeAnimations();
}

/* ==================== Intersection Observer for Animations ==================== */
function observeAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
}

/* ==================== Module 4: Corporate Logic ==================== */
document.getElementById('corp-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    showToast('Redirecting to secure HR Dashboard...', 'success');
    this.reset();
});

/* Password visibility toggle */
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

/* Corporate Access Multi-step Form */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('corp-access-form');
    const steps = form.querySelectorAll('.form-step');
    const progressBar = document.getElementById('corp-progress-bar');
    let currentStep = 1;

    function updateProgress() {
        const percent = ((currentStep - 1) / (steps.length - 1)) * 100;
        progressBar.style.width = percent + '%';
    }

    function showStep(step) {
        steps.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        document.querySelector(`.form-step[data-step="${step}"]`).style.display = 'block';
        currentStep = step;
        updateProgress();
    }

    // Next button
    form.querySelector('.next-step').addEventListener('click', function() {
        // Validate current step fields
        const currentFields = document.querySelector(`.form-step[data-step="${currentStep}"]`).querySelectorAll('input');
        let valid = true;
        currentFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('invalid');
                const error = field.parentElement.querySelector('.error-msg');
                if (error) error.style.display = 'block';
                valid = false;
            } else {
                field.classList.remove('invalid');
                const error = field.parentElement.querySelector('.error-msg');
                if (error) error.style.display = 'none';
            }
        });
        if (valid) {
            showStep(currentStep + 1);
        }
    });

    // Back button
    form.querySelector('.prev-step').addEventListener('click', function() {
        showStep(currentStep - 1);
    });

    // Submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const hrName = form.querySelector('input[type="text"]:nth-of-type(1)').value;
        const company = form.querySelector('input[type="text"]:nth-of-type(2)').value;
        const phone = form.querySelector('input[type="tel"]').value;
        const employees = form.querySelector('input[type="number"]').value;
        const message = `Hi swiftMed Corporate Concierge,\n\nI want to request corporate access.\n\nHR Manager: ${hrName}\nCompany: ${company}\nOffice Phone: ${phone}\nEmployees: ${employees}`;
        const waLink = `https://wa.me/254702555093?text=${encodeURIComponent(message)}`;
        showToast('Request sent! Our concierge will call you within 2 hours.', 'success');
        window.open(waLink, '_blank');
        this.reset();
        showStep(1);
    });

    // Initialize
    showStep(1);
});

/* ==================== Booking Modal Logic ==================== */
let bookingState = {
    apptType: '',
    doctor: '',
    date: '',
    time: '',
    patient: {
        name: '',
        phone: '',
        email: '',
        notes: ''
    },
    fee: 0
};

const fees = {
    'in-clinic': 3000,
    'teleconsult': 2500
};

function setApptType(type, element) {
    bookingState.apptType = type;
    bookingState.fee = fees[type];
    document.querySelectorAll('.type-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
}

function setDoctor(doctor, element) {
    bookingState.doctor = doctor;
    document.querySelectorAll('.doctor-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
}

function generateTimeSlots() {
    const date = document.getElementById('booking-date').value;
    const slotsContainer = document.getElementById('time-slots');
    slotsContainer.innerHTML = '';
    // Simulate available slots (some disabled)
    const allSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
    // Shuffle some to be unavailable for demo
    const unavailable = ['11:00 AM', '3:00 PM']; // example
    allSlots.forEach(slot => {
        const btn = document.createElement('button');
        btn.className = `slot-btn${unavailable.includes(slot) ? ' disabled' : ''}`;
        btn.textContent = slot;
        btn.disabled = unavailable.includes(slot);
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            setTime(slot, this);
        });
        slotsContainer.appendChild(btn);
    });
    // Clear previous selected time
    bookingState.time = '';
}

function setTime(time, element) {
    bookingState.time = time;
    document.querySelectorAll('.slot-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
}

function nextStep(step) {
    // Validation before advancing
    if (step === 2 && !bookingState.apptType) {
        showToast("Please select the type of visit.", "error");
        return;
    }
    if (step === 3 && !bookingState.doctor) {
        showToast("Please select a doctor.", "error");
        return;
    }
    if (step === 4 && !bookingState.time) {
        showToast("Please select a time slot.", "error");
        return;
    }
    if (step === 5) {
        // Validate patient details from form before going to review
        const form = document.getElementById('patient-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        // Capture patient data
        bookingState.patient.name = document.getElementById('patient-fullname').value.trim();
        bookingState.patient.phone = document.getElementById('patient-phone').value.trim();
        bookingState.patient.email = document.getElementById('patient-email').value.trim();
        bookingState.patient.notes = document.getElementById('patient-notes').value.trim();
        // Populate summary
        document.getElementById('summary-type').innerText = bookingState.apptType === 'in-clinic' ? 'In‑Clinic' : 'Teleconsult';
        document.getElementById('summary-doctor').innerText = bookingState.doctor;
        document.getElementById('summary-date').innerText = document.getElementById('booking-date').options[document.getElementById('booking-date').selectedIndex].text;
        document.getElementById('summary-time').innerText = bookingState.time;
        document.getElementById('summary-patient').innerText = bookingState.patient.name;
        document.getElementById('summary-phone').innerText = bookingState.patient.phone;
        document.getElementById('mpesa-phone').innerText = bookingState.patient.phone;
        // Update fee text
        document.getElementById('summary-fee').innerText = `KES ${bookingState.fee.toLocaleString()}`;
    }
    
    // Show the target step
    document.querySelectorAll('.modal-step').forEach(s => s.style.display = 'none');
    document.getElementById('step-' + step).style.display = 'block';
    
    // Update progress bar
    updateProgress(step);
    
    // If step 3, populate time slots on first visit
    if (step === 3 && !document.querySelector('.slot-btn')) {
        generateTimeSlots();
    }
}

function updateProgress(step) {
    const dots = document.querySelectorAll('.step-dot');
    const lines = document.querySelectorAll('.step-line');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i + 1 <= step);
    });
    lines.forEach((line, i) => {
        line.classList.toggle('active', i + 1 < step);
    });
}

function simulatePayment() {
    const payBtn = document.getElementById('pay-btn');
    const btnText = payBtn.querySelector('.btn-text');
    const spinner = payBtn.querySelector('.spinner');
    payBtn.disabled = true;
    btnText.textContent = "Waiting for PIN...";
    spinner.style.display = 'inline-block';
    
    setTimeout(() => {
        // Generate booking reference
        const ref = 'SM-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        document.getElementById('booking-ref').innerText = ref;
        showToast("M-PESA payment confirmed! Booking secured.", "success");
        document.querySelectorAll('.modal-step').forEach(s => s.style.display = 'none');
        document.getElementById('step-6').style.display = 'block';
        updateProgress(6);
        
        // Reset button state
        payBtn.disabled = false;
        btnText.textContent = "Send STK Push";
        spinner.style.display = 'none';
        
        // Optionally store booking in localStorage
        localStorage.setItem('lastBooking', JSON.stringify({...bookingState, ref}));
        
        // Reset modal for next time
        setTimeout(() => {
            resetBookingModal();
        }, 1000);
    }, 2000);
}

function resetBookingModal() {
    bookingState = { apptType: '', doctor: '', date: '', time: '', patient: {}, fee: 0 };
    document.querySelectorAll('.type-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.doctor-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.slot-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('patient-form').reset();
    document.getElementById('booking-date').selectedIndex = 0;
}

function openBookingModal() {
    resetBookingModal();
    document.getElementById('booking-modal').classList.add('active');
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'none';
    document.getElementById('step-4').style.display = 'none';
    document.getElementById('step-5').style.display = 'none';
    document.getElementById('step-6').style.display = 'none';
    updateProgress(1);
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('active');
}

/* ==================== Symptom Checker ==================== */
function routeSpecialist() {
    const symptom = document.getElementById('symptom-select').value;
    if (!symptom) { showToast("Please select a symptom.", "error"); return; }
    showToast(`Based on your symptoms, we recommend our ${symptom}.`, "success");
    setTimeout(() => { openBookingModal(); }, 1000);
}

/* ==================== Emergency Ambulance ==================== */
function toggleEmergencyMenu() {
    document.getElementById('emergency-menu').classList.toggle('active');
}

/* ==================== FAQ Toggle ==================== */
function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const isOpen = button.classList.contains('open');
    
    // Close all other open FAQs
    document.querySelectorAll('.faq-question.open').forEach(q => {
        if (q !== button) {
            q.classList.remove('open');
            q.nextElementSibling.classList.remove('open');
            q.querySelector('i').classList.remove('fa-chevron-up');
            q.querySelector('i').classList.add('fa-chevron-down');
        }
    });
    
    // Toggle current
    button.classList.toggle('open');
    answer.classList.toggle('open');
    const icon = button.querySelector('i');
    if (isOpen) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

/* ==================== Header Shadow on Scroll ==================== */
window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

/* ==================== Back to Top Button ==================== */
window.addEventListener('scroll', () => {
    const backToTop = document.getElementById('back-to-top');
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

/* ==================== Initialize on Load ==================== */
document.addEventListener('DOMContentLoaded', () => {
    // Add animate-on-scroll to major sections
    const sectionsToAnimate = [
        '.how-it-works .step-card',
        '.corporate-section .corporate-text',
        '.corporate-form-box',
        '.faq-section .faq-item',
        '.patient-voices .testimonial-card'
    ];
    sectionsToAnimate.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.classList.add('animate-on-scroll'));
    });
    
    // Initialize animations
    observeAnimations();
    
    // Render testimonials
    renderTestimonials();
    
    // Live waitlist update
    updateWaitlist();
    setInterval(updateWaitlist, 30000);

    // Hook up all "Book" buttons
    document.querySelectorAll('.open-booking-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openBookingModal();
        });
    });
});