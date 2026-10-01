import {
  Add,
  AdminPanelSettings,
  Delete,
  Edit,
  People,
  Paid,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";

import useSuperAdminUsers from "./hooksSuperAdmin/useSuperAdminUsers";
import type {
  ManagedUser,
  ManagedUserFilter,
  UserAdStatus,
} from "./typesSuperAdmin/superAdmin.types";

const SuperAdminUsersPanel = () => {
  const manager = useSuperAdminUsers();
  const [filter, setFilter] = useState<ManagedUserFilter>("ALL");
  const [monetizationUser, setMonetizationUser] =
    useState<ManagedUser | null>(null);
  const [adStatus, setAdStatus] = useState<UserAdStatus | null>(null);
  const [monetizationLoading, setMonetizationLoading] = useState(false);
  const [monetizationSaving, setMonetizationSaving] = useState(false);
  const [monetizationError, setMonetizationError] = useState("");

  const visibleUsers = manager.users.filter(
    (managedUser) => filter === "ALL" || managedUser.user.role === filter,
  );

  const dialogTitle = {
    USER: "Create User",
    ADMIN: "Create Admin",
    STAFF: "Create Staff",
    EDIT: "Edit User",
  }[manager.dialogMode];

  const isCreate = manager.dialogMode !== "EDIT";

  const openMonetization = async (managedUser: ManagedUser) => {
    setMonetizationUser(managedUser);
    setAdStatus(null);
    setMonetizationError("");
    setMonetizationLoading(true);

    try {
      const status = await manager.getUserAdStatus(managedUser.user.id);
      setAdStatus(status);
    } catch {
      setMonetizationError("Failed to load monetization status");
    } finally {
      setMonetizationLoading(false);
    }
  };

  const closeMonetization = () => {
    if (!monetizationSaving) {
      setMonetizationUser(null);
      setAdStatus(null);
      setMonetizationError("");
    }
  };

  const updateAdStatus = (field: keyof UserAdStatus, value: boolean | string | null) => {
    setAdStatus((current) => (current ? { ...current, [field]: value } : current));
  };

  const saveMonetization = async () => {
    if (!monetizationUser || !adStatus) return;

    setMonetizationSaving(true);
    setMonetizationError("");

    try {
      const saved = await manager.updateUserAdStatus(
        monetizationUser.user.id,
        adStatus,
      );
      setAdStatus(saved);
      closeMonetization();
    } catch {
      setMonetizationError("Failed to save monetization status");
    } finally {
      setMonetizationSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, width: "100%" }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4">SUPERADMIN Users</Typography>
          <Typography sx={{ color: "var(--text-secondary)" }}>
            Manage ADMIN, STAFF, and USER accounts across all organizations.
          </Typography>
        </Box>

        {manager.error && <Alert severity="error">{manager.error}</Alert>}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="superadmin-user-filter-label">Role</InputLabel>
            <Select
              labelId="superadmin-user-filter-label"
              value={filter}
              label="Role"
              onChange={(event) =>
                setFilter(event.target.value as ManagedUserFilter)
              }
            >
              <MenuItem value="ALL">ALL</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="STAFF">STAFF</MenuItem>
              <MenuItem value="USER">USER</MenuItem>
            </Select>
          </FormControl>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => manager.openCreate("USER")}
            >
              Create User
            </Button>
            <Button
              variant="outlined"
              startIcon={<AdminPanelSettings />}
              onClick={() => manager.openCreate("ADMIN")}
            >
              Create Admin
            </Button>
            <Button
              variant="outlined"
              startIcon={<People />}
              onClick={() => manager.openCreate("STAFF")}
            >
              Create Staff
            </Button>
          </Box>
        </Box>

        {manager.loading && <Typography>Loading users...</Typography>}

        {!manager.loading && visibleUsers.length === 0 && (
          <Typography sx={{ color: "var(--text-secondary)" }}>
            No managed users found.
          </Typography>
        )}

        {!manager.loading && visibleUsers.length > 0 && (
          <Stack spacing={1}>
            {visibleUsers.map((managedUser) => (
              <Paper
                key={managedUser.user.id}
                sx={{
                  p: 2,
                  backgroundColor: "var(--panel)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    alignItems: { xs: "stretch", md: "center" },
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      {managedUser.user.name || managedUser.user.username}
                    </Typography>
                    <Typography>
                      Username: {managedUser.user.username}
                    </Typography>
                    <Typography>
                      Email: {managedUser.user.email || "Not provided"}
                    </Typography>
                    <Typography>
                      Role: {managedUser.user.role} · Organization: {managedUser.organization?.name || "-"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {managedUser.user.role === "ADMIN" && (
                      <Button
                        startIcon={<Paid />}
                        onClick={() => void openMonetization(managedUser)}
                      >
                        Monetization
                      </Button>
                    )}
                    <Button
                      startIcon={<Edit />}
                      onClick={() => manager.openEdit(managedUser)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => void manager.remove(managedUser)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog
        open={manager.dialogOpen}
        onClose={manager.closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {manager.formError && (
              <Alert severity="error">{manager.formError}</Alert>
            )}

            {manager.editingUser && (
              <Typography sx={{ color: "var(--text-secondary)" }}>
                Current role: {manager.editingUser.user.role}. Role,
                organization, and membership cannot be changed here.
              </Typography>
            )}

            <TextField
              required
              label="Username"
              value={manager.form.username}
              onChange={(event) =>
                manager.updateForm("username", event.target.value)
              }
            />
            <TextField
              label="Name"
              value={manager.form.name}
              onChange={(event) =>
                manager.updateForm("name", event.target.value)
              }
            />
            <TextField
              label="Email"
              type="email"
              value={manager.form.email}
              onChange={(event) =>
                manager.updateForm("email", event.target.value)
              }
            />

            {manager.dialogMode === "STAFF" && (
              <FormControl required>
                <InputLabel id="superadmin-staff-organization-label">
                  Organization
                </InputLabel>
                <Select
                  labelId="superadmin-staff-organization-label"
                  value={manager.form.organizationId}
                  label="Organization"
                  disabled={manager.organizationsLoading}
                  onChange={(event) =>
                    manager.updateForm("organizationId", event.target.value)
                  }
                >
                  {manager.organizations.map((organization) => (
                    <MenuItem key={organization.id} value={organization.id}>
                      {organization.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {manager.dialogMode === "ADMIN" && (
              <TextField
                required
                label="Organization name"
                value={manager.form.organizationId}
                onChange={(event) =>
                  manager.updateForm("organizationId", event.target.value)
                }
              />
            )}

            {isCreate || manager.dialogMode === "EDIT" ? (
              <TextField
                required={isCreate}
                label={isCreate ? "Password" : "New password (optional)"}
                type="password"
                value={manager.form.password}
                onChange={(event) =>
                  manager.updateForm("password", event.target.value)
                }
              />
            ) : null}

            <TextField
              required={isCreate}
              label={isCreate ? "Confirm password" : "Confirm new password"}
              type="password"
              value={manager.form.confirmPassword}
              onChange={(event) =>
                manager.updateForm("confirmPassword", event.target.value)
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={manager.closeDialog} disabled={manager.saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void manager.save()}
            disabled={manager.saving}
          >
            {manager.saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={monetizationUser !== null}
        onClose={closeMonetization}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Monetization</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {monetizationUser && (
              <Typography>
                {monetizationUser.user.username} · {monetizationUser.organization?.name || "Organization"}
              </Typography>
            )}

            {monetizationLoading && <Typography>Loading status...</Typography>}
            {monetizationError && (
              <Alert severity="error">{monetizationError}</Alert>
            )}

            {adStatus && !monetizationLoading && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={adStatus.hasPaid}
                      onChange={(event) =>
                        updateAdStatus("hasPaid", event.target.checked)
                      }
                    />
                  }
                  label="Paid"
                />
                <TextField
                  label="Ad-free until"
                  type="datetime-local"
                  value={toDateTimeLocal(adStatus.adFreeUntil)}
                  onChange={(event) =>
                    updateAdStatus(
                      "adFreeUntil",
                      event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null,
                    )
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMonetization} disabled={monetizationSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void saveMonetization()}
            disabled={!adStatus || monetizationLoading || monetizationSaving}
          >
            {monetizationSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const toDateTimeLocal = (value: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default SuperAdminUsersPanel;
