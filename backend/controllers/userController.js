import User from "../models/User.js";
import Student from "../models/Student.js";
import sendEmail from "../utils/sendEmail.js";
import validator from "validator";
import { generateId, peekNextId } from "../utils/generateId.js";

function getUserIdChecks() {
  return [
    { model: User, field: "idNumber" },
    { model: Student, field: "studentIdNumber" },
  ];
}

export const reserveUserId = async (req, res) => {
  try {
    const { role } = req.query;

    const allowedRoles = ["Registrar", "Dept Head", "Finance"];

    if (!role || !allowedRoles.includes(String(role))) {
      return res.status(400).json({
        message: "A valid role is required.",
      });
    }

    const idNumber = await peekNextId({
      prefix: "GIP",
      scope: "user",
      checks: getUserIdChecks(),
      startAt: 1,
    });

    return res.status(200).json({ idNumber });
  } catch (err) {
    console.error("reserveUserId preview error:", err);
    return res.status(500).json({
      message: err.message || "Failed to preview user ID.",
    });
  }
};

export const reserveFacultyId = async (_req, res) => {
  try {
    const idNumber = await peekNextId({
      prefix: "GIP",
      scope: "faculty",
      checks: getUserIdChecks(),
      startAt: 1,
    });

    return res.status(200).json({ idNumber });
  } catch (err) {
    console.error("reserveFacultyId preview error:", err);
    return res.status(500).json({
      message: err.message || "Failed to preview faculty ID.",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      idNumber,
      email,
      phone,
      gender,
      role,
      department,
      notes,
      createdBy = "SuperAdmin",
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !gender ||
      !role ||
      !department
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const cleanFirstName = validator.escape(String(firstName).trim());
    const cleanMiddleName = middleName
      ? validator.escape(String(middleName).trim())
      : "";
    const cleanLastName = validator.escape(String(lastName).trim());
    const cleanEmail =
      validator.normalizeEmail(String(email).trim()) || String(email).trim();
    const cleanDepartment = validator.escape(String(department).trim());
    const cleanNotes = notes ? validator.escape(String(notes).trim()) : "";

    const currentYear = new Date().getFullYear();
    const previewId = idNumber ? validator.escape(String(idNumber).trim()) : "";

    if (previewId && !new RegExp(`^GIP-${currentYear}-\\d{3}$`).test(previewId)) {
      return res.status(400).json({
        message: `ID number must follow the format GIP-${currentYear}-###.`,
      });
    }

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    let cleanPhone = String(phone).trim().replace(/\s+/g, "");

    if (/^09\d{9}$/.test(cleanPhone)) {
      cleanPhone = "+63" + cleanPhone.slice(1);
    }

    if (/^639\d{9}$/.test(cleanPhone)) {
      cleanPhone = "+" + cleanPhone;
    }

    if (!/^\+639\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        message: "Phone must be in format +639XXXXXXXXX.",
      });
    }

    const allowedRoles = [
      "Faculty",
      "Student",
      "Registrar",
      "Dept Head",
      "Finance",
      "Super Admin",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    if (role === "Registrar") {
      const existingRegistrar = await User.findOne({ role: "Registrar" });

      if (existingRegistrar) {
        return res.status(400).json({
          message: "A Registrar account already exists.",
        });
      }

      if (cleanDepartment !== "Registrar Office") {
        return res.status(400).json({
          message: "Registrar role must be assigned to Registrar Office.",
        });
      }
    }

    if (role === "Finance" && cleanDepartment !== "Finance Office") {
      return res.status(400).json({
        message: "Finance role must be assigned to Finance Office.",
      });
    }

    if (role === "Dept Head") {
      if (
        cleanDepartment === "Registrar Office" ||
        cleanDepartment === "Finance Office"
      ) {
        return res.status(400).json({
          message:
            "Department Head cannot be assigned to Registrar or Finance Office.",
        });
      }
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    if (role === "Dept Head") {
      const existingDeptHead = await User.findOne({
        role: "Dept Head",
        department: cleanDepartment,
      });

      if (existingDeptHead) {
        return res.status(400).json({
          message: `A Department Head already exists for ${cleanDepartment}.`,
        });
      }
    }

    const idScope = role === "Faculty" ? "faculty" : "user";

    let finalIdNumber = await generateId({
      prefix: "GIP",
      scope: idScope,
      checks: getUserIdChecks(),
      startAt: 1,
    });

    const user = new User({
      firstName: cleanFirstName,
      middleName: cleanMiddleName,
      lastName: cleanLastName,
      idNumber: finalIdNumber,
      email: cleanEmail,
      phone: cleanPhone,
      gender,
      role,
      department: cleanDepartment,
      status: "inactive",
      notes: cleanNotes,
      password: "TEMP_LOCKED",
      credentialsSent: false,
      createdBy,
    });

    await user.save();

    return res.status(201).json({
      message: "User created successfully (inactive).",
      user,
      idNumber: finalIdNumber,
    });
  } catch (err) {
    console.error("createUser error:", err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];

      const formattedField =
        field === "email"
          ? "Email"
          : field === "idNumber"
            ? "ID number"
            : field;

      return res.status(400).json({
        message: `${formattedField} already exists.`,
      });
    }

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

function generateTempPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

export const sendCredentials = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credentialsSent) {
      return res.status(400).json({
        message: "Credentials already sent.",
      });
    }

    const tempPassword = generateTempPassword(10);

    user.password = tempPassword;
    user.status = "active";
    user.credentialsSent = true;

    await user.save();

    const fullName = `${user.firstName} ${
      user.middleName ? user.middleName + " " : ""
    }${user.lastName}`;

    const appName = process.env.APP_NAME || "CVAI Portal";

    const emailHtml = `
      <h2>Welcome to ${appName}</h2>
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>Your account has been activated.</p>
      <p><strong>ID Number:</strong> ${user.idNumber}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password immediately.</p>
    `;

    await sendEmail(
      user.email,
      `Your Login Credentials - ${appName}`,
      emailHtml,
    );

    return res.status(200).json({
      message: "Credentials sent and user activated.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getStudentUsers = async (req, res) => {
  try {
    const { q = "", status = "All" } = req.query;

    const filter = { role: "Student" };

    if (status !== "All") {
      if (status === "Active") filter.status = "active";
      else filter.status = "inactive";
    }

    const docs = await User.find(filter)
      .select(
        "firstName middleName lastName idNumber email status department role",
      )
      .sort({ createdAt: -1 });

    const users = docs.map((doc) => doc.toObject({ getters: true }));

    const search = String(q).trim().toLowerCase();

    const filteredUsers = !search
      ? users
      : users.filter((u) => {
          const fullName = `${u.firstName} ${
            u.middleName ? u.middleName + " " : ""
          }${u.lastName}`.trim();

          return (
            String(u.idNumber || "").toLowerCase().includes(search) ||
            String(u.firstName || "").toLowerCase().includes(search) ||
            String(u.lastName || "").toLowerCase().includes(search) ||
            String(u.email || "").toLowerCase().includes(search) ||
            fullName.toLowerCase().includes(search)
          );
        });

    const rows = filteredUsers.map((u) => {
      const fullName = `${u.firstName} ${
        u.middleName ? u.middleName + " " : ""
      }${u.lastName}`.trim();

      const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase())
        .join("");

      return {
        id: u.idNumber,
        initials,
        name: fullName,
        email: u.email,
        course: u.department || "—",
        section: "—",
        year: 0,
        status: u.status === "active" ? "Active" : "Dropped",
      };
    });

    return res.json(rows);
  } catch (err) {
    console.error("getStudentUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "firstName middleName lastName idNumber email phone gender role status department notes createdBy credentialsSent isTemporaryPassword createdAt updatedAt"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, department, status, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const update = {};

    if (phone !== undefined) {
      let cleanPhone = String(phone).trim().replace(/\s+/g, "");

      if (/^09\d{9}$/.test(cleanPhone)) {
        cleanPhone = "+63" + cleanPhone.slice(1);
      }
      if (/^639\d{9}$/.test(cleanPhone)) {
        cleanPhone = "+" + cleanPhone;
      }
      if (!/^\+639\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          message: "Phone must be in format +639XXXXXXXXX.",
        });
      }

      update.phone = cleanPhone;
    }

    let cleanDepartment = user.department;
    if (department !== undefined) {
      cleanDepartment = validator.escape(String(department).trim());
      if (!cleanDepartment) {
        return res.status(400).json({ message: "Department is required." });
      }
      update.department = cleanDepartment;
    }

    let nextRole = user.role;
    if (role !== undefined) {
      const allowedRoles = [
        "Faculty",
        "Student",
        "Registrar",
        "Dept Head",
        "Finance",
        "Super Admin",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role selected." });
      }

      if (role === "Registrar") {
        const existingRegistrar = await User.findOne({
          _id: { $ne: id },
          role: "Registrar",
        });

        if (existingRegistrar) {
          return res.status(400).json({
            message: "A Registrar account already exists.",
          });
        }

        if (cleanDepartment !== "Registrar Office") {
          return res.status(400).json({
            message: "Registrar role must be assigned to Registrar Office.",
          });
        }
      }

      if (role === "Finance" && cleanDepartment !== "Finance Office") {
        return res.status(400).json({
          message: "Finance role must be assigned to Finance Office.",
        });
      }

      if (
        role === "Dept Head" &&
        (cleanDepartment === "Registrar Office" ||
          cleanDepartment === "Finance Office")
      ) {
        return res.status(400).json({
          message: "Department Head cannot be assigned to Registrar or Finance Office.",
        });
      }

      nextRole = role;
      update.role = role;
    }

    if (nextRole === "Dept Head") {
      const existingDeptHead = await User.findOne({
        _id: { $ne: id },
        role: "Dept Head",
        department: cleanDepartment,
      });

      if (existingDeptHead) {
        return res.status(400).json({
          message: `A Department Head already exists for ${cleanDepartment}.`,
        });
      }
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
      }
      update.status = status;
    }

    const updatedUser = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select(
      "firstName middleName lastName idNumber email phone gender role status department notes createdBy credentialsSent isTemporaryPassword createdAt updatedAt"
    );

    return res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const updateUserContactInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const update = {};

    if (email !== undefined) {
      const cleanEmail =
        validator.normalizeEmail(String(email).trim()) || String(email).trim();

      if (!validator.isEmail(cleanEmail)) {
        return res.status(400).json({ message: "Invalid email format." });
      }

      const existingEmail = await User.findOne({
        _id: { $ne: id },
        email: cleanEmail,
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists." });
      }

      update.email = cleanEmail;
    }

    if (phone !== undefined) {
      let cleanPhone = String(phone).trim().replace(/\s+/g, "");

      if (/^09\d{9}$/.test(cleanPhone)) {
        cleanPhone = "+63" + cleanPhone.slice(1);
      }

      if (/^639\d{9}$/.test(cleanPhone)) {
        cleanPhone = "+" + cleanPhone;
      }

      if (!/^\+639\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          message: "Phone must be in format +639XXXXXXXXX.",
        });
      }

      update.phone = cleanPhone;
    }

    const updatedUser = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select(
      "firstName middleName lastName idNumber email phone gender role status department notes createdBy credentialsSent isTemporaryPassword createdAt updatedAt"
    );

    return res.status(200).json({
      message: "User contact info updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("updateUserContactInfo error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getRegistrarByRole = async (_req, res) => {
  try {
    const registrar = await User.findOne({ role: "Registrar" }).select(
      "firstName middleName lastName email role"
    );

    if (!registrar) {
      return res.status(404).json({ message: "Registrar account not found." });
    }

    return res.status(200).json({
      _id: registrar._id,
      firstName: registrar.firstName,
      middleName: registrar.middleName,
      lastName: registrar.lastName,
      email: registrar.email,
      user: registrar.email,
      role: registrar.role,
    });
  } catch (err) {
    console.error("getRegistrarByRole error:", err);
    return res.status(500).json({
      message: "Failed to fetch registrar account.",
    });
  }
};

export const getPortalStatuses = async (_req, res) => {
  try {
    const users = await User.find().select("role status isOnline lastSeenAt");

    const ONLINE_WINDOW_MS = 2 * 60 * 1000;
    const now = Date.now();

    const portalMap = [
      { role: "Student", name: "Student Portal" },
      { role: "Faculty", name: "Faculty Portal" },
      { role: "Registrar", name: "Registrar Portal" },
      { role: "Finance", name: "Finance Portal" },
      { role: "Dept Head", name: "Dept Head Portal" },
    ];

    const portals = portalMap.map(({ role, name }) => {
      const roleUsers = users.filter(
        (u) => u.role === role && u.status === "active"
      );

      const onlineUsers = roleUsers.filter((u) => {
        if (!u.lastSeenAt) return false;
        return now - new Date(u.lastSeenAt).getTime() <= ONLINE_WINDOW_MS;
      });

      return {
        name,
        users: roleUsers.length,
        onlineUsers: onlineUsers.length,
        status: onlineUsers.length > 0 ? "online" : "offline",
      };
    });

    return res.status(200).json(portals);
  } catch (err) {
    console.error("getPortalStatuses error:", err);
    return res.status(500).json({
      message: "Failed to fetch portal statuses",
    });
  }
};