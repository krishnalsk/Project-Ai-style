package com.example.best3.ui.chat

import android.util.Log
import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.best3.data.remote.AiAssistantManager
import kotlinx.coroutines.launch

class AiStylistViewModel : ViewModel() {
    val messages = mutableStateListOf(
        ChatMessage(
            text = "Hello! 👋 Welcome to Style AI. How can I help you with fashion, comfort, or clothing recommendations today?",
            isAi = true
        )
    )

    fun sendMessage(text: String) {
        if (text.isBlank()) return
        
        messages.add(ChatMessage(text, false))
        
        val loadingMessage = ChatMessage("Style AI is thinking...", true, isLoading = true)
        messages.add(loadingMessage)
        
        viewModelScope.launch {
            try {
                // 1. Try Precise Rule-Based Logic first for instant response
                val ruleResponse = getAssistantRuleResponse(text)
                
                if (ruleResponse != null) {
                    messages.remove(loadingMessage)
                    messages.add(ChatMessage(ruleResponse, true))
                } else {
                    // 2. Fallback to Real AI Assistant (OpenRouter/Claude/Gemini)
                    val aiResponse = AiAssistantManager.getAssistantResponse(text)
                    messages.remove(loadingMessage)
                    
                    if (aiResponse != null) {
                        // Extract message from [LOGIC]...[MESSAGE] format if present
                        val cleanResponse = if (aiResponse.contains("[MESSAGE]")) {
                            aiResponse.substringAfter("[MESSAGE]").trim()
                        } else {
                            aiResponse
                        }
                        messages.add(ChatMessage(cleanResponse, true))
                    } else {
                        // Final Fallback for unknown questions
                        val fallbackResponse = """
                            I'd be happy to help. 😊
    
                            Please provide:
                            • Skin Condition
                            • Height and Weight
                            • Clothing Size
                            • Preferred Style
                            • Occasion
                            • Weather or Location
    
                            Once I have this information, I'll provide personalized recommendations with comfort score, skin safety score, and outfit suggestions.
                        """.trimIndent()
                        messages.add(ChatMessage(fallbackResponse, true))
                    }
                }
            } catch (e: Exception) {
                Log.e("AiStylistVM", "Error", e)
                messages.remove(loadingMessage)
                messages.add(ChatMessage("I'm having trouble connecting right now. Please try again! 😊", true))
            }
        }
    }

