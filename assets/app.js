(function(){
var D=window.CATALOG,C={},BY={},PAGE=150,shown=PAGE,list=[];
var MAIL='info@unikpackaging.com',KEY='upk_wishlist',CKEY='upk_wishlist_contact',WLV='wishlist';
D.collections.forEach(function(c){C[c.id]=c});
function uid(it){return it.c+':'+it.i}
D.items.forEach(function(it){BY[uid(it)]=it});
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s||'').replace(/[&<>"]/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
function oneLine(s){return String(s||'').replace(/\s*\n\s*/g,' / ').trim()}

/* ---------- wishlist storage: localStorage upk_wishlist = [{id:"c01:W0018",q:"20 cartons"},...] ---------- */
var WL=load();
function load(){try{var a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.filter(function(x){return x&&BY[x.id]}):[]}catch(e){return[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(WL))}catch(e){}updateCount()}
function idx(id){for(var i=0;i<WL.length;i++)if(WL[i].id===id)return i;return -1}
function has(id){return idx(id)>-1}
function add(id,q){if(!BY[id])return false;var k=idx(id);if(k>-1){if(q&&!WL[k].q)WL[k].q=q;return false}WL.push({id:id,q:q||''});return true}
function removeId(id){var k=idx(id);if(k>-1)WL.splice(k,1)}
function loadContact(){try{return JSON.parse(localStorage.getItem(CKEY)||'{}')||{}}catch(e){return{}}}
var FIELDS=['name','co','email','phone','notes'];
function contact(){var o={};FIELDS.forEach(function(f){o[f]=$('f_'+f).value.trim()});return o}
function saveContact(){try{localStorage.setItem(CKEY,JSON.stringify(contact()))}catch(e){}}

/* ---------- share link: ?wl=base64url(JSON {n,co,it:[[id,qty],...]}) ---------- */
function b64e(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}
function shareUrl(){
  var c=contact(),o={it:WL.map(function(x){return x.q?[x.id,x.q]:[x.id]})};
  if(c.name)o.n=c.name; if(c.co)o.co=c.co;
  return location.origin+location.pathname+'?wl='+b64e(JSON.stringify(o));
}
var SH=null;
(function(){
  var p=new URLSearchParams(location.search).get('wl');if(!p)return;
  try{var o=JSON.parse(b64d(p));var it=(o.it||[]).map(function(a){return{id:String(a[0]),q:a[1]?String(a[1]):''}}).filter(function(x){return BY[x.id]});
    SH={n:o.n||'',co:o.co||'',it:it,map:{}};it.forEach(function(x){SH.map[x.id]=x.q});
  }catch(e){SH={n:'',co:'',it:[],map:{},bad:true}}
})();

/* ---------- catalog table ---------- */
var nav=$('colnav'),sel=$('colsel');
function navHtml(){
  var h='<a href="#" data-c="">All collections<small>'+D.items.length+' items</small></a>'+
    '<a href="#'+WLV+'" data-c="'+WLV+'" class="nav-wl">&#9829; My wishlist<small id="navwl">'+WL.length+' items</small></a>';
  var o='<option value="">All collections ('+D.items.length+')</option><option value="'+WLV+'">&#9829; My wishlist</option>';
  D.collections.forEach(function(c){
    h+='<a href="#'+c.id+'" data-c="'+c.id+'">'+esc(c.name)+'<small>'+esc(c.type)+' · '+c.count+' items</small></a>';
    o+='<option value="'+c.id+'">'+esc(c.name)+' — '+esc(c.type)+' ('+c.count+')</option>';
  });
  nav.innerHTML=h; sel.innerHTML=o;
}
function cur(){return decodeURIComponent(location.hash.replace('#',''))}
function norm(s){return String(s||'').toLowerCase().replace(/[\s×x*.:]+/g,'')}
function filter(){
  var c=cur(),q=$('q').value.trim(),nq=norm(q),base;
  document.body.classList.toggle('is-shared',!!SH);
  if(SH)base=SH.it.map(function(x){return BY[x.id]});
  else if(c===WLV)base=WL.map(function(x){return BY[x.id]});
  else base=D.items.filter(function(it){return !c||it.c===c});
  list=base.filter(function(it){
    if(!q)return true;
    return norm(it.i).indexOf(nq)>-1||norm(it.s).indexOf(nq)>-1||norm(it.n).indexOf(nq)>-1;
  });
  shown=PAGE; render();
  var col=C[c],mt=q?' matching “'+q+'”':'',cnt=list.length+' item'+(list.length==1?'':'s');
  if(SH){
    var who=[SH.co,SH.n].filter(Boolean).join(' / ');
    $('shared').hidden=false;
    $('sharedtxt').textContent=SH.bad?'This wishlist link could not be read.':'Viewing shared wishlist ('+SH.it.length+' item'+(SH.it.length==1?'':'s')+')'+(who?' from '+who:'');
    $('sharedsub').textContent=SH.bad?'':' Quantities requested are shown under each item.';
    $('shimport').hidden=!!SH.bad;
    $('title').textContent='Shared wishlist'+(who?' · '+who:'');
    $('sub').textContent=cnt+mt;
  }else{
    $('shared').hidden=true;
    $('title').textContent=c===WLV?'My wishlist':col?col.name+' · '+col.type:'All collections';
    $('sub').textContent=c===WLV?cnt+mt+(WL.length?'':' — tap ♡ or “By request” on any item to add it'):(col?(col.range?'Items '+col.range+' · ':''):D.collections.length+' collections · ')+cnt+mt;
  }
  sel.value=SH?'':(C[c]||c===WLV?c:'');
  [].forEach.call(nav.querySelectorAll('a'),function(a){a.classList.toggle('on',!SH&&a.getAttribute('data-c')===c)});
}
function row(it,n){
  var id=uid(it),on=has(id);
  var ph=it.p.length?it.p.map(function(p,k){return '<img loading="lazy" src="'+p+'" alt="'+esc(it.i)+(k?' view '+(k+1):'')+'" data-cap="'+esc(it.i)+'" data-id="'+esc(id)+'">'}).join(''):'<span class="muted">Photo on request</span>';
  var col=C[it.c],sq=SH&&SH.map[id];
  return '<tr data-id="'+esc(id)+'"'+(on?' class="wl-on"':'')+'><td class="c-n">'+n+'</td><td><div class="ph">'+ph+'</div></td>'+
   '<td><div class="item-r"><div class="item">'+esc(it.i)+'</div>'+heart(id,on)+'</div><span class="tag">'+esc(col.name)+'</span>'+(sq?'<span class="sq">Qty: '+esc(sq)+'</span>':'')+'</td>'+
   '<td><div class="size">'+esc(it.s)+'</div>'+(it.n?'<span class="note">'+esc(it.n)+'</span>':'')+'</td>'+
   '<td>'+esc(it.k)+'</td><td class="r">'+esc(it.q)+'</td><td class="r">'+esc(it.v)+'</td>'+
   '<td class="r">'+pill(id,on)+'</td></tr>';
}
function heart(id,on){return '<button type="button" class="hrt-b'+(on?' on':'')+'" data-wl="'+esc(id)+'" aria-pressed="'+on+'" aria-label="'+(on?'Remove from':'Add to')+' wishlist" title="'+(on?'Remove from':'Add to')+' wishlist">'+(on?'&#9829;':'&#9825;')+'</button>'}
function pill(id,on){return '<button type="button" class="price-pill'+(on?' on':'')+'" data-pr="'+esc(id)+'" title="'+(on?'In your wishlist – click to view':'Add to wishlist to get a quote')+'"><span class="pp-t">By request</span>'+(on?'<span class="pp-s">&#10003; In wishlist</span>':'')+'</button>'}
function render(){
  var h=[];for(var i=0;i<Math.min(shown,list.length);i++)h.push(row(list[i],i+1));
  $('rows').innerHTML=h.join('');
  $('empty').hidden=list.length>0; $('more').hidden=shown>=list.length;
  $('empty').textContent=(!SH&&cur()===WLV&&!WL.length)?'Your wishlist is empty. Tap ♡ or “By request” on any item to add it.':'No items match your search.';
  $('morebtn').textContent='Show more ('+(list.length-Math.min(shown,list.length))+' remaining)';
}
function refreshRow(id){
  var on=has(id);
  [].forEach.call(document.querySelectorAll('tr[data-id]'),function(tr){
    if(tr.getAttribute('data-id')!==id)return;
    tr.classList.toggle('wl-on',on);
    var h=tr.querySelector('.hrt-b');if(h)h.outerHTML=heart(id,on);
    var p=tr.querySelector('.price-pill');if(p)p.outerHTML=pill(id,on);
  });
  lbSync();
}
function changed(id){save();if(id)refreshRow(id);else render();if(!SH&&cur()===WLV)filter();drawer()}
function updateCount(){$('wlcount').textContent=WL.length;var n=$('navwl');if(n)n.textContent=WL.length+' items';$('wlbtn').classList.toggle('has',WL.length>0)}

/* ---------- toast ---------- */
var tt;function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.hidden=true},250)},2200)}

