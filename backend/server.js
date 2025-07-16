const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
//const itemRoutes = require("./routes/itemRoutes");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "https://rithu-bl-web-side-frontend.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: ${origin} not allowed`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicit OPTIONS handler
app.options("*", cors());
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
