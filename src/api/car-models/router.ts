import { Router } from "express";
import { db } from "../../db";
import { carModelTable } from "../../db/schema/car_model";
import { eq } from "drizzle-orm";

const carModelRouter = Router();

carModelRouter.get("/:make_id", async (req, res) => {
  const makeId = Number(req.params.make_id);
  const models = await db
    .select({ id: carModelTable.id, name: carModelTable.name })
    .from(carModelTable)
    .where(eq(carModelTable.makeId, makeId));
  res.status(200).json({ models });
});

export default carModelRouter;
