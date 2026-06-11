package com.example.best3.ui.home

import androidx.compose.animation.core.*
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
fun SustainabilityDashboardScreenPreview() {
    StyleAiTheme {
        SustainabilityDashboardScreen(onBackClick = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SustainabilityDashboardScreen(onBackClick: () -> Unit) {
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Your Eco Impact", fontWeight = FontWeight.ExtraBold) },
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
                .background(Brush.verticalGradient(listOf(White, Color(0xFFE8F5E9))))
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            // Impact Summary Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .background(Brush.linearGradient(listOf(Color(0xFF1B5E20), Color(0xFF43A047))))
                        .padding(32.dp)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Surface(
                            modifier = Modifier.size(64.dp),
                            shape = CircleShape,
                            color = White.copy(alpha = 0.2f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Eco, null, tint = White, modifier = Modifier.size(32.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Eco-Guardian Level", color = White.copy(alpha = 0.8f), fontWeight = FontWeight.Bold)
                        Text("540L Water Saved", color = White, fontSize = 28.sp, fontWeight = FontWeight.Black)
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Impact Progress
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            LinearProgressIndicator(
                                progress = { 0.75f },
                                modifier = Modifier.weight(1f).height(8.dp).clip(CircleShape),
                                color = Color(0xFFC8E6C9),
                                trackColor = White.copy(alpha = 0.2f)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("75%", color = White, fontWeight = FontWeight.Black)
                        }
                        Text("Next Level: Earth Hero", color = White.copy(alpha = 0.6f), fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Text("Monthly Statistics", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
            Spacer(modifier = Modifier.height(16.dp))

            ImpactRow("Water Saved", "540L", "Equivalent to 12 showers", Icons.Default.WaterDrop, Color(0xFF4FC3F7))
            ImpactRow("Carbon Offset", "12kg", "Equivalent to 3 trees planted", Icons.Default.Co2, Color(0xFF81C784))
            ImpactRow("Plastic Reduced", "0.8kg", "Equivalent to 40 bottles", Icons.Default.Recycling, Color(0xFFFFA726))

            Spacer(modifier = Modifier.height(32.dp))

            // Eco Badges
            Text("Earned Badges", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                BadgeItem("Linen Lover", Icons.Default.Verified, Color(0xFF81D4FA))
                BadgeItem("Bamboo King", Icons.Default.Forest, Color(0xFF66BB6A))
                BadgeItem("Silk Star", Icons.Default.AutoAwesome, Color(0xFFF06292))
            }
        }
    }
}

@Composable
fun ImpactRow(label: String, value: String, description: String, icon: androidx.compose.ui.graphics.vector.ImageVector, color: Color) {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        shape = RoundedCornerShape(20.dp),
        color = White,
        shadowElevation = 1.dp
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(modifier = Modifier.size(48.dp), shape = CircleShape, color = color.copy(alpha = 0.1f)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, null, tint = color)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(label, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.weight(1f))
                    Text(value, fontWeight = FontWeight.ExtraBold, color = color, fontSize = 18.sp)
                }
                Text(description, color = Color.Gray, fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun RowScope.BadgeItem(name: String, icon: androidx.compose.ui.graphics.vector.ImageVector, color: Color) {
    Card(
        modifier = Modifier.weight(1f),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = White)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(modifier = Modifier.size(40.dp), shape = CircleShape, color = color.copy(alpha = 0.2f)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(name, fontSize = 10.sp, fontWeight = FontWeight.Bold, maxLines = 1)
        }
    }
}
