import { Request, Response } from "express";
import cloudinary from "../config/cloudinary/cloudinary";
import { handleControllerError } from "../utils/error/errorHandler";

export const getPhotos = async (req: Request, res: Response) => {
  try {
    const nextCursor = req.query.next_cursor as string | undefined

    const sub1 = await cloudinary.api.resources_by_asset_folder(
      "photoPortfolio/sub1",
      {
        max_results: 3,
        next_cursor: nextCursor,
      },
    );

    const sub2 = await cloudinary.api.resources_by_asset_folder(
      "photoPortfolio/sub2",
      {
        max_results: 100,
      },
    );
    return res.status(200).json({
      status: true,
      sub1: sub1.resources,
      sub2: sub2.resources,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};
