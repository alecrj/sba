import { defineCollection, z } from 'astro:content';

// Properties collection schema
const properties = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['warehouse', 'office', 'industrial', 'flex-space', 'distribution']),
    location: z.string(),
    county: z.enum(['Miami-Dade', 'Broward', 'Palm Beach']),
    price: z.string(),
    size: z.string(),
    available: z.boolean().default(true),
    featured: z.boolean().default(false).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    features: z.array(z.string()).default([]),
    gallery: z.array(z.string()).default([]).optional(),
    contact_name: z.string().optional(),
    contact_email: z.string().optional(),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
    lease_term: z.string().optional(),
    clear_height: z.string().optional(),
    loading_docks: z.number().optional(),
    parking: z.number().optional(),
    year_built: z.number().optional(),
    date: z.date()
  })
});

// Leads collection schema
const leads = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['consultation', 'property-inquiry', 'general-inquiry', 'contact-form']),
    status: z.enum(['new', 'contacted', 'qualified', 'proposal-sent', 'closed-won', 'closed-lost']).default('new'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    company: z.string().optional(),
    property_interest: z.string().optional(),
    space_requirements: z.string().optional(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    message: z.string().optional(),
    source: z.enum(['website', 'referral', 'cold-call', 'email-campaign', 'social-media', 'trade-show', 'other']).default('website'),
    consultation_date: z.date().optional(),
    consultation_time: z.string().optional(),
    follow_up_date: z.date().optional(),
    internal_notes: z.string().optional(),
    date: z.date()
  })
});

// Blog collection schema
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('Shallow Bay Advisors'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]).optional(),
    category: z.enum(['commercial-real-estate', 'warehouse', 'industrial', 'market-insights', 'tips', 'news']).default('commercial-real-estate'),
    featured: z.boolean().default(false),
    date: z.date()
  })
});

export const collections = {
  properties,
  leads,
  blog
};