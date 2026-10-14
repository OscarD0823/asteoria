package com.oscard.prismapdf;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayDeque;
@CapacitorPlugin(name="AsteoriaOpenDocument")
public class AsteoriaOpenDocumentPlugin extends Plugin {
  private final ArrayDeque<Uri> pending=new ArrayDeque<>();
  @Override public void load(){enqueue(getActivity().getIntent());}
  @Override protected void handleOnNewIntent(Intent intent){enqueue(intent);}
  private synchronized void enqueue(Intent intent){
    if(intent==null)return;Uri uri=null;
    if(Intent.ACTION_VIEW.equals(intent.getAction())||Intent.ACTION_EDIT.equals(intent.getAction()))uri=intent.getData();
    else if(Intent.ACTION_SEND.equals(intent.getAction()))uri=intent.getParcelableExtra(Intent.EXTRA_STREAM);
    if(uri==null||!"content".equals(uri.getScheme())||pending.size()>=20)return;
    pending.add(uri);notifyListeners("available",new JSObject(),true);
  }
  @PluginMethod public void take(PluginCall call){
    final Uri uri; synchronized(this){uri=pending.poll();}
    if(uri==null){call.resolve(new JSObject());return;}
    getBridge().execute(()->{
      try{
        String name="Documento";
        try(Cursor cursor=getContext().getContentResolver().query(uri,new String[]{OpenableColumns.DISPLAY_NAME,OpenableColumns.SIZE},null,null,null)){
          if(cursor!=null&&cursor.moveToFirst()){
            int column=cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);if(column>=0)name=cursor.getString(column);
            int size=cursor.getColumnIndex(OpenableColumns.SIZE);if(size>=0&&!cursor.isNull(size)&&cursor.getLong(size)>100L*1024*1024)throw new IllegalArgumentException("Abre documentos de hasta 100 MB en Android.");
          }
        }
        if(name==null||name.length()>500)throw new IllegalArgumentException("Nombre del documento no válido.");
        name=name.replaceAll("[\\\\/\\p{Cntrl}]","_");
        ByteArrayOutputStream bytes=new ByteArrayOutputStream();
        try(InputStream input=getContext().getContentResolver().openInputStream(uri)){
          if(input==null)throw new IllegalArgumentException("El documento ya no está disponible.");
          byte[] chunk=new byte[65536];int count;
          while((count=input.read(chunk))!=-1){if(bytes.size()+count>100L*1024*1024)throw new IllegalArgumentException("Abre documentos de hasta 100 MB en Android.");bytes.write(chunk,0,count);}
        }
        call.resolve(new JSObject().put("name",name).put("base64",Base64.encodeToString(bytes.toByteArray(),Base64.NO_WRAP)));
      }catch(Exception error){call.reject("No se pudo abrir el documento: "+error.getMessage());}
    });
  }
}
