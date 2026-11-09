/* Amanda’s Workspace — scripts */

(function(){
  /* ===== Áreas ===== */
  var AREAS={
    "mercado-livre":"Mercado Livre",
    "shopee":"Shopee",
    "ferramentas":"Ferramentas",
    "pessoal":"Pessoal"
  };
  var PADRAO="mercado-livre";
  var botoes=document.querySelectorAll("nav button");

  function mostrar(id){
    if(!AREAS[id]) id=PADRAO;
    document.getElementById("titulo").textContent=AREAS[id];
    Object.keys(AREAS).forEach(function(k){
      document.getElementById("area-"+k).hidden=(k!==id);
    });
    botoes.forEach(function(b){
      if(b.dataset.area===id) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
    });
  }
  function anima(){
    Object.keys(AREAS).forEach(function(k){
      var el=document.getElementById("area-"+k); if(!el||el.hidden) return;
      el.classList.remove("surgir"); void el.offsetWidth; el.classList.add("surgir");
    });
    var m=document.getElementById("conteudo"); if(m && location.hash) m.focus({preventScroll:true});
  }
  botoes.forEach(function(b){
    b.addEventListener("click",function(){ location.hash=b.dataset.area; });
  });
  window.addEventListener("hashchange",function(){ mostrar(location.hash.slice(1)); anima(); });
  mostrar(location.hash.slice(1));

  /* ===== Tema claro/escuro ===== */
  var raiz=document.documentElement;
  try{ var salvo=localStorage.getItem("tema-amanda"); if(salvo) raiz.setAttribute("data-theme",salvo); }catch(e){}
  var bt=document.getElementById("tema");
  function ehEscuro(){ return raiz.getAttribute("data-theme")==="dark"||(!raiz.getAttribute("data-theme")&&matchMedia("(prefers-color-scheme: dark)").matches); }
  function sincronizar(){ bt.setAttribute("aria-pressed",ehEscuro()?"true":"false"); }
  sincronizar();
  bt.addEventListener("click",function(){
    var novo=ehEscuro()?"light":"dark";
    raiz.setAttribute("data-theme",novo);
    try{ localStorage.setItem("tema-amanda",novo); }catch(e){}
    sincronizar();
  });

  /* ===== Saudação com data ===== */
  var topo=document.querySelector(".topo > div");
  if(topo){
    var p=document.createElement("p"); p.className="saudacao";
    var atualiza=function(){
      var d=new Date(), h=d.getHours();
      var oi=h<12?"Bom dia":h<18?"Boa tarde":"Boa noite";
      var dt=d.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});
      p.textContent=oi+", Amanda · "+dt;
    };
    atualiza(); setInterval(atualiza,60000);
    topo.insertBefore(p,topo.firstChild);
  }
  /* ===== Anotações e metas (salvas no navegador) ===== */
  function ler(k){ try{ return JSON.parse(localStorage.getItem(k)||"null"); }catch(e){ return null; } }
  function gravar(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
  document.querySelectorAll("textarea[data-key]").forEach(function(t){
    var v=ler(t.dataset.key); if(typeof v==="string") t.value=v;
    t.addEventListener("input",function(){ gravar(t.dataset.key,t.value); });
  });
  document.querySelectorAll("ul.todo[data-key]").forEach(function(ul){
    var k=ul.dataset.key, itens=[].slice.call(ul.querySelectorAll("li")), dados=ler(k)||[];
    var grupo=ul.closest(".grupo"), cont=grupo&&grupo.querySelector(".cont"), lim=grupo&&grupo.querySelector(".limpar");
    function contar(){ if(cont) cont.textContent=itens.filter(function(li){ return li.querySelector("input[type=checkbox]").checked; }).length+"/"+itens.length; }
    function salvar(){ contar(); gravar(k,itens.map(function(li){ return {t:li.querySelector(".meta-txt").value,f:li.querySelector("input[type=checkbox]").checked}; })); }
    itens.forEach(function(li,i){
      var cb=li.querySelector("input[type=checkbox]"), tx=li.querySelector(".meta-txt");
      if(dados[i]){ tx.value=dados[i].t||""; cb.checked=!!dados[i].f; }
      li.classList.toggle("feito",cb.checked);
      cb.addEventListener("change",function(){ li.classList.toggle("feito",cb.checked); salvar(); });
      tx.addEventListener("input",salvar);
    });
    contar();
    if(lim) lim.addEventListener("click",function(){
      itens.forEach(function(li){ var cb=li.querySelector("input[type=checkbox]"); if(lim.dataset.apaga&&cb.checked) li.querySelector(".meta-txt").value=""; cb.checked=false; li.classList.remove("feito"); });
      salvar();
    });
  });
})();

/* ===== Informações: logins salvos no navegador ===== */
(function(){
  var box=document.getElementById("info"); if(!box) return;
  var K="info-logins", lista=box.querySelector(".info-lista"), form=box.querySelector(".info-form"), add=box.querySelector(".info-add");
  var olho='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
  var risco='<path d="M4 4l16 16"/>';
  var x='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function ler(){ try{ return JSON.parse(localStorage.getItem(K)||"[]"); }catch(e){ return []; } }
  function gravar(d){ try{ localStorage.setItem(K,JSON.stringify(d)); }catch(e){} }
  try{ if(localStorage.getItem("info-fechado")==="1") box.classList.add("fechado"); }catch(e){}
  box.querySelector(".info-cab").addEventListener("click",function(){
    var f=box.classList.toggle("fechado"); this.setAttribute("aria-expanded",f?"false":"true");
    try{ localStorage.setItem("info-fechado",f?"1":"0"); }catch(e){}
  });
  function copiar(t,el){ if(navigator.clipboard) navigator.clipboard.writeText(t); var o=el.textContent; el.textContent="Copiado!"; setTimeout(function(){ el.textContent=o; },900); }
  function render(){
    var d=ler(); lista.innerHTML="";
    if(!d.length){ lista.innerHTML='<p class="info-vazio">Nenhum login salvo ainda.</p>'; return; }
    var grupos={}, ordem=[];
    d.forEach(function(it,i){ var n=it.nome.trim(); if(!grupos[n]){ grupos[n]=[]; ordem.push(n); } grupos[n].push(i); });
    ordem.forEach(function(n){
      var g=document.createElement("div"); g.className="info-grupo";
      var nm=document.createElement("div"); nm.className="info-nome"; nm.textContent=n; g.appendChild(nm);
      var its=document.createElement("div"); its.className="info-itens";
      grupos[n].forEach(function(i){
        var it=d[i], row=document.createElement("div"); row.className="info-item"; var vis=false;
        var lg=document.createElement("span"); lg.className="info-login"; lg.textContent=it.login; lg.title="Clique para copiar";
        var sn=document.createElement("span"); sn.className="info-senha"; sn.title="Clique para copiar";
        var bo=document.createElement("button"); bo.type="button";
        function pinta(){ sn.textContent=vis?it.senha:"••••••••"; bo.innerHTML=olho+(vis?"":risco)+"</svg>"; bo.setAttribute("aria-label",vis?"Ocultar senha":"Mostrar senha"); }
        pinta();
        bo.addEventListener("click",function(){ vis=!vis; pinta(); });
        lg.addEventListener("click",function(){ copiar(it.login,lg); });
        sn.addEventListener("click",function(){ copiar(it.senha,sn); setTimeout(pinta,950); });
        var bx=document.createElement("button"); bx.type="button"; bx.className="info-x"; bx.innerHTML=x; bx.setAttribute("aria-label","Remover");
        bx.addEventListener("click",function(){ if(confirm("Remover este login?")){ var a=ler(); a.splice(i,1); gravar(a); render(); } });
        row.append(lg,sn,bo,bx); its.appendChild(row);
      });
      g.appendChild(its); lista.appendChild(g);
    });
  }
  add.addEventListener("click",function(){ form.hidden=false; add.hidden=true; form.nome.focus(); });
  form.querySelector(".info-cancelar").addEventListener("click",function(){ form.reset(); form.hidden=true; add.hidden=false; });
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var a=ler(); a.push({nome:form.nome.value.trim().slice(0,60),login:form.login.value.trim().slice(0,200),senha:form.senha.value.slice(0,200)});
    gravar(a); form.reset(); form.hidden=true; add.hidden=false; render();
  });
  render();
})();

