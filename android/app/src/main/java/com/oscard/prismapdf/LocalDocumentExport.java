package com.oscard.prismapdf;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.Locale;

final class LocalDocumentExport {
  static File source(File cache, String uri) throws Exception {
    URI parsed=new URI(uri);
    if(!"file".equals(parsed.getScheme())||parsed.getAuthority()!=null)throw new IOException("Archivo local no válido.");
    File file=new File(parsed).getCanonicalFile();
    File root=new File(cache,"prisma-exports").getCanonicalFile();
    if(!root.equals(file.getParentFile())||!file.isFile()||file.length()>160L*1024*1024)throw new IOException("Archivo de exportación no válido.");
    return file;
  }
  static boolean localProvider(String authority){
    return "com.android.externalstorage.documents".equals(authority)||"com.android.providers.downloads.documents".equals(authority)||"com.android.providers.media.documents".equals(authority);
  }
  static String mimeFor(String name,String requested){
    // DocumentsProvider appends the registered extension for application/json.
    // Prisma projects need their own MIME type to retain the portable extension.
    return name.toLowerCase(Locale.ROOT).endsWith(".prisma")?"application/vnd.prisma.project+json":requested;
  }
}
