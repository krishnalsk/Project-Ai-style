package com.example.best3.ui.chat

data class ChatMessage(
    val text: String,
    val isAi: Boolean,
    val suggestedOutfits: List<Outfit>? = null,
    val isLoading: Boolean = false,
    val algorithmDetails: AlgorithmMetadata? = null
)

data class AlgorithmMetadata(
    val engine: String, // e.g., "Random Forest"
    val fabricSafety: String, // e.g., "SAFE (XGBoost)"
    val comfortMatch: Int,
    val weatherLogic: String? = null
)

data class Outfit(
    val name: String,
    val image: String,
    val comfort: String,
    val price: String? = null,
    val safetyScore: Int = 0
)
