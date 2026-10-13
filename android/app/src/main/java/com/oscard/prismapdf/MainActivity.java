package com.oscard.prismapdf;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override public void onCreate(android.os.Bundle savedInstanceState){registerPlugin(PrismaPrintPlugin.class);registerPlugin(PrismaUpdatesPlugin.class);registerPlugin(PrismaSaveDocumentPlugin.class);super.onCreate(savedInstanceState);}
}