/* ---------- drawer ---------- */
function openWl(){drawer();$('wl').hidden=false;$('wlov').hidden=false;document.body.classList.add('wl-lock');setTimeout(function(){$('wl').classList.add('open')},10);$('wlclose').focus()}
function closeWl(){$('wl').classList.remove('open');$('wlov').hidden=true;document.body.classList.remove('wl-lock');setTimeout(function(){$('wl').hidden=true},200)}
function drawer(){
  $('wlh').textContent='My wishlist ('+WL.length+')';
  $('wlempty').hidden=WL.length>0;
  $('wllist').innerHTML=WL.map(function(x,k){var it=BY[x.id],col=C[it.c];
    return '<div class="wl-it" data-id="'+esc(x.id)+'">'+
     (it.p[0]?'<img src="'+it.p[0]+'" alt="'+esc(it.i)+'">':'<div class="wl-noph">No photo</div>')+
     '<div class="wl-m"><div class="wl-t">'+(k+1)+'. '+esc(it.i)+'</div><div class="wl-s">'+esc(oneLine(it.s))+'</div><div class="wl-c">'+esc(col.name)+' · '+esc(col.type)+'</div>'+
     '<label class="wl-q">Qty <input data-q="'+esc(x.id)+'" value="'+esc(x.q)+'" placeholder="e.g. 20 cartons / 500 sets" maxlength="40"></label></div>'+
     '<button type="button" class="wl-rm" data-rm="'+esc(x.id)+'" aria-label="Remove '+esc(it.i)+'">&times;</button></div>';
  }).join('');
  ['wlsend','wlcopy','wlcsv','wlshare','wlclear'].forEach(function(b){$(b).disabled=!WL.length});
}