/* ===== Desempenho de Vendas (faturamento diário salvo no navegador) ===== */
(function(){
  var DIAS=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  function brl(v){ return "R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  // aceita "10.000", "10000", "1.234,56", "10k", "1,5k", "2 mil"; nunca devolve negativo
  function num(s){
    s=String(s||"").trim().toLowerCase();
    var mult=/(k|mil)\s*$/.test(s)?1000:1;
    s=s.replace(/[^\d,.]/g,"");
    if(s.indexOf(",")>-1){ s=s.replace(/\./g,"").replace(",","."); }
    else if(/^\d{1,3}(\.\d{3})+$/.test(s)){ s=s.replace(/\./g,""); }
    var n=parseFloat(s)*mult; return isNaN(n)||n<0?0:Math.round(n*100)/100;
  }
  function fmtInt(v){ return v?v.toLocaleString("pt-BR",{maximumFractionDigits:2}):""; } // campos de digitação
  function iso(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function add(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; }
  function seg(d){ var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); return add(x,-((x.getDay()+6)%7)); }
  function ler(k,p){ try{ return JSON.parse(localStorage.getItem(k)||"null")||p; }catch(e){ return p; } }
  function gravar(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
  var PISO_SEMANA=5000, PISO_MES=20000; // menor topo do eixo quando não há dados (ajuste se a escala mudar)
  function abrev(v){
    if(v>=1e6) return (Math.round(v/1e5)/10).toString().replace(".",",")+"M";
    if(v>=1000) return (Math.round(v/100)/10).toString().replace(".",",")+"k";
    return String(Math.round(v));
  }

  document.querySelectorAll(".vendas").forEach(function(box){
    var P=box.dataset.plat, KD="vendas-"+P+"-dias", KM="vendas-"+P+"-metas";
    var dias=ler(KD,{}), metas=ler(KM,{}); // metas: {"sem-2026-11-09":10000, "mes-2026-11":40000}
    if(metas.semPadrao!=null&&!Object.keys(metas).some(function(k){ return k.indexOf("sem-")===0; })) metas["sem-"+iso(seg(new Date()))]=metas.semPadrao;
    var vista="semana", ref=new Date(), ultChave=null;
    var svg=box.querySelector(".vd-svg"), cols=box.querySelector(".vd-cols"), dica=box.querySelector(".vd-dica"), legMeta=box.querySelector(".l-meta");
    function val(d){ return Math.max(0,+dias[iso(d)]||0); }
    function somaSem(ini){ var s=0; for(var i=0;i<7;i++) s+=val(add(ini,i)); return s; }
    function somaMes(y,m){ var s=0,d=new Date(y,m,1); while(d.getMonth()===m){ s+=val(d); d=add(d,1); } return s; }
    function kMes(y,m){ return "mes-"+y+"-"+String(m+1).padStart(2,"0"); }
    // A meta vale do período em que foi cadastrada em diante, até ser trocada.
    // Períodos anteriores ao cadastro não são afetados (antes, mudar a meta reescrevia todas as semanas passadas).
    function vigente(pref,chave){
      if(metas[chave]!=null) return +metas[chave]||0;
      var melhor=null;
      Object.keys(metas).forEach(function(k){ if(k.indexOf(pref)===0&&k<chave&&(melhor===null||k>melhor)) melhor=k; });
      return melhor?(+metas[melhor]||0):0;
    }
    function metaSem(ini){ return vigente("sem-","sem-"+iso(ini)); }
    function metaMes(y,m){ return vigente("mes-",kMes(y,m)); }
    function variacao(el,a,b,txt){
      if(!b){ el.innerHTML=a?"Sem lançamentos "+txt:"Sem lançamentos"; return; }
      var p=(a-b)/b*100, up=p>=0;
      el.innerHTML='<b class="'+(up?"up":"down")+'">'+(up?"↗ +":"↘ ")+p.toFixed(1).replace(".",",")+'%</b><br>vs. '+txt.replace(/^(na|no) /,"");
    }
    function status(el,v,m){
      if(!m){ el.className="vd-status sem"; el.textContent="Cadastre a meta"; return; }
      if(v>=m){ el.className="vd-status ok"; el.textContent="Meta Atingida!"; }
      else { el.className="vd-status nao"; el.textContent="Faltam "+brl(m-v); }
    }
    // items: [{v:valor, meta:meta da barra, atual:bool}] · rotulo: texto da linha de meta
    function grafico(items,rotulo,piso){
      var max=piso;
      items.forEach(function(it){ max=Math.max(max,it.v*1.1,(it.meta||0)*1.25); });
      var passo=Math.pow(10,Math.floor(Math.log10(max/5))); var st=[1,2,2.5,5,10].map(function(x){return x*passo;}).find(function(x){return max/x<=6;}); max=Math.ceil(max/st)*st;
      var W=600,H=220,L=34,top=8,ch=H-top, s="";
      function Y(v){ return top+ch-(v/max)*ch; }
      for(var y=0;y<=max+1e-9;y+=st){ var py=Y(y); s+='<line x1="'+L+'" x2="'+W+'" y1="'+py+'" y2="'+py+'" stroke="currentColor" stroke-opacity=".12"/><text x="'+(L-6)+'" y="'+(py+4)+'" text-anchor="end">'+abrev(y)+'</text>'; }
      var n=items.length, bw=(W-L)/n;
      items.forEach(function(it,i){ var h=(it.v/max)*ch, x=L+i*bw+bw*.18; s+='<rect x="'+x+'" y="'+Y(it.v)+'" width="'+(bw*.64)+'" height="'+h+'" rx="4" fill="'+(it.atual?"var(--cor)":"var(--cor-suave)")+'"><title>'+brl(it.v)+(it.meta?" · meta "+brl(it.meta):"")+'</title></rect>'; });
      var metasIg=items.every(function(it){ return Math.abs((it.meta||0)-(items[0].meta||0))<0.01; });
      if(metasIg&&items[0].meta){
        var ly=Y(items[0].meta);
        s+='<line x1="'+L+'" x2="'+W+'" y1="'+ly+'" y2="'+ly+'" stroke="#2f8a45" stroke-width="2" stroke-dasharray="8 6"/>';
        s+='<text class="vd-meta-rot" x="'+(W-2)+'" y="'+(ly-6)+'" text-anchor="end">'+rotulo+'</text>';
      } else {
        // meta diferente por barra (semanas incompletas no mês): um traço sobre cada barra
        items.forEach(function(it,i){ if(!it.meta) return; var ly=Y(it.meta); s+='<line x1="'+(L+i*bw+bw*.08)+'" x2="'+(L+i*bw+bw*.92)+'" y1="'+ly+'" y2="'+ly+'" stroke="#2f8a45" stroke-width="2" stroke-dasharray="6 4"/>'; });
        var cheio=items.reduce(function(a,it){ return Math.max(a,it.meta||0); },0);
        if(cheio) s+='<text class="vd-meta-rot" x="'+(W-2)+'" y="'+(top+10)+'" text-anchor="end">'+rotulo+'</text>';
      }
      svg.innerHTML=s;
    }
    function render(){
      var hoje=iso(new Date());
      // lado semana: semana de ref
      var ini=seg(ref), vs=somaSem(ini), ms=metaSem(ini);
      var lS=box.querySelector('[data-lado="semana"]');
      lS.querySelector(".vd-valor").textContent=brl(vs);
      variacao(lS.querySelector(".vd-var"),vs,somaSem(add(ini,-7)),"na semana anterior");
      status(lS.querySelector(".vd-status"),vs,ms);
      var inS=lS.querySelector(".vd-meta-in"); if(document.activeElement!==inS) inS.value=fmtInt(ms);
      // lado mês
      var y=ref.getFullYear(), m=ref.getMonth(), vm=somaMes(y,m), mm=metaMes(y,m);
      var lM=box.querySelector('[data-lado="mes"]');
      lM.querySelector(".vd-valor").textContent=brl(vm);
      var pm=new Date(y,m-1,1); variacao(lM.querySelector(".vd-var"),vm,somaMes(pm.getFullYear(),pm.getMonth()),"no mês anterior");
      status(lM.querySelector(".vd-status"),vm,mm);
      var inM=lM.querySelector(".vd-meta-in"); if(document.activeElement!==inM) inM.value=fmtInt(mm);
      box.querySelectorAll(".vd-tabs button").forEach(function(b){ b.setAttribute("aria-pressed",b.dataset.v===vista?"true":"false"); });
      var chave=vista==="semana"?"S"+iso(ini):"M"+y+"-"+m;
      if(vista==="semana"){
        var fim=add(ini,6), md=ms/7;
        box.querySelector(".vd-periodo").textContent=ini.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})+" – "+fim.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
        var its=[]; for(var q=0;q<7;q++){ var dd=add(ini,q); its.push({v:val(dd),meta:md,atual:iso(dd)===hoje}); }
        if(ultChave!==chave){
          cols.innerHTML="";
          for(var i=0;i<7;i++){ (function(d){
            var k=iso(d);
            var c=document.createElement("div"); c.className="vd-col";
            c.innerHTML=DIAS[d.getDay()]+"<br>"+d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
            var inp=document.createElement("input"); inp.type="text"; inp.inputMode="decimal"; inp.placeholder="0"; inp.value=fmtInt(val(d)); inp.dataset.dia=k; inp.setAttribute("aria-label","Faturamento de "+d.toLocaleDateString("pt-BR"));
            inp.addEventListener("change",function(){ var n=num(inp.value); if(n) dias[k]=n; else delete dias[k]; gravar(KD,dias); render(); });
            inp.addEventListener("blur",function(){ inp.value=fmtInt(val(d)); });
            c.appendChild(inp); cols.appendChild(c);
          })(add(ini,i)); }
          ultChave=chave;
        } else {
          cols.querySelectorAll("input").forEach(function(inp){ if(document.activeElement!==inp) inp.value=fmtInt(+dias[inp.dataset.dia]||0); });
        }
        if(legMeta) legMeta.textContent="Meta diária";
        grafico(its,"Meta/dia R$ "+abrev(md),PISO_SEMANA);
        dica.textContent=ms?"Preencha o faturamento de cada dia · meta diária = "+brl(ms)+" ÷ 7 = "+brl(md):"Preencha o faturamento de cada dia e cadastre a meta semanal";
      } else {
        cols.innerHTML=""; ultChave=null;
        box.querySelector(".vd-periodo").textContent=ref.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
        var diasMes=new Date(y,m+1,0).getDate(), porDia=mm/diasMes;
        var its2=[], w=seg(new Date(y,m,1)), n=0, hojeSeg=iso(seg(new Date()));
        while(true){
          var s=0, dn=0; for(var j=0;j<7;j++){ var d=add(w,j); if(d.getMonth()===m){ s+=val(d); dn++; } }
          n++; its2.push({v:s,meta:porDia*dn,atual:iso(w)===hojeSeg});
          var c=document.createElement("div"); c.className="vd-col";
          var a=w<new Date(y,m,1)?new Date(y,m,1):w, b=add(w,6); if(b.getMonth()!==m) b=new Date(y,m+1,0);
          c.innerHTML="Sem "+n+"<br>"+a.getDate()+"–"+b.getDate()+"<br><b>"+(s?abrev(s):"–")+"</b>";
          c.title=mm?"Meta da semana ("+dn+" dia"+(dn>1?"s":"")+" no mês): "+brl(porDia*dn):"";
          cols.appendChild(c); w=add(w,7); if(w.getMonth()!==m) break;
        }
        if(legMeta) legMeta.textContent="Meta semanal";
        grafico(its2,"Meta/semana R$ "+abrev(porDia*7),PISO_MES);
        dica.textContent=mm?"Totais por semana (lançados na aba Semana) · meta de cada semana proporcional aos dias dela no mês ("+brl(mm)+" ÷ "+diasMes+" dias)":"Totais por semana (lançados na aba Semana) · cadastre a meta mensal";
      }
    }
    var abas=box.querySelectorAll(".vd-tabs button");
    var trilho=box.querySelector(".vd-tabs");
    var pila=document.createElement("span");
    pila.className="vd-thumb"; pila.setAttribute("aria-hidden","true");
    trilho.appendChild(pila);
    trilho.classList.add("com-thumb");
    function move(){
      var ativa=box.querySelector('.vd-tabs button[aria-pressed="true"]')||abas[0];
      pila.style.top=ativa.offsetTop+"px";
      pila.style.height=ativa.offsetHeight+"px";
      pila.style.width=ativa.offsetWidth+"px";
      pila.style.transform="translateX("+ativa.offsetLeft+"px)";
    }
    function semTransicao(){
      pila.style.transition="none"; move();
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ pila.style.transition=""; }); });
    }
    semTransicao();
    if(window.ResizeObserver){ new ResizeObserver(function(){ semTransicao(); }).observe(trilho); }
    else window.addEventListener("resize",semTransicao);
    abas.forEach(function(b){ b.addEventListener("click",function(){ if(vista===b.dataset.v) return; vista=b.dataset.v; render(); move(); }); });
    box.querySelector(".vd-prev").addEventListener("click",function(){ ref=vista==="semana"?add(ref,-7):new Date(ref.getFullYear(),ref.getMonth()-1,1); render(); });
    box.querySelector(".vd-next").addEventListener("click",function(){ ref=vista==="semana"?add(ref,7):new Date(ref.getFullYear(),ref.getMonth()+1,1); render(); });
    box.querySelectorAll(".vd-meta-in").forEach(function(inp){
      inp.addEventListener("change",function(){
        var v=num(inp.value);
        if(inp.dataset.meta==="semana") metas["sem-"+iso(seg(ref))]=v;
        else metas[kMes(ref.getFullYear(),ref.getMonth())]=v;
        delete metas.semPadrao; // formato antigo: aplicava a mesma meta a todas as semanas, inclusive passadas
        gravar(KM,metas); render();
      });
      inp.addEventListener("blur",function(){ setTimeout(render,0); }); // reformata "10000" → "10.000"
    });
    render();
  });
})();

