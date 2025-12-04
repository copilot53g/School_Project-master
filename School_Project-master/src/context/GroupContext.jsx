import React, { createContext, useContext, useState } from "react";

const GroupContext = createContext(null);

export const DEFAULT_GROUPS = [
  "JR MPC IC-1 Boys",
  "JR MPC IC-2 Boys",
  "JR MPC IC-3 Boys",
  "JR MPC IC-4 Boys",
  "JR MPC Spark Boys",
  "JR MPC IC-1 Girls",
  "JR MPC IC-2 Girls",
  "JR MEC Girls",
  "JR MPC Spark Girls",
  "JR BIPC Spark",
  "SR MPC IC-1 Boys",
  "SR MPC IC-2 Boys",
  "SR MPC IC-3 Boys",
  "SR BIPC Boys",
  "SR MPC Spark",
  "SR MPC IC-1 Girls",
  "SR MPC IC-2 Girls",
  "SR BIPC Girls",
  "SR MEC Girls",
  "SR BIPC Spark"
];

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState(DEFAULT_GROUPS.slice());

  function addGroup(name) {
    if (!name) return null;
    const trimmed = String(name).trim();
    if (!trimmed) return null;
    setGroups(prev => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
    return trimmed;
  }

  const value = { groups, addGroup };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroups() {
  const ctx = useContext(GroupContext);
  return ctx?.groups || [];
}

export function useAddGroup() {
  const ctx = useContext(GroupContext);
  return ctx?.addGroup || (() => null);
}

// Determine major category from a group string
export function getGroupCategory(groupName) {
  if (!groupName) return null;
  const up = String(groupName).toUpperCase();
  if (up.includes('MPC')) return 'MPC';
  if (up.includes('BIPC') || up.includes('BIO')) return 'BIPC';
  if (up.includes('MEC')) return 'MEC';
  return null;
}

// Hook-compatible accessor used elsewhere
export function useGroupCategory() {
  return getGroupCategory;
}

export default GroupProvider;