/* ---------- export text ---------- */
function lines(){return WL.map(function(x,k){var it=BY[x.id];return (k+1)+'. '+it.i+' | '+oneLine(it.s)+' | '+C[it.c].name+' | Qty: '+(x.q||'-')+' | Price: ____'})}
function contactLines(c){return ['Name: '+c.name,'Company: '+(c.co||'-'),'Email: '+c.email,'Phone: '+(c.phone||'-'),'Notes: '+(c.notes||'-')]}
function listText(){var c=contact();return ['Price inquiry from the UnikPackaging wholesale catalog','',].concat(contactLines(c),['','Items ('+WL.length+'):'],lines(),['','Wishlist link: '+shareUrl()]).join('\n')}
function mailto(){
  var c=contact(),who=c.co||c.name,n=WL.length;
  var subj='Price inquiry – '+who+' – '+n+' item'+(n==1?'':'s');
  var head=['Price inquiry from the UnikPackaging wholesale catalog',''].concat(contactLines(c),['']);
  var link=shareUrl();
  function url(b){return 'mailto:'+MAIL+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(b.join('\n'))}
  var full=head.concat(['Items ('+n+'):'],lines(),['','Wishlist link: '+link]),u=url(full),short=false;
  if(u.length>1800){short=true;
    u=url(head.concat(['Items ('+n+'): the full list is too long for this email and was copied to your clipboard.','Please paste it here (Ctrl+V / Cmd+V) or attach the CSV from the catalog.','','Wishlist link: '+link]));
    if(u.length>1800)u=url(head.concat(['Items ('+n+'): the full list is too long for this email and was copied to your clipboard.','Please paste it here (Ctrl+V / Cmd+V) or attach the CSV downloaded from the catalog (Download CSV).']));
  }
  return {url:u,short:short,subject:subj,body:full.join('\n')};
}
function copy(text){
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text).catch(function(){return fallbackCopy(text)});
  return Promise.resolve(fallbackCopy(text));
}
function fallbackCopy(text){var t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(t);return ok}
function csvCell(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function csv(){var c=contact(),r=[['#','Item No.','Size','Collection','Collection type','Qty requested','Carton size','Qty / carton','CBM / carton','Price']];
  WL.forEach(function(x,k){var it=BY[x.id],col=C[it.c];r.push([k+1,it.i,oneLine(it.s),col.name,col.type,x.q,it.k,it.q,it.v,''])});
  r.push([]);r.push(['Name',c.name]);r.push(['Company',c.co]);r.push(['Email',c.email]);r.push(['Phone',c.phone]);r.push(['Notes',c.notes]);r.push(['Wishlist link',shareUrl()]);
  return '\ufeff'+r.map(function(a){return a.map(csvCell).join(',')}).join('\r\n')}
function validate(){
  var c=contact(),e=[];
  if(!c.name)e.push('your name');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))e.push('a valid email');
  var box=$('wlerr');$('f_name').classList.toggle('bad',!c.name);$('f_email').classList.toggle('bad',e.indexOf('a valid email')>-1);
  if(e.length){box.textContent='Please enter '+e.join(' and ')+' so we can reply with prices.';box.hidden=false;(c.name?$('f_email'):$('f_name')).focus();return false}
  box.hidden=true;return true;
}
window.UPK_WL={get:function(){return WL.slice()},mailto:mailto,shareUrl:shareUrl,listText:listText};

