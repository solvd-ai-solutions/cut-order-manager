/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        'black': '#000000',
        'white': '#FFFFFF',
        'mint': '#4FB3A6',
        'coral': '#F29E8E',
        'lavender': '#C5A3E0',
        // Legacy aliases for transition
        'solv-teal': '#4FB3A6',
        'solv-coral': '#F29E8E',
        'solv-lavender': '#C5A3E0',
        'solv-black': '#000000',
        'solv-white': '#FFFFFF',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'solv': ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        // Design System Typography Scale (14px base)
        'xs': ['12px', { lineHeight: '16px' }],    // Labels, captions
        'sm': ['14px', { lineHeight: '20px' }],    // Body text, descriptions  
        'base': ['16px', { lineHeight: '24px' }],  // Default body text
        'lg': ['18px', { lineHeight: '28px' }],    // Emphasized text
        'xl': ['20px', { lineHeight: '28px' }],    // Subheadings
        '2xl': ['24px', { lineHeight: '32px' }],   // H3 headings
        '3xl': ['28px', { lineHeight: '36px' }],   // H2 headings  
        '4xl': ['32px', { lineHeight: '40px' }],   // H1 headings
        // Legacy aliases
        'solv-h1': ['28px', { lineHeight: '36px' }],
        'solv-h2': ['20px', { lineHeight: '28px' }],
        'solv-body': ['16px', { lineHeight: '24px' }],
        'solv-small': ['14px', { lineHeight: '20px' }],
      },
      fontWeight: {
        'normal': '400',     // Body text
        'medium': '500',     // Emphasized text, labels
        'semibold': '600',   // Subheadings, H2-H3
        'bold': '700',       // H1, important emphasis
      },
      spacing: {
        // 8px Grid System
        '1': '8px',     // Tight spacing
        '2': '16px',    // Default spacing  
        '3': '24px',    // Comfortable spacing
        '4': '32px',    // Section spacing
        '5': '40px',    // Large section spacing
        '6': '48px',    // Hero section spacing
        '8': '64px',    // Major section breaks
        '10': '80px',   // Large section breaks
        '12': '96px',   // Hero padding
        '16': '128px',  // Major layout spacing
        '20': '160px',  // Extra large spacing
        // Legacy aliases
        'solv-container': '24px',
        'solv-component': '16px', 
        'solv-grid': '16px',
      },
      borderRadius: {
        'sm': '4px',    // Small elements, badges
        'DEFAULT': '8px', // Default buttons, inputs, cards
        'lg': '12px',   // Large cards, modals
        'xl': '16px',   // Hero sections, major containers
        'full': '9999px', // Pills, circular buttons
        // Legacy aliases
        'solv': '8px',
      },
      borderWidth: {
        'DEFAULT': '2px',
        '2': '2px',     // Design system signature outline width
        '3': '3px',
        // Legacy aliases
        'solv': '2px',
        'solv-thick': '3px',
      },
      borderColor: {
        'DEFAULT': '#000000',
      },
      outlineWidth: {
        '2': '2px',     // Design system signature outline
      },
      outlineOffset: {
        '0': '0px',     // Design system - no offset
      },
      transitionDuration: {
        'DEFAULT': '200ms', // Design system standard
      },
      transitionTimingFunction: {
        'DEFAULT': 'ease-in-out',
      },
    },
  },
  plugins: [],
} 