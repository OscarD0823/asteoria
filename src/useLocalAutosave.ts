import {useEffect,useRef,useState} from 'react';
import {createLocalAutosave,type AutosaveState} from './local-autosave';
import {registerAutosave} from './autosave-registry';
/** Uses the application's existing local store, so database identities remain compatible. */
export function useLocalAutosave({enabled,revision,save,onError,debounceMs=400,maxWaitMs=2000}:{enabled:boolean;revision:unknown;save:()=>Promise<void>;onError?:(error:unknown)=>void;debounceMs?:number;maxWaitMs?:number}){
 const [state,setState]=useState<AutosaveState>({status:'idle',savedAt:null,error:null});
 const current=useRef({enabled,save,onError}),mounted=useRef(true);current.current={enabled,save,onError};
 const instance=useRef<ReturnType<typeof createLocalAutosave>|null>(null);
 if(!instance.current)instance.current=createLocalAutosave(()=>current.current.save(),state=>{if(mounted.current)setState(state);if(state.status==='error')current.current.onError?.(state.error);},{debounceMs,maxWaitMs});
 useEffect(()=>{if(enabled)instance.current!.changed();else instance.current!.pause();},[enabled,revision]);
 useEffect(()=>{
  mounted.current=true;
  const unregister=registerAutosave(()=>current.current.enabled?instance.current!.flush():Promise.resolve());
  const flush=()=>{if(current.current.enabled)void instance.current!.flush().catch(()=>{});};
  const visibility=()=>{if(document.visibilityState==='hidden')flush();};
  const before=(event:BeforeUnloadEvent)=>{if(current.current.enabled&&instance.current!.pending()){flush();event.preventDefault();event.returnValue='';}};
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',flush);window.addEventListener('beforeunload',before);
  return()=>{flush();unregister();mounted.current=false;document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',flush);window.removeEventListener('beforeunload',before);};
 },[]);
 return{...state,flush:()=>instance.current!.flush()};
}
