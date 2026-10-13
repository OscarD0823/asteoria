package com.oscard.prismapdf;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;

@CapacitorPlugin(name="PrismaSaveDocument")
public class PrismaSaveDocumentPlugin extends Plugin {
  @PluginMethod public void save(PluginCall call){
    try{
      LocalDocumentExport.source(getContext().getCacheDir(),call.getString("source",""));
      String name=call.getString("name","Documento").replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]","-").trim();
      if(name.isEmpty()||name.length()>200)throw new IllegalArgumentException("Nombre de archivo no válido.");
      String mime=call.getString("mime","application/octet-stream");
      if(!mime.matches("[a-zA-Z0-9.+-]+/[a-zA-Z0-9.+-]+"))throw new IllegalArgumentException("Formato de archivo no válido.");
      Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(LocalDocumentExport.mimeFor(name,mime)).putExtra(Intent.EXTRA_TITLE,name);
      if(Build.VERSION.SDK_INT>=26)intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI,DocumentsContract.buildDocumentUri("com.android.externalstorage.documents","primary:Download"));
      getActivity().runOnUiThread(()->{
        try{startActivityForResult(call,intent,"savedDocument");}
        catch(Exception error){call.reject("No se pudo abrir el selector de carpetas: "+error.getMessage());}
      });
    }catch(Exception error){call.reject(error.getMessage());}
  }
  @ActivityCallback private void savedDocument(PluginCall call,ActivityResult result){
    if(call==null)return;
    final File source;
    try{source=LocalDocumentExport.source(getContext().getCacheDir(),call.getString("source",""));}
    catch(Exception error){call.reject(error.getMessage());return;}
    if(result.getResultCode()!=Activity.RESULT_OK||result.getData()==null||result.getData().getData()==null){source.delete();call.resolve(new JSObject().put("saved",false));return;}
    Uri destination=result.getData().getData();
    if(!"content".equals(destination.getScheme())||!LocalDocumentExport.localProvider(destination.getAuthority())){
      source.delete();call.reject("Elige una carpeta del dispositivo, como Descargas, para guardar tu documento localmente.");return;
    }
    new Thread(()->{
      try{
        try(FileInputStream input=new FileInputStream(source);OutputStream output=getContext().getContentResolver().openOutputStream(destination,"wt")){
          if(output==null)throw new IllegalStateException("No se pudo abrir el archivo de destino.");
          byte[] buffer=new byte[65536];int count;while((count=input.read(buffer))!=-1)output.write(buffer,0,count);
          output.flush();
        }
        call.resolve(new JSObject().put("saved",true));
      }catch(Exception error){call.reject("No se pudo guardar el documento: "+error.getMessage());}
      finally{source.delete();}
    },"PrismaSaveDocument").start();
  }
}
