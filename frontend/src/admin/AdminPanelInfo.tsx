import { Paper, Typography } from "@mui/material";

interface Props {
  title: string;
  children: string;
}
const AdminPanelInfo = ({ title, children }: Props) => (
  <Paper
    sx={{
      order: 99,
      mt: 4,
      p: 3,
      border: "1px solid",
      borderColor: "var(--border)",
      backgroundColor: "var(--panel)",
      color: "var(--text)",
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </Typography>
    <Typography
      variant="body1"
      sx={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
    >
      {children}
    </Typography>
  </Paper>
);
export default AdminPanelInfo;
// Κοινό ενημερωτικό block που εμφανίζεται στο κάτω μέρος των Admin panels.
