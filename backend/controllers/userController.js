import User from "../model/userModel.js";
import bcrypt from "bcrypt";
import { createTokenAndSaveCookie } from "../jwt/generateToken.js";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "password do not match",
      });
    }

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "All field required",
      });
    }

    if (!password || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: "Password must be a valid string." });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "email already registered",
      });
    }

    // hasing password

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
    });

    // create the token and send it as a cookie
    await createTokenAndSaveCookie(newUser._id, res);

    res.status(201).json({
      status: true,
      message: "user Register Successfully",
      user: {
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "invalid user and Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({
        message: "invalid user and Password",
      });
    }

    createTokenAndSaveCookie(user._id, res);
    res.status(200).json({
      message: "User login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "server error",
    });
  }
};

export const LogOut = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "User Logged out Successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "internal server error",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const loggedUser = req.user._id;
    const filtredUser = await User.find({ _id: { $ne: loggedUser } }).select(
      "-password",
    );
    res.status(200).json({
      message: "All User find Successfully",
      filtredUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "internal server error",
    });
  }
};
