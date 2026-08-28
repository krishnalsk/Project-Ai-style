package com.example.best3.ui.onboarding.screens

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.rememberAsyncImagePainter
import com.example.best3.data.FirebaseManager
import com.example.best3.ui.theme.*
import com.example.best3.util.dashedBorder

@Preview(showBackground = true)
@Composable
fun SkinDiagnosisSetupScreenPreview() {
    StyleAiTheme {
        SkinDiagnosisSetupScreen(onAnalyze = {})
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SkinDiagnosisSetupScreen(onAnalyze: () -> Unit) {
    val context = LocalContext.current
    var bodySize by remember { mutableStateOf(FirebaseManager.tempProfile.size ?: "") }
    var height by remember { mutableStateOf("") }
    var capturedImage by remember { mutableStateOf<android.graphics.Bitmap?>(null) }
    
    var selectedSkinType by remember { mutableStateOf(FirebaseManager.tempProfile.skinType ?: "Sensitive") }
    var selectedComfort by remember { mutableStateOf(FirebaseManager.tempProfile.preferredFabric ?: "Breathable Material") }
    var selectedStyle by remember { mutableStateOf(FirebaseManager.tempProfile.fashionStyle ?: "Summer") }

    val cameraLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicturePreview()) { bitmap ->
        if (bitmap != null) {
            capturedImage = bitmap
            FirebaseManager.tempProfile = FirebaseManager.tempProfile.copy(
                // In a real app, you'd upload the image and save the URL. 
                // For now, we just mark that a photo exists in state.
                profession = "Photo Uploaded" 
            )
            Toast.makeText(context, "Skin image captured!", Toast.LENGTH_SHORT).show()
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            cameraLauncher.launch(null)
        } else {
            Toast.makeText(context, "Camera permission denied", Toast.LENGTH_SHORT).show()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(White)
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        Text("Skin Diagnosis", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black))
        Text("Personalize your comfort profile", color = Color.Gray, fontWeight = FontWeight.Medium)

        Spacer(modifier = Modifier.height(32.dp))

        // Upload Skin Image
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(LightBlue.copy(alpha = 0.3f))
                .dashedBorder(2.dp, 24.dp, AccentBlue)
                .clickable { 
                    permissionLauncher.launch(android.Manifest.permission.CAMERA) 
                },
            contentAlignment = Alignment.Center
        ) {
            if (capturedImage != null) {
                Image(
                    painter = rememberAsyncImagePainter(capturedImage),
                    contentDescription = "Captured Skin",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            } else {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(Icons.Default.CameraAlt, null, tint = AccentBlue, modifier = Modifier.size(32.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Capture Skin Image for AI Analysis", color = AccentBlue, fontWeight = FontWeight.SemiBold)
                    Text("(Required for detailed analysis)", color = Color.Gray, fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text("Skin Type & Sensitivity", fontWeight = FontWeight.Bold)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Normal", "Oily", "Dry", "Combination", "Sensitive", "Acne Prone").forEach { condition ->
                FilterChip(
                    selected = selectedSkinType == condition,
                    onClick = { selectedSkinType = condition },
                    label = { Text(condition) },
                    shape = RoundedCornerShape(12.dp),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = LightBlue,
                        selectedLabelColor = AccentBlue
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text("Comfort Preference", fontWeight = FontWeight.Bold)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Loose Fit", "Soft Fabric", "Breathable Material").forEach { pref ->
                FilterChip(
                    selected = selectedComfort == pref,
                    onClick = { selectedComfort = pref },
                    label = { Text(pref) },
                    shape = RoundedCornerShape(12.dp),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = LightBlue,
                        selectedLabelColor = AccentBlue
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            OutlinedTextField(
                value = bodySize,
                onValueChange = { bodySize = it },
                label = { Text("Body Size", color = Color.Black) },
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
                value = height,
                onValueChange = { height = it },
                label = { Text("Height", color = Color.Black) },
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

        Spacer(modifier = Modifier.height(24.dp))

        Text("Preferred Styles", fontWeight = FontWeight.Bold)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Casual", "Summer", "Formal", "Activewear").forEach { style ->
                FilterChip(
                    selected = selectedStyle == style,
                    onClick = { selectedStyle = style },
                    label = { Text(style) },
                    shape = RoundedCornerShape(12.dp),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = LightBlue,
                        selectedLabelColor = AccentBlue
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = {
                FirebaseManager.tempProfile = FirebaseManager.tempProfile.copy(
                    size = bodySize,
                    skinType = selectedSkinType,
                    preferredFabric = selectedComfort,
                    fashionStyle = selectedStyle
                )
                onAnalyze()
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
        ) {
            Icon(Icons.Default.AutoAwesome, null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(12.dp))
            Text("Run AI Analysis", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
    }
}
