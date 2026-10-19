import {cp,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'dist');
await mkdir(output,{recursive:true});
for(const name of ['index.html','styles.css','styles-v243.css','styles-v244.css','styles-v245.css','src','assets']){
  await cp(path.join(root,name),path.join(output,name),{recursive:true});
}
console.log('Public static build ready in dist/');
