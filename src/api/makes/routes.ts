import { Router } from "express";
import { db } from "../../db";
import { makeTable } from "../../db/schema/car_make";

const makeRouter = Router();

makeRouter.get("/", async (req, res) => {
  const makes = await db
    .select({ id: makeTable.id, name: makeTable.name })
    .from(makeTable);
  res.status(200).json({ makes });
});

export default makeRouter;
