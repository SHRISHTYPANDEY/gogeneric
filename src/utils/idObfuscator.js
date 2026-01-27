const SALT = "GG2026";

export const encodeId = (id) => {
  return btoa(`${SALT}:${id}`);
};

export const decodeId = (hash) => {
  try {
    const decoded = atob(hash);
    const [salt, id] = decoded.split(":");

    if (salt !== SALT) return null;
    return id;
  } catch {
    return null;
  }
};
