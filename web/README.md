# Lucent Skincare PWA

<img src="/web/public/lucent-logo.svg" alt="Lucent" width="200" height="200">

## Project Overview

Building a progressive web application that allows users to track skincare products, usage patterns, and effectiveness. This app is being developed for my gf

## Core Goals

1. a log of what I tried
2. a log of what I wanna try
3. review on products on how they made me feel/look
4. how long ive used it
5. a journal for skin care steps to know which order
6. progress section to keep track of progress with photos and notes

## Technical details

1. **Product Tracking**
   - Log skincare brands and products used
   - Record when products were used (calendar integration)
   - Rate how effective each product was

2. **Photo Progress Tracking**
   - Take consistent photos to track skin changes over time
   - Add notes to photos to document observations
   - Compare photos side-by-side to visualize progress

3. **Skincare Journal**
   - Document daily observations about your skin
   - Track reactions to products and environmental factors
   - Create a comprehensive record of your skincare journey

4. **AI Skincare Assistant**
   - Get personalized advice about your skincare routine
   - Analyze product ingredients and learn about their benefits
   - Receive tailored recommendations based on your skin type and concerns

5. **Marketplace Integration**
   - Shop for recommended skincare products based on your profile
   - Discover new products matched to your specific skin concerns
   - Filter and save products to a wishlist for future reference

6. **Implementation**
   - Develop as a PWA for offline capabilities and mobile installation
   - Use Vite + React for frontend development
   - Implement shadcn/ui for UI components
   - Ensure mobile-friendly design

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install --legacy-peer-deps`
3. Run development server with `npm run dev`

## Contribution Guidelines

If you're helping with this project, please focus on:

- Mobile-first design approach
- Simple, intuitive user interface
- Local storage implementation for product data
- Calendar component for tracking usage dates
- Adding dexie for offline use
- Photo storage and comparison features

## Next Steps

- [X] Set up basic project structure with Vite and React
- [X] Add shadcn/ui components
- [X] Implement product entry form
- [X] Create calendar view for tracking usage
- [X] Add PWA capabilities
- [ ] Set up local storage/IndexedDB
- [X] Implement photo upload and comparison features
- [X] Add AI skincare assistant
- [X] Implement marketplace integration for product recommendations
- Use upload thing for image uploads <https://docs.uploadthing.com/>

## Notes

This is a personal project being developed for my girlfriend to track her skincare routine, turns out it can be much more than that.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
