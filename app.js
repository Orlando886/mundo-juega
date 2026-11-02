const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(n)||0);
let products=[], images={}, category="Todos", cart=[];
const emojiFor = p => ({Niño:"🚗",Niña:"🎀",Bebé:"🧸",Didáctico:"🧠",Bloques:"🧱",Balones:"⚽",Plásticos:"🪀",Bicicletas:"🚲",Patinetas:"🛴",Unidades:"🎁"}[p.category] || "🧸");
async function init(){
  $("#year").textContent=new Date().getFullYear();
  try{
    const [pr,im]=await Promise.all([fetch("/api/productos"),fetch("/imagenes-productos.json").catch(()=>null)]);
    if(!pr.ok) throw new Error("No se pudo cargar el catálogo");
    products=await pr.json();
    if(im && im.ok){const a=await im.json(); images=Object.fromEntries(a.map(x=>[String(x.reference),x.image]));}
    // Los archivos de imagen del catálogo se nombran por referencia.
    renderCategories(); renderProducts();
    $("#catalog-subtitle").textContent=`${products.length.toLocaleString("es-CO")} juguetes disponibles`;
  }catch(e){$("#product-grid").innerHTML=`<div class="empty">No se pudo cargar el catálogo. Verifica que productos-catalogo.json esté en la carpeta y vuelve a iniciar el servidor.</div>`;}
}
function renderCategories(){
 const cats=["Todos",...new Set(products.map(p=>p.category).filter(Boolean))];
 $("#categories").innerHTML=cats.map(c=>`<button class="chip ${c===category?"active":""}" data-category="${esc(c)}">${esc(c)}</button>`).join("");
 $("#categories").querySelectorAll("button").forEach(b=>b.onclick=()=>{category=b.dataset.category;renderCategories();renderProducts();});
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function getPublic(p){return Number(p.pricePublic ?? p.price ?? 0)}
function renderProducts(){
 let q=$("#search").value.trim().toLowerCase(), level=$("#level").value, sort=$("#sort").value;
 let list=products.filter(p=>(category==="Todos"||p.category===category)&&(!level||p.level===level)&&(!q||[p.name,p.reference,p.category].some(v=>String(v||"").toLowerCase().includes(q))));
 if(sort==="low")list.sort((a,b)=>getPublic(a)-getPublic(b)); if(sort==="high")list.sort((a,b)=>getPublic(b)-getPublic(a)); if(sort==="az")list.sort((a,b)=>String(a.name).localeCompare(String(b.name),"es"));
 $("#product-grid").innerHTML=list.map(p=>{
  const img=p.image||images[String(p.reference)];
  return `<article class="product-card"><div class="product-photo">${p.level?`<span class="level-tag">${esc(p.level)}</span>`:""}${img?`<img loading="lazy" src="${esc(img)}" alt="${esc(p.name)}" onerror="this.remove();this.parentElement.insertAdjacentHTML('beforeend','<span class=placeholder> ${emojiFor(p)} </span>')">`:`<span class="placeholder">${emojiFor(p)}</span>`}</div><div class="product-info"><span class="category">${esc(p.category)}</span><h3>${esc(p.name)}</h3><div class="description">${esc(p.description||p.name)}</div><div class="reference">Ref. ${esc(p.reference||"—")}</div><div class="price-row"><span class="price">${money(getPublic(p))}</span><button class="add" data-add="${p.id}" aria-label="Agregar al carrito">+</button></div></div></article>`;
 }).join("");
 $("#empty").classList.toggle("hidden",list.length>0);
 $("#product-grid").classList.toggle("hidden",list.length===0);
 $("#product-grid").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(b.dataset.add));
}
function addToCart(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;const item=cart.find(x=>String(x.id)===String(id));if(item)item.qty++;else cart.push({...p,qty:1});renderCart();}
function renderCart(){
 $("#cart-count").textContent=cart.reduce((s,p)=>s+p.qty,0);
 $("#cart-items").innerHTML=cart.length?cart.map(p=>`<div class="cart-line"><div><b>${esc(p.name)}</b><small>Ref. ${esc(p.reference||"—")} · ${money(getPublic(p))}</small></div><div class="qty"><button data-minus="${p.id}">−</button><b>${p.qty}</b><button data-plus="${p.id}">+</button></div></div>`).join(""):"<p class='muted'>Tu carrito está vacío.</p>";
 $("#cart-total").textContent=money(cart.reduce((s,p)=>s+getPublic(p)*p.qty,0));
 $("#cart-items").querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));
 $("#cart-items").querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));
}
function changeQty(id,n){const p=cart.find(x=>String(x.id)===String(id));if(p){p.qty+=n;if(p.qty<=0)cart=cart.filter(x=>x!==p);renderCart();}}
function toggleCart(show){$("#cart-panel").classList.toggle("hidden",!show);}
$("#search").addEventListener("input",renderProducts);$("#level").addEventListener("change",renderProducts);$("#sort").addEventListener("change",renderProducts);
$("#cart-open").onclick=()=>toggleCart(true);$("#cart-close").onclick=()=>toggleCart(false);$("#cart-x").onclick=()=>toggleCart(false);
$("#checkout").onclick=()=>{if(!cart.length)return alert("Agrega al menos un juguete.");const lines=cart.map(p=>`${p.qty} x ${p.name} (Ref. ${p.reference}) - ${money(getPublic(p))}`).join("\n");const total=money(cart.reduce((s,p)=>s+getPublic(p)*p.qty,0));window.open(`https://wa.me/?text=${encodeURIComponent("Hola Mundo Juega, quiero hacer este pedido:\n"+lines+"\nTotal: "+total)}`,"_blank");};
init();