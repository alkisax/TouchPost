// frontend/src/admin/AdminSidebar.tsx

import { useState } from "react";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

interface Props {
  activePanel: string;
  onSelect: (panel: string) => void;
}

const AdminSidebar = ({ activePanel, onSelect }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (panel: string) => {
    onSelect(panel);
    setMobileOpen(false);
  };

  const drawerContent = (
    <>
      <Toolbar />

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "overview"}
            onClick={() => handleSelect("overview")}
          >
            <ListItemIcon>
              <DashboardOutlinedIcon />
            </ListItemIcon>

            <ListItemText primary="Overview" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            id="admin-staff-link"
            selected={activePanel === "staff"}
            onClick={() => handleSelect("staff")}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>

            <ListItemText primary="Staff" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => {
            setMobileOpen((current) => !current);
          }}
          sx={{
            position: "fixed",
            top: 72,
            left: 8,
            zIndex: (currentTheme) => currentTheme.zIndex.drawer + 1,
            backgroundColor: "var(--panel)",
            border: "1px solid",
            borderColor: "var(--border)",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => {
          setMobileOpen(false);
        }}
        sx={{
          width: 220,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: 220,
            boxSizing: "border-box",
            mt: isMobile ? 0 : "64px",
            borderRight: "1px solid",
            borderColor: "var(--border)",
            backgroundColor: "var(--background)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
