/* =========================================================
   Outils
   ========================================================= */
export const $ = s => document.querySelector(s);
export const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pad = n => String(n).padStart(2,'0');
export const todayISO = () => { const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
export const mKey = iso => iso.slice(0,7);
export const nowM = () => mKey(todayISO());
export const shiftM = (m,n) => { let [y,mo]=m.split('-').map(Number); mo+=n; while(mo>12){mo-=12;y++} while(mo<1){mo+=12;y--} return `${y}-${pad(mo)}`; };
export const mName = (m,short) => new Date(m+'-15').toLocaleDateString('fr-FR', short?{month:'short'}:{month:'long',year:'numeric'});
export const eur = (n,dec) => (Math.round(n*100)/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:dec===0?0:2,minimumFractionDigits:dec===0?0:(Number.isInteger(Math.round(n*100)/100)?0:2)});
export const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9&+ -]/g,' ').replace(/\s+/g,' ').trim();
export const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
export const num = v => { const n = parseFloat(String(v).replace(',','.').replace(/\s/g,'')); return isFinite(n)?n:0; };
