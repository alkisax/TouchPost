import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { handleLogout } from "../authLogin/authFunctions";
import { UserAuthContext } from "../authLogin/context/UserAuthContext";
import { getEffectiveRole } from "../authLogin/types/types";
import { backendUrl } from "../constants/constants";

const DeleteAccountButton = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user ? getEffectiveRole(user) === "ADMIN" : false;
  const isUser = user ? getEffectiveRole(user) === "USER" : false;

  if ((!isAdmin && !isUser) || !user) {
    return null;
  }

  const handleOpen = () => {
    setError("");
    setCurrentPassword("");
    setOpen(true);
  };

  const handleClose = () => {
    if (!isDeleting) {
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPassword.trim()) {
      setError("Enter your current password.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await axios.delete(`${backendUrl}/users/self`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          password: currentPassword,
        },
      });

      await handleLogout(setUser, navigate);
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 401
      ) {
        setError("The current password is incorrect.");
      } else {
        setError("Account deletion failed. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        id="delete-account-button"
        color="error"
        variant="outlined"
        onClick={handleOpen}
        sx={{ mt: 4 }}
      >
        Delete Account
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Delete Account</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
          {isAdmin
            ? "This permanently deletes your ADMIN account."
            : "This permanently deletes your USER account."}
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            id="delete-account-password"
            autoFocus
            fullWidth
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            disabled={isDeleting}
            autoComplete="current-password"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>

          <Button
            id="delete-account-confirm-button"
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteAccountButton;
