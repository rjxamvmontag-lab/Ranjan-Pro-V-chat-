package com.freemusicplayer.app.security;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.os.Build;
import android.os.Debug;
import android.os.Process;
import android.util.Log;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Enterprise-grade anti-tamper and APK signature verification module.
 * 
 * Verifies that the APK has not been decompiled, modified, injected with
 * malicious payload, or re-signed with an unauthorized developer certificate.
 */
public final class SecurityGuard {

    private static final String TAG = "SecurityGuard";

    // Expected official package name
    private static final String EXPECTED_PACKAGE_NAME = "com.freemusicplayer.app";

    /**
     * AUTHORIZED RELEASE SIGNATURE FINGERPRINTS (SHA-256).
     * 
     * Official release keystore fingerprint (generated and configured at system level).
     * Any APK signed with another key will be detected as tampered and will immediately exit.
     */
    private static final String[] AUTHORIZED_SIGNATURES_SHA256 = {
        "B1:E1:4E:A2:FB:49:AB:F5:CA:F5:23:F3:5F:8C:E9:C7:D8:6F:00:83:84:8B:82:E0:4E:90:1C:E7:E5:94:CA:83"
    };

    private SecurityGuard() {
        // Prevent instantiation
    }

    /**
     * Runs full integrity and anti-tamper verification.
     * If tampering or signature mismatch is detected in production, terminates process immediately.
     */
    public static void verifyIntegrityOrTerminate(Context context) {
        if (context == null) {
            terminateProcess("Invalid application context");
            return;
        }

        boolean isDebuggable = isAppDebuggable(context);

        // 1. Package Name Validation (Anti-Repackaging)
        String actualPackage = context.getPackageName();
        if (!EXPECTED_PACKAGE_NAME.equals(actualPackage)) {
            Log.e(TAG, "Package name mismatch! Expected: " + EXPECTED_PACKAGE_NAME + ", Actual: " + actualPackage);
            terminateProcess("Package integrity violation");
            return;
        }

        // 2. Anti-Debugging Check in Production
        if (!isDebuggable) {
            if (Debug.isDebuggerConnected() || Debug.waitingForDebugger()) {
                Log.e(TAG, "Unauthorized debugger detected attached to release build.");
                terminateProcess("Debugger violation");
                return;
            }
        }

        // 3. Signature & Certificate Hash Extraction
        List<String> actualSignatureHashes = getAppCertificateSHA256(context);
        if (actualSignatureHashes.isEmpty()) {
            terminateProcess("Failed to retrieve APK signature certificate");
            return;
        }

        // In Debug builds: log current signature fingerprint for developer convenience
        if (isDebuggable) {
            for (String hash : actualSignatureHashes) {
                Log.i(TAG, "[DEV NOTICE] Debug mode active. Current APK SHA-256: " + formatWithColons(hash));
            }
            return; // Allow developer iteration in debug mode
        }

        // In Release builds: enforce exact signature match against authorized release keys
        boolean isSignatureAuthorized = false;
        for (String actualHash : actualSignatureHashes) {
            for (String authorizedHash : AUTHORIZED_SIGNATURES_SHA256) {
                String cleanAuthorized = normalizeHash(authorizedHash);
                // Allow default placeholder to pass gracefully during local unsigned testing if needed,
                // but enforce strictly once a real SHA-256 is populated
                if ("RELEASE_SIGNING_KEY_SHA256_FINGERPRINT_PLACEHOLDER".equals(cleanAuthorized)) {
                    isSignatureAuthorized = true;
                    Log.w(TAG, "Production signature placeholder detected. Populate AUTHORIZED_SIGNATURES_SHA256 with production key SHA-256.");
                    break;
                }
                if (cleanAuthorized.equalsIgnoreCase(actualHash)) {
                    isSignatureAuthorized = true;
                    break;
                }
            }
            if (isSignatureAuthorized) {
                break;
            }
        }

        if (!isSignatureAuthorized) {
            Log.e(TAG, "CRITICAL SECURITY BREACH: APK signature does not match authorized certificate!");
            terminateProcess("Signature verification failed. APK has been tampered with.");
        }
    }

    /**
     * Extracts SHA-256 hashes of all signing certificates.
     */
    public static List<String> getAppCertificateSHA256(Context context) {
        List<String> hashes = new ArrayList<>();
        try {
            PackageManager pm = context.getPackageManager();
            String packageName = context.getPackageName();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                PackageInfo packageInfo = pm.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES);
                if (packageInfo != null && packageInfo.signingInfo != null) {
                    SigningInfo signingInfo = packageInfo.signingInfo;
                    Signature[] signatures = signingInfo.hasMultipleSigners()
                            ? signingInfo.getApkContentsSigners()
                            : signingInfo.getSigningCertificateHistory();

                    if (signatures != null) {
                        for (Signature sig : signatures) {
                            String hash = computeSHA256(sig.toByteArray());
                            if (hash != null) {
                                hashes.add(normalizeHash(hash));
                            }
                        }
                    }
                }
            } else {
                @SuppressWarnings("deprecation")
                PackageInfo packageInfo = pm.getPackageInfo(packageName, PackageManager.GET_SIGNATURES);
                if (packageInfo != null && packageInfo.signatures != null) {
                    for (Signature sig : packageInfo.signatures) {
                        String hash = computeSHA256(sig.toByteArray());
                        if (hash != null) {
                            hashes.add(normalizeHash(hash));
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error calculating certificate SHA-256", e);
        }
        return hashes;
    }

    /**
     * Calculates SHA-256 hash of a byte array and returns uppercase hex.
     */
    private static String computeSHA256(byte[] data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(data);
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format(Locale.US, "%02X", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            Log.e(TAG, "SHA-256 algorithm unavailable", e);
            return null;
        }
    }

    /**
     * Removes colons, spaces, and standardizes to uppercase.
     */
    private static String normalizeHash(String hash) {
        if (hash == null) return "";
        return hash.replace(":", "").replace(" ", "").trim().toUpperCase(Locale.US);
    }

    /**
     * Formats hex string into colon-delimited format (e.g. AA:BB:CC...).
     */
    private static String formatWithColons(String hash) {
        if (hash == null || hash.length() % 2 != 0) return hash;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < hash.length(); i += 2) {
            if (i > 0) sb.append(":");
            sb.append(hash.substring(i, i + 2));
        }
        return sb.toString();
    }

    /**
     * Checks if the app is currently running in debug mode.
     */
    private static boolean isAppDebuggable(Context context) {
        try {
            return (context.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Terminates process immediately to prevent execution of unauthorized code.
     */
    private static void terminateProcess(String reason) {
        Log.e(TAG, "TERMINATING APPLICATION: " + reason);
        try {
            Process.killProcess(Process.myPid());
        } finally {
            System.exit(137);
        }
    }
}
