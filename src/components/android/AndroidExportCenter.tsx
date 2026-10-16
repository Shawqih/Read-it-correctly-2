import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Terminal,
  FileCode,
  FolderTree,
  GitBranch,
  ShieldCheck,
  CheckCircle,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

export const AndroidExportCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'gradle' | 'ci_cd' | 'git_steps'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    audioEngine.playClickSound();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download all Android files as a build bundle script / instructions
  const downloadAndroidBundle = () => {
    const bundleContent = `# حزمة بناء تطبيق أندرويد الكامل: "أقرأها صح"
# المشرف العام: المهندس شوقي حسن الجعور
# Target SDK: 34 (Android 14) | Min SDK: 26 (Android 8.0)
# Architecture: MVVM + Clean Architecture (Kotlin + Jetpack Compose)

1. استنسخ المستودع أو افتح المشروع في Android Studio:
   git clone https://github.com/USERNAME/aqraha-sah-android.git

2. بناء نسخة تجريبية Debug APK:
   ./gradlew assembleDebug

3. بناء نسخة النشر النهائية المعززة والموقعة Release APK:
   ./gradlew assembleRelease

4. مسار ملف الـ APK النهائي الجاهز للتثبيت على الهواتف والأجهزة اللوحية:
   app/build/outputs/apk/release/app-release-unsigned.apk
`;

    const blob = new Blob([bundleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'اقراها_صح_دليل_بناء_APK_أندرويد.txt';
    link.click();
    URL.revokeObjectURL(url);
    audioEngine.playSuccessSound();
  };

  const ANDROID_GRADLE_CODE = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.aqraha.sah"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.aqraha.sah"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Jetpack Compose & Material 3 (Arabic RTL Support)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)

    // Navigation & Coroutines
    implementation(libs.androidx.navigation.compose)
    implementation(libs.kotlinx.coroutines.android)

    // Room Database (Offline Storage)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    kapt(libs.androidx.room.compiler)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    kapt(libs.hilt.compiler)

    // Retrofit + OkHttp
    implementation(libs.retrofit)
    implementation(libs.converter.gson)

    // Security (EncryptedSharedPreferences)
    implementation(libs.androidx.security.crypto)

    // Paging 3 for long stories library
    implementation(libs.androidx.paging.compose)
}`;

  const KOTLIN_ARCHITECTURE_CODE = `// ==========================================
// 1. Data Layer: Resource Sealed Class (معالجة الأخطاء)
// ==========================================
package com.aqraha.sah.domain.model

sealed class Resource<T>(val data: T? = null, val message: String? = null) {
    class Success<T>(data: T) : Resource<T>(data)
    class Error<T>(message: String, data: T? = null) : Resource<T>(data, message)
    class Loading<T>(val isLoading: Boolean = true) : Resource<T>(null)
}

// ==========================================
// 2. Domain Layer: Clean Architecture Use Case
// ==========================================
package com.aqraha.sah.domain.usecase

import com.aqraha.sah.domain.repository.AqrahaRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetAlphabetLettersUseCase @Inject constructor(
    private val repository: AqrahaRepository
) {
    operator fun invoke(): Flow<Resource<List<AlphabetLetter>>> {
        return repository.getAlphabetLetters()
    }
}

// ==========================================
// 3. Presentation Layer: Jetpack Compose UI (Arabic RTL)
// ==========================================
package com.aqraha.sah.presentation.ui

import androidx.compose.runtime.*
import androidx.compose.material3.*
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun AlphabetScreen(
    viewModel: AlphabetViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = { Text("أقرأها صح - ركن الحروف الهجائية") }
                )
            }
        ) { padding ->
            // Canvas Tracing & Vowel Pronunciation List
        }
    }
}`;

  const GITHUB_ACTIONS_WORKFLOW = `name: Android CI & APK Build
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: gradle

    - name: Grant execute permission for gradlew
      run: chmod +x gradlew

    - name: Run Unit Tests
      run: ./gradlew test

    - name: Build Debug & Release APK
      run: ./gradlew assembleRelease

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: aqraha-sah-release-apk
        path: app/build/outputs/apk/release/`;

  const GIT_TERMINAL_COMMANDS = `# 1. تهيئة المستودع
git init

# 2. إضافة كافة الملفات
git add .

