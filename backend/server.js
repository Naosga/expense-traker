/*
EL ORDEN DEL CODIGO SI AFECTA!!!
REGLA DE ORO: Los middlewares siempre van antes de las rutas
1. Configuración (cors, json)
2. Middlewares
3. Rutas
4. Servidor (listen)
*/



const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");
const expenseRoutes = require("./routes/expenses");

const app = express();

app.use(cors()); //Middleware que Permite que el frontend se comunique con el backend
app.use(express.json()); //Middleware

app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.send("API working 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});