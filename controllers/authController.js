const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
	try {
		const { username, email, password, profileImage, bio, quote } = req.body;

		if (!username || !email || !password) {
			return res
				.status(400)
				.json({ message: "Please provide username, email, and password" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(400)
				.json({ message: "User with this email already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = await User.create({
			username,
			email,
			password: hashedPassword,
			profileImage,
			bio,
			quote,
		});

		const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		res.status(201).json({
			message: "User was created successfully",
			user: {
				id: newUser._id,
				username: newUser.username,
				email: newUser.email,
			},
			token,
		});
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ message: "Server error" });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Please provide email and password" });
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res
				.status(401)
				.json({ message: "A user with that email does not exist" });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		res.status(200).json({
			status: "success",
			user: { id: user._id, username: user.username, email: user.email },
			token,
		});
	} catch (error) {
		console.error("Error logging in:", error);
		res.status(500).json({ message: "Server error" });
	}
};
