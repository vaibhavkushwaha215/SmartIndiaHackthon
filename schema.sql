-- ==============================================================================
-- SahyogSeva - Cooperative Gig-Services Database Schema (PostgreSQL for Supabase)
-- ==============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Customer', 'Worker', 'Admin', 'SuperAdmin')),
    phone TEXT NOT NULL,
    language_pref TEXT DEFAULT 'en' CHECK (language_pref IN ('en', 'hi')),
    avatar_url TEXT,
    password_hash TEXT DEFAULT 'changeme', -- Plain text for prototype; migrate to bcrypt in production
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration for existing Supabase instances (run in SQL Editor):
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
-- ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('Customer', 'Worker', 'Admin', 'SuperAdmin'));
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT 'changeme';
-- UPDATE public.users SET password_hash = 'customer123' WHERE role = 'Customer';
-- UPDATE public.users SET password_hash = 'worker123' WHERE role = 'Worker';
-- UPDATE public.users SET password_hash = 'admin123' WHERE role = 'Admin';
-- UPDATE public.users SET password_hash = 'superadmin123' WHERE role = 'SuperAdmin';

-- 2. Create Workers Table
CREATE TABLE IF NOT EXISTS public.workers (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    cooperative_id TEXT NOT NULL,
    skill TEXT NOT NULL,
    area TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00,
    hourly_rate NUMERIC(10, 2) DEFAULT 299.00,
    experience_years INTEGER DEFAULT 5,
    completed_jobs_count INTEGER DEFAULT 0,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    problem_description TEXT,
    amount NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    customer_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Logs Table for Audit & Troubleshooting
CREATE TABLE IF NOT EXISTS public.logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT,
    phone TEXT,
    action TEXT NOT NULL,
    route TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    result_code INTEGER NOT NULL,
    details TEXT
);

-- 6. Create System Configuration Table (Generic for Feature Flags & Settings)
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Anonymous/Public Read Policies for Cooperative Prototype
CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on users" ON public.users FOR ALL USING (true);

CREATE POLICY "Allow public read on workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Allow public update on workers" ON public.workers FOR ALL USING (true);

CREATE POLICY "Allow public read on bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public write on bookings" ON public.bookings FOR ALL USING (true);

CREATE POLICY "Allow public read on reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public write on reviews" ON public.reviews FOR ALL USING (true);

CREATE POLICY "Allow public read on logs" ON public.logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on logs" ON public.logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on system_config" ON public.system_config FOR SELECT USING (true);
CREATE POLICY "Allow public write on system_config" ON public.system_config FOR ALL USING (true);

-- Seed Workers & Users
INSERT INTO public.users (id, name, role, phone, language_pref, avatar_url) VALUES
('user-cust-1', 'Ramesh Kumar', 'Customer', '9876543210', 'en', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
('user-cust-2', 'Pooja Verma', 'Customer', '9811223344', 'hi', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
('user-work-1', 'Rajesh Sharma', 'Worker', '9820011223', 'en', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
('user-work-2', 'Amit Patel', 'Worker', '9820022334', 'hi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
('user-work-3', 'Manoj Kumar Maurya', 'Worker', '9820033445', 'hi', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'),
('user-work-4', 'Suresh Babu', 'Worker', '9820044556', 'en', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'),
('user-work-5', 'Dinesh Yadav', 'Worker', '9820055667', 'hi', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'),
('user-work-6', 'Vikram Singh', 'Worker', '9820066778', 'en', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'),
('user-admin-1', 'Sunita Patel', 'Admin', '9900011223', 'en', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
('user-superadmin-1', 'Dr. Anand Swarup', 'SuperAdmin', '9999900001', 'en', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workers (id, user_id, cooperative_id, skill, area, verified, rating_avg, hourly_rate, experience_years, completed_jobs_count, bio) VALUES
('worker-1', 'user-work-1', 'COOP-DL-804 (Delhi Vidyut Sahyog)', 'Master Electrician • MCB, Short Circuit, Inverter & Earthing Specialist', 'Lajpat Nagar & South Delhi', true, 4.90, 299.00, 9, 342, 'Certified master electrician affiliated with Delhi Vidyut Sahyog. 9 years in residential diagnostics.'),
('worker-2', 'user-work-2', 'COOP-GJ-102 (Shramik Shakti Sangathan)', 'Appliance Repair • Fan, Geyser, AC Wiring & Distribution Board', 'Dwarka & West Delhi', true, 4.80, 249.00, 7, 218, 'Dedicated technician specializing in quick appliance fault resolution and modern DB installations.'),
('worker-3', 'user-work-3', 'COOP-UP-551 (Noida Shramik Ekta Manch)', 'Smart Home Wiring • LED Fixtures, Sensor Switch & Power Backup', 'Noida Sector 62 & Indirapuram', true, 4.95, 349.00, 11, 480, 'Senior electrical artisan with ITI Certification. Expertise in modular switchboards and smart load automation.'),
('worker-4', 'user-work-4', 'COOP-KA-312 (Bengaluru Electricians Federation)', 'Commercial & Domestic Three-Phase Wiring • Submeter Installation', 'Connaught Place & Central Delhi', true, 4.75, 399.00, 12, 510, 'High-voltage and 3-phase specialist trusted by local shops, offices, and residential societies.'),
('worker-5', 'user-work-5', 'COOP-HR-209 (Gurugram Karigar Sahyog)', 'Emergency Power Troubleshooting • Socket & Switch Replacement', 'Rohini & North Delhi', true, 4.85, 279.00, 6, 195, 'Rapid-response electrician equipped for emergency power trips, wiring burnouts, and fuse replacements.'),
('worker-6', 'user-work-6', 'COOP-MH-440 (Sahyog Kamgar Mahasangh)', 'Complete House Re-wiring • Solar Inverter Connection & Earthing', 'Mayur Vihar & East Delhi', true, 4.90, 320.00, 8, 275, 'Safety-certified cooperative member. Focuses on fire-safe copper wiring and eco-friendly solar hookups.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bookings (id, customer_id, worker_id, date, time_slot, address, status, problem_description, amount) VALUES
('bk-101', 'user-cust-1', 'worker-1', '2026-08-25', '10:00 AM - 12:00 PM', 'Flat 402, Block B, Green Park Apartments, Lajpat Nagar, Delhi', 'confirmed', 'Main MCB tripping repeatedly whenever AC is turned on. Need earthing check.', 349.00),
('bk-102', 'user-cust-1', 'worker-2', '2026-08-22', '02:00 PM - 04:00 PM', 'House 14, Sector 7, Dwarka, New Delhi', 'completed', 'Geyser switch burned out and ceiling fan regulator replacement.', 299.00),
('bk-103', 'user-cust-2', 'worker-3', '2026-08-26', '04:00 PM - 06:00 PM', 'Tower 3, Flat 1201, Express Zenith, Sector 77, Noida', 'pending', 'Installation of 6 smart LED panel lights and touch switches in living room.', 450.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, booking_id, rating, comment, customer_name) VALUES
('rev-201', 'bk-102', 5, 'Rajesh arrived on time with proper cooperative ID badge and testing tools. Fixed the geyser board safely and charged strictly as per cooperative fair-price tariff!', 'Ramesh Kumar')
ON CONFLICT (id) DO NOTHING;
