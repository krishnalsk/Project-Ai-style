package com.example.best3.data.remote

import com.example.best3.BuildConfig
import android.util.Log
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

object AiAssistantManager {
    private const val BASE_URL = "https://openrouter.ai/api/v1/"
    private val API_KEY = BuildConfig.OPENROUTER_API_KEY
    
    private val MODELS = listOf(
        "anthropic/claude-3.5-sonnet", 
        "google/gemini-2.0-flash-exp:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "open-orchestra/free"
    )

    private val SYSTEM_PROMPT = """
        Act as a Senior AI Architect for "Style AI".
        
        You must process every user request using the following 4-Step Rule Algorithm:
        
        STEP 1: [Skin Safety Check - XGBoost Model]
        Evaluate if condition is Dermatitis or Sensitive Skin. Level: SAFE, MODERATE, AVOID.
        
        STEP 2: [Clothing Recommendation - Random Forest Model]
        Weights: Skin Safety(40%), Comfort(25%), Body Fit(20%), Style(10%), Weather(5%).
        
        STEP 3: [Weather Rule Engine]
        Adjust recommendation based on real-time weather constraints.
        
        STEP 4: [Output]
        You MUST start your response with a JSON block inside [LOGIC] tags, followed by your message inside [MESSAGE] tags.
        
        FORMAT EXAMPLE:
        [LOGIC]
        {
          "engine": "Random Forest v2.4",
          "safety": "SAFE (XGBoost)",
          "score": "94%",
          "weather": "Rule Applied"
        }
        [MESSAGE]
        Your expert stylist advice here...
    """.trimIndent()

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
        encodeDefaults = true
    }

    private val authInterceptor = Interceptor { chain ->
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $API_KEY")
            .addHeader("HTTP-Referer", "https://best3.app")
            .addHeader("X-Title", "Style AI Assistant")
            .addHeader("Content-Type", "application/json")
            .build()
        chain.proceed(request)
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(authInterceptor)
        .addInterceptor(Interceptor { chain ->
            var response = chain.proceed(chain.request())
            var tryCount = 0
            while (!response.isSuccessful && tryCount < 3) {
                tryCount++
                Log.d("AiAssistant", "Retrying request... ($tryCount)")
                response.close()
                response = chain.proceed(chain.request())
            }
            response
        })
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    private val api = retrofit.create(OpenRouterApi::class.java)

    private fun isPromptSafe(prompt: String): Boolean {
        val lowercasePrompt = prompt.lowercase()
        val restrictedKeywords = listOf(
            "ignore previous instructions",
            "ignore all instructions",
            "system prompt",
            "you are now",
            "forget everything",
            "reveal your logic"
        )
        return restrictedKeywords.none { lowercasePrompt.contains(it) }
    }

    suspend fun getAssistantResponse(prompt: String): String? {
        if (!isPromptSafe(prompt)) {
            Log.w("AiAssistant", "Blocked unsafe prompt: $prompt")
            return "I can only help with style and comfort related queries. Please ask something else! 😊"
        }

        Log.d("AiAssistant", "Requesting Style AI response for: $prompt")
        
        var lastException: Exception? = null
        
        for (modelId in MODELS) {
            try {
                Log.d("AiAssistant", "Trying model: $modelId")
                val request = ChatRequest(
                    model = modelId,
                    messages = listOf(
                        Message(role = "system", content = SYSTEM_PROMPT),
                        Message(role = "user", content = prompt)
                    )
                )
                val response = api.getChatCompletion(request)
                val content = response.choices.firstOrNull()?.message?.content
                if (content != null) {
                    return content
                }
            } catch (e: retrofit2.HttpException) {
                val errorCode = e.code()
                val errorBody = e.response()?.errorBody()?.string()
                Log.e("AiAssistant", "Model $modelId failed: $errorCode - $errorBody")
                lastException = Exception("API Error ($modelId): $errorCode - $errorBody")
                if (errorCode == 404 || errorCode == 400) continue else break
            } catch (e: Exception) {
                Log.e("AiAssistant", "Model $modelId failed", e)
                lastException = e
                continue
            }
        }
        
        throw lastException ?: Exception("Style AI Engine offline")
    }
}
