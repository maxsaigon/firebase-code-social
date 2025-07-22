'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Play, ArrowRight, Users, Award, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface HomepageContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage?: string;
  };
  video: {
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar?: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
}

export default function HomePage() {
  const { data: content, isLoading } = useQuery<HomepageContent>({
    queryKey: ['homepage-content'],
    queryFn: async () => {
      const response = await fetch('/api/homepage');
      if (!response.ok) {
        throw new Error('Failed to fetch homepage content');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Default content if API fails
  const defaultContent: HomepageContent = {
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
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
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
    ]
  };

  const displayContent = content || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
              {displayContent.hero.subtitle}
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              {displayContent.hero.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {displayContent.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href={displayContent.hero.ctaLink}>
                  {displayContent.hero.ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3" asChild>
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {(displayContent.stats || []).map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive digital services to help your business grow and succeed online.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {(displayContent.features || []).map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {displayContent.video.title}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {displayContent.video.description}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
              <iframe
                src={displayContent.video.videoUrl}
                title="Company Introduction Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our satisfied clients have to say.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {(displayContent.testimonials || []).map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial?.rating || 0)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial?.content || ''}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial?.name || ''}</p>
                      <p className="text-sm text-gray-600">{testimonial?.role || ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who have transformed their businesses with our services.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
            <Link href="/auth/register">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Social Service Hub</h3>
              <p className="text-gray-400">
                Your trusted partner for digital growth and business success.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Social Media Marketing</li>
                <li>Web Development</li>
                <li>Graphic Design</li>
                <li>SEO Optimization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/register" className="hover:text-white">Create Account</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/user" className="hover:text-white">Browse Services</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Social Service Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
