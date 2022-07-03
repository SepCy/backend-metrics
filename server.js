const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use(express.static("./public"));
app.use(cors());
app.options("*", cors());

app.use(express.json());

// bodyParser, parses the request body to be a readable json format
//app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOSTNAME, MONGO_PORT, MONGO_DB } =
	process.env;

const options = {
	useNewUrlParser: true,
	reconnectTries: Number.MAX_VALUE,
	reconnectInterval: 500,
	connectTimeoutMS: 10000,
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
};

mongoose
	.connect(process.env.MONGODB_URI, options)
	.then(function () {
		console.log("MongoDB is connected");
	})
	.catch(function (err) {
		console.log(err);
	});

const userRouter = require("./routes/users/users");
const stationRouter = require("./routes/stations/stations");
const paymentRouter = require("./routes/paiements/paypals");

app.use("/authentication", userRouter);
app.use("/stations", stationRouter);
app.use("/checkout", paymentRouter);

app.set("view engine", "ejs");

// // Serve static assets if in production
// if (process.env.NODE_ENV === "production") {
// 	//set static folder
// 	app.use(express.static(path.join(__dirname, "../client", "build")));

// 	app.get("/*", (req, res) => {
// 		res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// 	});
// }

app.listen(PORT, function () {
	console.log("Server is running on Port: " + PORT);
});
