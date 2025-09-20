/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_TITLE: string;
  readonly PUBLIC_SITE_DESCRIPTION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Enhanced GSAP Types - Fix for TypeScript errors
declare global {
  interface Window {
    gsap: typeof import('gsap').gsap;
    ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
    // ScrollToPlugin: typeof import('gsap/ScrollToPlugin').ScrollToPlugin; // Temporarily removed
    tailwind?: {
      config: (config: any) => void;
    };
  }
  
  const gsap: typeof import('gsap').gsap;
  const ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  // const ScrollToPlugin: typeof import('gsap/ScrollToPlugin').ScrollToPlugin; // Temporarily removed
  
  // Fix for Tailwind variable
  const tailwind: {
    config: (config: any) => void;
  } | undefined;
}

// Fix for GSAP Utils typing
declare module 'gsap' {
  namespace gsap {
    interface Utils {
      toArray<T = Element>(target: string | NodeList | Element[] | Element): T[];
    }
  }
}

// Enhanced DOM element types for null safety
interface TypedElement extends Element {
  style: CSSStyleDeclaration;
  href?: string;
  [key: string]: any;
}

interface TypedHTMLElement extends HTMLElement {
  style: CSSStyleDeclaration;
  [key: string]: any;
}

interface TypedAnchorElement extends HTMLAnchorElement {
  href: string;
  style: CSSStyleDeclaration;
}

// Fix for GSAP forEach callbacks
interface GSAPTarget extends Element {
  [key: string]: any;
}

// Enhanced event handler types
interface TypedEventListener<T extends Element> {
  (this: T, e: Event): void;
}

interface TypedMouseEventListener<T extends Element> {
  (this: T, e: MouseEvent): void;
}

interface TypedKeyboardEventListener<T extends Element> {
  (this: T, e: KeyboardEvent): void;
}

// Netlify Identity Widget
interface NetlifyIdentity {
  on(event: 'init', callback: (user: any) => void): void;
  on(event: 'login', callback: () => void): void;
  on(event: 'logout', callback: () => void): void;
  on(event: 'error', callback: (err: Error) => void): void;
  on(event: 'open', callback: () => void): void;
  on(event: 'close', callback: () => void): void;
  open(): void;
  close(): void;
  currentUser(): any;
  logout(): void;
}

declare global {
  interface Window {
    netlifyIdentity: NetlifyIdentity;
  }
}

// Enhanced Warehouse listing type
export interface Warehouse {
  id: string;
  title: string;
  slug: string;
  price: string;
  size: number;
  location: string;
  address: string;
  features: string[];
  images: string[];
  description: string;
  availability: 'available' | 'leased' | 'pending';
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities?: string[];
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

// Enhanced Lead type for CRM
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  propertyInterested?: string;
  message: string;
  source: string;
  createdAt: string;
  updatedAt?: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  notes?: string[];
  followUpDate?: string;
  assignedTo?: string;
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company?: string;
  propertyType: string;
  message: string;
  source: string;
}

export interface SearchFilters {
  minSize?: number;
  maxSize?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  features?: string[];
  availability?: 'available' | 'leased' | 'pending';
}

// Animation types
export interface AnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number;
}

export interface ScrollTriggerConfig {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  toggleActions?: string;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

// Enhanced collection types for Astro
export interface WarehouseCollection {
  data: Warehouse;
  id: string;
  collection: string;
}

export interface LeadCollection {
  data: Lead;
  id: string;
  collection: string;
}

// Utility types for type safety
export type NonNull<T> = T extends null ? never : T;
export type NonUndefined<T> = T extends undefined ? never : T;
export type ElementOrNull<T = Element> = T | null;
export type EventHandler<T extends Element = Element> = (event: Event) => void;

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface MobileMenuState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

// Enhanced DOM query helpers with type safety
declare global {
  interface Document {
    getElementByIdTyped<T extends HTMLElement = HTMLElement>(id: string): T | null;
    querySelectorTyped<T extends Element = Element>(selector: string): T | null;
    querySelectorAllTyped<T extends Element = Element>(selector: string): NodeListOf<T>;
  }
}

// Implement the typed query helpers
if (typeof document !== 'undefined') {
  Document.prototype.getElementByIdTyped = function<T extends HTMLElement>(id: string): T | null {
    return this.getElementById(id) as T | null;
  };

  Document.prototype.querySelectorTyped = function<T extends Element>(selector: string): T | null {
    return this.querySelector(selector) as T | null;
  };

  Document.prototype.querySelectorAllTyped = function<T extends Element>(selector: string): NodeListOf<T> {
    return this.querySelectorAll(selector) as NodeListOf<T>;
  };
}

// Enhanced error handling types
export interface ErrorWithMessage {
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// GSAP Timeline types for better TypeScript support
export interface GSAPTimelineConfig {
  delay?: number;
  duration?: number;
  ease?: string;
  paused?: boolean;
  repeat?: number;
  repeatDelay?: number;
  yoyo?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
  onUpdate?: () => void;
  onRepeat?: () => void;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: any;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  image?: string;
  featured?: boolean;
  hover?: boolean;
}