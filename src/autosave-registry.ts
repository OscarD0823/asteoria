const active=new Set<()=>Promise<void>>();
export function registerAutosave(flush:()=>Promise<void>){active.add(flush);return()=>{active.delete(flush);};}
/** Internal navigation waits for the editor and every queued recovery write. */
export async function flushAutosaves(){await Promise.all([...active].map(flush=>flush()));}
