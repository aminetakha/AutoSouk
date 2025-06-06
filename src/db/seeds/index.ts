import { generateMakeAndModelData } from "./make_model_seed";

export const seeds = async () => {
  await generateMakeAndModelData();
};
