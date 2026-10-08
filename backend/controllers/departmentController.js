import Department from "../models/Department.js";
import User from "../models/User.js";
import { addLog, getClientIp } from "../utils/logActivity.js";

const getRegistrarForLog = async () => {
  const registrar = await User.findOne({ role: "Registrar" }).select("email role");
  return {
    email: registrar?.email || "unknown",
    role: registrar?.role || "Registrar",
  };
};

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
  const ip = getClientIp(req);

  try {
    const { code, name, description, status } = req.body;

    if (!code || !name) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Creation Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: "Department code and name are required.",
        ip,
        status: "warning",
      });

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
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Creation Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: `Invalid department status: ${normalizedStatus}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    const existingCode = await Department.findOne({ code: normalizedCode });
    if (existingCode) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Creation Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: `Duplicate department code: ${normalizedCode}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({
        message: "Department code already exists.",
      });
    }

    const existingName = await Department.findOne({ nameKey: normalizedNameKey });
    if (existingName) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Creation Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: `Duplicate department name: ${normalizedName}`,
        ip,
        status: "warning",
      });

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

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Department Created",
      user: registrar.email,
      role: registrar.role,
     type: "Data",
      details: `Created department ${department.code} - ${department.name}, status ${department.status}`,
      ip,
      status: "success",
    });

    return res.status(201).json({
      message: "Department created successfully.",
      department,
    });
  } catch (error) {
    console.error("createDepartment error:", error);

    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];

      if (field === "code") {
        addLog({
          action: "Department Creation Failed",
          user: registrar.email,
          role: registrar.role,
         type: "Data",
          details: "Department code already exists.",
          ip,
          status: "warning",
        });

        return res.status(400).json({
          message: "Department code already exists.",
        });
      }

      if (field === "nameKey") {
        addLog({
          action: "Department Creation Failed",
          user: registrar.email,
          role: registrar.role,
         type: "Data",
          details: "Department name already exists.",
          ip,
          status: "warning",
        });

        return res.status(400).json({
          message: "Department name already exists.",
        });
      }

      addLog({
        action: "Department Creation Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: "Duplicate department value already exists.",
        ip,
        status: "warning",
      });

      return res.status(400).json({
        message: "Duplicate department value already exists.",
      });
    }

    addLog({
      action: "Department Creation Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: error.message || "Failed to create department.",
      ip,
      status: "error",
    });

    return res.status(500).json({
      message: error.message || "Failed to create department.",
    });
  }
};

export const updateDepartment = async (req, res) => {
  const ip = getClientIp(req);

  try {
    const { id } = req.params;
    const { code, name, description, status } = req.body;

    if (!code || !name) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Update Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: "Department code and name are required.",
        ip,
        status: "warning",
      });

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
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Update Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: `Invalid department status: ${normalizedStatus}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    const department = await Department.findById(id);
    if (!department) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Update Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: `Department not found. ID: ${id}`,
        ip,
        status: "warning",
      });

      return res.status(404).json({ message: "Department not found." });
    }

    const oldCode = department.code;
    const oldName = department.name;
    const oldDescription = department.description || "";
    const oldStatus = department.status;

    const existingCode = await Department.findOne({
      _id: { $ne: id },
      code: normalizedCode,
    });

    if (existingCode) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Update Failed",
        user: registrar.email,
        role: registrar.role,
      type: "Data",
        details: `Duplicate department code: ${normalizedCode}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({
        message: "Department code already exists.",
      });
    }

    const existingName = await Department.findOne({
      _id: { $ne: id },
      nameKey: normalizedNameKey,
    });

    if (existingName) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Update Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: `Duplicate department name: ${normalizedName}`,
        ip,
        status: "warning",
      });

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

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Department Updated",
      user: registrar.email,
      role: registrar.role,
     type: "Data",
      details: `Updated department ${oldCode} -> ${department.code}, ${oldName} -> ${department.name}, Description "${oldDescription}" -> "${department.description || ""}", Status ${oldStatus} -> ${department.status}`,
      ip,
      status: "success",
    });

    return res.json({
      message: "Department updated successfully.",
      department,
    });
  } catch (error) {
    console.error("updateDepartment error:", error);

    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];

      if (field === "code") {
        addLog({
          action: "Department Update Failed",
          user: registrar.email,
          role: registrar.role,
         type: "Data",
          details: "Department code already exists.",
          ip,
          status: "warning",
        });

        return res.status(400).json({
          message: "Department code already exists.",
        });
      }

      if (field === "nameKey") {
        addLog({
          action: "Department Update Failed",
          user: registrar.email,
          role: registrar.role,
         type: "Data",
          details: "Department name already exists.",
          ip,
          status: "warning",
        });

        return res.status(400).json({
          message: "Department name already exists.",
        });
      }
    }

    addLog({
      action: "Department Update Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: error.message || "Failed to update department.",
      ip,
      status: "error",
    });

    return res.status(500).json({
      message: error.message || "Failed to update department.",
    });
  }
};

export const deleteDepartment = async (req, res) => {
  const ip = getClientIp(req);

  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Department Delete Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: `Department not found. ID: ${id}`,
        ip,
        status: "warning",
      });

      return res.status(404).json({ message: "Department not found." });
    }

    const deptCode = department.code;
    const deptName = department.name;
    const deptStatus = department.status;

    await Department.findByIdAndDelete(id);

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Department Deleted",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Deleted department ${deptCode} - ${deptName}, previous status ${deptStatus}`,
      ip,
      status: "success",
    });

    return res.json({ message: "Department deleted successfully." });
  } catch (error) {
    console.error("deleteDepartment error:", error);

    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    addLog({
      action: "Department Delete Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: error.message || "Failed to delete department.",
      ip,
      status: "error",
    });

    return res.status(500).json({
      message: error.message || "Failed to delete department.",
    });
  }
};