<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BlocklyPython AI - Visual Python Editor

A visual block-based Python code editor with AI-powered explanations, built with React, TypeScript, and Vite.

View your app in AI Studio: https://ai.studio/apps/drive/19PHnaK3U573w59PJYodgf-QZ8anlFOXG

## Features

- 🧱 **Visual Block Programming** - Drag-and-drop blocks to build Python code
- 🤖 **AI Code Explanations** - Get instant explanations of your code using Google's Gemini API
- 🎨 **Multiple Themes** - Choose from Light, VS Code Dark, Monokai, and Dracula themes
- ✅ **Real-time Validation** - Automatic variable scope checking and error highlighting
- 💾 **Import/Export** - Save and load your projects as JSON files
- 🔍 **Live Code Preview** - See the generated Python code in real-time
- 📱 **PWA Support** - Install as a Progressive Web App (when enabled)

## Run Locally

**Prerequisites:** Node.js (v18+)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BoldFaceType/Blockly-2-Code.git
   cd Blockly-2-Code
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment (optional for AI features):**
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key: `GEMINI_API_KEY=your_api_key_here`

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173/`

5. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## Recent Fixes (October 2025)

### Fixed Missing `useMemo` Import (Branch: `fix/add-usememo-import`)
- **Issue:** Blank white screen on load due to `ReferenceError: useMemo is not defined`
- **Solution:** Added `useMemo` to React imports in `App.tsx`
- **Additional fixes:**
  - Added Vite entry script tag in `index.html` to properly load the React app
  - Moved Google Fonts `@import` to top of style block per PostCSS requirements
  - Fixed PWA icon file extensions (removed duplicate `.png.png`)

## Project Structure

```
Blockly-2-Code/
├── components/          # React components
│   ├── AiModal.tsx     # AI explanation modal
│   ├── Block.tsx       # Individual block component
│   ├── CodeView.tsx    # Code preview panel
│   ├── Connectors.tsx  # Visual connection lines
│   ├── Controls.tsx    # Top toolbar controls
│   ├── Toolbox.tsx     # Block palette sidebar
│   ├── Workspace.tsx   # Main drag-and-drop workspace
│   └── ZoomControls.tsx # Zoom in/out controls
├── services/           # API integrations
│   └── geminiService.ts # Google Gemini AI integration
├── utils/              # Utility functions
│   └── blockTree.ts    # Block tree manipulation
├── App.tsx             # Main application component
├── constants.ts        # Block definitions and themes
├── types.ts            # TypeScript type definitions
├── index.html          # HTML entry point
├── index.tsx           # React entry point
└── vite.config.ts      # Vite configuration
