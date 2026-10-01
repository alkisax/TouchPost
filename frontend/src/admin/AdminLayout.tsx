// frontend\src\admin\AdminLayout.tsx

import { useState } from "react";
import { Box } from "@mui/material";

import AdminSidebar from "./AdminSidebar";
import AdminStaffPanel from "./AdminStaffPanel";
import AdminOverviewPanel from "./AdminOverviewPanel";

const AdminLayout = () => {
  const [activePanel, setActivePanel] = useState("overview");

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <AdminSidebar activePanel={activePanel} onSelect={setActivePanel} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          ml: { sm: 1 },
          maxWidth: 1200,
        }}
      >
        {activePanel === "overview" && <AdminOverviewPanel />}

        {activePanel === "staff" && (
          <AdminStaffPanel />
        )}

      </Box>
    </Box>
  );
};

export default AdminLayout;
// Κεντρικό layout του Admin: κρατά το ενεργό panel και την επιλεγμένη organization.
