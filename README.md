# Limpopo Connect

[![Deploy to GitHub Pages](https://github.com/Tshikwetamakole/Limpopo-Connect/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Tshikwetamakole/Limpopo-Connect/actions/workflows/deploy-pages.yml)

A responsive, accessible React+TypeScript web application connecting residents, businesses, and visitors across Limpopo Province, South Africa.

🌐 **Live Site**: [https://limpopoconnect.site](https://limpopoconnect.site)

## 🌍 About

Limpopo Connect is a comprehensive community platform that serves as a digital hub for the Limpopo Province. It enables residents, businesses, and visitors to:


- **Discover Local Businesses**: Searchable directory with maps, reviews, and detailed information
- **Stay Updated**: Community events, festivals, and local news
- **Trade Locally**: Marketplace for local products and services
- **Explore Tourism**: Tourist attractions, accommodations, and experiences
- **Connect**: Build relationships within the community

## ✨ Features

### Core Functionality
- 🔐 **Role-based Authentication**: Separate experiences for residents, business owners, and visitors
- 🏢 **Business Directory**: Comprehensive listings with search, filters, maps, and reviews
- 📅 **Community Calendar**: Local events, workshops, and gatherings
- 🛒 **Local Marketplace**: Buy and sell local products and services
- 🏞️ **Tourism Hub**: Attractions, accommodations, and travel information
- 📰 **News Feed**: Local news and community updates

### Technical Features
- 📱 **Mobile-First Design**: Responsive design optimized for all devices
- ♿ **Accessibility**: WCAG AA compliant for inclusive access
- 🔌 **Offline Support**: PWA functionality for offline access
- 🚀 **Modern Stack**: React 19, TypeScript, Tailwind CSS
- 🔥 **Firebase Integration**: Ready for backend and authentication
- ⚡ **Fast Performance**: Optimized build with Vite

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router
- **Icons**: Lucide React
- **Backend**: Azure Functions + Azure PostgreSQL Flexible Server
- **Backend Ready**: Firebase (Authentication, Firestore, Storage)
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel/Netlify ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tshikwetamakole/Limpopo-Connect.git
   cd Limpopo-Connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   To run the full development environment, including the frontend server and all backend API services, use the following command:
   ```bash
   npm run dev
   ```
   This single command starts the Vite frontend, the authentication API, and the business directory API in parallel.

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Available Scripts

```bash
npm run dev              # Start all services (frontend + all backend APIs)
npm run dev:frontend     # Start only the Vite frontend server
npm run dev:api:auth     # Start only the authentication API
npm run dev:api:businesses # Start only the businesses API
npm run build            # Build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

## 🗄️ Backend Architecture & Setup

The backend is a serverless API built with **Node.js, TypeScript, and Azure Functions**. It connects to an **Azure Database for PostgreSQL Flexible Server** and uses **Azure Blob Storage** for file uploads. The entire infrastructure is defined as code using **Bicep**.

**📖 Key Documentation:**

-   **[Backend Local Setup Guide](./limpopo-api/README-backend.md)**: Step-by-step instructions for running the API on your local machine.
-   **[Database Setup Guide](./limpopo-api/setup-database.md)**: Instructions for provisioning and migrating the Azure PostgreSQL database.
-   **[Operational Runbook](./OPERATIONAL.md)**: A guide for deploying, monitoring, restoring, and maintaining the production environment.
-   **[Security Policy](./SECURITY.md)**: An overview of the threat model, password policies, and key management procedures.
-   **[API Specification (OpenAPI)](./openapi.yaml)**: A complete OpenAPI 3.0 specification for all API endpoints.

## 🏗️ Project Structure

```
src/
├── components/          # Frontend: Reusable UI components
│   ├── layout/
│   └── ui/
├── pages/              # Frontend: Page components
│   ├── Home.tsx
│   └── ...
├── App.tsx             # Frontend: Main app component
└── main.tsx           # Frontend: App entry point

limpopo-api/
├── src/                # Backend: TypeScript source code
│   ├── functions/      # Backend: Individual Azure Function endpoints
│   ├── lib/            # Backend: Shared libraries (auth, db connection)
│   └── models/         # Backend: Database interaction models
├── migrations/         # Backend: SQL database migration scripts
├── seeds/              # Backend: SQL seed data
├── tests/              # Backend: Jest tests
├── package.json        # Backend: API dependencies
└── README-backend.md   # Backend: Local setup guide

infra/
├── main.bicep          # Infrastructure: Main Bicep file
├── db.bicep            # Infrastructure: PostgreSQL module
├── storage.bicep       # Infrastructure: Storage Account module
└── ...                 # etc.

azure-pipelines.yml     # CI/CD pipeline definition
openapi.yaml            # API specification
```

## 🎨 Design System

### Colors
- **Limpopo Green**: `#2D5016` - Primary brand color
- **Limpopo Gold**: `#FFD700` - Accent color
- **Limpopo Blue**: `#1E40AF` - Secondary brand color

### Components
- **Buttons**: `.btn-primary`, `.btn-secondary`
- **Cards**: `.card`
- **Navigation**: `.nav-link`

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the vibrant community of Limpopo Province
- Inspired by the need to connect local businesses and residents
- Designed with accessibility and inclusivity in mind

## 📞 Contact

For questions, suggestions, or support:
- Email: info@limpopoconnect.co.za
- GitHub: [Tshikwetamakole](https://github.com/Tshikwetamakole)

---

**Limpopo Connect** - Connecting Communities, Growing Together 🌍
