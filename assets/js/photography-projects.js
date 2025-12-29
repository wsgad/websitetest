document.addEventListener('DOMContentLoaded',()=>{

const grid=document.querySelector('.gallery-container');
const filters=document.querySelector('.gallery-filters');
if(!grid||!filters)return;

fetch('assets/img/photography/gallery.json').then(r=>r.json()).then(data=>{

const cats=new Set();
Object.values(data).forEach(p=>p.categories.forEach(c=>cats.add(c)));

filters.innerHTML='<button class="filter-btn active" data-filter="*">All</button>';
[...cats].forEach(c=>{
const b=document.createElement('button');
b.className='filter-btn';
b.dataset.filter='.'+c;
b.textContent=c.replace(/-/g,' ');
filters.appendChild(b);
});

Object.entries(data).forEach(([slug,p])=>{
const col=document.createElement('div');
col.className=`col-sm-6 col-md-4 col-lg-3 ${p.categories.join(' ')}`;
col.innerHTML=`
<div class="project-card">
<a href="assets/img/photography/${slug}/${p.images[0]}" class="glightbox" data-gallery="${slug}" data-title="${p.title}">
<img src="assets/img/photography/${slug}/${p.cover}" alt="${p.title}">
<div class="project-overlay">
<div>
<div class="project-title">${p.title}</div>
<div class="project-categories">${p.categories.join(', ')}</div>
</div>
</div>
</a>
</div>`;
grid.appendChild(col);

p.images.slice(1).forEach(img=>{
const h=document.createElement('a');
h.href=`assets/img/photography/${slug}/${img}`;
h.className='glightbox';
h.dataset.gallery=slug;
h.style.display='none';
grid.appendChild(h);
});
});

imagesLoaded(grid,()=>{
const iso=new Isotope(grid,{itemSelector:'.col-sm-6',layoutMode:'masonry'});
document.querySelectorAll('.filter-btn').forEach(btn=>{
btn.onclick=()=>{
document.querySelector('.filter-btn.active')?.classList.remove('active');
btn.classList.add('active');
iso.arrange({filter:btn.dataset.filter});
};
});
document.querySelectorAll('.project-card').forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),i*80));
GLightbox({selector:'.glightbox',touchNavigation:true,loop:true});
});
});

});
