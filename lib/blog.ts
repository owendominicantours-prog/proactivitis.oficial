export const slugifyBlog = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

export const containsLinks = (value: string) => {
  const lower = value.toLowerCase();
  return (
    lower.includes("http://") ||
    lower.includes("https://") ||
    lower.includes("www.") ||
    lower.includes("href=")
  );
};
