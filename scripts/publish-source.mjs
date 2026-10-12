import {spawnSync} from 'node:child_process';
/** Publish the committed revision, including edits made from a pinned checkout.
 * Git rejects a conflicting remote update; never force or discard local work. */
export function pushSourceRevision(directory){
 const result=spawnSync('git',['push','origin','HEAD:main'],{cwd:directory,encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr||'No se pudo publicar el código.');
 return result.stdout+result.stderr;
}
