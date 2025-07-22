-- Migration: Add homepage_content table
-- Created: 2024-01-20

CREATE TABLE IF NOT EXISTS homepage_content (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(50) UNIQUE NOT NULL,
    content_data JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_homepage_content_section_name ON homepage_content(section_name);
CREATE INDEX IF NOT EXISTS idx_homepage_content_active ON homepage_content(is_active);

-- Insert default content sections
INSERT INTO homepage_content (section_name, content_data, is_active) VALUES
('hero', '{
  "title": "Your Business Growth Partner",
  "subtitle": "Social Service Hub",
  "description": "Transform your business with our professional services. From social media management to web development, we deliver results that matter.",
  "ctaText": "Get Started Today",
  "ctaLink": "/auth/register"
}', true),

('video', '{
  "title": "See How We Transform Businesses",
  "description": "Watch how our clients achieved remarkable growth with our services",
  "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
}', true),

('features', '[
  {
    "icon": "🎨",
    "title": "Creative Design",
    "description": "Professional designs that capture your brand''s essence"
  },
  {
    "icon": "📱",
    "title": "Digital Marketing",
    "description": "Grow your audience with data-driven marketing strategies"
  },
  {
    "icon": "💻",
    "title": "Web Development", 
    "description": "Custom websites that convert visitors into customers"
  }
]', true),

('testimonials', '[
  {
    "name": "Sarah Johnson",
    "role": "CEO, TechStart",
    "content": "Amazing results! Our social media followers increased by 300% in just 3 months.",
    "rating": 5
  },
  {
    "name": "Mike Chen",
    "role": "Marketing Director",
    "content": "Professional service and great communication. Highly recommended!",
    "rating": 5
  },
  {
    "name": "Emily Davis",
    "role": "Small Business Owner",
    "content": "They helped us build a beautiful website that doubled our online sales.",
    "rating": 5
  }
]', true),

('stats', '[
  { "value": "500+", "label": "Happy Clients", "icon": "👥" },
  { "value": "1000+", "label": "Projects Completed", "icon": "🚀" },
  { "value": "99%", "label": "Client Satisfaction", "icon": "⭐" },
  { "value": "24/7", "label": "Support Available", "icon": "🔧" }
]', true),

('seo', '{
  "title": "Social Service Hub - Your Business Growth Partner",
  "description": "Transform your business with our professional services. From social media management to web development, we deliver results that matter.",
  "keywords": "social media marketing, web development, graphic design, digital marketing, business growth",
  "ogImage": "/images/og-image.jpg"
}', true),

('tracking', '{
  "googleAnalytics": "",
  "facebookPixel": "",
  "googleTagManager": "",
  "customCode": ""
}', true)

ON CONFLICT (section_name) DO NOTHING;

-- Update existing tables permissions (if needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON homepage_content TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE homepage_content_id_seq TO your_app_user;
