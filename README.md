# FeastFlow - Comprehensive Online Food Ordering System 🍔🚀

FeastFlow is a robust, full-stack online food ordering and delivery platform built using the MERN stack (MongoDB, Express, React, Node.js). It is designed to simulate a real-world multi-vendor food delivery ecosystem (like UberEats or DoorDash), connecting hungry customers with restaurant owners, all overseen by a powerful administrative dashboard.

---

## 📖 How FeastFlow Works (Deep Dive)

FeastFlow is divided into three distinct user experiences: **Customers**, **Restaurant Owners**, and **Administrators**. Here is a detailed walkthrough of how every single feature operates within the ecosystem.

### 🧑‍💼 1. The Customer Journey
* **Authentication & Profile:** Users can register and log in securely. If a user forgets their password, they can use the **Forgot Password** feature, which sends a secure OTP (One-Time Password) to their email (via Nodemailer) for verification before allowing a password reset. Users can also update their profile details and avatars at any time.
* **Browsing & Searching:** The Menu page is the heart of the customer experience. Customers can:
  * Filter dishes by category (e.g., Veg, Non-Veg, Spicy).
  * Use the dynamic search bar to **Search by Dish** (e.g., "Pizza") or **Search by Restaurant** (e.g., "Dominos").
* **Smart Cart & Customization:** When clicking on a dish, a beautifully designed modal appears. Customers can customize their order by selecting sizes (which dynamically updates the price) and toggling add-ons (like "Extra Cheese"). These items are added to a persistent Smart Cart stored in local storage.
* **Checkout & Tracking:** Customers proceed to checkout to finalize their order. Once an order is placed, they can track its status in real-time.

### 🤝 2. The "Become a Partner" Workflow (Vendor Onboarding)
FeastFlow allows everyday customers to become restaurant owners through a seamless onboarding pipeline:
1. **The Application:** A logged-in customer fills out the "Become a Partner" form, providing their restaurant name, business address, and setting up a unique **Owner Username** and **Owner Password**.
2. **Admin Approval:** The application is routed to the Admin Dashboard under "Pending Approvals". The Admin reviews the details and clicks "Approve".
3. **Identity Separation (Crucial Feature):** Once approved, the system creates the restaurant. *Crucially, the user's original customer login (Email + Password) remains completely untouched.* They can still log in with their email to buy food as a customer. However, to manage their business, they must navigate to the dedicated **Owner Login** portal and log in using their new, distinct Owner Username and Password.

### 🏪 3. The Restaurant Owner Journey
Once an approved partner logs into the dedicated Owner Portal, they gain access to the **Owner Dashboard**:
* **Restaurant Identity:** The dashboard dynamically fetches and prominently displays the Restaurant's Name at the top, confirming the owner's identity.
* **Menu Management:** Owners have full CRUD (Create, Read, Update, Delete) access to their menu. They can upload food images, set base prices, and manage stock levels (`countInStock`). 
* **Order Pipeline:** When a customer places an order for their restaurant, it immediately appears in the owner's "Pipeline" tab. The owner can update the status (Placed -> Preparing -> Out for Delivery -> Delivered).
* **Analytics:** The dashboard calculates and displays real-time analytics, including Total Revenue, Active Orders, and Total Delivered Orders.

### 🛡️ 4. The Administrator Journey
The Admin serves as the supreme overseer of the FeastFlow platform.
* **Partner Approvals:** As mentioned, Admins review and approve/reject incoming restaurant applications.
* **User Management:** Admins can view a list of all registered users on the platform. They have the power to change a user's role (e.g., promoting a customer to an admin) or delete/ban a user entirely.
* **Targeted Announcements (Inbox System):** Admins can broadcast messages to users. They can choose to send an announcement to "All Users", or they can select "Specific Users" via a dynamic checkbox list. These announcements appear directly in the targeted users' inboxes.

---

## 🔐 Demo Credentials

### Admin Login
To access the Admin Dashboard and test the administrative features (like approving partners or sending announcements), use the following credentials on the standard Login page:
* **Email:** `souradeepmandal2015@gmail.com`
* **Password:** `4b0d2bab`

---

## 💻 Tech Stack & Architecture

* **Frontend:** React, Vite, Tailwind CSS (for modern, responsive styling), Redux Toolkit (for global state management), React Router DOM (for navigation), Lucide React (for iconography).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (using Mongoose 9.x for schema modeling and validation).
* **Authentication:** JWT (JSON Web Tokens) securely stored in HTTP-only cookies.
* **Real-time Engine:** Socket.io is implemented for real-time capabilities.
* **Image Hosting:** Cloudinary combined with Multer for handling multipart/form-data image uploads.
* **Email Services:** Nodemailer for delivering secure OTPs and notifications.

---

## 🚀 Deployment Guide (Vercel + Render)

FeastFlow is pre-configured for modern, free-tier serverless deployment!

### 1. Backend (Render)
1. Go to [Render](https://render.com/) and create a new **Web Service** from your GitHub repository.
2. Set the Root Directory to `server`.
3. Set the Environment to `Node`.
4. Set the Build Command to `npm install` and the Start Command to `npm start`.
5. Add your Environment Variables from your `.env` file (e.g., `MONGO_URI`, `JWT_SECRET`).
6. Deploy and copy your Render API URL (e.g., `https://feastflow-api.onrender.com`).

### 2. Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and import your GitHub repository.
2. Important: Edit the **Root Directory** to `client`.
3. Vercel will automatically detect the Vite framework.
4. Deploy the frontend to get your Vercel URL.

### 3. Linking Them Together
1. In your `client/vercel.json` file, update the `destination` URL to match your newly created Render API URL. Push this change to GitHub to trigger a Vercel rebuild.
2. In your Render Web Service settings, add an Environment Variable named `CLIENT_URL` and set it to your Vercel URL (e.g., `https://feastflow.vercel.app`). This perfectly configures CORS.

Enjoy building and managing your food empire with FeastFlow! 🎉
