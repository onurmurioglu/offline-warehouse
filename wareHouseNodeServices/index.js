const express = require("express");
const app = express();
const port = 3001;

// CORS ayarları
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // Tüm kaynaklara erişime izin verme
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE"); // İzin verilen HTTP metodları
  res.header("Access-Control-Allow-Headers", "Content-Type"); // İzin verilen headerlar
  next();
});

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "warehouse_sync_database",
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected");
  }
});

// Yeni ürün ekleme
app.post("/add-product", (req, res) => {
  const { title, price, description, category, image, stock, selected } =
    req.body;
  const sql = `INSERT INTO products (title, price, description, category, image, stock, selected) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  connection.query(
    sql,
    [title, price, description, category, image, stock, selected],
    (err, result) => {
      if (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ error: "Error adding product" });
      } else {
        console.log("Product added:", result);
        res.status(201).json({ message: "Product added" });
      }
    }
  );
});

// Ürün düzenleme
app.put("/edit-product/:id", (req, res) => {
  const productId = req.params.id;
  const { title, price, description, category, image, stock, selected } =
    req.body;
  const sql = `UPDATE products SET title = ?, price = ?, description = ?, category = ?, image = ?, stock = ?, selected = ? WHERE id = ?`;
  connection.query(
    sql,
    [title, price, description, category, image, stock, selected, productId], // productId'i en sona taşıdık
    (err, result) => {
      if (err) {
        console.error("Error editing product:", err);
        res.status(500).json({ error: "Error editing product" });
      } else {
        console.log("Product edited:", result);
        res.json({ message: "Product edited" });
      }
    }
  );
});

//Kayıtları listele
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products"; // Ürünleri çeken SQL sorgusu
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Error fetching products" });
    } else {
      console.log("Products fetched:", results);
      res.json(results);
    }
  });
});
