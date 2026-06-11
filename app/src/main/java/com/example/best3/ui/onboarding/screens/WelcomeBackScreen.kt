package com.example.best3.ui.onboarding.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay

@Preview(showBackground = true)
@Composable
fun WelcomeBackScreenPreview() {
    StyleAiTheme {
        WelcomeBackScreen(onContinue = {})
    }
}

@Composable
fun WelcomeBackScreen(onContinue: () -> Unit) {
    val auth = FirebaseAuth.getInstance()
    val displayName = auth.currentUser?.displayName ?: "Balamurali Krishna"

    LaunchedEffect(Unit) {
        delay(2000)
        onContinue()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(White, LightBlue)))
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Surface(
                modifier = Modifier.size(120.dp),
                shape = CircleShape,
                border = BorderStroke(3.dp, AccentBlue),
                shadowElevation = 8.dp
            ) {
                AsyncImage(
                    model = auth.currentUser?.photoUrl ?: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF4CAF50), modifier = Modifier.size(32.dp))
            
            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Welcome Back,",
                style = MaterialTheme.typography.headlineSmall.copy(color = Color.Gray)
            )
            Text(
                text = displayName,
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.ExtraBold, color = AccentBlue)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Successfully connected with Google",
                style = MaterialTheme.typography.bodyMedium.copy(color = Color.Gray)
            )

            Spacer(modifier = Modifier.height(48.dp))

            CircularProgressIndicator(color = AccentBlue, strokeWidth = 3.dp, modifier = Modifier.size(24.dp))
        }
    }
}
