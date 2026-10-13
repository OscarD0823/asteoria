import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fontFamilies } from "./fonts";
import { localFontFamilies, type LocalFont } from "./local-fonts";
import { readPreference, writePreference } from "./preferences";
import {essentialFontNames, essentialFontRank, officeFontNames} from './font-policy';
import './font-picker.css';
import {useDeviceFonts,deviceFonts,listInstalledFonts,installedFamilies,installedFontFiles,importDeviceFonts,fontFiles,normalizeFontName,type InstalledFont} from './device-fonts';
const essentials = [
  ["Arial · 11 pt", "Arimo", "Arimo"],
  ["Calibri · 11 pt", "Carlito", "Carlito"],
  ["Times New Roman · 12 pt", "PrismaSerif", "Liberation Serif"],
  ["Georgia · 11 pt", "Gelasio", "Gelasio"],
  ["Computer Modern · 10 pt", "LatinModernRoman", "Latin Modern Roman"],
] as const;
export function FontPicker({
  value,
  fonts = [],
  onChange,
  onAcademicFont,
  onImport,
  onError,
  label = "Tipo de letra",
  displayLabel,
}: {
  value: string;
  fonts?: LocalFont[];
  onChange: (value: string) => void;
  onAcademicFont?: (font: string, size: number) => void;
  onImport?: (files: File[]) => Promise<void>;
  onError: (error: unknown) => void;
  label?: string;
  displayLabel?: string;
}) {
  const [open, setOpen] = useState(false),
    [quick,setQuick]=useState(false),[active,setActive]=useState(0),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() =>
    readPreference("favorite-fonts", []),
  );
  const [recent, setRecent] = useState<string[]>(() =>
    readPreference("recent-fonts", []),
  );
  const [sample, setSample] = useState(
    "El arte de escribir. ÁÉÍÓÚ ñ · 0123456789",
  );
  const [previewSize, setPreviewSize] = useState(24);
  const [preview, setPreview] = useState(value);
  const [bold, setBold] = useState(false),
    [italic, setItalic] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null),
    searchInput = useRef<HTMLInputElement>(null),
    button = useRef<HTMLButtonElement>(null);
  const quickPanel=useRef<HTMLDivElement>(null),quickSearch=useRef<HTMLInputElement>(null),quickId=useId();
  const [position,setPosition]=useState({left:16,top:80,width:320,maxHeight:480});
  const [libraryViewport,setLibraryViewport]=useState({left:0,top:0,width:0,height:0,compact:false});
  const [libraryOptionsOpen,setLibraryOptionsOpen]=useState(true);
  const personal=useDeviceFonts();
  const [installed,setInstalled]=useState<InstalledFont[]>([]),[sourceMessage,setSourceMessage]=useState('');
  const [installedLimit,setInstalledLimit]=useState(60);
  const [catalogLimit,setCatalogLimit]=useState(20);
  const local=[...new Map([...personal,...fonts].map(f=>[f.value+':'+f.style,f])).values()];
  const families = [...new Map([
      ...fontFamilies.filter((f) => f.file || f.styles),
      ...localFontFamilies(local),
    ].map(font=>[font.value,font])).values()],
    selected = [...fontFamilies, ...localFontFamilies(local)].find(
      (f) => f.value === value,
    );
  const filter = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("es");
  const shown = families
    .filter(
      (f) =>
        (category === "all" ||
          (category === "favorites"
            ? favorites.includes(f.value)
            : category === "recent"
              ? recent.includes(f.value)
              : category === "local"
                ? f.value.startsWith("local-")
                : f.category === category)) &&
        filter(f.label+' '+(officeFontNames[f.value]??'')).includes(filter(query)),
    )
    .sort((a, b) => essentialFontRank(a)-essentialFontRank(b)||a.label.localeCompare(b.label, "es"));
  const aliases=officeFontNames;
  const installedShown=installedFamilies(installed).filter(name=>filter(name).includes(filter(query)));
  const originals=essentialFontNames.map(name=>families.find(font=>font.value.startsWith('local-')&&normalizeFontName(font.label)===normalizeFontName(name))?.value).filter((font):font is string=>!!font);
  const popular=[...originals,value,...recent,...favorites,'Carlito','Arimo','PrismaSerif','Gelasio','NotoSans','NotoSerif','PrismaMono','LatinModernRoman'];
  const suggestions=query.trim()?families.filter(f=>filter(f.label+' '+(aliases[f.value]??'')).includes(filter(query))).sort((a,b)=>a.label.localeCompare(b.label,'es')).slice(0,40):[...new Set(popular)].map(value=>families.find(f=>f.value===value)).filter((f):f is typeof families[number]=>!!f).slice(0,16);
  useEffect(()=>setActive(0),[query,quick]);
  useEffect(()=>{if(!open)setPreview(value);},[value,open]);
  useEffect(()=>setInstalledLimit(60),[query,installed]);
  useEffect(()=>setCatalogLimit(20),[query,category,open]);
  useEffect(()=>{
    if(!quick)return;
    const place=()=>{
      const rect=button.current?.getBoundingClientRect();if(!rect)return;
      const viewport=window.visualViewport,left=viewport?.offsetLeft??0,top=viewport?.offsetTop??0;
      const visibleWidth=Math.min(innerWidth,viewport?.width??innerWidth),visibleHeight=Math.min(innerHeight,viewport?.height??innerHeight);
      const width=Math.max(0,Math.min(360,visibleWidth-24));
      const panelTop=Math.max(top+12,Math.min(rect.bottom+7,top+visibleHeight-Math.min(480,visibleHeight*.7)-12));
      setPosition({width,left:Math.max(left+12,Math.min(rect.left,left+visibleWidth-width-12)),top:panelTop,maxHeight:Math.max(0,top+visibleHeight-panelTop-12)});
    };
    place();quickSearch.current?.focus();
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!quickPanel.current?.contains(event.target)&&!button.current?.contains(event.target))setQuick(false);};
    document.addEventListener('pointerdown',outside);window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);window.visualViewport?.addEventListener('scroll',place);
    return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',place);window.visualViewport?.removeEventListener('resize',place);window.visualViewport?.removeEventListener('scroll',place);};
  },[quick]);
  useEffect(()=>{if(quick)document.getElementById(quickId+'-'+active)?.scrollIntoView({block:'nearest'});},[active,quick,quickId]);
  useEffect(()=>{
    if(!open)return;
    let first=true;
    const place=()=>{
      const viewport=window.visualViewport;
      const width=Math.min(innerWidth,viewport?.width??innerWidth),height=Math.min(innerHeight,viewport?.height??innerHeight);
      const compact=width<=700||height<600;
      setLibraryViewport({left:viewport?.offsetLeft??0,top:viewport?.offsetTop??0,width,height,compact});
      if(first){setLibraryOptionsOpen(!compact);first=false;}
    };
    place();window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);window.visualViewport?.addEventListener('scroll',place);
    return()=>{window.removeEventListener('resize',place);window.visualViewport?.removeEventListener('resize',place);window.visualViewport?.removeEventListener('scroll',place);};
  },[open]);
  useEffect(() => {
    if (!open&&!quick) return;
    if(open)searchInput.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        setQuick(false);
        button.current?.focus();
      }
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [open,quick]);
  const prepareFont=async(font:string)=>{
    const stored=deviceFonts().filter(f=>f.value===font&&!fonts.some(used=>used.value===f.value&&used.style===f.style&&used.hash===f.hash));
    if(onImport&&stored.length)await onImport(fontFiles(stored));
  };
  const choose = async (font: string) => {
    if(loading)return;
    setLoading(true);
    try{
    await prepareFont(font);
    const next = [font, ...recent.filter((f) => f !== font)].slice(0, 12);
    setRecent(next);
    writePreference("recent-fonts", next);
    onChange(font);
    setOpen(false);
    setQuick(false);
    button.current?.focus();
    }catch(error){onError(error);}finally{setLoading(false);}
  };
  return (
    <>
      <button
        className="font-picker-button"
        ref={button}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open||quick}
        onClick={() => {setQuery('');setQuick(!quick);}}
      >
        {displayLabel ?? selected?.label ?? "Elegir fuente"} <span>▾</span>
      </button>
      {quick&&createPortal(<div ref={quickPanel} className="font-quick-panel" style={position}>
        <label className="font-quick-search">Tipo de letra<input ref={quickSearch} aria-label="Buscar fuente" placeholder="Escribe el nombre de la fuente…" value={query} role="combobox" aria-autocomplete="list" aria-controls={quickId} aria-expanded="true" aria-activedescendant={suggestions.length?quickId+'-'+active:undefined} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{
          if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setActive(index=>Math.max(0,Math.min(suggestions.length-1,index+(event.key==='ArrowDown'?1:-1))));}
          if(event.key==='Enter'&&suggestions[active]){event.preventDefault();choose(suggestions[active].value);}
        }}/></label>
        <small className="font-quick-heading">{query?'Resultados':'Esenciales y usadas recientemente'}</small>
        <div id={quickId} className="font-quick-list" role="listbox" aria-label="Fuentes sugeridas">{suggestions.map((font,index)=><button key={font.value} id={quickId+'-'+index} role="option" aria-selected={font.value===value} className={index===active?'font-quick-active':''} tabIndex={-1} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(font.value)}><span><b>{font.label}</b>{aliases[font.value]&&<small>Alternativa a {aliases[font.value]}</small>}</span><span className="font-quick-sample" style={{fontFamily:font.css}}>Aa</span>{font.value===value&&<span aria-hidden="true">✓</span>}</button>)}</div>
        {!suggestions.length&&<p>No hay fuentes con ese nombre.</p>}
        <button className="font-quick-more" onClick={()=>{setQuick(false);setCategory('all');setOpen(true);}}>Biblioteca completa y vista previa <span>→</span></button>
      </div>,document.body)}
      {open &&
        createPortal(
          <div
            className="modal-shade font-modal-shade"
            style={libraryViewport.width?{inset:'auto',left:libraryViewport.left,top:libraryViewport.top,width:libraryViewport.width,height:libraryViewport.height}:undefined}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <section
              className="modal font-library"
              data-compact={libraryViewport.compact||undefined}
              style={{'--font-visible-height':libraryViewport.height+'px'} as import('react').CSSProperties}
              role="dialog"
              aria-modal="true"
              aria-labelledby="font-library-title"
              onKeyDown={(e) => {
                if (e.key !== "Tab") return;
                const items = Array.from(
                  e.currentTarget.querySelectorAll<HTMLElement>(
                    "button:not(:disabled),input:not([hidden]):not([type=hidden]),select,a[href],summary",
                  ),
                ).filter(item=>item.getClientRects().length>0);
                if (e.shiftKey && document.activeElement === items[0]) {
                  e.preventDefault();
                  items.at(-1)?.focus();
                } else if (
                  !e.shiftKey &&
                  document.activeElement === items.at(-1)
                ) {
                  e.preventDefault();
                  items[0]?.focus();
                }
              }}
            >
              <header>
                <div>
                  <small>TIPOGRAFÍA</small>
                  <h2 id="font-library-title">Biblioteca de fuentes</h2>
                </div>
                <button
                  aria-label="Cerrar fuentes"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </header>
              <p className="font-library-description">
                {
                  families.filter(
                    (f) => f.styles || f.file || f.value.startsWith("local-"),
                  ).length
                }{" "}
                familias incluidas. Vista previa y PDF utilizan los mismos archivos.
                Para tener toda la biblioteca sin conexión, usa «Instalar app».
              </p>
              <div className="font-search">
                <input
                  aria-label="Buscar fuentes"
                  placeholder="Busca por nombre…"
                  ref={searchInput}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  aria-label="Categoría de fuentes"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">Todas</option>
                  <option value="favorites">Favoritas</option>
                  <option value="recent">Usadas recientemente</option>
                  <option value="serif">Con remates · serif</option>
                  <option value="sans-serif">Sin remates · sans serif</option>
                  <option value="monospace">Monoespaciadas</option>
                  <option value="local">Mis fuentes</option>
                </select>
              </div>
              <div className="font-library-options">
              <button className="font-library-options-toggle" aria-expanded={libraryOptionsOpen} aria-controls={quickId+'-options'} onClick={()=>setLibraryOptionsOpen(value=>!value)}><span aria-hidden="true">{libraryOptionsOpen?'▾':'▸'}</span> Vista previa y fuentes del dispositivo</button>
              {libraryOptionsOpen&&<div className="font-library-options-body" id={quickId+'-options'}>
              <div className="font-preview-controls">
                <input
                  aria-label="Texto de vista previa de fuentes"
                  value={sample}
                  maxLength={160}
                  onChange={(e) => setSample(e.target.value)}
                />
                <label>
                  Tamaño{" "}
                  <input
                    aria-label="Tamaño de vista previa"
                    type="range"
                    min="16"
                    max="40"
                    value={previewSize}
                    onChange={(e) => setPreviewSize(Number(e.target.value))}
                  />
                  <output>{previewSize}</output>
                </label>
                <button
                  aria-label="Vista previa en negrita"
                  aria-pressed={bold}
                  onClick={() => setBold(!bold)}
                >
                  <b>B</b>
                </button>
                <button
                  aria-label="Vista previa en cursiva"
                  aria-pressed={italic}
                  onClick={() => setItalic(!italic)}
                >
                  <i>I</i>
                </button>
              </div>
              <div className="font-full-preview" style={{fontFamily:families.find(font=>font.value===preview)?.css,fontSize:previewSize,fontWeight:bold?700:400,fontStyle:italic?'italic':'normal'}}>{sample||'Aa Bb Cc · ÁÉÍÓÚ ñ 123'}</div>
              {onAcademicFont && <details className="essential-fonts">
                <summary>Fuentes para entregas académicas</summary>
                <p>
                  APA permite varias fuentes legibles. IEEE suele usar Times New
                  Roman según la plantilla. Estos accesos eligen alternativas
                  disponibles originales cuando se han leído en este dispositivo
                  o incluido en el proyecto; en su ausencia usan alternativas libres.
                </p>
                <div>
                  {essentials.map(([label, preferred, alternate]) => {
                    const original=label.split(' · ')[0];
                    const font = families.find(f=>f.value.startsWith('local-')&&normalizeFontName(f.label)===normalizeFontName(original)) ??
                      families.find((f) => f.value === preferred) ??
                      families.find((f) => f.label === alternate);
                    return font ? (
                      <button
                        key={label}
                        disabled={loading}
                        onClick={async() => {
                          setLoading(true);
                          try{
                          await prepareFont(font.value);
                          onAcademicFont(
                            font.value,
                            Number(label.match(/(\d+) pt/)?.[1] ?? 12),
                          );
                          setOpen(false);
                          button.current?.focus();
                          }catch(error){onError(error);}finally{setLoading(false);}
                        }}
                      >
                        {label}
                        <small>{font.value.startsWith('local-')?'Fuente del dispositivo':'Alternativa: '+font.label}</small>
                      </button>
                    ) : null;
                  })}
                </div>
                <p>
                  Aptos 12 pt y Lucida Sans Unicode 10 pt: importa tus archivos
                  autorizados. También puedes importar Arial, Calibri, Georgia y
                  Times New Roman.
                </p>
                <a
                  href="https://apastyle.apa.org/style-grammar-guidelines/paper-format/font"
                  target="_blank"
                  rel="noreferrer"
                >
                  Guía de fuentes APA
                </a>
              </details>}
              <details className="device-fonts-panel" open={installed.length>0}>
                <summary>Fuentes del dispositivo</summary>
                <p>Busca las fuentes instaladas en tu equipo o importa TTF / OTF y colecciones TTC. Se leen localmente.</p>
                <button disabled={loading} onClick={async()=>{
                  setLoading(true);setSourceMessage('');
                  try{const fonts=await listInstalledFonts();setInstalled(fonts);setSourceMessage(installedFamilies(fonts).length+' familias encontradas. Selecciona una para usarla.');}
                  catch(error){setSourceMessage(error instanceof DOMException&&error.name==='NotAllowedError'?'No se concedió permiso para leer las fuentes. Puedes volver a intentarlo o importar los archivos.':error instanceof Error?error.message:String(error));}
                  finally{setLoading(false);}
                }}>Buscar fuentes instaladas</button>
                {sourceMessage&&<p role="status">{sourceMessage}</p>}
                {installed.length>0&&<div className="device-fonts-list" aria-label="Fuentes instaladas" onScroll={event=>{const list=event.currentTarget;if(list.scrollTop+list.clientHeight>=list.scrollHeight-80)setInstalledLimit(limit=>Math.min(installedShown.length,limit+60));}}>{installedShown.slice(0,installedLimit).map(family=><button disabled={loading} key={family} style={{fontFamily:JSON.stringify(family)+',serif'}} onClick={async()=>{
                  setLoading(true);
                  try{const selected=await installedFontFiles(installed,family);if(onImport)await onImport(selected.files);else await importDeviceFonts(selected.files);onChange(selected.fonts[0].value);if(selected.warnings.length)setSourceMessage('Se aplicó '+family+'. Algunas variantes no están disponibles: '+selected.warnings.join(' · '));else{setOpen(false);setQuick(false);}}
                  catch(error){onError(error);}finally{setLoading(false);}
                }}>{family}</button>)}</div>}
                {installed.length>0&&<small>{installedShown.length} familias coinciden. Desplázate para verlas todas o usa el buscador. Solo se leen los archivos de la familia que selecciones.</small>}
              </details>
              </div>}
              </div>
              <div
                className="font-catalog font-catalog-list"
                role="group"
                aria-label="Fuentes disponibles"
                onScroll={event=>{const catalog=event.currentTarget;if(libraryViewport.compact&&catalog.scrollTop+catalog.clientHeight>=catalog.scrollHeight-80)setCatalogLimit(limit=>Math.min(shown.length,limit+20));}}
              >
                {(libraryViewport.compact?shown.slice(0,catalogLimit):shown).map((f) => (
                  <div
                    className={
                      "font-card " + (f.value === value ? "selected" : "")
                    }
                    key={f.value}
                  >
                    <button
                      key={f.value}
                      aria-label={"Usar " + f.label}
                      className={f.value === value ? "selected" : ""}
                      onClick={() => choose(f.value)}
                      onFocus={() => setPreview(f.value)}
                      onMouseEnter={() => setPreview(f.value)}
                    >
                      <strong style={{fontFamily:f.css}}>{f.label}</strong>
                      <span
                        style={{
                          fontFamily: f.css,
                          fontSize: previewSize,
                          fontWeight: bold ? 700 : 400,
                          fontStyle: italic ? "italic" : "normal",
                        }}
                      >
                        {sample || "Aa Bb Cc · ÁÉÍÓÚ ñ 123"}
                      </span>
                      <small>
                        {f.value.startsWith("local-")
                          ? (onImport?"Fuente personal · incluida en el proyecto":"Fuente personal · guardada en este dispositivo")
                          : aliases[f.value] ? 'Alternativa a '+aliases[f.value] : f.category === "serif"
                            ? "Serif"
                            : f.category === "monospace"
                              ? "Monoespaciada"
                              : "Sans serif"}
                      </small>
                    </button>
                    <button
                      className="font-favorite"
                      aria-label={
                        (favorites.includes(f.value)
                          ? "Quitar de favoritas "
                          : "Agregar a favoritas ") + f.label
                      }
                      aria-pressed={favorites.includes(f.value)}
                      onClick={() => {
                        const next = favorites.includes(f.value)
                          ? favorites.filter((v) => v !== f.value)
                          : [...favorites, f.value];
                        setFavorites(next);
                        writePreference("favorite-fonts", next);
                      }}
                    >
                      {favorites.includes(f.value) ? "★" : "☆"}
                    </button>
                  </div>
                ))}
                {!shown.length && <p>No hay fuentes con ese nombre.</p>}
              </div>
              <footer>
                <span className="font-result-count">
                  {shown.length} fuentes ·{" "}
                  {families.find((f) => f.value === preview)?.label ??
                    selected?.label}
                  <small>
                    Selecciona una fuente para aplicar. Las estrellas guardan
                    tus favoritas.
                  </small>
                </span>
                {<button
                  disabled={loading}
                  onClick={() => fileInput.current?.click()}
                >
                  {loading ? "Leyendo fuentes…" : "Importar TTF / OTF / TTC"}
                </button>}
                <small>{onImport?'Se guardan en este proyecto.':'Se guardan en este dispositivo.'} Sin subirlas a ningún servidor.</small>
              </footer>
              <input
                type="file"
                hidden
                multiple
                accept=".ttf,.otf,.ttc,.otc"
                ref={fileInput}
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  setLoading(true);
                  try {
                    if(onImport)await onImport(files);else await importDeviceFonts(files);
                  } catch (error) {
                    onError(error);
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
