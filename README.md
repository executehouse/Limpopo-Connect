# Limpopo Connect

A modern, user-friendly web application that serves as a digital platform connecting residents, businesses, and visitors in Limpopo Province, South Africa. The platform showcases local services, tourism opportunities, cultural heritage, and community resources while promoting economic development.

![Limpopo Connect Homepage](https://github.com/user-attachments/assets/b321451d-db27-44f8-a0fd-956dffe50e5e)

## 🚀 Features

### Core Features Implemented
- ✅ **User Authentication System** - Registration/login with email and Google OAuth
- ✅ **Business Directory** - Searchable listing of local businesses with categories and filters
- ✅ **Responsive Design** - Mobile-first approach with modern UI
- ✅ **Multi-language Support** - Framework ready for English, Sepedi, Tshivenda, Xitsonga
- ✅ **Modern Tech Stack** - React 19, TypeScript, Tailwind CSS, Firebase

### Coming Soon
- 🔄 **Community Calendar** - Events listing and RSVP functionality
- 🔄 **Marketplace** - Local products and services listings
- 🔄 **Tourism Hub** - Attraction listings and accommodation options
- 🔄 **News & Updates** - Local news feed and community initiatives

## 🛠 Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Forms**: React Hook Form with validation

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account (for production deployment)

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── atoms/          # Basic UI components (Button, Input, etc.)
│   ├── molecules/      # Composite components
│   ├── organisms/      # Complex components (Navigation, Footer)
│   ├── templates/      # Page layouts
│   └── pages/          # Full page components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # Firebase and API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: Green shades representing Limpopo's natural environment
- **Secondary**: Earthy tones and warm colors
- **Neutral**: Modern grays for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Responsive scaling** with mobile-first approach

### Components
- Consistent button variants (primary, secondary, outline, ghost)
- Standardized input fields with validation states
- Card-based layouts with subtle shadows
- Mobile-responsive navigation

## 🌍 Localization

The application is prepared for multi-language support:
- **English** (Primary)
- **Sepedi** (Northern Sotho)
- **Tshivenda** (Venda)
- **Xitsonga** (Tsonga)

Language switching infrastructure is in place and ready for content translation.

## 🚀 Deployment

### Netlify (Current)
The application is configured for Netlify deployment with automatic builds from the main branch.

### Future: Azure Migration
Plans are in place to migrate to Azure for enhanced scalability and enterprise features.

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use atomic design principles for components
- Maintain mobile-first responsive design
- Write meaningful commit messages
- Test your changes thoroughly

## 📊 Performance

- **Lighthouse Score**: Optimized for 90+ performance
- **Code Splitting**: Implemented with React lazy loading
- **Asset Optimization**: Compressed images and optimized fonts
- **Caching Strategy**: Service worker ready for offline functionality

## 🔒 Security

- **Authentication**: Secure Firebase Auth implementation
- **Data Validation**: Input sanitization and validation
- **HTTPS**: SSL/TLS encryption for all communications
- **Privacy**: GDPR-compliant data handling practices

## 📈 Analytics & Monitoring

- **Error Tracking**: Ready for Sentry integration
- **User Analytics**: Google Analytics configured
- **Performance Monitoring**: Real User Monitoring setup

## 📞 Contact & Support

- **Email**: info@limpopoconnect.co.za
- **Phone**: +27 15 123 4567
- **Website**: [limpopoconnect.co.za](https://limpopoconnect.co.za)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Limpopo Provincial Government** for supporting digital transformation
- **Local Business Community** for their valuable feedback
- **Open Source Contributors** who made this project possible
- **Firebase Team** for providing excellent backend services

---

**Limpopo Connect** - Connecting communities across Limpopo Province 🌍💚
