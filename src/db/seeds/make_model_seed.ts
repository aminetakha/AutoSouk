import fs from "fs/promises";
import path from "path";
import { makeTable } from "../schema/car_make";
import { db } from "..";
import { carModelTable } from "../schema/car_model";

export const generateMakeAndModelData = async () => {
  const makes = await fs.readFile(path.join(__dirname, "/data/makes.json"), {
    encoding: "utf8",
  });
  const models = await fs.readFile(path.join(__dirname, "/data/models.json"), {
    encoding: "utf8",
  });
  await db.insert(makeTable).values(JSON.parse(makes)).onConflictDoNothing();
  await db
    .insert(carModelTable)
    .values(JSON.parse(models))
    .onConflictDoNothing();
};
