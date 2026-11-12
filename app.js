const $ = id => document.getElementById(id);
const films = Array.from({length: 6}, (_, i) => {
  const id = String(i + 1).padStart(2, '0');
  return {id, name: 'Wedding in motion ' + id, src: 'assets/render-' + id + '.mp4', poster: 'assets/render-' + id + '.jpg'};
});
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
  film.poster = item.poster;
  film.muted = true;
  film.controls = false;
  if (film.getAttribute('src') !== item.src) film.src = item.src;
  else film.currentTime = 0;
  film.play().catch(error => { if (error.name !== 'AbortError') film.controls = true; });
  $('title').textContent = item.name;
  $('number').textContent = item.id + ' / ' + String(films.length).padStart(2, '0');
  for (const [i, card] of cards.entries()) {
    card.classList.toggle('active', i === selected);
    card.setAttribute('aria-pressed', String(i === selected));
  }
}

film.addEventListener('ended', () => select(selected + 1));
$('prev').onclick = () => select(selected - 1);
$('next').onclick = () => select(selected + 1);
$('mapping-toggle').onclick = () => {
  const enabled = mapping.hidden;
  mapping.hidden = !enabled;
  $('mapping-toggle').setAttribute('aria-pressed', String(enabled));
  if (enabled) mapping.play().catch(() => {
    mapping.hidden = true;
    $('mapping-toggle').setAttribute('aria-pressed', 'false');
  });
  else mapping.pause();
};
$('light').oninput = e => {
  $('room').style.setProperty('--room-light', e.target.value / 100);
  $('lightvalue').textContent = e.target.value + '%';
};
$('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('room').requestFullscreen();
  } catch {
    $('room').scrollIntoView({behavior: 'smooth', block: 'center'});
  }
};
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) return;
  if (e.key === 'ArrowRight') select(selected + 1);
  if (e.key === 'ArrowLeft') select(selected - 1);
});
select(0);
