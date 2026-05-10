# Installation & Setup Guide

## Quick Start

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

### Basic Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BoldFaceType/Blockly-2-Code.git
   cd Blockly-2-Code
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:5173/`
   - The app should load with the block workspace

### Optional: Enable AI Features

To use the AI code explanation feature, you need a Google Gemini API key:

1. **Get an API key:**
   - Visit https://aistudio.google.com/apikey
   - Sign in with your Google account
   - Create a new API key

2. **Configure environment:**
   - Create a `.env.local` file in the project root
   - Add your key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally at `http://localhost:4173/`

## Troubleshooting

### Blank White Screen

**Symptom:** Page loads but shows only a white screen

**Solutions:**
1. Check browser console for errors (F12 → Console tab)
2. Verify `useMemo` is imported in `App.tsx`
3. Ensure all dependencies are installed: `npm install`
4. Clear browser cache and reload

### Module Not Found Errors

**Symptom:** `Cannot find module 'react'` or similar errors

**Solution:**
```bash
npm install
npm install --save-dev @types/react @types/react-dom
```

### Port Already in Use

**Symptom:** `Port 5173 is already in use`

**Solution:**
1. Kill the existing process
2. Or specify a different port:
   ```bash
   npm run dev -- --port 3000
   ```

### PWA Plugin Errors

**Symptom:** `virtual:pwa-register/react` not found

**Solution:**
The PWA features are temporarily disabled. To enable:
```bash
npm install -D vite-plugin-pwa @vitejs/plugin-react workbox-window
```

Then uncomment PWA-related lines in `App.tsx`.

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR - your changes appear immediately without full page reload.

### TypeScript Checking

Run type checking without building:
```bash
npx tsc --noEmit
```

### Linting

If you have ESLint configured:
```bash
npm run lint
```

## File Structure

```
Blockly-2-Code/
├── components/          # React components
├── services/           # API services (Gemini)
├── utils/              # Helper functions
├── public/             # Static assets (icons, images)
├── App.tsx             # Main app component
├── index.tsx           # React entry point
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Known Issues

1. **PWA Features Disabled:** Progressive Web App features are currently commented out pending proper plugin installation
2. **Icon Warnings:** May see 404 errors for PWA icons - these are harmless with PWA disabled

## Getting Help

- **GitHub Issues:** https://github.com/BoldFaceType/Blockly-2-Code/issues
- **Documentation:** See README.md for feature overview
- **AI Studio:** https://ai.studio/apps/drive/19PHnaK3U573w59PJYodgf-QZ8anlFOXG
