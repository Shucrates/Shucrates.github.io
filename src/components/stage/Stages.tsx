"use client";

import { cameraStage } from "@/components/camera/stage";
import { cardStage } from "@/components/card/stage";
import { folderStage } from "@/components/folder/stage";
import { ipodStage } from "@/components/ipod/stage";
import { laptopStage } from "@/components/laptop/stage";
import { medalStage } from "@/components/medal/stage";
import { ObjectStage } from "./ObjectStage";

/** Every 3D object on the site, each on its own canvas. */
export const stages = { camera: cameraStage, laptop: laptopStage, card: cardStage, medal: medalStage, ipod: ipodStage, folder: folderStage };

export function Stages() {
  return (
    <>
      <ObjectStage config={cameraStage} />
      <ObjectStage config={laptopStage} />
      <ObjectStage config={cardStage} />
      <ObjectStage config={medalStage} />
      <ObjectStage config={ipodStage} />
      <ObjectStage config={folderStage} />
    </>
  );
}
