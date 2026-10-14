import {lazy, Suspense} from 'react';
import {product} from './product';
const Current=lazy(()=>product.kind==='architecture'?import('@prisma/architecture/entry'):product.kind==='stories'?import('@prisma/stories/entry'):product.kind==='prisma'?import('./Prisma'):product.data?import('@prisma/data/entry'):product.publisher?import('@prisma/publisher/entry'):product.slides?import('@prisma/slides/entry'):product.sheets?import('@prisma/sheets/entry'):product.writer?import('@prisma/writer/entry'):import('@prisma/pdf/entry'));
export default function PrismaRouter(){return <Suspense fallback={<div className="sheets-busy">Abriendo {product.name}…</div>}><Current/></Suspense>;}
