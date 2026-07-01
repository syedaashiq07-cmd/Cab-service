// Premium Cab Service Application Controller

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // 1. Loading Screen Removal
    const loader = document.getElementById("loading-screen");
    if (loader) {
        setTimeout(() => {
            loader.classList.add("opacity-0", "pointer-events-none");
            setTimeout(() => loader.remove(), 700);
        }, 1200);
    }

    // 2. Scroll Events Handler (Sticky Header & Progress Bar)
    const header = document.getElementById("sticky-header");
    const progressBar = document.getElementById("scroll-progress-bar");
    const backToTop = document.getElementById("back-to-top");

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // Progress bar width
        if (progressBar) {
            progressBar.style.width = `${scrollPercent}%`;
        }

        // Sticky Header styling
        if (header) {
            if (scrollTop > 40) {
                header.classList.add("shadow-luxury", "border-gray-100");
                header.classList.remove("border-transparent");
            } else {
                header.classList.remove("shadow-luxury", "border-gray-100");
                header.classList.add("border-transparent");
            }
        }

        // Back to top button visibility
        if (backToTop) {
            if (scrollTop > 400) {
                backToTop.classList.remove("opacity-0", "scale-75", "pointer-events-none");
                backToTop.classList.add("opacity-100", "scale-100");
            } else {
                backToTop.classList.add("opacity-0", "scale-75", "pointer-events-none");
                backToTop.classList.remove("opacity-100", "scale-100");
            }
        }
    });

    // 3. Mobile Hamburger Menu Trigger
    const menuToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpened = !mobileMenu.classList.contains("hidden");
            if (isOpened) {
                closeMobileMenu();
            } else {
                mobileMenu.classList.remove("hidden");
                // Trigger animation reflow
                setTimeout(() => {
                    mobileMenu.classList.remove("scale-y-95", "opacity-0");
                    mobileMenu.classList.add("scale-y-100", "opacity-100");
                }, 10);
                if (menuIcon) menuIcon.style.transform = "rotate(90deg)";
            }
        });
    }

    // 4. Hero Booking Widget fare calculations
    const bookingWidget = document.getElementById("hero-booking-widget");
    const estimateBox = document.getElementById("widget-estimate-box");
    const estimateFareTxt = document.getElementById("widget-estimated-fare-txt");

    if (bookingWidget) {
        bookingWidget.addEventListener("submit", (e) => {
            e.preventDefault();

            const pickup = document.getElementById("widget-pickup").value.trim();
            const drop = document.getElementById("widget-drop").value.trim();
            const date = document.getElementById("widget-date").value;
            const time = document.getElementById("widget-time").value;
            const vehicle = document.getElementById("widget-vehicle").value;

            if (!pickup || !drop || !date || !time) {
                alert("Please fill in pickup, drop, date and time parameters for estimation.");
                return;
            }

            // Simple rate calculations: 4 seater = 1299/day, 7 seater = 1699/day
            const baseRate = parseInt(vehicle) === 7 ? 1699 : 1299;
            
            // Format fare with comma separators
            if (estimateFareTxt) {
                estimateFareTxt.innerText = `₹${baseRate.toLocaleString('en-IN')}.00`;
            }

            if (estimateBox) {
                estimateBox.classList.remove("hidden");
                lucide.createIcons();
            }
        });
    }

    // 5. Contact Booking Form submission handler
    const contactForm = document.getElementById("contact-booking-form");
    const successBox = document.getElementById("booking-success-box");

    if (contactForm && successBox) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Fetch inputs
            const name = document.getElementById("form-name").value.trim();
            const phone = document.getElementById("form-phone").value.trim();
            const pickup = document.getElementById("form-pickup").value.trim();
            const drop = document.getElementById("form-drop").value.trim();
            const message = document.getElementById("form-message").value.trim();

            if (!name || !phone || !pickup || !drop) {
                alert("Please complete name, phone, pickup and drop fields.");
                return;
            }

            // Log parameters (mocking DB request submission)
            console.log("Booking Reservation parameters submitted:", { name, phone, pickup, drop, message });

            // Display success screen overlay
            successBox.classList.remove("hidden");
            lucide.createIcons();
        });
    }

    // 6. Stats Counters Animation trigger
    const statCounters = document.querySelectorAll("[data-target]");
    
    if (statCounters.length > 0) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute("data-target"));
                    let current = 0;
                    const increment = target / 50; // increment speed scaling
                    
                    const updateCounter = () => {
                        current += increment;
                        if (current >= target) {
                            counter.innerText = target.toLocaleString('en-IN') + (target === 10 ? "" : "+");
                        } else {
                            counter.innerText = Math.floor(current).toLocaleString('en-IN') + "+";
                            requestAnimationFrame(updateCounter);
                        }
                    };

                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        statCounters.forEach(c => statsObserver.observe(c));
    }

    // 7. Testimonials Slides Auto Rotate
    startTestimonialsAutoplay();
});

