import {
  Delete,
  Edit,
  People,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import useAdminStaff from "./hooksAdmin/useAdminStaff";
import AdminPanelInfo from "./AdminPanelInfo";

const AdminStaffPanel = () => {
  const admin = useAdminStaff();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AdminPanelInfo title="About Staff">
        Staff members are accounts created and managed by the administrator of
        the organization.
      </AdminPanelInfo>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography id="admin-staff-title" variant="h5">
          Staff
        </Typography>

        <Button
          id="add-staff-button"
          variant="contained"
          startIcon={<People />}
          onClick={admin.openCreate}
        >
          Add Staff
        </Button>
      </Box>

      {admin.error && !admin.dialogOpen && (
        <Typography color="error" sx={{ mb: 2 }}>
          {admin.error}
        </Typography>
      )}

      {admin.loading && <Typography>Loading staff...</Typography>}

      {!admin.loading && admin.staff.length === 0 && (
          <Typography sx={{ color: "var(--text-secondary)" }}>
          No staff members found.
        </Typography>
      )}

      {!admin.loading &&
        admin.staff.map((member) => (
          <Paper
            key={member.id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "var(--panel)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            <Box>
              <Typography variant="h6">
                {member.name || member.username}
              </Typography>

              <Typography>Username: {member.username}</Typography>

              <Typography>
                Email: {member.email || "Not provided"} · Role: {member.role}
              </Typography>
            </Box>

            <Box>
              <Tooltip title="Edit Staff">
                <IconButton
                  aria-label="Edit Staff"
                  onClick={() => admin.openEdit(member)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>

              <Tooltip title="Remove Staff">
                <IconButton
                  aria-label="Remove Staff"
                  onClick={() => void admin.remove(member)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ))}

      <Dialog
        open={admin.dialogOpen}
        onClose={admin.closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="staff-dialog-title">
          {admin.editingMemberId === null ? "Add Staff" : "Edit Staff"}
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 2,
          }}
        >
          {admin.error && (
            <Typography color="error">{admin.error}</Typography>
          )}

          <TextField
            id="staff-username"
            autoFocus
            required
            label="Username"
            value={admin.form.username}
            onChange={(event) =>
              admin.updateForm("username", event.target.value)
            }
          />

          <TextField
            id="staff-name"
            label="Name"
            value={admin.form.name}
            onChange={(event) =>
              admin.updateForm("name", event.target.value)
            }
          />

          <TextField
            id="staff-email"
            label="Email"
            type="email"
            value={admin.form.email}
            onChange={(event) =>
              admin.updateForm("email", event.target.value)
            }
          />

          <TextField
            id="staff-password"
            required={admin.editingMemberId === null}
            label={
              admin.editingMemberId === null
                ? "Password"
                : "New Password (optional)"
            }
            type={showPassword ? "text" : "password"}
            value={admin.form.password}
            onChange={(event) =>
              admin.updateForm("password", event.target.value)
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() =>
                        setShowPassword((visible) => !visible)
                      }
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            id="staff-confirm-password"
            required={admin.editingMemberId === null}
            label={
              admin.editingMemberId === null
                ? "Confirm password"
                : "Confirm New Password"
            }
            type={showPassword ? "text" : "password"}
            value={admin.form.confirmPassword}
            onChange={(event) =>
              admin.updateForm("confirmPassword", event.target.value)
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() =>
                        setShowPassword((visible) => !visible)
                      }
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={admin.closeDialog} disabled={admin.saving}>
            Cancel
          </Button>

          <Button
            id="staff-create-button"
            variant="contained"
            onClick={() => void admin.save()}
            disabled={admin.saving}
          >
            {admin.saving
              ? "Saving..."
              : admin.editingMemberId === null
                ? "Create"
                : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminStaffPanel;