/* ---------- events ---------- */
navHtml();updateCount();
var ct=loadContact();FIELDS.forEach(function(f){if(ct[f])$('f_'+f).value=ct[f];$('f_'+f).addEventListener('input',function(){saveContact();this.classList.remove('bad')})});
window.addEventListener('hashchange',filter);
sel.addEventListener('change',function(){if(SH)exitShared();location.hash=sel.value||'';if(!sel.value)filter()});
nav.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();var c=a.getAttribute('data-c');if(SH){exitShared();if(c===cur())filter()}if(c)location.hash=c;else{history.replaceState(null,'',location.pathname+location.search);filter()}window.scrollTo(0,0)});
var t;$('q').addEventListener('input',function(){clearTimeout(t);t=setTimeout(filter,120)});
$('morebtn').addEventListener('click',function(){shown+=PAGE;render()});
window.addEventListener('scroll',function(){if(shown<list.length&&innerHeight+scrollY>document.body.offsetHeight-600){shown+=PAGE;render()}});
$('print').addEventListener('click',function(){shown=list.length;render();setTimeout(function(){window.print()},300)});
var lbId=null;
function lbSync(){var b=$('lbwl');if(!lbId){b.hidden=true;return}b.hidden=false;var on=has(lbId);b.classList.toggle('on',on);b.innerHTML=on?'&#9829; In wishlist – remove':'&#9825; Add to wishlist'}
$('rows').addEventListener('click',function(e){
  var h=e.target.closest('[data-wl]'),p=e.target.closest('[data-pr]');
  if(h){var id=h.getAttribute('data-wl');if(has(id)){removeId(id);toast(BY[id].i+' removed from wishlist')}else{add(id);toast('Added to wishlist – we\'ll quote this item')}changed(id);return}
  if(p){var id2=p.getAttribute('data-pr');if(has(id2)){openWl()}else{add(id2);changed(id2);toast('Added to wishlist – we\'ll quote this item')}return}
  if(e.target.tagName==='IMG'){$('lbimg').src=e.target.src;$('lbcap').textContent=e.target.getAttribute('data-cap');lbId=e.target.getAttribute('data-id');lbSync();$('lb').hidden=false}
});
$('lbwl').addEventListener('click',function(e){e.stopPropagation();if(!lbId)return;if(has(lbId)){removeId(lbId);toast(BY[lbId].i+' removed from wishlist')}else{add(lbId);toast('Added to wishlist – we\'ll quote this item')}changed(lbId)});
$('lb').addEventListener('click',function(){$('lb').hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){$('lb').hidden=true;if(!$('wl').hidden)closeWl()}});
$('wlbtn').addEventListener('click',openWl);$('wlclose').addEventListener('click',closeWl);$('wlov').addEventListener('click',closeWl);
$('wllist').addEventListener('click',function(e){var r=e.target.closest('[data-rm]');if(r){var id=r.getAttribute('data-rm');removeId(id);changed(id)}});
$('wllist').addEventListener('input',function(e){var id=e.target.getAttribute('data-q');if(!id)return;var k=idx(id);if(k>-1){WL[k].q=e.target.value.trim();save()}});
$('wlview').addEventListener('click',function(){closeWl();if(SH)exitShared();location.hash=WLV;filter();window.scrollTo(0,0)});
$('wlform').addEventListener('submit',function(e){e.preventDefault();if(!WL.length||!validate())return;var m=mailto();
  copy(listText()).then(function(){toast(m.short?'Long list copied – paste it into the email':'Opening your email app…')});
  window.UPK_LAST_MAILTO=m.url;try{console.log('UPK mailto length '+m.url.length)}catch(_){}
  setTimeout(function(){location.href=m.url},150)});
