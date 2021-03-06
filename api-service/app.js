const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./config/swagger.json");
const swaggerSpec = require("./config/swaggerSpec");

const app = express();

let PORT = process.env.PORT || 5000;

// load passport configuration
require("./config/passport")(passport);

// app middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

// app routes
app.get("/", (req, res) => {
  res.send(
    `
      <h1>Welcome</h1>
      to see overview of the project visit this <a href="https://github.com/karyatio/Screening-test-rlidev2" target="_blank">Github repo</a><br/>
      visit app documentation at <a href="http://localhost:81/api-docs/" target="_blank">http://localhost:81/api-docs/</a>
    `
  );
});
app.use("/api/v1/", require("./routes"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/orders", require("./routes/orders"));
app.use("/api/v1/orders", require("./routes/product_order"));

// swagger routes
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.get("/api-docs.json", (req, res) => {
  // used to generate api-docs.json for swagger.json
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// route not found
app.use((req, res) => {
  return res.status(404).json({ error: "Not Found" });
});

// this command will change the port to 5123 for testing so it doesn't conflict with main app
if (process.env.NODE_ENV === "test") PORT = 5123;

app.listen(PORT, () => console.log(`Application running`));

module.exports = app;
