import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://limpopoconnect.site', 'https://tshikwetamakole.github.io']
        : 'http://localhost:5000',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'x-client-info',
        'apikey',
        'X-Application-Name',
        'X-Application-Version'
      ],
      credentials: true,
      maxAge: 3600,
      preflightContinue: false,
      optionsSuccessStatus: 204
    }
  }
});