import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

const secretKey = process.env.secretKey
const app = express();
const port = 3000;

app.use(clerkMiddleware())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function generatePassword(length) {
	let password = "";
	let charPool = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345678!@#{}[];:'"<,>.?/`;
	let passwordCharLength = charPool.length;
	for (let i = 0; i < length; i++) {
		password += charPool[Math.floor(Math.random() * passwordCharLength)];
	}
	return password;
}

const userData = {
	userId: 1,
	username: "admin",
	password: generatePassword(),
};

//custom middleware function
// what if there are tons of routes to check
const requiredLogin = (req, res, next) => {
	if (!req.header('Authorization')) {
		res.redirect('/login')
	}

	//continue to the next route, if there is an user
	next();
};

app.post("/logout", (req, res) => {
	const header = req.header('Authorization');

	if (!header) {
		res.status(409).json({ message: "No token is provided" })
	}

	const clientToken = header.split(" ")[1]

	if (!clientToken) {
		res.status(401).json({ message: "Missing Token" })
	}

	// on the server, there is no way to remove token from the client's localstorage
	res.json({
		message: "Logout successfully. Please remove token from the localstorage"
	})
});

app.get("/dashboard", requiredLogin, (req, res) => {
	const { token } = req.header('Authorization')

	if (!token) res.redirect('/login')

	const payload = jwt.verify(token, secretKey)

	if (!payload) res.redirect('/login')

	const username = payload.payload.username

	res.send(
		`<h1> Welcome to your dashboard: ${username}! </h1>`
	);
});

app.post("/login", (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		console.log("username and password are required");
		res.status(409).send("All the fields are mandatory");
	}

	if (username === userData.username && password === userData.password) {
		const payload = {
			userId: user.id,
			username: username,
		};

		const options = { expiresIn: "1h" };

		const token = jwt.sign(payload, secretKey, options)

		res.json({
			message: "Login successful",
			token: token,
		})
	} else {
		res.send("Invalid username and password");
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
