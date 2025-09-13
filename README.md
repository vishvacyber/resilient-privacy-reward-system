# Intern Reward Program - Resilient Privacy Inc.

A modern, responsive web application for tracking intern achievements and managing reward points.

## 🚀 Features

- **Real-time Leaderboard** - Dynamic ranking based on points earned
- **Admin Panel** - Secure management interface for points and badges
- **User Management** - Add/remove interns from the system
- **Headshot System** - Personal profile pictures with bulk upload
- **Badge System** - Award achievements and recognition
- **Session Management** - 5-minute auto-logout for security
- **Responsive Design** - Works on all devices
- **Data Persistence** - Saves changes automatically
- **Production Ready** - Optimized for deployment

## 🔧 Setup Instructions

### 1. Clone/Download Files
```bash
# Download all files to your web server directory
```

### 2. Configure Credentials
```bash
# Copy the example config file
cp config.example.js config.js

# Edit config.js with your production credentials
# Change the username and password in adminCredentials
```

### 3. Deploy to Web Server
Upload all files to your web server:
- `index.html`
- `styles.css`
- `script.js`
- `config.js` (keep this secure!)
- `config.example.js`
- `.gitignore`

## 🔒 Security Configuration

### Production Setup
1. **Change Default Credentials** in `config.js`:
   ```javascript
   adminCredentials: {
       username: 'your_secure_username',
       password: 'your_secure_password'
   }
   ```

2. **Keep config.js Secure**:
   - Add `config.js` to `.gitignore`
   - Never commit credentials to version control
   - Use environment variables in production if possible

### Session Security
- **5-minute auto-logout** after inactivity
- **Activity tracking** for session management
- **Secure credential storage** in localStorage

## 📱 Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Colors
Edit `styles.css` to customize the color scheme:
- Primary: `#22c55e` (Green)
- Secondary: `#3b82f6` (Blue)
- Accent: `#a855f7` (Purple)
- Warning: `#f59e0b` (Orange)

### Company Branding
Update in `index.html`:
- Company name in header
- Logo colors in CSS
- Footer information

## 📊 Admin Panel Features

### Point Management
- Add/remove points for any intern
- Validation to prevent negative points
- Real-time leaderboard updates

### Badge Management
- Award achievement badges
- Remove badges when needed
- Visual badge display

### User Management
- Add new interns to the system
- Remove interns (with confirmation)
- Automatic dropdown updates

### Data Management
- Save changes to localStorage
- Export data as JSON
- Import data from JSON files
- Reset all points (with confirmation)

## 🔧 Technical Details

### Architecture
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: Browser localStorage
- **Authentication**: Client-side with session management
- **Responsive**: CSS Grid and Flexbox

### Performance Optimizations
- **Font loading optimization** with `font-display: swap`
- **Deferred script loading** for faster page load
- **Efficient DOM updates** with minimal reflows
- **Optimized animations** with CSS transforms

### File Structure
```
/
├── index.html          # Main application
├── styles.css          # All styling
├── script.js           # Application logic
├── config.js           # Production credentials (secure)
├── config.example.js   # Example configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🚀 Deployment Options

### Static Hosting (Recommended)
- **GitHub Pages** - Free static hosting with custom domains
- **Netlify** - Easy deployment with automatic builds
- **Vercel** - Fast global CDN with edge functions
- **AWS S3** - Scalable static hosting with CloudFront

### Web Server
- **Apache** - Traditional web server with .htaccess
- **Nginx** - High-performance server with reverse proxy
- **IIS** - Windows server with web.config

### Quick Deploy
```bash
# GitHub Pages
1. Create repository on GitHub
2. Upload files (except config.js)
3. Enable Pages in Settings
4. Access via https://username.github.io/repo-name

# Netlify
1. Drag & drop project folder to netlify.com
2. Configure build settings (none needed)
3. Deploy automatically

# Vercel
1. Install: npm i -g vercel
2. Run: vercel
3. Follow prompts
4. Deploy with custom domain
```

**📋 See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide**

## 📈 Monitoring & Analytics

### Built-in Features
- **Session tracking** for admin usage
- **Error handling** with user-friendly messages
- **Activity logging** for security

### Recommended Additions
- **Google Analytics** for usage tracking
- **Error monitoring** (Sentry, LogRocket)
- **Performance monitoring** (Web Vitals)

## 🔄 Updates & Maintenance

### Regular Tasks
1. **Backup data** regularly (export JSON)
2. **Update credentials** periodically
3. **Monitor performance** and user feedback
4. **Test on different devices** and browsers

### Version Control
- Use Git for version control
- Tag releases for easy rollback
- Keep `config.js` out of version control

## 🆘 Troubleshooting

### Common Issues
1. **Login not working** - Check credentials in config.js
2. **Data not saving** - Check localStorage permissions
3. **Styling issues** - Clear browser cache
4. **Mobile display** - Test responsive breakpoints

### Support
For technical support or feature requests, contact the development team.

## 📄 License

© 2025 Resilient Privacy Inc. All rights reserved.

---

**Ready for Production!** 🎉