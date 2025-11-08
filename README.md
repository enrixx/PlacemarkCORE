# PlacemarkCORE

A simple web application for managing and sharing geographical placemarks. Users can register, log in, and create placemarks with a name and coordinates. They can view placemarks created by all users but can only delete their own.

## Features

-   **User Authentication:** Secure user registration and login.
-   **Placemark Management:** Create, view, and delete placemarks.
-   **Shared View:** View placemarks from all users on a central dashboard.
-   **Ownership Control:** Users can only delete the placemarks they have created.
-   **Data Persistence:** Supports both an in-memory store for quick testing and a JSON file for data persistence.
-   **Input Validation:** Uses Joi to validate all incoming data.
-   **Testing:** Includes a comprehensive test suite using Mocha and Chai.

## Technologies Used

-   **Backend:** [Hapi.js](https://hapi.dev/)
-   **Frontend Templating:** [Handlebars.js](https://handlebarsjs.com/)
-   **Testing:** [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/)
-   **Data Validation:** [Joi](https://joi.dev/)
-   **Runtime:** [Node.js](https://nodejs.org/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) installed on your system.

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/enrixx/PlacemarkCORE.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd PlacemarkCORE
    ```
3.  Install the required dependencies:
    ```sh
    npm install
    ```

### Running the Application

To start the server, run the following command:

```sh
npm start
```

If you dont want to manual restart the application, after changes you can use nodemon:

```sh
npm run dev
```

The application will be available at `http://localhost:3000`.

### Running Tests

To run the test suite, use the following command:

```sh
npm test
```

This will execute all the unit tests for the application.

## Project Structure

```
.
├── src
│   ├── controllers/  # Route handlers for different parts of the application
│   ├── models/       # Data stores (in-memory, JSON) and Joi validation schemas
│   ├── views/        # Handlebars templates and partials
│   ├── server.js     # Main server configuration and startup
│   └── web-routes.js # Route definitions
├── test
│   ├── fixtures.js
│   └── *.js          # Test files for models and controllers
└── package.json
```

