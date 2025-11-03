# Limpopo Connect

A full-stack social networking platform for the Limpopo Province community in South Africa.

![GitHub Pages Deploy](https://github.com/executehouse/Limpopo-Connect/actions/workflows/deploy.yml/badge.svg)

## Features

- 🌐 Real-time chat rooms and messaging
- 👥 User profiles and connections
- 📊 Business directory
- 📅 Events management
- 🏪 Community marketplace
- 🌍 Tourism information
- 📱 PWA support for offline access

## Tech Stack

- **Frontend:**
  - React 19 with TypeScript
  - Vite 7 for blazing-fast builds
  - Tailwind CSS for styling
  - React Router v7 for navigation
  - PWA for offline support

- **Backend:**
  - Supabase for:
    - PostgreSQL database
    - Authentication
    - Storage
    - Realtime subscriptions
    - Edge Functions

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/executehouse/Limpopo-Connect.git
   cd Limpopo-Connect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials to `.env`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5000 in your browser

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch.

To deploy manually:

```bash
npm run deploy:gh-pages
```

Visit the live site at: https://tshikwetamakole.github.io/Limpopo-Connect/

## Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Guide](./SECURITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Test Plan](./TESTING_DOCUMENTATION_INDEX.md)

## Security

- Row Level Security (RLS) policies for data protection
- JWT-based authentication
- Password strength validation
- CORS protection
- Security headers
- Audit logging
- Rate limiting

## Testing

Run the test suite:

```bash
npm run test        # Unit tests
npm run test:api    # API integration tests
npm run test:e2e    # End-to-end tests
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

- [Report Issues](https://github.com/Tshikwetamakole/Limpopo-Connect/issues)
- [Request Features](https://github.com/Tshikwetamakole/Limpopo-Connect/issues)
- Email: support@limpopoconnect.site

## Acknowledgments

- Limpopo Province community
- All contributors
- Supabase team
- React team