    private fun getAssistantRuleResponse(input: String): String? {
        val query = input.lowercase().trim()
        
        return when {
            // --- CORE RULE MATCHING ---
            query.contains("sensitive skin wear") -> """
                Recommendation: Cotton oversized T-shirt, loose-fit cotton pants, breathable sneakers.
                Why: Soft breathable fabrics help reduce irritation.
                Comfort Score: 96%
                Skin Safety Score: 98%
            """.trimIndent()

            query.contains("best fabric for dermatitis") -> """
                Recommendation: Organic Cotton, Bamboo Fabric, Linen.
                Why: These fabrics are soft, breathable, and skin-friendly.
                Comfort Score: 95%
                Skin Safety Score: 99%
            """.trimIndent()

            query.contains("korean casual outfit") -> """
                Recommendation: Oversized beige shirt, relaxed-fit trousers, white sneakers.
                Why: Comfortable and inspired by modern Korean fashion.
                Comfort Score: 94%
                Skin Safety Score: 96%
            """.trimIndent()

            query.contains("summer outfit") -> """
                Recommendation: Linen shirt, cotton shorts, lightweight sneakers.
                Why: Helps keep the body cool and comfortable.
                Comfort Score: 97%
                Skin Safety Score: 95%
            """.trimIndent()

            query.contains("winter outfit") -> """
                Recommendation: Cotton thermal wear, fleece jacket, relaxed pants.
                Why: Provides warmth while maintaining comfort.
                Comfort Score: 93%
                Skin Safety Score: 95%
            """.trimIndent()

            query.contains("rainy season outfit") -> """
                Recommendation: Quick-dry T-shirt, lightweight jacket, waterproof shoes.
                Why: Suitable for humid and wet weather.
                Comfort Score: 94%
                Skin Safety Score: 92%
            """.trimIndent()

            query.contains("office formal outfit") -> """
                Recommendation: Cotton formal shirt, lightweight trousers, formal loafers.
                Why: Professional appearance with all-day comfort.
                Comfort Score: 92%
                Skin Safety Score: 94%
            """.trimIndent()

            query.contains("college casual outfit") -> """
                Recommendation: Cotton graphic T-shirt, joggers, sneakers.
                Why: Comfortable for classes and daily activities.
                Comfort Score: 95%
                Skin Safety Score: 96%
            """.trimIndent()

            query.contains("party wear recommendation") -> """
                Recommendation: Slim-fit cotton shirt, dark chinos, loafers.
                Why: Stylish and comfortable.
                Comfort Score: 90%
                Skin Safety Score: 92%
            """.trimIndent()

            query.contains("wedding outfit suggestion") -> """
                Recommendation: Breathable ethnic kurta set or formal suit with cotton lining.
                Why: Elegant and suitable for long events.
                Comfort Score: 91%
                Skin Safety Score: 93%
            """.trimIndent()

            query.contains("travel outfit recommendation") -> """
                Recommendation: Stretch cotton T-shirt, joggers, lightweight jacket.
                Why: Comfortable for long journeys.
                Comfort Score: 97%
                Skin Safety Score: 95%
            """.trimIndent()

            query.contains("gym outfit recommendation") -> """
                Recommendation: Moisture-wicking sports T-shirt and training shorts.
                Why: Helps manage sweat and improve comfort.
                Comfort Score: 95%
                Skin Safety Score: 90%
            """.trimIndent()

            query.contains("interview outfit recommendation") -> """
                Recommendation: Light blue cotton shirt, navy trousers, formal shoes.
                Why: Professional and comfortable.
                Comfort Score: 92%
                Skin Safety Score: 94%
            """.trimIndent()

            query.contains("date night outfit") -> """
                Recommendation: Black cotton shirt, beige chinos, white sneakers.
                Why: Stylish yet relaxed.
                Comfort Score: 93%
                Skin Safety Score: 94%
            """.trimIndent()

            query.contains("streetwear outfit") -> """
                Recommendation: Oversized hoodie, cargo pants, sneakers.
                Why: Trendy and comfortable.
                Comfort Score: 94%
                Skin Safety Score: 90%
            """.trimIndent()

            query.contains("minimalist fashion outfit") -> """
                Recommendation: White T-shirt, beige trousers, clean sneakers.
                Why: Simple and timeless style.
                Comfort Score: 95%
                Skin Safety Score: 96%
            """.trimIndent()

            query.contains("best fabric for hot weather") -> """
                Recommendation: Cotton, Linen, Bamboo.
                Why: Excellent breathability and moisture control.
                Comfort Score: 98%
                Skin Safety Score: 97%
            """.trimIndent()

            query.contains("polyester vs cotton") -> """
                Recommendation: Cotton is generally preferred.
                Why: Cotton is more breathable and often more comfortable in warm weather.
                Comfort Score: 95%
                Skin Safety Score: 96%
            """.trimIndent()

            query == "what should i wear today?" || query == "wear today" -> """
                Recommendation: Cotton T-shirt, relaxed-fit pants, breathable footwear.
                Why: A versatile outfit suitable for everyday comfort.
                Comfort Score: 95%
                Skin Safety Score: 96%
            """.trimIndent()

            query.contains("i sweat a lot") -> """
                Recommendation: Bamboo fabric, moisture-wicking cotton, linen.
                Why: Helps reduce sweat buildup and improve airflow.
                Comfort Score: 98%
                Skin Safety Score: 95%
            """.trimIndent()

            query.contains("fabric allergies") -> """
                Recommendation: Cotton, Bamboo, Organic Cotton.
                Avoid: Rough wool, heavy synthetic fabrics.
                Why: These materials are generally gentler on the skin.
                Comfort Score: 95%
                Skin Safety Score: 99%
            """.trimIndent()

            query.contains("recommend shoes") -> """
                Recommendation: Lightweight breathable sneakers.
                Why: Comfortable for everyday use and long walking periods.
                Comfort Score: 94%
                Skin Safety Score: 95%
            """.trimIndent()

            query.contains("trending now") -> """
                Recommendation:
                • Oversized shirts
                • Relaxed-fit trousers
                • Minimal sneakers
                • Neutral colors
                • Korean-inspired fashion
                Style Match: 97%
            """.trimIndent()

            query.contains("build my wardrobe") -> """
                Wardrobe Essentials:
                • White cotton T-shirt
                • Black T-shirt
                • Linen shirt
                • Relaxed-fit jeans
                • Chinos
                • White sneakers
                • Lightweight jacket
                • Formal shirt
                • Formal trousers
            """.trimIndent()

            query.contains("fashion tips") -> """
                1. Prioritize comfort before trends.
                2. Choose breathable fabrics.
                3. Wear clothes that fit properly.
                4. Use neutral colors for versatility.
                5. Build outfits around wardrobe essentials.
            """.trimIndent()

            // --- GREETINGS & BASICS ---
            query in listOf("hello", "hi", "hey") -> 
                "Hello! 👋 Welcome to Style AI. How can I help you with fashion, comfort, or clothing recommendations today?"
            
            query.contains("what can you do") -> """
                I can help with:
                • Outfit recommendations
                • Skin-safe fabrics
                • Clothing size suggestions
                • Fashion styling
                • Weather-based clothing advice
                • Wardrobe building
                • Shopping recommendations
            """.trimIndent()

            query.contains("thank you") || query == "thanks" -> 
                "You're welcome! 😊 Feel free to ask me anything about fashion, comfort, fabrics, or styling."
            
            query == "bye" || query == "goodbye" -> 
                "Goodbye! 👋 Have a wonderful day and enjoy your fashion journey with Style AI."

            else -> null // Unknown question triggers fallback
        }
    }
}
