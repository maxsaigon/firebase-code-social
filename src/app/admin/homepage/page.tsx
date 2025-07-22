'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Save, Eye, Code, Search, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';

interface HomepageSettings {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
  video: {
    title: string;
    description: string;
    videoUrl: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  tracking: {
    googleAnalytics: string;
    facebookPixel: string;
    googleTagManager: string;
    customCode: string;
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
  }>;
  stats: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
}

export default function HomepageManagementPage() {
  const { getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hero');

  const { data: settings, isLoading } = useQuery<HomepageSettings>({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/homepage-settings', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch homepage settings');
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<HomepageSettings>) => {
      const response = await fetch('/api/admin/homepage-settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update homepage settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-settings'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-content'] });
      toast({
        title: "Success",
        description: "Homepage settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState<HomepageSettings>({
    hero: {
      title: "",
      subtitle: "",
      description: "",
      ctaText: "",
      ctaLink: "",
    },
    video: {
      title: "",
      description: "",
      videoUrl: "",
    },
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
    tracking: {
      googleAnalytics: "",
      facebookPixel: "",
      googleTagManager: "",
      customCode: "",
    },
    features: [],
    testimonials: [],
    stats: []
  });

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleInputChange = (section: keyof HomepageSettings, field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const addFeature = () => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        features: [...(prev.features || []), { icon: "🎯", title: "", description: "" }]
      };
    });
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        features: (prev.features || []).map((feature, i) => 
          i === index ? { ...feature, [field]: value } : feature
        )
      };
    });
  };

  const removeFeature = (index: number) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        features: (prev.features || []).filter((_, i) => i !== index)
      };
    });
  };

  const addTestimonial = () => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        testimonials: [...(prev.testimonials || []), { name: "", role: "", content: "", rating: 5 }]
      };
    });
  };

  const updateTestimonial = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        testimonials: (prev.testimonials || []).map((testimonial, i) => 
          i === index ? { ...testimonial, [field]: value } : testimonial
        )
      };
    });
  };

  const removeTestimonial = (index: number) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        testimonials: (prev.testimonials || []).filter((_, i) => i !== index)
      };
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Failed to load homepage settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Management</h1>
          <p className="text-gray-600 mt-2">Manage your website's homepage content and settings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Main banner content visible at the top of your homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-subtitle">Subtitle/Badge</Label>
                <Input
                  id="hero-subtitle"
                  value={formData?.hero?.subtitle || ''}
                  onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)}
                  placeholder="Social Service Hub"
                />
              </div>
              <div>
                <Label htmlFor="hero-title">Main Title</Label>
                <Input
                  id="hero-title"
                  value={formData?.hero?.title || ''}
                  onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                  placeholder="Your Business Growth Partner"
                />
              </div>
              <div>
                <Label htmlFor="hero-description">Description</Label>
                <Textarea
                  id="hero-description"
                  value={formData?.hero?.description || ''}
                  onChange={(e) => handleInputChange('hero', 'description', e.target.value)}
                  placeholder="Transform your business with our professional services..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hero-cta-text">CTA Button Text</Label>
                  <Input
                    id="hero-cta-text"
                    value={formData?.hero?.ctaText || ''}
                    onChange={(e) => handleInputChange('hero', 'ctaText', e.target.value)}
                    placeholder="Get Started Today"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-cta-link">CTA Button Link</Label>
                  <Input
                    id="hero-cta-link"
                    value={formData?.hero?.ctaLink || ''}
                    onChange={(e) => handleInputChange('hero', 'ctaLink', e.target.value)}
                    placeholder="/auth/register"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Section</CardTitle>
              <CardDescription>Promotional video content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="video-title">Video Section Title</Label>
                <Input
                  id="video-title"
                  value={formData?.video?.title || ''}
                  onChange={(e) => handleInputChange('video', 'title', e.target.value)}
                  placeholder="See How We Transform Businesses"
                />
              </div>
              <div>
                <Label htmlFor="video-description">Video Description</Label>
                <Textarea
                  id="video-description"
                  value={formData?.video?.description || ''}
                  onChange={(e) => handleInputChange('video', 'description', e.target.value)}
                  placeholder="Watch how our clients achieved remarkable growth..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="video-url">YouTube Video URL (embed format)</Label>
                <Input
                  id="video-url"
                  value={formData?.video?.videoUrl || ''}
                  onChange={(e) => handleInputChange('video', 'videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Features Section</CardTitle>
              <CardDescription>Service highlights and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData?.features || []).map((feature, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Feature {index + 1}</h4>
                    <Button variant="outline" size="sm" onClick={() => removeFeature(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Icon (emoji)</Label>
                      <Input
                        value={feature.icon}
                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                        placeholder="🎨"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        placeholder="Creative Design"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        placeholder="Professional designs..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={addFeature} variant="outline">
                Add Feature
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>Customer reviews and testimonials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData?.testimonials || []).map((testimonial, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Testimonial {index + 1}</h4>
                    <Button variant="outline" size="sm" onClick={() => removeTestimonial(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Customer Name</Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        placeholder="Sarah Johnson"
                      />
                    </div>
                    <div>
                      <Label>Role/Company</Label>
                      <Input
                        value={testimonial.role}
                        onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                        placeholder="CEO, TechStart"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Testimonial Content</Label>
                    <Textarea
                      value={testimonial.content}
                      onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                      placeholder="Amazing results! Our social media followers increased..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Rating (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={testimonial.rating}
                      onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addTestimonial} variant="outline">
                Add Testimonial
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>Optimize your homepage for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo-title">Page Title</Label>
                <Input
                  id="seo-title"
                  value={formData?.seo?.title || ''}
                  onChange={(e) => handleInputChange('seo', 'title', e.target.value)}
                  placeholder="Social Service Hub - Your Business Growth Partner"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optimal length: 50-60 characters
                </p>
              </div>
              <div>
                <Label htmlFor="seo-description">Meta Description</Label>
                <Textarea
                  id="seo-description"
                  value={formData?.seo?.description || ''}
                  onChange={(e) => handleInputChange('seo', 'description', e.target.value)}
                  placeholder="Transform your business with our professional services..."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optimal length: 150-160 characters
                </p>
              </div>
              <div>
                <Label htmlFor="seo-keywords">Keywords</Label>
                <Input
                  id="seo-keywords"
                  value={formData?.seo?.keywords || ''}
                  onChange={(e) => handleInputChange('seo', 'keywords', e.target.value)}
                  placeholder="social media marketing, web development, graphic design"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate keywords with commas
                </p>
              </div>
              <div>
                <Label htmlFor="seo-og-image">Open Graph Image URL</Label>
                <Input
                  id="seo-og-image"
                  value={formData?.seo?.ogImage || ''}
                  onChange={(e) => handleInputChange('seo', 'ogImage', e.target.value)}
                  placeholder="/images/og-image.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended size: 1200x630 pixels
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics & Tracking
              </CardTitle>
              <CardDescription>Configure tracking codes for analytics and marketing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ga-code">Google Analytics Measurement ID</Label>
                <Input
                  id="ga-code"
                  value={formData?.tracking?.googleAnalytics || ''}
                  onChange={(e) => handleInputChange('tracking', 'googleAnalytics', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="gtm-code">Google Tag Manager ID</Label>
                <Input
                  id="gtm-code"
                  value={formData?.tracking?.googleTagManager || ''}
                  onChange={(e) => handleInputChange('tracking', 'googleTagManager', e.target.value)}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
                <Input
                  id="fb-pixel"
                  value={formData?.tracking?.facebookPixel || ''}
                  onChange={(e) => handleInputChange('tracking', 'facebookPixel', e.target.value)}
                  placeholder="1234567890123456"
                />
              </div>
              <div>
                <Label htmlFor="custom-code">Custom Tracking Code</Label>
                <Textarea
                  id="custom-code"
                  value={formData?.tracking?.customCode || ''}
                  onChange={(e) => handleInputChange('tracking', 'customCode', e.target.value)}
                  placeholder="<!-- Custom tracking scripts -->"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  This code will be injected into the head section
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Advanced configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-500">Advanced settings coming soon...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Custom CSS, JavaScript injection, and more advanced features will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
