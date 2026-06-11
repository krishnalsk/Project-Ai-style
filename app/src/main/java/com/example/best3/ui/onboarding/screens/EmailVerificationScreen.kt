package com.example.best3.ui.onboarding.screens

import android.widget.Toast
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Preview(showBackground = true)
@Composable
fun EmailVerificationScreenPreview() {
    StyleAiTheme {
        EmailVerificationScreen(onVerifySuccess = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmailVerificationScreen(onVerifySuccess: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val auth = FirebaseAuth.getInstance()
    
    var isLoading by remember { mutableStateOf(false) }
    var isChecking by remember { mutableStateOf(false) }
    var timer by remember { mutableIntStateOf(59) }

    LaunchedEffect(Unit) {
        while (timer > 0) {
            delay(1000)
            timer--
        }
    }

    // Periodically check verification status
    LaunchedEffect(Unit) {
        while (true) {
            auth.currentUser?.reload()?.addOnCompleteListener {
                if (auth.currentUser?.isEmailVerified == true) {
                    onVerifySuccess()
                }
            }
            delay(3000) // Check every 3 seconds
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(White)
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Top
    ) {
        Spacer(modifier = Modifier.height(48.dp))
        
        // Premium Verification Illustration
        Surface(
            modifier = Modifier.size(140.dp),
            shape = CircleShape,
            color = LightBlue.copy(alpha = 0.3f)
        ) {
            AsyncImage(
                model = "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop",
                contentDescription = "Secure Verification",
                modifier = Modifier.fillMaxSize().padding(20.dp).clip(CircleShape),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
            )
        }
        
        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = "Check Your Email", 
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black, color = Color.Black)
        )
        Text(
            text = "We've sent a verification link to ${auth.currentUser?.email ?: "your email"}. Click the link to secure your account.",
            textAlign = TextAlign.Center,
            color = Color.Black,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(top = 16.dp).padding(horizontal = 24.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        // Waiting Indicator
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = LightBlue.copy(alpha = 0.1f)),
            border = BorderStroke(1.dp, AccentBlue.copy(alpha = 0.2f))
        ) {
            Row(
                modifier = Modifier.padding(24.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = AccentBlue,
                    strokeWidth = 3.dp
                )
                Spacer(modifier = Modifier.width(16.dp))
                Text(
                    "Waiting for verification...",
                    fontWeight = FontWeight.SemiBold,
                    color = AccentBlue
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = {
                scope.launch {
                    isChecking = true
                    auth.currentUser?.reload()?.addOnCompleteListener {
                        isChecking = false
                        if (auth.currentUser?.isEmailVerified == true) {
                            Toast.makeText(context, "Email Verified Successfully!", Toast.LENGTH_SHORT).show()
                            onVerifySuccess()
                        } else {
                            Toast.makeText(context, "Email not verified yet. Please check your inbox.", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(60.dp),
            shape = RoundedCornerShape(20.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
            enabled = !isChecking
        ) {
            if (isChecking) {
                CircularProgressIndicator(color = White, modifier = Modifier.size(24.dp))
            } else {
                Text("I've Verified My Email", fontWeight = FontWeight.Black, fontSize = 18.sp)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (timer > 0) {
            Text(
                text = "Resend link in 0:${timer.toString().padStart(2, '0')}",
                color = Color.Gray,
                fontWeight = FontWeight.Bold
            )
        } else {
            TextButton(onClick = { 
                timer = 59
                auth.currentUser?.sendEmailVerification()?.addOnCompleteListener {
                    if (it.isSuccessful) {
                        Toast.makeText(context, "Verification email resent!", Toast.LENGTH_SHORT).show()
                    }
                }
            }) {
                Text(
                    "Resend Verification Email",
                    color = AccentBlue, 
                    fontWeight = FontWeight.Black,
                    textDecoration = TextDecoration.Underline
                )
            }
        }
        
        Spacer(modifier = Modifier.height(64.dp))
        
        Icon(
            Icons.Default.VerifiedUser, 
            null, 
            tint = Color.LightGray,
            modifier = Modifier.size(32.dp)
        )
    }
}
