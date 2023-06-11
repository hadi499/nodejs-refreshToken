import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    console.log("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({
    message: "User registered successfully",
  });
});
let refreshTokens = [];

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const data = {
      id: user.id,
      email: user.email,
    };
    const accessToken = generateAccessToken(res, data);
    const refreshToken = generateRefreshToken(res, data);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } else {
    res.status(401);
  }
});

const getUser = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    if (!users) console.log("No users exist");
    res.json(users);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const myRefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    const data = {
      id: user.id,
      email: user.email,
    };
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken(res, data);
    res.json({ accessToken: accessToken });
  });
});

export { registerUser, authUser, getUser, myRefreshToken };
