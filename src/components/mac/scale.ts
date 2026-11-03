import { createContext, useContext } from "react";

/**
 * The Mac's screen is laid out at a fixed logical size (see SCREEN_WIDTH) and scaled
 * to fit the 3D laptop's display. Pointer maths divides by this to stay in logical px.
 */
export const SCREEN_WIDTH = 1440;
export const ScaleContext = createContext(1);
export const useScreenScale = () => useContext(ScaleContext);
