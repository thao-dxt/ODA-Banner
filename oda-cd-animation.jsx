// ODA cancer discovery workflow — one continuous composition on a fixed 729×478 canvas (rendered @2x).
const INK = '#121249', BLUE = '#18ADF1', LAV = '#5E5EA8', BG = '#FFF0F7', BUBBLE = '#FFD0E9';
const FONT = "'Figtree', system-ui, sans-serif";
const RAINBOW = 'linear-gradient(90deg, #FF2C94 0%, #FFDC04 36.5%, #61BA00 65.4%, #18ADF1 100%)';
const angular = (deg) => `conic-gradient(from ${deg.toFixed(2)}deg, rgb(59,179,126) 0%, #18ADF1 15.9%, #FF2C94 33.5%, #FFDC04 67.8%, #61BA00 82.5%, rgb(59,179,126) 100%)`;
const CARD_SHADOW = '0 1px 4px rgba(12,12,13,0.05)';
const INNER = 'rgba(238,238,238,0.6)';

const prog = (T, s, d) => clamp((T - s) / d, 0, 1);
// Damped spring over a normalized 0..1 span: zero start velocity, one soft overshoot, settled by p=1.
const spring = (p, z = 0.8, w = 9) => {
  if (p <= 0) return 0; if (p >= 1) return 1;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * p) * (Math.cos(wd * p) + (z * w / wd) * Math.sin(wd * p));
};
const soft = (p) => spring(p, 0.85, 9);
// Keyframed value [[t, v], ...] with sine in-out between keys.
const kf = (t, ks) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) {
    const [t0, v0] = ks[i - 1], [t1, v1] = ks[i];
    return v0 + (v1 - v0) * Easing.easeInOutSine((t - t0) / (t1 - t0));
  }
  return ks[ks.length - 1][1];
};
const MOTION = {
  // fade + short spring rise (opacity on d, motion settles over 1.6·d)
  enter: (T, s, d = 0.32, dy = 6) => {
    const o = Easing.easeOutCubic(prog(T, s, d));
    const m = spring(prog(T, s, d * 1.6), 0.7, 9);
    return { opacity: o, transform: `translateY(${((1 - m) * dy).toFixed(2)}px)` };
  },
  // value travel along keyed segments [{at, dur, to, ease}], soft spring by default
  move: (T, from, segs) => {
    let v = from;
    for (const g of segs) v = v + (g.to - v) * (g.ease || soft)(prog(T, g.at, g.dur));
    return v;
  },
  // button press: down then release
  press: (T, s) => {
    const down = Easing.easeOutQuad(prog(T, s, 0.08));
    const up = Easing.easeInOutSine(prog(T, s + 0.2, 0.25));
    return down * (1 - up);
  },
};
const fadeOut = (T, s, d = 0.25, dy = -8) => {
  const p = Easing.easeOutCubic(prog(T, s, d));
  return { opacity: 1 - p, transform: `translateY(${(p * dy).toFixed(2)}px)` };
};

// Text line positioned by baseline (Figtree: ascent .95em in a 1.2em line box).
function Ln({ x, b, s = 14, w = 400, c = INK, right, rr, style, children }) {
  const st = { position: 'absolute', top: b - 0.92 * s, fontSize: s, lineHeight: `${1.2 * s}px`,
    fontWeight: w, color: c, whiteSpace: 'nowrap', ...style };
  if (rr != null) st.right = rr; else if (right != null) st.right = 729 - right; else st.left = x;
  return <div style={st}>{children}</div>;
}

const REQ1 = 'Which patients in this dataset have pancreatic cancer?';
const REQ2 = 'Create table for KRAS mutations in this cohort using HGVS nomenclature';
const REQ3 = 'Please create a bar chart for KRAS mutations in the pancreatic cancer cohort';
// Smooth typing cadence: near-constant rhythm, tiny jitter, slight space beat; normalized to 0..1 and
// stretched to whatever span the scene timing leaves (retiming a scene keeps typing fluid).
function makeType(str) {
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  let t = 0; const raw = [];
  for (let i = 0; i < str.length; i++) {
    raw.push(t);
    t += 1 + (rnd() - 0.5) * 0.16 + (str[i] === ' ' ? 0.18 : 0);
  }
  return raw.map(x => { const u = x / t; return 0.12 * Easing.easeInOutSine(u) + 0.88 * u; });
}
const TYPE1 = makeType(REQ1);
const TYPE2 = makeType(REQ2);
const TYPE3 = makeType(REQ3);

// Continuous travel distance with a soft speed ramp-in (no loop reset).
const flow = (T, start, v, ramp) => { const t = Math.max(0, T - start); return t < ramp ? v * t * t / (2 * ramp) : v * (t - ramp / 2); };
const FLOW_BG = 'linear-gradient(90deg, #FF2C94 0%, #FFDC04 18.25%, #61BA00 32.7%, #18ADF1 50%, #61BA00 67.3%, #FFDC04 81.75%, #FF2C94 100%)';
const flowStrip = (T, start) => ({ backgroundImage: FLOW_BG, backgroundSize: '1240px 100%', backgroundRepeat: 'repeat-x',
  backgroundPosition: `${(-(flow(T, start, 70, 1.4) % 1240)).toFixed(2)}px 0px` });

function OdaMark({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="60.5 176 12 12" style={{ display: 'block' }}>
      <path fill="#FF2D95" d="M68.7365 181.967C72.2758 179.694 72.5246 177.619 72.4984 176.002H70.0358C70.0478 176.718 70.0196 177.36 69.6268 178.049C69.1202 178.935 68.1452 179.809 66.4995 180.711C66.6596 180.799 66.8228 180.887 66.996 180.975C67.6507 181.309 68.2268 181.64 68.7365 181.967Z" />
      <path fill="#62BB00" d="M64.2644 181.967C60.6768 184.271 60.4723 186.372 60.5025 187.998H62.9651C62.95 187.255 62.9681 186.594 63.373 185.885C63.8797 184.999 64.8546 184.125 66.5004 183.223C66.3403 183.135 66.1771 183.047 66.0039 182.959C65.3492 182.625 64.7731 182.294 64.2634 181.967H64.2644Z" />
      <path fill="#FFDC04" d="M68.7365 181.967C68.2278 182.294 67.6507 182.625 66.996 182.959C66.8238 183.047 66.6596 183.135 66.4995 183.223C68.1442 184.125 69.1202 184.999 69.6268 185.885C70.0317 186.594 70.0499 187.255 70.0347 187.998H72.4974C72.5276 186.371 72.3231 184.27 68.7365 181.967Z" />
      <path fill="#19AEF2" d="M66.5004 180.711C64.8557 179.809 63.8797 178.935 63.3731 178.049C62.9803 177.361 62.951 176.719 62.9641 176.002H60.5015C60.4763 177.619 60.7251 179.694 64.2644 181.967C64.7731 181.64 65.3502 181.309 66.0049 180.975C66.1771 180.887 66.3413 180.799 66.5015 180.711H66.5004Z" />
      <path fill="#121249" d="M68.7365 181.967C68.2278 181.64 67.6507 181.309 66.996 180.975C66.8238 180.887 66.6596 180.799 66.4995 180.711C66.3393 180.799 66.1761 180.887 66.0029 180.975C65.3482 181.309 64.7721 181.64 64.2625 181.967C64.7711 182.294 65.3482 182.625 66.0029 182.959C66.1751 183.047 66.3393 183.135 66.4995 183.223C66.6596 183.135 66.8228 183.047 66.996 182.959C67.6497 182.625 68.2268 182.294 68.7365 181.967Z" />
    </svg>
  );
}

