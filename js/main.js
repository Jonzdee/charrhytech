/* ============================================
   NEXCORE — Shared JavaScript (main.js)
   ============================================ */

// ─── Cursor glow ───────────────────────────
(function () {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
})();

// ─── Particle canvas ───────────────────────
(function () {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    class P {
        reset() {
            this.x = Math.random() * W; this.y = Math.random() * H;
            this.r = Math.random() * 1.1 + 0.2;
            this.vx = (Math.random() - 0.5) * 0.18; this.vy = (Math.random() - 0.5) * 0.18;
            this.phase = Math.random() * Math.PI * 2;
        }
        constructor() { this.reset(); }
        tick() {
            this.x += this.vx; this.y += this.vy; this.phase += 0.018;
            if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
        }
        draw() {
            const a = 0.08 + Math.abs(Math.sin(this.phase)) * 0.18;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,229,255,${a})`; ctx.fill();
        }
    }
    for (let i = 0; i < 75; i++) particles.push(new P());

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.tick(); p.draw(); });
        for (let i = 0; i < particles.length; i++)
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                const d = Math.hypot(dx, dy);
                if (d < 95) {
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,229,255,${0.045 * (1 - d / 95)})`; ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        requestAnimationFrame(loop);
    }
    loop();
})();

// ─── Navbar ────────────────────────────────
(function () {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
        mobileMenu.querySelectorAll('.mobile-link').forEach(link =>
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            })
        );
    }
})();

// ─── Scroll reveal ─────────────────────────
(function () {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => io.observe(el));
})();

// ─── Hero line animation ────────────────────
(function () {
    document.querySelectorAll('.hero-word').forEach((el, i) => {
        el.style.animationDelay = (0.08 + i * 0.14) + 's';
    });
})();

// ─── Number counter ────────────────────────
window.animateCounter = function (el, target, suffix = '') {
    let start = 0, duration = 1600, startTime = null;
    function step(ts) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
};

// ─── Counter observer ──────────────────────
(function () {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                const target = parseInt(el.dataset.target || 0);
                const suffix = el.dataset.suffix || '';
                animateCounter(el, target, suffix);
                io.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-counter]').forEach(el => io.observe(el));
})();

// ─── Form handler ──────────────────────────
window.handleContactForm = function (e, formId, successId) {
    e.preventDefault();
    const form = document.getElementById(formId);
    const success = document.getElementById(successId);
    const btn = form.querySelector('[type=submit]');
    const span = btn.querySelector('span') || btn;
    const orig = span.textContent;
    span.textContent = 'Sending…'; btn.disabled = true;
    setTimeout(() => {
        form.style.display = 'none';
        if (success) success.style.display = 'flex';
    }, 1100);
};

// ─── Chatbot ───────────────────────────────
(function () {
    let chatOpen = false, chatHistory = [], chatInited = false;

    const toggle = document.getElementById('chat-toggle');
    const wrap = document.getElementById('chatbot-wrap');
    const msgs = document.getElementById('chat-msgs');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const badge = document.querySelector('.chat-badge');
    const iconOpen = document.getElementById('chat-icon-open');
    const iconClose = document.getElementById('chat-icon-close');

    if (!toggle || !wrap) return;

    const SYSTEM = `You are a friendly, knowledgeable customer service AI for NexCore — a premium software and AI studio.

Services:
• Software Development — Full-stack web/mobile apps, APIs, cloud-native systems, DevOps, React, Node.js, Python, Go
• Software Consulting  — Architecture reviews, tech audits, security assessments, digital transformation strategy
• AI & Automation      — Custom LLM integrations, workflow automation, intelligent chatbots, ML/predictive analytics

Key facts:
• 5+ years experience, 50+ shipped projects, 98% satisfaction, 30+ happy clients
• Remote-first, NDA-protected, 24hr response time
• Work with startups, scale-ups, enterprises
• Sprint-based agile process, full transparency

Rules:
• Be warm, concise (2-4 sentences), and genuinely helpful
• For pricing/timeline specifics, say: "we'd love to discuss that on a free discovery call"
• Encourage users to visit the Contact page for project briefs
• Never make up details`;

    function addMsg(role, text) {
        const d = document.createElement('div');
        d.className = `msg msg-${role}`;
        d.textContent = text;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
        const d = document.createElement('div');
        d.className = 'msg msg-bot typing-indicator'; d.id = 'typing';
        d.innerHTML = '<div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div>';
        msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }
    function removeTyping() { const t = document.getElementById('typing'); if (t) t.remove(); }

    async function send() {
        const text = input.value.trim(); if (!text) return;
        input.value = ''; input.style.height = 'auto';
        addMsg('user', text);
        chatHistory.push({ role: 'user', content: text });
        showTyping(); sendBtn.disabled = true;
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: SYSTEM,
                    messages: chatHistory
                })
            });
            const data = await res.json();
            removeTyping();
            const reply = data.content?.[0]?.text || "I'm having trouble connecting right now. Please use our Contact page and we'll get back to you within 24 hours!";
            chatHistory.push({ role: 'assistant', content: reply });
            addMsg('bot', reply);
        } catch {
            removeTyping();
            addMsg('bot', "Connection hiccup! Try again or head to our Contact page — we respond within 24 hours.");
        }
        sendBtn.disabled = false;
    }

    toggle.addEventListener('click', () => {
        chatOpen = !chatOpen;
        wrap.classList.toggle('open', chatOpen);
        if (iconOpen) iconOpen.style.display = chatOpen ? 'none' : 'block';
        if (iconClose) iconClose.style.display = chatOpen ? 'block' : 'none';
        if (badge) badge.style.display = 'none';
        if (chatOpen && !chatInited) {
            chatInited = true;
            setTimeout(() => addMsg('bot', "👋 Hey! I'm NexCore AI. Whether you have questions about software development, consulting, or AI automation — I'm here to help. What's on your mind?"), 350);
        }
        if (chatOpen) setTimeout(() => input.focus(), 400);
    });

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    input.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 96) + 'px'; });
})();