// frontend/src/components/layoutComponents/Navbar.tsx

import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip, Menu, MenuItem, } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import InfoIcon from "@mui/icons-material/Info";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { appName } from "../../constants/constants";

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { UserAuthContext } from "../../authLogin/context/UserAuthContext";
import { handleLogout } from "../../authLogin/authFunctions";
import { getEffectiveRole } from "../../authLogin/types/types";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const role = user ? getEffectiveRole(user) : null;
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleLogout(setUser, navigate);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "var(--surface)",
          color: "var(--text)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Toolbar>
          {/* LOGO */}
          <Box
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {appName}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* DESKTOP */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            <Tooltip title="Info">
              <IconButton component={NavLink} to="/info" sx={{ color: "inherit" }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Toggle theme">
              <IconButton
                onClick={() => {
                  toggleTheme();
                }}
                sx={{ color: "inherit" }}
              >
                {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            {user ? (
              <>
                {role === "SUPERADMIN" && (
                  <Tooltip title="Superadmin">
                    <IconButton
                      component={NavLink}
                      to="/superadmin"
                      sx={{ color: "inherit" }}
                    >
                      <BadgeIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {role === "ADMIN" && (
                  <Tooltip title="Admin">
                    <IconButton
                      component={NavLink}
                      to="/admin"
                      sx={{ color: "inherit" }}
                    >
                      <AdminPanelSettingsIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {role === "STAFF" && (
                  <Tooltip title="Staff">
                    <IconButton
                      component={NavLink}
                      to="/staff"
                      sx={{ color: "inherit" }}
                    >
                      <BadgeIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {role === "USER" && (
                  <Tooltip title="User">
                    <IconButton
                      component={NavLink}
                      to="/user"
                      sx={{ color: "inherit" }}
                    >
                      <PersonIcon />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Logout">
                  <IconButton
                    id="navbar-logout"
                    onClick={handleLogoutClick}
                    sx={{ color: "inherit" }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Login">
                <IconButton
                  component={Link}
                  to="/login"
                  id="navbar-login"
                  sx={{ color: "inherit" }}
                >
                  <LoginIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* MOBILE HAMBURGER */}
          <Box sx={{ display: { xs: "flex", sm: "none" } }}>
            <IconButton onClick={handleMenuOpen} sx={{ color: "inherit" }}>
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem component={NavLink} to="/info" onClick={handleMenuClose}>
                Info
              </MenuItem>

              <MenuItem
                onClick={() => {
                  toggleTheme();
                  handleMenuClose();
                }}
              >
                {theme === "light" ? <DarkModeIcon sx={{ mr: 1 }} /> : <LightModeIcon sx={{ mr: 1 }} />}
                Toggle theme
              </MenuItem>

              {role === "SUPERADMIN" && (
                <MenuItem
                  component={NavLink}
                  to="/superadmin"
                  onClick={() => {
                    handleMenuClose();
                  }}
                >
                  <BadgeIcon sx={{ mr: 1 }} />
                  Superadmin
                </MenuItem>
              )}

              {role === "ADMIN" && (
                <MenuItem
                  component={NavLink}
                  to="/admin"
                  onClick={() => {
                    handleMenuClose();
                  }}
                >
                  <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                  Admin
                </MenuItem>
              )}

              {role === "STAFF" && (
                <MenuItem
                  component={NavLink}
                  to="/staff"
                  onClick={() => {
                    handleMenuClose();
                  }}
                >
                  <BadgeIcon sx={{ mr: 1 }} />
                  Staff
                </MenuItem>
              )}

              {role === "USER" && (
                <MenuItem
                  component={NavLink}
                  to="/user"
                  onClick={() => {
                    handleMenuClose();
                  }}
                >
                  <PersonIcon sx={{ mr: 1 }} />
                  User
                </MenuItem>
              )}

              {user ? (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogoutClick();
                  }}
                >
                  Logout
                </MenuItem>
              ) : (
                <MenuItem
                  component={Link}
                  to="/login"
                  id="navbar-mobile-login"
                  onClick={handleMenuClose}
                >
                  Login
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* offset για να μη σκεπάζει το fixed navbar το περιεχόμενο */}
      <Toolbar />
    </>
  );
};

export default Navbar;
