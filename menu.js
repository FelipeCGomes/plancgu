/* Botão mostrar/ocultar menu lateral, com preferência persistida. */
(function(){
  const PREF_KEY=KEY+"-sidebar-hidden";
  function applyHidden(hidden){
    document.body.classList.toggle("sidebar-hidden",!!hidden);
    const btn=document.getElementById("sidebarToggle");
    if(btn){
      btn.setAttribute("aria-expanded",String(!hidden));
      btn.innerHTML=hidden?"☰ <span>Mostrar menu</span>":"✕ <span>Ocultar menu</span>";
    }
    try{localStorage.setItem(PREF_KEY,hidden?"1":"0")}catch(e){}
  }
  function init(){
    const topbar=document.querySelector(".topbar");
    if(!topbar||document.getElementById("sidebarToggle"))return;
    const currentTitle=document.getElementById("topTitle");
    const left=document.createElement("div");
    left.className="topbar-left";
    const btn=document.createElement("button");
    btn.id="sidebarToggle";
    btn.className="menu-toggle";
    btn.type="button";
    btn.setAttribute("aria-controls","studySidebar");
    btn.addEventListener("click",()=>applyHidden(!document.body.classList.contains("sidebar-hidden")));
    if(currentTitle){
      currentTitle.parentNode.insertBefore(left,currentTitle);
      left.appendChild(btn);
      left.appendChild(currentTitle);
    }else{
      topbar.prepend(btn);
    }
    const sidebar=document.querySelector(".sidebar");
    if(sidebar)sidebar.id="studySidebar";
    let hidden=false;
    try{
      const saved=localStorage.getItem(PREF_KEY);
      hidden=saved===null?window.innerWidth<=760:saved==="1";
    }catch(e){hidden=window.innerWidth<=760}
    applyHidden(hidden);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
