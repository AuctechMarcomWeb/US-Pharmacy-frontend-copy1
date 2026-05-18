"use client";

import { createContext, useContext, useState } from "react";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);

  const loadProfile = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setProfile(data.user);
  };

  return (
    <ProfileContext.Provider value={{ profile, loadProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);