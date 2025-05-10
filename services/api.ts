import { serverUrl } from "./baseUrl";

export const loginUser = async(email:string | undefined, password:string | undefined) => {
  const res = await fetch(`${serverUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json(); // { token }
}

export const registerUser = async(email:string | undefined,  username:string | undefined, password:string | undefined) => {
  const res = await fetch(`${serverUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json(); // { token }
}
