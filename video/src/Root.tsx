import { Composition } from "remotion";
import { AutoPharmaX, AUTOPHARMAX_DURATION } from "./AutoPharmaX";
import { IdCard, ID_CARD_DURATION } from "./IdCard";
import { Iimsc, IIMSC_DURATION } from "./Iimsc";
import { Irsya, IRSYA_DURATION } from "./Irsya";
import { RunClub, RUN_CLUB_DURATION } from "./RunClub";
import { Norxio, NORXIO_DURATION } from "./Norxio";
import { Praman, PRAMAN_DURATION } from "./Praman";
import { SeaGuard, SEAGUARD_DURATION } from "./SeaGuard";
import { SpeakerEncoder, SPEAKER_ENCODER_DURATION } from "./SpeakerEncoder";
import { Prepbook, PREPBOOK_DURATION } from "./Prepbook";
import { RudraCargo, RUDRA_CARGO_DURATION } from "./RudraCargo";
import { SuDesign9, SU_DESIGN9_DURATION } from "./SuDesign9";

const size = { fps: 30, width: 1920, height: 1080 };

export function Root() {
  return (
    <>
      <Composition id="Prepbook" component={Prepbook} durationInFrames={PREPBOOK_DURATION} {...size} />
      <Composition id="SuDesign9" component={SuDesign9} durationInFrames={SU_DESIGN9_DURATION} {...size} />
      <Composition id="RudraCargo" component={RudraCargo} durationInFrames={RUDRA_CARGO_DURATION} {...size} />
      <Composition id="Iimsc" component={Iimsc} durationInFrames={IIMSC_DURATION} {...size} />
      <Composition id="Norxio" component={Norxio} durationInFrames={NORXIO_DURATION} {...size} />
      <Composition id="Praman" component={Praman} durationInFrames={PRAMAN_DURATION} {...size} />
      <Composition id="SeaGuard" component={SeaGuard} durationInFrames={SEAGUARD_DURATION} {...size} />
      <Composition id="IdCard" component={IdCard} durationInFrames={ID_CARD_DURATION} {...size} />
      <Composition id="RunClub" component={RunClub} durationInFrames={RUN_CLUB_DURATION} {...size} />
      <Composition id="AutoPharmaX" component={AutoPharmaX} durationInFrames={AUTOPHARMAX_DURATION} {...size} />
      <Composition id="SpeakerEncoder" component={SpeakerEncoder} durationInFrames={SPEAKER_ENCODER_DURATION} {...size} />
      <Composition id="Irsya" component={Irsya} durationInFrames={IRSYA_DURATION} {...size} />
    </>
  );
}
