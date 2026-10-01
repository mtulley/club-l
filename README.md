# Art Storefront

A minimalist online storefront for selling art prints and offering a monthly surprise-print subscription.

The project is built as a full-stack web application with a React frontend, Express.js backend, and PostgreSQL database. Stripe is used to handle payments and subscriptions.

## Features

* Browse available art prints
* View individual product pages
* Add products to a shopping cart
* View and manage cart contents
* Checkout through Stripe
* Monthly surprise-print subscription
* Responsive, minimalist storefront design
* Product information stored in PostgreSQL

## Tech Stack

### Frontend

* React
* React Router
* Vite
* CSS

### Backend

* Node.js
* Express.js
* PostgreSQL
* `pg` for database access

### Payments

* Stripe Checkout
* Stripe subscriptions

## Project Structure

```text
art-storefront/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── ...
│   └── package.json
│
├── backend/
│   ├── ...
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* PostgreSQL
* Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd art-storefront
```

### 2. Install dependencies

Install dependencies for both the frontend and backend:

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 3. Configure the database

Create a PostgreSQL database and configure the backend with the appropriate database connection settings.

The application uses PostgreSQL to store storefront product information.

### 4. Configure environment variables

Create a `.env` file in the backend directory with the required configuration, such as:

```env
DATABASE_URL=your_postgresql_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Do not commit secret keys or other sensitive credentials to the repository.

### 5. Start the application

Start the backend:

```bash
cd backend
npm run dev
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

The Vite development server will provide the URL for the frontend.

## Database

The storefront uses PostgreSQL for persistent product data.

Product records include information such as:

* Product name
* Price
* Image
* Description
* Availability

The Express backend exposes API endpoints that the React frontend uses to retrieve product information.

## Payments

Stripe handles payment processing and subscription management. The application does not directly handle or store customers' payment card information.

## Future Improvements

Potential improvements include:

* Admin interface for managing products
* Order fulfillment management
* Customer order history
* Inventory management
* Additional subscription management features
* Production deployment and custom domain configuration

## License

This project is for personal/client use.
