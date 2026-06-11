package com.example.best3.ui.profile

import android.widget.Toast
import androidx.compose.animation.*
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Preview(showBackground = true)
@Composable
fun SkinPreferencesScreenPreview() {
    StyleAiTheme {
        SkinPreferencesScreen(onBackClick = {}, onSaveClick = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun SkinPreferencesScreen(onBackClick: () -> Unit, onSaveClick: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    var selectedConditions by remember { mutableStateOf(setOf("Dermatitis", "Sensitive Skin")) }
    var sensitivityLevel by remember { mutableFloatStateOf(0.7f) }
    var avoidedFabrics by remember { mutableStateOf(setOf("Wool", "Polyester")) }
    var comfortConcerns by remember { mutableStateOf(setOf("Itching", "Redness")) }
    var isLoading by remember { mutableStateOf(false) }

    val skinConditions = listOf("Dermatitis", "Sensitive Skin", "Eczema", "Heat Rash", "Fabric Allergy", "Dry Skin")
    val fabrics = listOf("Wool", "Polyester", "Nylon", "Synthetic Blend", "Denim", "Acrylic")
    val concerns = listOf("Sweating", "Itching", "Redness", "Heat Irritation")

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Manage Skin Preferences", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    TextButton(onClick = {
                        scope.launch {
                            isLoading = true
                            delay(1500)
                            isLoading = false
                            Toast.makeText(context, "Skin Profile Updated!", Toast.LENGTH_SHORT).show()
                            onSaveClick()
                        }
                    }) {
                        Text("Save", color = AccentBlue, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Brush.verticalGradient(listOf(White, PastelGreen.copy(alpha = 0.1f))))
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp)
            ) {
                // Status Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = AccentBlue)
                ) {
                    Row(
                        modifier = Modifier.padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier.size(50.dp).background(White.copy(alpha = 0.2f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.HealthAndSafety, null, tint = White)
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text("Profile Completion: 85%", color = White, fontWeight = FontWeight.Bold)
                            Text("Last updated: 2 days ago", color = White.copy(alpha = 0.7f), fontSize = 12.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Section 1: Skin Conditions
                SectionHeader("Skin Conditions", Icons.Default.MedicalServices)
                FlowRow(
                    modifier = Modifier.padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    skinConditions.forEach { condition ->
                        FilterChip(
                            selected = selectedConditions.contains(condition),
                            onClick = {
                                selectedConditions = if (selectedConditions.contains(condition)) {
                                    selectedConditions - condition
                                } else {
                                    selectedConditions + condition
                                }
                            },
                            label = { Text(condition) },
                            shape = RoundedCornerShape(12.dp),
                            leadingIcon = if (selectedConditions.contains(condition)) {
                                { Icon(Icons.Default.Check, null, modifier = Modifier.size(16.dp)) }
                            } else null
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Section 2: Sensitivity Level
                SectionHeader("Sensitivity Level", Icons.Default.Warning)
                Column(modifier = Modifier.padding(vertical = 16.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Low", fontSize = 12.sp, color = Color.Gray)
                        Text(
                            text = when {
                                sensitivityLevel < 0.33f -> "Low Sensitivity"
                                sensitivityLevel < 0.66f -> "Medium Sensitivity"
                                else -> "High Sensitivity"
                            },
                            fontWeight = FontWeight.Bold,
                            color = AccentBlue
                        )
                        Text("High", fontSize = 12.sp, color = Color.Gray)
                    }
                    Slider(
                        value = sensitivityLevel,
                        onValueChange = { sensitivityLevel = it },
                        colors = SliderDefaults.colors(thumbColor = AccentBlue, activeTrackColor = AccentBlue)
                    )
                }

                // Section 3: Fabric Avoidance
                SectionHeader("Fabric Avoidance", Icons.Default.Block)
                FlowRow(
                    modifier = Modifier.padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    fabrics.forEach { fabric ->
                        FilterChip(
                            selected = avoidedFabrics.contains(fabric),
                            onClick = {
                                avoidedFabrics = if (avoidedFabrics.contains(fabric)) {
                                    avoidedFabrics - fabric
                                } else {
                                    avoidedFabrics + fabric
                                }
                            },
                            label = { Text(fabric) },
                            shape = RoundedCornerShape(12.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFFFEBEE),
                                selectedLabelColor = Color.Red,
                                selectedLeadingIconColor = Color.Red
                            ),
                            leadingIcon = if (avoidedFabrics.contains(fabric)) {
                                { Icon(Icons.Default.RemoveCircle, null, modifier = Modifier.size(16.dp)) }
                            } else null
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Section 4: AI Preview Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AutoAwesome, null, tint = Color(0xFFFFD700), modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("AI Preview Recommendations", fontWeight = FontWeight.ExtraBold, color = Color.Black)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Based on your selections:", fontSize = 12.sp, color = Color.Gray)
                        
                        Row(modifier = Modifier.padding(top = 8.dp)) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("RECOMMENDED", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF4CAF50))
                                Text("• Cotton\n• Bamboo\n• Silk", fontSize = 13.sp, lineHeight = 18.sp)
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text("AVOID", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Red)
                                Text("• Polyester\n• Nylon\n• Wool", fontSize = 13.sp, lineHeight = 18.sp)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))

                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            delay(1000)
                            isLoading = false
                            onSaveClick()
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(60.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                ) {
                    Text("Update Skin Profile", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                }
                
                Spacer(modifier = Modifier.height(40.dp))
            }

            if (isLoading) {
                Surface(modifier = Modifier.fillMaxSize(), color = Color.Black.copy(alpha = 0.4f)) {
                    Box(contentAlignment = Alignment.Center) {
                        Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = White)) {
                            Row(modifier = Modifier.padding(24.dp), verticalAlignment = Alignment.CenterVertically) {
                                CircularProgressIndicator(color = AccentBlue, modifier = Modifier.size(24.dp))
                                Spacer(modifier = Modifier.width(16.dp))
                                Text("Recalculating AI Logic...", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SectionHeader(title: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(title, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = Color.Black)
    }
}
