package com.example.best3.ui.product

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
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
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import coil.compose.rememberAsyncImagePainter
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun ProductDetailsScreenPreview() {
    StyleAiTheme {
        ProductDetailsScreen(
            productName = "Azure Linen Shirt",
            onBackClick = {},
            onBuyNowClick = {}
        )
    }
}

@Composable
fun ProductDetailsScreen(
    productName: String,
    onBackClick: () -> Unit,
    onBuyNowClick: () -> Unit
) {
    var selectedSize by remember { mutableStateOf("XL") }
    var selectedColor by remember { mutableStateOf(AccentBlue) }
    var tryOnImage by remember { mutableStateOf<android.graphics.Bitmap?>(null) }

    val cameraLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicturePreview()) { bitmap ->
        if (bitmap != null) {
            tryOnImage = bitmap
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            cameraLauncher.launch(null)
        }
    }

    val productImages = listOf(
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
        "https://images.unsplash.com/photo-1596755389378-7fd0c1c58f21?w=600",
        "https://images.unsplash.com/photo-1596755093590-7210c1a56bca?w=600"
    )

    Box(
        modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(White, SoftGray.copy(alpha = 0.5f))))
    ) {
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())
        ) {
            // Large Product Image & Previews
            Box(modifier = Modifier.fillMaxWidth().height(500.dp)) {
                AsyncImage(
                    model = productImages[0],
                    contentDescription = productName,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                    placeholder = painterResource(id = android.R.drawable.ic_menu_gallery),
                    error = painterResource(id = android.R.drawable.stat_notify_error)
                )
                
                // Top Gradient Overlay for readability
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .background(Brush.verticalGradient(listOf(Color.Black.copy(alpha = 0.3f), Color.Transparent)))
                )
                
                // Overlay buttons
                Row(
                    modifier = Modifier.fillMaxWidth().padding(24.dp).align(Alignment.TopCenter),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier.background(White.copy(alpha = 0.9f), CircleShape)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back", tint = Color.Black)
                    }
                    IconButton(
                        onClick = { },
                        modifier = Modifier.background(White.copy(alpha = 0.9f), CircleShape)
                    ) {
                        Icon(Icons.Default.Favorite, "Add to wishlist", tint = Color.Red)
                    }
                }

                // Small Previews - Glassmorphism style
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(bottom = 24.dp, end = 16.dp)
                        .background(White.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                        .padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    productImages.forEach { img ->
                        Surface(
                            modifier = Modifier.size(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            color = White,
                            border = BorderStroke(2.dp, White)
                        ) {
                            AsyncImage(
                                model = img, 
                                contentDescription = "Product thumbnail", 
                                contentScale = ContentScale.Crop,
                                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                            )
                        }
                    }
                }
            }

            Column(
                modifier = Modifier
                    .offset(y = (-30).dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp))
                    .background(White)
                    .padding(24.dp)
            ) {
                // Name and Price
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = productName, 
                            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black, color = Color.Black)
                        )
                        Text(text = "Premium Sustainable Collection", color = AccentBlue, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                    Surface(
                        color = LightBlue.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "₹4,399", 
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Black, color = AccentBlue)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // AI Smart Labels
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    SmartLabel("Hypoallergenic", Icons.Default.HealthAndSafety)
                    SmartLabel("Breathable", Icons.Default.Air)
                    SmartLabel("Eco Material", Icons.Default.Eco)
                }

                Spacer(modifier = Modifier.height(24.dp))

                // AI Comfort & Weather Analysis
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    color = Color.Black,
                    shadowElevation = 8.dp
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AutoAwesome, "AI styling", tint = Color.Yellow, modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("AI Style Intelligence", fontWeight = FontWeight.Black, color = White, fontSize = 16.sp)
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            AiStat("Comfort", "95%")
                            AiStat("Breathability", "High")
                            AiStat("Skin Safe", "Yes")
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Perfectly matches your 'Sensitive Skin' profile. Recommended for Dubai's current heat.", 
                            fontSize = 12.sp, 
                            color = White.copy(alpha = 0.7f),
                            lineHeight = 18.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Size Selector
                Text("Select Size", fontWeight = FontWeight.ExtraBold, color = Color.Black)
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    listOf("S", "M", "L", "XL", "XXL").forEach { size ->
                        Surface(
                            onClick = { selectedSize = size },
                            shape = RoundedCornerShape(12.dp),
                            color = if (selectedSize == size) AccentBlue else SoftGray,
                            modifier = Modifier.size(50.dp).semantics {
                                contentDescription = if (selectedSize == size) "Size $size selected" else "Size $size"
                                stateDescription = if (selectedSize == size) "Selected" else "Not selected"
                            }
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(size, color = if (selectedSize == size) White else Color.Black, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Color Selector
                Text("Color Options", fontWeight = FontWeight.ExtraBold, color = Color.Black)
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    listOf(AccentBlue, Color(0xFF81D4FA), Color(0xFFE1F5FE)).forEachIndexed { index, color ->
                        val colorName = when(index) { 0 -> "Blue"; 1 -> "Light blue"; else -> "Pale blue" }
                        Surface(
                            onClick = { selectedColor = color },
                            shape = CircleShape,
                            color = color,
                            modifier = Modifier.size(36.dp).border(2.dp, if (selectedColor == color) Color.Gray else Color.Transparent, CircleShape)
                                .semantics {
                                    contentDescription = "$colorName color"
                                    stateDescription = if (selectedColor == color) "Selected" else "Not selected"
                                }
                        ) {}
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Virtual Try On
                Surface(
                    onClick = { 
                        if (tryOnImage == null) {
                            permissionLauncher.launch(android.Manifest.permission.CAMERA) 
                        } else {
                            // Reset or show full screen try-on
                            tryOnImage = null
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(80.dp),
                    shape = RoundedCornerShape(20.dp),
                    color = if (tryOnImage != null) LightBlue.copy(alpha = 0.2f) else SoftGray,
                    border = BorderStroke(1.dp, if (tryOnImage != null) AccentBlue.copy(alpha = 0.5f) else Color.LightGray)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (tryOnImage != null) {
                            Image(
                                painter = rememberAsyncImagePainter(tryOnImage),
                                contentDescription = "Try On result",
                                modifier = Modifier.size(50.dp).clip(RoundedCornerShape(8.dp)),
                                contentScale = ContentScale.Crop
                            )
                        } else {
                            Box(
                                modifier = Modifier.size(50.dp).background(White, RoundedCornerShape(12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.CameraAlt, "Virtual try-on", tint = AccentBlue)
                            }
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text(
                                text = if (tryOnImage != null) "Try-On Active" else "Virtual Try-On", 
                                fontWeight = FontWeight.Bold, 
                                color = Color.Black
                            )
                            Text(
                                text = if (tryOnImage != null) "Tap to reset" else "AI Visualizer for perfect fit", 
                                fontSize = 12.sp, 
                                color = Color.Gray
                            )
                        }
                        Spacer(modifier = Modifier.weight(1f))
                        if (tryOnImage != null) {
                            Icon(Icons.Default.CheckCircle, "Try-on active", tint = Color(0xFF4CAF50))
                        } else {
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, "Start virtual try-on", tint = AccentBlue)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Action Buttons
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    OutlinedButton(
                        onClick = { },
                        modifier = Modifier.weight(1f).height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        border = BorderStroke(1.dp, AccentBlue)
                    ) {
                        Icon(Icons.Default.ShoppingBag, "Add to cart", tint = AccentBlue)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Add to Cart", color = AccentBlue)
                    }
                    Button(
                        onClick = onBuyNowClick,
                        modifier = Modifier.weight(1f).height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                    ) {
                        Text("Buy Now", fontWeight = FontWeight.Bold)
                    }
                }
                
                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

@Composable
fun AiStat(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, color = White, fontWeight = FontWeight.Black, fontSize = 18.sp)
        Text(text = label, color = White.copy(alpha = 0.5f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun SmartLabel(text: String, icon: ImageVector) {
    Surface(
        color = SoftGray,
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, text, modifier = Modifier.size(14.dp), tint = Color.Gray)
            Spacer(modifier = Modifier.width(4.dp))
            Text(text, fontSize = 11.sp, color = Color.Gray)
        }
    }
}
