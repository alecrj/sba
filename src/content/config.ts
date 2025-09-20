import { defineCollection, z } from 'astro:content';

const warehousesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    price: z.string(),
    size: z.number(),
    location: z.string(),
    address: z.string(),
    county: z.enum(['Miami-Dade', 'Palm Beach', 'Broward']).optional(), // Added as optional
    features: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    description: z.string(),
    availability: z.enum(['available', 'leased', 'pending']).default('available'),
    featured: z.boolean().default(false),
    createdAt: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

const leadsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    company: z.string().optional(),
    propertyInterested: z.string().optional(),
    message: z.string(),
    source: z.string().default('website'),
    createdAt: z.string(),
    status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiating', 'closed-won', 'closed-lost']).default('new'),
    notes: z.string().optional(),
  }),
});

export const collections = {
  'warehouses': warehousesCollection,
  'leads': leadsCollection,
};