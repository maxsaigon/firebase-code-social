import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/homepage - Get homepage content
export async function GET() {
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
        WHERE is_active = true
        ORDER BY section_name
      `);

      // Transform database results into structured content
      const content = {
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
        }
      };

      // Override with database content if available
      result.rows.forEach(row => {
        if (row.content_data) {
          try {
            // PostgreSQL JSONB is already parsed by the pg client
            const data = typeof row.content_data === 'string' ? JSON.parse(row.content_data) : row.content_data;
            const sectionName = row.section_name as keyof typeof content;
            if (content[sectionName]) {
              // Handle array vs object merging properly
              if (Array.isArray(data)) {
                (content as any)[sectionName] = data;
              } else {
                (content as any)[sectionName] = { ...content[sectionName], ...data };
              }
            }
          } catch (error) {
            console.error('Error parsing content data:', error);
          }
        }
      });

      return NextResponse.json(content);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage content' },
      { status: 500 }
    );
  }
}
