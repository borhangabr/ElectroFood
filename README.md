### Admin Credentials
- Email: `admin@food.test`
- Password: `Admin123!`


# ElectroFood 🍕

A full-stack MERN food ordering web application with bilingual support (English & Arabic), Stripe payment integration, real-time order tracking, and an admin dashboard.

## Features

- **🌍 Bilingual UI** — English and Arabic with RTL layout support
- **🛒 Shopping Cart** — Add items, manage quantities, persistent storage
- **💳 Payments** — Stripe Hosted Checkout + Cash on Delivery
- **📱 Order Tracking** — Real-time order status with polling
- **👨‍💼 Admin Dashboard** — Manage categories, products, orders, and users
- **🖼️ Image Upload** — Cloudinary integration for product images
- **🔐 Authentication** — JWT with httpOnly cookies + refresh token rotation
- **🎨 Modern UI** — Responsive design with Tailwind CSS

## Tech Stack

**Backend:**
- Node.js + Express 5
- MongoDB Atlas + Mongoose
- JWT Authentication (httpOnly cookies)
- Stripe API + Webhook
- Cloudinary for image hosting
- Pino logging

**Frontend:**
- React 19 + Vite
- Redux Toolkit + RTK Query
- React Router 7
- Tailwind CSS 3
- react-i18next for localization

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Stripe test keys
- Cloudinary account (optional, for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/borhangabr/ElectroFood.git
   cd ElectroFood
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Setup Frontend** (in another terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Seed Database**
   ```bash
   cd server
   npm run seed
   ```

The app will be available at `http://localhost:5173`



## Project Structure

```
ElectroFood/
├── server/              # Express backend (type-organized)
│   ├── config/          # DB, Stripe, Cloudinary setup
│   ├── controllers/     # Route handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middlewares/     # Auth, validation, error handling
│   ├── utils/           # JWT, logger, errors
│   └── scripts/         # Database seeding
├── client/              # React frontend (feature-organized)
│   ├── src/
│   │   ├── app/         # Redux store, RTK Query
│   │   ├── core/        # Shared components, utils, i18n
│   │   ├── features/    # Feature folders (auth, menu, cart, orders, admin)
│   │   └── routes/      # App routing
│   └── public/          # Static assets
└── README.md            # This file
```

## API Endpoints

- `GET /api/health` — Health check
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/menu/categories` — Get categories
- `GET /api/menu/products` — Get products with filters
- `POST /api/orders` — Create order
- `GET /api/orders/:id` — Get order (with guest token support)
- `POST /api/payment/checkout-session` — Create Stripe session
- `POST /api/admin/products` — Create product (admin only)
- And more...

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=your_32char_secret
JWT_REFRESH_SECRET=your_32char_secret

STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```


## Author

Borhan Hassan — [GitHub](https://github.com/borhangabr)
