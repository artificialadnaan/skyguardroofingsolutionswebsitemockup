/* Regenerate responsive assets with npm run images; original photos remain unchanged. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'images/responsive');
function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.name === 'responsive' ? [] : e.isDirectory() ? walk(path.join(dir,e.name)) : /\.(png|jpe?g)$/i.test(e.name) ? [path.join(dir,e.name)] : []); }
(async () => {
  fs.mkdirSync(out,{recursive:true});
  const manifest={};
  for (const file of walk(path.join(root,'images')).sort()) {
    const source='/'+path.relative(root,file).split(path.sep).join('/');
    const meta=await sharp(file).rotate().metadata();
    const widths=[...new Set([480,800,1280,1920].map(w=>Math.min(w,meta.width)))];
    const variants=[];
    for (const width of widths) {
      let quality=78;
      let result;
      const limit=width<=800?100000:width<=1280?200000:350000;
      do {
        result=await sharp(file).rotate().resize({width,withoutEnlargement:true}).webp({quality,effort:6}).toBuffer({resolveWithObject:true});
        quality-=6;
      } while(result.data.length>limit && quality>=48);
      const hash=crypto.createHash('sha256').update(result.data).digest('hex').slice(0,12);
      const name=path.basename(file,path.extname(file))+'-'+width+'-'+hash+'.webp';
      fs.writeFileSync(path.join(out,name),result.data);
      variants.push({src:'/images/responsive/'+name,width:result.info.width,height:result.info.height,bytes:result.data.length});
    }
    manifest[source]={width:meta.width,height:meta.height,originalBytes:fs.statSync(file).size,fallback:source,variants};
  }
  fs.mkdirSync(path.join(root,'data'),{recursive:true});
  fs.writeFileSync(path.join(root,'data/image-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Optimized ${Object.keys(manifest).length} images into ${Object.values(manifest).reduce((n,v)=>n+v.variants.length,0)} WebP variants.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