/* ===== Respostas para clientes (salvas no navegador) ===== */
(function(){
  var copia='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>';
  var xis='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var funil='<svg class="rp-funil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18l-7 8.500V19l-4 2v-7.500z"/></svg>';
  document.querySelectorAll(".resp").forEach(function(box){
    var K=box.dataset.key, filtro="Todos";
    var corpo=box.querySelector(".rp-corpo"), fil=box.querySelector(".rp-filtros"), form=box.querySelector(".rp-form"), add=box.querySelector(".rp-add");
    function ler(){ try{ return JSON.parse(localStorage.getItem(K)||"[]"); }catch(e){ return []; } }
    function gravar(d){ try{ localStorage.setItem(K,JSON.stringify(d)); }catch(e){} }
    function copiar(t,el){ if(navigator.clipboard) navigator.clipboard.writeText(t); el.classList.add("ok"); var o=el.innerHTML; el.textContent="✓"; setTimeout(function(){ el.innerHTML=o; },900); }
    function render(){
      var d=ler(), temas=[];
      d.forEach(function(r){ if(temas.indexOf(r.tema)<0) temas.push(r.tema); });
      if(filtro!=="Todos"&&temas.indexOf(filtro)<0) filtro="Todos";
      box.querySelector(".rp-cont").textContent=d.length;
      fil.innerHTML=funil; fil.hidden=!d.length; // funil fica sozinho, antes dos botões de filtro
      ["Todos"].concat(temas).forEach(function(t){
        var b=document.createElement("button"); b.type="button"; b.setAttribute("aria-pressed",t===filtro?"true":"false");
        b.textContent=t;
        b.addEventListener("click",function(){ filtro=t; render(); }); fil.appendChild(b);
      });
      corpo.innerHTML="";
      var vis=d.map(function(r,i){ return [r,i]; }).filter(function(p){ return filtro==="Todos"||p[0].tema===filtro; });
      if(!vis.length){ corpo.innerHTML='<p class="rp-vazio">Nenhuma resposta salva ainda.</p>'; return; }
      vis.forEach(function(p){
        var r=p[0], i=p[1], l=document.createElement("div"); l.className="rp-linha";
        var tg=document.createElement("span"); tg.className="rp-tag"; tg.textContent=r.tema;
        var tx=document.createElement("span"); tx.className="rp-txt"; tx.textContent=r.texto; tx.title="Clique para copiar";
        var bs=document.createElement("span"); bs.className="rp-btns";
        var bc=document.createElement("button"); bc.type="button"; bc.innerHTML=copia; bc.setAttribute("aria-label","Copiar resposta");
        var bx=document.createElement("button"); bx.type="button"; bx.innerHTML=xis; bx.setAttribute("aria-label","Remover resposta");
        bc.addEventListener("click",function(){ copiar(r.texto,bc); });
        tx.addEventListener("click",function(){ copiar(r.texto,bc); });
        bx.addEventListener("click",function(){ if(confirm("Remover esta resposta?")){ var a=ler(); a.splice(i,1); gravar(a); render(); } });
        bs.append(bc,bx); l.append(tg,tx,bs); corpo.appendChild(l);
      });
    }
    add.addEventListener("click",function(){ form.hidden=false; add.hidden=true; form.tema.focus(); });
    form.querySelector(".rp-cancelar").addEventListener("click",function(){ form.reset(); form.hidden=true; add.hidden=false; });
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var a=ler(); a.push({tema:form.tema.value.trim().slice(0,30)||"Geral",texto:form.texto.value.trim().slice(0,2000)});
      gravar(a); form.reset(); form.hidden=true; add.hidden=false; render();
    });
    render();
  });
})();


