/**
 * ===== T Café - Main JavaScript =====
 * Premium café website interactions and animations
 */

document.addEventListener('DOMContentLoaded', () => {

  // ===== PRELOADER =====
  const preloader = document.querySelector('.preloader');
  window.addEventListener('load', () => {
    setTimeout(() => { if (preloader) preloader.classList.add('hidden'); }, 1500);
  });
  // Fallback
  setTimeout(() => { if (preloader) preloader.classList.add('hidden'); }, 4000);

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');
  const stickyOrder = document.querySelector('.sticky-order-btn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 80);
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 500);
    if (stickyOrder) stickyOrder.classList.toggle('visible', scrollY > 800);
    updateActiveNav();
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ===== ACTIVE NAV LINK ON SCROLL =====
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.nav-cta)');
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
  }

  // ===== CLOSE MOBILE MENU ON CLICK =====
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.querySelector('.navbar-collapse');
      if (collapse && collapse.classList.contains('show')) {
        bootstrap.Collapse.getInstance(collapse)?.hide();
      }
    });
  });

  // ===== DARK MODE TOGGLE =====
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('cafe-theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    const icon = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    document.querySelectorAll('.theme-toggle').forEach(btn => btn.innerHTML = icon);
    localStorage.setItem('cafe-theme', isDark ? 'light' : 'dark');
  }
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // ===== SCROLL REVEAL ANIMATIONS =====
  function revealOnScroll() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    elements.forEach((el, i) => {
      const top = el.getBoundingClientRect().top;
      const trigger = window.innerHeight * 0.88;
      if (top < trigger) {
        setTimeout(() => el.classList.add('active'), i * 60);
      }
    });
  }
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // ===== ANIMATED COUNTERS =====
  let countersAnimated = false;
  function animateCounters() {
    if (countersAnimated) return;
    const counters = document.querySelectorAll('.counter-value');
    if (!counters.length) return;
    const first = counters[0].getBoundingClientRect().top;
    if (first > window.innerHeight) return;
    countersAnimated = true;
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current) + suffix;
      }, 16);
    });
  }
  window.addEventListener('scroll', animateCounters);

  // ===== MENU FILTER =====
  const filterBtns = document.querySelectorAll('.menu-filter-btn');
  const menuCards = document.querySelectorAll('.menu-card-wrapper');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      menuCards.forEach((card, i) => {
        const category = card.getAttribute('data-category');
        const show = filter === 'all' || category === filter;
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        if (show) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => { card.style.display = 'none'; }, 400);
        }
      });
    });
  });

  // ===== ADD TO CART / ORDER SYSTEM =====
  const orderItems = {};
  const orderList = document.getElementById('orderList');
  const orderTotal = document.getElementById('orderTotal');
  const orderCount = document.getElementById('orderCount');

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.menu-card');
      const name = card.querySelector('h5').textContent;
      const priceText = card.querySelector('.menu-price').textContent;
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const img = card.querySelector('img').src;

      if (orderItems[name]) {
        orderItems[name].qty += 1;
      } else {
        orderItems[name] = { name, price, img, qty: 1 };
      }
      updateOrderUI();
      // Button feedback
      btn.innerHTML = '<i class="fas fa-check"></i>';
      btn.style.background = '#25d366';
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-plus"></i>';
        btn.style.background = '';
      }, 1000);
    });
  });

  function updateOrderUI() {
    if (!orderList) return;
    orderList.innerHTML = '';
    let total = 0;
    let count = 0;
    Object.values(orderItems).forEach(item => {
      total += item.price * item.qty;
      count += item.qty;
      const div = document.createElement('div');
      div.className = 'order-item';
      div.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="order-item-info">
          <h6>${item.name}</h6>
          <span>₹${item.price}</span>
        </div>
        <div class="order-qty">
          <button onclick="changeQty('${item.name}', -1)"><i class="fas fa-minus"></i></button>
          <span class="qty-value">${item.qty}</span>
          <button onclick="changeQty('${item.name}', 1)"><i class="fas fa-plus"></i></button>
        </div>
      `;
      orderList.appendChild(div);
    });
    if (orderTotal) orderTotal.textContent = `₹${total.toFixed(0)}`;
    if (orderCount) orderCount.textContent = count;
    // Show empty state
    if (count === 0) {
      orderList.innerHTML = '<p style="color:rgba(250,243,235,0.5);text-align:center;padding:30px;">Your cart is empty. Add items from the menu!</p>';
    }
  }

  window.changeQty = function(name, delta) {
    if (orderItems[name]) {
      orderItems[name].qty += delta;
      if (orderItems[name].qty <= 0) delete orderItems[name];
      updateOrderUI();
    }
  };

  // ===== WHATSAPP ORDER =====
  const whatsappOrderBtn = document.getElementById('whatsappOrder');
  if (whatsappOrderBtn) {
    whatsappOrderBtn.addEventListener('click', () => {
      const items = Object.values(orderItems);
      if (!items.length) {
        alert('Please add items to your order first!');
        return;
      }
      let msg = '🛒 *New Order from Brew & Bean*\n\n';
      let total = 0;
      items.forEach(item => {
        msg += `☕ ${item.name} x${item.qty} — ₹${item.price * item.qty}\n`;
        total += item.price * item.qty;
      });
      msg += `\n💰 *Total: ₹${total}*\n\nPlease confirm my order! 🙏`;
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/9313254782?text=${encoded}`, '_blank');
    });
  }

  // ===== TESTIMONIAL SLIDER =====
  const testimonialTrack = document.querySelector('.testimonial-track');
  const testimonialCards = document.querySelectorAll('.testimonial-slide');
  let currentSlide = 0;

  function showSlide(index) {
    if (!testimonialTrack || !testimonialCards.length) return;
    const totalSlides = testimonialCards.length;
    currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    const offset = -currentSlide * 100;
    testimonialTrack.style.transform = `translateX(${offset}%)`;
  }

  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

  // Auto-slide testimonials
  setInterval(() => showSlide(currentSlide + 1), 5000);

  // ===== GALLERY LIGHTBOX =====
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (lightboxImg && lightbox) {
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ===== OFFER POPUP =====
  const offerPopup = document.getElementById('offerPopup');
  const offerClose = document.querySelector('.offer-popup-close');
  const dismissed = sessionStorage.getItem('offer-dismissed');

  if (!dismissed && offerPopup) {
    setTimeout(() => { offerPopup.classList.add('active'); }, 5000);
  }
  if (offerClose) {
    offerClose.addEventListener('click', () => {
      offerPopup.classList.remove('active');
      sessionStorage.setItem('offer-dismissed', 'true');
    });
  }
  if (offerPopup) {
    offerPopup.addEventListener('click', (e) => {
      if (e.target === offerPopup) {
        offerPopup.classList.remove('active');
        sessionStorage.setItem('offer-dismissed', 'true');
      }
    });
  }

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const message = document.getElementById('contactMessage').value;

      // WhatsApp integration
      const msg = `📧 *Contact from Brew & Bean Website*\n\n👤 Name: ${name}\n📧 Email: ${email}\n💬 Message: ${message}`;
      window.open(`https://wa.me/9313254782?text=${encodeURIComponent(msg)}`, '_blank');
      contactForm.reset();
      alert('Message sent via WhatsApp! We\'ll get back to you soon. ☕');
    });
  }

  // ===== NEWSLETTER FORM =====
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input').value;
      alert(`Thanks for subscribing with ${email}! ☕ You'll receive our latest offers.`);
      newsletterForm.reset();
    });
  }

  // Initialize order UI
  updateOrderUI();
});
