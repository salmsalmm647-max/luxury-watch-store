import { db, C, configured } from "./firebase.js";
import { collection, getDocs, query, where, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = s => document.querySelector(s);
const money = n => `${Number(n||0).toLocaleString("ar")} ر.س`;
const cart = JSON.parse(localStorage.getItem("watch_cart") || "[]");
let products = [], settings = {};
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function saveCart(){localStorage.setItem("watch_cart",JSON.stringify(cart));$("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0)}
function img(url){return url || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700"}
function renderProducts(list){$("#productCount").textContent=`${list.length} منتج`;$("#productGrid").innerHTML=list.length?list.map(p=>`<article class="product-card"><img src="${img(p.image)}" alt="${esc(p.name)}"><div class="product-info"><h3>${esc(p.name||"ساعة فاخرة")}</h3><p>${esc(p.description||"تصميم أنيق يضيف لمسة من الفخامة")}</p><div class="price">${money(p.price)}</div><button class="primary add" data-id="${p.id}">أضف إلى السلة</button></div></article>`).join(""):'<p class="muted">لا توجد منتجات منشورة حتى الآن.</p>'}
function renderCategories(list){$("#categoryGrid").innerHTML=list.length?list.map(c=>`<a class="category-card" href="#products" data-cat="${esc(c.name)}"><img src="${img(c.image)}" alt="${esc(c.name)}"><b>${esc(c.name)}</b></a>`).join(""):'<p class="muted">يمكنك إضافة الأقسام من لوحة التحكم.</p>'}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function load(){
 if(!configured){toast("أضف apiKey في firebase.js أولاً");return}
 try{
  const [ps,cs,ss]=await Promise.all([getDocs(query(collection(db,C.products),where("active","==",true))),getDocs(collection(db,C.categories)),getDoc(doc(db,C.settings,"main"))]);
  products=ps.docs.map(d=>({id:d.id,...d.data()}));renderProducts(products);renderCategories(cs.docs.map(d=>({id:d.id,...d.data()})));
  if(ss.exists()){settings=ss.data();$("#brandName").innerHTML=`${esc(settings.storeName||"متجر الساعات الفاخرة")}<small>TIME • ELEGANCE • LUXURY</small>`;$("#footerName").textContent=settings.storeName||"متجر الساعات الفاخرة";$("#heroTitle").textContent=settings.heroTitle||"وقتك… يستحق الفخامة";$("#heroText").textContent=settings.heroText||"اكتشف تشكيلة مختارة من الساعات بتصاميم راقية ولمسات استثنائية.";$("#contactInfo").textContent=settings.contactText||"تواصل معنا للاستفسارات والطلبات.";if(settings.email){$("#emailLink").href=`mailto:${settings.email}`;$("#emailLink").textContent=settings.email}if(settings.phone){$("#phoneLink").href=`tel:${settings.phone}`;$("#phoneLink").textContent=settings.phone}if(settings.logo){const mark=document.querySelector(".brand-mark");mark.innerHTML=`<img src="${esc(settings.logo)}" alt="شعار المتجر" style="width:46px;height:46px;object-fit:contain">`}if(settings.background){document.querySelector(".hero").style.backgroundImage=`linear-gradient(90deg,#fff8fcdd,#f0e4f6cc),url("${settings.background}")`;document.querySelector(".hero").style.backgroundSize="cover";document.querySelector(".hero").style.backgroundPosition="center"}}
  await addDoc(collection(db,C.visits),{page:"home",path:location.pathname,createdAt:serverTimestamp()});
 }catch(e){console.error(e);toast("تعذر تحميل البيانات. راجع قواعد Firestore في ملف التعليمات.");}
}
document.addEventListener("click",e=>{
 const add=e.target.closest(".add");if(add){const p=products.find(x=>x.id===add.dataset.id);if(!p)return;const old=cart.find(x=>x.id===p.id);old?old.qty++:cart.push({id:p.id,name:p.name,price:Number(p.price),image:p.image,qty:1});saveCart();toast("تمت إضافة المنتج إلى السلة")}
 if(e.target.closest("#openCart")){$("#cartOverlay").hidden=false;renderCart()}
 if(e.target.closest("#closeCart"))$("#cartOverlay").hidden=true;
 const cat=e.target.closest("[data-cat]");if(cat){const filtered=products.filter(p=>p.category===cat.dataset.cat);renderProducts(filtered)}
});
function renderCart(){const box=$("#cartItems");box.innerHTML=cart.length?cart.map(p=>`<div class="cart-line"><span>${esc(p.name)} × ${p.qty}<br>${money(p.price*p.qty)}</span><button data-remove="${p.id}">حذف</button></div>`).join(""):"<p class='muted'>السلة فارغة.</p>";$("#cartTotal").textContent=money(cart.reduce((s,p)=>s+p.price*p.qty,0))}
$("#cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(!b)return;const i=cart.findIndex(p=>p.id===b.dataset.remove);if(i>=0)cart.splice(i,1);saveCart();renderCart()});
$("#checkoutForm").addEventListener("submit",async e=>{e.preventDefault();if(!cart.length){toast("السلة فارغة");return}const f=new FormData(e.currentTarget);const order={customer:{name:f.get("name"),phone:f.get("phone"),address:f.get("address")},notes:f.get("notes"),items:cart.map(({id,name,price,qty})=>({id,name,price,qty})),total:cart.reduce((s,p)=>s+p.price*p.qty,0),status:"new",createdAt:serverTimestamp()};try{await addDoc(collection(db,C.orders),order);cart.splice(0);saveCart();renderCart();e.currentTarget.reset();toast("تم استلام طلبك بنجاح");setTimeout(()=>$("#cartOverlay").hidden=true,1200)}catch(err){console.error(err);toast("تعذر إرسال الطلب. تحقق من إعدادات Firebase") }});
saveCart();load();
