import { Box, Paper, Typography } from "@mui/material";

import AdminPanelInfo from "./AdminPanelInfo";
import DeleteAccountButton from "../components/DeleteAccountButton";

const AdminOverviewPanel = () => {
  return (
    <Box>
      <Typography id="admin-overview-title" variant="h5" sx={{ mb: 1 }}>
        Admin Overview
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your organization and staff from the admin panel.
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Staff</Typography>
        <Typography color="text.secondary">
          Create, edit, and remove staff accounts for your organization.
        </Typography>
      </Paper>

      <AdminPanelInfo title="Organization">
        Your admin account belongs to one organization. Organization access is
        determined automatically by the backend.
      </AdminPanelInfo>

      <Box sx={{ mt: 6 }}>
        <DeleteAccountButton />
      </Box>
    </Box>
  );
};

export default AdminOverviewPanel;
