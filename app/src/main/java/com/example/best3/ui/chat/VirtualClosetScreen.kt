package com.example.best3.ui.chat

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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.data.FirebaseManager
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Preview(showBackground = true)
@Composable
fun VirtualClosetScreenPreview() {
    StyleAiTheme {
        VirtualClosetScreen(onBackClick = {})
    }
}

data class ClosetItem(
    val id: String = "",
    val name: String,
    val category: String,
    val imageUrl: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VirtualClosetScreen(onBackClick: () -> Unit) {
    var closetItems by remember { mutableStateOf<List<ClosetItem>>(emptyList()) }
    var isLoadingItems by remember { mutableStateOf(true) }
    var isStoring by remember { mutableStateOf(false) }
    
    val scope = rememberCoroutineScope()
    // val context = LocalContext.current // Removed unused context line causing error earlier if not careful

    // Load items on start
    LaunchedEffect(Unit) {
        val result = FirebaseManager.getClosetItems()
        if (result.isSuccess) {
            closetItems = result.getOrNull()?.map { map ->
                val name = map["name"] as? String ?: "Scanned Clothes"
                val category = map["category"] as? String ?: "Tops"
                val rawUrl = map["imageUrl"] as? String ?: ""
                val validUrl = if (rawUrl.isNotBlank() && rawUrl.startsWith("http")) rawUrl else getFallbackClothesImage(category, name)
                ClosetItem(
                    id = map["id"] as? String ?: "",
                    name = name,
                    category = category,
                    imageUrl = validUrl
                )
            } ?: emptyList()
        }
        isLoadingItems = false
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            scope.launch {
                isStoring = true
                // In a real production app, we would upload the bitmap to Firebase Storage first.
                // For this project phase, we use a placeholder high-quality image URL to simulate the result.
                val placeholderUrl = "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800"
                val name = "Item #${closetItems.size + 1}"
                val category = "Scanned"
                
                val result = FirebaseManager.addClosetItem(name, category, placeholderUrl)
                if (result.isSuccess) {
                    val newId = result.getOrNull() ?: ""
                    closetItems = listOf(ClosetItem(newId, name, category, placeholderUrl)) + closetItems
                }
                isStoring = false
            }
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            cameraLauncher.launch(null)
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
                    IconButton(onClick = { /* Search */ }) {
                        Icon(Icons.Default.Search, null)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = White)
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
                if (closetItems.isNotEmpty()) {
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
                }

                Text(
                    "Stored Items",
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold)
                )

                if (isLoadingItems) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = AccentBlue)
                    }
                } else if (closetItems.isEmpty()) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.Inventory2, null, modifier = Modifier.size(80.dp), tint = Color.LightGray)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Your closet is empty", fontWeight = FontWeight.Bold, color = Color.Gray)
                        Text("Scan your clothes to get AI outfit tips", color = Color.LightGray, fontSize = 14.sp)
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(closetItems) { item ->
                            ClosetGridItem(
                                item = item,
                                onDelete = {
                                    scope.launch {
                                        val deleteResult = FirebaseManager.deleteClosetItem(item.id)
                                        if (deleteResult.isSuccess) {
                                            closetItems = closetItems.filter { it.id != item.id }
                                        }
                                    }
                                }
                            )
                        }
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
                        Text("Syncing to Cloud Closet...", color = White, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                        Text("AI is analyzing fabric profile", color = White.copy(alpha = 0.8f), fontSize = 14.sp)
                    }
                }
            }
        }
    }
}

fun getFallbackClothesImage(category: String = "", name: String = ""): String {
    val input = "$category $name".lowercase()
    return when {
        input.contains("shirt") || input.contains("top") || input.contains("tee") -> "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop"
        input.contains("hoodie") || input.contains("sweater") || input.contains("jacket") -> "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop"
        input.contains("dress") || input.contains("skirt") -> "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop"
        input.contains("pant") || input.contains("trouser") || input.contains("short") || input.contains("bottom") -> "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop"
        else -> "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop"
    }
}

@Composable
fun ClosetGridItem(item: ClosetItem, onDelete: () -> Unit) {
    val imageUrl = if (item.imageUrl.isNotBlank() && item.imageUrl.startsWith("http")) {
        item.imageUrl
    } else {
        getFallbackClothesImage(item.category, item.name)
    }

    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        border = BorderStroke(1.dp, SoftGray)
    ) {
        Column {
            Box {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = null,
                    modifier = Modifier.fillMaxWidth().height(160.dp).background(SoftGray),
                    contentScale = ContentScale.Crop
                )
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .size(32.dp)
                        .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                ) {
                    Icon(Icons.Default.Delete, null, tint = White, modifier = Modifier.size(16.dp))
                }
            }
            Column(modifier = Modifier.padding(16.dp)) {
                Text(item.name, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, maxLines = 1)
                Text(item.category, color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
