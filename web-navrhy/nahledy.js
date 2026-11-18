(()=>{'use strict';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const poi=[{"nazev": "Zámek Valtice", "vzdusne_m": 769, "lat": 48.7403579, "lon": 16.756591, "pesky_min": 13, "autem_min": 4}, {"nazev": "Kostel Nanebevzetí Panny Marie", "vzdusne_m": 740, "lat": 48.7410644, "lon": 16.7572707, "pesky_min": 12, "autem_min": 4}, {"nazev": "Náměstí Svobody", "vzdusne_m": 841, "lat": 48.7414291, "lon": 16.7559985, "pesky_min": 14, "autem_min": 4}, {"nazev": "Pošta", "vzdusne_m": 868, "lat": 48.7416891, "lon": 16.7557408, "pesky_min": 15, "autem_min": 4}, {"nazev": "Coop potraviny", "vzdusne_m": 534, "lat": 48.7438697, "lon": 16.7671315, "pesky_min": 14, "autem_min": 4}, {"nazev": "Coop supermarket", "vzdusne_m": 745, "lat": 48.742763, "lon": 16.7584173, "pesky_min": 14, "autem_min": 4}, {"nazev": "Lékárna (Nemocnice Valtice)", "vzdusne_m": 729, "lat": 48.7430178, "lon": 16.7589587, "pesky_min": 13, "autem_min": 4}, {"nazev": "Nemocnice Valtice", "vzdusne_m": 726, "lat": 48.7435015, "lon": 16.7596273, "pesky_min": 13, "autem_min": 4}, {"nazev": "Mateřská škola", "vzdusne_m": 776, "lat": 48.7447804, "lon": 16.7608113, "pesky_min": 13, "autem_min": 4}, {"nazev": "Základní škola", "vzdusne_m": 908, "lat": 48.740384, "lon": 16.7546676, "pesky_min": 16, "autem_min": 4}, {"nazev": "Vlaková zastávka Valtice město", "vzdusne_m": 1123, "lat": 48.7486669, "lon": 16.7621253, "pesky_min": 22, "autem_min": 4}, {"nazev": "Nádraží Valtice", "vzdusne_m": 2006, "lat": 48.7475532, "lon": 16.7427548, "pesky_min": 33, "autem_min": 6}, {"nazev": "Kolonáda na Rajstně", "vzdusne_m": 2264, "lat": 48.7369952, "lon": 16.7361773, "pesky_min": 45, "autem_min": 8}, {"nazev": "Lednice", "vzdusne_m": 7314, "lat": 48.8001413, "lon": 16.8039515, "pesky_min": 107, "autem_min": 12}];
const houses=[['95,3','115'],['100,6','82'],['95,3','169']];
const tabs=$$('[role=tab]'), panels=$$('[role=tabpanel]');
function select(id,focus=false){
 if(!['a','b','c'].includes(id))id='a';
 tabs.forEach(t=>{const on=t.id==='tab-'+id;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;if(on&&focus)t.focus()});
 panels.forEach(p=>p.hidden=p.dataset.id!==id);
 $('#approval-variant').value=id;
 updateApproval();
 $('#view-status').textContent='Zobrazen návrh '+id.toUpperCase()+'. Všechny návrhy mají stejnou výbavu.';
}
tabs.forEach((t,i)=>{
 t.addEventListener('click',()=>select(t.dataset.id));
 t.addEventListener('keydown',e=>{const k=e.key,dest=k==='Home'?0:k==='End'?2:k==='ArrowRight'?(i+1)%3:k==='ArrowLeft'?(i+2)%3:null;if(dest!==null){e.preventDefault();select(tabs[dest].dataset.id,true)}});
});
function device(phone){
 $('#viewport').classList.toggle('is-phone',phone);$('.stage-pad').classList.toggle('mobile-mode',phone);
 $('#phone').setAttribute('aria-pressed',String(phone));$('#desktop').setAttribute('aria-pressed',String(!phone));
}
$('#desktop').addEventListener('click',()=>device(false));$('#phone').addEventListener('click',()=>device(true));
$$('[data-house]').forEach((btn,i)=>btn.addEventListener('click',()=>{
 $$('[data-house]').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
 $('#floor-area').textContent=houses[i][0]+' m²';$('#garden-area').textContent=houses[i][1]+' m²';$('#house-name').textContent='Dům '+(i+1)+'.';
 const pick=$('[data-inquiry]',$('#mock-b'));pick.value=String(i+1);pick.dispatchEvent(new Event('change'));
}));
$$('.compare').forEach(cmp=>{
 const inp=$('input[type=range]',cmp);
 inp.addEventListener('input',()=>{const v=Number(inp.value);cmp.style.setProperty('--cut',v+'%');cmp.dataset.edge=v===0?'plan':v===100?'now':'';inp.setAttribute('aria-valuetext','Skutečná fotografie '+v+' procent, vizualizace '+(100-v)+' procent')});
});
$$('.homes-section').forEach(block=>{
 let selected=[0,2];
 $$('[data-compare-house]',block).forEach(btn=>btn.addEventListener('click',()=>{
  const id=Number(btn.dataset.compareHouse);
  selected=selected.includes(id) ? selected.filter(i=>i!==id) : [...selected.slice(-1),id];
  $$('[data-compare-house]',block).forEach(b=>b.setAttribute('aria-pressed',String(selected.includes(Number(b.dataset.compareHouse)))));
  const pair=[...selected].sort();
  $('[data-selection-text]',block).textContent=pair.map(i=>'Dům '+(i+1)).join(' a ') || 'žádný dům';
  const result=$('[data-selection-result]',block);
  if(pair.length<2){result.textContent='Vyberte dva domy pro porovnání.';return}
  const [a,b]=pair.map(i=>houses[i]);
  result.textContent=(a[0]===b[0]?'Užitná plocha shodná':'Plochy '+a[0]+' / '+b[0]+' m²')+' · zahrady '+a[1]+' / '+b[1]+' m²';
 }));
});
const floorCopy={
 np:'Z ulice vstoupíte do zádveří a chodby. V tomto podlaží jsou tři pokoje a WC.',
 pp:'Obývací pokoj s kuchyní a jídelnou navazuje na terasu. Ve stejném podlaží je koupelna a technická místnost.'
};
$$('.plans-section').forEach(block=>$$('[data-floor]',block).forEach(btn=>btn.addEventListener('click',()=>{
 $$('[data-floor]',block).forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
 $$('[data-floor-image]',block).forEach(img=>img.hidden=img.dataset.floorImage!==btn.dataset.floor);
 $('[data-floor-desc]',block).textContent=floorCopy[btn.dataset.floor];
})));
$$('.locality-section').forEach(block=>{
 let index=0,mode='pesky_min';
 function update(){
  const loc=poi[index];const wide=index===13;
  const bounds=wide?[16.731,16.815,48.732,48.808]:[16.733,16.773,48.734,48.750];
  const project=(lat,lon)=>[30+(lon-bounds[0])/(bounds[1]-bounds[0])*560,270-(lat-bounds[2])/(bounds[3]-bounds[2])*240];
  $$('[data-poi-dot]',block).forEach((dot,i)=>{const [x,y]=project(poi[i].lat,poi[i].lon);dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',i===index?'7':'4');dot.setAttribute('visibility',i===13&&!wide?'hidden':'visible');dot.classList.toggle('active',i===index)});
  $$('[data-map-label]',block).forEach(label=>{const i=Number(label.dataset.mapLabel),[x,y]=project(poi[i].lat,poi[i].lon);label.setAttribute('x',x+Number(label.dataset.dx));label.setAttribute('y',y+Number(label.dataset.dy));label.setAttribute('visibility',wide?'hidden':'visible')});
  const [x,y]=project(48.7391914,16.7667197);
  ['.project-dot','.project-halo'].forEach(sel=>{const p=$(sel,block);p.setAttribute('cx',x);p.setAttribute('cy',y)});
  $('.project-text',block).setAttribute('x',x+12);$('.project-text',block).setAttribute('y',y+23);
  $('[data-travel-time]',block).innerHTML=loc[mode]+' <small>min</small>';
  $('[data-travel-name]',block).textContent=(mode==='pesky_min'?'pěšky':'autem')+' · '+loc.nazev;
  $('[data-poi-name]',block).textContent=loc.nazev;
  $('[data-locality-note]',block).textContent=wide?'Širší okolí':'Místní výřez';
 }
 $('.poi-choice',block).addEventListener('change',e=>{index=Number(e.target.value);update()});
 $$('[data-travel]',block).forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.travel;$$('[data-travel]',block).forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));update()}));
});
$$('.contact-section').forEach(block=>{
 const choice=$('[data-inquiry]',block),link=$('[data-inquiry-link]',block);
 function update(){
  const v=choice.value;const name=v==='projekt'?'projekt Na Vinici':'dům '+v;
  link.innerHTML=(v==='projekt'?'Napsat o projektu':'Napsat o domě '+v)+' <span>↗</span>';
  link.href='mailto:daniel.zajicek@bcas.cz?subject='+encodeURIComponent('Na Vinici – '+name)+'&body='+encodeURIComponent('Dobrý den, pane Zajíčku,\n\nmám zájem o '+name+' ve Valticích. Prosím o více informací.\n\nDěkuji.');
 }
 choice.addEventListener('change',update);update();
});
const dialog=$('#lightbox'),big=$('#lightbox-image');
$$('[data-lightbox]').forEach(btn=>btn.addEventListener('click',()=>{
 const im=$('img',btn);big.src=im.src;big.alt=im.alt;$('#lightbox-caption').textContent=im.alt;dialog.showModal();
}));
$('.close-lightbox').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
const modelButton = $('#model-switch');
const modelMount = $('#model-mount');
const modelLink = $('#model-standalone');
modelButton.addEventListener('click', () => {
 const active = modelMount.hidden;
 if (active) {
  const frame = document.createElement('iframe');
  frame.title = 'Interaktivní 3D model domů Na Vinici na pozemku';
  frame.src = modelLink.href;
  frame.allowFullscreen = true;
  modelMount.replaceChildren(frame);
 } else {
  modelMount.replaceChildren();
 }
 modelMount.hidden = !active;
 $('#model-poster').hidden = active;
 modelLink.hidden = !active;
 modelButton.setAttribute('aria-pressed', String(active));
 modelButton.textContent = active ? 'Zpět na vizualizaci' : 'Prozkoumat dům ve 3D ↗';
});

const approvalVariant=$('#approval-variant');
const notes=$('#approval-notes');
function updateApproval(){
 const label=approvalVariant.selectedOptions[0].textContent;
 const subject='Na Vinici · Schválení návrhu '+label;
 const lines=['Dobrý den,','', 'pro dopracování webu Na Vinici vybíráme návrh '+label+'.'];
 if(notes.value.trim())lines.push('','Připomínky k dopracování:',notes.value.trim());
 lines.push('','S pozdravem');
 $('#approval-email').href='mailto:honza@frantisekdron.cz?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
}
approvalVariant.addEventListener('change',()=>select(approvalVariant.value));
notes.addEventListener('input',updateApproval);
select(new URLSearchParams(window.location.search).get('navrh') || 'a');
})();
