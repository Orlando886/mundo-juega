const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;
const DATA = path.join(__dirname, "productos.json");
const CATALOG = path.join(__dirname, "productos-catalogo.json");

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

function readProducts() {
  if (!fs.existsSync(DATA) && fs.existsSync(CATALOG)) {
    fs.copyFileSync(CATALOG, DATA);
  }
  if (!fs.existsSync(DATA)) return [];
  try { return JSON.parse(fs.readFileSync(DATA, "utf8")); }
  catch (e) { console.error("Error leyendo productos.json:", e.message); return []; }
}
function saveProducts(products) {
  fs.writeFileSync(DATA, JSON.stringify(products, null, 2), "utf8");
}
app.get("/api/estado", (req,res) => res.json({ estado:"activo", tienda:"Mundo Juega" }));
app.get("/api/productos", (req,res) => res.json(readProducts()));
app.post("/api/productos", (req,res) => {
  const p = req.body || {};
  if (!p.name || !p.reference || !p.category || !Number(p.pricePublic || p.price)) {
    return res.status(400).json({ mensaje:"Completa nombre, referencia, categoría y precio público." });
  }
  const products = readProducts();
  if (products.some(x => String(x.reference).toLowerCase() === String(p.reference).toLowerCase())) {
    return res.status(409).json({ mensaje:"Ya existe un juguete con esa referencia." });
  }
  const item = { ...p, id: Date.now(), price: Number(p.pricePublic || p.price), pricePublic:Number(p.pricePublic || p.price), priceWholesale:Number(p.priceWholesale || 0) };
  products.push(item); saveProducts(products); res.status(201).json(item);
});
app.put("/api/productos/:id", (req,res) => {
  const products = readProducts();
  const i = products.findIndex(p => String(p.id) === req.params.id);
  if (i < 0) return res.status(404).json({ mensaje:"Producto no encontrado." });
  products[i] = { ...products[i], ...req.body, id:products[i].id };
  if (products[i].pricePublic) products[i].price = Number(products[i].pricePublic);
  saveProducts(products); res.json(products[i]);
});
app.delete("/api/productos/:id", (req,res) => {
  const products = readProducts();
  const next = products.filter(p => String(p.id) !== req.params.id);
  if (next.length === products.length) return res.status(404).json({ mensaje:"Producto no encontrado." });
  saveProducts(next); res.json({ mensaje:"Producto eliminado." });
});
app.get("*", (req,res) => res.sendFile(path.join(__dirname,"index.html")));
app.listen(PORT, () => console.log(`Mundo Juega listo: http://localhost:${PORT}`));
