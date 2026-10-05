import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

export const secureRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "User Not Authorized",
      });
    }
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!verifyToken) {
      return res.status(403).json({
        message: "invalid token",
      });
    }

    const user = await User.findById(verifyToken.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    
    if(user.isBlocked){
      return res.status(403).json({
        message: "Account Blocked"
      })
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "invalid or expired token",
    });
  }
};
