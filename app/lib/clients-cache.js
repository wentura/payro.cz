import { revalidateTag } from "next/cache";

export function revalidateClientsCache(userId) {
  revalidateTag("clients", "max");
  if (userId) {
    revalidateTag(`clients-${userId}`, "max");
  }
}
