const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const {v4:uuidv4}=require('uuid')
const { OAuth2Client } = require("google-auth-library");
const clientGoogle = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//regiser
const register = async (req, res) => {
  const {
    role,
    email,
    password,
    confirmPassword,
    firstName,
    secondName,
    companyName,
    companySize,
    companyType,
    phone,
  } = req.body;
  if (!role || !email || !password || !confirmPassword || !phone) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      role,
      email,
      firstName,
      secondName,
      companyName,
      companySize,
      companyType,
      phone,
      password: hashedPassword,
    });

    await user.save();
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );

    res
      .cookie("jwtContracting", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(201)
      .json({ user: user, message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    await user.save();

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "2d" }
    );

    res
      .cookie("jwtContracting", token, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json({ user: user, message: "Login successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid credentials", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwtContracting", "", {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
      return res.status(400).json({ message: "Invalid page or limit" });
    }
    const skip = (page - 1) * limit;
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("-password -confirmPassword")
      .skip(skip)
      .limit(limit);
    const totalUsers = await User.countDocuments({});

    res.status(200).json({
      message: "Successfully fetched users",
      data: users,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit) || 1,
        totalCount: totalUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const profile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select(
      "-password -confirmPassword")
      .populate('contracts');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Successfully fetched user profile",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (req.user.role !== "Admin" && userId !== id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this user" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const {
      firstName,
      secondName,
      companyName,
      companySize,
      companyType,
      phone,
    } = req.body;

    if (req.user.role !== "Admin" && userId.toString() !== id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this data" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, secondName, companyName, companySize, companyType, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

const googleAuth = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const { payload } = await clientGoogle.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { given_name, family_name, picture, email } = payload;
    console.log(payload);
    const user = await User.findOne({ email });
    if (!user) {
      const newUser = await User.create({
        email,
        firstName: given_name,
        secondName: family_name || "",
        role: "User",
        password:uuidv4(),
        confirmPassword: "",
      });
      const data = await newUser.save();
      const token = jwt.sign(
        {
          _id: data._id,
          email: data.email,
          role: data.role,
          firstName: data.firstName,
          secondName: data.secondName,
        },
        process.env.SECRET_KEY,
        { expiresIn: "12h" }
      );
      res
        .cookie("jwtContracting", token, { httpOnly: true, secure: true })
        .status(200)
        .json({
          message: "Created successfully",
          data,
          token
        });
    }else{
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          secondName: user.secondName,
        },
        process.env.SECRET_KEY,
        { expiresIn: "12h" }
      );
      res
       .cookie("jwtContracting", token, { httpOnly: true, secure: true })
       .status(200)
       .json({
          message: "Logged in successfully",
          data: user,
          token
        });
    }
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Error during Google authentication",
      error: error.response?.data || error.message,
    });
  }
};
const addToUserGroup = async (req, res) => {
  const { _id } = req.user;
  const {
    role,
    email,
    password,
    confirmPassword,
    firstName,
    secondName,
    companyName,
    companySize,
    companyType,
    phone,
  } = req.body;
  if (!role || !email || !password || !confirmPassword || !phone) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      role,
      email,
      firstName,
      secondName,
      companyName,
      companySize,
      companyType,
      phone,
      password: hashedPassword,
      parentId: _id,
    });

    await user.save();

    const updateUserGroup = await User.findByIdAndUpdate(
      _id,
      { $push: { usersGroup: user._id } },
      { new: true }
    );
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );
    res
      .cookie("jwtContracting", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(201)
      .json({ user: user, message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering User", error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getAllUsers,
  profile,
  deleteUser,
  getSingleUser,
  updateUser,
  googleAuth,
  addToUserGroup
};
