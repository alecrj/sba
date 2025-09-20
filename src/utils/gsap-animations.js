/**
 * GSAP Animations Utility
 * Modern scroll animations inspired by Terminal Industries and other premium sites
 * Includes reveal animations, parallax effects, magnetic interactions, and more
 */

class GSAPAnimations {
  constructor() {
    this.isInitialized = false;
    this.scrollTriggers = [];
    this.init();
  }

  /**
   * Initialize GSAP and register plugins
   */
  init() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded, retrying...');
      setTimeout(() => this.init(), 100);
      return;
    }

    // Register plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // Set global defaults
    gsap.defaults({ 
      duration: 0.8, 
      ease: "power2.out" 
    });

    // Initialize all animations
    this.initHeroAnimations();
    this.initRevealAnimations();
    this.initParallaxEffects();
    this.initStaggerAnimations();
    this.initMagneticButtons();
    this.initCounterAnimations();
    this.initTextRevealAnimations();
    this.initImageRevealAnimations();
    this.initScrollIndicators();
    this.initNavigationAnimations();
    this.initHoverEffects();
    this.initScrollProgress();

    this.isInitialized = true;
    console.log('✅ GSAP Animations initialized');
  }

  /**
   * Hero section entrance animations
   */
  initHeroAnimations() {
    const heroElements = gsap.utils.toArray('.gsap-fade-in');
    if (heroElements.length === 0) return;

    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.fromTo(heroElements, 
      { 
        opacity: 0, 
        y: 60,
        scale: 0.95
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out"
      }
    );

    // Add floating animation to hero elements
    heroElements.forEach((element, index) => {
      gsap.to(element, {
        y: -10,
        duration: 2 + (index * 0.1),
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: index * 0.2
      });
    });
  }

  /**
   * Reveal animations on scroll
   */
  initRevealAnimations() {
    // Fade in from bottom
    gsap.utils.toArray('.gsap-reveal').forEach(element => {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          y: 50 
        },
        { 
          opacity: 1, 
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse",
            onEnter: () => element.classList.add('revealed')
          }
        }
      );
    });

    // Fade in from left
    gsap.utils.toArray('.gsap-fade-in-left').forEach(element => {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          x: -80,
          rotation: -5
        },
        { 
          opacity: 1, 
          x: 0,
          rotation: 0,
          duration: 1,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Fade in from right
    gsap.utils.toArray('.gsap-fade-in-right').forEach(element => {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          x: 80,
          rotation: 5
        },
        { 
          opacity: 1, 
          x: 0,
          rotation: 0,
          duration: 1,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Scale in animations
    gsap.utils.toArray('.gsap-scale-in').forEach(element => {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          scale: 0.7,
          rotation: 10
        },
        { 
          opacity: 1, 
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }

  /**
   * Parallax effects for background elements
   */
  initParallaxEffects() {
    // Slow parallax for background elements
    gsap.utils.toArray('.parallax-slow').forEach(element => {
      gsap.fromTo(element, 
        { y: 0 },
        {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        }
      );
    });

    // Fast parallax for foreground elements
    gsap.utils.toArray('.parallax-fast').forEach(element => {
      gsap.fromTo(element, 
        { y: 0 },
        {
          y: 100,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom", 
            end: "bottom top",
            scrub: 0.5
          }
        }
      );
    });

    // Rotation parallax
    gsap.utils.toArray('.parallax-rotate').forEach(element => {
      gsap.fromTo(element, 
        { rotation: 0 },
        {
          rotation: 360,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top", 
            scrub: 1
          }
        }
      );
    });
  }

  /**
   * Stagger animations for grids and lists
   */
  initStaggerAnimations() {
    gsap.utils.toArray('.gsap-stagger').forEach(container => {
      const items = container.children || [container];
      
      gsap.fromTo(items, 
        { 
          opacity: 0, 
          y: 40,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: {
            amount: 0.4,
            from: "start"
          },
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Diagonal stagger effect
    gsap.utils.toArray('.gsap-stagger-diagonal').forEach(container => {
      const items = container.children || [container];
      
      gsap.fromTo(items, 
        { 
          opacity: 0, 
          x: -30,
          y: 30
        },
        { 
          opacity: 1, 
          x: 0,
          y: 0,
          duration: 0.8,
          stagger: {
            amount: 0.6,
            grid: "auto",
            from: "random"
          },
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }

  /**
   * Magnetic button effects
   */
  initMagneticButtons() {
    gsap.utils.toArray('.magnetic').forEach(element => {
      const button = element;
      const buttonRect = button.getBoundingClientRect();
      const buttonCenter = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2
      };

      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "elastic.out(1, 0.3)"
        });
      });

      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(button, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });
  }

  /**
   * Counter animations
   */
  initCounterAnimations() {
    gsap.utils.toArray('.counter').forEach(element => {
      const target = parseInt(element.getAttribute('data-target') || '0');
      const duration = parseFloat(element.getAttribute('data-duration') || '2');
      
      gsap.fromTo(element, 
        { textContent: 0 },
        {
          textContent: target,
          duration: duration,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          onUpdate: function() {
            element.textContent = Math.ceil(this.targets()[0].textContent);
          }
        }
      );
    });
  }

  /**
   * Text reveal animations
   */
  initTextRevealAnimations() {
    gsap.utils.toArray('.text-reveal').forEach(element => {
      // Split text into spans for character animation
      const text = element.textContent;
      element.innerHTML = '';
      
      [...text].forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        element.appendChild(span);
      });

      const chars = element.querySelectorAll('span');
      
      gsap.fromTo(chars, 
        { 
          opacity: 0,
          y: 100,
          rotation: 10
        },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.05,
          stagger: 0.02,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Line reveal animation
    gsap.utils.toArray('.line-reveal').forEach(element => {
      gsap.fromTo(element, 
        { 
          clipPath: "inset(0 100% 0 0)" 
        },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.5,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }

  /**
   * Image reveal animations
   */
  initImageRevealAnimations() {
    gsap.utils.toArray('.image-reveal').forEach(element => {
      const img = element.querySelector('img');
      if (!img) return;

      // Create overlay for reveal effect
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #2563eb, #06b6d4);
        z-index: 1;
      `;
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(overlay);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });

      tl.fromTo(img, 
        { scale: 1.2 },
        { scale: 1, duration: 1.5, ease: "power2.out" }
      )
      .fromTo(overlay, 
        { x: '0%' },
        { x: '100%', duration: 1.2, ease: "power2.inOut" }, 
        0.2
      );
    });
  }

  /**
   * Scroll indicators
   */
  initScrollIndicators() {
    gsap.utils.toArray('.scroll-indicator').forEach(element => {
      gsap.to(element, {
        y: 10,
        duration: 1.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    });
  }

  /**
   * Navigation animations
   */
  initNavigationAnimations() {
    const nav = document.querySelector('.premium-nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: "top -80",
      end: 99999,
      toggleClass: { targets: nav, className: "scrolled" }
    });

    // Logo animation on scroll
    const logo = nav.querySelector('.nav-logo');
    if (logo) {
      ScrollTrigger.create({
        start: "top -80",
        end: 99999,
        onToggle: self => {
          gsap.to(logo, {
            scale: self.isActive ? 0.9 : 1,
            duration: 0.3
          });
        }
      });
    }
  }

  /**
   * Hover effects for interactive elements
   */
  initHoverEffects() {
    // Card hover effects
    gsap.utils.toArray('.hover-lift').forEach(element => {
      element.addEventListener('mouseenter', () => {
        gsap.to(element, {
          y: -10,
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          duration: 0.3,
          ease: "power2.out"
        });
      });

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          y: 0,
          scale: 1,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    // Glow effects
    gsap.utils.toArray('.hover-glow').forEach(element => {
      element.addEventListener('mouseenter', () => {
        gsap.to(element, {
          boxShadow: "0 0 30px rgba(37, 99, 235, 0.4)",
          duration: 0.3
        });
      });

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          boxShadow: "0 0 0px rgba(37, 99, 235, 0)",
          duration: 0.3
        });
      });
    });
  }

  /**
   * Scroll progress indicator
   */
  initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #2563eb, #06b6d4);
      z-index: 1000;
      transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: self => {
        gsap.to(progressBar, {
          width: `${self.progress * 100}%`,
          duration: 0.1
        });
      }
    });
  }

  /**
   * Refresh all scroll triggers
   */
  refresh() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Kill all animations and scroll triggers
   */
  destroy() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
    gsap.killTweensOf("*");
    this.isInitialized = false;
  }

  /**
   * Add custom animation
   */
  addCustomAnimation(selector, fromVars, toVars, scrollTriggerConfig = {}) {
    const elements = gsap.utils.toArray(selector);
    if (elements.length === 0) return;

    elements.forEach(element => {
      gsap.fromTo(element, fromVars, {
        ...toVars,
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...scrollTriggerConfig
        }
      });
    });
  }
}

// Initialize animations when DOM is ready
let animations;

function initAnimations() {
  if (typeof gsap === 'undefined') {
    setTimeout(initAnimations, 100);
    return;
  }
  
  animations = new GSAPAnimations();
  
  // Make animations globally available
  window.GSAPAnimations = animations;
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// Re-initialize on page navigation
window.addEventListener('load', () => {
  setTimeout(() => {
    if (animations) {
      animations.refresh();
    }
  }, 100);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GSAPAnimations;
}