import { api } from "@/shared/api/axios";
import type { Role } from "../model/types";

export const roleApi = {
  list: () => api.get<Role[]>("/api/roles").then((r) => r.data),
};
