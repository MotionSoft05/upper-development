# Upper Digital Signage

> B2B SaaS platform for managing digital signage across hotels, restaurants, offices, and venues.

## 📖 Documentation

**Full documentation is available in the `/docs` folder.** Start with the [Documentation Index](./docs/DOCUMENTATION-INDEX.md).

### Quick Links

| Document                                                              | Description                 |
| --------------------------------------------------------------------- | --------------------------- |
| [Architecture Overview](./docs/architecture/ARCHITECTURE-OVERVIEW.md) | Tech stack, system diagrams |
| [Dashboard](./docs/dashboard/DASHBOARD-OVERVIEW.md)                   | Admin panel structure       |
| [Sidebar Navigation](./docs/dashboard/SIDEBAR-NAVIGATION.md)          | Sidebar nav & permissions   |
| [Screen Types](./docs/screens/SCREEN-TYPES.md)                        | All 5 screen types          |
| [Template System](./docs/templates/TEMPLATE-SYSTEM.md)                | Template rendering          |
| [Firebase Integration](./docs/technical/FIREBASE-INTEGRATION.md)      | Firestore collections       |
| [Cloud Functions](./docs/technical/CLOUD-FUNCTIONS.md)                | Backend functions           |
| [Flight System](./docs/flights/FLIGHT-SYSTEM.md)                      | Flight API integration      |
| [Secure Deployment](./docs/deployment/SECURE-DEPLOYMENT.md)           | Deployment safety           |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd upper-development

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase config
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Static export to /out folder
npm run export
```

### Firebase Functions

```bash
# Navigate to functions
cd functions
npm install

# Local testing
npm run serve

# Deploy to Firebase
firebase deploy --only functions
```

## 📁 Project Structure

```
upper-development/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Admin dashboard
│   │   ├── pantalla/     # Salon screens (1-300)
│   │   ├── pantallaDirec/# Directory screens
│   │   └── ...
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard panels
│   │   └── templates/    # Screen templates
│   ├── firebase/         # Firebase config
│   ├── lang/             # i18n translations
│   └── utils/            # Utilities
├── functions/            # Firebase Cloud Functions
├── docs/                 # Documentation
└── public/               # Static assets
```

## 🖥️ Screen Types

| Type        | Route                     | Purpose              |
| ----------- | ------------------------- | -------------------- |
| Salon       | `/pantalla/[id]`          | Event displays       |
| Directory   | `/pantallaDirec/[id]`     | Building directories |
| Tarifario   | `/pantallaTarifario/[id]` | Rate boards          |
| Vuelos      | `/pantallaVuelos`         | Flight monitors      |
| Promociones | `/pantallaPromociones`    | Promotional content  |

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **i18n**: react-i18next (ES/EN)
- **APIs**: WeatherAPI, AeroDataBox, Google Maps

## 📋 Key Features

- ✅ 300+ pre-generated static screen routes
- ✅ Real-time content updates via Firebase
- ✅ Multi-tenancy with company scoping
- ✅ Permission-based dashboard access
- ✅ Android TV device management
- ✅ Automatic flight data updates (40 min intervals)
- ✅ Weather integration
- ✅ Advertisement management

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

See the documentation for architecture patterns and code guidelines.

## 📄 License

Private project - Upper Digital Signage
