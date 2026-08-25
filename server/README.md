# FeastFlow Backend Server 🚀

This is the Express.js and Node.js backend for the FeastFlow Online Food Ordering System. It provides robust RESTful APIs, real-time WebSocket communication, secure authentication, and AI-powered document validation.

## 💻 Tech Stack
- **Node.js & Express.js:** Core server framework and API routing.
- **MongoDB & Mongoose (v9.x):** NoSQL database and schema modeling.
- **Socket.io:** Real-time bi-directional event-based communication (used for live order tracking).
- **JSON Web Tokens (JWT):** Stateless authentication via secure HTTP-only cookies.
- **Cloudinary & Multer:** Multipart file uploads for restaurant and food imagery.
- **Nodemailer:** Secure email delivery for OTPs and password resets.
- **Google Gemini AI (`@google/genai`):** Used for advanced OCR document verification, dynamic marketing descriptions, and automated credential generation.

---

## 🛠️ Environment Configuration (`.env`)
To run this server locally, create a `.env` file in the root of the `server/` directory and populate it with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/feastflow

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Gemini AI (Required for Vendor Onboarding & Marketing)
GEMINI_API_KEY=your_google_gemini_api_key

# Email/SMTP Configuration (Optional - Demo mode active if missing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 🛡️ Smart Fallbacks (Demo Mode)
To ensure seamless deployment and testing even without complete configuration, the backend implements several resilient fallbacks:
1. **SMTP Bypass:** If `SMTP_HOST` is not provided, the "Send OTP" and "Forgot Password" routes will bypass Nodemailer to prevent `502 Bad Gateway` timeouts. The OTP will automatically default to `123456`, and the password reset URL will be returned directly in the JSON response payload.
2. **Database Fallback:** If `MONGO_URI` is undefined in the environment, `db.js` will fallback to a pre-configured MongoDB Atlas cluster string, ensuring the server always boots successfully.
3. **Gemini Fallback:** If `GEMINI_API_KEY` is missing, the AI endpoints gracefully degrade (e.g., automated credentials generate a random crypto hex instead of a smart username).

---

## 📁 Directory Structure
```text
server/
├── src/
│   ├── config/       # Database connection and third-party configuration (Cloudinary, etc.)
│   ├── controllers/  # Route logic and business rules (auth, order, owner, admin)
│   ├── middlewares/  # Custom middleware (JWT auth, Admin verification, Multer uploads)
│   ├── models/       # Mongoose Schemas (User, Restaurant, Order, Notification)
│   ├── routes/       # Express router definitions
│   ├── services/     # External integrations (Gemini AI Service, Email Service)
│   ├── utils/        # Utility helpers (Token generation, formatting)
│   └── index.js      # Main server entry point & Socket.io initialization
```

---

## 🧠 Core Features & API Modules

### 1. Advanced Authentication (`/api/auth`)
- Implements strict RBAC (Role-Based Access Control) for `customer`, `restaurant_owner`, and `admin`.
- Supports standard Email/Password login, as well as an OTP-based login flow.
- Dedicated `/api/auth/owner-login` portal specifically for restaurants.

### 2. The AI Onboarding Engine (`/api/onboarding`)
- **Document Validation:** When a customer applies to be a vendor, they upload business licenses. `geminiService.js` acts as an automated OCR inspector, verifying 14-digit FSSAI and 15-character GST numbers.
- **Automated Approval:** If the AI confidence score is > 80, the vendor is instantly approved.
- **Smart Credential Generation:** Upon approval, Gemini generates a professional, memorable `ownerUsername` based on the restaurant's name, intentionally bypassing collisions.

### 3. Real-Time Order Pipeline (`/api/orders`)
- Integrated with `Socket.io`.
- When an order transitions states (`Placed` → `Preparing` → `Out for Delivery`), the backend emits real-time events to the specific Order Room, instantly updating the customer's UI without polling.

---

## 🚀 Running the Server Locally
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev` (Uses nodemon for hot-reloading)
4. The server will start on `http://localhost:5000`
