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

## 🗄️ Backend Setup

### Azure PostgreSQL Flexible Server

The API uses Azure PostgreSQL Flexible Server for data storage.

**📖 Documentation:**
- [Quick Start Guide](limpopo-api/QUICKSTART.md) - 5-minute setup
- [Complete Setup Guide](limpopo-api/AZURE_SETUP_GUIDE.md) - Detailed instructions
- [API README](limpopo-api/README.md) - API documentation

**Quick setup:**

1. Create Azure PostgreSQL Flexible Server in Azure Portal
2. Configure firewall rules to allow connections
3. Set up locally:
   ```bash
   cd limpopo-api
   npm install
   npm run setup:env
   # Edit .env with your connection string
   npm run test:connection
   ```
4. Initialize database:
   ```bash
   psql $DATABASE_URL -f setup-database.sql
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   └── ui/             # UI components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── Home.tsx        # Homepage
│   ├── BusinessDirectory.tsx
│   ├── Events.tsx
│   ├── Marketplace.tsx
│   ├── Tourism.tsx
│   └── News.tsx
├── App.tsx             # Main app component with routing
├── main.tsx           # App entry point
└── index.css          # Global styles with Tailwind

limpopo-api/
├── GetListings/        # Azure Function for database operations
│   ├── function.json   # Function configuration
│   └── index.js        # Function handler
├── db.js               # PostgreSQL connection pool
├── package.json        # API dependencies
└── README.md           # API setup documentation
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
