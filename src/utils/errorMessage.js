export function getSafeErrorMessage(error, fallback = "Something went wrong.") {
  if (typeof error === "string" && error.trim()) return error.trim();
  if (typeof error?.message === "string" && error.message.trim())
    return error.message.trim();
  return fallback;
}
