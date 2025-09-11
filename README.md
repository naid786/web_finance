# Web Finance

 
A modern web application for financial document processing and management. This project is built using Next.js and TypeScript, with a focus on converting PDF files to Excel and providing a user-friendly interface for finance-related workflows.


## Features

- Convert PDF documents to Excel format
- Clean and intuitive UI components
- Modular code structure for easy maintenance
- Example test data included


## Project Structure

- `actions/`: Server-side actions (e.g., PDF to Excel conversion)
- `app/`: Next.js app directory (pages, layout, global styles)
- `components/`: Reusable UI components
- `lib/`: Utility functions
- `public/`: Static assets (SVGs, icons)
- `test/data/`: Sample PDF and text files for testing


## Getting Started


### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)


### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd web_finance
   ```

2. Install dependencies:

   ```bash
   npm install
   ```


### Running Locally

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.


### Building for Production

To build the app for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```


## Deployment


You can deploy this Next.js app to any platform that supports Node.js, such as Vercel, Netlify, or your own server.


### Deploying to Vercel

1. [Sign up for Vercel](https://vercel.com/signup) and install the Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Run the deploy command:

   ```bash
   vercel
   ```

3. Follow the prompts to link your project and deploy.


### Deploying to Other Platforms

- Build the app using `npm run build`.
- Serve the `.next` directory using Node.js or a compatible server.


## Contributing

Pull requests and issues are welcome! Please follow conventional commit messages and ensure code passes linting and tests.


## License

MIT