/* ===== Pessoal: gastos por cartão (salvos no navegador) ===== */
(function(){
  var box=document.querySelector(".gastos"); if(!box) return;
  var K="gastos-cartao", filtro="Todos", ref=new Date(); ref=new Date(ref.getFullYear(),ref.getMonth(),1);
  var xis='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var corpo=box.querySelector(".gs-corpo"), res=box.querySelector(".gs-resumo"), fil=box.querySelector(".gs-filtros"), form=box.querySelector(".gs-form"), add=box.querySelector(".rp-add"), dl=box.querySelector("datalist");
  function ler(){ try{ return JSON.parse(localStorage.getItem(K)||"[]"); }catch(e){ return []; } }
  function gravar(d){ try{ localStorage.setItem(K,JSON.stringify(d)); }catch(e){} }
  function brl(v){ return "R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function num(s){ s=String(s||"").replace(/[^\d,.-]/g,""); if(s.indexOf(",")>-1){ s=s.replace(/\./g,"").replace(",","."); } else if(/^\d{1,3}(\.\d{3})+$/.test(s)){ s=s.replace(/\./g,""); } var n=parseFloat(s); return isNaN(n)?0:Math.round(n*100)/100; }
  function iso(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function mesDe(s){ return s.slice(0,7); }

  /* seletor de data próprio (o calendário nativo do navegador não aceita estilo) */
  var ICO_CAL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.500" y="5" width="17" height="15.500" rx="3"/><path d="M3.500 10h17M8 3v4M16 3v4"/></svg>';
  var MESES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  function dataBR(s){ return /^\d{4}-\d{2}-\d{2}$/.test(s)?s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4):""; }
  function seletorData(input){
    var val="", vis=new Date(), foco="", hojeK=iso(new Date());
    vis=new Date(vis.getFullYear(),vis.getMonth(),1);
    function mk(t,c,x){ var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e; }
    var wrap=mk("div","dp"), btn=mk("button","dp-btn"), pop=mk("div","dp-pop");
    btn.type="button"; btn.setAttribute("aria-haspopup","dialog"); btn.setAttribute("aria-expanded","false");
    btn.innerHTML=ICO_CAL+'<span class="dp-txt"></span>';
    pop.setAttribute("role","dialog"); pop.setAttribute("aria-label","Escolher data"); pop.hidden=true;
    wrap.appendChild(btn); wrap.appendChild(pop); input.parentNode.insertBefore(wrap,input);
    function rotulo(){ var t=btn.querySelector(".dp-txt"); t.textContent=val?dataBR(val):"Data"; btn.classList.toggle("vazio",!val); btn.setAttribute("aria-label","Data: "+(val?dataBR(val):"escolher")); }
    function desenha(){
      pop.innerHTML="";
      var cab=mk("div","dp-cab"), pv=mk("button","dp-nav","‹"), nx=mk("button","dp-nav","›"), tt=mk("span","dp-mes",MESES[vis.getMonth()]+" "+vis.getFullYear());
      pv.type=nx.type="button"; pv.setAttribute("aria-label","Mês anterior"); nx.setAttribute("aria-label","Próximo mês");
      pv.addEventListener("click",function(){ vis=new Date(vis.getFullYear(),vis.getMonth()-1,1); desenha(); });
      nx.addEventListener("click",function(){ vis=new Date(vis.getFullYear(),vis.getMonth()+1,1); desenha(); });
      cab.appendChild(pv); cab.appendChild(tt); cab.appendChild(nx); pop.appendChild(cab);
      var sem=mk("div","dp-sem"); ["D","S","T","Q","Q","S","S"].forEach(function(l){ sem.appendChild(mk("span",null,l)); }); pop.appendChild(sem);
      var g=mk("div","dp-grade"), y=vis.getFullYear(), m=vis.getMonth(), pri=new Date(y,m,1).getDay(), tot=new Date(y,m+1,0).getDate();
      var pref=y+"-"+String(m+1).padStart(2,"0"), f=(foco&&foco.slice(0,7)===pref)?foco:(val&&val.slice(0,7)===pref?val:(hojeK.slice(0,7)===pref?hojeK:pref+"-01"));
      for(var i=0;i<pri;i++) g.appendChild(mk("span","dp-vz"));
      for(var d=1;d<=tot;d++){
        var k=pref+"-"+String(d).padStart(2,"0"), b=mk("button","dp-d"+(k===hojeK?" hoje":"")+(k===val?" sel":""),d);
        b.type="button"; b.dataset.k=k; b.tabIndex=(k===f?0:-1); b.setAttribute("aria-pressed",k===val?"true":"false");
        b.setAttribute("aria-label",d+" de "+MESES[m]+" de "+y); g.appendChild(b);
      }
      g.addEventListener("click",function(e){ var b=e.target.closest(".dp-d"); if(!b) return; set(b.dataset.k); fecha(true); });
      g.addEventListener("keydown",function(e){
        var b=e.target.closest(".dp-d"); if(!b) return;
        var dl={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key]; if(!dl) return; e.preventDefault();
        var p=b.dataset.k.split("-").map(Number), x=new Date(p[0],p[1]-1,p[2]+dl);
        foco=iso(x); vis=new Date(x.getFullYear(),x.getMonth(),1); desenha();
        var n=pop.querySelector('[data-k="'+foco+'"]'); if(n) n.focus();
      });
      pop.appendChild(g);
      var rod=mk("div","dp-rod"), hj=mk("button","dp-hoje","Hoje"); hj.type="button";
      hj.addEventListener("click",function(){ set(iso(new Date())); fecha(true); });
      rod.appendChild(hj); pop.appendChild(rod);
    }
    function abre(){
      var base=val?val.split("-").map(Number):null, t=new Date();
      vis=base?new Date(base[0],base[1]-1,1):new Date(t.getFullYear(),t.getMonth(),1); foco=val; hojeK=iso(new Date());
      desenha(); pop.classList.remove("dp-dir","dp-cima"); pop.hidden=false; btn.setAttribute("aria-expanded","true");
      var r=pop.getBoundingClientRect(), rb=btn.getBoundingClientRect();
      if(r.right>window.innerWidth-8) pop.classList.add("dp-dir");
      if(r.bottom>window.innerHeight-8 && rb.top>r.height+16) pop.classList.add("dp-cima");
      var alvo=pop.querySelector('.dp-d[tabindex="0"]'); if(alvo) alvo.focus({preventScroll:true});
    }
    function fecha(volta){ if(pop.hidden) return; pop.hidden=true; btn.setAttribute("aria-expanded","false"); if(volta) btn.focus(); }
    function set(v){ val=v||""; input.value=val; rotulo(); }
    btn.addEventListener("click",function(){ if(pop.hidden) abre(); else fecha(); });
    document.addEventListener("click",function(e){ if(!wrap.contains(e.target)) fecha(); });
    wrap.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!pop.hidden){ e.stopPropagation(); fecha(true); } });
    rotulo();
    return {set:set,fecha:fecha};
  }
  var dp=seletorData(form.data);
  function render(){
    var d=ler(), mk=iso(ref).slice(0,7);
    box.querySelector(".gs-periodo").textContent=ref.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
    var todos=[]; d.forEach(function(g){ if(todos.indexOf(g.cartao)<0) todos.push(g.cartao); });
    dl.innerHTML=""; todos.forEach(function(c){ var o=document.createElement("option"); o.value=c; dl.appendChild(o); });
    var doMes=d.map(function(g,i){ return [g,i]; }).filter(function(p){ return mesDe(p[0].data)===mk; });
    var tot={}, ordem=[], total=0;
    doMes.forEach(function(p){ var c=p[0].cartao; if(!(c in tot)){ tot[c]=0; ordem.push(c); } tot[c]+=p[0].valor; total+=p[0].valor; });
    if(filtro!=="Todos"&&ordem.indexOf(filtro)<0) filtro="Todos";
    // resumo: total do mês + total por cartão
    res.innerHTML="";
    function tile(nome,v,cls){ var t=document.createElement("div"); t.className="gs-tile"+(cls?" "+cls:""); var a=document.createElement("span"); a.className="gs-tnome"; a.textContent=nome; var b=document.createElement("span"); b.className="gs-tval"; b.textContent=brl(v); t.append(a,b); res.appendChild(t); return t; }
    tile("Total do mês",total,"gs-total");
    ordem.sort(function(a,b){ return tot[b]-tot[a]; }).forEach(function(c){ var t=tile(c,tot[c]); var bar=document.createElement("span"); bar.className="gs-barra"; bar.style.setProperty("--p",(total?tot[c]/total*100:0).toFixed(1)+"%"); t.appendChild(bar); });
    fil.innerHTML=""; fil.hidden=ordem.length<2;
    ["Todos"].concat(ordem).forEach(function(t){ var b=document.createElement("button"); b.type="button"; b.textContent=t; b.setAttribute("aria-pressed",t===filtro?"true":"false"); b.addEventListener("click",function(){ filtro=t; render(); }); fil.appendChild(b); });
    corpo.innerHTML="";
    var vis=doMes.filter(function(p){ return filtro==="Todos"||p[0].cartao===filtro; }).sort(function(a,b){ return a[0].data<b[0].data?1:a[0].data>b[0].data?-1:b[1]-a[1]; });
    if(!vis.length){ corpo.innerHTML='<p class="rp-vazio">Nenhum gasto neste mês.</p>'; return; }
    vis.forEach(function(p){
      var g=p[0], i=p[1], l=document.createElement("div"); l.className="gs-linha";
      var dt=document.createElement("span"); dt.className="gs-data"; dt.textContent=g.data.slice(8,10)+"/"+g.data.slice(5,7);
      var tg=document.createElement("span"); tg.className="rp-tag"; tg.textContent=g.cartao;
      var ds=document.createElement("span"); ds.className="gs-desc"; ds.textContent=g.desc;
      var vl=document.createElement("span"); vl.className="gs-val"; vl.textContent=brl(g.valor);
      var bx=document.createElement("button"); bx.type="button"; bx.className="gs-x"; bx.innerHTML=xis; bx.setAttribute("aria-label","Remover gasto");
      bx.addEventListener("click",function(){ if(confirm("Remover este gasto?")){ var a=ler(); a.splice(i,1); gravar(a); render(); } });
      l.append(dt,tg,ds,vl,bx); corpo.appendChild(l);
    });
  }
  box.querySelector(".gs-prev").addEventListener("click",function(){ ref=new Date(ref.getFullYear(),ref.getMonth()-1,1); render(); });
  box.querySelector(".gs-next").addEventListener("click",function(){ ref=new Date(ref.getFullYear(),ref.getMonth()+1,1); render(); });
  function fechar(){ form.reset(); dp.set(""); dp.fecha(); form.hidden=true; add.hidden=false; }
  add.addEventListener("click",function(){
    var hoje=new Date(), mesmo=hoje.getFullYear()===ref.getFullYear()&&hoje.getMonth()===ref.getMonth();
    form.hidden=false; add.hidden=true; dp.set(iso(mesmo?hoje:ref)); form.parcelas.value=1; form.cartao.focus();
  });
  form.querySelector(".rp-cancelar").addEventListener("click",fechar);
  form.addEventListener("submit",function(e){
    e.preventDefault();
    if(!form.data.value) dp.set(iso(new Date()));
    var v=num(form.valor.value); if(!v){ form.valor.focus(); return; }
    var n=Math.max(1,Math.min(24,parseInt(form.parcelas.value,10)||1)), dt=form.data.value.split("-").map(Number);
    var cartao=form.cartao.value.trim().slice(0,24), desc=form.desc.value.trim().slice(0,80);
    var a=ler(), parc=Math.round(v/n*100)/100;
    for(var k=0;k<n;k++){
      var ult=new Date(dt[0],dt[1]-1+k+1,0).getDate(), d=new Date(dt[0],dt[1]-1+k,Math.min(dt[2],ult));
      a.push({data:iso(d),cartao:cartao,desc:n>1?desc+" ("+(k+1)+"/"+n+")":desc,valor:k===n-1?Math.round((v-parc*(n-1))*100)/100:parc});
    }
    gravar(a); ref=new Date(dt[0],dt[1]-1,1); fechar(); render();
  });
  render();
})();

