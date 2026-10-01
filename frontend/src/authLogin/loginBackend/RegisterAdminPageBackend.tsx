import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import {
  frontendValidatePassword,
  frontEndValidateEmail,
} from "../utils/registerBackend";

interface Props {
  url: string;
}

const RegisterAdminPageBackend = ({ url }: Props) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const passwordError = frontendValidatePassword(password);
    const emailError = frontEndValidateEmail(email);

    if (passwordError || emailError) {
      setErrorMessage(passwordError || emailError || "Invalid form");
      setLoading(false);
      return;
    }

    if (
      !username ||
      !name ||
      !email ||
      !organizationName ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Το backend δημιουργεί συναλλακτικά User, Organization και ADMIN
      // membership. Το frontend στέλνει μόνο το όνομα του οργανισμού.
      const response = await axios.post(`${url}/auth/register-admin`, {
        username,
        name,
        email,
        password,
        organizationName,
      });

      if (response.data.status) {
        navigate("/login");
        return;
      }

      setErrorMessage("Registration failed");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Registration failed",
        );
      } else {
        setErrorMessage("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Paper
        sx={{
          p: 4,
          width: 400,
          backgroundColor: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Register as ADMIN
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              id="admin-register-username"
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              fullWidth
            />
            <TextField
              id="admin-register-fullname"
              label="Full Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
            />
            <TextField
              id="admin-register-email"
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
            <TextField
              id="admin-register-organization"
              label="Organization Name"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              required
              fullWidth
            />
            <TextField
              id="admin-register-password"
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />
            <TextField
              id="admin-register-confirm-password"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              fullWidth
            />

            {errorMessage && (
              <Typography color="error" align="center">
                {errorMessage}
              </Typography>
            )}

            <Button
              id="admin-register-submit"
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Loading..." : "Register ADMIN"}
            </Button>
            <Typography variant="body2" align="center">
              Register as a USER? <Link to="/register">Register as USER</Link>
            </Typography>
            <Typography variant="body2" align="center">
              Already have an account? <Link to="/login">Login</Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterAdminPageBackend;
