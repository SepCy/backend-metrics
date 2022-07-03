const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const moment = require("moment");

const Stations = require("../../models/Stations");
const auth = require("../../middlewares/auth");

router.get("/", async (req, res, next) => {
	try {
		const station = await Stations.find({});
		res.status(200).json(station);
	} catch (error) {
		next(error);
	}
});

router.get("/:id", auth, async (req, res, next) => {
	try {
		const { id }= req.params;

		const station = await Stations.findOne({
			_id: id,
		});

		if(!station){
			res.json({ message: "Cette station n'existe pas" });
		} else{
			res.status(200).json(station)
		}
	} catch (error) {
		next(error);
	}
});

router.post("/register", auth, async (req, res, next) => {
	const { name, userId, identificator, longitude, latitude} = req.body;
	try {
		const identify = await Stations.findOne({
			identificator: req.body.identificator,
		});
		if (!identify) {
			const station = await new Stations({
				name,
				userId,
				identificator,
				longitude,
				latitude,
			}).save();

			res.status(200).json(station);
		} else {
			res.status(400).json({ error: "cette station existe déjà" });
		}
	} catch (error) {
		next(error);
	}
});

router.put("/:id", auth, async (req, res, next) => {
	const { id } = req.params;
	const {
		rating,
		values
	} = req.body;

	try {
		const station = await Stations.findOne({ _id: id });

		if (station) {
			const newStation = await Stations.updateOne(
				{
					_id: id,
				},
				{
					$set: {
						rating: rating ? rating: station.rating  ,
						values: [...station.values, values[0]]
					},
				}
			);
			res.status(200).json({ message: "Update successfuly", station: newStation });
		}
	} catch (error) {
		next(error);
	}
});

router.delete("/:id", auth, async (req, res, next) => {
	const { id } = req.params;
	try {
		const station = await Stations.findByIdAndDelete({
			_id: id,
		});
		station
			? res.status(200).json("Station Delete")
			: res.status(200).json("Nothing to Delete");
	} catch (error) {
		next(error);
	}
});

router.post("/infos/:identificator", auth, async (req, res, next) => {
	const { identificator } = req.params;
	try {
		const station = await Stations.findOne({ identificator: identificator });

		if (!req.body.value) {
			res.json({ message: "Données incorrectes" });
		} else if (!station) {
			res.json({ message: "informations incorrecte" });
		} else {
			const newStation = await Stations.updateOne(
				{
					identificator: identificator,
				},
				{
					$push: {
						values: req.body.value,
					},
				}
			);
			res.status(200).json({ message: "Mise a jour effectuée" });
		}
	} catch (error) {
		next(error);
	}
});

// router.post("/infos/:identificator", auth, async (req, res, next) => {
// 	const { identificator } = req.params;
// 	try {
// 		const station = await Stations.findOne({ identificator: identificateur });
// 		if (!req.body.value) {
// 			res.json({ message: "Données incorrectes" });
// 		} else if (!station) {
// 			res.json({ message: "informations incorrecte" });
// 		} else {
// 			const newStation = await Stations.updateOne(
// 				{
// 					identificator: identificator,
// 				},
// 				{
// 					$push: {
// 						values: req.body.value,
// 					},
// 				}
// 			);
// 			res.status(200).json({ message: "Mise a jour effectuée" });
// 		}
// 	} catch (error) {
// 		next(error);
// 	}
// });

/**
 * il sera important de créer une route qui verifiera qu'un station continue d'emettre
 */
module.exports = router;
