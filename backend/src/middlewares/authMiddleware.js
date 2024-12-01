import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  console.log("[AuthMiddleware] Authentication middleware triggered.");
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[AuthMiddleware] Missing or invalid token.");
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("[AuthMiddleware] Token verified successfully:", decoded);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Token verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token." });
  }
};
