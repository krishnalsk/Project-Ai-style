package com.example.best3.ui.chat

import android.util.Log
import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class AiStylistViewModel : ViewModel() {
    val messages = mutableStateListOf(
        ChatMessage(
            text = "Hello! 👋 Welcome to Style AI. How can I help you with fashion, comfort, or clothing recommendations today?",
            isAi = true,
        )
    )

    fun sendMessage(text: String) {
        if (text.isBlank()) return
        
        messages.add(ChatMessage(text, isAi = false))
        
        val loadingMessage = ChatMessage("Style AI Rule Engine processing...", isAi = true, isLoading = true)
        messages.add(loadingMessage)
        
        viewModelScope.launch {
            try {
                // Simulate fast local rule-engine processing (100ms)
                delay(100)
                
                // 1. Try Direct Rule Matching
                var ruleResponse = getAssistantRuleResponse(text)
                
                // 2. If no direct rule match, run Dynamic 4-Step Rule Engine
                if (ruleResponse == null) {
                    ruleResponse = processDynamicRuleEngine(text)
                }

                messages.remove(loadingMessage)
                messages.add(ChatMessage(ruleResponse, true))
            } catch (e: Exception) {
                Log.e("AiStylistVM", "Error", e)
                messages.remove(loadingMessage)
                messages.add(ChatMessage("I'm having trouble processing right now. Please try again! 😊", true))
            }
        }
    }

    private fun processDynamicRuleEngine(query: String): String {
        val input = query.lowercase().trim()
        
        // STEP 1: Skin Safety Check
        val isSensitive = input.contains("skin") || input.contains("dermatitis") || input.contains("allergy") || input.contains("rash") || input.contains("itch")
        val skinSafetyScore = if (isSensitive) "98%" else "95%"
        val skinLevel = if (isSensitive) "SAFE (Hypoallergenic)" else "SAFE"

        // STEP 2 & 3: Clothing Weighting & Weather Adaptation
        val fabric = when {
            input.contains("hot") || input.contains("summer") || input.contains("sweat") -> "100% Organic Linen or Bamboo Viscose"
            input.contains("cold") || input.contains("winter") -> "Merino Wool Blend with Soft Cotton Lining"
            input.contains("rain") || input.contains("monsoon") -> "Quick-Dry Moisture-Wicking Cotton Synthetic"
            isSensitive -> "GOTS Certified Pure Organic Cotton or Mulberry Silk"
            else -> "Soft Breathable Organic Cotton"
        }

        val style = when {
            input.contains("formal") || input.contains("office") || input.contains("interview") -> "Structured Tailored Fit"
            input.contains("party") || input.contains("night") -> "Modern Slim Silhouette"
            input.contains("casual") || input.contains("college") || input.contains("street") -> "Relaxed Oversized Fit"
            else -> "Comfortable Regular Fit"
        }

        // STEP 4: Output Synthesis
        return """
            [4-Step Rule Engine Evaluation]
            • Skin Safety Level: $skinLevel ($skinSafetyScore)
            • Recommended Fabric: $fabric
            • Recommended Fit: $style
            
            Recommendation: Pair $fabric in $style with relaxed bottoms and breathable footwear.
            Why: Optimized for maximum skin comfort, airflow, and durability.
            Comfort Score: 96%
            Skin Safety Score: $skinSafetyScore
        """.trimIndent()
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

            (query == "what should i wear today?") || (query == "wear today") -> """
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

            (query.contains("thank you")) || (query == "thanks") -> 
                "You're welcome! 😊 Feel free to ask me anything about fashion, comfort, fabrics, or styling."
            
            (query == "bye") || (query == "goodbye") ->
                "Goodbye! 👋 Have a wonderful day and enjoy your fashion journey with Style AI."

            else -> null // Unknown question triggers fallback
        }
    }
}
