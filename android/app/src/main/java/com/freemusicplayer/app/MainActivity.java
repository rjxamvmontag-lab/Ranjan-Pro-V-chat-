package com.freemusicplayer.app;

import android.os.Bundle;
import com.freemusicplayer.app.security.SecurityGuard;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Enforce APK integrity and signature verification before initializing Bridge
        SecurityGuard.verifyIntegrityOrTerminate(this);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        // Periodic verification on app resume against runtime debugger attachment or hooking
        SecurityGuard.verifyIntegrityOrTerminate(this);
    }
}
