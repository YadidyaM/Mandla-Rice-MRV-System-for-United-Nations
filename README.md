# 🌾 Mandla Rice MRV System

A blockchain-verified carbon credit platform empowering tribal farmers in Mandla through sustainable rice farming practices. Built for the UN Climate Challenge 2024.

## ✨ Features

- **Blockchain Verification**: Transparent carbon credit verification
- **AI-Powered MRV**: Automated measurement, reporting, and verification
- **Direct Income**: Farmers earn from sustainable practices
- **Global Impact**: Contributing to climate goals
- **Interactive Dashboard**: Real-time analytics and farm management
- **Carbon Marketplace**: Buy, sell, and trade carbon credits

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mandla-rice-mrv

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Option 1: Deploy to Heroku

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Steps

1. **Login to Heroku**
```bash
   heroku login
   ```

2. **Create Heroku App**
```bash
   heroku create your-app-name
   ```

3. **Set Buildpacks**
```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Deploy**
```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Open App**
```bash
   heroku open
   ```

#### Heroku Configuration
- **Build Command**: `npm run build`
- **Start Command**: `node server.js`
- **Port**: Automatically set by Heroku

### Option 2: Deploy to Netlify

#### Prerequisites
- Netlify account
- Git repository

#### Steps

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub/GitLab/Bitbucket repository

2. **Build Settings**
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: 18

3. **Environment Variables** (if needed)
   - Add any required environment variables in Netlify dashboard

4. **Deploy**
   - Netlify will automatically build and deploy on every push to main branch

#### Netlify Configuration
- **Build Command**: `cd frontend && npm run build`
- **Publish Directory**: `frontend/dist`
- **Node Version**: 18
- **Auto-deploy**: Enabled for main branch

## 📁 Project Structure

```
mandla-rice-mrv/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── providers/      # Context providers
│   │   ├── utils/          # Utility functions
│   │   └── main.tsx        # Application entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── server.js               # Express server for Heroku
├── package.json            # Root package.json
├── Procfile               # Heroku deployment
├── netlify.toml           # Netlify configuration
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=your_api_url_here
VITE_APP_NAME=Mandla Rice MRV
```

### Build Configuration

The project uses Vite for building. Configuration is in `frontend/vite.config.ts`.

## 📱 Features

### Interactive Landing Page
- Animated statistics counters
- Interactive feature cards
- Testimonials carousel
- Responsive design

### Dashboard
- Farm management
- MRV system
- Carbon credits
- Marketplace
- User profiles

### Wallet Integration
- Phantom wallet support
- MetaMask integration
- Custom wallet options

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Deployment**: Heroku, Netlify
- **State Management**: React Hooks
- **Routing**: React Router v6

## 🚀 Performance

- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Automatic bundle optimization
- **Image Optimization**: Responsive images with fallbacks
- **CSS Optimization**: Purged Tailwind CSS
- **Bundle Analysis**: Built-in Vite analysis

## 🔒 Security

- **HTTPS**: Automatic SSL on deployment platforms
- **Security Headers**: XSS protection, content type validation
- **Environment Variables**: Secure configuration management
- **Input Validation**: Form validation and sanitization

## 📊 Monitoring

### Heroku
- Built-in logging and monitoring
- Performance metrics
- Error tracking

### Netlify
- Build logs and status
- Performance analytics
- Form submissions

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Verify all dependencies are installed

2. **Deployment Issues**
   - Check build logs
   - Verify environment variables
   - Ensure proper build commands

3. **Runtime Errors**
   - Check browser console
   - Verify API endpoints
   - Check environment configuration

### Support

For issues and questions:
- Check the logs in your deployment platform
- Review the build output
- Verify configuration files

## 📈 Future Enhancements

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline capabilities
- [ ] Advanced blockchain features
- [ ] AI-powered insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- UN Climate Challenge 2024
- UNDP India
- Bill & Melinda Gates Foundation
- IIT Delhi
- Government of Madhya Pradesh

---

**Built with ❤️ for sustainable farming and climate action**