const PEOPLE = 'M72.2 327.398C72.2525 327.437 72.3123 327.466 72.3759 327.482C72.4395 327.499 72.5057 327.502 72.5707 327.493C72.6357 327.484 72.6982 327.462 72.7547 327.428C72.8112 327.395 72.8606 327.351 72.9 327.298C73.2027 326.894 73.5953 326.567 74.0466 326.341C74.4978 326.115 74.9955 325.998 75.5 325.998C76.0045 325.998 76.5022 326.115 76.9534 326.341C77.4047 326.567 77.7973 326.894 78.1 327.298C78.1797 327.404 78.2982 327.474 78.4294 327.493C78.5607 327.511 78.694 327.477 78.8 327.397C78.8378 327.369 78.8713 327.336 78.8994 327.298C79.2021 326.894 79.5947 326.567 80.0459 326.341C80.4972 326.115 80.9948 325.998 81.4994 325.998C82.0039 325.998 82.5015 326.115 82.9528 326.341C83.4041 326.567 83.7966 326.894 84.0994 327.298C84.179 327.404 84.2976 327.474 84.4289 327.493C84.5602 327.512 84.6936 327.477 84.7997 327.398C84.9058 327.318 84.9759 327.199 84.9946 327.068C85.0133 326.937 84.979 326.803 84.8994 326.697C84.4568 326.104 83.8666 325.637 83.1875 325.342C83.5598 325.002 83.8206 324.558 83.9358 324.067C84.0509 323.576 84.015 323.062 83.8327 322.592C83.6504 322.122 83.3303 321.718 82.9143 321.433C82.4984 321.149 82.006 320.996 81.5019 320.996C80.9977 320.996 80.5054 321.149 80.0894 321.433C79.6735 321.718 79.3533 322.122 79.171 322.592C78.9887 323.062 78.9528 323.576 79.068 324.067C79.1831 324.558 79.4439 325.002 79.8162 325.342C79.3259 325.554 78.8805 325.858 78.5037 326.237C78.127 325.858 77.6816 325.554 77.1912 325.342C77.5636 325.002 77.8244 324.558 77.9395 324.067C78.0547 323.576 78.0188 323.062 77.8365 322.592C77.6542 322.122 77.334 321.718 76.9181 321.433C76.5021 321.149 76.0098 320.996 75.5056 320.996C75.0015 320.996 74.5091 321.149 74.0932 321.433C73.6772 321.718 73.3571 322.122 73.1748 322.592C72.9925 323.062 72.9566 323.576 73.0717 324.067C73.1869 324.558 73.4477 325.002 73.82 325.342C73.1379 325.636 72.5448 326.103 72.1 326.698C72.0606 326.751 72.0319 326.81 72.0156 326.874C71.9993 326.937 71.9957 327.004 72.005 327.069C72.0143 327.134 72.0363 327.196 72.0698 327.253C72.1032 327.309 72.1475 327.359 72.2 327.398ZM81.5 321.998C81.7967 321.998 82.0867 322.086 82.3334 322.251C82.58 322.416 82.7723 322.65 82.8858 322.924C82.9994 323.198 83.0291 323.5 82.9712 323.791C82.9133 324.082 82.7704 324.349 82.5607 324.559C82.3509 324.768 82.0836 324.911 81.7926 324.969C81.5017 325.027 81.2001 324.997 80.926 324.884C80.6519 324.77 80.4176 324.578 80.2528 324.331C80.088 324.085 80 323.795 80 323.498C80 323.1 80.158 322.719 80.4393 322.437C80.7206 322.156 81.1022 321.998 81.5 321.998ZM75.5 321.998C75.7967 321.998 76.0867 322.086 76.3334 322.251C76.58 322.416 76.7723 322.65 76.8858 322.924C76.9994 323.198 77.0291 323.5 76.9712 323.791C76.9133 324.082 76.7704 324.349 76.5607 324.559C76.3509 324.768 76.0836 324.911 75.7926 324.969C75.5017 325.027 75.2001 324.997 74.926 324.884C74.6519 324.77 74.4176 324.578 74.2528 324.331C74.088 324.085 74 323.795 74 323.498C74 323.1 74.158 322.719 74.4393 322.437C74.7206 322.156 75.1022 321.998 75.5 321.998ZM83.1875 331.842C83.5598 331.502 83.8206 331.058 83.9358 330.567C84.0509 330.076 84.015 329.562 83.8327 329.092C83.6504 328.622 83.3303 328.218 82.9143 327.933C82.4984 327.649 82.006 327.496 81.5019 327.496C80.9977 327.496 80.5054 327.649 80.0894 327.933C79.6735 328.218 79.3533 328.622 79.171 329.092C78.9887 329.562 78.9528 330.076 79.068 330.567C79.1831 331.058 79.4439 331.502 79.8162 331.842C79.3259 332.054 78.8805 332.358 78.5037 332.737C78.127 332.358 77.6816 332.054 77.1912 331.842C77.5636 331.502 77.8244 331.058 77.9395 330.567C78.0547 330.076 78.0188 329.562 77.8365 329.092C77.6542 328.622 77.334 328.218 76.9181 327.933C76.5021 327.649 76.0098 327.496 75.5056 327.496C75.0015 327.496 74.5091 327.649 74.0932 327.933C73.6772 328.218 73.3571 328.622 73.1748 329.092C72.9925 329.562 72.9566 330.076 73.0717 330.567C73.1869 331.058 73.4477 331.502 73.82 331.842C73.1379 332.136 72.5448 332.603 72.1 333.198C72.0606 333.251 72.0319 333.31 72.0156 333.374C71.9993 333.437 71.9957 333.504 72.005 333.569C72.0143 333.634 72.0363 333.696 72.0698 333.753C72.1032 333.809 72.1475 333.859 72.2 333.898C72.2525 333.937 72.3123 333.966 72.3759 333.982C72.4395 333.999 72.5057 334.002 72.5707 333.993C72.6357 333.984 72.6982 333.962 72.7547 333.928C72.8112 333.895 72.8606 333.851 72.9 333.798C73.2027 333.394 73.5953 333.067 74.0466 332.841C74.4978 332.615 74.9955 332.498 75.5 332.498C76.0045 332.498 76.5022 332.615 76.9534 332.841C77.4047 333.067 77.7973 333.394 78.1 333.798C78.1797 333.904 78.2982 333.974 78.4294 333.993C78.5607 334.011 78.694 333.977 78.8 333.897C78.8378 333.869 78.8713 333.836 78.8994 333.798C79.2021 333.394 79.5947 333.067 80.0459 332.841C80.4972 332.615 80.9948 332.498 81.4994 332.498C82.0039 332.498 82.5015 332.615 82.9528 332.841C83.4041 333.067 83.7966 333.394 84.0994 333.798C84.179 333.904 84.2976 333.974 84.4289 333.993C84.5602 334.012 84.6936 333.977 84.7997 333.898C84.9058 333.818 84.9759 333.699 84.9946 333.568C85.0133 333.437 84.979 333.303 84.8994 333.197C84.4568 332.604 83.8666 332.137 83.1875 331.842ZM75.5 328.498C75.7967 328.498 76.0867 328.586 76.3334 328.751C76.58 328.916 76.7723 329.15 76.8858 329.424C76.9994 329.698 77.0291 330 76.9712 330.291C76.9133 330.582 76.7704 330.849 76.5607 331.059C76.3509 331.268 76.0836 331.411 75.7926 331.469C75.5017 331.527 75.2001 331.497 74.926 331.384C74.6519 331.27 74.4176 331.078 74.2528 330.831C74.088 330.585 74 330.295 74 329.998C74 329.6 74.158 329.219 74.4393 328.937C74.7206 328.656 75.1022 328.498 75.5 328.498ZM81.5 328.498C81.7967 328.498 82.0867 328.586 82.3334 328.751C82.58 328.916 82.7723 329.15 82.8858 329.424C82.9994 329.698 83.0291 330 82.9712 330.291C82.9133 330.582 82.7704 330.849 82.5607 331.059C82.3509 331.268 82.0836 331.411 81.7926 331.469C81.5017 331.527 81.2001 331.497 80.926 331.384C80.6519 331.27 80.4176 331.078 80.2528 330.831C80.088 330.585 80 330.295 80 329.998C80 329.6 80.158 329.219 80.4393 328.937C80.7206 328.656 81.1022 328.498 81.5 328.498Z';

