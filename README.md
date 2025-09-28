# 📄➡️📊 PDF to Excel Converter

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A modern, responsive web application that seamlessly converts PDF files to Excel spreadsheets. Built with cutting-edge technologies for optimal performance and user experience.

## ✨ Features

- 🚀 **Fast PDF Processing**: Efficient PDF parsing and content extraction
- 📊 **Excel Generation**: High-quality Excel (.xlsx) file creation  
- 🎨 **Modern UI**: Sleek, responsive design with drag-and-drop functionality
- 🌓 **Theme Support**: Dark/light mode with system preference detection
- 📱 **Mobile Responsive**: Optimized for all device sizes
- ⚡ **Real-time Processing**: Instant feedback and progress indicators
- 🔒 **Client-side Processing**: Secure, no server-side file storage
- ✅ **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static type checking
- **[React 19.1.0](https://reactjs.org/)** - Modern React with latest features

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### File Processing
- **[pdf-parse](https://github.com/modesty/pdf-parse)** - PDF text extraction
- **[xlsx](https://github.com/SheetJS/sheetjs)** - Excel file generation

### Form Management
- **[react-hook-form](https://react-hook-form.com/)** - Performant forms
- **[zod](https://github.com/colinhacks/zod)** - Schema validation

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pdf-to-excel-converter.git
   cd pdf-to-excel-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
pdf-to-excel-converter/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── convert-pdf-to-excel/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   └── utils.ts          # Helper utilities
├── types/                # TypeScript declarations
├── public/               # Static assets
└── next.config.ts        # Next.js configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Optional: Add any API keys or configuration here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Next.js Configuration

The project uses optimized Next.js settings in `next.config.ts`:

- **Turbopack**: Enabled for faster development builds
- **TypeScript**: Build-time type checking
- **ESLint**: Code quality validation
- **Package Optimization**: Improved bundle size

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run type-check` | Run TypeScript compiler check |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts** to link your project and deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/pdf-to-excel-converter)

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   npx netlify-cli deploy --prod --dir=.next
   ```

### Self-Hosted Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

The application will be available on port 3000 by default.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Vercel](https://vercel.com/) for hosting and deployment platform
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

<div align="center">
  <p>Built with ❤️ and ☕</p>
  <p>
    <a href="https://github.com/yourusername/pdf-to-excel-converter/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/pdf-to-excel-converter/issues">Request Feature</a>
  </p>
</div>