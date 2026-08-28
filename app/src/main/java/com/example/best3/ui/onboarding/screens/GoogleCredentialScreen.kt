package com.example.best3.ui.onboarding.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun GoogleCredentialScreenPreview() {
    StyleAiTheme {
        GoogleCredentialScreen(selectedEmail = "balamurali@gmail.com", onBackClick = {}, onNext = {})
    }
}
@Composable
fun GoogleCredentialScreen(selectedEmail: String, onBackClick: () -> Unit, onNext: () -> Unit) {
    var email by remember { mutableStateOf(selectedEmail) }
    var password by remember { mutableStateOf("") }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(White)
    ) {
        // Back Button
        IconButton(
            onClick = onBackClick,
            modifier = Modifier
                .padding(16.dp)
                .align(Alignment.TopStart)
        ) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.Black)
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Spacer(modifier = Modifier.height(48.dp))
            
            AsyncImage(
                model = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png",
                contentDescription = "Google",
                modifier = Modifier.height(30.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Sign in",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Normal)
            )
            Text(
                text = "Use your Google Account",
                style = MaterialTheme.typography.bodyLarge
            )

            Spacer(modifier = Modifier.height(48.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email or phone") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(4.dp)
            )
            
            TextButton(onClick = {}, modifier = Modifier.padding(top = 4.dp)) {
                Text("Forgot email?", color = Color(0xFF1A73E8), fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Enter your password") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(4.dp),
                visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation()
            )

            Spacer(modifier = Modifier.height(48.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = {}) {
                    Text("Create account", color = Color(0xFF1A73E8), fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = onNext,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A73E8)),
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier.width(100.dp).height(40.dp)
                ) {
                    Text("Next", color = White)
                }
            }
        }
    }
}