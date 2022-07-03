const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const auth = require("../../middlewares/auth");
const User = require("../../models/Users");
const Station = require("../../models/Stations");
const { findById } = require("../../models/Users");

router.get("/", auth, async (req, res, next) => {
	try {
		const users = await User.find({});
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
});

router.post("/signup", async (req, res, next) => {
	const { email, password, firstName, lastName, number } = req.body;
	// First Validate The Request
	pwd = bcrypt.hash(req.body.password, 20);
	//const { errors } = await Schema.validateAsync(req.body);
	if (!email || !password || !firstName || !lastName || !number) {
		return res.status(422).json({ error: "please add all the fields" });
	}

	try {
		// Check if this user already exisits
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			//Insert the new user
			const salt = await bcrypt.genSalt();
			const hashedpassword = await bcrypt.hash(password, salt);

			//  bcrypt.hash(req.body.motDePasse, 12)
			//  .then(hashedmotDePasse =>{
			const newUser = new User({
				email,
				password: hashedpassword,
				firstName,
				lastName,
				number,
			});
			const user = await newUser.save();

			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

			//return json
			res.status(200).json({
				token,
				user,
			});
		} else {
			//Insert the new user
			return res.status(400).json({ message: "Username already use " });
		}
	} catch (error) {
		next(error);
	}
});

router.delete("/:id", auth, async (req, res, next) => {
	try {
		const { id } = req.params;
		const users = await User.findOne({
			_id: id,
		});

		if (!users) {
			res.json({ message: "Users don't exit " });
		} else {
			await User.deleteOne({ _id: id });
			res.json({ message: "Delete Sucessful" });
		}
	} catch (error) {
		next(error);
	}
});

router.get("/:id", auth, async (req, res, next) => {
	try {
		const { id } = req.params;
		const users = await User.findOne({
			_id: id,
		});

		if (!users) {
			res.json({ message: "Users don't exit " });
		} else {
			//await Files.deleteOne({ _id: id });
			res.json(users);
		}
	} catch (error) {
		next(error);
	}
});

router.put("/:id", auth, async (req, res, next) => {
	try {
		const { id } = req.params;
		const { firstName, lastName } = req.body;
		const oldUser = await User.findOne({
			_id: id,
		});

		if (!oldUser)
			return res.status(401).json({ message: "invalid credentials" });
		const Newuser = await User.updateOne(
			{
				_id: id,
			},
			{
				$set: {
					firstName,
					lastName,
				},
			}
		);
		res.status(200).json({ message: "Update successfuly" });
	} catch (error) {
		next(error);
	}
});

router.post("/signin", async (req, res, next) => {
	console.log(`signin ${req}`);
	const { email, password } = req.body;
	if (!email) {
		res.status(422).json({ error: "Please add email" });
	} else if (!password) {
		res.status(422).json({ error: "Please add motDePasse" });
	}

	try {
		const user = await User.findOne({ email: email });

		const station = await Station.find({ userId: user.id });

		if (!user) {
			res.status(422).json({ error: "Invalid username or password" });
		}

		const Ismatch = await bcrypt.compare(password, user.password);

		if (!Ismatch)
			return res.status(422).json({ message: "Invalid credentials" });

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

		res.status(200).json({
			token,
			user,
			station,
		});
	} catch (e) {
		return e;
	}
});

router.post("/validtoken", async (req, res) => {
	try {
		const token = req.header("Authorization");
		console.log(`valid ${token}`);

		if (!token) return res.status(400).json("Token absent");

		const verified = jwt.verify(token, process.env.JWT_SECRET);

		if (!verified) return res.status(400).json("Token not verified");
		const user = await User.findById(verified.id);

		const station = await Station.find({ userId: user.id });

		if (!user)
			return res.status(400).json("Token not valid for this user anymore");
		return res.json({
			user: user,
			token: token,
			stations: station,
		});
	} catch (error) {
		return error;
	}
});

router.put("/subscription/:id/:name", auth, async (req, res, next) => {
	const { id, name } = req.params;
	try {
		if (name == "premium") {
			const user = await User.findOne({ _id: id });
			if (!user)
				return res.status(401).json({ message: "invalid credentials" });
			const newUser = await User.updateOne(
				{
					_id: id,
				},
				{
					$set: {
						roles: "premium",
					},
				}
			);
			res.status(200).json({ message: "Update successfuly" });
		} else if (name == "owner") {
			const user = await User.findOne({ _id: id });
			if (!user)
				return res.status(401).json({ message: "invalid credentials" });
			const newUser = await User.updateOne(
				{
					_id: id,
				},
				{
					$set: {
						roles: "owner",
					},
				}
			);
			res.status(200).json({ message: "Update successfuly" });
		} else {
			res.json({ message: "Information incorrect" });
		}
	} catch (error) {
		next(error);
	}
});

router.post("/follow/", auth, async (req, res, next) => {
	const { id, idStation } = req.body;
	if (!id && !idStation) {
		res.json({ message: "Informations incorrectes" });
	}
	try {
		const user = await User.findOne({ _id: id });
		if (!user) {
			res.json({ message: "Cet utilisateurs n'existe pas" });
		} else {
			const newStation = await User.updateOne(
				{
					_id: id,
				},
				{
					$addToSet: {
						stationSuivie: req.body.idStation,
					},
				}
			);
			res.status(200).json({ message: "Mise a jour effectuée" });
		}
	} catch (error) {
		next(error);
	}
});

router.post("/unfollow/", auth, async (req, res, next) => {
	const { id, idStation } = req.body;
	if (!id && !idStation) {
		res.json({ message: "Informations incorrectes" });
	}
	try {
		const user = await User.findOne({ _id: id });
		if (!user) {
			res.json({ message: "Cet utilisateurs n'existe pas" });
		} else {
			const newStation = await User.updateOne(
				{
					_id: id,
				},
				{
					$unset: {
						stationSuivie: req.body.idStation,
					},
				}
			);
			res.status(200).json({ message: "Vous ne suivez plus cette station" });
		}
	} catch (error) {
		next(error);
	}
});

module.exports = router;
