import type { Request, Response } from 'express';

export const forwardFrontLog = (req: Request, res: Response) => {
  const { frontLog } = req.body ?? {};

  if (typeof frontLog !== 'string') {
    return res.status(400).json({
      status: false,
      message: 'frontLog must be a string',
    });
  }

  console.log(`FRONT LOG: ${frontLog}`);
  return res.sendStatus(200);
};