/* ===== Pessoal: livros "Para ler" e "Lidos" com avaliação e datas (salvos no navegador) ===== */
(function(){
  var box=document.querySelector(".livros"); if(!box) return;
  var K="livros-pessoal";
  var xis='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var check='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.500 4.500L19 7"/></svg>';
  var volta='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>';
  var corpo=box.querySelector(".lv-corpo"), form=box.querySelector(".lv-form"), add=box.querySelector(".rp-add");
  function iso(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function dataBR(s){ return /^\d{4}-\d{2}-\d{2}$/.test(s||"")?s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4):""; }
  // formato: {titulo, autor, data (quando foi adicionado), lido, lidoEm, nota}
  // livros antigos (sem "lido"): os que já tinham estrelas viram "Lidos"
  function ler(){
    var d; try{ d=JSON.parse(localStorage.getItem(K)||"[]"); }catch(e){ d=[]; }
    d.forEach(function(lv){ if(lv.lido==null){ lv.lido=(lv.nota||0)>0; if(lv.lido&&!lv.lidoEm) lv.lidoEm=lv.data||""; } });
    return d;
  }
  function gravar(d){ try{ localStorage.setItem(K,JSON.stringify(d)); }catch(e){} }
  function mexe(i,fn){ var a=ler(); fn(a[i]); gravar(a); render(); }
  function botao(cls,svg,rot,fn){ var b=document.createElement("button"); b.type="button"; b.className=cls; b.innerHTML=svg; b.setAttribute("aria-label",rot); b.title=rot; b.addEventListener("click",fn); return b; }
  function infoLivro(lv){
    var tt=document.createElement("span"); tt.className="lv-livro";
    var t=document.createElement("b"); t.textContent=lv.titulo; tt.appendChild(t);
    if(lv.autor){ var au=document.createElement("small"); au.textContent=lv.autor; tt.appendChild(au); }
    return tt;
  }
  function remover(i){ return botao("gs-x",xis,"Remover livro",function(){ if(confirm("Remover este livro?")){ var a=ler(); a.splice(i,1); gravar(a); render(); } }); }
  function grupo(titulo,qtd,cab,cls){
    var g=document.createElement("div"); g.className="lv-grupo "+cls;
    var h=document.createElement("h3"); h.className="lv-tit"; h.innerHTML=titulo+' <span>'+qtd+'</span>'; g.appendChild(h);
    if(qtd){ var hd=document.createElement("div"); hd.className="lv-linha rp-head "+cls; cab.forEach(function(c){ var sp=document.createElement("span"); sp.textContent=c; hd.appendChild(sp); }); g.appendChild(hd); }
    corpo.appendChild(g); return g;
  }
  function render(){
    var d=ler(); box.querySelector(".lv-cont").textContent=d.length; corpo.innerHTML="";
    var paraLer=[], lidos=[];
    d.forEach(function(lv,i){ (lv.lido?lidos:paraLer).push([lv,i]); });
    // lidos: mais recente primeiro
    lidos.sort(function(a,b){ return (b[0].lidoEm||"").localeCompare(a[0].lidoEm||""); });

    var g1=grupo("Para ler",paraLer.length,["Data","Livro",""],"lv-pl");
    if(!paraLer.length) g1.insertAdjacentHTML("beforeend",'<p class="rp-vazio">Nenhum livro na fila.</p>');
    paraLer.forEach(function(p){
      var lv=p[0], i=p[1], l=document.createElement("div"); l.className="lv-linha lv-pl";
      var dt=document.createElement("span"); dt.className="lv-data"; dt.textContent=dataBR(lv.data)||"–";
      var acoes=document.createElement("span"); acoes.className="lv-acoes";
      acoes.append(botao("lv-lido",check+"<em>Lido</em>","Marcar como lido",function(){ mexe(i,function(x){ x.lido=true; x.lidoEm=iso(new Date()); }); }), remover(i));
      dt.title="Adicionado em "+(dataBR(lv.data)||"–");
      l.append(dt,infoLivro(lv),acoes); g1.appendChild(l);
    });

    var g2=grupo("Lidos",lidos.length,["Data","Livro","Avaliação",""],"lv-li");
    if(!lidos.length) g2.insertAdjacentHTML("beforeend",'<p class="rp-vazio">Nenhum livro lido ainda.</p>');
    lidos.forEach(function(p){
      var lv=p[0], i=p[1], l=document.createElement("div"); l.className="lv-linha lv-li";
      var dt=document.createElement("span"); dt.className="lv-data"; dt.textContent=dataBR(lv.lidoEm)||"–"; dt.title="Lido em "+(dataBR(lv.lidoEm)||"–"); // salva sozinha ao clicar em "Lido"
      var es=document.createElement("span"); es.className="lv-estrelas"; es.setAttribute("role","group"); es.setAttribute("aria-label","Avaliação de "+lv.titulo);
      for(var n=1;n<=5;n++){ (function(n){
        var b=document.createElement("button"); b.type="button"; b.textContent="★"; b.className=n<=(lv.nota||0)?"cheia":"";
        b.setAttribute("aria-label",n+(n>1?" estrelas":" estrela")); b.setAttribute("aria-pressed",n===(lv.nota||0)?"true":"false");
        b.addEventListener("click",function(){ mexe(i,function(x){ x.nota=(x.nota===n)?0:n; }); });
        es.appendChild(b);
      })(n); }
      var acoes=document.createElement("span"); acoes.className="lv-acoes";
      acoes.append(botao("gs-x",volta,"Voltar para Para ler",function(){ mexe(i,function(x){ x.lido=false; x.lidoEm=""; x.nota=0; }); }), remover(i));
      l.append(dt,infoLivro(lv),es,acoes); g2.appendChild(l);
    });
  }
  function fechar(){ form.reset(); form.hidden=true; add.hidden=false; }
  add.addEventListener("click",function(){ form.hidden=false; add.hidden=true; form.titulo.focus(); });
  form.querySelector(".rp-cancelar").addEventListener("click",fechar);
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var hoje=iso(new Date()), jaLi=form.status&&form.status.value==="lido";
    var a=ler(); a.unshift({titulo:form.titulo.value.trim().slice(0,100),autor:form.autor.value.trim().slice(0,80),data:hoje,lido:jaLi,lidoEm:jaLi?hoje:"",nota:0});
    gravar(a); fechar(); render();
  });
  render();
})();

