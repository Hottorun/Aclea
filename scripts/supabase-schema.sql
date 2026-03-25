-- Supabase Schema for LeadFlow CRM
-- Run this in your Supabase SQL Editor to create the tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  work_type TEXT NOT NULL,
  conversation_summary TEXT NOT NULL,
  approve_message TEXT NOT NULL,
  decline_message TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rating_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'unrelated')),
  contact_platform TEXT DEFAULT 'whatsapp' CHECK (contact_platform IN ('whatsapp', 'email')),
  lead_count INTEGER DEFAULT 1,
  is_loyal BOOLEAN DEFAULT FALSE,
  auto_approved BOOLEAN DEFAULT FALSE,
  original_message TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  webhook_url TEXT,
  auto_delete_declined_days INTEGER DEFAULT 0,
  auto_approve_enabled BOOLEAN DEFAULT FALSE,
  auto_approve_min_rating INTEGER DEFAULT 4,
  auto_decline_unrelated BOOLEAN DEFAULT FALSE,
  follow_up_days INTEGER DEFAULT 3,
  follow_up_message TEXT DEFAULT 'Hi {name}, just checking in on your inquiry. Are you still interested?',
  default_approve_message TEXT DEFAULT 'Thank you for your interest! We''d love to work with you.',
  default_decline_message TEXT DEFAULT 'Thank you for reaching out. Unfortunately, we''re not able to help at this time.',
  default_unrelated_message TEXT DEFAULT 'This message doesn''t seem to be related to our services.'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_rating ON leads(rating);
CREATE INDEX IF NOT EXISTS idx_leads_platform ON leads(contact_platform);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, name, role)
VALUES ('admin@leadflow.com', 'admin123', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
