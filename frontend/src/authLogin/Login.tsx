// frontend\src\authLogin\Login.tsx
import { useState } from "react";
import { Box, Tab, Tabs, Typography, Paper } from "@mui/material";
import LoginBackend from "./loginBackend/LoginBackend";

interface Params {
  url: string;
}

const Login = ({ url }: Params) => {
  const [tab, setTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "var(--background)",
          color: "var(--text)",
          p: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: 400,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            textAlign: "center",
            backgroundColor: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{ mb: 2 }}
          >
            Login
          </Typography>

          {/* Tabs */}
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab
              id="tab-backend-login"
              label="Login"
            />
          </Tabs>

          {/* Conditional rendering of login forms */}
          {tab === 0 && <LoginBackend url={url} />}
        </Paper>
      </Box>
    </>
  );
};

export default Login;

