// Original vector scenery. No remote assets or fonts are loaded.
export function roomArt(variant = '01'): string {
  const light = variant === '02' ? '#8a8780' : variant === '03' ? '#789899' : '#b7b8a3';
  return `<svg class="room-art" viewBox="0 0 1200 760" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Una sala de interrogatorios con luz tenue, una figura frente a la mesa y un grabador en marcha">
  <defs>
    <linearGradient id="wall" x2="0" y2="760" gradientUnits="userSpaceOnUse"><stop stop-color="#1d2928"/><stop offset=".55" stop-color="#293634"/><stop offset="1" stop-color="#091110"/></linearGradient>
    <radialGradient id="light"><stop stop-color="${light}" stop-opacity=".37"/><stop offset="1" stop-color="#677a70" stop-opacity="0"/></radialGradient>
    <linearGradient id="table" x1="570" y1="520" x2="650" y2="760" gradientUnits="userSpaceOnUse"><stop stop-color="#56615a"/><stop offset=".2" stop-color="#38403a"/><stop offset="1" stop-color="#131d1a"/></linearGradient>
    <linearGradient id="face" x1="679" y1="286" x2="775" y2="320" gradientUnits="userSpaceOnUse"><stop stop-color="#121b18"/><stop offset=".6" stop-color="#4d5346"/><stop offset="1" stop-color="#1d2620"/></linearGradient>
    <linearGradient id="coat" x1="600" y1="470" x2="810" y2="420" gradientUnits="userSpaceOnUse"><stop stop-color="#111c19"/><stop offset=".65" stop-color="#25302a"/><stop offset="1" stop-color="#0e1715"/></linearGradient>
    <linearGradient id="vignette"><stop stop-color="#0b1212"/><stop offset=".5" stop-color="#0b1212" stop-opacity="0"/><stop offset="1" stop-color="#060d0c" stop-opacity=".5"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".09"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>
    <pattern id="blinds" width="185" height="18" patternUnits="userSpaceOnUse"><rect width="185" height="6" fill="#82928b" fill-opacity=".13"/><path d="M0 8h185" stroke="#0b1514" stroke-width="5"/></pattern>
  </defs>
  <g filter="url(#grain)">
  <rect width="1200" height="760" fill="url(#wall)"/>
  <path d="M0 104h1200M0 462h1200M395 0v460M984 0v463" stroke="#0c1816" stroke-opacity=".4" stroke-width="2"/>
  <ellipse cx="725" cy="343" rx="455" ry="405" fill="url(#light)"/>
  <path d="M0 465h1200v295H0z" fill="#101b19"/>
  <path d="M1055 95h111v362h-111z" fill="#18211e" stroke="#36413b" stroke-width="4"/><path d="M1070 112h81v331h-81z" stroke="#28362f"/><rect x="1067" y="289" width="20" height="6" fill="#737c6d"/>
  <rect x="75" y="119" width="292" height="272" fill="#091514" stroke="#404b43" stroke-width="9"/>
  <rect x="87" y="132" width="268" height="245" fill="#35433b"/>
  <rect x="87" y="132" width="268" height="245" fill="url(#blinds)"/>
  <path d="M164 133v244m111-244v244" stroke="#182622" stroke-width="6"/>
  <path d="M111 140 93 368m45-228-18 228m110-228-18 228m104-228-18 228" stroke="#b8c6b6" stroke-opacity=".09"/>
  <path d="M621 0v70m205-70v70" stroke="#050c0b" stroke-width="3"/>
  <path d="m598 66 258 0 23 23H577z" fill="#090f0e"/><rect x="592" y="88" width="274" height="6" rx="3" fill="#c3c7ae"/>
  <rect class="fluorescent" x="592" y="88" width="274" height="6" fill="#dae0c8" filter="url(#glow)"/>
  <path d="m598 99-83 428h425L860 99z" fill="#c0c9a1" opacity=".018"/>
  <circle cx="950" cy="168" r="37" fill="#101b18" stroke="#49554a" stroke-width="3"/><circle cx="950" cy="168" r="31" fill="#86917b" opacity=".6"/><path d="M950 143v25l18 8" stroke="#111a14" stroke-width="3"/><circle cx="950" cy="168" r="2" fill="#17221b"/>
  <path d="M552 469v-86q0-25 28-25h51q28 0 28 25v86m-95-62h83" stroke="#080f0d" stroke-width="14"/>
  <path d="M827 457v-68q0-23 28-23h22q24 0 24 23v68" stroke="#0a1310" stroke-width="11"/>
  <ellipse cx="727" cy="510" rx="136" ry="21" fill="#060d0a" opacity=".6"/>
  <path d="m685 356-52 22-35 87-38 31 36 22 76-51 120 42 86-4-8-24-53-18-25-83-41-24z" fill="url(#coat)"/>
  <path d="m697 350-7 38 34 31 32-33-11-39" fill="#515647"/><path d="m692 370 30 23-19 53-29-66m78-9-29 22 15 59 33-72" fill="#596154"/><path d="m720 397-5 62 13 11 10-9-13-64z" fill="#1b2420"/>
  <path d="m677 301 8-47 49-20 39 30-8 66-17 30-30 6-28-28z" fill="url(#face)"/>
  ${variant === '02' ? '<path d="M679 286v-36l21-17 44 1 22 22 1 27-18-23-48-3z" fill="#131c18"/><path d="m691 326 17 19 34-1 20-20-9 28-29 16-24-13z" fill="#272e23"/>' : '<path d="M677 314q-27-61 13-79 33-23 66 6 25 24 12 73l-9-43-34-10-28 16-12 49z" fill="#101915"/>'}
  ${variant === '03' ? '<circle cx="766" cy="259" r="19" fill="#1b2620"/><path d="M684 294h28v18h-28zm50 0h27v18h-27zm-22 5h22" stroke="#87907b" stroke-width="2"/>' : ''}
  <path d="m686 297 22-4m30 2 20 4" stroke="#0e1713" stroke-width="5"/><path d="m690 302 15-1m36 2 13 1" stroke="#8f9277" stroke-opacity=".55"/><path d="m724 300-5 27 10 2m-24 13 28 1" stroke="#19231c" stroke-width="3"/>
  <path d="m654 430 37 30-11 9-55-19m172-14-37 29-11-9 31-32" stroke="#374037" stroke-width="3"/>
  <path d="m683 458 24 6 28-2 17 7-8 9-33 4-37-12zM759 461l-20 3-18 9 15 8 32-2 13-11z" fill="#72705b"/>
  <path d="m378 512 552-10 270 258H52z" fill="url(#table)" stroke="#647062" stroke-opacity=".25" stroke-width="2"/>
  <path d="m378 512 552-10 16 15-580 10z" fill="#879079" opacity=".12"/>
  <path d="m706 560 148-10 77 57-166 13z" fill="#b7b19b" opacity=".85"/><path d="m701 555 148-10 73 54-166 13z" fill="#6e7764"/><path d="m702 555 86-9 8 10 57-4 65 44-163 16z" fill="#a3a38a"/>
  <path d="m730 568 100-9m-90 17 101-9m-88 17 100-9" stroke="#4a5145" stroke-width="2" opacity=".7"/>
  <path d="m848 584 42-40" stroke="#141f1a" stroke-width="5"/><path d="m883 551 8-9" stroke="#afb69f" stroke-width="2"/>
  <path d="m390 569 149-3 36 43-155 6z" fill="#111a15" stroke="#5c6556" stroke-width="2"/><path d="m406 572 116-2 22 27-121 4z" fill="#232d24"/><ellipse cx="440" cy="584" rx="13" ry="6" stroke="#697160" stroke-width="4"/><ellipse cx="495" cy="582" rx="13" ry="6" stroke="#697160" stroke-width="4"/>
  <path d="m436 580 58-2m-58 10 58-2" stroke="#92977d" stroke-width="1"/><path d="m442 606 38-1m10 0 8 0" stroke="#bbc0a3" stroke-width="3"/><circle class="record-led" cx="539" cy="604" r="3" fill="#d6654b"/>
  <path d="M898 485v51q16 10 32-1v-49" fill="#3d4940"/><ellipse cx="914" cy="485" rx="16" ry="5" fill="#6c7565"/><ellipse cx="914" cy="486" rx="12" ry="3" fill="#111b16"/><path d="M930 491q23-3 10 20h-10" stroke="#566152" stroke-width="5"/>
  <path d="m250 640 187-15 65 57-207 21z" fill="#17231c"/><path d="m255 637 182-14 60 54-202 23z" fill="#747b65"/><path d="m298 650 95-11m-81 22 117-13" stroke="#3d4738" stroke-width="3"/>
  <rect width="1200" height="760" fill="url(#vignette)"/>
  </g></svg>`;
}
export function caseArt(number: string, large = false): string {
  const content = number === '01' ? `<path d="M135 105q-20 25-5 63l80 65q36 13 54-9l-32-39-22 13-46-39 10-22z" fill="#858275" stroke="#b3ab8e" stroke-width="2"/><path d="M144 102q38-15 56 7l-15 33-58-24zm91 81 39 27q12 13-9 26l-42-42z" fill="#4a5146"/><path d="M137 119C89 121 83 212 111 244s25 19 37 24" stroke="#767a67" stroke-width="5"/><path d="m301 89-5 159m-62-168 93 4-6 169-81-3" stroke="#526158" stroke-width="2"/><text x="249" y="128" fill="#aeab8c" font-size="18" font-family="monospace">02:13</text>` : number === '02' ? `<path d="M161 45h150v243H161z" fill="#494b42" stroke="#858371" stroke-width="3"/><path d="M179 61h114v221H179z" stroke="#5e6254" stroke-width="2"/><rect x="201" y="99" width="65" height="34" fill="#958967"/><text x="211" y="124" fill="#242b25" font-size="25" font-family="Georgia">309</text><path d="M184 191h29v6h-29z" fill="#9b9478"/><path d="M309 47h8v241h-8z" fill="#ada787" opacity=".7"/><path d="m317 288 106 37H238z" fill="#b8ab7c" opacity=".13"/>` : `<path d="M131 232q9-91 78-99 65 11 72 99" fill="#111e1d"/><ellipse cx="208" cy="111" rx="33" ry="42" fill="#243c38"/><path d="M241 89q54 2 47 69l36 90h-70l-16-69" fill="#627873" opacity=".25"/><path d="M108 71h197v187H108z" stroke="#658079" stroke-dasharray="4 9"/><path d="m113 296 196-201M72 182h270" stroke="#a5b4a1" opacity=".18"/><circle cx="208" cy="156" r="84" stroke="#719089" opacity=".3"/>`;
  return `<svg class="case-art ${large ? 'large' : ''}" viewBox="0 0 440 310" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="case-${number}"><stop stop-color="${number === '02' ? '#44423a' : number === '03' ? '#29423f' : '#39453b'}"/><stop offset="1" stop-color="#151e1b"/></radialGradient></defs><rect width="440" height="310" fill="url(#case-${number})"/><path d="M0 48h440M0 268h440" stroke="#879582" opacity=".09"/>${content}<rect width="440" height="310" fill="#081312" opacity=".18"/></svg>`;
}
export const waveform = () => `<div class="waveform" aria-hidden="true">${Array.from({ length: 42 }, (_, i) => `<i style="--h:${8 + ((i * 17 + i * i * 7) % 39)}px;--d:${i * .07}s"></i>`).join('')}</div>`;
export function evidenceArt(kind: string): string {
  const shapes: Record<string, string> = {
    workshop: '<path d="M35 135V34h280v101M56 135V52h81v83m18-83h137v65H155z" stroke="#acb49c" stroke-width="3"/><path d="M154 87h137m-68-35v65" stroke="#64776b" stroke-width="3"/><path d="M227 114v-22q0-20 15-20t15 20v22" fill="#1d3026"/><circle cx="242" cy="69" r="9" fill="#84917b"/><path d="M17 144h318M50 27h244" stroke="#728574" stroke-width="2"/>',
    van: '<path d="m38 110 13-47h178l37 27 40 9v30H38z" fill="#596e5a" stroke="#a0af90" stroke-width="2"/><path d="M69 72h95v30H62zm107 0h45l33 28h-78z" fill="#172c24"/><circle cx="200" cy="88" r="8" fill="#a3aa8b"/><circle cx="135" cy="90" r="8" fill="#8c997f"/><circle cx="93" cy="130" r="19" fill="#13271f" stroke="#a0af90" stroke-width="3"/><circle cx="251" cy="130" r="19" fill="#13271f" stroke="#a0af90" stroke-width="3"/><path d="M0 159h350M20 45l20-15m266 22 20-15" stroke="#82927a"/>',
    hall: '<path d="m0 10 145 46h60L350 10M0 170l145-60h60l145 60M145 56v54m60-54v54M55 29v119M290 29v119" stroke="#92a18b" stroke-width="2"/><path d="m58 59 37 6v55" stroke="#839480"/><path d="M176 114V86m0 10-10 10m10-10 11 9m-11 9-9 22m9-22 10 22" stroke="#b3bda5" stroke-width="7"/><circle cx="176" cy="77" r="9" fill="#a6b397"/>',
    portrait: '<path d="M94 170q0-65 80-65t80 65" fill="#607364"/><ellipse cx="174" cy="69" rx="34" ry="43" fill="#acb19a"/><path d="M140 84q-24-65 28-64 64-1 41 64l-8-39-49 11-7 36" fill="#203a2b"/><path d="M154 68h10m19 0h11m-28 22h18" stroke="#3a5041" stroke-width="3"/><path d="M85 9h175v156H85z" stroke="#abb49a" opacity=".35"/>',
    file: '<path d="m63 129 100-34 56-33 67 28-69 27-55 25-88 11z" fill="#8f9a80"/><path d="m193 87 12 14" stroke="#52644f" stroke-width="2"/><path d="M25 150h300m-280 0v-6m10 6v-4m10 4v-6m10 6v-4m10 4v-6" stroke="#b6b9a2"/>'
  };
  return `<svg class="evidence-visual" viewBox="0 0 350 180" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="Reconstitución ilustrada del contenido del informe"><rect width="350" height="180" fill="#263c30"/>${shapes[kind] ?? shapes.file}<path d="M0 35h350M0 72h350M0 109h350M0 146h350" stroke="#080e09" opacity=".12"/><text x="12" y="20" font-family="monospace" font-size="7" fill="#b5bca1" letter-spacing="1.5">RECONSTITUCIÓN DEL INFORME</text></svg>`;
}
