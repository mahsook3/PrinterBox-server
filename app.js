const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use("/files", express.static("files"));

// Suppressing DeprecationWarning for strictQuery option
mongoose.set('strictQuery', false);

// MongoDB connection
const mongoUrl = "mongodb+srv://goldenking1113:190ABlXdo0U9uNZQ@expensetracker.jejyrbh.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));

// multer setup
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

// Model setup
require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");

const upload = multer({ storage: storage });

// Upload endpoint
app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const fileName = req.file.filename;
  try {
    await PdfSchema.create({ title: title, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

// Get files endpoint
app.get("/get-files", async (req, res) => {
  try {
    PdfSchema.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Default endpoint
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

// Start server
app.listen(5000, () => {
  console.log("Server Started");
});
