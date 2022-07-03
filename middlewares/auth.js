const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
dotenv.config();


const auth = (req, res, next) => {

    const token = req.header('Authorization')

    if (!token) {
        return res.status('401').json({ error: "you must be logged in" })
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET)

        if (!verified) {
            return res.status(401).json({ error: "Token verification failed, authorization denied" })
        }

        req.user = verified
        next()

    } catch (error) {
        res.status(400).json({ msg: 'Token is not valid' });
    }

}
module.exports = auth