/* ===== Pessoal: lista de compras com filtro por categoria (salva no navegador) ===== */
(function(){
  var box=document.querySelector(".compras"); if(!box) return;
  var K="compras-pessoal", filtro="Todas";
  var xis='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var funil='<svg class="rp-funil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18l-7 8.500V19l-4 2v-7.500z"/></svg>';
  var corpo=box.querySelector(".cp-corpo"), fil=box.querySelector(".cp-filtros"), form=box.querySelector(".cp-form"), add=box.querySelector(".rp-add"), dl=box.querySelector("datalist"), lim=box.querySelector(".cp-limpar");
  // formato: {item, qtd, cat, feito}
  function ler(){ try{ return JSON.parse(localStorage.getItem(K)||"[]"); }catch(e){ return []; } }
  function gravar(d){ try{ localStorage.setItem(K,JSON.stringify(d)); }catch(e){} }
  function render(){
    var d=ler(), cats=[];
    d.forEach(function(it){ if(cats.indexOf(it.cat)<0) cats.push(it.cat); });
    if(filtro!=="Todas"&&cats.indexOf(filtro)<0) filtro="Todas";
    box.querySelector(".cp-cont").textContent=d.filter(function(it){ return it.feito; }).length+"/"+d.length;
    dl.innerHTML=""; cats.forEach(function(c){ var o=document.createElement("option"); o.value=c; dl.appendChild(o); });
    // filtro por categoria (só aparece quando já existe alguma)
    fil.innerHTML=funil; fil.hidden=!cats.length;
    ["Todas"].concat(cats).forEach(function(t){
      var b=document.createElement("button"); b.type="button"; b.textContent=t; b.setAttribute("aria-pressed",t===filtro?"true":"false");
      b.addEventListener("click",function(){ filtro=t; render(); }); fil.appendChild(b);
    });
    var vis=d.map(function(it,i){ return [it,i]; }).filter(function(p){ return filtro==="Todas"||p[0].cat===filtro; });
    // a comprar primeiro, comprados no fim (ordem de inclusão preservada)
    vis=vis.filter(function(p){ return !p[0].feito; }).concat(vis.filter(function(p){ return p[0].feito; }));
    lim.hidden=!vis.some(function(p){ return p[0].feito; });
    corpo.innerHTML="";
    if(!vis.length){ corpo.innerHTML='<p class="rp-vazio">'+(d.length?"Nenhum item nesta categoria.":"Sua lista está vazia.")+'</p>'; return; }
    var hd=document.createElement("div"); hd.className="cp-linha rp-head";
    ["","Item","Categoria",""].forEach(function(c){ var sp=document.createElement("span"); sp.textContent=c; hd.appendChild(sp); });
    corpo.appendChild(hd);
    vis.forEach(function(p){
      var it=p[0], i=p[1], l=document.createElement("div"); l.className="cp-linha"+(it.feito?" feito":"");
      var cb=document.createElement("input"); cb.type="checkbox"; cb.className="cp-chk"; cb.checked=!!it.feito; cb.setAttribute("aria-label",(it.feito?"Desmarcar ":"Marcar como comprado: ")+it.item);
      cb.addEventListener("change",function(){ var a=ler(); if(a[i]){ a[i].feito=cb.checked; gravar(a); } render(); });
      var nm=document.createElement("span"); nm.className="cp-item";
      var b=document.createElement("b"); b.textContent=it.item; nm.appendChild(b);
      if(it.qtd){ var q=document.createElement("small"); q.textContent=it.qtd; nm.appendChild(q); }
      var tg=document.createElement("span"); tg.className="rp-tag"; tg.textContent=it.cat;
      var bx=document.createElement("button"); bx.type="button"; bx.className="gs-x"; bx.innerHTML=xis; bx.setAttribute("aria-label","Remover item");
      bx.addEventListener("click",function(){ var a=ler(); a.splice(i,1); gravar(a); render(); });
      l.append(cb,nm,tg,bx); corpo.appendChild(l);
    });
  }
  lim.addEventListener("click",function(){
    if(!confirm("Remover os itens já comprados"+(filtro==="Todas"?"":" de "+filtro)+"?")) return;
    gravar(ler().filter(function(it){ return !(it.feito&&(filtro==="Todas"||it.cat===filtro)); })); render();
  });
  function fechar(){ form.reset(); form.hidden=true; add.hidden=false; }
  add.addEventListener("click",function(){
    form.hidden=false; add.hidden=true;
    if(filtro!=="Todas") form.cat.value=filtro; // já sugere a categoria que está filtrada
    form.item.focus();
  });
  form.querySelector(".rp-cancelar").addEventListener("click",fechar);
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var nome=form.item.value.trim().slice(0,80); if(!nome){ form.item.focus(); return; }
    var cat=form.cat.value.trim().slice(0,24)||"Geral";
    // reaproveita a grafia de uma categoria já existente (ex.: "mercado" → "Mercado")
    var a=ler(); a.some(function(it){ if(it.cat.toLowerCase()===cat.toLowerCase()){ cat=it.cat; return true; } });
    a.push({item:nome,qtd:form.qtd.value.trim().slice(0,20),cat:cat,feito:false});
    gravar(a); if(filtro!=="Todas"&&filtro!==cat) filtro="Todas"; fechar(); render();
  });
  render();
})();