# 3. حفظ الالتزام الأول
git commit -m "Initial commit: أقرأها صح - Android Professional App بإشراف م. شوقي حسن الجعور"

# 4. تعيين الفرع الرئيسي
git branch -M main

# 5. ربط المستودع البعيد على GitHub
git remote add origin https://github.com/[YOUR-USERNAME]/aqraha-sah-android.git

# 6. دفع الكود إلى GitHub
git push -u origin main`;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-sky-700 dark:from-teal-900 dark:via-emerald-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-bold text-teal-200 mb-3 border border-white/20">
            <Smartphone className="w-4 h-4 text-teal-300" />
            <span>مركز تصدير تطبيق أندرويد حقيقي (APK) وتكامل GitHub</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
            هَيْكَلَةُ أَنْدْرُوِيد الْاحْتِرَافِيَّةُ (MVVM + CLEAN ARCHITECTURE)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-teal-100 dark:text-teal-200 leading-relaxed max-w-2xl">
            كود أندرويد متكامل بلغة Kotlin مع Jetpack Compose، وRoom Database للتخزين المحلي دون إنترنت، وحقن التبعيات بـ Hilt وسير عمل GitHub Actions لبناء ملف الـ APK.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'architecture', label: 'هيكلة Clean Architecture', icon: <FolderTree className="w-4 h-4" /> },
              { id: 'gradle', label: 'ملف build.gradle.kts', icon: <FileCode className="w-4 h-4" /> },
              { id: 'ci_cd', label: 'سير عمل CI/CD (APK)', icon: <GitBranch className="w-4 h-4" /> },
              { id: 'git_steps', label: 'أوامر Git و GitHub', icon: <Terminal className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  audioEngine.playClickSound();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={downloadAndroidBundle}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل حزمة بناء APK</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                هيكلة الحزم في تطبيق Kotlin (MVVM + Clean Architecture):
              </span>
              <button
                onClick={() => copyToClipboard(KOTLIN_ARCHITECTURE_CODE, 'arch')}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                {copiedKey === 'arch' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'arch' ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="font-black text-blue-700 dark:text-blue-400 block mb-1">app/data/</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Room Database (AqrahaDatabase, LetterDao, StoryDao)، ومستودع البيانات، والتشفير بـ EncryptedSharedPreferences.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="font-black text-emerald-700 dark:text-emerald-400 block mb-1">app/domain/</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  نماذج الكيانات (AlphabetLetter, Lesson)، وحالات الاستخدام (GetAlphabetLettersUseCase, SubmitQuizUseCase).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="font-black text-purple-700 dark:text-purple-400 block mb-1">app/presentation/</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  واجهات Jetpack Compose بـ Material 3 ودعم RTL كامل للغة العربية مع ViewModels مدعومة بـ StateFlow.
                </p>
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto text-left dir-ltr leading-relaxed">
              <code>{KOTLIN_ARCHITECTURE_CODE}</code>
            </pre>
          </div>
        )}

        {activeTab === 'gradle' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                app/build.gradle.kts (Target SDK 34, Min SDK 26, Compose, Room, Hilt):
              </span>
              <button
                onClick={() => copyToClipboard(ANDROID_GRADLE_CODE, 'gradle')}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                {copiedKey === 'gradle' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'gradle' ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto text-left dir-ltr leading-relaxed">
              <code>{ANDROID_GRADLE_CODE}</code>
            </pre>
          </div>
        )}

        {activeTab === 'ci_cd' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                .github/workflows/android.yml (بناء تلقائي للـ APK عند الدفع في GitHub):
              </span>
              <button
                onClick={() => copyToClipboard(GITHUB_ACTIONS_WORKFLOW, 'ci')}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                {copiedKey === 'ci' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ci' ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto text-left dir-ltr leading-relaxed">
              <code>{GITHUB_ACTIONS_WORKFLOW}</code>
            </pre>
          </div>
        )}

        {activeTab === 'git_steps' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                خطوات الربط والدفع إلى مستودع GitHub:
              </span>
              <button
                onClick={() => copyToClipboard(GIT_TERMINAL_COMMANDS, 'git')}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                {copiedKey === 'git' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'git' ? 'تم النسخ!' : 'نسخ الأوامر'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto text-left dir-ltr leading-relaxed">
              <code>{GIT_TERMINAL_COMMANDS}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
