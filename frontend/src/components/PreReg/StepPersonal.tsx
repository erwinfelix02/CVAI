import {
  UserCircle,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  MapPin,
  VenusAndMars,
  Search,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PersonalInfo } from "../../pages/PreReg/StudentPreRegistrationPage";

type Errors = Partial<Record<keyof PersonalInfo, string>>;

type Touched = Partial<Record<keyof PersonalInfo, boolean>>;

/* =========================================================
   PHILIPPINE ADDRESS TYPES
========================================================= */

type PSGCItem = {
  code: string;
  name: string;

  oldName?: string;

  zip_code?: string;
  postalCode?: string;
  postal_code?: string;
};

/* =========================================================
   PSGC API
========================================================= */

const PSGC_API = "https://psgc.cloud/api";

/* =========================================================
   COMPONENT
========================================================= */

export default function StepPersonal({
  value,
  onChange,
  submitted,
  errors: externalErrors,
}: {
  value: PersonalInfo;
  onChange: (v: PersonalInfo) => void;
  submitted: boolean;
  errors: Errors;
}) {
  const [localErrors, setLocalErrors] = useState<Errors>({});

  const [touched, setTouched] = useState<Touched>({});

  /* =========================================================
     ADDRESS SEARCH STATE
  ========================================================== */

  const [addressSearch, setAddressSearch] = useState("");

  const [provinces, setProvinces] = useState<PSGCItem[]>([]);

  const [municipalities, setMunicipalities] = useState<PSGCItem[]>([]);

  const [barangays, setBarangays] = useState<PSGCItem[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<PSGCItem | null>(
    null,
  );

  const [selectedMunicipality, setSelectedMunicipality] =
    useState<PSGCItem | null>(null);

  const [selectedBarangay, setSelectedBarangay] = useState<PSGCItem | null>(
    null,
  );

  const [postalCode, setPostalCode] = useState("");

  const [addressLoading, setAddressLoading] = useState(false);

  const [postalCodeLoading, setPostalCodeLoading] = useState(false);

  const [addressError, setAddressError] = useState("");

  const [postalCodeError, setPostalCodeError] = useState("");

  const [showAddressSearch, setShowAddressSearch] = useState(false);

  /*
   * Prevent the restore process from
   * running repeatedly.
   */
  const hasRestoredAddress = useRef(false);

  /*
   * Prevent generatedAddress from
   * overwriting an address while the
   * PSGC hierarchy is being restored.
   */
  const restoringAddress = useRef(false);

  /* =========================================================
     SANITIZE HELPERS
  ========================================================== */

  const normalizeText = (v: string) =>
    v
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const hasDangerChars = (v: string) => /[<>$`{};]/.test(v);

  const sanitizeName = (v: string) => {
    let s = normalizeText(v);

    s = s.replace(/["\\]/g, "");

    return s.slice(0, 50);
  };

  const sanitizeEmail = (v: string) => normalizeText(v).slice(0, 120);

  const sanitizePhone = (v: string) => {
    const raw = String(v || "");

    let digits = raw.replace(/\D/g, "");

    if (!digits) return "";

    if (digits.startsWith("639")) {
      digits = digits.slice(3);
    } else if (digits.startsWith("09")) {
      digits = digits.slice(1);
    } else if (digits.startsWith("63")) {
      digits = digits.slice(2);
    }

    digits = digits.slice(0, 9);

    return digits ? `+639${digits}` : "+639";
  };

  const capitalizeWords = (val: string) =>
    val.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  /* =========================================================
     VALIDATION
  ========================================================== */

  const isValidEmail = (raw: string) => {
    const v = raw.trim();

    if (!v || v.length > 120) return false;

    if (/\s/.test(v)) return false;

    if (v.includes("..")) return false;

    const parts = v.split("@");

    if (parts.length !== 2) return false;

    const [local, domain] = parts;

    if (!local || local.length > 64) {
      return false;
    }

    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) {
      return false;
    }

    if (local.startsWith(".") || local.endsWith(".")) {
      return false;
    }

    if (!domain || domain.length > 255) {
      return false;
    }

    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return false;
    }

    if (!domain.includes(".")) return false;

    if (domain.startsWith("-") || domain.endsWith("-")) {
      return false;
    }

    const labels = domain.split(".");

    if (labels.some((x) => !x || x.length > 63)) {
      return false;
    }

    if (labels.some((x) => x.startsWith("-") || x.endsWith("-"))) {
      return false;
    }

    const tld = labels[labels.length - 1];

    if (!/^[a-zA-Z]{2,}$/.test(tld)) {
      return false;
    }

    return true;
  };

  const isValidPHPhone = (v: string) => /^\+639\d{9}$/.test(v.trim());

  const isValidName = (v: string) => /^[a-zA-Z\s'.-]+$/.test(v.trim());

  const calculateAge = (dateStr: string) => {
    const birth = new Date(dateStr);

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const validateField = (key: keyof PersonalInfo, rawVal: any) => {
    const val = typeof rawVal === "string" ? rawVal : "";

    if (hasDangerChars(val)) {
      return "Invalid characters detected.";
    }

    switch (key) {
      case "firstName":
        if (!val.trim()) return "First name is required.";

        if (val.length < 2) return "Minimum 2 characters.";

        if (!isValidName(val)) return "Invalid characters.";

        break;

      case "lastName":
        if (!val.trim()) return "Last name is required.";

        if (val.length < 2) return "Minimum 2 characters.";

        if (!isValidName(val)) return "Invalid characters.";

        break;

      case "email":
        if (!val.trim()) return "Email is required.";

        if (!isValidEmail(val)) {
          return "Enter a valid email (e.g. name@gmail.com).";
        }

        break;

      case "phone":
        if (!val.trim()) return "Phone number is required.";

        if (!isValidPHPhone(val)) return "Format: +639XXXXXXXXX.";

        break;

      case "birthDate":
        if (!val.trim()) return "Birth date is required.";

        if (calculateAge(val) < 15) return "Minimum age is 15.";

        break;

      case "gender":
        if (!val.trim()) return "Please select gender.";

        break;

      case "address":
        /*
         * Postal code is OPTIONAL.
         *
         * Only the actual PSGC hierarchy is required.
         */
        if (!val.trim()) {
          return "Please select your complete address.";
        }

        if (
          !value.barangay ||
          !value.municipality ||
          !value.province ||
          !value.provinceCode ||
          !value.municipalityCode ||
          !value.barangayCode
        ) {
          return "Please select a complete address.";
        }

        /*
         * DO NOT check value.postalCode here.
         *
         * Some locations do not have postal
         * information available through the API.
         */
        break;
    }

    return "";
  };

  const validateAll = () => {
    const newErrors: Errors = {};

    (Object.keys(value) as (keyof PersonalInfo)[]).forEach((k) => {
      /*
       * These fields are address components
       * and are validated through "address".
       */
      if (
        k === "barangay" ||
        k === "municipality" ||
        k === "province" ||
        k === "postalCode" ||
        k === "provinceCode" ||
        k === "municipalityCode" ||
        k === "barangayCode" ||
        k === "middleName"
      ) {
        return;
      }

      const msg = validateField(k, (value as any)[k] ?? "");

      if (msg) {
        newErrors[k] = msg;
      }
    });

    /*
     * Address needs to be validated separately
     * because it represents the entire PSGC hierarchy.
     */
    const addressMessage = validateField("address", value.address ?? "");

    if (addressMessage) {
      newErrors.address = addressMessage;
    }

    setLocalErrors(newErrors);
  };

  useEffect(() => {
    if (submitted) {
      validateAll();
    }
  }, [submitted]);

  /* =========================================================
     GENERATE DISPLAY ADDRESS
  ========================================================== */

  const generatedAddress = useMemo(() => {
    const parts = [
      value.barangay,
      value.municipality,
      value.province,
      value.postalCode ? `Postal Code ${value.postalCode}` : "",
    ].filter(Boolean);

    return parts.join(", ");
  }, [value.barangay, value.municipality, value.province, value.postalCode]);

  /* =========================================================
     KEEP GENERATED ADDRESS IN PARENT
  ========================================================== */

  useEffect(() => {
    /*
     * Do not interfere while restoring
     * the selected address hierarchy.
     */
    if (restoringAddress.current) {
      return;
    }

    if (!generatedAddress) {
      if (value.address) {
        onChange({
          ...value,
          address: "",
        });
      }

      return;
    }

    if (value.address !== generatedAddress) {
      onChange({
        ...value,
        address: generatedAddress,
      });
    }
  }, [generatedAddress, value.address]);

  /* =========================================================
     LOAD PROVINCES
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProvinces() {
      try {
        setAddressLoading(true);
        setAddressError("");

        const res = await fetch(`${PSGC_API}/provinces`);

        if (!res.ok) {
          throw new Error("Unable to load provinces.");
        }

        const data = await res.json();

        if (!cancelled) {
          setProvinces(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setAddressError(
            "Unable to load Philippine addresses. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setAddressLoading(false);
        }
      }
    }

    loadProvinces();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     RESTORE SAVED ADDRESS
     
     THIS IS THE MAIN FIX.
  ========================================================== */

  useEffect(() => {
    /*
     * Wait until provinces are loaded.
     */
    if (!provinces.length) {
      return;
    }

    /*
     * Do not restore more than once
     * for this component instance.
     */
    if (hasRestoredAddress.current) {
      return;
    }

    /*
     * If there is no saved address,
     * there is nothing to restore.
     */
    if (!value.provinceCode || !value.municipalityCode || !value.barangayCode) {
      hasRestoredAddress.current = true;

      return;
    }

    const savedProvince = provinces.find((p) => p.code === value.provinceCode);

    if (!savedProvince) {
      /*
       * Fallback to province name
       * in case old data has no matching code.
       */
      const provinceByName = provinces.find(
        (p) => p.name.toLowerCase() === (value.province || "").toLowerCase(),
      );

      if (!provinceByName) {
        hasRestoredAddress.current = true;

        return;
      }

      void restoreAddress(provinceByName);

      return;
    }

    void restoreAddress(savedProvince);
  }, [
    provinces,
    value.provinceCode,
    value.municipalityCode,
    value.barangayCode,
  ]);

  /* =========================================================
     RESTORE ADDRESS HIERARCHY
  ========================================================== */

  async function restoreAddress(province: PSGCItem) {
    if (!value.municipalityCode || !value.barangayCode) {
      return;
    }

    try {
      restoringAddress.current = true;

      setAddressLoading(true);
      setAddressError("");

      /*
       * Restore province.
       */
      setSelectedProvince(province);

      /*
       * Load municipalities.
       */
      const municipalityRes = await fetch(
        `${PSGC_API}/provinces/${province.code}/cities-municipalities`,
      );

      if (!municipalityRes.ok) {
        throw new Error("Unable to restore municipalities.");
      }

      const municipalityData = await municipalityRes.json();

      const municipalityList: PSGCItem[] = Array.isArray(municipalityData)
        ? municipalityData
        : [];

      setMunicipalities(municipalityList);

      /*
       * Find the previously selected municipality.
       */
      let municipality = municipalityList.find(
        (m) => m.code === value.municipalityCode,
      );

      /*
       * Fallback by name for existing
       * records created before PSGC
       * codes were added.
       */
      if (!municipality) {
        municipality = municipalityList.find(
          (m) =>
            m.name.toLowerCase() === (value.municipality || "").toLowerCase(),
        );
      }

      if (!municipality) {
        throw new Error("Saved municipality could not be found.");
      }

      setSelectedMunicipality(municipality);

      /*
       * Restore postal code immediately
       * from the saved parent value.
       */
      const savedPostal = value.postalCode || getPostalCode(municipality);

      setPostalCode(savedPostal);

      /*
       * Load barangays.
       */
      const barangayRes = await fetch(
        `${PSGC_API}/cities-municipalities/${municipality.code}/barangays`,
      );

      if (!barangayRes.ok) {
        throw new Error("Unable to restore barangays.");
      }

      const barangayData = await barangayRes.json();

      const barangayList: PSGCItem[] = Array.isArray(barangayData)
        ? barangayData
        : [];

      setBarangays(barangayList);

      /*
       * Find saved barangay.
       */
      let barangay = barangayList.find((b) => b.code === value.barangayCode);

      /*
       * Fallback by name.
       */
      if (!barangay) {
        barangay = barangayList.find(
          (b) => b.name.toLowerCase() === (value.barangay || "").toLowerCase(),
        );
      }

      if (!barangay) {
        throw new Error("Saved barangay could not be found.");
      }

      setSelectedBarangay(barangay);

      /*
       * Restore postal code.
       */
      const finalPostalCode =
        getPostalCode(barangay) || savedPostal || getPostalCode(municipality);

      setPostalCode(finalPostalCode);

      /*
       * Rebuild the address.
       */
      const restoredAddress = [
        barangay.name,
        municipality.name,
        province.name,
        finalPostalCode ? `Postal Code ${finalPostalCode}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      /*
       * IMPORTANT:
       * Put everything back into the
       * parent state.
       */
      onChange({
        ...value,

        address: restoredAddress,

        barangay: barangay.name,

        municipality: municipality.name,

        province: province.name,

        postalCode: finalPostalCode,

        provinceCode: province.code,

        municipalityCode: municipality.code,

        barangayCode: barangay.code,
      });

      setLocalErrors((prev) => ({
        ...prev,
        address: "",
      }));

      setTouched((prev) => ({
        ...prev,
        address: true,
      }));

      setShowAddressSearch(false);

      hasRestoredAddress.current = true;
    } catch (error) {
      console.error("Failed to restore saved address:", error);

      setAddressError(
        "Unable to restore your saved address. Please select it again.",
      );

      /*
       * Do not permanently mark it restored
       * when restoration fails.
       */
      hasRestoredAddress.current = false;
    } finally {
      restoringAddress.current = false;

      setAddressLoading(false);
    }
  }

  /* =========================================================
     SEARCH PROVINCES
  ========================================================== */

  const filteredProvinces = useMemo(() => {
    const search = addressSearch.trim().toLowerCase();

    if (!search) {
      return provinces.slice(0, 20);
    }

    return provinces
      .filter((province) => province.name.toLowerCase().includes(search))
      .slice(0, 20);
  }, [provinces, addressSearch]);

  /* =========================================================
     GET POSTAL CODE
  ========================================================== */

  function getPostalCode(item: PSGCItem): string {
    const code = item.zip_code || item.postalCode || item.postal_code || "";

    return String(code).trim();
  }

  /* =========================================================
     AUTOMATIC POSTAL CODE LOOKUP
  ========================================================== */

  async function fetchPostalCode(municipality: PSGCItem) {
    try {
      setPostalCodeLoading(true);

      setPostalCodeError("");

      let detected = getPostalCode(municipality);

      if (!detected) {
        try {
          const res = await fetch(
            `${PSGC_API}/municipalities/${municipality.code}`,
          );

          if (res.ok) {
            const detail = await res.json();

            const item = detail?.data || detail;

            detected = getPostalCode(item as PSGCItem);
          }
        } catch (detailError) {
          console.warn("Detailed postal code lookup failed:", detailError);
        }
      }

      if (detected) {
        setPostalCode(detected);

        setPostalCodeError("");

        onChange({
          ...value,
          postalCode: detected,
        });

        return;
      }

      setPostalCode("");

      setPostalCodeError(
        "Postal code is not available from the address database for this municipality.",
      );
    } catch (error) {
      console.error("Postal code lookup failed:", error);

      setPostalCode("");

      setPostalCodeError("Unable to automatically detect the postal code.");
    } finally {
      setPostalCodeLoading(false);
    }
  }

  /* =========================================================
     SELECT PROVINCE
  ========================================================== */

  async function selectProvince(province: PSGCItem) {
    try {
      /*
       * A new selection means this is
       * no longer the restoration process.
       */
      hasRestoredAddress.current = true;

      setAddressLoading(true);

      setAddressError("");
      setPostalCodeError("");

      setSelectedProvince(province);

      setSelectedMunicipality(null);

      setSelectedBarangay(null);

      setMunicipalities([]);
      setBarangays([]);

      setPostalCode("");

      onChange({
        ...value,

        address: "",

        barangay: "",

        municipality: "",

        province: province.name,

        postalCode: "",

        provinceCode: province.code,

        municipalityCode: "",

        barangayCode: "",
      });

      const res = await fetch(
        `${PSGC_API}/provinces/${province.code}/cities-municipalities`,
      );

      if (!res.ok) {
        throw new Error("Unable to load municipalities.");
      }

      const data = await res.json();

      setMunicipalities(Array.isArray(data) ? data : []);

      setAddressSearch("");
      setShowAddressSearch(false);
    } catch (error) {
      console.error(error);

      setAddressError("Unable to load municipalities for this province.");
    } finally {
      setAddressLoading(false);
    }
  }

  /* =========================================================
     SELECT MUNICIPALITY
  ========================================================== */

  async function selectMunicipality(municipality: PSGCItem) {
    if (!selectedProvince) return;

    try {
      setAddressLoading(true);

      setAddressError("");
      setPostalCodeError("");

      setSelectedMunicipality(municipality);

      setSelectedBarangay(null);

      setBarangays([]);

      const municipalityZip = getPostalCode(municipality);

      setPostalCode(municipalityZip);

      onChange({
        ...value,

        address: "",

        barangay: "",

        municipality: municipality.name,

        province: selectedProvince.name,

        postalCode: municipalityZip,

        provinceCode: selectedProvince.code,

        municipalityCode: municipality.code,

        barangayCode: "",
      });

      const res = await fetch(
        `${PSGC_API}/cities-municipalities/${municipality.code}/barangays`,
      );

      if (!res.ok) {
        throw new Error("Unable to load barangays.");
      }

      const data = await res.json();

      setBarangays(Array.isArray(data) ? data : []);

      if (!municipalityZip) {
        void fetchPostalCode(municipality);
      }
    } catch (error) {
      console.error(error);

      setAddressError("Unable to load barangays for this municipality.");
    } finally {
      setAddressLoading(false);
    }
  }

  /* =========================================================
     SELECT BARANGAY
  ========================================================== */

  function selectBarangay(barangay: PSGCItem) {
    if (!selectedProvince || !selectedMunicipality) {
      return;
    }

    setSelectedBarangay(barangay);

    const detectedPostalCode =
      getPostalCode(barangay) ||
      postalCode ||
      getPostalCode(selectedMunicipality);

    setPostalCode(detectedPostalCode);

    const address = [
      barangay.name,
      selectedMunicipality.name,
      selectedProvince.name,
      detectedPostalCode ? `Postal Code ${detectedPostalCode}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    /*
     * SAVE BOTH DISPLAY VALUES
     * AND PSGC CODES.
     */
    onChange({
      ...value,

      address,

      barangay: barangay.name,

      municipality: selectedMunicipality.name,

      province: selectedProvince.name,

      postalCode: detectedPostalCode,

      provinceCode: selectedProvince.code,

      municipalityCode: selectedMunicipality.code,

      barangayCode: barangay.code,
    });

    setTouched((prev) => ({
      ...prev,
      address: true,
    }));

    setLocalErrors((prev) => ({
      ...prev,
      address: "",
    }));

    if (!detectedPostalCode) {
      setPostalCodeError(
        "Postal code is not available for this location. You may continue.",
      );
    } else {
      setPostalCodeError("");
    }
  }

  /* =========================================================
     RESET ADDRESS
  ========================================================== */

  function resetAddress() {
    /*
     * Allow the user to select a
     * completely different address.
     */
    hasRestoredAddress.current = true;

    setSelectedProvince(null);

    setSelectedMunicipality(null);

    setSelectedBarangay(null);

    setMunicipalities([]);
    setBarangays([]);

    setPostalCode("");

    setPostalCodeError("");

    setAddressSearch("");

    setAddressError("");

    setShowAddressSearch(true);

    onChange({
      ...value,

      address: "",

      barangay: "",

      municipality: "",

      province: "",

      postalCode: "",

      provinceCode: "",

      municipalityCode: "",

      barangayCode: "",
    });
  }

  /* =========================================================
     NORMAL FIELD SETTER
  ========================================================== */

  const set = (k: keyof PersonalInfo, v: string) => {
    let newValue = v;

    if (k === "firstName" || k === "middleName" || k === "lastName") {
      newValue = capitalizeWords(sanitizeName(v));
    } else if (k === "email") {
      newValue = sanitizeEmail(v);
    } else if (k === "phone") {
      newValue = sanitizePhone(v);
    } else {
      newValue = normalizeText(v);
    }

    onChange({
      ...value,
      [k]: newValue,
    });

    if (submitted || touched[k]) {
      const msg = validateField(k, newValue);

      setLocalErrors((prev) => ({
        ...prev,
        [k]: msg,
      }));
    }
  };

  /* =========================================================
     BLUR
  ========================================================== */

  const onBlurField = (k: keyof PersonalInfo) => {
    setTouched((prev) => ({
      ...prev,
      [k]: true,
    }));

    const fieldValue = (value as any)[k] ?? "";

    const msg = validateField(k, fieldValue);

    setLocalErrors((prev) => ({
      ...prev,
      [k]: msg,
    }));
  };

  /* =========================================================
     ERROR HELPERS
  ========================================================== */

  const invalid = (k: keyof PersonalInfo) => {
    if (!(submitted || touched[k])) {
      return false;
    }

    if (localErrors[k]) {
      return true;
    }

    return !!externalErrors[k];
  };

  const getError = (k: keyof PersonalInfo) => {
    if (localErrors[k]) {
      return localErrors[k] || "";
    }

    return externalErrors[k] || "";
  };

  const inputClass = (k: keyof PersonalInfo) =>
    `form-control ${invalid(k) ? "is-invalid" : ""}`;

  const selectClass = (k: keyof PersonalInfo) =>
    `form-select ${invalid(k) ? "is-invalid" : ""}`;

  const labelClass = (k: keyof PersonalInfo) =>
    `form-label d-flex align-items-center gap-2 ${
      invalid(k) ? "text-danger fw-semibold" : ""
    }`;

  const LabelIcon = ({ children }: { children: React.ReactNode }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: 6,
        background: "rgba(148, 163, 184, 0.15)",
      }}
    >
      {children}
    </span>
  );

  /* =========================================================
     UI
  ========================================================== */

  return (
    <div className="prereg-step">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="prereg-step-header">
        <div className="d-flex align-items-center gap-2">
          <span className="prereg-step-header-icon">
            <UserCircle size={18} />
          </span>

          <h4 className="fw-bold mb-0">Personal Information</h4>
        </div>

        <span className="chip chip-muted">Fields marked * are required</span>
      </div>

      <div className="row g-3">
        {/* FIRST NAME */}

        <div className="col-12 col-md-4">
          <label className={labelClass("firstName")}>
            <LabelIcon>
              <User size={14} />
            </LabelIcon>
            First Name <span className="text-danger">*</span>
          </label>

          <input
            className={inputClass("firstName")}
            value={value.firstName}
            placeholder="Enter first name"
            onChange={(e) => set("firstName", e.target.value)}
            onBlur={() => onBlurField("firstName")}
          />

          <div className="invalid-feedback d-block">
            {invalid("firstName") ? getError("firstName") : "\u00A0"}
          </div>
        </div>

        {/* MIDDLE NAME */}

        <div className="col-12 col-md-4">
          <label className="form-label d-flex align-items-center gap-2">
            <LabelIcon>
              <User size={14} />
            </LabelIcon>
            Middle Name
          </label>

          <input
            className="form-control"
            value={value.middleName || ""}
            placeholder="Optional"
            onChange={(e) => set("middleName", e.target.value)}
          />

          <div className="invalid-feedback d-block">&nbsp;</div>
        </div>

        {/* LAST NAME */}

        <div className="col-12 col-md-4">
          <label className={labelClass("lastName")}>
            <LabelIcon>
              <User size={14} />
            </LabelIcon>
            Last Name <span className="text-danger">*</span>
          </label>

          <input
            className={inputClass("lastName")}
            value={value.lastName}
            placeholder="Enter last name"
            onChange={(e) => set("lastName", e.target.value)}
            onBlur={() => onBlurField("lastName")}
          />

          <div className="invalid-feedback d-block">
            {invalid("lastName") ? getError("lastName") : "\u00A0"}
          </div>
        </div>

        {/* EMAIL */}

        <div className="col-12 col-md-6">
          <label className={labelClass("email")}>
            <LabelIcon>
              <Mail size={14} />
            </LabelIcon>
            Email <span className="text-danger">*</span>
          </label>

          <input
            type="email"
            className={inputClass("email")}
            value={value.email}
            placeholder="Enter email"
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => onBlurField("email")}
          />

          <div className="invalid-feedback d-block">
            {invalid("email") ? getError("email") : "\u00A0"}
          </div>
        </div>

        {/* PHONE */}

        <div className="col-12 col-md-6">
          <label className={labelClass("phone")}>
            <LabelIcon>
              <Phone size={14} />
            </LabelIcon>
            Phone <span className="text-danger">*</span>
          </label>

          <input
            className={inputClass("phone")}
            value={value.phone || ""}
            placeholder="+639XXXXXXXXX"
            inputMode="numeric"
            onFocus={() => {
              if (!value.phone) {
                onChange({
                  ...value,
                  phone: "+639",
                });
              }
            }}
            onChange={(e) => {
              const input = e.target.value;

              if (!input.trim()) {
                onChange({
                  ...value,
                  phone: "",
                });

                if (submitted || touched.phone) {
                  setLocalErrors((prev) => ({
                    ...prev,
                    phone: validateField("phone", ""),
                  }));
                }

                return;
              }

              set("phone", input);
            }}
            onBlur={() => onBlurField("phone")}
          />

          <div className="invalid-feedback d-block">
            {invalid("phone") ? getError("phone") : "\u00A0"}
          </div>
        </div>

        {/* BIRTH DATE */}

        <div className="col-12 col-md-6">
          <label className={labelClass("birthDate")}>
            <LabelIcon>
              <CalendarIcon size={14} />
            </LabelIcon>
            Birth Date <span className="text-danger">*</span>
          </label>

          <input
            type="date"
            className={inputClass("birthDate")}
            value={value.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
            onBlur={() => onBlurField("birthDate")}
          />

          <div className="invalid-feedback d-block">
            {invalid("birthDate") ? getError("birthDate") : "\u00A0"}
          </div>
        </div>

        {/* GENDER */}

        <div className="col-12 col-md-6">
          <label className={labelClass("gender")}>
            <LabelIcon>
              <VenusAndMars size={14} />
            </LabelIcon>
            Gender <span className="text-danger">*</span>
          </label>

          <select
            className={selectClass("gender")}
            value={value.gender}
            onChange={(e) => set("gender", e.target.value)}
            onBlur={() => onBlurField("gender")}
          >
            <option value="">Select gender</option>

            <option value="male">Male</option>

            <option value="female">Female</option>

            <option value="prefer_not_say">Prefer not to say</option>
          </select>

          <div className="invalid-feedback d-block">
            {invalid("gender") ? getError("gender") : "\u00A0"}
          </div>
        </div>

        {/* =====================================================
            PHILIPPINE ADDRESS
        ===================================================== */}

        <div className="col-12">
          <label className={labelClass("address")}>
            <LabelIcon>
              <MapPin size={14} />
            </LabelIcon>
            Complete Address <span className="text-danger">*</span>
          </label>

          <div
            className={`prereg-address-selector ${
              invalid("address") ? "is-invalid" : ""
            }`}
          >
            {/* SEARCH PROVINCE */}

            {!selectedProvince && (
              <div className="prereg-address-search">
                <div className="prereg-address-search-input">
                  <Search size={18} />

                  <input
                    type="text"
                    value={addressSearch}
                    placeholder="Search your province..."
                    onFocus={() => setShowAddressSearch(true)}
                    onChange={(e) => {
                      setAddressSearch(e.target.value);

                      setShowAddressSearch(true);
                    }}
                  />

                  {addressLoading && (
                    <Loader2 size={18} className="prereg-address-spinner" />
                  )}
                </div>

                {showAddressSearch && addressSearch.trim() && (
                  <div className="prereg-address-results">
                    {filteredProvinces.length > 0 ? (
                      filteredProvinces.map((province) => (
                        <button
                          key={province.code}
                          type="button"
                          className="prereg-address-result"
                          onClick={() => void selectProvince(province)}
                        >
                          <MapPin size={16} />

                          <span>{province.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="prereg-address-no-result">
                        No province found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PROVINCE */}

            {selectedProvince && (
              <div className="prereg-address-level">
                <div className="prereg-address-level-label">
                  <span>Province</span>

                  <button type="button" onClick={resetAddress}>
                    Change
                  </button>
                </div>

                <div className="prereg-address-selected">
                  <MapPin size={17} />

                  <strong>{selectedProvince.name}</strong>

                  <CheckCircle2 size={17} className="text-success" />
                </div>
              </div>
            )}

            {/* MUNICIPALITY */}

            {selectedProvince && !selectedMunicipality && (
              <div className="prereg-address-level">
                <label className="prereg-address-mini-label">
                  Municipality / City
                </label>

                <div className="prereg-address-dropdown-wrap">
                  <select
                    className="form-select"
                    value=""
                    onChange={(e) => {
                      const municipality = municipalities.find(
                        (m) => m.code === e.target.value,
                      );

                      if (municipality) {
                        void selectMunicipality(municipality);
                      }
                    }}
                  >
                    <option value="">Select municipality / city</option>

                    {municipalities.map((municipality) => (
                      <option key={municipality.code} value={municipality.code}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={18} className="prereg-address-chevron" />
                </div>
              </div>
            )}

            {/* BARANGAY */}

            {selectedMunicipality && !selectedBarangay && (
              <div className="prereg-address-level">
                <label className="prereg-address-mini-label">Barangay</label>

                <div className="prereg-address-dropdown-wrap">
                  <select
                    className="form-select"
                    value=""
                    onChange={(e) => {
                      const barangay = barangays.find(
                        (b) => b.code === e.target.value,
                      );

                      if (barangay) {
                        selectBarangay(barangay);
                      }
                    }}
                  >
                    <option value="">Select barangay</option>

                    {barangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.code}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={18} className="prereg-address-chevron" />
                </div>

                {/* POSTAL CODE */}

                <div className="mt-3">
                  <label className="prereg-address-mini-label">
                    Postal Code
                  </label>

                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control"
                      value={postalCode}
                      readOnly
                      placeholder={
                        postalCodeLoading
                          ? "Detecting postal code..."
                          : "Postal code will be detected automatically"
                      }
                    />

                    {postalCodeLoading && (
                      <Loader2 size={18} className="prereg-address-spinner" />
                    )}
                  </div>

                  {postalCodeError && (
                    <div className="text-warning small mt-1">
                      {postalCodeError}
                    </div>
                  )}

                  {!postalCodeLoading && postalCode && (
                    <div className="text-success small mt-1 d-flex align-items-center gap-1">
                      <CheckCircle2 size={14} />

                      <span>Postal code detected automatically.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FINAL SELECTED ADDRESS */}

            {selectedBarangay && (
              <div className="prereg-address-final">
                <div className="prereg-address-final-header">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} className="text-success" />

                    <strong>Address Selected</strong>
                  </div>
                </div>

                <div className="prereg-address-details">
                  <div className="prereg-address-detail">
                    <span>Barangay</span>

                    <strong>{value.barangay}</strong>
                  </div>

                  <div className="prereg-address-detail">
                    <span>Municipality / City</span>

                    <strong>{value.municipality}</strong>
                  </div>

                  <div className="prereg-address-detail">
                    <span>Province</span>

                    <strong>{value.province}</strong>
                  </div>

                  <div className="prereg-address-detail">
                    <span>Postal Code</span>

                    <strong>
                      {value.postalCode ||
                        (postalCodeLoading ? "Detecting..." : "Not available")}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {addressError && (
            <div className="text-danger small mt-2">{addressError}</div>
          )}

          <div className="invalid-feedback d-block">
            {invalid("address") ? getError("address") : "\u00A0"}
          </div>

          <small className="text-muted d-block mt-1">
            Search for your province, then select your municipality and
            barangay. Your complete address and postal code will be generated
            automatically.
          </small>
        </div>
      </div>
    </div>
  );
}
