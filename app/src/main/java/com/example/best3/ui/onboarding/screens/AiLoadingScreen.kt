package com.example.best3.ui.onboarding.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay

@Preview(showBackground = true)
@Composable
fun AiLoadingScreenPreview() {
    StyleAiTheme {
        AiLoadingScreen(onFinished = {})
    }
}

@Composable
fun AiLoadingScreen(onFinished: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition(label = "")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(tween(2000, easing = LinearEasing)), label = ""
    )

    LaunchedEffect(Unit) {
        delay(3000)
        onFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AccentBlue),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    Icons.Default.AutoAwesome,
                    contentDescription = null,
                    modifier = Modifier.size(80.dp).rotate(rotation),
                    tint = White
                )
                CircularProgressIndicator(modifier = Modifier.size(120.dp), color = White.copy(alpha = 0.3f), strokeWidth = 2.dp)
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                "Analyzing Preferences...",
                color = White,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
            Text(
                "Summer Comfort Mode Activated",
                color = White.copy(alpha = 0.7f),
                fontSize = 14.sp
            )
        }
    }
}
