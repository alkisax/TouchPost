import { Box, Skeleton } from "@mui/material";

export const SkeletonGeneral = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="text" width="35%" height={50} />
    <Skeleton variant="text" width="60%" />

    <Skeleton
      variant="rectangular"
      height={120}
      sx={{ mt: 3, borderRadius: 1 }}
    />

    <Skeleton
      variant="rectangular"
      height={120}
      sx={{ mt: 2, borderRadius: 1 }}
    />
  </Box>
);

export default SkeletonGeneral