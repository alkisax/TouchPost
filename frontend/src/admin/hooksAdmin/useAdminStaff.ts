// frontend\src\admin\hooksAdmin\useAdminStaff.ts
import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type { AdminStaffMember } from "../typesAdmin/adminPanel.types"
import { frontendValidatePassword } from "../../authLogin/utils/registerBackend";

export interface StaffFormValues {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: StaffFormValues = {
  username: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

const useAdminStaff = () => {
  const [staff, setStaff] = useState<AdminStaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffFormValues>(emptyForm);

  const refresh = async () => {
    const response = await axios.get(
      `${backendUrl}/users/organization/staff`,
      authConfig(),
    );

    setStaff(response.data.data);
  };

  useEffect(() => {
    let ignore = false;

    const loadStaff = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${backendUrl}/users/organization/staff`,
          authConfig(),
        );

        if (!ignore) {
          setStaff(response.data.data);
        }
      } catch (reason: unknown) {
        if (!ignore) {
          setError(getErrorMessage(reason, "Failed to load staff"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadStaff();

    return () => {
      ignore = true;
    };
  }, []);

  const openCreate = () => {
    setEditingMemberId(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (member: AdminStaffMember) => {
    setEditingMemberId(member.id);

    setForm({
      username: member.username,
      name: member.name ?? "",
      email: member.email ?? "",
      password: "",
      confirmPassword: "",
    });

    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) {
      setDialogOpen(false);
      setEditingMemberId(null);
    }
  };

  const updateForm = (field: keyof StaffFormValues, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const save = async () => {
    if (!form.username.trim()) {
      setError("Username is required");
      return;
    }

    if (editingMemberId === null && !form.password) {
      setError("Password is required");
      return;
    }

    const hasPassword =
      form.password.length > 0 || form.confirmPassword.length > 0;

    if (hasPassword && !form.password) {
      setError("New password is required");
      return;
    }

    if (hasPassword) {
      const passwordError = frontendValidatePassword(form.password);

      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    if (hasPassword && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingMemberId === null) {
        await axios.post(
          `${backendUrl}/users/staff`,
          {
            username: form.username.trim(),
            name: form.name.trim() || null,
            email: form.email.trim() || null,
            password: form.password,
          },
          authConfig(),
        );
      } else {
        await axios.put(
          `${backendUrl}/users/${editingMemberId}`,
          {
            username: form.username.trim(),
            name: form.name.trim() || null,
            email: form.email.trim() || null,
            ...(hasPassword ? { password: form.password } : {}),
          },
          authConfig(),
        );
      }

      await refresh();

      setDialogOpen(false);
      setEditingMemberId(null);
      setForm(emptyForm);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Failed to save staff member"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (member: AdminStaffMember) => {
    if (
      !window.confirm(
        `Remove ${member.name || member.username} from this organization?`,
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${backendUrl}/users/${member.id}`,
        authConfig(),
      );

      await refresh();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Failed to remove staff member"));
    }
  };

  return {
    staff,
    loading,
    error,
    saving,
    dialogOpen,
    editingMemberId,
    form,
    openCreate,
    openEdit,
    closeDialog,
    updateForm,
    save,
    remove,
  };
};

export default useAdminStaff;