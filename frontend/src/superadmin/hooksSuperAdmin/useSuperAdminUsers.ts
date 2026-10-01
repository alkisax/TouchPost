import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { backendUrl } from "../../constants/constants";
import { frontendValidatePassword } from "../../authLogin/utils/registerBackend";
import type {
  ManagedOrganization,
  ManagedUser,
  ManagedUserFormValues,
  ManagedUserRole,
  UserAdStatus,
} from "../typesSuperAdmin/superAdmin.types";

const emptyForm: ManagedUserFormValues = {
  username: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  organizationId: "",
};

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

const isApiEnvelope = (value: unknown): value is { status: boolean; data?: unknown } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    typeof value.status === "boolean"
  );
};

const requestSuperAdmin = async <T>(
  path: string,
  config: Parameters<typeof axios.request>[0],
): Promise<T> => {
  const response = await axios.request({
    ...config,
    url: `${backendUrl}/superadmin${path}`,
  });

  // Validate the envelope before accepting the response so an unexpected HTML
  // fallback cannot overwrite the typed managed-user state.
  if (isApiEnvelope(response.data)) {
    return response.data as T;
  }

  throw new Error("SUPERADMIN API returned an invalid response");
};

const useSuperAdminUsers = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [organizations, setOrganizations] = useState<ManagedOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<ManagedUserFormValues>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<
    "USER" | "ADMIN" | "STAFF" | "EDIT"
  >("USER");
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await requestSuperAdmin<{ status: boolean; data: ManagedUser[] }>(
        "/users",
        {
          method: "GET",
          ...authConfig(),
        },
      );
      setUsers(response.data);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrganizations = useCallback(async () => {
    setOrganizationsLoading(true);

    try {
      const response = await requestSuperAdmin<{
        status: boolean;
        data: ManagedOrganization[];
      }>(
        "/organizations",
        {
          method: "GET",
          ...authConfig(),
        },
      );
      setOrganizations(response.data);
    } catch (reason: unknown) {
      setFormError(getErrorMessage(reason, "Failed to load organizations"));
    } finally {
      setOrganizationsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openCreate = (mode: "USER" | "ADMIN" | "STAFF") => {
    setDialogMode(mode);
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);

    if (mode === "STAFF" && organizations.length === 0) {
      void loadOrganizations();
    }
  };

  const openEdit = (managedUser: ManagedUser) => {
    setDialogMode("EDIT");
    setEditingUser(managedUser);
    setForm({
      ...emptyForm,
      username: managedUser.user.username,
      name: managedUser.user.name ?? "",
      email: managedUser.user.email ?? "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) {
      setDialogOpen(false);
      setEditingUser(null);
    }
  };

  const updateForm = (field: keyof ManagedUserFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      return "Username is required";
    }

    if (dialogMode === "ADMIN" && !form.organizationId.trim()) {
      return "Organization is required";
    }

    if (dialogMode === "STAFF" && !form.organizationId.trim()) {
      return "Organization is required";
    }

    const passwordRequired = dialogMode !== "EDIT";

    if (passwordRequired && !form.password) {
      return "Password is required";
    }

    const hasPassword = Boolean(form.password || form.confirmPassword);

    if (hasPassword) {
      const passwordError = frontendValidatePassword(form.password);

      if (passwordError) {
        return passwordError;
      }

      if (form.password !== form.confirmPassword) {
        return "Passwords do not match";
      }
    }

    return "";
  };

  const save = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError("");

    const identity = {
      username: form.username.trim(),
      name: form.name.trim() || null,
      email: form.email.trim() || null,
    };

    try {
      if (dialogMode === "USER") {
        await requestSuperAdmin(
          "/users",
          {
            method: "POST",
            data: { ...identity, password: form.password },
            ...authConfig(),
          },
        );
      } else if (dialogMode === "ADMIN") {
        await requestSuperAdmin(
          "/admins",
          {
            method: "POST",
            data: {
              ...identity,
              password: form.password,
              organizationName: form.organizationId.trim(),
            },
            ...authConfig(),
          },
        );
      } else if (dialogMode === "STAFF") {
        await requestSuperAdmin(
          `/organizations/${form.organizationId}/staff`,
          {
            method: "POST",
            data: { ...identity, password: form.password },
            ...authConfig(),
          },
        );
      } else if (editingUser) {
        await requestSuperAdmin(
          `/users/${editingUser.user.id}`,
          {
            method: "PUT",
            data: {
              ...identity,
              ...(form.password ? { password: form.password } : {}),
            },
            ...authConfig(),
          },
        );
      }

      await loadUsers();
      setDialogOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
    } catch (reason: unknown) {
      setFormError(getErrorMessage(reason, "Failed to save user"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (managedUser: ManagedUser) => {
    const name = managedUser.user.name || managedUser.user.username;
    let message = `Delete ${name}?`;

    if (managedUser.user.role === "ADMIN") {
      message =
        `Delete ADMIN ${name}? This also permanently deletes the associated ` +
        "organization and its STAFF accounts.";
    } else if (managedUser.user.role === "STAFF") {
      message = `Delete STAFF account ${name}?`;
    }

    if (!window.confirm(message)) {
      return;
    }

    setError("");

    try {
      const routeByRole: Record<ManagedUserRole, string> = {
        USER: `/superadmin/users/${managedUser.user.id}`,
        STAFF: `/superadmin/staff/${managedUser.user.id}`,
        ADMIN: `/superadmin/admins/${managedUser.user.id}`,
      };

      await requestSuperAdmin(routeByRole[managedUser.user.role].replace("/superadmin", ""), {
        method: "DELETE",
        ...authConfig(),
      });
      await loadUsers();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Failed to delete user"));
    }
  };

  const getUserAdStatus = async (userId: string) => {
    const response = await requestSuperAdmin<{
      status: boolean;
      data: UserAdStatus;
    }>(`/users/${userId}/ad-status`, {
      method: "GET",
      ...authConfig(),
    });

    return response.data;
  };

  const updateUserAdStatus = async (
    userId: string,
    data: UserAdStatus,
  ) => {
    const response = await requestSuperAdmin<{
      status: boolean;
      data: UserAdStatus;
    }>(`/users/${userId}/ad-status`, {
      method: "PUT",
      data,
      ...authConfig(),
    });

    return response.data;
  };

  return {
    users,
    organizations,
    loading,
    organizationsLoading,
    saving,
    error,
    formError,
    form,
    dialogOpen,
    dialogMode,
    editingUser,
    openCreate,
    openEdit,
    closeDialog,
    updateForm,
    save,
    remove,
    getUserAdStatus,
    updateUserAdStatus,
  };
};

export default useSuperAdminUsers;