// Loader GIF, decoded into a 9×5 sprite so it plays from the timeline (scrub/export-safe).
const SPRITE_URL = 'assets/oda-loader-sprite.png';
function useDataUrl(url) {
  const [src, setSrc] = React.useState(url);
  React.useEffect(() => {
    let live = true;
    fetch(url).then(r => r.blob()).then(b => new Promise(res => {
      const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b);
    })).then(d => { if (live) setSrc(d); }).catch(() => {});
    return () => { live = false; };
  }, [url]);
  return src;
}
function Loader({ frame, style }) {
  const src = useDataUrl(SPRITE_URL);
  const col = frame % 9, row = Math.floor(frame / 9);
  return <div style={{ position: 'absolute', left: 64.5, width: 24, height: 24,
    backgroundImage: `url(${src})`, backgroundSize: '216px 120px',
    backgroundPosition: `${-col * 24}px ${-row * 24}px`, ...style }} />;
}

const LINE_D = 'M97.5 185.6L104.643 169.054L108.026 193.497L114.041 191.616L117.049 180.335L120.808 191.616L124.943 185.6L129.454 189.736L137.725 174.695H143.74L146.747 185.6L150.131 147.997L155.018 174.695L157.65 180.335L168.176 163.79L170.807 185.6L175.318 189.736L178.326 180.335L183.589 178.079L188.852 196.881L191.86 178.079L197.123 182.592L200.882 174.695L209.153 180.335L211.784 189.736H218.551L221.183 196.881L225.694 189.736L229.829 196.881H242.987L248.626 193.497L250.881 185.6L255.017 199.137L257.648 185.6L263.287 193.497H269.302L271.934 185.6L276.445 182.592L280.58 193.497H283.588L287.723 182.592L291.858 189.736L297.497 178.079L300.881 185.6L309.151 182.592L312.159 185.6L316.294 178.079L320.805 189.736L324.565 185.6L329.828 178.079L334.339 189.736L338.098 191.616L340.73 185.6L345.241 182.592L349 185.6L354.639 169.054L358.775 193.497L362.91 182.592H371.932L374.188 189.736L381.707 185.6L388.849 189.736L391.857 196.881L395.992 185.6L399.752 189.736H405.766L408.022 185.6L417.045 196.881H420.804L424.939 189.736L429.45 191.616L436.217 185.6L437.345 195.377L441.48 191.616L444.864 196.881L450.127 185.6L453.886 193.497L457.27 195.377L462.157 191.616H468.924L474.563 207.786L488.472 202.897L497.495 199.137L502.006 202.897L505.765 199.137L507.645 210.042L517.043 219.443L521.93 202.897V217.187L530.201 213.426L536.968 210.042L539.599 215.307L547.87 207.786L553.509 215.307L558.396 199.137L562.907 207.786H568.922L574.561 217.187L577.945 210.042L585.839 217.187V207.786L590.726 210.042L595.989 219.443L598.621 210.042L604.26 207.786L608.771 215.307C615.162 213.802 628.169 215.307 629.072 233.356C628.771 234.259 631.954 233.732 633.583 233.356L637.718 226.211L641.478 230.348L647.493 226.211L650.5 238.997';
const ICON_DL = 'M616.5 71.9966V75.9966C616.5 76.1292 616.447 76.2564 616.354 76.3501C616.26 76.4439 616.133 76.4966 616 76.4966H605C604.867 76.4966 604.74 76.4439 604.646 76.3501C604.553 76.2564 604.5 76.1292 604.5 75.9966V71.9966C604.5 71.864 604.553 71.7368 604.646 71.643C604.74 71.5493 604.867 71.4966 605 71.4966C605.133 71.4966 605.26 71.5493 605.354 71.643C605.447 71.7368 605.5 71.864 605.5 71.9966V75.4966H615.5V71.9966C615.5 71.864 615.553 71.7368 615.646 71.643C615.74 71.5493 615.867 71.4966 616 71.4966C616.133 71.4966 616.26 71.5493 616.354 71.643C616.447 71.7368 616.5 71.864 616.5 71.9966ZM610.146 72.3503C610.193 72.3968 610.248 72.4337 610.309 72.4589C610.369 72.484 610.434 72.497 610.5 72.497C610.566 72.497 610.631 72.484 610.691 72.4589C610.752 72.4337 610.807 72.3968 610.854 72.3503L613.354 69.8503C613.4 69.8039 613.437 69.7487 613.462 69.688C613.487 69.6273 613.5 69.5623 613.5 69.4966C613.5 69.4309 613.487 69.3658 613.462 69.3051C613.437 69.2444 613.4 69.1893 613.354 69.1428C613.307 69.0964 613.252 69.0595 613.191 69.0344C613.131 69.0092 613.066 68.9963 613 68.9963C612.934 68.9963 612.869 69.0092 612.809 69.0344C612.748 69.0595 612.693 69.0964 612.646 69.1428L611 70.7897V64.9966C611 64.864 610.947 64.7368 610.854 64.643C610.76 64.5493 610.633 64.4966 610.5 64.4966C610.367 64.4966 610.24 64.5493 610.146 64.643C610.053 64.7368 610 64.864 610 64.9966V70.7897L608.354 69.1428C608.26 69.049 608.133 68.9963 608 68.9963C607.867 68.9963 607.74 69.049 607.646 69.1428C607.552 69.2367 607.5 69.3639 607.5 69.4966C607.5 69.6293 607.552 69.7565 607.646 69.8503L610.146 72.3503Z';
const ICON_MORE = 'M643.25 70.9966C643.25 71.1449 643.206 71.2899 643.124 71.4133C643.041 71.5366 642.924 71.6327 642.787 71.6895C642.65 71.7463 642.499 71.7611 642.354 71.7322C642.208 71.7032 642.075 71.6318 641.97 71.5269C641.865 71.422 641.793 71.2884 641.764 71.1429C641.735 70.9974 641.75 70.8466 641.807 70.7096C641.864 70.5725 641.96 70.4554 642.083 70.373C642.207 70.2906 642.352 70.2466 642.5 70.2466C642.699 70.2466 642.89 70.3256 643.03 70.4663C643.171 70.6069 643.25 70.7977 643.25 70.9966ZM646.75 70.2466C646.602 70.2466 646.457 70.2906 646.333 70.373C646.21 70.4554 646.114 70.5725 646.057 70.7096C646 70.8466 645.985 70.9974 646.014 71.1429C646.043 71.2884 646.115 71.422 646.22 71.5269C646.325 71.6318 646.458 71.7032 646.604 71.7322C646.749 71.7611 646.9 71.7463 647.037 71.6895C647.174 71.6327 647.291 71.5366 647.374 71.4133C647.456 71.2899 647.5 71.1449 647.5 70.9966C647.5 70.7977 647.421 70.6069 647.28 70.4663C647.14 70.3256 646.949 70.2466 646.75 70.2466ZM638.25 70.2466C638.102 70.2466 637.957 70.2906 637.833 70.373C637.71 70.4554 637.614 70.5725 637.557 70.7096C637.5 70.8466 637.485 70.9974 637.514 71.1429C637.543 71.2884 637.615 71.422 637.72 71.5269C637.825 71.6318 637.958 71.7032 638.104 71.7322C638.249 71.7611 638.4 71.7463 638.537 71.6895C638.674 71.6327 638.791 71.5366 638.874 71.4133C638.956 71.2899 639 71.1449 639 70.9966C639 70.7977 638.921 70.6069 638.78 70.4663C638.64 70.3256 638.449 70.2466 638.25 70.2466Z';

