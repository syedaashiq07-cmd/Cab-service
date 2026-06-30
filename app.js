// Premium Cab Services Application Controller

// Current Session State
let activeTab = 'showcase';
let activeBooking = null; // Holds the current active booking object
let activeCoupon = null; // Applied coupon
let mapAnimationId = null; // Holds canvas animation loop reference
let rideSimTimeout = null; // Simulation timers
let simStep = 0; // Current simulation step for ride timeline

// Map Hub Coordinates mapping (X, Y pixels on 600x480 canvas)
const MAP_HUBS = {
    "Home (T-Nagar)": { x: 220, y: 280, lat: 13.0440, lng: 80.2370 },
    "Office (DLF Cybercity)": { x: 120, y: 140, lat: 13.0180, lng: 80.1650 },
    "Chennai Airport (MAA)": { x: 480, y: 380, lat: 12.9940, lng: 80.1710 }
};

// Default generic positions for manual addresses
const DEFAULT_PICKUP = { x: 180, y: 220, lat: 13.0250, lng: 80.2000 };
const DEFAULT_DROP = { x: 350, y: 180, lat: 13.0300, lng: 80.2100 };

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    // Replace Lucide icon markers
    lucide.createIcons();

    // Load initial views
    renderShowcaseFleet();
    renderShowcaseMemberships();
    renderSavedLocations();
    renderBookingFleetCategories();
    renderOperationsDashboard();
    syncUserWidgets();

    // Check for active booking in database to resume tracking
    resumeExistingRideTracking();

    // Start background canvas animation (idle view)
    initMapCanvas();
});

