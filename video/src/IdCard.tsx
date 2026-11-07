import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Browser, ease, FadeUp, Pan, Paper, Scenes, scenesDuration, Split, ThemeContext, useBetween, useProgress, Words, type Theme } from "./kit";

/** The site's own look: one electric blue, Arial Narrow pulled tight, pixel stickers and grey Windows 95 buttons. */
const BLUE = "#1D19EA";
const GREEN = "#12BA10";
const narrow = '"Arial Narrow", Arial, sans-serif';
const theme: Theme = {
  ink: "#111111",
  muted: "#6B6B6B",
  paper: "#FAFAFA",
  accent: `linear-gradient(${BLUE}, ${BLUE})`,
  glow: "rgba(29,25,234,0.07)",
  sans: narrow,
  headline: { fontFamily: narrow, fontWeight: 400, fontSize: 132, lineHeight: 0.95, letterSpacing: "-0.04em" },
};

const v = (name: string) => staticFile(`id-card/v/${name}.webp`);

/** useProgress for items in a list, where a hook per item isn't allowed. */
const rise = (frame: number, delay: number, duration: number) =>
  interpolate(frame - delay, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** A grey bevelled button, as on the site. */
function Button({ children, delay = 0, press, style }: { children: ReactNode; delay?: number; press?: number; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const down = press !== undefined && frame >= press && frame < press + 8;
  return (
    <FadeUp delay={delay} style={style}>
      <div
        style={{
          fontFamily: narrow,
          fontWeight: 700,
          fontSize: 30,
          color: "#111",
          padding: "16px 40px",
          background: "linear-gradient(#F2F2F2, #C9C9C9)",
          border: "2px solid #111",
          boxShadow: down ? "inset 3px 3px 0 #8A8A8A" : "inset -3px -3px 0 #8A8A8A, inset 3px 3px 0 #fff",
          transform: down ? "translateY(2px)" : undefined,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </FadeUp>
  );
}

/** A pixel sticker that pops in and then bobs. */
function Sticker({ name, x, y, width, delay, turn = 0 }: { name: string; x: number; y: number; width: number; delay: number; turn?: number }) {
  const frame = useCurrentFrame();
  const p = useProgress(delay, 20);
  const pop = interpolate(p, [0, 0.7, 1], [0, 1.15, 1]);
  const bob = Math.sin((frame - delay) / 14) * 6;
  return <Img src={v(name)} style={{ position: "absolute", left: x, top: y + bob, width, transform: `scale(${pop}) rotate(${turn}deg)`, imageRendering: "pixelated" }} />;
}

function Narrow({ children, size = 132, color = BLUE, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ ...theme.headline, fontSize: size, color, ...style }}>{children}</div>;
}

function Tag({ children, delay = 0, color = BLUE }: { children: ReactNode; delay?: number; color?: string }) {
  return (
    <FadeUp delay={delay} style={{ fontFamily: narrow, fontSize: 30, color }}>
      {children}
    </FadeUp>
  );
}

function Intro() {
  return (
    <Paper>
      <Sticker name="star" x={560} y={170} width={150} delay={30} />
      <Sticker name="disc" x={1500} y={150} width={130} delay={36} />
      <Sticker name="mug" x={250} y={440} width={110} delay={42} />
      <Sticker name="object" x={230} y={700} width={150} delay={48} />
      <Sticker name="warning" x={1560} y={640} width={150} delay={54} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Narrow size={168}>
          <Words text="create your own" delay={6} />
          <Words text="(custom id)" delay={16} />
        </Narrow>
        <Tag delay={40} color={GREEN}>
          made by @shuisbored
        </Tag>
        <Img src={v("spotify-soundwave")} style={{ width: 300, marginTop: 50, opacity: useProgress(58, 20) }} />
      </AbsoluteFill>
    </Paper>
  );
}

const STATS = [
  { value: 3_500_000, label: "views" },
  { value: 142_000, label: "likes" },
  { value: 136_000, label: "saves" },
  { value: 108_000, label: "shares" },
];
const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function Viral() {
  const frame = useCurrentFrame();
  return (
    <Paper>
      <Split width={760}>
        <Tag>episode 10 · the bored files</Tag>
        <Narrow size={120} color={theme.ink}>
          <Words text="It started with *a* *card* *tutorial.*" delay={6} />
        </Narrow>
        <FadeUp delay={40} style={{ fontFamily: narrow, fontSize: 36, color: theme.muted, lineHeight: 1.3 }}>
          A Call Me If You Get Lost ID, made on someone else&apos;s site. Then it went viral overnight.
        </FadeUp>
      </Split>
      <div style={{ position: "absolute", left: 1040, top: 250, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "50px 80px" }}>
        {STATS.map((stat, i) => {
          const n = interpolate(frame, [50 + i * 10, 110 + i * 10], [0, stat.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          return (
            <FadeUp key={stat.label} delay={44 + i * 10}>
              <Narrow size={150} style={{ fontVariantNumeric: "tabular-nums" }}>
                {compact(n).toUpperCase()}
              </Narrow>
              <div style={{ fontFamily: narrow, fontSize: 32, color: theme.muted }}>{stat.label}</div>
            </FadeUp>
          );
        })}
      </div>
    </Paper>
  );
}

const REQUESTS = [
  "can you do an Oscorp one from Spider-Man?",
  "this is so cool, do a TVA one!",
  "bro McLovin license WHEN",
  "do you have a website for this?",
  "make a Hogwarts student ID!!",
  "can you make more templates?? 🙏",
  "NEED more cards like this 😍",
  "how do I get more templates?",
];

function Inbox() {
  const frame = useCurrentFrame();
  const count = Math.min(99, Math.round(interpolate(frame, [20, 150], [1, 99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <Paper>
      {REQUESTS.map((text, i) => {
        const p = rise(frame, 14 + i * 11, 22);
        const angle = (i * 137) % 360;
        const r = 330 + (i % 3) * 70;
        const x = 960 + Math.cos((angle * Math.PI) / 180) * r * 1.5;
        const y = 540 + Math.sin((angle * Math.PI) / 180) * r * 0.75;
        return (
          <div
            key={text}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${0.8 + p * 0.2})`,
              opacity: p,
              fontFamily: narrow,
              fontSize: 30,
              color: "#222",
              background: "#fff",
              border: "2px solid #C9C9DA",
              boxShadow: "6px 6px 0 rgba(29,25,234,0.12)",
              padding: "12px 20px",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <Button delay={0}>
            <span style={{ fontSize: 56, padding: "0 20px" }}>✉ Inbox</span>
          </Button>
          <div style={{ position: "absolute", right: -26, top: -26, background: "#D8141C", color: "#fff", fontFamily: narrow, fontWeight: 700, fontSize: 30, padding: "4px 12px", fontVariantNumeric: "tabular-nums" }}>
            {count === 99 ? "99+" : count}
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
}

function Process() {
  const enter = useProgress(10, 34);
  const pan = useBetween(40, 200);
  const swap = useBetween(110, 135);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "110px 160px 0", gap: 18 }}>
        <Tag>process · figma</Tag>
        <Narrow size={104} color={theme.ink}>
          <Words text="Every prop rebuilt *in* *Figma* *first.*" delay={6} />
        </Narrow>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 160, top: 400, opacity: enter, transform: `translateY(${(1 - enter) * 120}px)` }}>
        <div style={{ position: "absolute", opacity: 1 - swap }}>
          <Pan src="id-card/oscorp-process.webp" image={{ width: 2400, height: 1776 }} width={1600} height={580} progress={0} />
        </div>
        <div style={{ opacity: swap }}>
          <Pan src="id-card/site-iterations.webp" image={{ width: 2736, height: 954 }} width={1600} height={580} progress={pan} />
        </div>
      </div>
    </Paper>
  );
}

const CARDS = [
  { name: "oscorp-card-stacked", ratio: 462 / 417, label: "tasm: oscorp staff id", when: "6 Aug" },
  { name: "tva-loki-card-stacked", ratio: 1024 / 928, label: "doomsday: loki tva id", when: "13 Aug" },
  { name: "mclovin-card-stacked", ratio: 652 / 1024, label: "superbad: mclovin's driver license", when: "6 Sep" },
];

function Templates() {
  const frame = useCurrentFrame();
  return (
    <Paper>
      <div style={{ position: "absolute", left: 160, top: 110, display: "flex", alignItems: "center", gap: 30 }}>
        <Narrow size={120}>
          <Words text="templates" delay={4} />
        </Narrow>
        <Img src={v("pixel-pencil")} style={{ width: 110, opacity: useProgress(18, 20) }} />
      </div>
      <FadeUp delay={14} style={{ position: "absolute", right: 160, top: 150, fontFamily: narrow, fontSize: 34, color: theme.muted }}>
        one card per video
      </FadeUp>
      <div style={{ position: "absolute", left: 160, right: 160, top: 330, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {CARDS.map((card, i) => {
          const p = rise(frame, 24 + i * 16, 32);
          const width = card.ratio < 1 ? 470 : 340;
          return (
            <div key={card.name} style={{ width: 500, display: "flex", flexDirection: "column", alignItems: "center", opacity: p, transform: `translateY(${(1 - p) * 260}px) rotate(${(1 - p) * (i - 1) * 8}deg)` }}>
              <div style={{ height: 470, display: "flex", alignItems: "center" }}>
                <Img src={v(card.name)} style={{ width, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.25))" }} />
              </div>
              <div style={{ fontFamily: narrow, fontSize: 32, color: BLUE, marginTop: 30, letterSpacing: "-0.02em" }}>{card.label}</div>
              <div style={{ fontFamily: narrow, fontSize: 26, color: theme.muted, marginTop: 6 }}>{card.when}</div>
            </div>
          );
        })}
      </div>
    </Paper>
  );
}

function Editor() {
  const frame = useCurrentFrame();
  const enter = useProgress(8, 30);
  const photo = useProgress(70, 24);
  const name = "Shubham Patil";
  const typed = name.slice(0, Math.max(0, Math.floor((frame - 100) / 2.5)));
  const qr = useProgress(150, 10);
  const cut = useProgress(170, 10);
  return (
    <Paper>
      <Split width={640}>
        <Tag>create your own</Tag>
        <Narrow size={116} color={theme.ink}>
          <Words text="Edit the card, *not* *a* *form.*" delay={6} />
        </Narrow>
        <FadeUp delay={40} style={{ fontFamily: narrow, fontSize: 36, color: theme.muted, lineHeight: 1.3 }}>
          Click the photo to upload and crop. Click the name to type over it. Nothing leaves your browser.
        </FadeUp>
        <div style={{ display: "flex", gap: 40, marginTop: 10 }}>
          {[
            ["cutting lines", cut],
            ["custom qr", qr],
          ].map(([label, on]) => (
            <FadeUp key={label as string} delay={50} style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: narrow, fontSize: 30, color: BLUE }}>
              {label}
              <span style={{ width: 70, height: 38, borderRadius: 19, border: "2px solid #111", background: (on as number) > 0.5 ? "#8E8CF2" : "#E4E4E4", position: "relative" }}>
                <span style={{ position: "absolute", top: 3, left: 3 + (on as number) * 32, width: 28, height: 28, borderRadius: "50%", background: "#fff", border: "2px solid #111" }} />
              </span>
            </FadeUp>
          ))}
        </div>
      </Split>
      <div style={{ position: "absolute", left: 960, top: 150, width: 480, height: 763, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}>
        <Img src={v("oscorp-custom-front-clean")} style={{ position: "absolute", inset: 0, width: 480, borderRadius: 22, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.35)", opacity: 1 - photo }} />
        <Img src={v("oscorp-mine")} style={{ position: "absolute", inset: 0, width: 480, borderRadius: 22, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.35)", opacity: photo }} />
        {/* The typed name sits over the card's name line until the finished card takes over. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 618, textAlign: "center", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 28, letterSpacing: "0.06em", color: "#111", opacity: frame > 100 && frame < 150 ? 1 : 0, background: "#fff" }}>
          {typed}
          <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 1470, top: 150, width: 300, opacity: enter, transform: `translateY(${(1 - enter) * 200}px)` }}>
        <Img src={v("oscorp-custom-back")} style={{ width: 300, borderRadius: 16, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.35)" }} />
        <Img src={v("oscorp-back-mine")} style={{ position: "absolute", left: 0, top: 0, width: 300, borderRadius: 16, opacity: qr }} />
      </div>
    </Paper>
  );
}

function Tricks() {
  const slider = interpolate(useCurrentFrame(), [40, 100], [0, 45], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const left = useProgress(8, 30);
  const right = useProgress(26, 30);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "100px 160px 0", gap: 16 }}>
        <Tag>details</Tag>
        <Narrow size={104} color={theme.ink}>
          <Words text="Each card gets *its* *own* *trick.*" delay={6} />
        </Narrow>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 160, top: 400, display: "flex", gap: 60, alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 40, alignItems: "center", opacity: left, transform: `translateY(${(1 - left) * 120}px)` }}>
          <div style={{ position: "relative", width: 300, height: 476 }}>
            <Img src={v("tva-mine")} style={{ position: "absolute", width: 300, borderRadius: 18, filter: `sepia(${(45 - slider) / 45}) saturate(${0.6 + slider / 60})` }} />
          </div>
          <div style={{ width: 320, fontFamily: narrow, fontSize: 30, color: theme.ink }}>
            <div style={{ color: BLUE }}>apply image filter</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
              <span style={{ flex: 1, height: 8, borderRadius: 4, background: "#D7DCE6", position: "relative" }}>
                <span style={{ position: "absolute", left: `${(slider / 100) * 100}%`, top: -10, width: 28, height: 28, borderRadius: "50%", background: BLUE, transform: "translateX(-50%)" }} />
              </span>
              <span style={{ color: BLUE, fontVariantNumeric: "tabular-nums", width: 60 }}>{Math.round(slider)}%</span>
            </div>
            <div style={{ marginTop: 26, color: theme.muted, lineHeight: 1.3 }}>TVA: any selfie, in the show&apos;s sepia-green.</div>
          </div>
        </div>
        <div style={{ opacity: right, transform: `translateY(${(1 - right) * 120}px)` }}>
          <Browser src="id-card/signature.webp" url="id.patilshubham.me" width={760} viewport={420} image={{ width: 1440, height: 900 }} scroll={0.42} />
          <div style={{ fontFamily: narrow, fontSize: 30, color: theme.muted, marginTop: 24 }}>McLovin: sign it yourself, scannable PDF417 on the back.</div>
        </div>
      </div>
    </Paper>
  );
}

function Launch() {
  const frame = useCurrentFrame();
  const visitors = interpolate(frame, [30, 100], [0, 20229], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const views = interpolate(frame, [40, 110], [0, 31236], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const fmt = (n: number) => Math.round(n).toLocaleString("en");
  const warn = useProgress(120, 20);
  return (
    <Paper>
      <Split width={1500}>
        <Tag>launch · first two weeks</Tag>
        <div style={{ display: "flex", gap: 120 }}>
          {[
            [fmt(visitors), "visitors"],
            [fmt(views), "page views"],
          ].map(([value, label]) => (
            <div key={label}>
              <Narrow size={230} style={{ fontVariantNumeric: "tabular-nums" }}>
                {value}
              </Narrow>
              <div style={{ fontFamily: narrow, fontSize: 36, color: theme.muted }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ opacity: warn, transform: `translateY(${(1 - warn) * 30}px)`, width: 900, border: "2px solid #111", background: "#fff", boxShadow: "8px 8px 0 rgba(0,0,0,0.12)" }}>
          <div style={{ background: "linear-gradient(90deg, #A3141B, #D8141C)", color: "#fff", fontFamily: "monospace", fontWeight: 700, fontSize: 22, padding: "8px 14px" }}>inbox — 1 new</div>
          <div style={{ fontFamily: narrow, fontSize: 32, padding: "18px 20px", color: theme.ink }}>Vercel: approaching your limits. The free plan did not survive.</div>
        </div>
      </Split>
    </Paper>
  );
}

function Talk() {
  const zoom = useBetween(0, 200);
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <Img src={staticFile("id-card/talk-poster.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + zoom * 0.08})`, opacity: 0.85 }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 26, color: "#fff" }}>
        <Tag color="#B9B8FF">22 Oct 2026 · Dublin</Tag>
        <Narrow size={140} color="#fff">
          <Words text="Then I gave" delay={8} />
          <Words text="a talk about it." delay={18} />
        </Narrow>
        <FadeUp delay={44} style={{ fontFamily: narrow, fontSize: 40, opacity: 0.85 }}>
          Demos Anon at Dogpatch Labs
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function End() {
  return (
    <Paper>
      <Sticker name="pixel-cat-ty" x={1480} y={640} width={190} delay={40} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Narrow size={170}>
          <Words text="just keep creating." delay={6} />
        </Narrow>
        <FadeUp delay={30} style={{ fontFamily: narrow, fontSize: 40, color: theme.ink, marginTop: 34 }}>
          Shubham Patil · design, build &amp; videos
        </FadeUp>
        <div style={{ marginTop: 50 }}>
          <Button delay={46} press={90}>
            id.patilshubham.me
          </Button>
        </div>
      </AbsoluteFill>
    </Paper>
  );
}

const SCENES = [
  { Scene: Intro, frames: 120 },
  { Scene: Viral, frames: 190 },
  { Scene: Inbox, frames: 170 },
  { Scene: Process, frames: 210 },
  { Scene: Templates, frames: 180 },
  { Scene: Editor, frames: 230 },
  { Scene: Tricks, frames: 200 },
  { Scene: Launch, frames: 180 },
  { Scene: Talk, frames: 170 },
  { Scene: End, frames: 140 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade(), slide({ direction: "from-right" }), fade(), fade(), fade()];

export const ID_CARD_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function IdCard() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
