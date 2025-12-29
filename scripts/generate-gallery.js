const fs=require('fs'),p=require('path');
const ROOT=p.join(__dirname,'../assets/img/photography');
const OUT=p.join(ROOT,'gallery.json');
const isImg=f=>/\.(jpg|jpeg|png|webp)$/i.test(f);
const g={};

fs.readdirSync(ROOT,{withFileTypes:true}).filter(d=>d.isDirectory()).forEach(d=>{
const dir=p.join(ROOT,d.name);
const meta=p.join(dir,'_meta.json');
if(!fs.existsSync(meta))return;
const m=JSON.parse(fs.readFileSync(meta));
const imgs=fs.readdirSync(dir).filter(isImg);
if(!imgs.includes('cover.jpg'))return;
g[d.name]={
title:m.title||d.name,
categories:m.categories||[],
cover:'cover.jpg',
images:imgs.filter(f=>f!=='cover.jpg').sort()
};
});
fs.writeFileSync(OUT,JSON.stringify(g,null,2));
console.log('✅ gallery.json generated (Option B)');
