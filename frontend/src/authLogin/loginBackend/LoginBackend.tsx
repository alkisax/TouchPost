import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

import { getEffectiveRole, type BackendLoginResponse } from "../types/types";
import { normalizeAuthUser } from "../authUser";

import { UserAuthContext } from "../context/UserAuthContext";

interface Props {
  url: string;
}

const LoginBackend = ({ url }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserAuthContext);

  const handleSubmitBackend = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      
      const response = await axios.post<BackendLoginResponse>(`${url}/auth/login`, {
        username,
        password,
      });

      const token = response.data.data.token;
      const user = normalizeAuthUser(response.data.data.user);

      localStorage.setItem("token", token);

      setUser(user);

      // Όλοι οι ρόλοι χρησιμοποιούν το ίδιο endpoint login. Μετά την επιτυχία
      // ο προορισμός επιλέγεται από το normalized auth context, όχι από
      // backend-specific JWT claims που διαφέρουν μεταξύ Node και .NET.
      const role = getEffectiveRole(user);
      const destinationByRole = {
        SUPERADMIN: "/superadmin",
        ADMIN: "/admin",
        STAFF: "/staff",
        USER: "/user",
      } as const;

      navigate(destinationByRole[role]);
    } catch {
      setErrorMessage("Invalid username or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmitBackend}
      sx={{
        maxWidth: 400,
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 5,
        color: "var(--text)",
      }}
    >
      <TextField
        id="login-username"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        autoComplete="username"
        sx={{
          "& .MuiInputBase-input": { color: "var(--text)" },
          "& .MuiInputLabel-root": { color: "var(--text-muted)" },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--border)",
          },
        }}
      />

      <TextField
        id="login-password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        autoComplete="current-password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiInputBase-input": { color: "var(--text)" },
          "& .MuiInputLabel-root": { color: "var(--text-muted)" },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--border)",
          },
        }}
      />

      {errorMessage && (
        <Typography variant="body2" color="error" align="center">
          {errorMessage}
        </Typography>
      )}

      <Button
        id="login-submit-button"
        type="submit"
        variant="contained"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <Typography variant="body2" align="center">
        Don’t have an account?{" "}
        <Link to="/register">Register</Link>
      </Typography>
    </Box>
  );
};

export default LoginBackend;
