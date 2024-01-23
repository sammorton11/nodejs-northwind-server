# Express SQLite Server for Northwind SQLite DB


This is a simple Express server using SQLite databases for demonstration purposes. It provides RESTful API endpoints for managing users, orders, and interacting with the Northwind database.



## Prerequisites:
Before you begin, make sure you have the following installed on your machine:


Northwind Database SQLite -> https://github.com/jpwhite3/northwind-SQLite3


Node.js


Git


## Getting Started:
Clone the repository:
git clone https://github.com/your-username/express-sqlite-server.git

## Navigate to the project directory:
cd express-sqlite-server

## Install dependencies:
npm install

Create a .env file in the root directory and set the following environment variables:
PERSONAL_DB='path/to/your/personal/database.db'


NORTHWIND_DB='path/to/your/northwind/database.db'
Replace path/to/your/personal/database.db and path/to/your/northwind/database.db with the paths to your SQLite databases.

## Start the server:
node index.js
The server will be running at http://localhost:3000.

## Available Endpoints


/users: Get all users


/users: Add a new user (POST request with JSON body)


/users: Delete all users (DELETE request)


/users_orders: Get users with their orders


/orders: Add a new order (POST request with JSON body)


/suppliers_with_products: Get suppliers and their products from Northwind database


/employees: Get employees from Northwind database


/create_employee: Add a new employee (POST request with JSON body)


/search_products_by_category: Get products by category (GET request with query parameter categoryName)


/supplier/:id/products: Get products by supplier ID




## Stop the Server
To stop the server, press Ctrl + C in the terminal.