$('wlcopy').addEventListener('click',function(){copy(listText()).then(function(){toast('Wishlist copied to clipboard')})});
$('wlshare').addEventListener('click',function(){copy(shareUrl()).then(function(){toast('Share link copied')})});
$('wlcsv').addEventListener('click',function(){var b=new Blob([csv()],{type:'text/csv;charset=utf-8'}),a=document.createElement('a'),c=contact();a.href=URL.createObjectURL(b);a.download='UnikPackaging_wishlist'+((c.co||c.name)?'_'+(c.co||c.name).replace(/[^\w-]+/g,'_'):'')+'.csv';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)});
$('wlclear').addEventListener('click',function(){if(!WL.length||!confirm('Remove all '+WL.length+' items from your wishlist?'))return;WL=[];changed(null);toast('Wishlist cleared')});
function exitShared(){SH=null;var u=new URLSearchParams(location.search);u.delete('wl');var s=u.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+location.hash)}
$('shexit').addEventListener('click',function(){exitShared();filter();render()});
$('shimport').addEventListener('click',function(){if(!SH)return;var n=0;SH.it.forEach(function(x){if(add(x.id,x.q))n++});
  if(SH.n&&!$('f_name').value)$('f_name').value=SH.n;if(SH.co&&!$('f_co').value)$('f_co').value=SH.co;saveContact();
  save();exitShared();location.hash=WLV;filter();toast(n+' item'+(n==1?'':'s')+' imported to your wishlist')});
var qp=new URLSearchParams(location.search).get('q');if(qp)$('q').value=qp;
filter();drawer();
})();
