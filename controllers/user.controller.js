import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| GET USERS (ADMIN ONLY)
| URL: /api/users
| Query: ?role=teacher | ?role=ro
|--------------------------------------------------------------------------
*/
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    // Agar role diya hai to filter, warna sab users
    const filter = role ? { role } : {};

    // Sensitive fields nahi bhejne
    const users = await User.find(filter).select(
      "_id email role"
    );

    res.json(users);
  } catch (error) {
    console.error("❌ Get Users Error:", error);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};
