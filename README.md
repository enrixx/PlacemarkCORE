# PlacemarkCORE ⚙️

PlacemarkCORE is the robust backend engine and administrative hub for the Placemark ecosystem. It provides a comprehensive REST API for the Svelte frontend while offering a built-in Admin Dashboard for direct data management.

### 🚀 Live Deployments
* **PlacemarkCORE (API & Admin):** Hosted on **Render** 👉 [https://placemarkcore-hm5j.onrender.com/](https://placemarkcore-hm5j.onrender.com/)
* **Placemark-Svelte (Frontend):** Hosted on **Netlify** 👉 [https://enricohu.netlify.app/](https://enricohu.netlify.app/)

---

## 🛠️ Role in the Ecosystem

PlacemarkCORE serves two primary purposes:
1.  **RESTful API:** Powers the [Placemark-Svelte](https://github.com/enrixx/Placemark-Svelte) frontend with secure endpoints for location data, weather integration, and image management.
2.  **Admin Dashboard:** A server-side rendered interface built with **Handlebars** and **Easy UI** that allows administrators to manage users and placemarks directly.

## 🌟 Features

-   **Secure API:** JWT-based authentication and Joi validation for all endpoints.
-   **Admin Dashboard:** High-level overview and management of the entire platform.
-   **Multi-Store Support:** Flexible data persistence using MongoDB (Mongoose), JSON (LowDB), or In-Memory stores for testing.
-   **Image Handling:** Integrated with Cloudinary for robust image hosting.
-   **Interactive Maps:** Geographic data visualization for placemarks.
-   **Input Validation:** Strict schema validation using Joi to ensure data integrity.
-   **Testing:** Comprehensive test suite using Mocha and Chai for reliable deployments.

## 📖 API Documentation

PlacemarkCORE includes built-in interactive documentation using **Hapi-Swagger**. This allows developers to test endpoints, view required parameters, and understand response schemas directly from the browser.

* **Access Documentation:** When running locally, navigate to `/documentation` (e.g., `http://localhost:3000/documentation`).
* **Standards:** Built using OpenAPI (Swagger) specifications.
* **Endpoints covered:** User Authentication, Placemark CRUD, Category management, and Image uploads.

## 🧰 Technologies Used

-   **Runtime:** Node.js
-   **Framework:** [Hapi.js](https://hapi.dev/)
-   **Frontend Templating:** [Handlebars.js](https://handlebarsjs.com/) (for Admin views)
-   **UI Components:** Easy UI
-   **Database:** MongoDB (Atlas) / LowDB (JSON)
-   **Testing:** Mocha & Chai
-   **Validation:** Joi
-   **API Docs:** Hapi-Swagger

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [npm](https://www.npmjs.com/)
* MongoDB instance (Local or Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/enrixx/PlacemarkCORE.git](https://github.com/enrixx/PlacemarkCORE.git)
    cd PlacemarkCORE
    ```

2.  **Configuration:**
    Create a `.env` file in the root directory by copying the example:
    ```bash
    cp .env.example .env
    ```
    *(Note: If you are on Windows Command Prompt and `cp` does not work, simply copy the file manually and rename it to `.env`)*

    Update the `.env` file with your details:
    * `db`: Your MongoDB connection string.
    * `cookie_password`: A secure string for session cookies.
    * `cloudinary_name`, `key`, `secret`: Your image hosting credentials.

3.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

**Development Mode (with Nodemon for auto-restart):**
```bash
npm run dev
 ```
 ## Production Mode

To start the application in production mode, run:

```bash
npm start
```

The application and Admin Dashboard will be available at http://localhost:3000.

## Running Tests

Dont forget to run the server or else the api tests wont work.

```bash
npm run test
```

## 📂 Project Structure

```plaintext
.
├── src
│   ├── api/            # REST API endpoints (used by Svelte frontend)
│   ├── controllers/    # Route handlers for the Admin Dashboard
│   ├── models/         # Database schemas and validation logic
│   ├── views/          # Handlebars templates and Easy UI layouts
│   ├── server.js       # Main server configuration
│   ├── web-routes.js   # Admin and Web route definitions
│   └── api-routes.js   # API route definitions
├── test/               # Mocha & Chai test files
│   ├── fixtures.js     # Test data
│   └── *_test.js       # Model and Controller tests
└── package.json
```
