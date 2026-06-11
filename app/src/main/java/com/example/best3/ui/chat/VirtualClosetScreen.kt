package com.example.best3.ui.chat

import android.graphics.Bitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay

@Preview(showBackground = true)
@Composable
fun VirtualClosetScreenPreview() {
    StyleAiTheme {
        VirtualClosetScreen(onBackClick = {})
    }
}

data class ClosetItem(
    val name: String,
    val category: String,
    val imageUrl: Any // Supports both URL strings and Bitmaps
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VirtualClosetScreen(onBackClick: () -> Unit) {
    var closetItems by remember { 
        mutableStateOf(listOf(
            ClosetItem("White Cotton Tee", "Tops", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"),
            ClosetItem("Blue Denim", "Bottoms", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400"),
            ClosetItem("Black Blazer", "Outwear", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400"),
            ClosetItem("Beige Chinos", "Bottoms", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400")
        ))
    }
    
    var isStoring by remember { mutableStateOf(false) }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            isStoring = true
            // In a real app, you would upload this to a server/storage
            // Here we simulate AI processing and adding to local list
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            cameraLauncher.launch(null)
        }
    }

    LaunchedEffect(isStoring) {
        if (isStoring) {
            delay(2000) // Simulate AI Syncing time
            val newItem = ClosetItem(
                name = "Scanned Item #${closetItems.size + 1}",
                category = "Uncategorized",
                imageUrl = "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400" // Fallback image for demo
            )
            closetItems = listOf(newItem) + closetItems
            isStoring = false
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("AI Virtual Closet", fontWeight = FontWeight.ExtraBold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    IconButton(onClick = { /* Search closet */ }) {
                        Icon(Icons.Default.Search, null)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { permissionLauncher.launch(android.Manifest.permission.CAMERA) },
                containerColor = AccentBlue,
                contentColor = White,
                icon = { Icon(Icons.Default.AddAPhoto, null) },
                text = { Text("Add to Closet") },
                shape = RoundedCornerShape(16.dp)
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.05f))))
            ) {
                // Recommendation Bar
                Surface(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    shape = RoundedCornerShape(20.dp),
                    color = AccentBlue.copy(alpha = 0.1f)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AutoAwesome, null, tint = AccentBlue)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            "AI: You have ${closetItems.size} items. Mix your '${closetItems.first().name}' for a smart skin-safe outfit.",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = AccentBlue
                        )
                    }
                }

                Text(
                    "Stored Items",
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold)
                )

                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(closetItems) { item ->
                        ClosetGridItem(item)
                    }
                }
            }
            
            if (isStoring) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Black.copy(alpha = 0.6f)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        CircularProgressIndicator(color = White, strokeWidth = 6.dp)
                        Spacer(modifier = Modifier.height(24.dp))
                        Text(
                            "Syncing to Cloud Closet...", 
                            color = White, 
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp
                        )
                        Text(
                            "AI is analyzing fabric profile", 
                            color = White.copy(alpha = 0.8f),
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ClosetGridItem(item: ClosetItem) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        border = BorderStroke(1.dp, SoftGray)
    ) {
        Column {
            AsyncImage(
                model = item.imageUrl,
                contentDescription = null,
                modifier = Modifier.fillMaxWidth().height(160.dp),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery),
                error = painterResource(id = android.R.drawable.stat_notify_error)
            )
            Column(modifier = Modifier.padding(16.dp)) {
                Text(item.name, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, maxLines = 1)
                Text(item.category, color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
