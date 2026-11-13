const $ = id => document.getElementById(id);
const films = Array.from({length: 6}, (_, i) => {
  const id = String(i + 1).padStart(2, '0');
  return {id, name: 'Wedding in motion ' + id, src: 'assets/render-' + id + '.mp4', poster: 'assets/render-' + id + '.jpg'};
});
films.push({id: '07', name: 'Mapping', src: 'assets/mapping.mp4', poster: 'assets/mapping.jpg', fullRoom: true});
for (const group of ['Ben', 'ETC']) {
  for (const speed of ['Fast', 'Medium', 'Slow']) {
    const slug = (group + '-' + speed).toLowerCase();
    const id = String(films.length + 1).padStart(2, '0');
    films.push({id, name: group + ' · ' + speed, src: 'assets/' + slug + '.mp4', poster: 'assets/' + slug + '.jpg'});
  }
}
for (const clip of ['07', '07-retro', '08', '08-retro']) {
  const id = String(films.length + 1).padStart(2, '0');
  films.push({id, name: 'Wedding in motion ' + clip, src: 'assets/render-' + clip + '.mp4', poster: 'assets/render-' + clip + '.jpg'});
}
const film = $('film'), mapping = $('mapping'), cards = [];
let selected = 0;

for (const [index, item] of films.entries()) {
  const button = document.createElement('button');
  button.className = 'work';
  button.type = 'button';
  button.setAttribute('aria-label', 'แสดง ' + item.name);
  button.innerHTML = '<div class="thumb"><img loading="lazy" src="' + item.poster + '" alt=""><span class="play">▶ MOTION FILM</span></div><div class="meta"><span>' + item.name + '</span><span>' + item.id + ' / MOTION</span></div>';
  button.onclick = () => { select(index); $('showroom').scrollIntoView(); };
  $('video-gallery').append(button);
  cards.push(button);
}

function select(index) {
  selected = (index + films.length) % films.length;
  const item = films[selected];
  const player = item.fullRoom ? mapping : film;
  const inactive = item.fullRoom ? film : mapping;
  inactive.pause();
  inactive.hidden = true;
  player.hidden = false;
  player.muted = true;
  if (player === film) film.controls = false;
  if (!item.fullRoom) film.poster = item.poster;
  if (player.getAttribute('src') !== item.src) player.src = item.src;
  else player.currentTime = 0;
  player.play().catch(error => {
    if (error.name !== 'AbortError' && player === film && !film.hidden) film.controls = true;
  });
  $('title').textContent = item.name;
  $('kind').textContent = item.fullRoom ? 'MAPPING · FULL ROOM' : 'MOTION · AUTO PLAYLIST';
  $('number').textContent = item.id + ' / ' + String(films.length).padStart(2, '0');
  for (const [i, card] of cards.entries()) {
    card.classList.toggle('active', i === selected);
    card.setAttribute('aria-pressed', String(i === selected));
  }
}

for (const player of [film, mapping]) player.addEventListener('ended', () => {
  if (!player.hidden) select(selected + 1);
});
$('prev').onclick = () => select(selected - 1);
$('next').onclick = () => select(selected + 1);
$('light').oninput = e => {
  $('room').style.setProperty('--room-light', e.target.value / 100);
  $('lightvalue').textContent = e.target.value + '%';
};
const touchDevice = matchMedia('(pointer: coarse)');
const portrait = matchMedia('(orientation: portrait)');
const rotateHint = $('rotate-hint');
let landscapeLocked = false;

portrait.addEventListener('change', () => {
  if (!portrait.matches) rotateHint.hidden = true;
});

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) return;
  if (landscapeLocked) screen.orientation?.unlock?.();
  landscapeLocked = false;
  rotateHint.hidden = true;
});

$('fullscreen').onclick = async () => {
  rotateHint.hidden = true;
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  const room = $('room');
  try {
    await room.requestFullscreen();
  } catch {
    room.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
  if (!touchDevice.matches) return;
  if (document.fullscreenElement === room && screen.orientation?.lock) {
    try {
      await screen.orientation.lock('landscape');
      if (document.fullscreenElement === room) landscapeLocked = true;
      else screen.orientation.unlock?.();
      return;
    } catch {
      // Unsupported browsers still allow the viewer to turn the phone manually.
    }
  }
  rotateHint.hidden = !portrait.matches;
};
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) return;
  if (e.key === 'ArrowRight') select(selected + 1);
  if (e.key === 'ArrowLeft') select(selected - 1);
});
select(0);
