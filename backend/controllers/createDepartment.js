import Department from "../models/Department.Model.js";
// import AuditLog from "../models/AuditLog.js"; // optional

export const createDepartment = async (req, res) => {
  try {
    const { name, description = "" } = req.body;

    // Basic server-side validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }

    const cleanName = name.trim();

    // Check for duplicates (case-insensitive)
    const existing = await Department.findOne({
      name: new RegExp(`^${cleanName}$`, "i"),
    });
    if (existing) {
      return res.status(409).json({ message: "Department already exists" });
    }

    // Create department
    const dept = await Department.create({ name: cleanName, description });

    // Optional: write audit log (who created it)
    if (req.user && req.user.userId) {
      try {
        await AuditLog.create({
          actor_id: req.user.userId,
          action: "CREATE_DEPARTMENT",
          target: dept._id,
          details: { name: dept.name },
          timestamp: new Date(),
        });
      } catch (err) {
        // Audit failure should not block creation — just log
        console.warn("AuditLog create failed:", err.message);
      }
    }

    // Return created department
    return res
      .status(201)
      .json({ message: "Department created", department: dept });
  } catch (err) {
    console.error("createDepartment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
