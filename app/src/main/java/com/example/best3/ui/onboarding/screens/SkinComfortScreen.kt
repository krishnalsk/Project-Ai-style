package com.example.best3.ui.onboarding.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.best3.data.FirebaseManager
import com.example.best3.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FlowRow(modifier: Modifier = Modifier, horizontalArrangement: Arrangement.Horizontal, content: @Composable () -> Unit) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = horizontalArrangement,
        content = { content() }
    )
}

@Preview(showBackground = true)
@Composable
fun SkinComfortScreenPreview() {
    StyleAiTheme {
        SkinComfortScreen(onContinue = {})
    }
}

@Composable
fun SkinComfortScreen(onContinue: () -> Unit) {
    val scope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(White, PastelGreen.copy(alpha = 0.3f))))
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        Text("Skin Comfort", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black))
        Text("We recommend skin-safe fabrics based on your needs.", color = Color.Gray, fontWeight = FontWeight.Medium)

        Spacer(modifier = Modifier.height(32.dp))

        // Comfort Score Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = AccentBlue)
        ) {
            Column(modifier = Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("AI Comfort Prediction", color = White.copy(alpha = 0.8f), fontSize = 14.sp)
                Text("92% Match", color = White, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { 0.92f },
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape),
                    color = Color.Yellow,
                    trackColor = White.copy(alpha = 0.2f)
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text("Select Skin Type & Conditions", fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(12.dp))
        
        val skinConditions = listOf("Sensitive Skin", "Sweat Prone", "Fabric Allergy", "Eczema", "Dry Skin")
        var selectedConditions by remember { mutableStateOf(setOf("Sensitive Skin")) }
        
        skinConditions.forEach { condition ->
            Row(
                verticalAlignment = Alignment.CenterVertically, 
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { 
                        selectedConditions = if (selectedConditions.contains(condition)) {
                            selectedConditions - condition
                        } else {
                            selectedConditions + condition
                        }
                    }
                    .padding(vertical = 4.dp)
            ) {
                Checkbox(
                    checked = selectedConditions.contains(condition),
                    onCheckedChange = { isChecked ->
                        selectedConditions = if (isChecked) {
                            selectedConditions + condition
                        } else {
                            selectedConditions - condition
                        }
                    },
                    colors = CheckboxDefaults.colors(checkedColor = Color(0xFF006064))
                )
                Text(condition, color = Color.Black, fontWeight = FontWeight.Medium)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text("Preferred Fabrics", fontWeight = FontWeight.Bold)
        var selectedFabrics by remember { mutableStateOf(setOf("Cotton")) }
        
        FlowRow(
            modifier = Modifier.padding(top = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("Cotton", "Silk", "Linen", "Bamboo").forEach { fabric ->
                FilterChip(
                    selected = selectedFabrics.contains(fabric),
                    onClick = {
                        selectedFabrics = if (selectedFabrics.contains(fabric)) {
                            selectedFabrics - fabric
                        } else {
                            selectedFabrics + fabric
                        }
                    },
                    label = { Text(fabric) },
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
                isLoading = true
                FirebaseManager.tempProfile = FirebaseManager.tempProfile.copy(
                    email = FirebaseManager.currentUser?.email,
                    preferredFabric = selectedFabrics.joinToString(", "),
                    skinType = selectedConditions.joinToString(", ")
                )
                scope.launch {
                    val result = FirebaseManager.saveUserProfile(FirebaseManager.tempProfile)
                    isLoading = false
                    if (result.isSuccess) {
                        onContinue()
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF006064)),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = White, modifier = Modifier.size(24.dp))
            } else {
                Text("Finish Setup", fontWeight = FontWeight.Bold, color = White)
            }
        }
    }
}
