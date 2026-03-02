import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import validator from "validator";

/* ================================
   CREATE USER (INACTIVE)
================================ */

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

    /* ================= VALIDATION ================= */

    // 1. Required fields
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

    // 2. Sanitize strings
    const cleanFirstName = validator.escape(firstName.trim());
    const cleanMiddleName = middleName
      ? validator.escape(middleName.trim())
      : "";
    const cleanLastName = validator.escape(lastName.trim());
    const cleanIdNumber = validator.escape(idNumber.trim());
    const cleanEmail = validator.normalizeEmail(email.trim()) || email.trim();  
 
    const cleanDepartment = validator.escape(department.trim());
    const cleanNotes = notes ? validator.escape(notes.trim()) : "";

    // 3. Validate email format
    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

let cleanPhone = phone.trim().replace(/\s+/g, "");

// If user sends 0912xxxxxxx → convert
if (/^09\d{9}$/.test(cleanPhone)) {
  cleanPhone = "+63" + cleanPhone.slice(1);
}

// If user sends 639xxxxxxxxx → convert
if (/^639\d{9}$/.test(cleanPhone)) {
  cleanPhone = "+" + cleanPhone;
}

// Final strict validation
if (!/^\+639\d{9}$/.test(cleanPhone)) {
  return res.status(400).json({
    message: "Phone must be in format +639XXXXXXXXX.",
  });
}




    // 5. Validate role (prevent role injection)
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

    res.status(201).json({
      message: "User created successfully (inactive).",
    });
 } catch (err) {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

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

  res.status(500).json({
    message: "Server error",
  });
}
};

/* ================================
   SEND CREDENTIALS (ACTIVATE)
================================ */

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

    // ❌ REMOVE MANUAL HASHING
    user.password = tempPassword; // <-- just assign plain

    user.status = "active";
    user.credentialsSent = true;

    await user.save(); // ✅ schema will hash automatically

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

    res.status(200).json({
      message: "Credentials sent and user activated.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ================================
   GET USERS
================================ */

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};


/* ================================
   GET USERS STUDENTS (FOR RECORDS PAGE)
================================ */
export const getStudentUsers = async (req, res) => {
  try {
    const { q = "", status = "All", course = "All" } = req.query;

    // ✅ base filter: Students only
    const filter = { role: "Student" };

    // ✅ optional status filter (maps your UI values to DB)
    // UI: "Active" | "Dropped" | "Graduated" | "All"
    // DB: "active" | "inactive"
    if (status !== "All") {
      if (status === "Active") filter.status = "active";
      else filter.status = "inactive"; // Dropped/Graduated -> treat as inactive unless you add fields
    }

    // ✅ optional search (name or idNumber)
    const search = String(q).trim();
    if (search) {
      filter.$or = [
        { idNumber: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ optional "course" filter
    // NOTE: your UserSchema does NOT have course/section/year.
    // If you want this filter to work, you must add these fields to User or join another collection.
    // For now we ignore course unless you add it.
    // if (course !== "All") filter.course = course;

    const users = await User.find(filter)
      .select("firstName middleName lastName idNumber email status department role")
      .sort({ createdAt: -1 });

    // ✅ map to frontend rows
    const rows = users.map((u) => {
      const fullName = `${u.firstName} ${u.middleName ? u.middleName + " " : ""}${u.lastName}`.trim();
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
        course: u.department || "—", // ✅ placeholder (since User has no course)
        section: "—",               // ✅ placeholder
        year: 0,                    // ✅ placeholder
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

    const { phone, department, status } = req.body;

    const update = {};

    // ✅ Phone validation (same rules you used in createUser)
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

    // ✅ Department sanitize
    if (department !== undefined) {
      const cleanDepartment = validator.escape(String(department).trim());
      if (!cleanDepartment) {
        return res.status(400).json({ message: "Department is required." });
      }
      update.department = cleanDepartment;
    }

    // ✅ Optional: allow status update if you want
    // If you don't want to edit status from UI, you can delete this block.
    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
      }
      update.status = status;
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select(
      "firstName middleName lastName idNumber email phone gender role status department notes createdBy credentialsSent isTemporaryPassword createdAt updatedAt"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User updated successfully.",
      user,
    });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};