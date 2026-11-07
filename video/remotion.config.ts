import { Config } from "@remotion/cli/config";

// Read the case studies' screens straight from the site, so there's one copy of each.
Config.setPublicDir("../public/projects");
Config.setVideoImageFormat("jpeg");
// Plays muted on a loop in the case study, so a lighter file beats the last bit of quality.
Config.setCrf(26);
Config.setMuted(true);
// Font and image loading can be slow on a cold start.
Config.setTimeoutInMilliseconds(120000);
