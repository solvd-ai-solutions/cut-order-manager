# Cut & Order Manager

A modern hardware store management system built with React, TypeScript, and Tailwind CSS. This application helps hardware stores manage cutting jobs, inventory, and customer orders efficiently.

## Features

### 🪚 Create Cut Jobs
- Create new cutting jobs for customers
- Calculate costs including labor, materials, and waste
- Generate order codes and track job status
- Print job tickets and receipts

### 📦 Inventory Management
- Track stock levels for all materials
- Set reorder thresholds and supplier information
- Monitor low stock alerts
- Manage purchase orders

### 👁️ Job Manager
- View all cutting jobs (pending, completed, cancelled)
- Search and filter jobs by various criteria
- Update job status and completion times
- Generate reports and analytics

### 📊 Dashboard
- Real-time overview of store operations
- Key metrics: completed jobs, pending jobs, low stock items, daily revenue
- Recent activity feed
- Quick access to all main functions

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Solv Solutions design system
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives
- **Build Tool**: Vite
- **Development**: Hot reload with React Refresh

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cut-order-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Deployment

#### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/cut-order-manager)

#### Manual Deployment

1. Push to GitHub (see `deploy-to-github.md`)
2. Connect to Vercel and import the repository
3. Deploy with build command: `npm run build-no-ts`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/            # Reusable UI components
│   ├── CutJobForm.tsx # Cut job creation form
│   ├── JobManager.tsx # Job management interface
│   └── InventoryManager.tsx # Inventory management
├── types/             # TypeScript type definitions
├── styles/            # Global styles and CSS
├── services/          # Business logic and data services
├── guidelines/        # Design system guidelines
└── App.tsx           # Main application component
```

## Design System

The application uses a custom design system with the following brand colors:

- **Solv Teal**: `#4FB3A6` - Primary actions and success states
- **Solv Coral**: `#F29E8E` - Secondary actions and warnings
- **Solv Lavender**: `#C5A3E0` - Accent elements and info states
- **Solv Black**: `#000000` - Text and borders
- **Solv White**: `#FFFFFF` - Backgrounds

Typography uses Inter font family with consistent sizing:
- H1: 28px/36px
- H2: 20px/28px  
- Body: 16px/24px
- Small: 14px/20px

## Demo Version

This is a demo version with limited functionality:
- Sample data only (no persistent storage)
- Mock calculations and pricing
- Simulated job processing
- No actual printing or external integrations

## License

This project is proprietary software developed by Solv Solutions.

## Contact

**Solv Solutions**  
Phone: 781-363-6080  
Email: info@solvsolutions.com 