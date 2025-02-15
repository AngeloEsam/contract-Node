const express = require("express");
const connectDB = require("./lib/db");
const dotenv = require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const contractRoutes = require("./routes/contractRoutes");
const mainRoutes = require("./routes/mainItemRoutes");
const subRoutes = require("./routes/subItemRoutes");
const workRoutes = require("./routes/workItemRoutes");
const deductionRoutes = require("./routes/deductionRoutes");
const additionRoutes = require("./routes/additionRoutes");
const additionWorkConfirmationRoutes = require("./routes/additionWorkConfirmation");
const deductionWorkConfirmationRoutes = require("./routes/deductionWorkConfirmation");
const workConfirmationRoutes = require("./routes/workConfirmationRoutes");
const templateRoutes = require("./routes/templateRoutes");
const estimatorTemplateRoutes = require("./routes/estimatorTemplateRoutes");
const estimatorRoutes = require("./routes/estimatorRoutes");
const materialRoutes = require("./routes/materialRoutes");
const categoriesRoutes = require("./routes/categoriesRoute");
const productsRoutes = require("./routes/productRoute");
const companyProfileRoutes = require("./routes/companyProfile.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalErrorHandlerMiddleware = require("./middlewares/globalErrorHandlerMiddleware");
const ApiError = require("./utils/ApiError");
const app = express();
const port = process.env.PORT || 5001;
// Connect to DB
connectDB();
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://whale-app-bpeim.ondigitalocean.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
  })
);
// Routes
app.use("/api/auth", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/main", mainRoutes);
app.use("/api/sub", subRoutes);
app.use("/api/work", workRoutes);
app.use("/api/deduction", deductionRoutes);
app.use("/api/addition", additionRoutes);
app.use("/api/additionWorkConfirmation", additionWorkConfirmationRoutes);
app.use("/api/deductionWorkConfirmation", deductionWorkConfirmationRoutes);
app.use("/api/workConfirmation", workConfirmationRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/estimatorTemplates", estimatorTemplateRoutes);
app.use("/api/estimators", estimatorRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/companyProfile", companyProfileRoutes);
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/quality-check", require("./routes/qualityCheck.routes"));
//statics
app.use("/excelFiles", express.static("excelFiles"));
app.use("/projectImages", express.static("projectImages"));
app.use("/partnerImages", express.static("partnerImages"));
app.use("/companyProfileImages", express.static("companyProfileImages"));
app.use("/uploads", express.static("uploads"));
app.get("/download/:filename", (req, res) => {
  const filePath = `uploads/${req.params.filename}`;
  res.download(filePath);
});
app.use("*", (req, res, next) => {
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 400));
});

// Global error handle
app.use(globalErrorHandlerMiddleware);

// Listen
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// Handle rejection errors

process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled rejection at: ${promise}, ${err.stack}`);
  server.close(() => process.exit(1));
});
