const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const UserRouter = require("./routes/userRoutes");
const ImageRouter = require("./routes/imageRoutes");
const tagRoutes = require("./routes/tagRoute");
const scoreboardRoutes = require("./routes/scoreboard");
const cors = require("cors");

//initialise application
const app = express();
connectDB();

//enabling cors for all origin
app.use(cors());

//parse incoming body requests/JSON
app.use(bodyParser.json());
//parse app/x--www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use("/", UserRouter);
app.use("/", ImageRouter);
app.use("/tags", tagRoutes);
app.use("/", scoreboardRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
