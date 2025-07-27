# Apna Mandi - Street Food Vendor Marketplace

A role-based web application connecting street food vendors with procurement partners, built with React, Express.js, and PostgreSQL.

## Features

- **Dual Role System**: Separate interfaces for vendors and procurement partners
- **Email/Password Authentication**: Secure user registration and login
- **Vendor Dashboard**: Order placement, tracking, and history
- **Partner Dashboard**: Procurement management, delivery tracking, and earnings
- **Real-time Order Management**: Status updates from placement to delivery
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: bcrypt password hashing
- **Build Tools**: Vite, esbuild
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- npm or yarn

### Local Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd apna-mandi
   npm install
   ```

2. **Database Setup**:
   ```bash
   # Create local PostgreSQL database
   createdb apna_mandi
   
   # Or use a cloud database (Neon, Supabase, etc.)
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Database Migration**:
   ```bash
   npm run db:push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

### Database Configuration

**Local PostgreSQL**:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/apna_mandi
```

**Cloud Database (Neon, Supabase, etc.)**:
```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

## Deployment

### Vercel Deployment

1. **Prepare for deployment**:
   - Ensure `vercel.json` is configured
   - Set up database (Neon recommended for Vercel)
   
2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Environment Variables**:
   Set in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Random secure string

### Manual Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## User Roles

### Vendors
- Register and login via main portal (`/`)
- Place orders for ingredients
- Track order status in real-time
- View order history and reorder items
- Access vendor dashboard (`/vendor`)

### Partners
- Register and login via partner portal (`/partner-login`)  
- View aggregated procurement needs
- Set market prices for products
- Manage deliveries and payments
- Track earnings and analytics
- Access partner dashboard (`/partner`)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products

### Orders (Vendor)
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user orders

### Orders (Partner)
- `GET /api/orders` - Get all orders
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/deliveries` - Mark order as delivered

### Procurement
- `GET /api/procurement-prices` - Get current market prices
- `POST /api/procurement-prices` - Set market prices

## Database Schema

### Core Tables
- **users**: User accounts with role-based access
- **products**: Available ingredients catalog
- **orders**: Order records with status tracking
- **order_items**: Individual items within orders
- **procurement_prices**: Market price tracking
- **deliveries**: Delivery and payment records

## Development

### Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
├── server/               # Express.js backend
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database connection
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema and types
└── vercel.json           # Vercel deployment config
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Update database schema
npm run check        # TypeScript type checking
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.