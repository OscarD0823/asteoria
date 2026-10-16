/** Request a disk-backed commit when supported; older browsers keep their native atomic transaction. */
export function durableTransaction(database:IDBDatabase,stores:string|string[],mode:IDBTransactionMode='readwrite'){
 if(mode!=='readwrite')return database.transaction(stores,mode);
 try{return database.transaction(stores,mode,{durability:'strict'});}catch(error){if(error instanceof TypeError||(error instanceof DOMException&&error.name==='NotSupportedError'))return database.transaction(stores,mode);throw error;}
}
