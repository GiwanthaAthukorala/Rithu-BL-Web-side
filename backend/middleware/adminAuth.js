const jwt = require("jsonwebtoken");
const Admin = require("../models/userAdmin");

const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Connect to admin database
      const adminConn = await mongoose.createConnection(process.env.MONGO_URI, {
        dbName: "rithu_admin",
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const AdminModel = adminConn.model("Admin");
      req.admin = await AdminModel.findById(decoded.id).select("-password");

      return next();
    }

    res.status(401);
    throw new Error("Not authorized, no token");
  } catch (error) {
    console.error(error);
    res
      .status(401)
      .json({ message: error.message || "Not authorized as admin" });
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.permissions.includes(permission)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this action" });
    }
    next();
  };
};

module.exports = { adminProtect, checkPermission };
