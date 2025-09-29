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

### PDF Processing & Excel Generation

- **[pdf-parse](https://github.com/modesty/pdf-parse)** - PDF text extraction
- **[xlsx](https://github.com/SheetJS/sheetjs)** - Excel file generation

### Form Management

- **[react-hook-form](https://react-hook-form.com/)** - Performant forms
- **[zod](https://zod.dev/)** - Schema validation

### Styling & UI

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm**, **yarn**, or **pnpm** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/naid786/web_finance.git
   cd web_finance
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```text
web_finance/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── convert-pdf-to-excel/ # PDF to Excel conversion API
│   │   └── convert-pdf-to-text/  # PDF to text extraction API
│   ├── text-converter/           # Text extraction demo page
│   ├── text-converter-demo/      # Text converter demo
│   ├── favicon.ico
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Home page component
├── components/
│   ├── ui/                       # Reusable UI components (shadcn/ui)
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   └── switch.tsx
│   ├── theme-provider.tsx        # Theme context provider
│   └── theme-toggle.tsx          # Dark/light mode toggle
├── lib/
│   ├── pdfText.ts               # PDF text extraction utilities
│   ├── transactionUtils.ts     # Transaction parsing and Excel generation
│   └── utils.ts                 # General utility functions
├── types/
│   └── pdf-parse.d.ts           # Type definitions for pdf-parse
├── components.json               # shadcn/ui configuration
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
└── vercel.json                 # Vercel deployment configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
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

## 🔧 API Documentation

### Convert PDF to Excel

**Endpoint:** `POST /api/convert-pdf-to-excel`

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'pdf' file

**Response:**

- Success: Excel file download
- Error: JSON with error message

**Example:**

```javascript
const formData = new FormData();
formData.append('pdf', pdfFile);

const response = await fetch('/api/convert-pdf-to-excel', {
  method: 'POST',
  body: formData,
});

if (response.ok) {
  const blob = await response.blob();
  // Handle file download
}
```

### Convert PDF to Text

**Endpoint:** `POST /api/convert-pdf-to-text`

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'pdf' file

**Response:**

- Success: JSON with extracted text
- Error: JSON with error message

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy with Vercel**

   ```bash
   npm i -g vercel
   vercel
   ```

3. **Follow the prompts** and your app will be deployed!

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use the `npm run build` command
- **Railway**: Connect your GitHub repository
- **DigitalOcean App Platform**: Use the app spec configuration

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

Built with ❤️ and ☕

[Report Bug](https://github.com/naid786/web_finance/issues) · [Request Feature](https://github.com/naid786/web_finance/issues)