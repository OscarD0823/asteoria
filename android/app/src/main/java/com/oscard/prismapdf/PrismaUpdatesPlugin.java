package com.oscard.prismapdf;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name="PrismaUpdates")
public class PrismaUpdatesPlugin extends Plugin {
  @PluginMethod public void openRelease(PluginCall call) {
    String url=call.getString("url", "");
    String kind=BuildConfig.FLAVOR;
    String[] kinds={"pdf","writer","sheets","slides","data","publisher","architecture","stories","prisma"};
    String[] slugs={"folio","scribe","orbit","nova","nexus","canvas","atlas","lore",""};
    String[] names={"Asteoria-Folio","Asteoria-Scribe","Asteoria-Orbit","Asteoria-Nova","Asteoria-Nexus","Asteoria-Canvas","Asteoria-Atlas","Asteoria-Lore","ASTEORIA"};
    int selected=-1;for(int i=0;i<kinds.length;i++)if(kinds[i].equals(kind))selected=i;
    if(selected<0){call.reject("Aplicación no válida.");return;}
    String slug="asteoria"+(slugs[selected].isEmpty()?"":"-"+slugs[selected]);
    String prefix="https://github.com/OscarD0823/"+slug+"/releases/download/v";
    if(!url.startsWith(prefix)){call.reject("Enlace de actualización no válido.");return;}
    String tail=url.substring(prefix.length());
    if(!tail.matches("[0-9]+[.][0-9]+[.][0-9]+/"+names[selected]+"-[0-9]+[.][0-9]+[.][0-9]+-Android[.]apk")){call.reject("Enlace de actualización no válido.");return;}
    try {getActivity().startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));call.resolve();}
    catch (Exception error) {call.reject("No se pudo abrir el navegador para descargar la actualización.");}
  }
}
