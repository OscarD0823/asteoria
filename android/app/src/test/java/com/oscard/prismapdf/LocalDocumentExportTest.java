package com.oscard.prismapdf;

import org.junit.Test;
import static org.junit.Assert.*;
import java.io.File;
import java.nio.file.Files;

public class LocalDocumentExportTest {
  @Test public void exportedCacheFileCanBeCopied() throws Exception {
    File cache=Files.createTempDirectory("prisma-export-test").toFile();
    try{
      File root=new File(cache,"prisma-exports");assertTrue(root.mkdir());
      File source=new File(root,"Documento.prisma");Files.write(source.toPath(),new byte[]{1,2,3});
      assertEquals(source.getCanonicalFile(),LocalDocumentExport.source(cache,source.toURI().toString()));
    }finally{remove(cache);}
  }
  @Test public void anotherAppFileCannotBeExported() throws Exception {
    File cache=Files.createTempDirectory("prisma-export-test").toFile();
    try{
      File source=new File(cache,"preferences.json");Files.write(source.toPath(),new byte[]{1});
      assertThrows(Exception.class,()->LocalDocumentExport.source(cache,source.toURI().toString()));
    }finally{remove(cache);}
  }
  @Test public void remoteSourcesAreRejected() throws Exception {
    assertThrows(Exception.class,()->LocalDocumentExport.source(new File("cache"),"https://example.invalid/file.prisma"));
  }
  @Test public void destinationsMustBeOnTheDevice(){
    assertTrue(LocalDocumentExport.localProvider("com.android.providers.downloads.documents"));
    assertTrue(LocalDocumentExport.localProvider("com.android.externalstorage.documents"));
    assertFalse(LocalDocumentExport.localProvider("com.google.android.apps.docs.storage"));
    assertFalse(LocalDocumentExport.localProvider(null));
  }
  private static void remove(File file) throws Exception {
    if(file.isDirectory())for(File child:file.listFiles())remove(child);
    Files.deleteIfExists(file.toPath());
  }
}
