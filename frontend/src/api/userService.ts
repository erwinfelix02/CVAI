const API_URL = "http://localhost:5000/api/users";

export const createUser = async (payload: any) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);
  return data;
};


// ✅ NEW: Fetch users from DB
export const getUsers = async () => {
  const res = await fetch(API_URL);

  const data = await res.json();
  if (!res.ok) throw new Error("Failed to load users");

  return data;
};