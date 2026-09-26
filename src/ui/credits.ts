interface AudioCredit {
  use: string;
  title: string;
  author: string;
  url: string;
}

const audioCredits: AudioCredit[] = [
  { use: 'Menú principal', title: 'Noir Jazz Detective Midnight Mystery', author: 'alex-morgan', url: 'https://pixabay.com/music/crime-scene-noir-jazz-detective-midnight-mystery-587403/' },
  { use: 'Logros', title: 'Tangled Game', author: 'Universfield', url: 'https://pixabay.com/music/ambient-tangled-game-167992/' },
  { use: 'Caso 01', title: 'Noir Detective Tension', author: 'Universfield', url: 'https://pixabay.com/music/crime-scene-noir-detective-tension-528072/' },
  { use: 'Caso 02', title: 'Psychological Suspense Theme with Broken Toy Piano', author: 'DesiFreeMusic', url: 'https://pixabay.com/music/modern-classical-psychological-suspense-theme-with-broken-toy-piano-free-music-394046/' },
  { use: 'Caso 03', title: 'Dark Ambient Cinematic Drone Investigative Pulse Minimalist Tension', author: 'Ovrsoull', url: 'https://pixabay.com/music/ambient-dark-ambient-cinematic-drone-investigative-pulse-minimalist-tension-454723/' },
  { use: 'Caso 04', title: 'Noir Crime Tension', author: 'JorisVermeer', url: 'https://pixabay.com/music/ambient-noir-crime-tension-535274/' },
  { use: 'Caso 05', title: 'No Exit 1 – Intense Suspense Music Loop (D Minor)', author: 'Stylomanas', url: 'https://pixabay.com/music/electronic-no-exit-1-intense-suspense-music-loop-d-minor-365031/' },
  { use: 'Caso 06', title: 'Static Corridor – Suspense Atmosphere Soundscape', author: 'StudioKolomna', url: 'https://pixabay.com/music/mystery-static-corridor-suspense-atmosphere-soundscape-418162/' },
  { use: 'Caso 07', title: 'Deep Water Adventure – Ambient Underwater Music', author: 'JuliusH', url: 'https://pixabay.com/music/ambient-deep-water-adventure-ambient-underwater-music-167787/' },
  { use: 'Caso 08', title: 'Cinematic Shadows – Noir Soundscapes', author: 'Lilliben', url: 'https://pixabay.com/music/electronic-cinematic-shadows-noir-soundscapes-365176/' },
  { use: 'Caso 09', title: 'Investigating Shadows (dark Ambient)', author: 'Liecio', url: 'https://pixabay.com/music/ambient-investigating-shadows-dark-ambient-258067/' },
  { use: 'Caso 10', title: 'Dark Ambient Background Mystery', author: 'Lilliben', url: 'https://pixabay.com/music/ambient-dark-ambient-background-mystery-365195/' },
  { use: 'Desenlaces', title: 'Noir Crime Piano', author: 'Universfield', url: 'https://pixabay.com/music/mystery-noir-crime-piano-190649/' },
  { use: 'Logro desbloqueado', title: 'Level Complete', author: 'Universfield', url: 'https://pixabay.com/sound-effects/film-special-effects-level-complete-143022/' }
];

export function creditsPanel(): string {
  return `<div class="credits-intro"><p class="eyebrow">¿ESTÁS SEGURO? · EL JUEGO</p><p>Ficción interactiva original de investigación criminal y terror psicológico, desarrollada a partir de la idea y el documento de diseño de Luis.</p></div>
    <section class="credits-section"><h3>Creación</h3><dl class="credits-roles"><div><dt>Concepto y dirección</dt><dd>Luis Zabala</dd></div><div><dt>Guion, desarrollo e interfaz</dt><dd>Producción del proyecto «¿Estás seguro?»</dd></div><div><dt>Ilustraciones</dt><dd>Arte vectorial original creado para el juego</dd></div></dl></section>
    <section class="credits-section"><div class="credits-heading"><h3>Música y sonido</h3><a href="https://pixabay.com/service/license-summary/" target="_blank" rel="noopener noreferrer">Licencia de Pixabay</a></div><p>Gracias a quienes publicaron estas obras para que pudieran formar parte del juego.</p><div class="credits-list">${audioCredits.map(item => `<article><span>${item.use}</span><div><strong>${item.title}</strong><small>${item.author}</small></div><a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${item.title} en Pixabay">Pixabay ↗</a></article>`).join('')}</div><p class="aside">El breve ambiente de cinta se genera localmente con Web Audio. Las voces de las pruebas se presentan como transcripciones; no hay actuación de voz grabada.</p></section>
    <section class="credits-section"><h3>Información legal</h3><p>Las pistas se utilizan bajo la Licencia de contenido de Pixabay. Los personajes, instituciones, lugares y hechos de los diez expedientes son ficticios.</p><p class="aside">Versión 1.2 · Diez expedientes · Cuarenta desenlaces.</p></section>`;
}
