const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
//const itemRoutes = require("./routes/itemRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api/users", userRoutes);
//app.use("/api/items", itemRoutes);

/*app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something Broke!!" });
});*/

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}
  MongoDB:${process.env.MONGO_URI}
  Frontend:${process.env.FRONTEND_URL}`)
);
