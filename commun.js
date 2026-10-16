/* Pointeuse de poche — fonctions communes (Pointage + Suivi) */
window.P = (() => {
  const SB_RPC = 'https://uwghxfihxznhvhizujjn.supabase.co/rest/v1/rpc/';
  const SB_KEY = 'sb_publishable_FD1iPhHle7rsL3cacvCA4A_wKDxUdFs';

  const store = prefix => ({
    get(k, d) { try { const v = localStorage.getItem(prefix + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(prefix + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(prefix + k); } catch (e) {} }
  });

  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => ymd(new Date());
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const toClock = m => { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  const parseT = v => { if (!v || !/^\d{1,2}:\d{2}/.test(v)) return null; const [h, m] = v.split(':').map(Number); return h * 60 + m; };
  const dur = m => { const s = m < 0 ? '−' : ''; m = Math.abs(m); return s + Math.floor(m / 60) + ' h ' + pad(m % 60); };
  const sdur = m => (m >= 0 ? '+' : '') + dur(m);
  const hhmm = m => { const s = m < 0 ? '−' : ''; m = Math.abs(m); return s + pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  const cent = m => (m / 60).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' h';
  const words = m => { const s = m < 0 ? 'moins ' : ''; m = Math.abs(m); const h = Math.floor(m / 60), n = m % 60;
    return s + h + (h > 1 ? ' heures ' : ' heure ') + n + (n > 1 ? ' minutes' : ' minute'); };
  const norm = s => String(s || '').toUpperCase().replace(/\s+/g, '');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tsFrom = (d, t, after) => {
    const [y, mo, da] = d.split('-').map(Number), [h, mi] = t.split(':').map(Number);
    let v = new Date(y, mo - 1, da, h, mi).getTime();
    if (after != null && v < after) v += 86400000;
    return v;
  };
  const clockOf = ts => { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const monthLabel = ym => { const [y, m] = ym.split('-').map(Number); return cap(new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })); };
  const dayLabel = d => { const [y, m, da] = d.split('-').map(Number); return cap(new Date(y, m - 1, da).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })); };
  const shiftMonth = (ym, k) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + k, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
  const monthRange = ym => { const [y, m] = ym.split('-').map(Number); return [ym + '-01', ym + '-' + pad(new Date(y, m, 0).getDate())]; };
  const msg = (el, text, kind) => { el.textContent = text || ''; el.className = 'msg' + (kind ? ' ' + kind : ''); };

  async function rpc(fn, body) {
    const r = await fetch(SB_RPC + fn, {
      method: 'POST',
      headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const txt = await r.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch (e) {}
    if (!r.ok) {
      const err = new Error((data && data.message) || ('Erreur ' + r.status));
      err.status = r.status; err.code = data && data.code;
      throw err;
    }
    return data;
  }
  const isUnknown = e => e && (e.code === 'P0002' || /inconnu/i.test(e.message || ''));
  const netMsg = e => (e && /fetch|network|load/i.test(e.message || '')) ? 'Pas de connexion. Réessaie quand tu as du réseau.' : (e && e.message) || 'Erreur inconnue.';

  async function copy(text, fallbackEl) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      if (fallbackEl) { const r = document.createRange(); r.selectNodeContents(fallbackEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      return false;
    }
  }
  function confirmBtn(btn, action, label) {
    if (btn.dataset.armed) { delete btn.dataset.armed; btn.textContent = btn.dataset.label; action(); return; }
    btn.dataset.label = btn.textContent; btn.dataset.armed = '1'; btn.textContent = label;
    setTimeout(() => { if (btn.dataset.armed) { delete btn.dataset.armed; btn.textContent = btn.dataset.label; } }, 4000);
  }

  /* Un jour : { jour, arr, dep, target, pause } — arr/dep en ms epoch, target/pause en minutes */
  const LIVE_MS = 20 * 3600e3;
  const worked = j => Math.max(0, Math.round((j.dep - j.arr) / 60000) - (j.pause || 0));
  function dayInfo(j, now) {
    const times = clockOf(j.arr) + ' → ' + (j.dep != null ? clockOf(j.dep) : '…');
    if (j.dep != null) {
      const w = worked(j), s = w - (j.target || 0);
      return { times: times + ' · ' + dur(w), chip: sdur(s), cls: s >= 0 ? 'done' : 'over' };
    }
    if (now >= j.arr && now - j.arr < LIVE_MS) return { times, chip: 'En cours', cls: 'run' };
    if (now < j.arr) return { times, chip: 'Prévu', cls: '' };
    return { times, chip: 'Départ manquant', cls: 'warn' };
  }
  function stats(list, now) {
    const st = { badged: list.length, worked: 0, target: 0, solde: 0, complete: 0, missing: 0, live: null };
    list.forEach(j => {
      if (j.dep != null) { const w = worked(j); st.worked += w; st.target += j.target || 0; st.solde += w - (j.target || 0); st.complete++; }
      else if (now >= j.arr && now - j.arr < LIVE_MS) st.live = j;
      else if (now >= j.arr) st.missing++;
    });
    return st;
  }
  function tilesHTML(st) {
    return `<div class="tile"><span>Jours badgés</span><b>${st.badged}</b></div>
      <div class="tile"><span>Travaillé</span><b>${dur(st.worked)}</b></div>
      <div class="tile"><span>Solde</span><b class="${st.solde > 0 ? 'pos' : st.solde < 0 ? 'neg' : ''}">${sdur(st.solde)}</b></div>`;
  }
  function statsNote(st) {
    if (!st.badged) return '';
    const parts = ['Objectif cumulé ' + dur(st.target) + ' sur ' + st.complete + (st.complete > 1 ? ' jours terminés' : ' jour terminé')];
    if (st.live) parts.push('journée en cours comptée à la sortie');
    if (st.missing) parts.push(st.missing + (st.missing > 1 ? ' jours sans départ, non comptés' : ' jour sans départ, non compté'));
    return parts.join(' · ');
  }
  function rowHTML(j, now, editable, expanded) {
    const i = dayInfo(j, now), tag = editable ? 'button' : 'div';
    const attrs = editable ? ` type="button" data-d="${j.jour}" aria-expanded="${expanded ? 'true' : 'false'}" aria-label="Modifier ${esc(dayLabel(j.jour))}"` : '';
    return `<${tag} class="hrow"${attrs}><span class="hd">${esc(dayLabel(j.jour))}</span><span class="fc ${i.cls}">${esc(i.chip)}</span><span class="ht">${esc(i.times)}</span></${tag}>`;
  }

  return { store, pad, ymd, today, nowMin, toClock, parseT, dur, sdur, hhmm, cent, words, norm, esc, tsFrom, clockOf,
    monthLabel, dayLabel, shiftMonth, monthRange, msg, rpc, isUnknown, netMsg, copy, confirmBtn,
    LIVE_MS, worked, dayInfo, stats, tilesHTML, statsNote, rowHTML };
})();
