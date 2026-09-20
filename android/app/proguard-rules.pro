# ProGuard and R8 Rules for Release APK Build
# Free Music Player (Capacitor 8 Android)

# 1. Preserve Capacitor Core, Bridge, and Plugins
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.BridgeActivity { *; }
-keep public class * extends com.getcapacitor.BridgeFragment { *; }
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.PluginConfig { *; }
-keep class com.getcapacitor.PluginMethod { *; }
-keep class com.getcapacitor.JSObject { *; }
-keep class com.getcapacitor.JSArray { *; }
-dontwarn com.getcapacitor.**

# 2. Preserve JavaScript Interfaces for WebView Bridge
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 3. Preserve Annotations and Reflection Attributes
-keepattributes *Annotation*,EnclosingMethod,InnerClasses,Signature,Exceptions
-keepattributes SourceFile,LineNumberTable

# 4. Preserve AndroidX & Support Components
-keep class androidx.core.content.FileProvider { *; }
-keep class androidx.appcompat.** { *; }
-keep class androidx.webkit.** { *; }
-keep class androidx.coordinatorlayout.** { *; }
-keep class androidx.core.splashscreen.** { *; }
-dontwarn androidx.**

# 5. Cordova Plugin Compatibility
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# 6. Preserve Anti-Tamper & Signature Verification
-keep class com.freemusicplayer.app.security.** { *; }
-keepclassmembers class com.freemusicplayer.app.security.** {
    public static <methods>;
}
-keep class com.freemusicplayer.app.MainActivity { *; }

# 7. Remove Android Debug and Verbose Logs in Production (Retain Log.e and Log.w for error diagnostics)
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}