function TableCard({ top, height, innerH, title, head, rows, T, inAt }) {
  const card = MOTION.enter(T, inAt, 0.3, 6);
  const headS = MOTION.enter(T, inAt + 0.2, 0.3, 3);
  return (
    <div style={{ position: 'absolute', left: 54.5, top, width: 620, height, background: '#fff', borderRadius: 8, ...card }}>
      <div style={{ position: 'absolute', left: 12, top: 10, width: 596, height: innerH, background: INNER, borderRadius: 8 }}>
        <div style={{ position: 'absolute', inset: 0, ...headS }}>
          <Ln x={12} b={25} s={16} w={600}>{title}</Ln>
          <div style={{ position: 'absolute', left: 12, top: 34, width: 572, height: 28, borderBottom: '1px solid rgba(18,18,73,0.5)', boxSizing: 'border-box' }}>
            <Ln x={0} b={18} s={12} w={600}>{head[0]}</Ln>
            <Ln x={422} b={18} s={12} w={600}>{head[1]}</Ln>
          </div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ position: 'absolute', left: 12, top: 62 + i * 31, width: 572, height: 31, boxSizing: 'border-box',
            borderBottom: i < rows.length - 1 ? '1px solid rgba(18,18,73,0.13)' : 'none',
            ...MOTION.enter(T, inAt + 0.45 + i * 0.09, 0.3, 3) }}>
            <Ln x={0} b={20} s={14} w={r[2] ? 600 : 400}>{r[0]}</Ln>
            <Ln x={422} b={20} s={14} w={r[3] ? 600 : 400}>{r[1]}</Ln>
          </div>
        ))}
      </div>
    </div>
  );
}

