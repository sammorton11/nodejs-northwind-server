const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config();

const personalDBPath = process.env.PERSONAL_DB;
const northwindDBPath = process.env.NORTHWIND_DB;

const db = new sqlite3.Database(personalDBPath);
const northwindDB = new sqlite3.Database(northwindDBPath);

db.serialize(() => {
   db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');
   db.run('CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, user_id INTEGER, total_amount REAL, FOREIGN KEY (user_id) REFERENCES users(id))');
});

// ROUTES
app.get('/', (_, res) => {
   res.json({ message: 'We are live!' });
});


// My SQLite database - just users and orders tables.
// Get them users 
app.get('/users', (_, res) => {
   db.all('SELECT * FROM users', (err, rows) => {
      if (err) {
         res.status(500).json({ error: err.message });
         return;
      }
      res.json(rows);
   });
});

// Insert user if not in db
app.post('/users', (req, res) => {
   const { name } = req.body;
   db.get('SELECT * FROM users WHERE name = ?', [name], (err, row) => {
      if (err) {
         console.log(err);
         res.status(400).json({ error: err.message });
         return;
      }

      if (row) {
         res.status(400).json({ error: "User already in db." });
         return;
      }

      db.run('INSERT INTO users (name) VALUES (?)', [name], function(err) {
         if (err) {
            console.log(err);
            res.status(400).json({ error: err.message });
            return;
         }
         res.status(200).json({ message: "Success!" });
      });
   });
});

// Delete all users
app.delete('/users', (_, res) => {
   db.run('DELETE FROM users', function(err) {
      if (err) {
         console.log(err);
         res.status(400).json({ error: err.message });
         return;
      }
      res.status(400).json({ message: "Delete all successful!" });
   });
});


// Get the users id, name, and the total for their orders from the orders and users tables and join them.
app.get('/users_orders', (_, res) => {
   try {
      db.all('SELECT users.id AS user_id, users.name, orders.total_amount FROM users INNER JOIN orders ON users.id = orders.user_id', function(err, rows) {
         if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
            return;
         }
         res.status(200).json(rows);
      });
   } catch (error) {
      console.log(error);
   }
});

// Insert an order
app.post('/orders', (req, res) => {
   try {
      const { user_id, total_amount } = req.body;
      console.log("Order request", user_id, total_amount);

      db.run('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', [user_id, total_amount], function(err) {
         if (err) {
            console.log(err);
            res.status(400).json({ error: err.message })
            return;
         }
         res.json({ message: "Order inserted successfully", order_id: this.lastID });
      });
   } catch (error) {
      console.log(error);
   }
});



// NORTHWIND DATABASE ENDPOINTS
// Get Suppliers and Their Products
app.get('/suppliers_with_products', (_, res) => {
   const query = `
      SELECT suppliers.SupplierID, suppliers.CompanyName, products.ProductName 
      FROM suppliers 
      LEFT JOIN products ON suppliers.SupplierID = products.SupplierID
   `
   try {
      northwindDB.all(query, function(err, rows) {
         if (err) {
            console.log(err);
            res.status().json({ error: err.message });
            return
         }
         res.status(200).json(rows);
      });
   } catch (error) {
      console.log(error);
   }
});

app.get('/employees', (_, res) => {
   try {
      const query = `
      SELECT FirstName, LastName, Title, Country, Region, City, Address, HireDate 
      FROM employees;
   `
      northwindDB.all(query, (err, rows) => {
         if (err) {
            console.log(err);
            res.status(400).json({ error: err.message });
         }
         res.status(200).json(rows);
      });
   } catch(error) {
      console.log(error);
   }
});

// Insert a new employee into the db
app.post('/create_employee', (req, res) => {
   const {
      last_name,
      first_name,
      title,
      title_of_courtesy,
      birth_date,
      hire_date,
      address,
      city,
      region,
      postal_code,
      country,
      home_phone,
      extension,
      notes,
      reports_to,
      photo_path
   } = req.body;

   const data = [
      last_name,
      first_name,
      title,
      title_of_courtesy,
      birth_date,
      hire_date,
      address,
      city,
      region,
      postal_code,
      country,
      home_phone,
      extension,
      notes,
      reports_to,
      photo_path
   ]

   const query = `
         INSERT INTO employees (
             LastName,
             FirstName,
             Title,
             TitleOfCourtesy,
             BirthDate,
             HireDate,
             Address,
             City,
             Region,
             PostalCode,
             Country,
             HomePhone,
             Extension,
             Notes,
             ReportsTo,
             PhotoPath
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   `

   try {
      northwindDB.run(query, data, function(err) {
         if (err) {
            console.log(err);
            res.status(400).json({ error: err.message });
            return;
         }
         res.status(200).json({ message: "User created successfully" });
      });
   } catch(error) {
      console.log(error);
   }
});

// Get a products name, category, descripton, Unit Price, and units in stock
app.get('/search_products_by_category', (req, res) => {
   try {
      const { categoryName } = req.body;
      const query = `
         SELECT ProductName, CategoryName, Description, UnitPrice, UnitsInStock
         FROM Categories categories
         INNER JOIN Products products
         ON categories.CategoryID = products.CategoryID
         WHERE categories.CategoryName = ?;
      `;

      northwindDB.all(query, [categoryName], (err, rows) => {
         if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
            return;
         }
         res.status(200).json(rows);
      });

   } catch(error) {
      console.log(error);
   }
});

// Get Products by Supplier
app.get('/supplier/:id/products', (req, res) => {
   const supplierId = req.params.id;
   const query = `
      SELECT CompanyName, ProductName, UnitPrice, UnitsInStock, UnitsOnOrder, Discontinued
      FROM Products products
      INNER JOIN Suppliers suppliers
      ON suppliers.SupplierID = products.SupplierID
      WHERE products.SupplierID = ?
   `;

   try {
      northwindDB.all(query, [supplierId], (err, rows) => {
         if (err) {
         console.log(err);
         res.status(400).json({ error: err.message });
      }
         res.status(200).json(rows);
      });
   } catch(error) {
      console.log(error);
   }
});


// Start that dang server
app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});
