import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import validator from "validator";

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
      !idNumber ||
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
    const cleanIdNumber = validator.escape(String(idNumber).trim());
    const cleanEmail =
      validator.normalizeEmail(String(email).trim()) || String(email).trim();
    const cleanDepartment = validator.escape(String(department).trim());
    const cleanNotes = notes ? validator.escape(String(notes).trim()) : "";

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

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    const existingId = await User.findOne({ idNumber: cleanIdNumber });
    if (existingId) {
      return res.status(400).json({
        message: "ID number already exists.",
      });
    }

    // only one department head per department
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

    const user = new User({
      firstName: cleanFirstName,
      middleName: cleanMiddleName,
      lastName: cleanLastName,
      idNumber: cleanIdNumber,
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

    const search = String(q).trim();
    if (search) {
      filter.$or = [
        { idNumber: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("firstName middleName lastName idNumber email status department role")
      .sort({ createdAt: -1 });

    const rows = users.map((u) => {
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