/* ===== Modo edição (faca): links editáveis, salvos no navegador e na nuvem (chave "links-amanda") ===== */
(function(){
  var K="links-amanda", btn=document.getElementById("faca"); if(!btn) return;
  var SEL="a.atalho,a.faixa,a.ferr";
  var ICONE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';
  function ler(){
    try{ var v=JSON.parse(localStorage.getItem(K)||"null"); if(v&&typeof v==="object") return {mod:v.mod||{},del:v.del||[],novos:v.novos||[]}; }catch(e){}
    return {mod:{},del:[],novos:[]};
  }
  var D=ler();
  function gravar(){ try{ localStorage.setItem(K,JSON.stringify(D)); }catch(e){} }
  function urlOk(s){
    s=String(s||"").trim(); if(!s) return null;
    if(!/^[a-z][a-z0-9+.-]*:/i.test(s)) s="https://"+s;
    try{ var u=new URL(s); return /^(https?:|mailto:|tel:)$/.test(u.protocol)?u.href:null; }catch(e){ return null; }
  }
  function nomeEl(a){ return a.querySelector(".faixa-txt")||a.querySelector(".ferr-nome"); }
  function dadosDe(a){
    var ne=nomeEl(a), de=a.querySelector(".ferr-desc");
    var nome=ne?ne.textContent:(a.getAttribute("aria-label")||a.title||a.textContent);
    return {nome:nome.trim(), desc:de?de.textContent:"", href:a.getAttribute("href")||""};
  }
  function aplicar(a,d){
    if(d.href) a.setAttribute("href",d.href);
    if(d.nome!=null){
      var ne=nomeEl(a);
      if(ne) ne.textContent=d.nome;
      else if(a.classList.contains("so-icone")){ a.setAttribute("aria-label",d.nome); a.title=d.nome; }
      else{
        var t=[].filter.call(a.childNodes,function(n){ return n.nodeType===3; }).pop();
        if(t) t.nodeValue=d.nome; else a.appendChild(document.createTextNode(d.nome));
      }
    }
    var de=a.querySelector(".ferr-desc"); if(de&&d.desc!=null) de.textContent=d.desc;
  }
  function contDe(area,grupo){ return document.querySelector("#area-"+area+(grupo==="atalhos"?" .atalhos":" .ferr-lista")); }
  function criar(n,cont){
    var a=document.createElement("a"); a.href=n.href; a.target="_blank"; a.rel="noopener"; a.dataset.lid=n.id;
    if(n.grupo==="atalhos"){
      var ir=cont.querySelector("a.atalho"), so=!!(ir&&ir.classList.contains("so-icone"));
      a.className="atalho"+(ir&&ir.classList.contains("atalho-escuro")?" atalho-escuro":"")+(so?" so-icone":"");
      a.innerHTML=ICONE;
      if(so){ a.setAttribute("aria-label",n.nome); a.title=n.nome; } else a.appendChild(document.createTextNode(n.nome));
    }else{
      a.className="ferr solo";
      var seta=cont.querySelector(".ferr-seta");
      a.innerHTML='<span class="ferr-ic">'+ICONE+'</span><span class="ferr-txt"><span class="ferr-nome"></span><span class="ferr-desc"></span></span><span class="ferr-seta">'+(seta?seta.innerHTML:"")+'</span>';
      a.querySelector(".ferr-nome").textContent=n.nome; a.querySelector(".ferr-desc").textContent=n.desc||"";
    }
    return a;
  }

  /* identifica cada link original e cria os botões "+ Novo link" */
  document.querySelectorAll('[id^="area-"]').forEach(function(ar){
    var p=ar.id.slice(5);
    [].forEach.call(ar.querySelectorAll(SEL),function(a,i){ a.dataset.lid=p+"-"+i; });
    ar.querySelectorAll(".atalhos,.ferr-lista").forEach(function(c){
      var b=document.createElement("button"); b.type="button"; b.className="ed-add"; b.textContent="+ Novo link";
      b.dataset.area=p; b.dataset.grupo=c.classList.contains("atalhos")?"atalhos":"lista";
      c.appendChild(b);
    });
  });
  /* aplica o que está salvo */
  document.querySelectorAll("a[data-lid]").forEach(function(a){
    var id=a.dataset.lid; if(D.del.indexOf(id)>-1) a.hidden=true; else if(D.mod[id]) aplicar(a,D.mod[id]);
  });
  D.novos.forEach(function(n){
    var c=contDe(n.area,n.grupo); if(!c) return;
    c.insertBefore(criar(n,c),c.querySelector(".ed-add"));
  });

  /* janela de edição */
  var dlg=document.createElement("dialog"); dlg.className="ed-dlg";
  dlg.innerHTML='<form class="ed-form" novalidate><h3 class="ed-tit">Editar link</h3><label>Nome<input name="nome" maxlength="40" autocomplete="off"></label><label class="ed-l-desc">Descrição<input name="desc" maxlength="60" autocomplete="off"></label><label>Endereço (URL)<input name="href" inputmode="url" placeholder="https://" autocomplete="off"></label><p class="ed-erro" hidden></p><div class="ed-acoes"><button type="button" class="ed-rem">Remover</button><span></span><button type="button" class="ed-cancel">Cancelar</button><button type="submit" class="ed-ok">Salvar</button></div></form>';
  document.body.appendChild(dlg);
  var f=dlg.querySelector("form"), erro=dlg.querySelector(".ed-erro"), atual=null;
  function abrir(ctx){
    atual=ctx; erro.hidden=true;
    var ex=!!ctx.a, d=ex?dadosDe(ctx.a):{nome:"",desc:"",href:""};
    dlg.querySelector(".ed-tit").textContent=ex?"Editar link":"Novo link";
    f.nome.value=d.nome; f.desc.value=d.desc; f.href.value=d.href;
    var temDesc=ex?ctx.a.classList.contains("ferr"):ctx.grupo==="lista";
    dlg.querySelector(".ed-l-desc").hidden=!temDesc;
    dlg.querySelector(".ed-rem").hidden=!ex||ctx.a.classList.contains("faixa");
    dlg.showModal(); f.nome.focus();
  }
  dlg.querySelector(".ed-cancel").addEventListener("click",function(){ dlg.close(); });
  dlg.querySelector(".ed-rem").addEventListener("click",function(){
    var a=atual&&atual.a; if(!a||!confirm("Remover este link?")) return;
    var id=a.dataset.lid;
    if(id.charAt(0)==="n"&&/^n[a-z0-9]+$/.test(id)&&D.novos.some(function(n){ return n.id===id; })){
      D.novos=D.novos.filter(function(n){ return n.id!==id; }); a.remove();
    }else{ if(D.del.indexOf(id)<0) D.del.push(id); a.hidden=true; }
    gravar(); dlg.close();
  });
  f.addEventListener("submit",function(e){
    e.preventDefault();
    var nome=f.nome.value.trim(), href=urlOk(f.href.value), desc=f.desc.value.trim();
    if(!nome){ erro.textContent="Informe um nome."; erro.hidden=false; f.nome.focus(); return; }
    if(!href){ erro.textContent="Endereço inválido. Use um link começando com http:// ou https://."; erro.hidden=false; f.href.focus(); return; }
    var a=atual.a;
    if(a){
      var d={nome:nome,desc:desc,href:href}; aplicar(a,d);
      var id=a.dataset.lid, nv=D.novos.filter(function(n){ return n.id===id; })[0];
      if(nv){ nv.nome=nome; nv.desc=desc; nv.href=href; } else D.mod[id]=d;
    }else{
      var n={id:"n"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),area:atual.area,grupo:atual.grupo,nome:nome,desc:desc,href:href};
      var c=contDe(n.area,n.grupo); D.novos.push(n); c.insertBefore(criar(n,c),c.querySelector(".ed-add"));
    }
    gravar(); dlg.close();
  });

  /* liga/desliga o modo edição */
  var aviso=document.createElement("p"); aviso.className="ed-aviso"; aviso.setAttribute("role","status");
  aviso.textContent="Modo edição ativo: Clique em um link para editar ou remover.";
  document.body.appendChild(aviso);
  btn.addEventListener("click",function(){
    var on=btn.getAttribute("aria-pressed")!=="true";
    btn.setAttribute("aria-pressed",on?"true":"false");
    var t=on?"Desativar modo edição":"Ativar modo edição"; btn.title=t; btn.setAttribute("aria-label",t);
    document.body.classList.toggle("modo-edicao",on); aviso.classList.toggle("on",on);
    btn.classList.remove("golpe-on","golpe-off"); void btn.offsetWidth; btn.classList.add(on?"golpe-on":"golpe-off");
  });
  function intercepta(e){
    if(!document.body.classList.contains("modo-edicao")) return;
    var add=e.target.closest&&e.target.closest(".ed-add");
    if(add){ if(e.type==="click") abrir({a:null,area:add.dataset.area,grupo:add.dataset.grupo}); return; }
    var a=e.target.closest&&e.target.closest(SEL); if(!a) return;
    e.preventDefault(); e.stopPropagation();
    if(e.type==="click") abrir({a:a});
  }
  document.addEventListener("click",intercepta,true);
  document.addEventListener("auxclick",intercepta,true);
})();

