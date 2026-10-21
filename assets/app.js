(function(){
var D=window.CATALOG,C={},PAGE=150,shown=PAGE,list=[];
D.collections.forEach(function(c){C[c.id]=c});
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s||'').replace(/[&<>"]/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
var nav=$('colnav'),sel=$('colsel');
function navHtml(){
  var h='<a href="#" data-c="">All collections<small>'+D.items.length+' items</small></a>';
  var o='<option value="">All collections ('+D.items.length+')</option>';
  D.collections.forEach(function(c){
    h+='<a href="#'+c.id+'" data-c="'+c.id+'">'+esc(c.name)+'<small>'+esc(c.type)+' · '+c.count+' items</small></a>';
    o+='<option value="'+c.id+'">'+esc(c.name)+' — '+esc(c.type)+' ('+c.count+')</option>';
  });
  nav.innerHTML=h; sel.innerHTML=o;
}
function cur(){return location.hash.replace('#','')}
function norm(s){return String(s||'').toLowerCase().replace(/[\s×x*.:]+/g,'')}
function filter(){
  var c=cur(),q=$('q').value.trim(),nq=norm(q);
  list=D.items.filter(function(it){
    if(c&&it.c!==c)return false;
    if(!q)return true;
    return norm(it.i).indexOf(nq)>-1||norm(it.s).indexOf(nq)>-1||norm(it.n).indexOf(nq)>-1;
  });
  shown=PAGE; render();
  var col=C[c];
  $('title').textContent=col?col.name+' · '+col.type:'All collections';
  $('sub').textContent=(col?(col.range?'Items '+col.range+' · ':''):D.collections.length+' collections · ')+list.length+' item'+(list.length==1?'':'s')+(q?' matching “'+q+'”':'');
  sel.value=c; [].forEach.call(nav.querySelectorAll('a'),function(a){a.classList.toggle('on',a.getAttribute('data-c')===c)});
}
function row(it,n){
  var ph=it.p.length?it.p.map(function(p,k){return '<img loading="lazy" src="'+p+'" alt="'+esc(it.i)+(k?' view '+(k+1):'')+'" data-cap="'+esc(it.i)+'">'}).join(''):'<span class="muted">Photo on request</span>';
  var col=C[it.c];
  return '<tr><td class="c-n">'+n+'</td><td><div class="ph">'+ph+'</div></td>'+
   '<td><div class="item">'+esc(it.i)+'</div><span class="tag">'+esc(col.name)+'</span></td>'+
   '<td><div class="size">'+esc(it.s)+'</div>'+(it.n?'<span class="note">'+esc(it.n)+'</span>':'')+'</td>'+
   '<td>'+esc(it.k)+'</td><td class="r">'+esc(it.q)+'</td><td class="r">'+esc(it.v)+'</td>'+
   '<td class="r"><span class="price">By request</span></td></tr>';
}
function render(){
  var h=[];for(var i=0;i<Math.min(shown,list.length);i++)h.push(row(list[i],i+1));
  $('rows').innerHTML=h.join('');
  $('empty').hidden=list.length>0; $('more').hidden=shown>=list.length;
  $('morebtn').textContent='Show more ('+(list.length-Math.min(shown,list.length))+' remaining)';
}
navHtml();
window.addEventListener('hashchange',filter);
sel.addEventListener('change',function(){location.hash=sel.value||'';if(!sel.value)filter()});
nav.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();var c=a.getAttribute('data-c');if(c)location.hash=c;else{history.replaceState(null,'',location.pathname+location.search);filter()}window.scrollTo(0,0)});
var t;$('q').addEventListener('input',function(){clearTimeout(t);t=setTimeout(filter,120)});
$('morebtn').addEventListener('click',function(){shown+=PAGE;render()});
window.addEventListener('scroll',function(){if(shown<list.length&&innerHeight+scrollY>document.body.offsetHeight-600){shown+=PAGE;render()}});
$('print').addEventListener('click',function(){shown=list.length;render();setTimeout(function(){window.print()},300)});
$('rows').addEventListener('click',function(e){if(e.target.tagName==='IMG'){$('lbimg').src=e.target.src;$('lbcap').textContent=e.target.getAttribute('data-cap');$('lb').hidden=false}});
$('lb').addEventListener('click',function(){$('lb').hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape')$('lb').hidden=true});
var qp=new URLSearchParams(location.search).get('q');if(qp)$('q').value=qp;
filter();
})();
