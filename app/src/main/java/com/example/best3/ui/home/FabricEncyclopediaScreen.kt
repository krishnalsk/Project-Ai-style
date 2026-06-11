package com.example.best3.ui.home

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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun FabricEncyclopediaScreenPreview() {
    StyleAiTheme {
        FabricEncyclopediaScreen(onBackClick = {})
    }
}

data class FabricInfo(
    val name: String,
    val description: String,
    val benefits: List<String>,
    val icon: ImageVector,
    val color: Color,
    val imageUrl: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FabricEncyclopediaScreen(onBackClick: () -> Unit) {
    val fabrics = listOf(
        FabricInfo(
            "Organic Linen",
            "Extracted from flax plants, linen is the ultimate breathable fabric for hot climates. It naturally wicks moisture away from the skin.",
            listOf("Ultra Breathable", "Anti-Bacterial", "Rapid Drying"),
            Icons.Default.Air,
            Color(0xFF81D4FA),
            "https://images.unsplash.com/photo-1594932224010-70f90e549171?w=400"
        ),
        FabricInfo(
            "Bamboo Viscose",
            "Bamboo fabric is incredibly soft, often compared to silk. It's hypoallergenic and perfect for those with highly sensitive skin.",
            listOf("Hypoallergenic", "Eco-Friendly", "Thermal Regulating"),
            Icons.Default.Eco,
            Color(0xFF81C784),
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"
        ),
        FabricInfo(
            "Mulberry Silk",
            "The highest quality silk available. It contains natural proteins and amino acids that help maintain skin hydration.",
            listOf("Skin Hydrating", "Friction-Free", "Premium Comfort"),
            Icons.Default.AutoAwesome,
            Color(0xFFF06292),
            "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=400"
        )
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Fabric Encyclopedia", fontWeight = FontWeight.ExtraBold) },
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
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.1f))))
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            Text(
                "Learn about the materials that touch your skin every day.",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.Gray
            )
            
            Spacer(modifier = Modifier.height(32.dp))

            fabrics.forEach { fabric ->
                FabricCard(fabric)
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun FabricCard(fabric: FabricInfo) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Column {
            Box(modifier = Modifier.height(220.dp).fillMaxWidth()) {
                AsyncImage(
                    model = fabric.imageUrl,
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                    placeholder = painterResource(id = android.R.drawable.ic_menu_gallery),
                    error = painterResource(id = android.R.drawable.stat_notify_error)
                )
                // Premium Overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.4f))))
                )
                
                Surface(
                    modifier = Modifier.padding(20.dp).align(Alignment.TopEnd),
                    color = fabric.color,
                    shape = CircleShape,
                    shadowElevation = 4.dp
                ) {
                    Icon(
                        fabric.icon,
                        null,
                        tint = White,
                        modifier = Modifier.padding(10.dp).size(24.dp)
                    )
                }
                
                Text(
                    text = fabric.name,
                    modifier = Modifier.align(Alignment.BottomStart).padding(24.dp),
                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black, color = White)
                )
            }
            
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = fabric.description,
                    color = Color.DarkGray,
                    fontSize = 15.sp,
                    lineHeight = 22.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(20.dp))
                
                Text("Core Benefits", fontWeight = FontWeight.Black, fontSize = 12.sp, color = Color.Gray)
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.horizontalScroll(rememberScrollState())) {
                    fabric.benefits.forEach { benefit ->
                        Surface(
                            color = fabric.color.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, fabric.color.copy(alpha = 0.2f))
                        ) {
                            Row(modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Done, null, tint = fabric.color, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = benefit,
                                    color = fabric.color,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
