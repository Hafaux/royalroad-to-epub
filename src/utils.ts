import { access, constants } from "fs/promises";

export async function exists(filepath: string) {
  try {
    await access(filepath, constants.F_OK);

    return true;
  } catch (err) {
    return false;
  }
}
