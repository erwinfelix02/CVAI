import Department from "../models/Department.js";
import User from "../models/User.js";

export const getDepartments = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = String(status).trim();
    }

    const departments = await Department.find(filter).sort({ createdAt: -1 });

    const result = await Promise.all(
      departments.map(async (dept) => {
        const headUser = await User.findOne({
          role: "Dept Head",
          status: "active",
          $or: [{ department: dept.name }, { department: dept.code }],
        }).select("firstName middleName lastName");

        const head = headUser
          ? [headUser.firstName, headUser.middleName, headUser.lastName]
              .filter(Boolean)
              .join(" ")
          : "Not assigned yet";

        return {
          _id: dept._id,
          code: dept.code,
          name: dept.name,
          description: dept.description,
          status: dept.status,
          head,
        };
      })
    );

    return res.json(result);
  } catch (error) {
    console.error("getDepartments error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch departments.",
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { code, name, description, status } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        message: "Department code and name are required.",
      });
    }

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
    const normalizedNameKey = normalizedName.toLowerCase();
    const normalizedDescription = String(description || "").trim();
    const normalizedStatus = String(status || "Active").trim();

    if (!["Active", "Inactive"].includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    const existingCode = await Department.findOne({ code: normalizedCode });
    if (existingCode) {
      return res.status(400).json({
        message: "Department code already exists.",
      });
    }

    const existingName = await Department.findOne({ nameKey: normalizedNameKey });
    if (existingName) {
      return res.status(400).json({
        message: "Department name already exists.",
      });
    }

    const department = await Department.create({
      code: normalizedCode,
      name: normalizedName,
      nameKey: normalizedNameKey,
      description: normalizedDescription,
      status: normalizedStatus,
    });

    return res.status(201).json({
      message: "Department created successfully.",
      department,
    });
  } catch (error) {
    console.error("createDepartment error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];

      if (field === "code") {
        return res.status(400).json({
          message: "Department code already exists.",
        });
      }

      if (field === "nameKey") {
        return res.status(400).json({
          message: "Department name already exists.",
        });
      }

      return res.status(400).json({
        message: "Duplicate department value already exists.",
      });
    }

    return res.status(500).json({
      message: error.message || "Failed to create department.",
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, status } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        message: "Department code and name are required.",
      });
    }

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
    const normalizedNameKey = normalizedName.toLowerCase();
    const normalizedDescription = String(description || "").trim();
    const normalizedStatus = String(status || "Active").trim();

    if (!["Active", "Inactive"].includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    const existingCode = await Department.findOne({
      _id: { $ne: id },
      code: normalizedCode,
    });

    if (existingCode) {
      return res.status(400).json({
        message: "Department code already exists.",
      });
    }

    const existingName = await Department.findOne({
      _id: { $ne: id },
      nameKey: normalizedNameKey,
    });

    if (existingName) {
      return res.status(400).json({
        message: "Department name already exists.",
      });
    }

    department.code = normalizedCode;
    department.name = normalizedName;
    department.nameKey = normalizedNameKey;
    department.description = normalizedDescription;
    department.status = normalizedStatus;

    await department.save();

    return res.json({
      message: "Department updated successfully.",
      department,
    });
  } catch (error) {
    console.error("updateDepartment error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];

      if (field === "code") {
        return res.status(400).json({
          message: "Department code already exists.",
        });
      }

      if (field === "nameKey") {
        return res.status(400).json({
          message: "Department name already exists.",
        });
      }
    }

    return res.status(500).json({
      message: error.message || "Failed to update department.",
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    await Department.findByIdAndDelete(id);

    return res.json({ message: "Department deleted successfully." });
  } catch (error) {
    console.error("deleteDepartment error:", error);
    return res.status(500).json({
      message: error.message || "Failed to delete department.",
    });
  }
};