package com.example.best3.ui.profile

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun SizeRecommendationScreenPreview() {
    StyleAiTheme {
        SizeRecommendationScreen(onBackClick = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SizeRecommendationScreen(onBackClick: () -> Unit) {
    var height by remember { mutableStateOf("175 cm") }
    var weight by remember { mutableStateOf("70 kg") }
    var chest by remember { mutableStateOf("100 cm") }
    var waist by remember { mutableStateOf("85 cm") }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("AI Size Advisor", fontWeight = FontWeight.ExtraBold, color = Color.Black) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.05f))))
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // AI Prediction Header
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                color = AccentBlue,
                shadowElevation = 4.dp
            ) {
                Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Your Recommended Size", color = White.copy(alpha = 0.8f))
                    Text("XL - Large Fit", color = White, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
                    Spacer(modifier = Modifier.height(12.dp))
                    Surface(color = White.copy(alpha = 0.2f), shape = CircleShape) {
                        Text(
                            "98% Comfort Match",
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                            color = White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Body Visualization Placeholder
            Surface(
                modifier = Modifier.fillMaxWidth().height(300.dp),
                shape = RoundedCornerShape(24.dp),
                color = White,
                border = BorderStroke(1.dp, SoftGray)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    // This would be a 2D/3D Body Model
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.AccessibilityNew, null, modifier = Modifier.size(150.dp), tint = LightBlue)
                        Text("AI Body Fit Visualization", color = Color.Gray, fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Measurements Input
            Text("Update Measurements", fontWeight = FontWeight.ExtraBold, color = Color.Black, modifier = Modifier.padding(start = 8.dp))
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                MeasurementField("Height", height, Modifier.weight(1f)) { height = it }
                MeasurementField("Weight", weight, Modifier.weight(1f)) { weight = it }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                MeasurementField("Chest", chest, Modifier.weight(1f)) { chest = it }
                MeasurementField("Waist", waist, Modifier.weight(1f)) { waist = it }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Comfort Analysis
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                color = White,
                border = BorderStroke(1.dp, SoftGray)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Fit Analysis", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(12.dp))
                    FitRow("Chest Tightness", "Relaxed", Color(0xFF4CAF50))
                    FitRow("Shoulder Width", "Perfect", Color(0xFF4CAF50))
                    FitRow("Length", "Longer Fit", AccentBlue)
                    FitRow("Waist Ease", "High Comfort", Color(0xFF4CAF50))
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {},
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
            ) {
                Icon(Icons.Default.AutoAwesome, null)
                Spacer(modifier = Modifier.width(12.dp))
                Text("Recalculate Fit", fontWeight = FontWeight.Bold)
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun MeasurementField(label: String, value: String, modifier: Modifier, onValueChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentBlue)
    )
}

@Composable
fun FitRow(label: String, value: String, color: Color) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = Color.Gray, fontSize = 14.sp)
        Surface(color = color.copy(alpha = 0.1f), shape = CircleShape) {
            Text(
                text = value,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                color = color,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
