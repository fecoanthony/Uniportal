// controllers/sessionController.js
import Session from "../models/Session.Model.js";

/**
 * GET /api/sessions/active
 * Returns the currently active session (isActive === true).
 * If none, returns 404 with a helpful message.
 */
export const getActiveSession = async (req, res) => {
  try {
    const session = await Session.findOne({ isActive: true }).lean();
    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }
    return res.json(session);
  } catch (err) {
    console.error("getActiveSession error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
