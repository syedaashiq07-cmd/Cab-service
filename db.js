// Premium Cab Services Database Simulation Layer
// Exposes in-memory SQL-like operations with LocalStorage persistence

const DB_KEY = 'premium_cab_platform_db';

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Initial Database Seed
const initialDB = {
    users: [
        {
            id: "user-current-id", // Fixed for ease of current user session
            full_name: "Syed Aashiq",
            email: "aashiq@premiumcabs.com",
            phone: "+91 98765 43210",
            password_hash: "pbkdf2_sha256_mock_hash",
            profile_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200",
            role: "customer",
            status: "active",
            email_verified: true,
            phone_verified: true,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: "user-driver-1",
            full_name: "Karthik Raja",
            email: "karthik.r@premiumcabs.com",
            phone: "+91 91234 56780",
            password_hash: "mock_hash_2",
            profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200",
            role: "driver",
            status: "active",
            email_verified: true,
            phone_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: "user-driver-2",
            full_name: "Priya Sundaram",
            email: "priya.s@premiumcabs.com",
            phone: "+91 91234 56781",
            password_hash: "mock_hash_3",
            profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200",
            role: "driver",
            status: "active",
            email_verified: true,
            phone_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: "user-driver-3",
            full_name: "Mohammad Ali",
            email: "ali.m@premiumcabs.com",
            phone: "+91 91234 56782",
            password_hash: "mock_hash_4",
            profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200",
            role: "driver",
            status: "active",
            email_verified: true,
            phone_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: "user-admin-1",
            full_name: "Admin Platform Coordinator",
            email: "admin@premiumcabs.com",
            phone: "+91 99999 88888",
            password_hash: "admin_hash",
            profile_image: "",
            role: "admin",
            status: "active",
            email_verified: true,
            phone_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ],
    user_profiles: [
        {
            id: generateUUID(),
            user_id: "user-current-id",
            date_of_birth: "1995-08-12",
            gender: "Male",
            emergency_name: "Rahman Syed",
            emergency_phone: "+91 98450 12345",
            preferred_language: "Tamil",
            created_at: new Date().toISOString()
        }
    ],
    saved_locations: [
        {
            id: "loc-home",
            user_id: "user-current-id",
            title: "Home (T-Nagar)",
            address: "12, G.N. Chetty Road, T-Nagar, Chennai, Tamil Nadu - 600017",
            latitude: 13.0440,
            longitude: 80.2370,
            location_type: "Home",
            created_at: new Date().toISOString()
        },
        {
            id: "loc-office",
            user_id: "user-current-id",
            title: "Office (DLF Cybercity)",
            address: "Block 3, DLF IT Park, Ramapuram, Chennai, Tamil Nadu - 600089",
            latitude: 13.0180,
            longitude: 80.1650,
            location_type: "Office",
            created_at: new Date().toISOString()
        },
        {
            id: "loc-airport",
            user_id: "user-current-id",
            title: "Chennai Airport (MAA)",
            address: "Meenambakkam, Chennai, Tamil Nadu - 600027",
            latitude: 12.9940,
            longitude: 80.1710,
            location_type: "Airport",
            created_at: new Date().toISOString()
        }
    ],
    drivers: [
        {
            id: "driver-1",
            user_id: "user-driver-1",
            driver_code: "DRV-1002",
            experience_years: 6,
            license_number: "DL-0420201844",
            rating: 4.85,
            status: "online", // online, offline, busy
            availability: true,
            current_latitude: 13.0480, // Near Home (T-Nagar)
            current_longitude: 80.2300,
            created_at: new Date().toISOString()
        },
        {
            id: "driver-2",
            user_id: "user-driver-2",
            driver_code: "DRV-2041",
            experience_years: 8,
            license_number: "DL-0820159932",
            rating: 4.96,
            status: "online",
            availability: true,
            current_latitude: 13.0300, // Near Office (DLF Ramapuram)
            current_longitude: 80.1800,
            created_at: new Date().toISOString()
        },
        {
            id: "driver-3",
            user_id: "user-driver-3",
            driver_code: "DRV-9011",
            experience_years: 4,
            license_number: "DL-1120224410",
            rating: 4.70,
            status: "offline",
            availability: false,
            current_latitude: 12.9850,
            current_longitude: 80.1600,
            created_at: new Date().toISOString()
        }
    ],
    driver_documents: [
        {
            id: generateUUID(),
            driver_id: "driver-1",
            document_type: "Driving License",
            document_url: "dl_copy.pdf",
            verification_status: "verified",
            uploaded_at: new Date().toISOString()
        },
        {
            id: generateUUID(),
            driver_id: "driver-2",
            document_type: "Aadhar Card",
            document_url: "aadhar_copy.pdf",
            verification_status: "verified",
            uploaded_at: new Date().toISOString()
        }
    ],
    vehicles: [
        {
            id: "vehicle-1",
            driver_id: "driver-1",
            brand: "Mercedes-Benz",
            model: "E-Class (Luxury)",
            year: 2023,
            registration_number: "TN-01-BS-7777",
            vehicle_type: "Luxury",
            color: "Obsidian Black",
            seating_capacity: 4,
            luggage_capacity: 3,
            image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&h=250",
            status: "active"
        },
        {
            id: "vehicle-2",
            driver_id: "driver-2",
            brand: "Toyota",
            model: "Innova Crysta (SUV)",
            year: 2022,
            registration_number: "TN-09-CQ-2022",
            vehicle_type: "SUV",
            color: "Pearl White",
            seating_capacity: 6,
            luggage_capacity: 5,
            image_url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=400&h=250",
            status: "active"
        },
        {
            id: "vehicle-3",
            driver_id: "driver-3",
            brand: "Hyundai",
            model: "Verna (Sedan)",
            year: 2021,
            registration_number: "TN-07-DE-8080",
            vehicle_type: "Sedan",
            color: "Stardust Silver",
            seating_capacity: 4,
            luggage_capacity: 2,
            image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&h=250",
            status: "active"
        }
    ],
    vehicle_features: [
        { id: generateUUID(), vehicle_id: "vehicle-1", feature_name: "Nappa Leather Seats" },
        { id: generateUUID(), vehicle_id: "vehicle-1", feature_name: "High-Speed WiFi" },
        { id: generateUUID(), vehicle_id: "vehicle-1", feature_name: "Chilled Water Bottles" },
        { id: generateUUID(), vehicle_id: "vehicle-1", feature_name: "USB-C Chargers" },
        
        { id: generateUUID(), vehicle_id: "vehicle-2", feature_name: "WiFi Available" },
        { id: generateUUID(), vehicle_id: "vehicle-2", feature_name: "Extra Legroom" },
        { id: generateUUID(), vehicle_id: "vehicle-2", feature_name: "Chilled Water Bottles" },
        
        { id: generateUUID(), vehicle_id: "vehicle-3", feature_name: "Air Conditioning" },
        { id: generateUUID(), vehicle_id: "vehicle-3", feature_name: "USB Charger" }
    ],
    bookings: [
        {
            id: "b-history-1",
            user_id: "user-current-id",
            driver_id: "driver-1",
            vehicle_id: "vehicle-1",
            pickup_address: "Office (DLF Cybercity)",
            pickup_latitude: 13.0180,
            pickup_longitude: 80.1650,
            drop_address: "Home (T-Nagar)",
            drop_latitude: 13.0440,
            drop_longitude: 80.2370,
            ride_type: "Luxury",
            scheduled_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            distance_km: 8.5,
            estimated_fare: 450.00,
            final_fare: 450.00,
            status: "Completed",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: "b-history-2",
            user_id: "user-current-id",
            driver_id: "driver-2",
            vehicle_id: "vehicle-2",
            pickup_address: "Home (T-Nagar)",
            pickup_latitude: 13.0440,
            pickup_longitude: 80.2370,
            drop_address: "Chennai Airport (MAA)",
            drop_latitude: 12.9940,
            drop_longitude: 80.1710,
            ride_type: "Airport",
            scheduled_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            distance_km: 11.2,
            estimated_fare: 350.00,
            final_fare: 320.00, // discount applied
            status: "Completed",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    booking_status_history: [
        { id: generateUUID(), booking_id: "b-history-1", status: "Requested", created_at: new Date().toISOString() },
        { id: generateUUID(), booking_id: "b-history-1", status: "Completed", created_at: new Date().toISOString() }
    ],
    driver_locations: [],
    payments: [
        {
            id: generateUUID(),
            booking_id: "b-history-1",
            user_id: "user-current-id",
            payment_method: "UPI",
            transaction_id: "TXN98492040182",
            amount: 450.00,
            payment_status: "Paid",
            paid_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUUID(),
            booking_id: "b-history-2",
            user_id: "user-current-id",
            payment_method: "Card",
            transaction_id: "TXN10294829490",
            amount: 320.00,
            payment_status: "Paid",
            paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    invoices: [
        {
            id: generateUUID(),
            booking_id: "b-history-1",
            invoice_number: "INV-2026-0001",
            invoice_url: "#",
            generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    memberships: [
        {
            id: "m-silver",
            name: "Silver Tier",
            price: 499.00,
            duration_days: 30,
            benefits: { discount: "5% discount on all bookings", priority: "Standard booking priority", lounge: "No lounge access" }
        },
        {
            id: "m-gold",
            name: "Gold Member",
            price: 999.00,
            duration_days: 30,
            benefits: { discount: "10% discount on all bookings", priority: "High priority matching", lounge: "Airport lounge passes (1/mo)" }
        },
        {
            id: "m-platinum",
            name: "Platinum Elite",
            price: 1999.00,
            duration_days: 90,
            benefits: { discount: "15% discount on all bookings", priority: "Immediate VIP matching", lounge: "Unlimited domestic lounge access", special: "Complimentary bottles & snacks" }
        },
        {
            id: "m-black",
            name: "Black VIP Label",
            price: 4999.00,
            duration_days: 180,
            benefits: { discount: "20% discount on all bookings", priority: "Reserved elite vehicles only", lounge: "Worldwide luxury lounge access", special: "Private concierge & free upgrades" }
        }
    ],
    user_memberships: [
        {
            id: "um-current",
            user_id: "user-current-id",
            membership_id: "m-gold", // Current user is a Gold Member
            start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "active"
        }
    ],
    reward_points: [
        {
            id: generateUUID(),
            user_id: "user-current-id",
            points: 120,
            transaction_type: "earned",
            description: "Ride to Airport reward",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUUID(),
            user_id: "user-current-id",
            points: 50,
            transaction_type: "earned",
            description: "Gold signup bonus",
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    coupons: [
        {
            id: "c-welcome",
            code: "WELCOME50",
            discount_type: "percentage",
            discount_value: 50, // 50%
            expiry_date: "2026-12-31",
            usage_limit: 1
        },
        {
            id: "c-flat",
            code: "PREMIUMGOLD",
            discount_type: "flat",
            discount_value: 150, // ₹150 off
            expiry_date: "2026-08-30",
            usage_limit: 5
        },
        {
            id: "c-corp",
            code: "GOOGLE10",
            discount_type: "percentage",
            discount_value: 10,
            expiry_date: "2027-01-01",
            usage_limit: 999
        }
    ],
    user_coupon_usage: [],
    ride_reviews: [
        {
            id: generateUUID(),
            booking_id: "b-history-1",
            user_id: "user-current-id",
            driver_id: "driver-1",
            rating: 5,
            comment: "Excellent drive! The driver was extremely professional and the ride was exceptionally smooth.",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    support_tickets: [
        {
            id: "t-1",
            user_id: "user-current-id",
            subject: "Lost Wallet in Mercedes Verna",
            message: "Hi, I think I left my wallet in the cab TN-01-BS-7777 yesterday evening. It's a brown leather wallet. Please let me know if the driver found it.",
            status: "open",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: "t-2",
            user_id: "user-current-id",
            subject: "Invoice correction",
            message: "I was charged twice on my card for the booking to the airport. Please refund one payment.",
            status: "resolved",
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    companies: [
        {
            id: "corp-google",
            company_name: "Google India Pvt Ltd",
            email: "travel@google.com",
            billing_address: "Google Signature Towers, Sector 15, Gurgaon / RMZ Millenia, Chennai"
        },
        {
            id: "corp-tcs",
            company_name: "Tata Consultancy Services",
            email: "corporate.travel@tcs.com",
            billing_address: "TCS House, Raveline Street, Fort, Mumbai"
        }
    ],
    corporate_employees: [
        {
            id: "ce-1",
            company_id: "corp-google",
            user_id: "user-current-id"
        }
    ],
    notifications: [
        {
            id: "n-1",
            user_id: "user-current-id",
            title: "Welcome to Premium Cabs",
            message: "Thank you for joining our elite fleet booking service. Use code WELCOME50 for 50% off your first ride!",
            type: "general",
            read: false,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: "n-2",
            user_id: "user-current-id",
            title: "Gold Tier Activated",
            message: "Your Gold membership has been successfully activated. Enjoy priority matching and 10% off rides.",
            type: "billing",
            read: true,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    admins: [
        {
            id: generateUUID(),
            email: "coordinator@premiumcabs.com",
            role: "Fleet Manager",
            created_at: new Date().toISOString()
        }
    ]
};

// Database class to read/write state
class Database {
    constructor() {
        this.load();
    }

    load() {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            try {
                this.state = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse DB, re-seeding", e);
                this.state = { ...initialDB };
                this.save();
            }
        } else {
            this.state = { ...initialDB };
            this.save();
        }
    }

    save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.state));
    }

    reset() {
        this.state = { ...initialDB };
        this.save();
    }

    // --- Users API ---
    getCurrentUser() {
        return this.state.users.find(u => u.id === "user-current-id");
    }

    updateCurrentUserProfile(data) {
        const user = this.getCurrentUser();
        if (user) {
            Object.assign(user, data);
            user.updated_at = new Date().toISOString();
            this.save();
        }
        return user;
    }

    // --- Bookings API ---
    getBookings() {
        return this.state.bookings;
    }

    getBookingDetails(id) {
        const booking = this.state.bookings.find(b => b.id === id);
        if (!booking) return null;
        
        const driver = this.state.drivers.find(d => d.id === booking.driver_id);
        const driverUser = driver ? this.state.users.find(u => u.id === driver.user_id) : null;
        const vehicle = this.state.vehicles.find(v => v.id === booking.vehicle_id);
        const features = vehicle ? this.state.vehicle_features.filter(f => f.vehicle_id === vehicle.id) : [];

        return {
            ...booking,
            driver_details: driver ? { ...driver, full_name: driverUser?.full_name, profile_image: driverUser?.profile_image } : null,
            vehicle_details: vehicle ? { ...vehicle, features: features.map(f => f.feature_name) } : null
        };
    }

    createBooking(bookingData) {
        const id = generateUUID();
        const newBooking = {
            id,
            user_id: "user-current-id",
            driver_id: bookingData.driver_id || null,
            vehicle_id: bookingData.vehicle_id || null,
            pickup_address: bookingData.pickup_address,
            pickup_latitude: bookingData.pickup_latitude,
            pickup_longitude: bookingData.pickup_longitude,
            drop_address: bookingData.drop_address,
            drop_latitude: bookingData.drop_latitude,
            drop_longitude: bookingData.drop_longitude,
            ride_type: bookingData.ride_type,
            scheduled_time: bookingData.scheduled_time || new Date().toISOString(),
            distance_km: bookingData.distance_km,
            estimated_fare: bookingData.estimated_fare,
            final_fare: bookingData.final_fare || bookingData.estimated_fare,
            status: "Requested",
            created_at: new Date().toISOString()
        };

        this.state.bookings.unshift(newBooking);
        
        // Add history entry
        this.state.booking_status_history.push({
            id: generateUUID(),
            booking_id: id,
            status: "Requested",
            created_at: new Date().toISOString()
        });

        this.save();
        return newBooking;
    }

    updateBookingStatus(bookingId, status) {
        const booking = this.state.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = status;
            
            // Add status history
            this.state.booking_status_history.push({
                id: generateUUID(),
                booking_id: bookingId,
                status: status,
                created_at: new Date().toISOString()
            });

            // Update driver availability if finished or cancelled
            if (status === "Completed" || status === "Cancelled") {
                const driver = this.state.drivers.find(d => d.id === booking.driver_id);
                if (driver) {
                    driver.status = "online";
                    driver.availability = true;
                }
            }

            this.save();
        }
        return booking;
    }

    // --- Drivers API ---
    getDrivers() {
        return this.state.drivers.map(drv => {
            const user = this.state.users.find(u => u.id === drv.user_id);
            const vehicle = this.state.vehicles.find(v => v.driver_id === drv.id);
            return {
                ...drv,
                full_name: user?.full_name,
                profile_image: user?.profile_image,
                vehicle_details: vehicle
            };
        });
    }

    getDriverById(driverId) {
        const drv = this.state.drivers.find(d => d.id === driverId);
        if (!drv) return null;
        const user = this.state.users.find(u => u.id === drv.user_id);
        const vehicle = this.state.vehicles.find(v => v.driver_id === drv.id);
        return {
            ...drv,
            full_name: user?.full_name,
            profile_image: user?.profile_image,
            vehicle_details: vehicle
        };
    }

    updateDriverStatus(driverId, status, availability) {
        const driver = this.state.drivers.find(d => d.id === driverId);
        if (driver) {
            if (status !== undefined) driver.status = status;
            if (availability !== undefined) driver.availability = availability;
            this.save();
        }
        return driver;
    }

    updateDriverLocation(driverId, lat, lng, speed = 40, heading = 90) {
        const driver = this.state.drivers.find(d => d.id === driverId);
        if (driver) {
            driver.current_latitude = lat;
            driver.current_longitude = lng;
            
            // Record historical point
            this.state.driver_locations.push({
                id: this.state.driver_locations.length + 1,
                driver_id: driverId,
                latitude: lat,
                longitude: lng,
                speed,
                heading,
                created_at: new Date().toISOString()
            });

            this.save();
        }
        return driver;
    }

    // --- Saved Locations API ---
    getSavedLocations() {
        return this.state.saved_locations;
    }

    addSavedLocation(location) {
        const newLoc = {
            id: generateUUID(),
            user_id: "user-current-id",
            title: location.title,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            location_type: location.location_type || "Other",
            created_at: new Date().toISOString()
        };
        this.state.saved_locations.push(newLoc);
        this.save();
        return newLoc;
    }

    // --- Memberships API ---
    getMemberships() {
        return this.state.memberships;
    }

    getUserMembershipDetails() {
        const userMem = this.state.user_memberships.find(um => um.user_id === "user-current-id" && um.status === "active");
        if (!userMem) return null;
        const membership = this.state.memberships.find(m => m.id === userMem.membership_id);
        return {
            ...userMem,
            membership_details: membership
        };
    }

    purchaseMembership(membershipId) {
        // Cancel existing active membership
        this.state.user_memberships.forEach(um => {
            if (um.user_id === "user-current-id" && um.status === "active") {
                um.status = "cancelled";
            }
        });

        const membership = this.state.memberships.find(m => m.id === membershipId);
        const duration = membership ? membership.duration_days : 30;
        
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + duration);

        const newMem = {
            id: "um-" + generateUUID().substring(0, 8),
            user_id: "user-current-id",
            membership_id: membershipId,
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0],
            status: "active"
        };

        this.state.user_memberships.push(newMem);

        // Add reward points for purchase
        const pointsAwarded = Math.floor((membership ? parseFloat(membership.price) : 0) / 10);
        this.addRewardPoints(pointsAwarded, "earned", `Bonus points for purchasing ${membership?.name}`);

        // Add Invoice & Payment
        const bookingIdMock = "membership-" + generateUUID().substring(0, 8);
        this.state.payments.push({
            id: generateUUID(),
            booking_id: bookingIdMock,
            user_id: "user-current-id",
            payment_method: "Card",
            transaction_id: "TXNMEMB" + Date.now().toString().slice(-6),
            amount: membership?.price || 0,
            payment_status: "Paid",
            paid_at: new Date().toISOString()
        });

        this.save();
        return this.getUserMembershipDetails();
    }

    // --- Reward Points API ---
    getRewardPoints() {
        return this.state.reward_points;
    }

    getTotalPoints() {
        return this.state.reward_points.reduce((total, p) => {
            return p.transaction_type === "earned" ? total + p.points : total - p.points;
        }, 0);
    }

    addRewardPoints(points, type, description) {
        const record = {
            id: generateUUID(),
            user_id: "user-current-id",
            points,
            transaction_type: type, // earned or redeemed
            description,
            created_at: new Date().toISOString()
        };
        this.state.reward_points.push(record);
        this.save();
        return record;
    }

    // --- Coupons API ---
    getCouponByCode(code) {
        return this.state.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    }

    recordCouponUsage(couponId, bookingId) {
        const usage = {
            id: generateUUID(),
            user_id: "user-current-id",
            coupon_id: couponId,
            booking_id: bookingId
        };
        this.state.user_coupon_usage.push(usage);
        this.save();
        return usage;
    }

    // --- Reviews API ---
    getReviews() {
        return this.state.ride_reviews;
    }

    addReview(bookingId, rating, comment) {
        const booking = this.state.bookings.find(b => b.id === bookingId);
        if (!booking) return null;

        const newReview = {
            id: generateUUID(),
            booking_id: bookingId,
            user_id: "user-current-id",
            driver_id: booking.driver_id,
            rating,
            comment,
            created_at: new Date().toISOString()
        };

        this.state.ride_reviews.push(newReview);

        // Update driver's overall rating
        const driver = this.state.drivers.find(d => d.id === booking.driver_id);
        if (driver) {
            const driverReviews = this.state.ride_reviews.filter(r => r.driver_id === driver.id);
            const totalRating = driverReviews.reduce((sum, r) => sum + r.rating, 0);
            driver.rating = parseFloat((totalRating / driverReviews.length).toFixed(2));
        }

        this.save();
        return newReview;
    }

    // --- Support Tickets API ---
    getSupportTickets() {
        return this.state.support_tickets;
    }

    createSupportTicket(subject, message) {
        const ticket = {
            id: "t-" + (this.state.support_tickets.length + 1),
            user_id: "user-current-id",
            subject,
            message,
            status: "open",
            created_at: new Date().toISOString()
        };
        this.state.support_tickets.unshift(ticket);
        this.save();
        return ticket;
    }

    updateTicketStatus(ticketId, status) {
        const ticket = this.state.support_tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = status;
            this.save();
        }
        return ticket;
    }

    // --- Corporate API ---
    getCompanies() {
        return this.state.companies;
    }

    getCorporateEmployees() {
        return this.state.corporate_employees.map(ce => {
            const user = this.state.users.find(u => u.id === ce.user_id);
            const company = this.state.companies.find(c => c.id === ce.company_id);
            return {
                ...ce,
                user_name: user?.full_name,
                user_email: user?.email,
                company_name: company?.company_name
            };
        });
    }

    checkCorporateStatus() {
        const relation = this.state.corporate_employees.find(ce => ce.user_id === "user-current-id");
        if (!relation) return null;
        return this.state.companies.find(c => c.id === relation.company_id);
    }

    joinCompany(companyId) {
        // Remove existing relation if any
        this.state.corporate_employees = this.state.corporate_employees.filter(ce => ce.user_id !== "user-current-id");
        
        const relation = {
            id: generateUUID(),
            company_id: companyId,
            user_id: "user-current-id"
        };
        
        this.state.corporate_employees.push(relation);
        this.save();
        return this.checkCorporateStatus();
    }

    leaveCompany() {
        this.state.corporate_employees = this.state.corporate_employees.filter(ce => ce.user_id !== "user-current-id");
        this.save();
        return null;
    }

    // --- Payments and Invoices ---
    createPayment(bookingId, method, amount, status = "Paid") {
        const txnId = "TXN" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const payment = {
            id: generateUUID(),
            booking_id: bookingId,
            user_id: "user-current-id",
            payment_method: method,
            transaction_id: txnId,
            amount: parseFloat(amount),
            payment_status: status,
            paid_at: new Date().toISOString()
        };
        this.state.payments.unshift(payment);

        // Generate invoice record
        const invNo = "INV-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
        this.state.invoices.unshift({
            id: generateUUID(),
            booking_id: bookingId,
            invoice_number: invNo,
            invoice_url: "#",
            generated_at: new Date().toISOString()
        });

        this.save();
        return payment;
    }

    getPayments() {
        return this.state.payments;
    }

    getInvoices() {
        return this.state.invoices;
    }

    // --- Notifications API ---
    getNotifications() {
        return this.state.notifications;
    }

    markNotificationRead(id) {
        const notification = this.state.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.save();
        }
        return this.state.notifications;
    }

    addNotification(title, message, type = "general") {
        const notification = {
            id: generateUUID(),
            user_id: "user-current-id",
            title,
            message,
            type,
            read: false,
            created_at: new Date().toISOString()
        };
        this.state.notifications.unshift(notification);
        this.save();
        return notification;
    }
}

// Instantiate database globally
window.db = new Database();
console.log("Premium Cab Platform In-Memory Database Initialized & Synced with LocalStorage");