/* ===== Sincronização (Firebase) — carregada sob demanda;
   se falhar, o restante da página continua funcionando ===== */
(async function(){
var btn=document.getElementById("sync"), txt=document.getElementById("sync-txt");
if(!btn||!txt) return;
function estado(e,t){ btn.dataset.e=e; txt.textContent=t; btn.title=t; btn.setAttribute("aria-label",t); }
let initializeApp, getAuth, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, getFirestore, doc, getDoc, setDoc;
try{
  const V="https://www.gstatic.com/firebasejs/13.2.0/";
  const [a,b,c]=await Promise.all([import(V+"firebase-app.js"),import(V+"firebase-auth.js"),import(V+"firebase-firestore.js")]);
  ({initializeApp}=a);
  ({getAuth, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut}=b);
  ({getFirestore, doc, getDoc, setDoc}=c);
}catch(e){ console.error("Firebase indisponível",e); btn.hidden=false; estado("erro","Sincronização indisponível"); return; }
const firebaseConfig = {
  apiKey: "AIzaSyC10wqSdbYHcxJOGKhqzwm4ZDCf3o8tQvM",
  authDomain: "ingryds-workspace.firebaseapp.com",
  projectId: "ingryds-workspace",
  storageBucket: "ingryds-workspace.firebasestorage.app",
  messagingSenderId: "130700324636",
  appId: "1:130700324636:web:d55326466d00a7064914d9"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// tudo o que este workspace guarda no navegador e precisa ir para a nuvem
const CHAVES = [
  "notas-mercado-livre","notas-shopee","notas-pessoal-amanda",
  "metas-mercado-livre-semanal","metas-mercado-livre-mensal","metas-shopee-semanal","metas-shopee-mensal","afazeres-pessoal",
  "info-logins",
  "vendas-mercado-livre-dias","vendas-mercado-livre-metas","vendas-shopee-dias","vendas-shopee-metas",
  "respostas-mercado-livre","respostas-shopee",
  "gastos-cartao","livros-pessoal","compras-pessoal",
  "links-amanda"
];
btn.hidden = false; window.__syncOk = true;
estado("off", "Entrar para sincronizar");

let usuario = null, ref = null, timer = null, pendente = false, ocupado = false;

function lerLocal(){
  const o = {};
  CHAVES.forEach(k => { try { const v = localStorage.getItem(k); if (v !== null) o[k] = v; } catch(e){} });
  return o;
}
function iguais(a, b){
  return CHAVES.every(k => (a[k] ?? null) === (b[k] ?? null));
}

async function enviar(){
  if (!ref) return;
  try {
    estado("off", "Salvando…");
    await setDoc(ref, { dados: lerLocal(), atualizadoEm: Date.now() });
    pendente = false;
    estado("ok", "Sincronizado");
  } catch(e){ console.error(e); estado("erro", "Erro ao salvar"); }
}
function agenda(){
  if (!ref) return;
  pendente = true;
  clearTimeout(timer);
  timer = setTimeout(enviar, 800);
}

// qualquer gravação numa chave sincronizada dispara o envio
const setOriginal = Storage.prototype.setItem;
Storage.prototype.setItem = function(k, v){
  setOriginal.call(this, k, v);
  if (this === window.localStorage && CHAVES.includes(k)) agenda();
};

async function baixar(permiteRecarregar){
  if (!ref || ocupado) return;
  ocupado = true;
  try {
    const snap = await getDoc(ref);
    const local = lerLocal();
    if (!snap.exists()) { await enviar(); return; }
    const remoto = (snap.data() && snap.data().dados) || {};
    const mescla = Object.assign({}, local, remoto);   // a nuvem vence; o que só existe aqui é mantido
    if (!iguais(mescla, local)) {
      if (pendente) { await enviar(); return; }        // há edição local ainda não enviada
      const emUso = document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (permiteRecarregar && !emUso) {
        let recente = false;
        try { recente = Date.now() - (+sessionStorage.getItem("sync-reload") || 0) < 15000; } catch(e){}
        if (!recente) {
          CHAVES.forEach(k => { if (k in mescla) setOriginal.call(localStorage, k, mescla[k]); });
          try { sessionStorage.setItem("sync-reload", String(Date.now())); } catch(e){}
          location.reload();
          return;
        }
      }
    } else if (!iguais(mescla, remoto)) { await enviar(); return; }
    estado("ok", "Sincronizado");
  } catch(e){ console.error(e); estado("erro", "Erro de sincronização"); }
  finally { ocupado = false; }
}

onAuthStateChanged(auth, user => {
  usuario = user;
  if (user) {
    // documento próprio da Amanda: não colide com o "estado" do outro workspace, mesmo com a mesma conta Google
    ref = doc(db, "users", user.uid, "dados", "estado-amanda");
    estado("off", "Sincronizando…");
    baixar(true);
  } else {
    ref = null;
    estado("off", "Entrar para sincronizar");
  }
});
getRedirectResult(auth).catch(e => console.error(e));

btn.addEventListener("click", async () => {
  if (usuario) {
    if (confirm("Sair da conta " + (usuario.email || "") + "? Os dados deste aparelho continuam salvos nele.")) signOut(auth);
    return;
  }
  const prov = new GoogleAuthProvider();
  try { await signInWithPopup(auth, prov); }
  catch(e){
    if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) signInWithRedirect(auth, prov);
    else if (!e || e.code !== "auth/popup-closed-by-user") { console.error(e); estado("erro", "Erro no login"); }
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) { if (pendente) { clearTimeout(timer); enviar(); } }
  else baixar(true);
});
window.addEventListener("pagehide", () => { if (pendente) enviar(); });
})();
