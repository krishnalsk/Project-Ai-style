package com.example.best3.ui.onboarding.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.data.FirebaseManager
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun PersonalInfoSetupScreenPreview() {
    StyleAiTheme {
        PersonalInfoSetupScreen(onContinue = {})
    }
}

@Composable
fun PersonalInfoSetupScreen(onContinue: () -> Unit) {
    var fullName by remember { mutableStateOf("") }
    var profession by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var size by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(White)
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        Text("Personal Information", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black))
        Text("Let's personalize your style journey", color = Color.Gray, fontWeight = FontWeight.Medium)

        Spacer(modifier = Modifier.height(32.dp))

        // Profile Photo
        Box(modifier = Modifier.align(Alignment.CenterHorizontally)) {
            AsyncImage(
                model = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
                contentDescription = "Profile Photo",
                modifier = Modifier.size(100.dp).clip(CircleShape).background(SoftGray),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
            )
            IconButton(
                onClick = {},
                modifier = Modifier.align(Alignment.BottomEnd).background(AccentBlue, CircleShape).size(32.dp)
            ) {
                Icon(Icons.Default.CameraAlt, null, tint = White, modifier = Modifier.size(16.dp))
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = fullName,
            onValueChange = { fullName = it },
            label = { Text("Full Name", color = Color.Black) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            textStyle = LocalTextStyle.current.copy(color = Color.Black, fontWeight = FontWeight.Bold),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AccentBlue,
                unfocusedBorderColor = Color.LightGray,
                focusedTextColor = Color.Black,
                unfocusedTextColor = Color.Black
            )
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = profession,
            onValueChange = { profession = it },
            label = { Text("Profession", color = Color.Black) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            textStyle = LocalTextStyle.current.copy(color = Color.Black, fontWeight = FontWeight.Bold),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AccentBlue,
                unfocusedBorderColor = Color.LightGray,
                focusedTextColor = Color.Black,
                unfocusedTextColor = Color.Black
            )
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = location,
            onValueChange = { location = it },
            label = { Text("Location (e.g. Dubai, Mumbai)", color = Color.Black) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            textStyle = LocalTextStyle.current.copy(color = Color.Black, fontWeight = FontWeight.Bold),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AccentBlue,
                unfocusedBorderColor = Color.LightGray,
                focusedTextColor = Color.Black,
                unfocusedTextColor = Color.Black
            )
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            OutlinedTextField(
                value = age, 
                onValueChange = { age = it }, 
                label = { Text("Age", color = Color.Black) }, 
                modifier = Modifier.weight(1f), 
                shape = RoundedCornerShape(12.dp),
                textStyle = LocalTextStyle.current.copy(color = Color.Black, fontWeight = FontWeight.Bold),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AccentBlue,
                    unfocusedBorderColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )
            OutlinedTextField(
                value = size, 
                onValueChange = { size = it }, 
                label = { Text("Size", color = Color.Black) }, 
                modifier = Modifier.weight(1f), 
                shape = RoundedCornerShape(12.dp),
                textStyle = LocalTextStyle.current.copy(color = Color.Black, fontWeight = FontWeight.Bold),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AccentBlue,
                    unfocusedBorderColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text("Favorite Fashion Style", fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(12.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Casual", "Formal", "Activewear", "Streetwear").forEach { style ->
                FilterChip(
                    selected = style == "Casual",
                    onClick = {},
                    label = { Text(style) },
                    shape = RoundedCornerShape(12.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = {
                FirebaseManager.tempProfile = FirebaseManager.tempProfile.copy(
                    fullName = fullName,
                    profession = profession,
                    location = location,
                    age = age,
                    size = size
                )
                onContinue()
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
        ) {
            Text("Next Step", fontWeight = FontWeight.Bold)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FlowRow(horizontalArrangement: Arrangement.Horizontal, content: @Composable () -> Unit) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = horizontalArrangement,
        content = { content() }
    )
}
