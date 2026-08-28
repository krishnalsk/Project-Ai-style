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
    private const val TAG = "AiAssistant"
    private const val BASE_URL = "https://openrouter.ai/api/v1/"
    private val API_KEY = BuildConfig.OPENROUTER_API_KEY

    // Input Validation Constants
    private const val MAX_PROMPT_LENGTH = 2000
    private const val MIN_PROMPT_LENGTH = 2
    private const val MAX_RETRIES = 3
    private const val BASE_RETRY_DELAY_MS = 1000L

    private val MODELS = listOf(
        "anthropic/claude-3.5-sonnet",
        "google/gemini-2.0-flash-exp:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "open-orchestra/free"
    )

    private val SYSTEM_PROMPT = """
        Act as a Senior AI Architect for "Style AI".
        
        USE THE PROVIDED CONTEXT TO ANSWER. If the context contains specific fabric details or products, prioritize them in your advice.
        
        You must process every user request using the following 4-Step Rule Algorithm:
        
        STEP 1: [Skin Safety Check - XGBoost Model]
        Evaluate if condition is Dermatitis or Sensitive Skin. Level: SAFE, MODERATE, AVOID.
        
        STEP 2: [Clothing Recommendation - Random Forest Model]
        Weights: Skin Safety(40%), Comfort(25%), Body Fit(20%), Style(10%), Weather(5%).
        
        STEP 3: [Weather Rule Engine]
        Adjust recommendation based on real-time weather constraints.
        
        STEP 4: [Output]
        You MUST start your response with a JSON block inside [LOGIC] tags, followed by your message inside [MESSAGE] tags.
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
            while (!response.isSuccessful && tryCount < MAX_RETRIES) {
                val statusCode = response.code
                // Don't retry on client errors (4xx) except 429 (rate limit)
                if (statusCode in 400..499 && statusCode != 429) {
                    break
                }
                tryCount++
                val delayMs = BASE_RETRY_DELAY_MS * tryCount // Linear backoff
                Log.d(TAG, "Retrying request in ${delayMs}ms... ($tryCount/$MAX_RETRIES)")
                response.close()
                Thread.sleep(delayMs)
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
        val lowercasePrompt = prompt.lowercase().trim()
        val restrictedPatterns = listOf(
            "ignore previous instructions",
            "ignore all instructions",
            "ignore any instructions",
            "system prompt",
            "you are now",
            "forget everything",
            "reveal your logic",
            "reveal your system",
            "what are your instructions",
            "repeat after me"
        )
        return restrictedPatterns.none { lowercasePrompt.contains(it) }
    }

    /**
     * Get AI assistant response with model fallback and retry logic.
     * Returns Result<String?> to match FirebaseManager pattern for consistency.
     */
    suspend fun getAssistantResponse(prompt: String, context: String = ""): Result<String?> {
        // 1. Pre-validation (Length check)
        if (prompt.isBlank() || prompt.trim().length < MIN_PROMPT_LENGTH) {
            return Result.success("Your request is too short. Please tell me more about what you're looking for!")
        }

        if (prompt.length > MAX_PROMPT_LENGTH) {
            return Result.success("Your request is quite long (${prompt.length} chars). To provide the best advice, please keep it under $MAX_PROMPT_LENGTH characters.")
        }

        // 2. Sanitization
        val cleanedPrompt = prompt.trim()
            .replace(Regex("[\\p{Cntrl}&&[^\r\n\t]]"), "")

        // 3. Prompt Injection Check
        if (!isPromptSafe(cleanedPrompt)) {
            return Result.success("I can only help with style and comfort related queries. Please ask something else!")
        }

        // 4. Combine Prompt with Context (The RAG Core)
        val finalUserMessage = if (context.isNotEmpty()) {
            "CONTEXT FROM KNOWLEDGE BASE:\n$context\n\nUSER QUESTION: $cleanedPrompt"
        } else {
            cleanedPrompt
        }

        // Log redacted prompt (no user data in production logs)
        Log.d(TAG, "Requesting Style AI response (${cleanedPrompt.length} chars)")

        var lastException: Exception? = null

        for (modelId in MODELS) {
            try {
                Log.d(TAG, "Trying model: $modelId")
                val request = ChatRequest(
                    model = modelId,
                    messages = listOf(
                        Message(role = "system", content = SYSTEM_PROMPT),
                        Message(role = "user", content = finalUserMessage)
                    )
                )
                val response = api.getChatCompletion(request)
                val content = response.choices.firstOrNull()?.message?.content
                if (content != null) {
                    return Result.success(content)
                }
            } catch (e: retrofit2.HttpException) {
                val errorCode = e.code()
                Log.e(TAG, "Model $modelId failed with HTTP $errorCode")
                lastException = Exception("API Error ($modelId): $errorCode")
                // Don't retry on 4xx except 429
                if (errorCode in 400..499 && errorCode != 429) continue else break
            } catch (e: Exception) {
                Log.e(TAG, "Model $modelId failed", e)
                lastException = e
                continue
            }
        }

        return Result.failure(lastException ?: Exception("Style AI Engine offline"))
    }
}