// Toast Toast Notification helper
function showToast(title, message, type = 'gold') {
    const container = document.getElementById("toast-container");
    if (!container) return;

    // Toast element
    const toast = document.createElement("div");
    toast.className = "glass-panel popup-notification";
    
    let icon = "bell";
    if (type === 'success') {
        toast.style.borderColor = "var(--accent-green)";
        icon = "check-circle";
    } else if (type === 'error') {
        toast.style.borderColor = "var(--accent-red)";
        icon = "alert-triangle";
    } else {
        toast.style.borderColor = "var(--color-gold)";
        icon = "crown";
    }

    toast.innerHTML = `
        <i data-lucide="${icon}" style="color: ${type === 'success' ? 'var(--accent-green)' : type === 'error' ? 'var(--accent-red)' : 'var(--color-gold)'}"></i>
        <div>
            <h4 style="font-size: 13px; font-weight: bold;">${title}</h4>
            <p style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">${message}</p>
        </div>
        <button class="popup-notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = "slideInRight 0.4s ease reverse forwards";
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// Sync Global User Details across headers and modals
function syncUserWidgets() {
    const user = window.db.getCurrentUser();
    const membership = window.db.getUserMembershipDetails();
    const totalPoints = window.db.getTotalPoints();

    if (user) {
        // Headers
        document.getElementById("header-username").innerText = user.full_name;
        if (user.profile_image) {
            document.getElementById("header-avatar").src = user.profile_image;
            document.getElementById("profile-avatar").src = user.profile_image;
        }
        
        // Membership Tiers
        const tierTxt = membership ? membership.membership_details.name.toUpperCase() : "STANDARD LABEL";
        document.getElementById("header-membership").innerText = tierTxt;
        document.getElementById("profile-tier").innerText = tierTxt;
        
        // Modal profile info
        document.getElementById("profile-name").innerText = user.full_name;
        document.getElementById("profile-email").innerText = user.email;
        document.getElementById("profile-points").innerText = `${totalPoints} Points`;
    }
}

// Navigation Router / Tab Switcher
function switchTab(tabName) {
    activeTab = tabName;
    
    // Hide all tab panes
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    // De-activate all nav buttons
    document.querySelectorAll(".nav-link-btn").forEach(el => el.classList.remove("active"));

    // Activate selected tab pane
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.add("active");

    // Activate selected nav button
    const targetBtn = document.getElementById(`btn-tab-${tabName}`);
    if (targetBtn) targetBtn.classList.add("active");

    // Operations and dashboard metrics update when visiting admin panel
    if (tabName === 'admin') {
        renderOperationsDashboard();
    }
    if (tabName === 'driver') {
        renderDriverPortal();
    }
    if (tabName === 'corporate') {
        renderCorporatePortal();
    }

    // Trigger Lucide updates
    lucide.createIcons();
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// =================== LANDING SHOWCASE GENERATORS ===================
function renderShowcaseFleet() {
    const grid = document.getElementById("fleet-showcase-grid");
    if (!grid) return;

    const vehicles = window.db.state.vehicles;
    const features = window.db.state.vehicle_features;

    grid.innerHTML = vehicles.map(veh => {
        const vehicleFeatures = features
            .filter(f => f.vehicle_id === veh.id)
            .map(f => `<li><i data-lucide="check" style="width:14px;height:14px;color:var(--color-gold);"></i> ${f.feature_name}</li>`)
            .join('');

        return `
            <div class="glass-panel vehicle-card glass-card-interactive">
                <div class="vehicle-img-wrapper">
                    <img src="${veh.image_url}" alt="${veh.brand} ${veh.model}">
                </div>
                <h3 style="margin-bottom: 4px;">${veh.brand} ${veh.model}</h3>
                <span class="badge-outline" style="align-self: flex-start; margin-bottom: 12px; border-color: var(--color-gold); color: var(--color-gold); font-size:10px; font-weight:700;">
                    ${veh.vehicle_type.toUpperCase()} CLASS
                </span>
                
                <ul class="benefits-list" style="margin: 8px 0 16px 0; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px;">
                    ${vehicleFeatures}
                </ul>

                <div class="vehicle-meta">
                    <div style="font-size: 13px; color: var(--color-text-secondary);">
                        <i data-lucide="users" style="width:14px; height:14px; vertical-align:middle; margin-right:4px;"></i> ${veh.seating_capacity} Seats
                        <span style="margin:0 8px;">•</span>
                        <i data-lucide="briefcase" style="width:14px; height:14px; vertical-align:middle; margin-right:4px;"></i> ${veh.luggage_capacity} Bags
                    </div>
                    <span style="font-weight: 700; color: #fff;">${veh.registration_number.split('-')[0]} Category</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderShowcaseMemberships() {
    const grid = document.getElementById("membership-cards-grid");
    if (!grid) return;

    const memberships = window.db.getMemberships();
    const userMem = window.db.getUserMembershipDetails();

    grid.innerHTML = memberships.map(mem => {
        const isCurrent = userMem && userMem.membership_id === mem.id;
        const buttonText = isCurrent ? "Active Plan" : "Subscribe Now";
        const buttonClass = isCurrent ? "btn-secondary" : "btn-primary";
        const featuredClass = mem.id === 'm-platinum' ? 'featured' : '';
        
        return `
            <div class="glass-panel membership-card ${featuredClass}">
                <h3 style="font-size: 20px;">${mem.name}</h3>
                <div class="price-text">
                    ₹${mem.price}
                    <span class="price-period">/ ${mem.duration_days} days</span>
                </div>
                
                <ul class="benefits-list">
                    <li><i data-lucide="percent"></i> ${mem.benefits.discount}</li>
                    <li><i data-lucide="zap"></i> ${mem.benefits.priority}</li>
                    <li><i data-lucide="coffee"></i> ${mem.benefits.lounge}</li>
                    ${mem.benefits.special ? `<li><i data-lucide="sparkles"></i> ${mem.benefits.special}</li>` : ''}
                </ul>

                <button class="${buttonClass}" style="width: 100%; justify-content: center; margin-top: auto;" 
                    onclick="purchaseMembershipClick('${mem.id}')" ${isCurrent ? 'disabled' : ''}>
                    ${isCurrent ? '<i data-lucide="check"></i>' : ''} ${buttonText}
                </button>
            </div>
        `;
    }).join('');
}

function purchaseMembershipClick(membershipId) {
    const membership = window.db.getMemberships().find(m => m.id === membershipId);
    if (!membership) return;

    window.db.purchaseMembership(membershipId);
    showToast("Subscription Activated", `You are now subscribed to ${membership.name}. Thank you!`, 'success');
    syncUserWidgets();
    renderShowcaseMemberships();
    recalculateEstimatedFare();
}


// =================== PASSENGER BOOKING OPERATIONS ===================
function renderSavedLocations() {
    const container = document.getElementById("saved-locations-list");
    if (!container) return;

    const locations = window.db.getSavedLocations();
    container.innerHTML = locations.map(loc => {
        let icon = "map-pin";
        if (loc.location_type === "Home") icon = "home";
        if (loc.location_type === "Office") icon = "briefcase";
        if (loc.location_type === "Airport") icon = "plane";

        return `
            <span class="saved-loc-badge" onclick="selectSavedLocation('${loc.id}')">
                <i data-lucide="${icon}" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i>
                ${loc.title}
            </span>
        `;
    }).join('');
    lucide.createIcons();
}

function selectSavedLocation(locId) {
    const loc = window.db.getSavedLocations().find(l => l.id === locId);
    if (!loc) return;

    const pickupInput = document.getElementById("pickup-input");
    const dropInput = document.getElementById("drop-input");

    // If pickup is empty, fill it. Else fill drop.
    if (!pickupInput.value) {
        pickupInput.value = loc.title;
        pickupInput.dataset.lat = loc.latitude;
        pickupInput.dataset.lng = loc.longitude;
        showToast("Location Set", `Pickup location set to ${loc.title}`, 'gold');
    } else {
        dropInput.value = loc.title;
        dropInput.dataset.lat = loc.latitude;
        dropInput.dataset.lng = loc.longitude;
        showToast("Location Set", `Drop-off destination set to ${loc.title}`, 'gold');
    }

    recalculateEstimatedFare();
}

function renderBookingFleetCategories() {
    const container = document.getElementById("vehicle-booking-options");
    if (!container) return;

    const vehicles = window.db.state.vehicles;
    container.innerHTML = vehicles.map((veh, index) => {
        const selectedClass = index === 0 ? "selected" : "";
        return `
            <div class="vehicle-select-item ${selectedClass}" data-vehicle-id="${veh.id}" onclick="selectBookingCategory(this)">
                <img src="${veh.image_url}" alt="${veh.brand}">
                <div class="vehicle-select-details">
                    <div class="vehicle-select-name">${veh.brand} ${veh.model.split(' ')[0]}</div>
                    <div class="vehicle-select-features">${veh.vehicle_type} Class • Max ${veh.seating_capacity} seats</div>
                </div>
                <div class="vehicle-select-price" id="price-tag-${veh.id}">₹ --</div>
            </div>
        `;
    }).join('');
}

function selectBookingCategory(element) {
    document.querySelectorAll(".vehicle-select-item").forEach(el => el.classList.remove("selected"));
    element.classList.add("selected");
    recalculateEstimatedFare();
}

// Calculate distance & fare estimators dynamically
function recalculateEstimatedFare() {
    const pickupVal = document.getElementById("pickup-input").value;
    const dropVal = document.getElementById("drop-input").value;

    if (!pickupVal || !dropVal) {
        return; // Need both points
    }

    // Determine mock distance based on points
    let distance = 7.5; // default
    if (MAP_HUBS[pickupVal] && MAP_HUBS[dropVal]) {
        // Calculate based on mock hubs
        const dx = MAP_HUBS[pickupVal].x - MAP_HUBS[dropVal].x;
        const dy = MAP_HUBS[pickupVal].y - MAP_HUBS[dropVal].y;
        distance = parseFloat((Math.sqrt(dx*dx + dy*dy) / 25).toFixed(1)); // mock scaling factor
    } else {
        // Pseudo-random distance based on string lengths to feel organic
        distance = parseFloat(((pickupVal.length + dropVal.length) / 3 + 4).toFixed(1));
    }

    // Bound distance
    if (distance < 2) distance = 2.4;
    if (distance > 45) distance = 32.8;

    document.getElementById("summary-distance").innerText = `${distance} km`;

    // Estimate base prices per category
    const vehicles = window.db.state.vehicles;
    let selectedVehicleId = "";
    
    vehicles.forEach(veh => {
        // Calculate base rate based on vehicle type
        let ratePerKm = 18; // Sedan
        if (veh.vehicle_type === 'SUV') ratePerKm = 25;
        if (veh.vehicle_type === 'Luxury') ratePerKm = 45;
        if (veh.vehicle_type === 'Airport') ratePerKm = 30;

        const basePrice = Math.round(100 + (distance * ratePerKm));
        const priceTag = document.getElementById(`price-tag-${veh.id}`);
        if (priceTag) {
            priceTag.innerText = `₹${basePrice}`;
        }

        const selectEl = document.querySelector(`.vehicle-select-item[data-vehicle-id="${veh.id}"]`);
        if (selectEl && selectEl.classList.contains("selected")) {
            selectedVehicleId = veh.id;
        }
    });

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
    let ratePerKm = 18;
    if (selectedVehicle.vehicle_type === 'SUV') ratePerKm = 25;
    if (selectedVehicle.vehicle_type === 'Luxury') ratePerKm = 45;
    if (selectedVehicle.vehicle_type === 'Airport') ratePerKm = 30;

    const basePrice = Math.round(100 + (distance * ratePerKm));
    document.getElementById("summary-base-price").innerText = `₹${basePrice}.00`;

    // Apply corporate discount if linked
    const userCompany = window.db.checkCorporateStatus();
    let corpDiscount = 0;
    if (userCompany) {
        corpDiscount = 0.10; // Corporate 10% discount
    }

    // Apply membership discount
    const membership = window.db.getUserMembershipDetails();
    let memDiscountPercent = 0;
    if (membership) {
        const benefits = membership.membership_details.benefits;
        if (benefits.discount.includes("5%")) memDiscountPercent = 0.05;
        if (benefits.discount.includes("10%")) memDiscountPercent = 0.10;
        if (benefits.discount.includes("15%")) memDiscountPercent = 0.15;
        if (benefits.discount.includes("20%")) memDiscountPercent = 0.20;
    }

    let finalPrice = basePrice;
    
    // Apply coupon code if active
    let couponDiscountAmount = 0;
    const discountRow = document.getElementById("coupon-discount-row");
    const discountValEl = document.getElementById("summary-discount-val");
    
    if (activeCoupon) {
        if (activeCoupon.discount_type === 'percentage') {
            couponDiscountAmount = Math.round(basePrice * (activeCoupon.discount_value / 100));
        } else {
            couponDiscountAmount = activeCoupon.discount_value;
        }
        
        if (couponDiscountAmount > basePrice) couponDiscountAmount = basePrice;

        discountRow.style.display = "flex";
        discountValEl.innerText = `- ₹${couponDiscountAmount}.00`;
    } else {
        discountRow.style.display = "none";
    }

    // Apply membership/corporate discounts
    const memDiscountRow = document.getElementById("membership-discount-row");
    const memDiscountValEl = document.getElementById("summary-membership-discount-val");
    
    const combinedDiscountPercent = Math.max(memDiscountPercent, corpDiscount); // pick the higher discount

    let membershipDiscountAmount = 0;
    if (combinedDiscountPercent > 0) {
        membershipDiscountAmount = Math.round((basePrice - couponDiscountAmount) * combinedDiscountPercent);
        memDiscountRow.style.display = "flex";
        memDiscountValEl.innerText = `- ₹${membershipDiscountAmount}.00`;
        
        // Customize text depending on type
        if (userCompany && corpDiscount > memDiscountPercent) {
            memDiscountRow.firstElementChild.innerText = `Corporate 10% Discount:`;
        } else {
            memDiscountRow.firstElementChild.innerText = `${membership.membership_details.name} Discount:`;
        }
    } else {
        memDiscountRow.style.display = "none";
    }

    finalPrice = basePrice - couponDiscountAmount - membershipDiscountAmount;
    if (finalPrice < 50) finalPrice = 50; // minimum fare

    document.getElementById("summary-final-price").innerText = `₹${finalPrice}.00`;
    return {
        distance,
        basePrice,
        finalPrice,
        vehicleId: selectedVehicle.id
    };
}

// Promo Coupons code applicator
function applyCouponCode() {
    const input = document.getElementById("coupon-code-input");
    const code = input.value.trim().toUpperCase();
    const msgEl = document.getElementById("coupon-status-msg");

    if (!code) {
        showToast("Missing Promo Code", "Please enter a valid coupon code.", "error");
        return;
    }

    const coupon = window.db.getCouponByCode(code);
    if (!coupon) {
        msgEl.style.color = "var(--accent-red)";
        msgEl.innerText = "Invalid coupon code.";
        activeCoupon = null;
        showToast("Coupon Declined", `Promo code ${code} is invalid.`, "error");
    } else {
        // check expiry
        const expiry = new Date(coupon.expiry_date);
        if (expiry < new Date()) {
            msgEl.style.color = "var(--accent-red)";
            msgEl.innerText = "Coupon code has expired.";
            activeCoupon = null;
            showToast("Coupon Expired", `Promo code ${code} is expired.`, "error");
            return;
        }

        activeCoupon = coupon;
        msgEl.style.color = "var(--accent-green)";
        msgEl.innerText = `Success! applied ${coupon.code} (${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : '₹' + coupon.discount_value} off).`;
        showToast("Promo Code Applied", `Discount applied to your ride.`, "success");
    }

    recalculateEstimatedFare();
}

// Confirm booking creation
function initiateCabBooking() {
    const pickupVal = document.getElementById("pickup-input").value.trim();
    const dropVal = document.getElementById("drop-input").value.trim();

    if (!pickupVal || !dropVal) {
        showToast("Fields Missing", "Please enter both pickup and destination locations.", "error");
        return;
    }

    // Get pricing details
    const priceDetails = recalculateEstimatedFare();
    if (!priceDetails) return;

    // Pick driver partner assigned to vehicle
    const vehicle = window.db.state.vehicles.find(v => v.id === priceDetails.vehicleId);
    const driver = window.db.state.drivers.find(d => d.id === vehicle.driver_id);

    if (!driver || driver.status !== 'online' || !driver.availability) {
        // Let's force online for mockup tracking
        window.db.updateDriverStatus(vehicle.driver_id, 'online', true);
    }

    // Create Booking
    const booking = window.db.createBooking({
        pickup_address: pickupVal,
        drop_address: dropVal,
        pickup_latitude: MAP_HUBS[pickupVal]?.lat || DEFAULT_PICKUP.lat,
        pickup_longitude: MAP_HUBS[pickupVal]?.lng || DEFAULT_PICKUP.lng,
        drop_latitude: MAP_HUBS[dropVal]?.lat || DEFAULT_DROP.lat,
        drop_longitude: MAP_HUBS[dropVal]?.lng || DEFAULT_DROP.lng,
        ride_type: vehicle.vehicle_type,
        vehicle_id: vehicle.id,
        driver_id: vehicle.driver_id,
        distance_km: priceDetails.distance,
        estimated_fare: priceDetails.basePrice,
        final_fare: priceDetails.finalPrice
    });

    activeBooking = booking;
    simStep = 0; // reset simulator

    // Record Coupon usage if applied
    if (activeCoupon) {
        window.db.recordCouponUsage(activeCoupon.id, booking.id);
    }

    showToast("Booking Requested", "Looking for nearest BlackLabel Chauffeur...", "success");

    // Transition sidebar UI to tracking view
    document.getElementById("booking-form-view").style.display = "none";
    document.getElementById("tracking-sidebar-view").style.display = "block";

    // Setup active details
    document.getElementById("active-ride-id").innerText = `Booking ID: ${booking.id.substring(0, 8).toUpperCase()}`;
    updateTrackingSidebarUI(booking);

    // Trigger simulation sequence
    runRideSimulationSequence();
}

function updateTrackingSidebarUI(booking) {
    const details = window.db.getBookingDetails(booking.id);
    
    // Status Badge
    const badge = document.getElementById("active-ride-badge");
    badge.innerText = details.status;
    badge.className = `status-badge ${details.status.toLowerCase()}`;

    // Timeline nodes highlights
    document.querySelectorAll(".status-node").forEach(n => n.classList.remove("active", "completed"));
    
    const steps = ["Requested", "Driver Assigned", "Arriving", "Started", "Completed"];
    const currentIdx = steps.indexOf(details.status);
    
    steps.forEach((step, idx) => {
        const nodeId = `node-${step.toLowerCase().replace(' ', '-')}`;
        const node = document.getElementById(nodeId);
        if (node) {
            if (idx === currentIdx) {
                node.classList.add("active");
            } else if (idx < currentIdx) {
                node.classList.add("completed");
            }
        }
    });

    // Driver Card
    if (details.driver_details) {
        document.getElementById("active-driver-name").innerText = details.driver_details.full_name;
        document.getElementById("active-driver-code").innerText = details.driver_details.driver_code;
        document.getElementById("active-driver-rating").innerText = details.driver_details.rating;
        document.getElementById("active-driver-avatar").src = details.driver_details.profile_image;
        document.getElementById("active-vehicle-info").innerText = 
            `${details.vehicle_details.brand} ${details.vehicle_details.model} • ${details.vehicle_details.registration_number}`;
        document.getElementById("active-ride-driver-card").style.display = "flex";
    } else {
        document.getElementById("active-ride-driver-card").style.display = "none";
    }
}

// Resume Tracking if there is an active ride in DB
function resumeExistingRideTracking() {
    const bookings = window.db.getBookings();
    const active = bookings.find(b => b.status !== "Completed" && b.status !== "Cancelled");
    
    if (active) {
        activeBooking = active;
        // switch UI
        document.getElementById("booking-form-view").style.display = "none";
        document.getElementById("tracking-sidebar-view").style.display = "block";
        
        // determine sim step
        const steps = ["Requested", "Driver Assigned", "Arriving", "Started", "Completed"];
        simStep = steps.indexOf(active.status);
        
        updateTrackingSidebarUI(active);
        runRideSimulationSequence();
    }
}

// Cancel current tracking and reset booking form
function cancelCurrentActiveRide() {
    if (activeBooking) {
        window.db.updateBookingStatus(activeBooking.id, "Cancelled");
        window.db.addNotification("Ride Cancelled", `Your booking to ${activeBooking.drop_address} was cancelled.`, 'billing');
        showToast("Ride Cancelled", "Booking has been cancelled by customer.", "error");
    }
    resetBookingForm();
}

function resetBookingForm() {
    activeBooking = null;
    activeCoupon = null;
    simStep = 0;
    if (rideSimTimeout) clearTimeout(rideSimTimeout);

    document.getElementById("pickup-input").value = "";
    document.getElementById("drop-input").value = "";
    document.getElementById("coupon-code-input").value = "";
    document.getElementById("coupon-status-msg").innerText = "";
    
    // reset estimates
    document.getElementById("summary-distance").innerText = "-- km";
    document.getElementById("summary-base-price").innerText = "₹ --";
    document.getElementById("summary-final-price").innerText = "₹ --";
    document.getElementById("coupon-discount-row").style.display = "none";
    document.getElementById("membership-discount-row").style.display = "none";

    document.getElementById("booking-form-view").style.display = "block";
    document.getElementById("tracking-sidebar-view").style.display = "none";
    
    syncUserWidgets();
    renderBookingFleetCategories();
}

// =================== STATE CHAUFFEUR RIDE SIMULATION ===================
function runRideSimulationSequence() {
    if (!activeBooking) return;
    const steps = ["Requested", "Driver Assigned", "Arriving", "Started", "Completed"];
    
    if (rideSimTimeout) clearTimeout(rideSimTimeout);

    // Get current status index
    const details = window.db.getBookingDetails(activeBooking.id);
    const idx = steps.indexOf(details.status);
    
    if (idx === -1 || idx === steps.length - 1) {
        // Simulation finished
        if (details.status === "Completed") {
            // Trigger invoice popup
            showInvoicePaymentReceipt(details);
        }
        return;
    }

    // Set simulator next step timings:
    // Requested -> Assigned (3s) -> Arriving (6s) -> Started (10s) -> Completed (12s)
    let delay = 3000;
    if (details.status === "Driver Assigned") delay = 5000;
    if (details.status === "Arriving") delay = 6000;
    if (details.status === "Started") delay = 8000;

    rideSimTimeout = setTimeout(() => {
        const nextStatus = steps[idx + 1];
        simStep = idx + 1;
        
        // Update database
        window.db.updateBookingStatus(activeBooking.id, nextStatus);

        // Driver portal alerts when requested
        if (nextStatus === "Driver Assigned") {
            window.db.addNotification("Driver Assigned", "Executive driver is heading your way.", "general");
            showToast("Driver Assigned", "Chauffeur accepted your trip.", "success");
        } else if (nextStatus === "Arriving") {
            showToast("Driver Arrived", "Your Chauffeur has arrived at your pick-up spot.", "success");
        } else if (nextStatus === "Started") {
            showToast("Trip Started", "Heading to drop-off. Sit back and enjoy the ride.", "gold");
        } else if (nextStatus === "Completed") {
            // Add points
            const pointsEarned = Math.floor(details.final_fare / 10);
            window.db.addRewardPoints(pointsEarned, "earned", `Completed trip to ${details.drop_address}`);
            
            // Process Mock Payment
            window.db.createPayment(details.id, document.getElementById("payment-method-select").value, details.final_fare);
            window.db.addNotification("Invoice Generated", `Payment of ₹${details.final_fare} was successful.`, "billing");
            showToast("Ride Finished", "Chauffeur reached drop location. Invoice generated.", "success");
        }

        updateTrackingSidebarUI(activeBooking);
        
        // Loop simulation
        runRideSimulationSequence();
    }, delay);
}

// Fast forward button
function stepSimulateRide() {
    if (!activeBooking) return;
    const steps = ["Requested", "Driver Assigned", "Arriving", "Started", "Completed"];
    const details = window.db.getBookingDetails(activeBooking.id);
    const idx = steps.indexOf(details.status);

    if (idx === -1 || idx === steps.length - 1) return;

    if (rideSimTimeout) clearTimeout(rideSimTimeout);
    
    const nextStatus = steps[idx + 1];
    simStep = idx + 1;
    
    // Update db
    window.db.updateBookingStatus(activeBooking.id, nextStatus);

    if (nextStatus === "Completed") {
        const pointsEarned = Math.floor(details.final_fare / 10);
        window.db.addRewardPoints(pointsEarned, "earned", `Completed trip to ${details.drop_address}`);
        window.db.createPayment(details.id, document.getElementById("payment-method-select").value, details.final_fare);
        window.db.addNotification("Invoice Generated", `Payment of ₹${details.final_fare} was successful.`, "billing");
        showToast("Ride Finished", "Fast-forward reached destination.", "success");
    } else {
        showToast("Sim Status Shift", `State changed to ${nextStatus}`, "gold");
    }

    updateTrackingSidebarUI(activeBooking);
    runRideSimulationSequence();
}

function showInvoicePaymentReceipt(booking) {
    // Generate a simple alert matching premium styling
    const amount = booking.final_fare;
    const points = Math.floor(amount / 10);
    
    // Auto sync profile
    syncUserWidgets();
    
    const container = document.getElementById("toast-container");
    const modal = document.createElement("div");
    modal.className = "glass-panel";
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        margin: auto;
        width: 320px;
        height: 380px;
        z-index: 1001;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        animation: fadeIn 0.4s ease forwards;
        border-color: var(--color-gold);
    `;

    modal.innerHTML = `
        <div>
            <div class="metric-icon-box" style="margin: 0 auto 16px auto; width: 50px; height: 50px; border-radius: 50%; font-size: 20px;">
                <i data-lucide="receipt"></i>
            </div>
            <h3 style="margin-bottom: 4px;">Ride Completed!</h3>
            <span style="font-size: 11px; color: var(--color-text-secondary);">INVOICE GENERATED</span>
        </div>
        
        <div style="width: 100%; border-top: 1px dashed var(--border-color); border-bottom: 1px dashed var(--border-color); padding: 16px 0; margin: 16px 0; text-align: left; font-size: 13px;">
            <div class="flex-space-between" style="margin-bottom: 6px;">
                <span style="color: var(--color-text-secondary);">Dest:</span>
                <span style="font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;">${booking.drop_address}</span>
            </div>
            <div class="flex-space-between" style="margin-bottom: 6px;">
                <span style="color: var(--color-text-secondary);">Charge Paid:</span>
                <span style="font-weight: 700; color: var(--color-gold);">₹${amount}.00</span>
            </div>
            <div class="flex-space-between">
                <span style="color: var(--color-text-secondary);">Points Earned:</span>
                <span style="color: var(--accent-green); font-weight: 700;">+${points} pts</span>
            </div>
        </div>

        <button class="btn-primary" style="width:100%; justify-content:center;" onclick="closeInvoiceReceipt(this)">
            Return to Booking
        </button>
    `;

    document.body.appendChild(modal);
    lucide.createIcons();
}

function closeInvoiceReceipt(btn) {
    btn.parentElement.remove();
    resetBookingForm();
}


// =================== INTERACTIVE MAP CANVAS COMPONENT ===================
let canvas, ctx;
let mapCars = [
    { x: 100, y: 120, targetX: 100, targetY: 120, label: "DRV-1002", color: "var(--color-gold)" },
    { x: 400, y: 320, targetX: 400, targetY: 320, label: "DRV-2041", color: "var(--accent-cyan)" }
];

function initMapCanvas() {
    canvas = document.getElementById("simulator-map-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    
    if (mapAnimationId) cancelAnimationFrame(mapAnimationId);
    
    // Draw map animation loop
    function loop() {
        drawMapBackground();
        updateAndDrawMapCars();
        
        mapAnimationId = requestAnimationFrame(loop);
    }
    
    loop();
}

function drawMapBackground() {
    // Clear
    ctx.fillStyle = "#09090C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sci-fi grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw glowing roads connects
    ctx.strokeStyle = "#1A1A24";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw roads routes
    const paths = [
        [MAP_HUBS["Office (DLF Cybercity)"], MAP_HUBS["Home (T-Nagar)"]],
        [MAP_HUBS["Home (T-Nagar)"], MAP_HUBS["Chennai Airport (MAA)"]],
        [MAP_HUBS["Office (DLF Cybercity)"], { x: 300, y: 80 }, MAP_HUBS["Chennai Airport (MAA)"]]
    ];

    paths.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) {
            ctx.lineTo(p[i].x, p[i].y);
        }
        ctx.stroke();
    });

    // Draw road inline dashes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    paths.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) {
            ctx.lineTo(p[i].x, p[i].y);
        }
        ctx.stroke();
    });
    ctx.setLineDash([]); // clear

    // Draw Hub pins
    Object.keys(MAP_HUBS).forEach(hubName => {
        const hub = MAP_HUBS[hubName];
        
        // Ripple glow
        ctx.fillStyle = "rgba(229, 169, 59, 0.05)";
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 25 + Math.sin(Date.now() / 300) * 5, 0, Math.PI * 2);
        ctx.fill();

        // Hub Core Circle
        ctx.fillStyle = "#12121A";
        ctx.strokeStyle = "var(--color-gold)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hub Dot
        ctx.fillStyle = "var(--color-gold)";
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Hub Text Label
        ctx.fillStyle = "var(--color-text-secondary)";
        ctx.font = "bold 10px Inter";
        ctx.textAlign = "center";
        ctx.fillText(hubName.split(' ')[0], hub.x, hub.y - 18);
    });
}

function updateAndDrawMapCars() {
    if (activeBooking) {
        // Active ride interpolation
        const details = window.db.getBookingDetails(activeBooking.id);
        const pLoc = MAP_HUBS[details.pickup_address] || DEFAULT_PICKUP;
        const dLoc = MAP_HUBS[details.drop_address] || DEFAULT_DROP;
        
        // Active Status
        const status = details.status;
        
        // We will move the driver cab on the map depending on simulation steps
        let carPos = { x: pLoc.x, y: pLoc.y };
        let speed = 0;
        let heading = "North";
        
        if (status === "Requested" || status === "Driver Assigned") {
            // Driver is static or heading to pickup
            carPos = { x: pLoc.x - 60, y: pLoc.y + 40 }; // waiting driver position
            speed = 0;
            heading = "Stationary";
        } else if (status === "Arriving") {
            // Animating from waiting to pickup point
            const percent = (Date.now() % 5000) / 5000;
            carPos.x = (pLoc.x - 60) + (60 * percent);
            carPos.y = (pLoc.y + 40) - (40 * percent);
            speed = 35;
            heading = "Northeast";
        } else if (status === "Started") {
            // Animating from pickup to drop point
            const duration = 12000; // 12 seconds loop
            const percent = (Date.now() % duration) / duration;
            carPos.x = pLoc.x + (dLoc.x - pLoc.x) * percent;
            carPos.y = pLoc.y + (dLoc.y - pLoc.y) * percent;
            speed = 65;
            
            // Calc angle for heading
            const angle = Math.atan2(dLoc.y - pLoc.y, dLoc.x - pLoc.x) * 180 / Math.PI;
            if (angle > -45 && angle <= 45) heading = "East";
            else if (angle > 45 && angle <= 135) heading = "South";
            else if (angle > -135 && angle <= -45) heading = "North";
            else heading = "West";
        } else if (status === "Completed") {
            carPos = { x: dLoc.x, y: dLoc.y };
            speed = 0;
            heading = "Stationary";
        }

        // Draw active pickup/drop pins
        ctx.fillStyle = "rgba(0, 230, 118, 0.1)";
        ctx.beginPath();
        ctx.arc(pLoc.x, pLoc.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 59, 48, 0.1)";
        ctx.beginPath();
        ctx.arc(dLoc.x, dLoc.y, 16, 0, Math.PI * 2);
        ctx.fill();

        // Update GPS telemetry HUD elements
        document.getElementById("hud-lat").innerText = carPos.y.toFixed(4);
        document.getElementById("hud-lng").innerText = carPos.x.toFixed(4);
        document.getElementById("live-speed").innerText = `${speed} km/h`;
        document.getElementById("live-heading").innerText = heading;

        // Draw Active Taxi Marker (Glow Gold Circle)
        ctx.shadowColor = "var(--color-gold)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "var(--color-gold)";
        ctx.beginPath();
        ctx.arc(carPos.x, carPos.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Marker Outline
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "bold 9px Inter";
        ctx.textAlign = "center";
        ctx.fillText("CAB", carPos.x, carPos.y + 3);
    } else {
        // Idle Animation: simple roaming of mock cabs
        mapCars.forEach(car => {
            const dx = car.targetX - car.x;
            const dy = car.targetY - car.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 4) {
                // Pick random new target hub
                const hubs = Object.values(MAP_HUBS);
                const randomHub = hubs[Math.floor(Math.random() * hubs.length)];
                car.targetX = randomHub.x + (Math.random() * 20 - 10);
                car.targetY = randomHub.y + (Math.random() * 20 - 10);
            } else {
                car.x += (dx / dist) * 0.8;
                car.y += (dy / dist) * 0.8;
            }

            // Draw Cab
            ctx.fillStyle = car.color;
            ctx.beginPath();
            ctx.arc(car.x, car.y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px Inter";
            ctx.fillText(car.label, car.x, car.y - 10);
        });

        // Sync idle telemetry
        document.getElementById("hud-lat").innerText = "13.0440";
        document.getElementById("hud-lng").innerText = "80.2370";
    }
}


// =================== DRIVER MODULE OPERATIONS ===================
function renderDriverPortal() {
    const list = document.getElementById("driver-ride-history-list");
    if (!list) return;

    // Show/hide incoming booking request
    const alertBox = document.getElementById("incoming-booking-alert");
    if (activeBooking && activeBooking.status === "Requested") {
        document.getElementById("alert-pickup").innerText = activeBooking.pickup_address;
        document.getElementById("alert-drop").innerText = activeBooking.drop_address;
        document.getElementById("alert-fare").innerText = `₹${activeBooking.final_fare}`;
        document.getElementById("alert-dist").innerText = `${activeBooking.distance_km} km`;
        alertBox.style.display = "block";
    } else {
        alertBox.style.display = "none";
    }

    // Filter completions
    const bookings = window.db.getBookings();
    list.innerHTML = bookings.map(b => {
        let badgeStyle = "border-color: var(--accent-green); color: var(--accent-green);";
        if (b.status === 'Cancelled') badgeStyle = "border-color: var(--accent-red); color: var(--accent-red);";
        if (b.status === 'Requested') badgeStyle = "border-color: var(--accent-cyan); color: var(--accent-cyan);";

        return `
            <div class="history-item">
                <div>
                    <h4 style="font-size: 13px;">To: ${b.drop_address}</h4>
                    <span style="font-size: 11px; color: var(--color-text-muted);">${new Date(b.created_at).toLocaleTimeString()}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: var(--font-heading); font-weight: 700; color: var(--color-gold);">₹${b.final_fare}</div>
                    <span class="badge-outline" style="font-size: 9px; padding: 2px 6px; ${badgeStyle}">${b.status}</span>
                </div>
            </div>
        `;
    }).join('');
}

function driverAcceptRide() {
    if (activeBooking && activeBooking.status === "Requested") {
        window.db.updateBookingStatus(activeBooking.id, "Driver Assigned");
        showToast("Ride Accepted", "Chauffeur Karthik Raja is now assigned.", "success");
        renderDriverPortal();
        updateTrackingSidebarUI(activeBooking);
        
        // Trigger next simulation stage
        runRideSimulationSequence();
    }
}

function driverRejectRide() {
    if (activeBooking && activeBooking.status === "Requested") {
        window.db.updateBookingStatus(activeBooking.id, "Cancelled");
        showToast("Ride Rejected", "Ride request rejected.", "error");
        renderDriverPortal();
        resetBookingForm();
    }
}


function toggleDriverAvailability() {
    const online = document.getElementById("driver-online-toggle").checked;
    const lbl = document.getElementById("driver-online-lbl");

    if (online) {
        lbl.innerText = "ONLINE";
        lbl.style.color = "var(--accent-green)";
        window.db.updateDriverStatus("driver-1", "online", true);
        showToast("Driver Status", "You are now ONLINE. Awaiting ride requests.", "success");
    } else {
        lbl.innerText = "OFFLINE";
        lbl.style.color = "var(--color-text-muted)";
        window.db.updateDriverStatus("driver-1", "offline", false);
        showToast("Driver Status", "You are now OFFLINE. Rest time activated.", "gold");
    }
}


// =================== CORPORATE MODULE OPERATIONS ===================
function renderCorporatePortal() {
    const select = document.getElementById("corp-select");
    if (!select) return;

    const companies = window.db.getCompanies();
    select.innerHTML = companies.map(c => `<option value="${c.id}">${c.company_name}</option>`).join('');

    // Check link status
    const status = window.db.checkCorporateStatus();
    if (status) {
        document.getElementById("corporate-unregistered-view").style.display = "none";
        document.getElementById("corporate-registered-view").style.display = "block";
        document.getElementById("corp-info-name").innerText = status.company_name;
    } else {
        document.getElementById("corporate-unregistered-view").style.display = "block";
        document.getElementById("corporate-registered-view").style.display = "none";
    }
}

function registerCorporateProfile() {
    const compId = document.getElementById("corp-select").value;
    const email = document.getElementById("corp-email").value.trim();

    if (!email || !email.includes('@')) {
        showToast("Invalid Email", "Please enter a valid work email address.", "error");
        return;
    }

    const company = window.db.joinCompany(compId);
    showToast("Corporate Linked", `Linked successfully with ${company.company_name}.`, "success");
    renderCorporatePortal();
    syncUserWidgets();
    recalculateEstimatedFare();
}

function unlinkCorporateProfile() {
    window.db.leaveCompany();
    showToast("Corporate Unlinked", "Account billing switched back to personal label.", "gold");
    renderCorporatePortal();
    syncUserWidgets();
    recalculateEstimatedFare();
}


// =================== OPERATIONS / ADMIN DASHBOARD ===================
function renderOperationsDashboard() {
    const dbState = window.db.state;
    
    // Revenue calculations
    const payments = window.db.getPayments();
    const totalRev = payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
    document.getElementById("metric-revenue").innerText = `₹${totalRev.toLocaleString('en-IN')}.00`;

    // Active Online count
    const drivers = window.db.getDrivers();
    const onlineDrivers = drivers.filter(d => d.status === 'online').length;
    document.getElementById("metric-active-cabs").innerText = onlineDrivers;

    // Booking counts
    const bookings = window.db.getBookings();
    document.getElementById("metric-bookings").innerText = bookings.length;

    // Support tickets
    const tickets = window.db.getSupportTickets();
    const openTickets = tickets.filter(t => t.status === 'open').length;
    document.getElementById("metric-tickets").innerText = openTickets;

    // Load Fleet table
    const tableBody = document.getElementById("admin-fleet-table-body");
    if (tableBody) {
        tableBody.innerHTML = dbState.vehicles.map(v => {
            const driver = dbState.drivers.find(d => d.id === v.driver_id);
            const statusColor = driver?.status === 'online' ? 'var(--accent-green)' : 'var(--color-text-muted)';
            return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 0; font-family: monospace; font-weight: bold; color: var(--color-gold);">${v.registration_number}</td>
                    <td>${v.brand} ${v.model.split(' ')[0]} (${v.vehicle_type})</td>
                    <td>${driver?.driver_code || 'UNASSIGNED'}</td>
                    <td style="color: ${statusColor}; font-weight: bold;">${driver?.status.toUpperCase() || 'OFFLINE'}</td>
                </tr>
            `;
        }).join('');
    }

    // Load support tickets resolutions list
    const ticketsBox = document.getElementById("admin-tickets-container");
    if (ticketsBox) {
        ticketsBox.innerHTML = tickets.map(t => {
            const isResolved = t.status === 'resolved';
            const actionBtn = isResolved ? 
                `<span class="badge-outline" style="border-color: var(--accent-green); color: var(--accent-green);">RESOLVED</span>` : 
                `<button class="btn-primary" onclick="resolveTicketClick('${t.id}')" style="padding: 4px 12px; font-size: 11px; border-radius: 4px;">Resolve</button>`;

            return `
                <div class="glass-panel" style="padding: 16px; border-color: ${isResolved ? 'var(--border-color)' : 'rgba(229,169,59,0.3)'};">
                    <div class="flex-space-between" style="margin-bottom: 6px;">
                        <h4 style="font-size:13px; color: ${isResolved ? 'var(--color-text-secondary)' : '#fff'};">${t.subject}</h4>
                        ${actionBtn}
                    </div>
                    <p style="font-size:12px; color: var(--color-text-secondary); line-height: 1.4; margin-bottom: 10px;">${t.message}</p>
                    <div style="font-size:10px; color: var(--color-text-muted); display:flex; justify-content:space-between;">
                        <span>Ticket ID: ${t.id}</span>
                        <span>Opened: ${new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function resolveTicketClick(ticketId) {
    window.db.updateTicketStatus(ticketId, 'resolved');
    window.db.addNotification("Ticket Resolved", `Operations support ticket ${ticketId} has been marked as resolved.`, "general");
    showToast("Ticket Resolved", `Support ticket ${ticketId} is solved.`, "success");
    renderOperationsDashboard();
}


// =================== PROFILE / BOOKING HISTORY MODAL ===================
function openProfileModal() {
    const modal = document.getElementById("profile-modal");
    if (!modal) return;
    
    modal.style.display = "flex";
    syncUserWidgets();

    // Render bookings history list
    const container = document.getElementById("profile-bookings-list");
    const bookings = window.db.getBookings();

    container.innerHTML = bookings.map(b => {
        return `
            <div class="history-item" style="margin-bottom: 8px;">
                <div>
                    <h4 style="font-size:13px; margin-bottom: 2px;">${b.drop_address}</h4>
                    <span style="font-size:11px; color: var(--color-text-muted);">${new Date(b.created_at).toLocaleDateString()}</span>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--color-gold); font-weight:700;">₹${b.final_fare}</div>
                    <span style="font-size: 10px; color: var(--color-text-secondary);">${b.ride_type} Class</span>
                </div>
            </div>
        `;
    }).join('');
}

function closeProfileModal() {
    document.getElementById("profile-modal").style.display = "none";
}

function submitSupportTicket() {
    const subjInput = document.getElementById("ticket-subject");
    const msgInput = document.getElementById("ticket-message");
    
    const subject = subjInput.value.trim();
    const message = msgInput.value.trim();

    if (!subject || !message) {
        showToast("Missing Inputs", "Please enter subject and message detail for operations review.", "error");
        return;
    }

    const ticket = window.db.createSupportTicket(subject, message);
    showToast("Ticket Filed", `Operations ticket ${ticket.id} opened.`, "success");
    
    // Clear inputs
    subjInput.value = "";
    msgInput.value = "";
    
    closeProfileModal();
}
