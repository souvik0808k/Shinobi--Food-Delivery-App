# Shinobi - Food Delivery App 🍕

A complete full-stack food delivery application with real-time order tracking, OTP verification, and role-based dashboards for users, restaurant owners, and delivery partners.

## 🚀 Features

### User Features
- 📍 Map-based restaurant discovery with real-time location
- 🛒 Smart cart management with item customization
- 🔍 Restaurant search and filtering
- 📦 Real-time order tracking with 6-stage progress tracker
- 👤 User profile and order history
- 🗺️ Interactive delivery tracking

### Restaurant Owner Features
- 🏪 Shop management and menu updates
- 📋 Real-time order management dashboard
- 🔔 Order status updates (Placed → Confirmed → Preparing → Ready)
- 🔐 OTP generation system for secure order pickup
- 📊 Live order statistics and analytics
- ⏱️ Auto-refresh every 5-10 seconds

### Delivery Partner Features
- 📱 Dedicated delivery boy dashboard
- 🆕 View and accept available orders
- 🔑 OTP verification for order pickup
- ✅ Mark orders as delivered
- 💰 Earnings tracking and statistics
- 🚴 Active delivery management

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Leaflet** for interactive maps
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Icons** for UI icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email notifications
- **Cookie-parser** for session management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Firebase account (for authentication)
- Geoapify API key (for maps)

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/souvik0808k/Shinobi--Food-Delivery-App.git
cd Shinobi--Food-Delivery-App
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend folder:
```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the Frontend folder:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create a new Web Service** on [Render](https://render.com)

2. **Connect your GitHub repository**

3. **Configure the service:**
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

4. **Add Environment Variables** in Render dashboard:
   ```
   PORT=8000
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

5. **Deploy** - Render will automatically build and deploy

### Frontend Deployment (Vercel)

#### Method 1: Deploy from GitHub (Recommended)

1. **Import your repository** on [Vercel](https://vercel.com)

2. **IMPORTANT: Configure Root Directory**
   - In Vercel dashboard, go to **Project Settings**
   - Under **General** → **Root Directory**
   - Set to: `Frontend`
   - Click **Save**

3. **Framework Preset**: Should auto-detect as **Vite**

4. **Build Settings** (auto-configured via vercel.json):
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables**:
   - Go to **Settings** → **Environment Variables**
   - Add:
     ```
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
     ```
   - **Note about the warning**: Vercel will warn that `VITE_` prefixed variables with `KEY` might expose sensitive info. **This is expected and safe**:
     - Firebase API keys are designed to be public (secured by domain restrictions in Firebase Console)
     - Geoapify API keys are designed to be public (secured by domain/referrer restrictions)
     - All VITE_ variables are client-side by design

6. **Deploy** - Click "Deploy" and wait for completion

#### Method 2: Manual CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to Frontend folder
cd Frontend

# Deploy
vercel

# Follow prompts and configure as above
```

### Connecting Frontend to Backend

After deploying both:

1. **Get your Render backend URL** (e.g., `https://your-app.onrender.com`)

2. **Update Frontend API base URL**:
   - In your deployed Vercel project, go to **Settings** → **Environment Variables**
   - Add a new variable:
     ```
     VITE_API_URL=https://your-app.onrender.com
     ```

3. **Update Backend CORS**:
   - In Render, add environment variable:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```

4. **Redeploy both** services to apply changes

### Troubleshooting Vercel 404 Errors

If you see `404: NOT_FOUND` errors on Vercel:

1. ✅ **Check Root Directory is set to `Frontend`** (most common issue)
2. ✅ Verify `vercel.json` exists in Frontend folder
3. ✅ Check build logs for errors
4. ✅ Ensure environment variables are set correctly
5. ✅ Try manual redeployment: **Deployments** → **⋯** → **Redeploy**

## 📱 User Roles

### 1. **Customer (user)**
- Browse restaurants
- Place orders
- Track deliveries in real-time

### 2. **Restaurant Owner (shopOwner)**
- Manage restaurant details
- Update menu items
- Process orders
- Generate OTP for pickup

### 3. **Delivery Partner (deliveryBoy)**
- View available orders
- Accept delivery requests
- Verify pickup with OTP
- Complete deliveries

## 🔐 Authentication Flow

1. User signs up with email and mobile
2. OTP verification sent to email
3. User completes profile with delivery address
4. Role-based dashboard access (User/Owner/Delivery)

## 📦 Order Workflow

```
User Places Order (Placed)
         ↓
Owner Accepts (Confirmed)
         ↓
Owner Prepares (Preparing)
         ↓
Owner Marks Ready + Generates 4-digit OTP (Ready)
         ↓
Delivery Boy Accepts Order
         ↓
Delivery Boy Enters OTP at Restaurant (Picked)
         ↓
Delivery Boy Delivers (Delivered)
```

## 🗺️ Map Integration

- **Leaflet** for interactive maps
- **OpenStreetMap** tiles
- **Geoapify** for geocoding and routing
- Real-time location tracking
- Distance calculation between user and restaurants

## 🔄 Real-time Updates

- Auto-refresh intervals:
  - User Dashboard: 10 seconds
  - Owner Dashboard: 5 seconds (orders), 10 seconds (overview)
  - Delivery Dashboard: 10 seconds
- Manual refresh buttons available on all dashboards

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/verify-otp` - Email OTP verification
- `GET /api/auth/signout` - Logout

### Orders
- `POST /api/order/create` - Create new order
- `GET /api/order/user/my-orders` - Get user orders
- `GET /api/order/shop/orders` - Get shop orders
- `GET /api/order/delivery/my-orders` - Get delivery orders
- `PUT /api/order/:id/status` - Update order status
- `PUT /api/order/:id/assign-delivery` - Assign delivery partner
- `PUT /api/order/:id/verify-pickup` - Verify OTP and mark picked
- `PUT /api/order/:id/mark-delivered` - Mark order delivered

### Shops & Items
- `POST /api/shop/create` - Create restaurant
- `GET /api/shop/all` - Get all restaurants
- `POST /api/item/create` - Add menu item
- `GET /api/item/shop/:shopId` - Get shop items

## 🎨 UI/UX Features

- Gradient color schemes (orange-to-red theme)
- Smooth animations and transitions
- Responsive design for all devices
- Loading states and error handling
- Toast notifications for actions
- Beautiful card-based layouts

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies
- Password hashing with bcrypt
- OTP verification for pickup
- Role-based access control
- CORS configuration

## 🚧 Environment Variables Required

### Backend (.env)
- `PORT` - Server port (default: 8000)
- `MONGODB_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` - Gmail for sending OTP
- `EMAIL_PASS` - Gmail app password

### Frontend (.env)
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_GEOAPIFY_API_KEY` - Geoapify API key for maps

## 📝 Notes

- **Do NOT commit `.env` files** - They contain sensitive credentials
- Use `.env.example` files as templates
- MongoDB Atlas recommended for production
- Gmail app password required (not regular password)
- Geoapify free tier: 3000 requests/day

## 👨‍💻 Developer

**Souvik Chattaraj**
- GitHub: [@souvik0808k](https://github.com/souvik0808k)

## 📄 License

ISC License

---

Made with ❤️ for food lovers everywhere! 🍕🚴‍♂️
