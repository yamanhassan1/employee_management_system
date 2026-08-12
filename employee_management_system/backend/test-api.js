// Comprehensive API test script using Node's built-in fetch.
// Connects to MongoDB directly to bypass email verification for testing.
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const User = require("./src/models/user.model");
const Department = require("./src/models/department.model");
const { MONGO_URI } = require("./src/config/env");

const BASE = "http://localhost:5000/api/v1";
const ts = Date.now();
const EMAIL = {
  admin: `admin${ts}@test.com`,
  manager: `manager${ts}@test.com`,
  employee: `employee${ts}@test.com`,
};

let cookieJar = {};

function parseCookies(res) {
  let setCookieHeader = [];
  if (res.headers && typeof res.headers.getSetCookie === "function") {
    setCookieHeader = res.headers.getSetCookie();
  } else {
    const sc = res.headers.get("set-cookie");
    if (sc) setCookieHeader = sc.split(/,(?=\s*[A-Za-z_][A-Za-z0-9_]*=)/);
  }
  if (!setCookieHeader || !setCookieHeader.length) return;
  setCookieHeader.forEach((c) => {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) {
      cookieJar[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
    }
  });
}

function cookieHeader() {
  return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function api(method, path, body, { useCookies = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (useCookies && Object.keys(cookieJar).length) headers["Cookie"] = cookieHeader();
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
parseCookies(res);
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  console.log(`${method} ${path} -> ${res.status}: ${data ? JSON.stringify(data.message || data) : ""}`);
  return { status: res.status, data };
}

async function run() {
  await mongoose.connect(MONGO_URI || "mongodb://127.0.0.1:27017/employee_management_system");

console.log("=== 1. Register (3 users) ===");
  await api("POST", "/auth/register", { name: "Alice Employee", email: EMAIL.employee, password: "password123", confirmPassword: "password123" });
  await api("POST", "/auth/register", { name: "Bob Manager", email: EMAIL.manager, password: "password123", confirmPassword: "password123" });
  await api("POST", "/auth/register", { name: "Carol Admin", email: EMAIL.admin, password: "password123", confirmPassword: "password123" });

  console.log("\n=== 1b. Register with mismatched passwords (expect 422) ===");
  await api("POST", "/auth/register", { name: "Bad User", email: `bad${ts}@test.com`, password: "password123", confirmPassword: "different123" });

  console.log("\n=== 2. Directly verify users & set roles in DB ===");
  await User.updateOne({ email: EMAIL.employee }, { isVerified: true });
  await User.updateOne({ email: EMAIL.manager }, { isVerified: true, role: "manager" });
  await User.updateOne({ email: EMAIL.admin }, { isVerified: true, role: "admin" });

  const carol = await User.findOne({ email: EMAIL.admin });
  const bob = await User.findOne({ email: EMAIL.manager });
  const alice = await User.findOne({ email: EMAIL.employee });
  console.log("Users ready. admin:", carol?._id, "manager:", bob?._id, "employee:", alice?._id);

  console.log("\n=== 3. Login as admin (Carol) ===");
  await api("POST", "/auth/login", { email: EMAIL.admin, password: "password123", deviceId: "dev-admin" });
  console.log("Cookies set:", Object.keys(cookieJar));

  console.log("\n=== 4. GET /auth/me (admin) ===");
  await api("GET", "/auth/me");

  console.log("\n=== 5. Admin: list users ===");
  await api("GET", "/users");

  console.log("\n=== 6. Admin: create department (duplicate name test) ===");
const deptName = `Engineering${ts}`;
  const dept = await api("POST", "/departments", { name: deptName, description: "Dev team" });
  const deptId = dept.data?.data?._id;
  await api("POST", "/departments", { name: deptName, description: "Duplicate" });
  console.log("deptId:", deptId);

  console.log("\n=== 7. Admin: assign department to Alice ===");
  await api("PATCH", `/users/${alice._id}/department`, { departmentId: deptId });

  console.log("\n=== 8. Admin: assign manager to Alice ===");
  await api("PATCH", `/users/${alice._id}/manager`, { managerId: bob._id });

  console.log("\n=== 9. Admin: update Alice role to manager ===");
  await api("PATCH", `/users/${alice._id}/role`, { role: "manager" });

  console.log("\n=== 10. Admin: verify populated me (dept/manager) ===");
  await api("GET", "/auth/me");

  console.log("\n=== 11. Admin: list departments ===");
  await api("GET", "/departments");

  console.log("\n=== 12. Permission test: manager access to /users (expect 403) ===");
  await api("POST", "/auth/login", { email: EMAIL.manager, password: "password123", deviceId: "dev-bob" });
  await api("GET", "/users");

  console.log("\n=== 13. Manager can list departments (expect 200) ===");
  await api("GET", "/departments");

  console.log("\n=== 14. Sessions (authenticated) ===");
  await api("GET", "/sessions");

  console.log("\n=== 15. Refresh token ===");
  await api("POST", "/auth/refresh");

  console.log("\n=== 16. Logout ===");
  await api("POST", "/auth/logout");

  console.log("\n=== DONE ===");
  console.log("Final cookie jar:", Object.keys(cookieJar));
  await mongoose.disconnect();
}

run().catch((e) => { console.error("Test error:", e); process.exit(1); });
