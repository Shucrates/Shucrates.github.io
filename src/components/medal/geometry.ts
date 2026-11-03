/*
 * Shared facts about the medal model (public/objects/medal/medal.glb), measured once
 * it hangs straight. Model units: the medal is 1 unit wide, y up.
 */

export const MODEL_URL = "/objects/medal/medal.glb";

export const MEDAL = {
  /** Turn about x that makes the ribbon hang straight down (the model ships worn around a neck). */
  hang: 0.91,
  /** Overall height, ribbon loop included. */
  height: 1.86,
  /** From the top of the ribbon loop (where it sits on the hook) down to where it meets the clasp. */
  ribbonLength: 1.34,
  /** From the clasp down to the disc's centre; everything below the clasp is rigid. */
  discDrop: 0.26,
  discRadius: 0.22,
};
