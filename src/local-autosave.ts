export type AutosaveState={status:'idle'|'pending'|'saving'|'saved'|'error';savedAt:number|null;error:unknown};
type Clock={set:(callback:()=>void,ms:number)=>unknown;clear:(id:unknown)=>void;now:()=>number};
const clock:Clock={set:(f,ms)=>setTimeout(f,ms),clear:id=>clearTimeout(id as ReturnType<typeof setTimeout>),now:()=>Date.now()};
/** Debounce with a maximum wait: continuous typing cannot postpone every save. */
export function createLocalAutosave(save:()=>Promise<void>,notify:(state:AutosaveState)=>void,options:{debounceMs?:number;maxWaitMs?:number;clock?:Clock}={}){
 const timer=options.clock??clock,delay=options.debounceMs??400,maximum=Math.max(delay,options.maxWaitMs??2000);
 let debounce:unknown,maxWait:unknown,dirty=false,running:Promise<void>|null=null,savedAt:number|null=null,disposed=false;
 function state(status:AutosaveState['status'],error:unknown=null){notify({status,savedAt,error});}
 function clear(){if(debounce!==undefined)timer.clear(debounce);if(maxWait!==undefined)timer.clear(maxWait);debounce=maxWait=undefined;}
 function automatic(){void flush().catch(()=>{});}
 function changed(){if(disposed)return;dirty=true;state(running?'saving':'pending');if(debounce!==undefined)timer.clear(debounce);debounce=timer.set(automatic,delay);if(maxWait===undefined)maxWait=timer.set(automatic,maximum);}
 function flush():Promise<void>{
  clear();if(running)return running;if(!dirty||disposed)return Promise.resolve();
  running=(async()=>{try{while(dirty&&!disposed){dirty=false;state('saving');try{await save();savedAt=timer.now();}catch(error){dirty=true;state('error',error);throw error;}}if(!disposed)state('saved');}finally{running=null;}})();return running;
 }
 function pause(){clear();dirty=false;if(!running)state('idle');}
 function dispose(){disposed=true;clear();}
 return{changed,flush,pause,dispose,pending:()=>dirty||!!running};
}