// Input composer: label → rounded shape pops at center → expands → accent line, caret, arrow → typing → soft press.
function Composer({ T, e, S, label, top, req, times, caret, accent = BLUE, tw = 383, ty = 13.7 }) {
  const textRef = React.useRef(null);
  const [cm, setCm] = React.useState(null);
  React.useLayoutEffect(() => {
    const el = textRef.current; if (!el) return;
    const m = [];
    for (const c of el.children) if (c.dataset.ch) m.push([c.offsetLeft, c.offsetTop, c.offsetWidth]);
    const key = m.map(g => g.join(',')).join(';');
    if (!cm || cm.key !== key) setCm({ key, m });
  });
  if (T < e - 0.05 || T > S + 1.0) return null;
  const labelIn = MOTION.enter(T, e, 0.4, 6);
  // circle pops in → grows to the final height (still a circle) → then widens to both sides
  const popAt = e + 0.3, growAt = e + 0.45, expAt = e + 0.8;
  const popOp = Easing.easeOutCubic(prog(T, popAt, 0.2));
  const pop = 0.6 + 0.4 * spring(prog(T, popAt, 0.4), 0.75, 9);
  const gr = spring(prog(T, growAt, 0.5), 0.8, 9);
  const ex = spring(prog(T, expAt, 0.8), 0.8, 9);
  const D0 = 44, bh = D0 + (71 - D0) * gr, bw = bh + (620 - 71) * ex, br = bh / 2 - (bh / 2 - 10) * clamp(ex, 0, 1);
  const lineAt = e + 1.35, caretAt = e + 1.5, arrowAt = e + 1.6, typeStart = e + 1.7;
  const lineP = Easing.easeOutCubic(prog(T, lineAt, 0.32));
  const arrowOp = Easing.easeOutCubic(prog(T, arrowAt, 0.3));
  const arrowSc = 0.8 + 0.2 * spring(prog(T, arrowAt, 0.6), 0.7, 9);
  const orbit = flow(T, lineAt, 80, 1.6);
  const boxS = T < S ? 1 : kf(T - S, [[0, 1], [0.12, 0.99], [0.3, 1.005], [0.55, 1]]);
  const N = req.length;
  const span = Math.max(1.2, S - typeStart - 0.6);
  const u = clamp((T - typeStart) / span, 0, 1);
  const eu = 0.22 * Easing.easeInOutSine(u) + 0.78 * u;
  const idle = u <= 0 ? T - caretAt : T - (typeStart + span);
  const typing = u > 0 && u < 1;
  const caretOn = T >= caretAt && T < S + 0.05 && (typing || idle < 0.45 || Math.floor((idle - 0.45) / 0.53) % 2 === 1);
  const press = MOTION.press(T, S);
  const outAt = S + 0.55;
  const out = T < outAt ? {} : fadeOut(T, outAt, 0.3, -8);
  const cy = top + 35.5;
  // Write-on driven by pixel distance (not char count): the caret glides at a constant visual speed and
  // each glyph fades in as the caret crosses it, so narrow/wide letters never cause speed jumps.
  const m = cm && cm.m.length === N ? cm.m : null;
  const ops = new Array(N).fill(0);
  let caretEl = null;
  if (m) {
    const cum = []; let L = 0;
    for (let i = 0; i < N; i++) { cum.push(L); L += m[i][2]; }
    const FE = 10, px = (L + FE) * eu;
    for (let i = 0; i < N; i++) ops[i] = clamp((px - cum[i]) / (m[i][2] + FE), 0, 1);
    let k = 0; while (k < N - 1 && px >= cum[k + 1]) k++;
    const g = m[k], x = g[0] + clamp(px - cum[k], 0, g[2]);
    if (caret !== 'accent bar') caretEl = <span key="c" style={{ position: 'absolute', left: x + 0.5, top: g[1] + 0.5, width: 1.5, height: 21, background: INK, opacity: caretOn ? 1 : 0 }} />;
  } else {
    const p = (N + 0.6) * eu;
    for (let i = 0; i < N; i++) ops[i] = clamp((p - i) / 1.6, 0, 1);
  }
  const chars = [];
  for (let i = 0; i < N; i++) {
    const o = ops[i];
    chars.push(<span key={i} data-ch="1" style={{ opacity: (o * o * (3 - 2 * o)).toFixed(3) }}>{req[i]}</span>);
  }
  return (
    <div style={{ position: 'absolute', inset: 0, ...out }}>
      <div style={labelIn}><Ln right={673} b={top - 17} s={13} w={700} c={LAV}>{label}</Ln></div>
      <div style={{ position: 'absolute', left: 364.5 - bw / 2, top: cy - bh / 2, width: bw, height: bh, borderRadius: br, overflow: 'hidden',
        opacity: popOp, transform: `scale(${(pop * boxS).toFixed(4)})` }}>
        <div style={{ position: 'absolute', left: 0, top: (bh - bw) / 2, width: bw, height: bw, background: angular(90 + orbit),
          transform: `scaleY(${Math.max(0.2779, bh / bw).toFixed(4)})` }} />
        <div style={{ position: 'absolute', inset: 2, background: '#fff', borderRadius: br - 2 }} />
        <div style={{ position: 'absolute', left: 18, top: 20, width: 1.87, height: 32, background: accent, transform: `scaleY(${lineP.toFixed(3)})`,
          opacity: caret === 'accent bar' && lineP >= 1 ? (caretOn || T < caretAt ? 1 : 0) : 1 }} />
        <div ref={textRef} style={{ position: 'absolute', left: 35.8, top: ty, width: tw, fontSize: 18, lineHeight: '22px', whiteSpace: 'normal' }}>{chars}{caretEl}</div>
        <div style={{ position: 'absolute', left: 562, top: 15.5, width: 40, height: 40, borderRadius: 20, opacity: arrowOp,
          background: press > 0 ? `color-mix(in srgb, ${accent} ${(100 - press * 34).toFixed(1)}%, ${INK})` : accent,
          transform: `scale(${(arrowSc * (1 - press * 0.08)).toFixed(3)})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="616.5 217.5 40 40"><path d="M629.03 237.5H643.97M638.367 243.5L643.97 237.5L638.367 231.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
        </div>
      </div>
    </div>
  );
}

// Loader that hides while it relocates below the newest content.
function loaderState(T, start, y0, hops, end) {
  const y = MOTION.move(T, y0, hops.map(h => ({ at: h.at, dur: 0.02, to: h.to, ease: Easing.easeInOutCubic })));
  const hide = hops.reduce((o, h) => Math.min(o, 1 - prog(T, h.at - 0.15, 0.15) + Easing.easeOutCubic(prog(T, h.back ?? h.at + 0.3, 0.25))), 1);
  const op = clamp(hide, 0, 1) * Easing.easeOutCubic(prog(T, start, 0.25)) * (1 - Easing.easeOutCubic(prog(T, end, 0.25)));
  const frame = Math.max(0, Math.floor((Math.min(T, end) - start) / 0.02)) % 45;
  return { y, op, frame };
}

function AgentHeader({ top, st }) {
  return (
    <React.Fragment>
      <div style={{ position: 'absolute', left: 54.5, top, height: 24, display: 'flex', alignItems: 'center', ...st }}>
        <div style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <OdaMark size={12} />
        </div>
      </div>
      <div style={st}><Ln x={84} b={top + 17.2} s={13} w={700}>OMICS DATA AGENT</Ln></div>
    </React.Fragment>
  );
}

function Bubble({ top, text, st, left = 254.5, w = 420, h = 71, tw = 383, label = 'PHARMA R&D' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, ...st }}>
      <Ln right={674} b={top + 58} s={13} w={700} c={LAV}>{label}</Ln>
      <div style={{ position: 'absolute', left, top: top + 75, width: w, height: h, background: BUBBLE, borderRadius: 10 }}>
        <div style={{ position: 'absolute', left: 18.7, top: 13.6, width: tw, fontSize: 18, lineHeight: '22px', whiteSpace: 'normal' }}>{text}</div>
      </div>
    </div>
  );
}

// White bar with a thin flowing rainbow underline (Cohort / chart summary).
function FlowBar({ T, top, at, children }) {
  return (
    <div style={{ position: 'absolute', left: 54.5, top, width: 620, height: 35, ...MOTION.enter(T, at, 0.32, 6) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 12, bottom: 0, borderRadius: 9, ...flowStrip(T, at) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 34, background: '#fff', borderRadius: 8, boxShadow: CARD_SHADOW }}>{children}</div>
    </div>
  );
}

const O2 = 1170; // feed offset of the second exchange
const Y_LABELS = ['9.0', '8.8', '8.6', '8.4', '8.2', '8.0', '7.8', '7.6', '7.4', '7.2', '7.0', '7.0', '6.8', '6.6', '6.4', '6.2', '6.0'];
const SUMMARY_ROWS = [['2015-2016', '~7.5–7.9', '100–160'], ['2017-2019', '~7.3–7.7', '400–800'], ['2020-2021', '~7.4–7.6', '500–900'],
  ['2022-2023', '~7.0–7.3', '600–1,000'], ['2024', '~7.0–7.2', '650–900'], ['2025-2026', '~6.7–6.8', '600–950']];

const PINK = '#FF2C94', YEL = '#FFDC04', SKY = '#8DD6F8', MUTED = '#6E86B8';
const CO2 = 640, CO3 = 1350;
const KRAS_ROWS = [['p.Gly12Asp (G12D)', '45'], ['p.Gly12Val (G12V)', '29'], ['p.Gly12Arg (G12R)', '23'], ['p.Gln61His (Q61H)', '5'],
  ['p.Gln61Arg (Q61R)', '2'], ['p.Gly12Cys (G12C)', '1'], ['p.Gly12Ser (G12S)', '1']];
const BARS = [['p.Gly12Asp', '(G12D)', 45, BLUE], ['p.Gly12Val', '(G12V)', 29, BLUE], ['p.Gly12Arg', '(G12R)', 23, BLUE], ['p.Gln61His', '(Q61H)', 5, YEL],
  ['p.Gln61Arg', '(Q61R)', 2, YEL], ['p.Gly12Cys', '(G12C)', 1, BLUE], ['p.Gly12Ser', '(G12S)', 1, BLUE]];
const GRID_X = [160.766, 257.838, 354.907, 451.977, 549.047, 646.119];
const OBS = ['106 of 184 patients carry a non-synonymous KRAS mutation, 99 cluster at codon 12 (Gly12), ~93% of KRAS-mutated cases',
  'p.Gly12Asp (G12D) is most common, found in 45 patients', '7 patients carry mutations at codon 61 (Gln61)', 'Consistent with codon 12 as the dominant driver in PAAD'];
const PLUS_D = 'M425.5 291.496C425.5 291.629 425.447 291.756 425.354 291.85C425.26 291.943 425.133 291.996 425 291.996H420V296.996C420 297.129 419.947 297.256 419.854 297.35C419.76 297.443 419.633 297.496 419.5 297.496C419.367 297.496 419.24 297.443 419.146 297.35C419.053 297.256 419 297.129 419 296.996V291.996H414C413.867 291.996 413.74 291.943 413.646 291.85C413.553 291.756 413.5 291.629 413.5 291.496C413.5 291.363 413.553 291.236 413.646 291.143C413.74 291.049 413.867 290.996 414 290.996H419V285.996C419 285.863 419.053 285.736 419.146 285.643C419.24 285.549 419.367 285.496 419.5 285.496C419.633 285.496 419.76 285.549 419.854 285.643C419.947 285.736 420 285.863 420 285.996V290.996H425C425.133 290.996 425.26 291.049 425.354 291.143C425.447 291.236 425.5 291.363 425.5 291.496Z';
const EYE_D = 'M580.957 291.294C580.935 291.244 580.406 290.07 579.229 288.893C577.661 287.325 575.68 286.496 573.5 286.496C571.32 286.496 569.339 287.325 567.771 288.893C566.594 290.07 566.062 291.246 566.043 291.294C566.015 291.358 566 291.427 566 291.497C566 291.567 566.015 291.636 566.043 291.7C566.065 291.749 566.594 292.923 567.771 294.1C569.339 295.667 571.32 296.496 573.5 296.496C575.68 296.496 577.661 295.667 579.229 294.1C580.406 292.923 580.935 291.749 580.957 291.7C580.985 291.636 581 291.567 581 291.497C581 291.427 580.985 291.358 580.957 291.294ZM573.5 295.496C571.576 295.496 569.896 294.797 568.504 293.418C567.934 292.85 567.448 292.203 567.062 291.496C567.448 290.789 567.933 290.142 568.504 289.574C569.896 288.195 571.576 287.496 573.5 287.496C575.424 287.496 577.104 288.195 578.496 289.574C579.068 290.142 579.554 290.789 579.941 291.496C579.49 292.337 577.527 295.496 573.5 295.496ZM573.5 288.496C572.907 288.496 572.327 288.672 571.833 289.002C571.34 289.331 570.955 289.8 570.728 290.348C570.501 290.896 570.442 291.499 570.558 292.081C570.673 292.663 570.959 293.198 571.379 293.617C571.798 294.037 572.333 294.323 572.915 294.438C573.497 294.554 574.1 294.495 574.648 294.268C575.196 294.041 575.665 293.656 575.994 293.163C576.324 292.669 576.5 292.089 576.5 291.496C576.499 290.701 576.183 289.938 575.62 289.376C575.058 288.813 574.295 288.497 573.5 288.496ZM573.5 293.496C573.104 293.496 572.718 293.379 572.389 293.159C572.06 292.939 571.804 292.627 571.652 292.261C571.501 291.896 571.461 291.494 571.538 291.106C571.616 290.718 571.806 290.362 572.086 290.082C572.365 289.802 572.722 289.612 573.11 289.535C573.498 289.457 573.9 289.497 574.265 289.648C574.631 289.8 574.943 290.056 575.163 290.385C575.383 290.714 575.5 291.101 575.5 291.496C575.5 292.027 575.289 292.535 574.914 292.91C574.539 293.285 574.03 293.496 573.5 293.496Z';

function Piece({ caret }) {
  const { T, CUES } = useComposition();
  const C = (n) => CUES[n];
  const I = C('Input'), S = C('Submit'), P = C('Processing'), RS = C('Result'), I2 = C('Input 2'), S2 = C('Submit 2'),
    TBL = C('Table'), KO = C('Observations'), I3 = C('Input 3'), S3 = C('Submit 3'), CH = C('Chart'), SET = C('Settle'), OUT = C('Outro');

  const CO = RS + 2.7; // cohort bar lands right after the button highlights (same Result scene)
  const scroll = MOTION.move(T, -95, [
    { at: P, dur: 1.0, to: 0 }, { at: RS, dur: 1.0, to: 168 }, { at: CO, dur: 0.6, to: 172 }, { at: I2, dur: 1.0, to: CO2 - 100 },
    { at: TBL, dur: 1.0, to: CO2 + 138 }, { at: KO, dur: 1.0, to: CO2 + 294 }, { at: I3, dur: 1.0, to: CO3 - 59 },
    { at: CH, dur: 1.0, to: CO3 + 186 },
  ]);
  // The loader only shows below the newest block once everything above it has finished revealing.
  const L1 = loaderState(T, S + 0.95, 155, [{ at: P + 0.15, to: 345, back: P + 2.0 }], RS + 0.1);
  const L2 = loaderState(T, S2 + 0.95, CO2 + 155, [{ at: TBL + 0.15, to: CO2 + 525, back: TBL + 1.6 }], KO);
  const L3 = loaderState(T, S3 + 0.95, CO3 + 179, [], CH + 0.1);

  const running = T < RS + 0.3 ? 0.75 + 0.25 * Math.cos((T - P) * Math.PI * 1.25) : 1;
  const steps = [P + 0.6, P + 1.1, P + 1.6];
  const rs = (d, dy = 3) => MOTION.enter(T, RS + d, 0.32, dy);
  const tb = (d, dy = 3) => MOTION.enter(T, TBL + d, 0.32, dy);
  const ko = (d, dy = 3) => MOTION.enter(T, KO + d, 0.32, dy);
  const ch = (d, dy = 3) => MOTION.enter(T, CH + d, 0.35, dy);
  const fade = (at, d = 0.3) => Easing.easeOutCubic(prog(T, at, d));
  const kH = 308 + 148 * spring(prog(T, KO + 0.1, 0.8), 0.85, 9);
  const outro = 1 - Easing.easeInOutCubic(prog(T, OUT + 0.05, 0.7));
  const btn = { position: 'absolute', top: 120.5, height: 24, borderRadius: 3.5, boxSizing: 'border-box', transform: 'translateZ(0)' };
  // buttons: opacity-only reveal (no translate → no text re-snapping), then a soft highlight on each in turn
  const bIn = (d) => ({ opacity: fade(RS + d, 0.35) });
  const hl = (at) => Easing.easeOutCubic(prog(T, at, 0.25)) * (1 - Easing.easeInOutSine(prog(T, at + 0.55, 0.4)));
  const h1 = hl(RS + 1.35), h2 = hl(RS + 1.95);
  const mix = (c, p, base) => `color-mix(in srgb, ${c} ${(p * 100).toFixed(1)}%, ${base})`;

  return (
    <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', left: 0, top: 0, width: 729, height: 478,
      transform: 'scale(2)', transformOrigin: '0 0', fontFamily: FONT, color: INK }}>
      <div style={{ position: 'absolute', inset: 0, background: BG, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: outro }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 729, height: 2100, transform: `translateY(${(-scroll).toFixed(2)}px)` }}>

          {/* Exchange 1 */}
          <Bubble top={0} left={203.5} w={471} h={48} tw={460} label="KARA" text={REQ1} st={MOTION.enter(T, S + 0.55, 0.38, 10)} />
          <Loader frame={L1.frame} style={{ top: L1.y, opacity: L1.op }} />
          <AgentHeader top={147} st={MOTION.enter(T, P + 0.2, 0.32, 6)} />
          <div style={{ position: 'absolute', left: 54.5, top: 185, width: 620, height: 128, background: '#fff', borderRadius: 8, boxShadow: CARD_SHADOW, ...MOTION.enter(T, P + 0.3, 0.32, 6) }}>
            <Ln x={12} b={21.7} s={12} w={600}>Thinking...</Ln>
            <Ln rr={12.6} b={21.7} s={12} w={600} style={{ opacity: running }}>Running</Ln>
            <div style={{ position: 'absolute', left: 12, top: 34, width: 596, height: 84, background: INNER, borderRadius: 8 }}>
              {[['Tool call', "lookup_codings('pancreatic cancer, pancreas, PAAD')"], ['Output', '21 matches · 10 systems · ICD-O-3 C25.0–C25.9'], ['Tool call', 'evaluate_sql on dx_cancer_type']].map((r, i) => (
                <div key={i} style={{ position: 'absolute', inset: 0, ...MOTION.enter(T, steps[i], 0.3, 4) }}>
                  <Ln x={12} b={23 + i * 24} s={14} w={600}>{r[0]}</Ln>
                  <Ln x={112.5} b={23 + i * 24} s={14} w={400}>{r[1]}</Ln>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'absolute', left: 54.5, top: 327, width: 620, height: 161, background: '#fff', borderRadius: 8, ...rs(0.2, 6) }}>
            <div style={{ position: 'absolute', left: 12, top: 10, width: 596, height: 102, background: INNER, borderRadius: 8 }}>
              <div style={rs(0.4)}><Ln x={12} b={25} s={16} w={600}>Pancreatic cancer patient population</Ln></div>
              <div style={{ position: 'absolute', left: 12, top: 34.9, width: 572, fontSize: 14, lineHeight: '20px', ...rs(0.55) }}>
                There are <b style={{ fontWeight: 700 }}>184 patients</b> in this dataset diagnosed with pancreatic cancer.
              </div>
              <div style={{ position: 'absolute', left: 12, top: 54.9, width: 572, fontSize: 14, lineHeight: '20px', ...rs(0.7) }}>
                Filtered on dx_cancer_type = <b style={{ fontWeight: 700 }}>"Pancreatic Cancer"</b> in the sample table · <b style={{ fontWeight: 700 }}>TCGA PAAD</b> study within TCGA
              </div>
            </div>
            <div style={{ ...btn, left: 352.5, width: 146, border: `1px solid ${mix(BLUE, h1, '#C7C7CC')}`, background: mix(BLUE, h1 * 0.1, '#fff'), boxShadow: `0 0 0 ${(h1 * 3).toFixed(2)}px ${mix(BLUE, 0.16 * h1, 'transparent')}`, ...bIn(0.9) }}>
              <svg width="12" height="12" viewBox="413.5 285.5 12 12" style={{ position: 'absolute', left: 5.5, top: 5 }}><path d={PLUS_D} fill="#AEAEB2" /></svg>
              <Ln x={24} b={15.7} s={14}>Add to Dashboard</Ln>
            </div>
            <div style={{ ...btn, left: 506.5, width: 101, border: `1px solid ${BLUE}`, background: mix(BLUE, h2 * 0.12, '#fff'), boxShadow: `0 0 0 ${(h2 * 3).toFixed(2)}px ${mix(BLUE, 0.16 * h2, 'transparent')}`, ...bIn(1.0) }}>
              <svg width="15" height="10" viewBox="566 286.496 15 10" style={{ position: 'absolute', left: 4, top: 6 }}><path d={EYE_D} fill={BLUE} /></svg>
              <Ln x={24.6} b={15.3} s={14}>SQL Query</Ln>
            </div>
          </div>
          <FlowBar T={T} top={492} at={CO + 0.2}>
            <svg width="14" height="14" viewBox="71.5 320.5 14 14" style={{ position: 'absolute', left: 17, top: 9.5 }}><path fill={BLUE} d={PEOPLE} /></svg>
            <Ln x={36.4} b={21} s={14} w={400}><b style={{ fontWeight: 700 }}>Cohort:</b> Pancreatic Cancer Patients <b style={{ fontWeight: 700 }}>184 patients</b></Ln>
          </FlowBar>

          {/* Exchange 2 */}
          <Bubble top={CO2} left={54.5} w={620} h={48} tw={600} label="KARA" text={REQ2} st={MOTION.enter(T, S2 + 0.55, 0.38, 10)} />
          <Loader frame={L2.frame} style={{ top: L2.y, opacity: L2.op }} />
          <AgentHeader top={CO2 + 147} st={tb(0.2, 6)} />
          <div style={{ position: 'absolute', left: 54.5, top: CO2 + 185, width: 620, height: kH + 2, ...tb(0.3, 6) }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 30, bottom: 0, borderRadius: 10, ...flowStrip(T, TBL + 0.3) }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: kH, background: '#fff', borderRadius: 10 }}>
              <div style={{ position: 'absolute', left: 12, top: 10, width: 596, height: 286, background: INNER, borderRadius: 8 }}>
                <div style={tb(0.45)}><Ln x={12} b={25} s={16} w={700}>KRAS mutations in 184 pancreatic cancer patients · HGVSp</Ln></div>
                <div style={{ position: 'absolute', left: 12, top: 34, width: 572, height: 28, borderBottom: '1px solid rgba(18,18,73,0.5)', boxSizing: 'border-box', ...tb(0.55) }}>
                  <Ln x={0} b={18} s={12} w={600}>KRAS Mutation (HGVSp)</Ln>
                  <Ln x={422} b={18} s={12} w={600}>Patient Count</Ln>
                </div>
                {KRAS_ROWS.map((r, i) => (
                  <div key={i} style={{ position: 'absolute', left: 12, top: 62 + i * 31, width: 572, height: 31, boxSizing: 'border-box',
                    borderBottom: i < KRAS_ROWS.length - 1 ? '1px solid rgba(18,18,73,0.13)' : 'none', ...tb(0.65 + i * 0.07) }}>
                    <Ln x={0} b={20} s={14}>{r[0]}</Ln>
                    <Ln x={422} b={20} s={14}>{r[1]}</Ln>
                  </div>
                ))}
              </div>
              <div style={{ position: 'absolute', left: 12, top: 304, width: 596, height: 140, background: INNER, borderRadius: 8, ...ko(0.35, 6) }}>
                <div style={ko(0.5)}><Ln x={12} b={22.8} s={14} w={600}>Key observations:</Ln></div>
                <div style={{ position: 'absolute', left: 21, top: 32.9, width: 563, fontSize: 14, lineHeight: '20px', display: 'flex', flexDirection: 'column' }}>
                  {OBS.map((o, i) => (
                    <div key={i} style={{ display: 'flex', ...ko(0.62 + i * 0.12) }}>
                      <span style={{ width: 12, flex: 'none' }}>•</span><span style={{ flex: 1, minWidth: 0 }}>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Exchange 3 */}
          <Bubble top={CO3} left={284.5} w={390} h={72} tw={362} label="KARA" text={REQ3} st={MOTION.enter(T, S3 + 0.55, 0.38, 10)} />
          <Loader frame={L3.frame} style={{ top: L3.y, opacity: L3.op }} />
          <div style={{ position: 'absolute', left: 54.5, top: CO3 + 209, width: 620, height: 369.6, background: INK, borderRadius: 12.8, ...ch(0.25, 6) }}>
            <div style={ch(0.4)}><Ln x={25.2} b={34.7} s={16} w={700} c="#fff">KRAS mutations in the pancreatic cancer cohort</Ln></div>
            <div style={ch(0.5)}><Ln x={24.9} b={53.9} s={10} w={400} c={SKY}>HGVSp protein change notation, n = 184 patients</Ln></div>
            <svg width="620" height="369.6" viewBox="54.5 22.9922 620 369.6" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', fontFamily: FONT }}>
              <g transform="translate(0 -22)" style={{ opacity: fade(CH + 0.5) }}>
                <path d={ICON_DL} fill="#fff" /><path d={ICON_MORE} fill="#fff" />
              </g>
              {GRID_X.map((x, j) => (
                <g key={j} style={{ opacity: fade(CH + 0.55 + j * 0.03) }}>
                  {j === 0
                    ? <line x1={x} y1="82.9922" x2={x} y2="312.379" stroke={BLUE} strokeOpacity="0.22" strokeDasharray="2 6" />
                    : <line x1={x} y1="82.9922" x2={x} y2="312.379" stroke="#616161" strokeWidth="0.5" strokeDasharray="2 2" />}
                  <text x={x} y="326" textAnchor="middle" fill={SKY} fontSize="7">{j * 10}</text>
                </g>
              ))}
              <text x="403.2" y="342.7" textAnchor="middle" fill={SKY} fontSize="7" fontWeight="700" style={{ opacity: fade(CH + 0.7) }}>Patient count</text>
              {BARS.map((b, i) => {
                const y = 98.0 + 31.2 * i, at = CH + 0.8 + i * 0.07;
                const w = b[2] * 9.707 * spring(prog(T, at, 0.7), 0.8, 9);
                return (
                  <g key={i}>
                    <g style={{ opacity: fade(CH + 0.65 + i * 0.04) }}>
                      <text x="98.4" y={y + 7.7} textAnchor="middle" fill={SKY} fontSize="7" fontWeight="700">{b[0]}</text>
                      <text x="137.8" y={y + 7.7} textAnchor="middle" fill={MUTED} fontSize="7">{b[1]}</text>
                    </g>
                    {w > 0.1 && <rect x="160.8" y={y} width={w} height="16.2" rx="2" fill={b[3]} />}
                    <text x={160.8 + b[2] * 9.707 + 9.7} y={y + 11.9} fill="#fff" fontSize="10" fontWeight="700" style={{ opacity: fade(at + 0.35, 0.25) }}>{b[2]}</text>
                  </g>
                );
              })}
              <g style={{ opacity: fade(CH + 1.6) }}>
                <rect x="540.5" y="286" width="13" height="6" rx="1.5" fill={BLUE} />
                <text x="557.9" y="291.8" fill="#fff" fontSize="8">Codon 12, 99 patients</text>
                <rect x="540.5" y="298" width="13" height="6" rx="1.5" fill={YEL} />
                <text x="557.9" y="303.8" fill="#fff" fontSize="8">Codon 61, 7 patients</text>
              </g>
            </svg>
            <div style={ch(1.7)}><Ln x={24.5} b={335.5} s={10} w={700} c="#fff">106 of 184 patients carry a KRAS mutation</Ln></div>
            <div style={ch(1.8)}><Ln x={24.2} b={349.6} s={7.5} w={400} c={SKY}>99 sit at codon 12, about 93% of the mutated patients. 7 sit at codon 61.</Ln></div>
          </div>
        </div>

        <Composer T={T} e={I + 0.05} S={S} label="ASK ODA IN NATURAL LANGUAGE" top={202} req={REQ1} times={TYPE1} caret={caret} accent={PINK} tw={505} ty={24.5} />
        <Composer T={T} e={I2 + 0.55} S={S2} label="KARA" top={206} req={REQ2} times={TYPE2} caret={caret} accent={PINK} tw={505} />
        <Composer T={T} e={I3 + 0.55} S={S3} label="KARA" top={179} req={REQ3} times={TYPE3} caret={caret} accent={PINK} tw={505} />
        </div>
        <div style={{ position: 'absolute', left: 1, top: 347, width: 728, height: 131, background: `linear-gradient(180deg, rgba(255,240,247,0) 0%, ${BG} 100%)`, pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

function ODACDAnimation() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={1458} height={956} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={t.corner}>
        <Piece caret={t.caret} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Playback" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
        <TweakSection label="Input" />
        <TweakRadio label="Caret" value={t.caret} options={['inline', 'accent bar']} onChange={(v) => setTweak('caret', v)} />
        <TweakSection label="Video" />
        <TweakColor label="Corner fill" value={t.corner} options={['#FFFFFF', '#FFF0F7', '#000000']} onChange={(v) => setTweak('corner', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}
window.ODACDAnimation = ODACDAnimation;
