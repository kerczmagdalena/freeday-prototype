// Freeday — powitanie v2. Jedna zasada: rozmowa jest produktem. Tylko front, bez sieci.
const ic = (n, s = 18, w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const sign = (w) => SIGN.replace('class="sign"', `class="sign" style="width:${w}px"`);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const D = {
  summary: 'Rano wypiłaś tylko kawę i czułaś się spokojnie. Po pracy miałaś ochotę na piwo, ale odpuściłaś, a w nocy spałaś słabo, około 5 godzin.',
  short: 'Rano tylko kawa i spokój, po pracy ochota na piwo — odpuściłaś.',
  time: '13:49', tod: 'po południu',
  transcript: [
    ['u', 'Hej, dzisiaj rano wypiłam tylko kawę i czuję się dość spokojnie.'],
    ['a', 'Spokojny poranek po samej kawie — dobrze, że możesz go dziś poczuć, Magdalena. Jak ten spokój towarzyszy Ci teraz, po południu?'],
    ['u', 'Po południu miałam ochotę na piwo po pracy, ale odpuściłam.'],
    ['a', 'Po pracy pojawiła się ochota, a jednak udało Ci się odpuścić. To ważny moment. Jak mocno Cię wtedy ciągnęło?'],
    ['u', 'Trochę się stresowałam spotkaniem, ale poszło ok.'],
    ['u', 'Spałam dziś słabo, może 5 godzin.'],
    ['a', 'Pięć godzin snu to niewiele, zwłaszcza po takim popołudniu. Co nie dało Ci spać ostatniej nocy?'],
  ],
};
const CHIPS = `<div class="chips"><span class="chip c-drink">${ic('coffee',12,2)}tylko kawa</span><span class="chip c-crave">${ic('wine',12,2)}ochota odpuszczona</span><span class="chip c-emo">${ic('heart',12,2)}spokój, stres</span><span class="chip c-sleep">${ic('moon',12,2)}~5 h snu</span></div>`;

// Reguły powitania: nagłówek to ZAWSZE pytanie, na które się odpowiada; intro jest opcjonalne.
const RULES = {
  default: 'Domyślne (cały dzień to samo)', today: 'Już rozmawiała dziś', gap: 'Powrót po przerwie (3+ dni)',
  milestone: 'Kamień milowy (7/30/50/100…)', reset: 'Seria bez alkoholu wyzerowana',
};
function opening() {
  const h = new Date().getHours();
  switch (S.g) {
    case 'today': return { intro: `Wracasz — wcześniej pisałaś o spokojnym poranku.`, q: h < 12 ? 'Jak minął poranek?' : h < 18 ? 'Jak Ci mija dzień?' : 'Jak tam wieczór?', p: ['Dalej dobrze', 'Bez zmian', 'Gorzej niż rano'] };
    case 'gap': return { intro: 'Dobrze Cię widzieć. Minęło 5 dni od ostatniej rozmowy.', q: 'Co u Ciebie słychać, Magdalena?', p: ['Całkiem dobrze', 'Różnie', 'Nie najlepiej'] };
    case 'milestone': return { intro: 'Dziś mija 100 dni z Freeday. Dziękuję, że jesteś.', q: 'Jak się masz, Magdalena?', p: ['Całkiem dobrze', 'Tak sobie', 'Nie najlepiej'] };
    case 'reset': return { intro: 'Jestem tu. Każdy dzień to nowy start, bez oceniania.', q: 'Jak się dziś czujesz?', p: ['Trochę lepiej', 'Tak sobie', 'Ciężko mi'] };
    default: return { intro: 'Dobrze, że jesteś.', q: 'Jak się masz, Magdalena?', p: ['Całkiem dobrze', 'Tak sobie', 'Nie najlepiej'] };
  }
}
// Presety = skala: pozytywny / neutralny / negatywny (kolejność z góry na dół). Wpisują początek odpowiedzi.
const TONES = ['pos', 'neu', 'neg'];
const TONE_REPLY = {
  pos: 'Miło to słyszeć, Magdalena. Co dziś sprawiło, że jest całkiem dobrze? Warto zauważyć, co Ci służy.',
  neu: '„Tak sobie” to też dobra odpowiedź, nie wszystko musi być jednoznaczne. Opowiesz, co dziś było lepsze, a co gorsze?',
  neg: 'Dziękuję, że mi to mówisz, Magdalena. Nie musisz niczego od razu naprawiać, jestem tu i mamy czas. Co dziś jest najtrudniejsze?',
};
const toneOf = (t) => { for (const r of Object.keys(RULES)) { const g = S.g; S.g = r; const i = opening().p.findIndex((x) => t.toLowerCase().startsWith(x.toLowerCase())); S.g = g; if (i >= 0) return TONES[i]; } return null; };

const REPLIES = [
  'Dziękuję, że piszesz, Magdalena. Spokojny dzień po słabej nocy to coś, co warto zauważyć. Co sprawiło, że dziś tak się czujesz?',
  'Rozumiem. Dobry sen potrafi nieść przez kilka dni, a jego brak też daje o sobie znać. A jak było z ochotą na alkohol w ciągu dnia: pojawiła się, czy raczej był spokój?',
  'To ważne, że to zauważasz: ochota przyszła i przeszła, a spacer z psem pomógł. Takie małe rzeczy często działają najlepiej, bo zmieniają otoczenie i rytm. Co jeszcze zwykle Ci pomaga w takich momentach?',
  'Herbata i telefon odłożony wcześniej brzmią jak dobry plan na wieczór. Jeśli chcesz, jutro rano zapytam, jak Ci się spało i czy to coś zmieniło. Śpij dobrze, Magdalena.',
];
const q = new URLSearchParams(location.search);
const S = { dmode: 'day', m: q.get('m') || 'auto', day: q.get('day') === '1', g: q.get('g') || 'default', view: 'home', tab: 'chat',
  stats: q.get('stats') === '1', sumMin: false, month: false, sel: 28, msgs: [], draft: '', sw: null };
const mode = () => (S.m === 'auto' ? (innerWidth < 760 ? 'mobile' : 'desktop') : S.m);
if (S.sw === null) S.sw = mode() === 'mobile' && innerWidth > 900;
const started = () => S.msgs.length > 0;
S.follow = true;

// ---------- pieces ----------
const statPills = () => `<span class="stat s-fresh">${ic('leaf',14,1.7)}<b>Nowy start</b></span><span class="stat s-act">${ic('flame',14,2)}<b>1 dzień</b> z rzędu</span>`;
const tiles = () => `<div class="tiles"><div class="tile f"><div class="h">${ic('leaf',13,1.7)}Bez alkoholu</div><b>Nowy start</b><small>najdłuższa seria: 5 dni</small></div><div class="tile o"><div class="h">${ic('flame',13,2)}Rozmowy z rzędu</div><b>1 dzień</b><small>dziś rozmawiasz</small></div></div>`;
const dstats = (full) => `<div class="dstats${full ? ' full' : ''}"><div class="ds-h">Twoje serie</div>
  <div class="ds-s"><span class="ds-i f">${ic('leaf',14,1.8)}</span><div><span class="ds-l">Bez alkoholu</span><b>Nowy start</b><small>najdłuższa: 5 dni</small></div></div>
  <div class="ds-s"><span class="ds-i o">${ic('flame',14,1.8)}</span><div><span class="ds-l">Rozmowy z rzędu</span><b>1 dzień</b><small>dziś rozmawiasz</small></div></div>
  ${full ? `<div class="ds-h ds-h2">Ty i Freeday</div>${[['72','dni z Freeday'],['6','aktywnych dni'],['70','wiadomości']].map(([n, l]) => `<div class="ds-n"><b>${n}</b><span>${l}</span></div>`).join('')}` : ''}</div>`;
const nums = () => `<div class="group"><div class="numbers"><div><b>72</b><span>dni z Freeday</span></div><div><b>6</b><span>aktywnych dni</span></div><div><b>70</b><span>wiadomości</span></div></div></div>`;
const histChip = () => `<button class="hist" data-act="prev" title="Wcześniej dziś, ${D.time}: otwórz poprzednią rozmowę" aria-label="Wcześniejsza rozmowa z ${D.time}">${ic('hist',15,2)}<span>${D.time}</span></button>`;
const composer = (ph = 'Odpowiedz Freeday…') => `<form class="composer" data-form><input data-input placeholder="${ph}" value="${esc(S.draft)}" autocomplete="off" aria-label="Twoja odpowiedź"><button class="send${S.draft ? ' on' : ''}" type="submit" aria-label="Wyślij">${ic('up',17,2.2)}</button></form>`;
const earlier = () => `<button class="earlier" data-act="prev"><div class="t"><span class="k">Wcześniej dziś · ${D.time}</span><span class="s">${D.short}</span></div><span class="go">${ic('cr',16,2)}</span></button>`;
function question(size) {
  const o = opening();
  return `<div class="who">${sign(16)}<b>Freeday</b><span>· teraz</span></div>${o.intro ? `<div class="intro">${o.intro}</div>` : ''}<div class="q" style="font-size:${started() ? Math.round(size * 0.72) : size}px">${o.q}</div>`;
}
const presets = () => started() ? '' : `<div class="presets">${opening().p.map((p) => `<button class="preset" data-act="preset" data-v="${esc(p)}">${ic('arrow',15,1.8)}<span>${p}</span></button>`).join('')}</div>`;
// Oczekiwanie na odpowiedź: małe „słoneczko” Freeday, którego promienie łagodnie wschodzą falą + szary, migoczący podpis.
const THINK_SUN = `<svg class="think-sun" viewBox="0 0 24 14" aria-hidden="true"><defs><clipPath id="fd-sky"><rect x="-4" y="-6" width="32" height="17.9"/></clipPath></defs><g clip-path="url(#fd-sky)"><g class="sun">${[[-60, 2], [-30, 1], [0, 0], [30, 1], [60, 2]].map(([a, k]) => `<g transform="translate(12 11.8) rotate(${a})"><rect class="ray r${k}" x="-1.2" y="-10.8" width="2.4" height="10.8" rx=".5"/></g>`).join('')}<path class="core" d="M7.4 11.9A4.6 4.6 0 0 1 16.6 11.9Z"/></g></g><rect class="hz" x="0.5" y="11.5" width="23" height="2.5" rx=".6"/></svg>`; // v12: wschód słońca — horyzont → słońce wschodzi → promienie → oddech → zachód
const msgBody = (m) => m.r === 'a' && m.typing ? `${THINK_SUN}<span class="tt">${esc(m.t)}</span>` : esc(m.t);
const msgs = () => started() ? `<div class="msgs">${S.msgs.map((m) => `<div${m.r === 'u' ? ' data-u' : ''}${m.r === 'a' && !m.done ? ' id="stream"' : ''}${m.typing ? ' role="status" aria-live="polite"' : ''} class="${m.r === 'u' ? 'bu' : 'ba'}${m.typing ? ' thinking' : ''} fadein">${msgBody(m)}</div>`).join('')}</div>` : '';
// Wątek = oś czasu: kropka wcześniej (ciągłość) → pomarańczowy znak „teraz” (pytanie) → odpowiedzi
function thread(size, withEarlier = !started()) {
  return `<div class="thread">${withEarlier ? `<div class="ti"><div class="rail"><span class="dot"></span><span class="ln"></span></div><div>${earlier()}</div></div>` : ''}
  <div class="ti now"><div class="rail"><span class="dot">${sign(16)}</span></div><div>${question(size).replace(/<div class="who">[\s\S]*?<\/div>/, `<div class="who"><b>Freeday</b><span>· teraz</span></div>`)}${msgs()}</div></div></div>`;
}
const transcript = () => `<div class="tr">${D.transcript.map(([r, t]) => `<div class="${r === 'u' ? 'bu' : 'ba'}">${t}</div>`).join('')}</div>`;
const sumhead = () => `<div class="sumhead"><div class="sumbox${S.sumMin ? ' min' : ''}"><div class="top"><span class="lab">W skrócie</span><button class="tg" data-act="summin">${S.sumMin ? 'Rozwiń' : 'Zwiń'} <span style="display:flex;${S.sumMin ? '' : 'transform:rotate(180deg)'}">${ic('cd',14,2)}</span></button></div><p>${D.summary}</p>${S.sumMin ? '' : CHIPS}</div></div>`;

// ---------- day panel / side column ----------
function week() {
  const days = [['PN',26],['WT',27],['ŚR',28],['CZ',29],['PT',30],['SB',31],['ND',1]];
  return `<div class="week">${days.map(([d, n]) => `<button data-act="pick" data-v="${n}" class="${n === 28 ? 'has' : ''}${n === S.sel ? ' sel' : ''}"><small>${d}</small>${n}</button>`).join('')}</div>`;
}
function month() {
  return `<div class="grid7">${['PN','WT','ŚR','CZ','PT','SB','ND'].map((d) => `<div class="dh">${d}</div>`).join('')}${'<div></div>'.repeat(3)}${Array.from({ length: 31 }, (_, i) => i + 1).map((n) => `<button data-act="pick" data-v="${n}" class="${n === 28 ? 'has' : ''}${n === S.sel ? ' sel' : ''}${n > 28 ? ' fut' : ''}">${n}</button>`).join('')}</div>`;
}
function dayDetail() {
  if (S.sel !== 28) return `<div class="empty">${S.sel > 28 || S.sel === 1 ? 'Ten dzień jeszcze przed Tobą.' : 'Tego dnia nie było rozmowy.'}</div>`;
  return `<div class="card"><div class="dmeta"><span class="dt">Środa, 28 października</span><span class="badge">Dzień bez alkoholu</span></div>
  <div class="dtitle">Twój dzień upłynął w spokoju, mimo że stres przed spotkaniem dał o sobie znać i wywołał umiarkowany głód alkoholu.</div>
  <div class="dbody">Świetnie, że wybrałaś trzeźwość, nawet gdy emocje próbowały pociągnąć Cię w inną stronę. Sen mógłby być dłuższy, a dobry odpoczynek to Twój sojusznik w takich momentach.</div>
  <div class="mets"><div class="met" style="background:#FBF0D2;color:#9A7A1E"><small>Emocje</small><b>Stres</b></div><div class="met" style="background:#E6E9F3;color:#2B3E7A"><small>Sen</small><b>Słaby</b></div><div class="met" style="background:#FBE3DA;color:#C2501C"><small>Głód</small><b>Średni 5/10</b></div></div></div>`;
}
const convRows = () => S.sel === 28 ? `<div><div class="gh"><span>Rozmowy tego dnia</span></div><div class="group"><button class="row${S.view === 'prev' ? ' sel' : ''}" data-act="prev"><div class="ricon">${ic('sun',17,2)}</div><div class="rtxt"><b>${D.time} · ${D.tod}</b><span class="cl">${D.summary}</span></div><div class="rval">${ic('cr',17,2)}</div></button></div></div>` : '';
// Kolumna danych. Zwinięta (desktop) = serie + liczby + tydzień. Rozwinięta = „Podsumowanie dnia”: to samo + kalendarz, rozmowy dnia, szczegóły.
function side(expanded) {
  const cal = `<div class="card" style="padding:12px"><div class="calh"><span>${S.month ? 'Październik 2026' : 'Ten tydzień'}</span><button data-act="month">${S.month ? 'Zwiń do tygodnia' : 'Cały miesiąc'} <span style="display:flex;${S.month ? 'transform:rotate(180deg)' : ''}">${ic('cd',14,2)}</span></button></div>${S.month ? month() : week()}</div>`;
  const data = `<div><div class="gh"><span>Twoje serie</span></div>${tiles()}</div><div><div class="gh"><span>Ty i Freeday</span></div>${nums()}</div>`;
  const series = `<div><div class="gh"><span>Twoje serie</span></div>${tiles()}</div>`;
  // v7: desktop zwinięty = tylko „Twoje serie”. Reszta żyje w rozwiniętym „Podsumowaniu dnia” (ta sama szerokość kolumny).
  if (!expanded) return mode() === 'desktop' ? `<div class="pclosed">${dstats(false)}</div>`
    : `<div class="stack">${data}<div><div class="gh"><span>Historia</span><button data-act="day">Podsumowanie dnia ›</button></div><div class="card" style="padding:12px">${week()}</div></div></div>`;
  if (mode() === 'desktop') {
    const seg = `<div class="dseg" role="tablist">${[['day','Twój dzień'],['p','Portret']].map(([k, n]) => `<button role="tab" aria-selected="${S.dmode === k}" class="${S.dmode === k ? 'on' : ''}" data-act="dmode" data-v="${k}">${n}</button>`).join('')}</div>`;
    if (S.dmode === 'p') return `<div class="stack">${seg}<div class="empty">Portret — w prototypie bez treści.</div></div>`;
    // v9: dzień jest bohaterem (tydzień → podsumowanie → rozmowy), statystyki to mały, drugorzędny blok obok/nad.
    const wk = `<div class="dweek"><div class="dweek-h"><span>${S.month ? 'Październik 2026' : 'Ten tydzień'}</span><button data-act="month">${S.month ? 'Zwiń' : 'Cały miesiąc'}<span style="display:flex;${S.month ? 'transform:rotate(180deg)' : ''}">${ic('cd',14,2)}</span></button></div>${S.month ? month() : week()}</div>`;
    // v14: „Twoje serie” i „Ty i Freeday” jak na mobile — pod przełącznikiem, nad kalendarzem.
    const dcards = `<div class="dcards"><div class="dcard"><div class="gh"><span>Twoje serie</span></div>${tiles()}</div><div class="dcard"><div class="gh"><span>Ty i Freeday</span></div>${nums()}</div></div>`;
    return `<div class="pv">${seg}<div class="bento"><div class="bmain">${dcards}${wk}${dayDetail()}${convRows()}</div></div></div>`;
  }
  return `<div class="stack">${data}<div><div class="gh"><span>Podsumowanie dnia</span></div>${cal}</div>${convRows()}${dayDetail()}</div>`;
}

// ---------- mobile ----------
function mobile() {
  let body;
  if (S.tab === 'day') body = `<div class="mscroll"><div style="padding:6px 20px 20px">${side(true)}</div></div>`;
  else if (S.tab === 'p') body = `<div class="mscroll"><div style="padding:20px"><div class="empty">Portret — w prototypie bez treści.</div></div></div>`;
  else body = `<div class="mscroll" id="scroller"><div class="inner top">${started() ? '' : '<div class="daydate">Środa, 28 października · dzień 72</div>'}${thread(started() ? 30 : 34)}</div></div><div class="mbottom"><button class="tobottom" data-act="bottom" aria-label="Przewiń na dół">${ic('cd',18,2.2)}</button>${presets()}${composer(started() ? 'Napisz wiadomość…' : 'Odpowiedz Freeday…')}</div>`;
  const top = `<div class="mtop"><div class="bar"><img src="assets/logotype_claim.svg" alt="Freeday"><div style="display:flex;align-items:center;gap:8px">${S.tab === 'chat' && started() ? histChip() : ''}<button class="avatar" data-act="menu" aria-haspopup="menu" aria-expanded="false" aria-label="Konto: Magdalena">M</button></div></div></div>`;
  const nav = `<nav class="nav">${[['chat','Rozmowa','msg'],['day','Twój dzień','cal'],['p','Portret','chart']].map(([k, n, i]) => `<button class="${S.tab === k ? 'on' : ''}" data-act="tab" data-v="${k}">${ic(i,22,S.tab === k ? 2 : 1.6)}${n}</button>`).join('')}</nav>`;
  const push = S.view === 'prev' ? `<div class="push"><div class="status"><span>15:10</span><i></i></div><div class="push-head"><button class="back" data-act="home" aria-label="Wróć">${ic('cl',22,2)}</button><div class="t"><b>Rozmowa z dziś</b><span>${D.time} · ${D.tod} · 7 wiadomości</span></div></div>
    <div class="push-body" id="pushbody">${sumhead()}${transcript()}</div><div class="mbottom"><button class="cta" data-act="cont">${ic('msg',17,2)}Wróć do rozmowy teraz</button></div></div>` : '';
  return `<div class="phone"><div class="wash"></div><div class="status"><span>15:10</span><i></i></div>${top}${body}${nav}${push}</div>`;
}

// ---------- desktop ----------
function desktop() {
  const top = `<div class="topbar"><img src="assets/logotype_claim.svg" alt="Freeday"><div class="r">${started() && S.view !== 'prev' ? histChip() : ''}<button class="toggle${S.day ? ' on' : ''}" data-act="day" aria-pressed="${S.day}">${ic('panel',16,2)}Podsumowanie dnia</button><button class="avatar" data-act="menu" aria-haspopup="menu" aria-expanded="false" aria-label="Konto: Magdalena" title="Magdalena">M</button></div></div>`;
  let chat;
  if (S.view === 'prev') {
    chat = `<div class="d-scroll" id="scroller"><div class="d-col"><div style="padding:6px 0 2px;display:flex;align-items:center;gap:10px"><button class="backlink" data-act="home">${ic('cl',17,2)}Wróć do rozmowy teraz</button><span style="color:var(--line)">·</span><span style="font-size:13.5px;color:var(--ink-mute)">Rozmowa z dziś, ${D.time}</span></div>${sumhead()}${transcript()}</div></div>
      <div class="d-foot"><div class="d-col"><button class="cta" data-act="cont" style="height:46px">${ic('msg',17,2)}Kontynuuj teraz</button></div></div>`;
  } else {
    // Kolumna czatu jak na mobile: oś (wcześniej → pytanie → podpowiedzi) przy dole, pole wpisywania przypięte na dole.
    chat = `<div class="d-scroll dflex" id="scroller"><div class="d-col dthread top">${started() ? '' : '<div class="daydate">Środa, 28 października · dzień 72</div>'}${thread(started() ? 30 : 38)}</div></div><div class="d-foot"><div class="d-col"><button class="tobottom" data-act="bottom" aria-label="Przewiń na dół">${ic('cd',18,2.2)}</button>${presets()}${composer(started() ? 'Napisz wiadomość…' : 'Odpowiedz Freeday…')}<div class="note">Freeday pamięta tę rozmowę i będzie do niej wracać.</div></div></div>`;
  }
  const html = `<div class="d-root"><div class="wash"></div>${top}<div class="d-body"><main class="d-chat">${chat}</main><aside class="d-side${S.day ? ' open' : ''}${S.fade ? ' fade' : ''}" id="dside">${side(S.day)}</aside></div></div>`;
  S.fade = false; return html;
}

// ---------- switcher ----------
function switcher() {
  if (!S.sw) return `<div class="sw closed"><button class="tgl" data-act="sw">${ic('sq',14,2)}Prototyp</button></div>`;
  const sg = (k, opts) => `<span class="sg">${opts.map(([v, l]) => `<button class="${String(S[k]) === v ? 'on' : ''}" data-act="set" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</span>`;
  return `<div class="sw"><div class="r"><span>Widok</span>${sg('m', [['auto','Auto'],['mobile','Mobile'],['desktop','Desktop']])}<button data-act="sw" style="margin-left:auto;color:#9CA0AB">${ic('x',14,2)}</button></div>
  <div class="r${mode() === 'mobile' ? ' dis' : ''}"><span>Panel dnia</span>${sg('day', [['false','Zwinięty'],['true','Otwarty']])}</div>
  <div class="r"><span>Powitanie</span><select data-sel="g">${Object.entries(RULES).map(([k, l]) => `<option value="${k}"${S.g === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
  <div class="r"><span></span><a href="index.html">← warianty A/B/C</a><button data-act="reset" style="color:#9CA0AB;margin-left:8px">reset</button></div></div>`;
}

// ---------- render & events ----------
const root = document.getElementById('app');
// Spokojny scroll (jak ChatGPT/Claude/Gemini): po 1. odpowiedzi układ przechodzi płynnie z „przy dole” na „od góry”,
// kolejne wiadomości dopisują się pod spodem. Podczas „pisania” Freeday ekran podąża za dołem tylko,
// gdy użytkowniczka jest na dole; jeśli przewinęła w górę — nic się nie rusza, pojawia się okrągły przycisk ↓.
const atBottom = (sc) => sc.scrollHeight - sc.scrollTop - sc.clientHeight < 40;
function wireScroll(sc) {
  const btn = root.querySelector('.tobottom');
  const upd = () => { const b = atBottom(sc); S.follow = b; if (btn) btn.classList.toggle('show', !b && started()); };
  sc.addEventListener('scroll', upd, { passive: true }); upd();
}
function render(opts = {}) {
  const prevTop = document.getElementById('scroller')?.scrollTop;
  const md = mode(), framed = md === 'mobile' && innerWidth > 520;
  document.body.className = (md === 'mobile' ? (framed ? 'framed' : 'native') : 'desk') + (q.get('clean') ? ' clean' : '');
  root.innerHTML = (md === 'mobile' ? mobile() : desktop()) + switcher();
  if (framed) root.querySelector('.phone').style.transform = `scale(${Math.min(1, (innerHeight - 40) / 844, (innerWidth - 40) / 390)})`;
  const sc = document.getElementById('scroller');
  if (sc) {
    if (started() && S.view === 'home' && S.follow) sc.scrollTop = sc.scrollHeight;
    else if (opts.keep !== false && prevTop != null) sc.scrollTop = prevTop;
    if (opts.flipFrom != null) { // FLIP: pytanie startuje tam, gdzie było, i płynnie jedzie na górę
      const th = sc.querySelector('.thread'), now = sc.querySelector('.ti.now');
      if (th && now) { const d = opts.flipFrom - now.getBoundingClientRect().top; th.style.transform = `translateY(${d}px)`; th.getBoundingClientRect(); th.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)'; th.style.transform = ''; th.addEventListener('transitionend', () => { th.style.transition = ''; }, { once: true }); }
    }
    if (S.view === 'home') wireScroll(sc);
  }
  if (opts.focus) { const i = root.querySelector('[data-input]'); if (i) { i.focus({ preventScroll: true }); i.setSelectionRange(i.value.length, i.value.length); } }
  const p = new URLSearchParams({ m: S.m }); if (q.get('clean')) p.set('clean', '1'); if (S.day) p.set('day', '1'); if (S.g !== 'default') p.set('g', S.g); history.replaceState(null, '', '?' + p);
}
function send() {
  const t = S.draft.trim(); if (!t) return;
  const flipFrom = started() ? null : document.querySelector('#scroller .ti.now')?.getBoundingClientRect().top;
  S.msgs.push({ r: 'u', t }); S.draft = '';
  const a = { r: 'a', t: 'Freeday myśli…', typing: true }; S.msgs.push(a);
  const sc0 = document.getElementById('scroller');
  if (sc0 && !atBottom(sc0)) S.follow = false; else S.follow = true;
  render({ focus: true, flipFrom });
  const sc = document.getElementById('scroller');
  // własna wiadomość ma być widoczna: jeśli wypadła pod ekran, łagodnie zjeżdżamy na dół
  if (sc && !flipFrom) { S.follow = true; sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' }); }
  const n = S.msgs.length / 2 - 1, tone = n === 0 ? toneOf(t) : null;
  const full = tone ? TONE_REPLY[tone] : REPLIES[n % REPLIES.length];
  streamReply(a, full);
}
// Realistyczne opóźnienie: najpierw agent-nadzorca (~2–3 s samej animacji), potem drugi agent „pisze na żywo”.
// Słowa dochodzą kawałkami (1–3 słowa, nieregularnie ~30–60 ms/słowo, krótkie pauzy po interpunkcji);
// każde nowe słowo wchodzi wyblakłe i w ~450 ms dochodzi do koloru tekstu (CSS .w). Po końcu — zwykły tekst.
const rnd = (a, b) => a + Math.random() * (b - a);
const follow = () => { const s2 = document.getElementById('scroller'); if (s2 && S.follow) s2.scrollTop = s2.scrollHeight; return s2; };
function streamReply(a, full) {
  const think = 2200 + Math.random() * 800;
  const swapT = setTimeout(() => { // po chwili podpis zmienia się na „Zastanawiam się…”
    if (!a.typing) return; a.t = 'Zastanawiam się…';
    const tt = document.querySelector('#stream .tt'); if (tt) { tt.classList.add('swap'); setTimeout(() => { tt.textContent = a.t; tt.classList.remove('swap'); }, 180); }
  }, 1500);
  setTimeout(() => {
    clearTimeout(swapT);
    const words = full.match(/\S+\s*/g) || [full]; let i = 0;
    a.typing = false; a.t = '';
    let el = document.getElementById('stream');
    if (el) { el.classList.remove('thinking', 'fadein'); el.removeAttribute('role'); el.textContent = ''; }
    const tick = () => {
      const n = Math.min(words.length - i, Math.random() < 0.5 ? 1 : Math.random() < 0.7 ? 2 : 3);
      const chunk = words.slice(i, i + n); i += n; a.t += chunk.join('');
      el = document.getElementById('stream');
      if (el) {
        if (el.querySelector('.tt')) el.textContent = ''; // gdy coś przerysowało widok w trakcie
        if (el.children.length === 0 && el.textContent) el.textContent = a.t.slice(0, a.t.length - chunk.join('').length);
        for (const w of chunk) { const sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; el.appendChild(sp); }
      }
      const s2 = follow();
      if (i < words.length) {
        const last = chunk[chunk.length - 1].trim();
        setTimeout(tick, n * rnd(30, 60) + (/[.?!:]$/.test(last) ? rnd(120, 220) : /[,;—–]$/.test(last) ? rnd(50, 110) : 0));
      } else {
        a.done = true;
        const e1 = el; if (e1) e1.removeAttribute('id'); // kolejna odpowiedź dostanie własny #stream
        setTimeout(() => { if (e1 && e1.isConnected) e1.textContent = a.t; }, 520);
        const b = document.querySelector('.tobottom'); s2 && b && b.classList.toggle('show', !atBottom(s2));
      }
    };
    tick();
  }, think);
}
root.addEventListener('submit', (e) => { e.preventDefault(); send(); });
root.addEventListener('input', (e) => { if (e.target.matches('[data-input]')) { S.draft = e.target.value; e.target.closest('form').querySelector('.send').classList.toggle('on', !!S.draft); } });
root.addEventListener('change', (e) => { if (e.target.matches('[data-sel]')) { S[e.target.dataset.sel] = e.target.value; render(); } });
root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v; e.preventDefault();
  let focus = false;
  switch (a) {
    case 'prev': S.view = 'prev'; S.tab = 'chat'; S.sumMin = false; S.sel = 28; render({ keep: false }); return;
    case 'home': S.view = 'home'; S.follow = true; render({ keep: false }); return;
    case 'cont': S.view = 'home'; S.follow = true; render({ focus: true, keep: false }); return;
    case 'bottom': { const sc = document.getElementById('scroller'); S.follow = true; sc?.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' }); return; }
    case 'dmode': S.dmode = v; break;
    case 'menu': toggleMenu(el); return;
    case 'preset': S.draft = v; send(); return; // v11b: preset od razu wysyła wiadomość (jak ręczne wysłanie)
    case 'summin': S.sumMin = !S.sumMin; break;
    case 'day': if (mode() === 'mobile') S.tab = 'day'; else { S.day = !S.day; S.fade = true; } break;
    case 'month': S.month = !S.month; break;
    case 'pick': S.sel = +v; break;
    case 'tab': S.tab = v; S.view = 'home'; render({ focus, keep: false }); return;
    case 'sw': S.sw = !S.sw; break;
    case 'set': S[el.dataset.k] = v === 'true' ? true : v === 'false' ? false : v; break;
    case 'reset': Object.assign(S, { view: 'home', tab: 'chat', stats: false, month: false, sel: 28, msgs: [], draft: '', g: 'default', day: false }); break;
  }
  render({ focus });
});
let rt; addEventListener('resize', () => { closeMenu(); clearTimeout(rt); rt = setTimeout(render, 120); });

// --- menu konta (v6). Pozycje TYLKO z istniejących funkcji aplikacji:
// imię = accountLabel (app/app/page.tsx), „Głos asystenta” = VoicePicker modal (AppShell.tsx), „Wyloguj się” = POST /api/auth/logout.
Object.assign(ICONS, {
  vol: '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
});
let menuEl = null, menuBtn = null;
function closeMenu(restore) {
  if (!menuEl) return;
  menuEl.remove(); menuEl = null;
  document.querySelectorAll('.avatar').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  if (restore) document.querySelector('.avatar')?.focus();
}
function toggleMenu(btn) {
  if (menuEl) return closeMenu();
  menuBtn = btn; btn.setAttribute('aria-expanded', 'true');
  const r = btn.getBoundingClientRect();
  menuEl = document.createElement('div');
  menuEl.className = 'acct' + (mode() === 'mobile' ? ' m' : '');
  menuEl.setAttribute('role', 'menu');
  menuEl.innerHTML = `<div class="acct-h"><span class="avatar sm" aria-hidden="true">M</span><b>Magdalena</b></div>
    <button role="menuitem" data-m="voice">${ic('vol',17,1.8)}<span>Głos asystenta</span></button>
    <div class="acct-sep"></div>
    <button role="menuitem" data-m="out">${ic('out',17,1.8)}<span>Wyloguj się</span></button>`;
  document.body.appendChild(menuEl);
  const w = menuEl.offsetWidth;
  menuEl.style.top = (r.bottom + 8) + 'px';
  menuEl.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.right - w)) + 'px';
  menuEl.querySelector('[role=menuitem]').focus({ preventScroll: true });
  menuEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    closeMenu(true);
    toast(b.dataset.m === 'out' ? 'Prototyp: tu nastąpi wylogowanie' : 'Prototyp: tu otworzy się wybór głosu');
  });
}
document.addEventListener('pointerdown', (e) => { if (menuEl && !menuEl.contains(e.target) && !e.target.closest('.avatar')) closeMenu(); });
document.addEventListener('keydown', (e) => {
  if (!menuEl) return;
  if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault(); const it = [...menuEl.querySelectorAll('[role=menuitem]')], i = it.indexOf(document.activeElement);
    it[(i + (e.key === 'ArrowDown' ? 1 : -1) + it.length) % it.length].focus();
  }
});
let toastT;
function toast(t) {
  let el = document.querySelector('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2200);
}
render();
