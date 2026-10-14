import {lazy, Suspense} from 'react';
import {product} from './product';
const architecture = product.kind === 'prisma' && new URLSearchParams(location.search).get('editor') === 'arquitectura';
const Current=lazy(()=>architecture?import('./architecture/entry'):product.kind==='prisma'?import('./Prisma'):product.data?import('@prisma/data/entry'):product.publisher?import('@prisma/publisher/entry'):product.slides?import('@prisma/slides/entry'):product.sheets?import('@prisma/sheets/entry'):product.writer?import('@prisma/writer/entry'):import('@prisma/pdf/entry'));
export default function PrismaRouter(){return <Suspense fallback={<div className="sheets-busy">Abriendo {product.name}…</div>}><Current/></Suspense>;}
