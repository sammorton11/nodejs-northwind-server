const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config();

const northwindDBPath = process.env.NORTHWIND_DB;

const northwindDB = new sqlite3.Database(northwindDBPath);

// ROUTES
app.get('/', (_, res) => {
   res.json({ message: 'We are live!' });
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
   } = req.body;

   const data = [
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
   ];


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

app.get('/get_customers_by_country', (req, res) => {
   try {
      const { country } = req.body;
      const query = `
         SELECT * FROM Customers WHERE Country = ?
      `
      northwindDB.all(query, [country], (err, rows) => {
         if (err) {
            console.log(err);
            res.status(400).json({ error: err.message })
            return;
         }
         res.status(200).json(rows);
      });
   } catch (error) {
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


app.get('/products_total_sales', (_, res) => {
   const query = `
      SELECT Products.ProductID, Products.ProductName, SUM(OrderDetails.Quantity * OrderDetails.UnitPrice) AS TotalSales
      FROM Products
      JOIN "Order Details" as OrderDetails ON Products.ProductID = OrderDetails.ProductID
      GROUP BY Products.ProductID, Products.ProductName
      ORDER BY TotalSales DESC;
   `
   try {
      northwindDB.all(query, (err, rows) => {
         if (err) {
            console.log(err);
            res.status(400).json({ error: err.message });
         } else {
            res.status(200).json(rows);
         }
      });
   } catch(error) {
      console.log(error);
   }
});

app.get('/customer_order_count', (_, res) => {
   const query = `
      SELECT 
         Customers.CustomerID AS ID,
         Customers.ContactName AS CustomerName,
         Customers.City AS CustomerCity,
         COUNT(Orders.OrderID) AS OrderCount
      FROM Orders 
      JOIN Customers ON Customers.CustomerID = Orders.CustomerID
      GROUP BY ID
      ORDER BY OrderCount DESC; 
   `
   
   try {
      northwindDB.all(query, (err, rows) => {
         if (err) {
            console.log(err);
            res.status(400).json({error: err.message});
         } else {
            res.status(200).json(rows)
         }
      });
   } catch (error) {
      console.log(error); 
   }
});


// Start that dang server
app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});
