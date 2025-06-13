// Favourites API helper
export async function addFavouriteRoute({ userId, start, end }) {
  const res = await fetch("/api/favourites/add-favourite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, start, end }),
  });
  if (!res.ok) throw new Error("Failed to add favourite");
  return res.json();
}

export async function getFavouriteRoutes(userId) {
  const res = await fetch(`/api/favourites/get-favourites/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch favourites");
  return res.json();
}

export async function removeFavouriteRoute({ userId, start, end }) {
  const res = await fetch("/api/favourites/remove-favourite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, start, end }),
  });
  if (!res.ok) throw new Error("Failed to remove favourite");
  return res.json();
}
