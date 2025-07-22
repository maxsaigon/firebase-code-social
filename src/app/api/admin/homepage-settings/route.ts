import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { withAdminAuth } from '@/lib/auth-middleware';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/admin/homepage-settings - Get homepage settings for admin
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  console.log('=== Get Homepage Settings API Started ===');
  
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(`
        SELECT 
          section_name,
          content_data,
          is_active,
          updated_at
        FROM homepage_content 
        ORDER BY section_name
      `);

      console.log(`✅ Retrieved ${result.rows.length} homepage sections by admin ${user.email}`);

      // Default settings structure
      const defaultSettings = {
        hero: {
          title: "Your Business Growth Partner",
          subtitle: "Social Service Hub",
          description: "Transform your business with our professional services. From social media management to web development, we deliver results that matter.",
          ctaText: "Get Started Today",
          ctaLink: "/auth/register"
        },
        video: {
          title: "See How We Transform Businesses",
          description: "Watch how our clients achieved remarkable growth with our services",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        features: [
          {
            icon: "🎨",
            title: "Creative Design",
            description: "Professional designs that capture your brand's essence"
          },
          {
            icon: "📱",
            title: "Digital Marketing",
            description: "Grow your audience with data-driven marketing strategies"
          },
          {
            icon: "💻",
            title: "Web Development", 
            description: "Custom websites that convert visitors into customers"
          }
        ],
        testimonials: [
          {
            name: "Sarah Johnson",
            role: "CEO, TechStart",
            content: "Amazing results! Our social media followers increased by 300% in just 3 months.",
            rating: 5
          },
          {
            name: "Mike Chen",
            role: "Marketing Director",
            content: "Professional service and great communication. Highly recommended!",
            rating: 5
          },
          {
            name: "Emily Davis",
            role: "Small Business Owner",
            content: "They helped us build a beautiful website that doubled our online sales.",
            rating: 5
          }
        ],
        stats: [
          { value: "500+", label: "Happy Clients", icon: "👥" },
          { value: "1000+", label: "Projects Completed", icon: "🚀" },
          { value: "99%", label: "Client Satisfaction", icon: "⭐" },
          { value: "24/7", label: "Support Available", icon: "🔧" }
        ],
        seo: {
          title: "Social Service Hub - Your Business Growth Partner",
          description: "Transform your business with our professional services. From social media management to web development, we deliver results that matter.",
          keywords: "social media marketing, web development, graphic design, digital marketing, business growth",
          ogImage: "/images/og-image.jpg"
        },
        tracking: {
          googleAnalytics: "",
          facebookPixel: "",
          googleTagManager: "",
          customCode: ""
        }
      };

      // Merge with database content
      result.rows.forEach(row => {
        if (row.content_data) {
          try {
            // PostgreSQL JSONB is already parsed by the pg client
            const data = typeof row.content_data === 'string' ? JSON.parse(row.content_data) : row.content_data;
            const sectionName = row.section_name as keyof typeof defaultSettings;
            if (defaultSettings[sectionName]) {
              (defaultSettings as any)[sectionName] = { ...defaultSettings[sectionName], ...data };
            }
          } catch (error) {
            console.error('Error parsing content data:', error);
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: defaultSettings
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Get homepage settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage settings' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/homepage-settings - Update homepage settings
export const PUT = withAdminAuth(async (request: NextRequest, user) => {
  console.log('=== Update Homepage Settings API Started ===');
  
  try {
    const body = await request.json();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update or insert each section
      for (const [sectionName, sectionData] of Object.entries(body)) {
        await client.query(`
          INSERT INTO homepage_content (section_name, content_data, is_active, updated_at)
          VALUES ($1, $2, true, NOW())
          ON CONFLICT (section_name) 
          DO UPDATE SET 
            content_data = EXCLUDED.content_data,
            updated_at = NOW()
        `, [sectionName, JSON.stringify(sectionData)]);
      }

      await client.query('COMMIT');
      
      console.log(`✅ Homepage settings updated successfully by admin ${user.email}`);

      return NextResponse.json({
        success: true,
        message: 'Homepage settings updated successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Update homepage settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update homepage settings' },
      { status: 500 }
    );
  }
});