// Helper: Close Mobile Menu
function closeMobileMenu() {
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");
    if (mobileMenu) {
        mobileMenu.classList.add("scale-y-95", "opacity-0");
        mobileMenu.classList.remove("scale-y-100", "opacity-100");
        setTimeout(() => mobileMenu.classList.add("hidden"), 300);
        if (menuIcon) menuIcon.style.transform = "rotate(0deg)";
    }
}

// 8. Testimonials carousel controls
let currentSlideIndex = 0;
let testimonialTimer = null;

function showTestimonialSlide(index) {
    const slides = document.querySelectorAll(".testimonial-slide");
    if (slides.length === 0) return;

    if (index >= slides.length) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = index;

    slides.forEach((slide, idx) => {
        if (idx === currentSlideIndex) {
            slide.classList.remove("hidden");
            slide.classList.add("flex");
        } else {
            slide.classList.add("hidden");
            slide.classList.remove("flex");
        }
    });
}

// Next testimonial
function nextTestimonial() {
    showTestimonialSlide(currentSlideIndex + 1);
    resetTestimonialTimer();
}

// Prev testimonial
function prevTestimonial() {
    showTestimonialSlide(currentSlideIndex - 1);
    resetTestimonialTimer();
}

function startTestimonialsAutoplay() {
    testimonialTimer = setInterval(() => {
        showTestimonialSlide(currentSlideIndex + 1);
    }, 6000);
}

function resetTestimonialTimer() {
    if (testimonialTimer) clearInterval(testimonialTimer);
    startTestimonialsAutoplay();
}

// 9. FAQ Accordion handler
function toggleFAQ(button) {
    const icon = button.querySelector("[data-lucide]");
    const answer = button.nextElementSibling;
    
    // Check if open
    const isOpen = answer.style.maxHeight && answer.style.maxHeight !== "0px";

    // Close all FAQs first
    document.querySelectorAll(".faq-answer").forEach(ans => {
        ans.style.maxHeight = "0px";
        const btnIcon = ans.previousElementSibling.querySelector("[data-lucide]");
        if (btnIcon) {
            btnIcon.style.transform = "rotate(0deg)";
            btnIcon.setAttribute("data-lucide", "plus");
        }
    });

    if (!isOpen) {
        // Open current FAQ
        answer.style.maxHeight = answer.scrollHeight + "px";
        if (icon) {
            icon.style.transform = "rotate(45deg)";
            icon.setAttribute("data-lucide", "plus");
        }
    }
}

// 10. Contact form success reset
function resetBookingForm() {
    const contactForm = document.getElementById("contact-booking-form");
    const successBox = document.getElementById("booking-success-box");

    if (contactForm) {
        contactForm.reset();
    }
    if (successBox) {
        successBox.classList.add("hidden");
    }
}

// 11. Scroll back to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =================== LIGHTBOX GALLERY CONTROLLER ===================
const galleryImages = [
    { src: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&h=600", caption: "White Swift Dzire Sedan - Day Booking" },
    { src: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&h=600", caption: "Premium Innova Crysta SUV - Local Sightseeing" },
    { src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&h=600", caption: "Toyota Innova - Airport Family Drop" },
    { src: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&h=600", caption: "Maruti Ertiga - Group Travels" },
    { src: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&h=600", caption: "Premium Tourist Sedan - Outstation Long Drive" },
    { src: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&h=600", caption: "Luxury Sedan - Corporate Delegate Travel" }
];

let activeLightboxIndex = 0;

function openLightbox(index) {
    const modal = document.getElementById("lightbox-modal");
    const img = document.getElementById("lightbox-img");
    const caption = document.getElementById("lightbox-caption");

    if (!modal || !img || !caption) return;

    activeLightboxIndex = index;
    img.src = galleryImages[index].src;
    caption.innerText = galleryImages[index].caption;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeLightbox() {
    const modal = document.getElementById("lightbox-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

function nextLightboxImage() {
    activeLightboxIndex = (activeLightboxIndex + 1) % galleryImages.length;
    openLightbox(activeLightboxIndex);
}

function prevLightboxImage() {
    activeLightboxIndex = (activeLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    openLightbox(activeLightboxIndex);
}
