const User = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");

const {
  authMiddleware,
  getAccessToken
} = require("../middleware/authmiddelware");
const router = express.Router();
require("dotenv").config();
const {
  generateTokens,
  sendResetEmail,
  sendVerificationEmail
} = require("../controller/restpassword");

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      country,
      address,
      dateOfBirth,
      password,
      role,
      educationLevel,
      experience,
      subjects,
      batch,
      status,
      bio,
      learningGoals
    } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const profileData =
      role === "teacher"
        ? {
            educationLevel,
            experience: parseInt(experience) || 0,
            subjects,
            batch,
            bio
          }
        : {
            educationLevel,
            learningGoals,
            bio
          };

    

    const user = new User({
      name,
      email,
      phone,
      country,
      address,
      dateOfBirth,
      password: hashedPassword,
      role,
      profile: profileData,
      status,
      emailStatus: "unverified",
    });

    await user.save();
    const verifyuser = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const verifyToken = generateTokens({ userId: verifyuser._id, verifyToken: true });
    const verifyTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

    user.verifyEmailToken = verifyToken;
    user.verifyEmailExpires = verifyTokenExpire;
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    await sendVerificationEmail(user.email, verifyLink, user.name);

    res.status(201).json({
      success: true,
      message: "Account created successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        emailStatus: user.emailStatus,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during account creation",
      error: error.message
    });
  }
});

router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await User.findOne({
      verifyEmailToken: token,
      verifyEmailExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired verification token" 
      });
    }

    user.verifyEmailToken = undefined;
    user.verifyEmailExpires = undefined;
    user.emailStatus = "verified";
    await user.save();

    res.json({ 
      success: true, 
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailStatus: user.emailStatus
      }
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during email verification" 
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    if(user.emailStatus !== "verified"){
      return res.status(403).json({
        success: false,
        message: "Please verify your email to login"
      });
    }

    const tokens = getAccessToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        country: user.country,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message
    });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
      error: error.message
    });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      phone,
      country,
      address,
      dateOfBirth,
      educationLevel,
      experience,
      subjects,
      bio,
      learningGoals
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const updateData = {
      name: name || user.name,
      phone: phone || user.phone,
      country: country || user.country,
      address: address || user.address,
      dateOfBirth: dateOfBirth || user.dateOfBirth
    };

    const profileData =
      user.role === "teacher"
        ? {
            ...user.profile,
            educationLevel: educationLevel || user.profile.educationLevel,
            experience:
              experience !== undefined
                ? parseInt(experience)
                : user.profile.experience,
            subjects: subjects || user.profile.subjects,
            bio: bio || user.profile.bio
          }
        : {
            ...user.profile,
            educationLevel: educationLevel || user.profile.educationLevel,
            learningGoals: learningGoals || user.profile.learningGoals,
            bio: bio || user.profile.bio
          };

    updateData.profile = profileData;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
      error: error.message
    });
  }
});

router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

router.delete("/account", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await User.findByIdAndDelete(req.user.userId);

    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting account",
      error: error.message
    });
  }
});

router.post("/get-reset-link", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const resetToken = generateTokens({ userId: user._id, verifyToken: false });

    const resetTokenExpire = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpire;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendResetEmail(user.email, resetLink, userName=user.name);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent"
    });
  } catch (error) {
    console.error("Error generating reset link:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset link" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({ success: true, message: "Password reset successful" });
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.emailStatus === "verified") {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    const verifyToken = generateTokens({ userId: user._id, verifyToken: true });
    const verifyTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

    user.verifyEmailToken = verifyToken;
    user.verifyEmailExpires = verifyTokenExpire;
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    await sendVerificationEmail(user.email, verifyLink, user.name);

    res.json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});



module.exports = router;
