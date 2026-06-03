/* ==========================================================================
   Nexus AI Academy JavaScript Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Mobile Navigation & Header Scroll State
    // ==========================================
    const header = document.getElementById('header');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const navigationMenu = document.getElementById('navigation-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Scroll Header Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        highlightActiveLink();
    });

    // Toggle Mobile Drawer
    menuToggleBtn.addEventListener('click', () => {
        menuToggleBtn.classList.toggle('active');
        navigationMenu.classList.toggle('open');
    });

    // Close mobile drawer on menu link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggleBtn.classList.remove('active');
            navigationMenu.classList.remove('open');
        });
    });

    // Highlight menu link on scroll
    function highlightActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 120; // offset header height

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop;
            const id = section.getAttribute('id');
            const targetLink = document.querySelector(`.nav-link[href="#${id}"]`);

            if (targetLink) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(item => item.classList.remove('active'));
                    targetLink.classList.add('active');
                }
            }
        });
    }

    // ==========================================
    // 2. Statistics Counter Animation
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function startCounters() {
        statNumbers.forEach(stat => {
            const targetValue = parseInt(stat.getAttribute('data-target'), 10);
            let currentValue = 0;
            const duration = 2000; // 2 seconds animation
            const steps = 60;
            const stepIncrement = Math.ceil(targetValue / steps);
            const stepTime = duration / steps;

            const counterInterval = setInterval(() => {
                currentValue += stepIncrement;
                if (currentValue >= targetValue) {
                    stat.innerText = targetValue + (targetValue === 95 ? '%' : '+');
                    clearInterval(counterInterval);
                } else {
                    stat.innerText = currentValue + '+';
                }
            }, stepTime);
        });
    }

    // Trigger counters only when stats section is scrolled into viewport
    const statsSection = document.getElementById('stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    countersStarted = true;
                    startCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(statsSection);
    }

    // ==========================================
    // 3. Curriculum Tabs & Accordions
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const curriculumContents = document.querySelectorAll('.curriculum-content');

    // Switch Curriculum Tabs
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state
            tabButtons.forEach(b => b.classList.remove('active'));
            curriculumContents.forEach(c => c.classList.remove('active'));

            // Set active clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Accordion Toggle Handlers (Curriculum & FAQs)
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            const isOpen = currentItem.classList.contains('open');
            
            // Optional: Close other accordions in the same container
            const siblings = currentItem.parentElement.querySelectorAll('.accordion-item');
            siblings.forEach(sibling => {
                if (sibling !== currentItem) {
                    sibling.classList.remove('open');
                }
            });
            
            // Toggle clicked
            if (isOpen) {
                currentItem.classList.remove('open');
            } else {
                currentItem.classList.add('open');
            }
        });
    });

    // Automatically expand the first item of accordions
    document.querySelectorAll('.curriculum-content').forEach(container => {
        const firstItem = container.querySelector('.accordion-item');
        if (firstItem) firstItem.classList.add('open');
    });
    
    const faqFirstItem = document.querySelector('.faq-accordion-container .accordion-item');
    if (faqFirstItem) faqFirstItem.classList.add('open');

    // ==========================================
    // 4. Interactive Salary Simulator
    // ==========================================
    const experienceSlider = document.getElementById('experience-slider');
    const trackButtons = document.querySelectorAll('.track-btn');
    const salaryBaseEl = document.getElementById('salary-base');
    const salaryNexusEl = document.getElementById('salary-nexus');

    let currentFactor = 1.2;
    let currentMin = 4;
    let currentMax = 12;

    trackButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            trackButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFactor = parseFloat(btn.getAttribute('data-factor'));
            currentMin = parseInt(btn.getAttribute('data-min'), 10);
            currentMax = parseInt(btn.getAttribute('data-max'), 10);
            
            updateSimulator();
        });
    });

    experienceSlider.addEventListener('input', updateSimulator);

    function updateSimulator() {
        const experienceVal = parseInt(experienceSlider.value, 10); // ranges 1 to 5
        
        // Calculate dynamic salaries (LPA)
        const nexusSalary = currentMin + (experienceVal - 1) * ((currentMax - currentMin) / 4);
        
        // Base salary (Without training) represents self-taught or legacy role, starting lower and scaling slower
        const baseMin = 3.0;
        const baseMax = 6.5;
        const baseSalary = baseMin + (experienceVal - 1) * ((baseMax - baseMin) / 4);
        
        // Update texts
        salaryBaseEl.innerText = baseSalary.toFixed(1) + ' LPA';
        salaryNexusEl.innerText = nexusSalary.toFixed(1) + ' LPA';

        // Calculate heights proportional to maximum potential (30 LPA)
        const maxChartLpa = 30;
        const baseHeight = (baseSalary / maxChartLpa) * 100;
        const nexusHeight = (nexusSalary / maxChartLpa) * 100;

        // Apply heights to DOM bars
        salaryBaseEl.parentElement.style.height = `${Math.max(baseHeight, 20)}%`;
        salaryNexusEl.parentElement.style.height = `${Math.max(nexusHeight, 25)}%`;
    }

    // Initialize Simulator Values on Load
    updateSimulator();

    // ==========================================
    // 5. Testimonial Slider / Swiper
    // ==========================================
    const sliderTrack = document.getElementById('testimonial-slider-track');
    const testimonialCards = document.querySelectorAll('.testimonials-slider .testimonial-card');
    const sliderPrevBtn = document.getElementById('slider-prev');
    const sliderNextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots-container');

    let currentSlideIndex = 0;
    const totalSlides = testimonialCards.length;
    let autoSlideInterval;

    // Create dynamic dot buttons
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.classList.add('dot-btn');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => {
            goToSlide(i);
            resetAutoSlide();
        });
        dotsContainer.appendChild(dot);
    }

    const dotButtons = document.querySelectorAll('.dot-btn');

    function goToSlide(index) {
        currentSlideIndex = index;
        if (currentSlideIndex >= totalSlides) currentSlideIndex = 0;
        if (currentSlideIndex < 0) currentSlideIndex = totalSlides - 1;

        // Slide animation via translate transition
        sliderTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

        // Update dots state
        dotButtons.forEach((dot, idx) => {
            if (idx === currentSlideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    sliderPrevBtn.addEventListener('click', () => {
        goToSlide(currentSlideIndex - 1);
        resetAutoSlide();
    });

    sliderNextBtn.addEventListener('click', () => {
        goToSlide(currentSlideIndex + 1);
        resetAutoSlide();
    });

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            goToSlide(currentSlideIndex + 1);
        }, 5000); // switch slide every 5 seconds
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Initialize Autoplay
    startAutoSlide();

    // ==========================================
    // 6. Filterable Gallery Grid
    // ==========================================
    const filterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.3s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // ==========================================
    // 7. Lead Form Valdation & Success Modal Popup
    // ==========================================
    const leadForm = document.getElementById('lead-generation-form');
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const phoneInput = document.getElementById('form-phone');
    const courseInput = document.getElementById('form-course');
    const submitBtn = document.getElementById('lead-form-submit');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Validation patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    function validateField(inputEl, condition, errorElId) {
        const formGroup = inputEl.closest('.form-group');
        if (condition) {
            formGroup.classList.remove('invalid');
            return true;
        } else {
            formGroup.classList.add('invalid');
            return false;
        }
    }

    // Input event validations
    nameInput.addEventListener('input', () => {
        validateField(nameInput, nameInput.value.trim().length > 1, 'name-error');
    });
    emailInput.addEventListener('input', () => {
        validateField(emailInput, emailRegex.test(emailInput.value.trim()), 'email-error');
    });
    phoneInput.addEventListener('input', () => {
        const cleanVal = phoneInput.value.trim().replace(/\D/g, '');
        validateField(phoneInput, phoneRegex.test(cleanVal), 'phone-error');
    });
    courseInput.addEventListener('change', () => {
        validateField(courseInput, courseInput.value !== '', 'course-error');
    });

    // Form Submit Hook
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Perform final audit
        const isNameValid = validateField(nameInput, nameInput.value.trim().length > 1, 'name-error');
        const isEmailValid = validateField(emailInput, emailRegex.test(emailInput.value.trim()), 'email-error');
        const cleanPhone = phoneInput.value.trim().replace(/\D/g, '');
        const isPhoneValid = validateField(phoneInput, phoneRegex.test(cleanPhone), 'phone-error');
        const isCourseValid = validateField(courseInput, courseInput.value !== '', 'course-error');

        if (isNameValid && isEmailValid && isPhoneValid && isCourseValid) {
            // Apply submit states / loading spinners
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Send real AJAX post request to backend serverless route
            fetch('/api/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    course: courseInput.value
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server returned HTTP code ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Populate Modal details
                    document.getElementById('user-display-name').innerText = nameInput.value.trim();
                    document.getElementById('user-display-phone').innerText = '+91 ' + phoneInput.value.trim();
                    
                    // Show Modal window overlay
                    successModal.classList.add('active');

                    // Clear input states
                    leadForm.reset();
                } else {
                    alert('Submission Error: ' + (data.message || 'Please verify parameters and try again.'));
                }
            })
            .catch(err => {
                console.error('API submission error:', err);
                alert('Connection Error: Failed to reach enrollment endpoint. Your request could not be processed.');
            })
            .finally(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            });
        }
    });

    // Modal Closure Handler
    closeModalBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    // Close modal on background click
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // ==========================================
    // 8. Auto Selection from Course Cards
    // ==========================================
    const enrollButtons = document.querySelectorAll('.enroll-course-btn');
    
    enrollButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const courseName = btn.getAttribute('data-course');
            if (courseName && courseInput) {
                courseInput.value = courseName;
                // Force validate change
                validateField(courseInput, true, 'course-error');
            }
        });
    });

});
