[IMS System](https://sims-dashboard-front.vercel.app/) - [Code](https://github.com/ioNihal/sims-dashboard-front) |[Customer Portal](https://sims-retailer-front.vercel.app/) - [Code](https://github.com/ioNihal/sims-retailer-front)

# SIMS Backend

This is the Backend Code of Inventory Management System that we developed for Final Year College Project. The Server handles both the Admin Dashboard and Customer Portal.

You can visit the server: https://suims.vercel.app/

## Authors

- **Shahabas Abdul Hameed** ([S488U](https://github.com/S488U)) - Managed Backend  
- **Nihal K** ([ioNihal](https://github.com/ioNihal)) - Managed Frontend

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** (Authentication)
- **bcryptjs** (Password Hashing)
- **dotenv** (Environment Variable Management)
- **dayjs** (Date & Time Handling)
- **express-rate-limit** (Security)
- **express-async-handler** (Async Error Handling)
- **chalk** (Terminal Styling)

## Project Structure
```bash
sims-backend/
├── package.json
├── package-lock.json
├── public
│   ├── endpoints.txt
│   └── favicon.ico
├── readme.md
├── server.js
├── src
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── feedbackController.js
│   │   ├── healthController.js
│   │   ├── inventoryController.js
│   │   ├── invoiceController.js
│   │   ├── orderController.js
│   │   ├── reportController.js
│   │   └── supplierController.js
│   ├── middlewares
│   │   ├── asyncHandler.js
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── speedMiddleware.js
│   ├── models
│   │   ├── admin
│   │   │   └── adminModel.js
│   │   ├── customers
│   │   │   └── customerModel.js
│   │   ├── feedback
│   │   │   └── feedbackModel.js
│   │   ├── inventory
│   │   │   └── inventoryModel.js
│   │   ├── invoice
│   │   │   └── invoiceModel.js
│   │   ├── order
│   │   │   └── orderModel.js
│   │   ├── report
│   │   │   └── reportModel.js
│   │   └── suppliers
│   │       └── suppliersModel.js
│   ├── routes
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reportRoutes.js
│   │   └── supplierRoutes.js
│   └── utils
│       ├── errorUtils.js
│       ├── hashPassword.js
│       ├── rateLimiter.js
│       └── verifyData.js
└── vercel.json
```

> Each folder has a clear separation of concerns: models for DB, controllers for logic, routes for API endpoints, etc.

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/S488U/sims-backend.git
cd sims-backend
```
### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root folder and add:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run the Server

```bash
# For development
npm run dev

# For production
npm start
```
The backend will run at: `http://localhost:5000`

##  Security & Middleware
- Rate limiting to avoid abuse
- JWT authentication for route protection
- Password hashing with bcrypt
- CORS support enabled

## API Documentation
Hey Guys, I've shared the API documentation Here: https://documenter.getpostman.com/view/32326364/2sB2cUANcX

## Features
- Secure authentication
- RESTful API design
- Extensible architecture

## License
This project is licensed under the **ISC License**.

> Developed with ❤️ and focus by [Shahabas Abdul Hameed](https://github.com/S488U) and [Nihal K](https://github.com/ioNihal).


