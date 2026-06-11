package com.example.best3.ui.home

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.best3.data.FirebaseManager
import com.example.best3.data.UserProfile
import com.example.best3.ui.theme.*
import com.example.best3.R

@Preview(showBackground = true)
@Composable
fun HomeDashboardPreview() {
    StyleAiTheme {
        HomeDashboard(
            onProductClick = {},
            onAiStylistClick = {},
            onCategoryClick = {},
            onProfileClick = {},
            onSearchClick = {},
            onWishlistClick = {},
            onCartClick = {},
            onNotificationClick = {},
            onTrackOrderClick = {},
            onLabelLensClick = {}
        )
    }
}

data class Product(
    val name: String,
    val imageUrl: String,
    val price: String,
    val fabric: String,
    val benefit: String
)

@Composable
fun HomeDashboard(
    onProductClick: (String) -> Unit,
    onAiStylistClick: () -> Unit,
    onCategoryClick: (String) -> Unit,
    onProfileClick: () -> Unit,
    onSearchClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onCartClick: () -> Unit,
    onNotificationClick: () -> Unit,
    onTrackOrderClick: () -> Unit,
    onLabelLensClick: () -> Unit,
    onWashCareClick: () -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    var userProfile by remember { mutableStateOf<UserProfile?>(null) }
    val focusManager = LocalFocusManager.current

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        // Handle the captured image bitmap here if needed
        if (bitmap != null) {
            onLabelLensClick()
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            cameraLauncher.launch(null)
        }
    }

    val allProducts = listOf(
        Product("Merino Wool Sweatshirt", "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=800&auto=format&fit=crop&q=80", "₹7,299", "Merino Wool", "Temperature Control"),
        Product("Organic Cotton T-Shirt", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80", "₹1,499", "Organic Cotton", "Hypoallergenic"),
        Product("Bamboo Polo Shirt", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80", "₹2,199", "Bamboo Fiber", "Sweat Absorption"),
        Product("Linen Casual Shirt", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80", "₹2,899", "Linen", "Breathable & Cool"),
        Product("Denim Jacket", "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80", "₹1,299", "Cotton Twill", "Smart Fabric"),
        Product("Merino Wool - Pink", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80", "₹7,299", "Merino Wool", "Skin Safe"),
        Product("Merino Wool - Lavender", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80", "₹7,299", "Merino Wool", "Skin Safe"),
        Product("Merino Wool - Striped", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80", "₹7,299", "Merino Wool", "Skin Safe"),
        Product("Oversized Knit Sweater", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80", "₹999", "Knit", "Cozy"),
        Product("Ribbed Bodycon Top", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80", "₹749", "Ribbed", "Breathable"),
        Product("Merino Wool - Black", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80", "₹7,299", "Merino Wool", "Skin Safe"),
        Product("Linen Wide-Leg Pants", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80", "₹2,499", "Linen", "Comfortable"),
        Product("Silk Slip Dress", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80", "₹3,999", "Silk", "Elegant"),
        Product("Bamboo Fiber Tee", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80", "₹1,299", "Bamboo", "Skin Safe"),
        Product("Cotton Twill Shorts", "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80", "₹1,499", "Cotton", "Casual"),
    )

    val filteredProducts = remember(searchQuery) {
        if (searchQuery.isBlank()) {
            emptyList<Product>()
        } else {
            allProducts.filter { it.name.contains(searchQuery, ignoreCase = true) }
        }
    }

    LaunchedEffect(Unit) {
        val result = FirebaseManager.getUserProfile()
        userProfile = result.getOrNull()
    }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(icon = { Icon(Icons.Filled.Home, null) }, label = { Text("Home") }, selected = true, onClick = {})
                NavigationBarItem(icon = { Icon(Icons.Outlined.Search, null) }, label = { Text("Search") }, selected = false, onClick = onSearchClick)
                NavigationBarItem(icon = { Icon(Icons.Outlined.FavoriteBorder, null) }, label = { Text("Wishlist") }, selected = false, onClick = onWishlistClick)
                NavigationBarItem(icon = { Icon(Icons.Outlined.Person, null) }, label = { Text("Profile") }, selected = false, onClick = onProfileClick)
            }
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onAiStylistClick,
                containerColor = AccentBlue,
                contentColor = White,
                icon = { Icon(Icons.Default.AutoAwesome, null) },
                text = { Text("AI Stylist") },
                shape = RoundedCornerShape(16.dp)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.3f), White)))
                .verticalScroll(rememberScrollState())
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = stringResource(R.string.hello_user, userProfile?.fullName ?: "Balamurali"),
                        style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
                    )
                    Text(
                        text = stringResource(R.string.home_subtitle),
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.Gray, fontWeight = FontWeight.Medium)
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onNotificationClick) {
                        Icon(Icons.Default.Notifications, null, tint = AccentBlue)
                    }
                    IconButton(onClick = onCartClick) {
                        Icon(Icons.Default.ShoppingCart, null, tint = AccentBlue)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    // Real User Image
                    Surface(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .border(2.dp, White, CircleShape)
                            .background(SoftGray)
                            .clickable { onProfileClick() },
                        tonalElevation = 2.dp
                    ) {
                        AsyncImage(
                            model = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=60",
                            contentDescription = "Profile",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                            placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                        )
                    }
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text(stringResource(R.string.search_placeholder)) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                shape = RoundedCornerShape(16.dp),
                leadingIcon = { Icon(Icons.Default.Search, null, tint = Color.Gray) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Close, null, tint = Color.Gray)
                        }
                    } else {
                        IconButton(onClick = { permissionLauncher.launch(android.Manifest.permission.CAMERA) }) {
                            Icon(Icons.Default.CameraAlt, null, tint = AccentBlue)
                        }
                    }
                },
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Words,
                    imeAction = ImeAction.Search
                ),
                keyboardActions = KeyboardActions(
                    onSearch = { focusManager.clearFocus() }
                ),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedContainerColor = White.copy(alpha = 0.5f),
                    focusedContainerColor = White,
                    unfocusedBorderColor = Color.Transparent,
                    focusedBorderColor = AccentBlue.copy(alpha = 0.5f)
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Track Order Card (New)
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Surface(
                    modifier = Modifier.weight(1f).clickable { onTrackOrderClick() },
                    shape = RoundedCornerShape(24.dp),
                    color = White,
                    shadowElevation = 2.dp,
                    border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(LightBlue.copy(alpha = 0.2f), RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.LocalShipping, null, tint = AccentBlue)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(stringResource(R.string.track_order), fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                        Text(stringResource(R.string.arriving_today), fontSize = 11.sp, color = Color.Gray)
                    }
                }

                Surface(
                    modifier = Modifier.weight(1f).clickable { onCategoryClick("VirtualCloset") },
                    shape = RoundedCornerShape(24.dp),
                    color = White,
                    shadowElevation = 2.dp,
                    border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(AccentBlue.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Checkroom, null, tint = AccentBlue)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(stringResource(R.string.virtual_closet), fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                        Text(stringResource(R.string.mix_match), fontSize = 11.sp, color = Color.Gray)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Weather & Comfort Score Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Weather Card
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = AccentBlue)
                ) {
                    val weatherText = if (userProfile?.location?.contains("Dubai", ignoreCase = true) == true) "42°C Dubai" else "34°C Sunny"
                    val fabricText = if (userProfile?.location?.contains("Dubai", ignoreCase = true) == true) "Ultra-Light Linen" else "Breathable Linen"
                    
                    Column(modifier = Modifier.padding(16.dp)) {
                        Icon(Icons.Default.WbSunny, null, tint = Color.Yellow, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(weatherText, color = White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(fabricText, color = White.copy(alpha = 0.8f), fontSize = 12.sp)
                    }
                }

                // Comfort Score Card
                Card(
                    modifier = Modifier.weight(1f).clickable { onCategoryClick("SustainabilityDashboard") },
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = BorderStroke(1.dp, AccentBlue.copy(alpha = 0.1f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Icon(Icons.Default.HealthAndSafety, null, tint = Color(0xFF4CAF50), modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("${userProfile?.comfortScore ?: 92}% Comfort", color = AccentBlue, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Daily Score", color = Color.Gray, fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Live Skin Forecast Section
            Text(
                text = stringResource(R.string.live_skin_forecast),
                modifier = Modifier.padding(horizontal = 24.dp),
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                shape = RoundedCornerShape(32.dp),
                color = Color(0xFFFFF9C4).copy(alpha = 0.5f),
                border = BorderStroke(1.dp, Color(0xFFFBC02D).copy(alpha = 0.2f))
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Waves, null, tint = Color(0xFFFBC02D), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Humidity: 65%", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.WbSunny, null, tint = Color(0xFFFBC02D), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("UV Index: High (7)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            "Recommendation: Avoid synthetics. Wear Bamboo or Silk to prevent sweat-rash.",
                            color = Color.DarkGray,
                            fontSize = 12.sp,
                            lineHeight = 18.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .background(Color(0xFFFBC02D).copy(alpha = 0.1f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.ShieldMoon, null, tint = Color(0xFFFBC02D), modifier = Modifier.size(32.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Categories
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.categories),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
                )
                Row {
                    TextButton(onClick = { onCategoryClick("FabricEncyclopedia") }) {
                        Text(stringResource(R.string.fabric_guide), color = AccentBlue, fontWeight = FontWeight.Bold)
                    }
                    TextButton(onClick = onWashCareClick) {
                        Text(stringResource(R.string.wash_care), color = Color(0xFF4CAF50), fontWeight = FontWeight.Bold)
                    }
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            LazyRow(
                contentPadding = PaddingValues(horizontal = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                val categories = listOf(
                    "Summer" to Icons.Default.WbSunny,
                    "Winter" to Icons.Default.AcUnit,
                    "Casual" to Icons.Default.Coffee,
                    "Formal" to Icons.Default.BusinessCenter,
                    "GymWear" to Icons.Default.FitnessCenter,
                    "EcoFriendly" to Icons.Default.Eco,
                    "SensitiveSkin" to Icons.Default.HealthAndSafety
                )
                items(categories) { (category, icon) ->
                    val displayName = when(category) {
                        "GymWear" -> "Gym Wear"
                        "EcoFriendly" -> "Eco-Friendly"
                        "SensitiveSkin" -> "Sensitive Skin"
                        else -> category
                    }
                    Surface(
                        onClick = { onCategoryClick(category) },
                        shape = RoundedCornerShape(20.dp),
                        color = White,
                        border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.3f)),
                        shadowElevation = 4.dp
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = icon,
                                contentDescription = null,
                                tint = AccentBlue,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = displayName,
                                color = Color.Black,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Trending Outfits (New Section)
            Text(
                text = if (searchQuery.isNotEmpty()) stringResource(R.string.search_results) else stringResource(R.string.new_arrivals),
                modifier = Modifier.padding(horizontal = 24.dp),
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
            )
            Spacer(modifier = Modifier.height(16.dp))

            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                val displayProducts = if (searchQuery.isNotEmpty()) filteredProducts else allProducts
                
                if (displayProducts.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No outfits found matching '$searchQuery'", color = Color.Gray)
                    }
                } else {
                    displayProducts.forEach { product ->
                        ProductItem(product) { onProductClick(product.name) }
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun ProductItem(product: Product, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(130.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.name,
                modifier = Modifier
                    .size(130.dp)
                    .background(SoftGray),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery),
                error = painterResource(id = android.R.drawable.stat_notify_error)
            )
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp).weight(1f)) {
                Text(
                    text = product.name, 
                    fontWeight = FontWeight.ExtraBold, 
                    fontSize = 16.sp,
                    color = Color.Black,
                    maxLines = 1
                )
                Text(
                    text = "${product.fabric} • ${product.benefit}",
                    color = Color.Gray,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1
                )

                Spacer(modifier = Modifier.weight(1f))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = product.price,
                        color = Color.Black,
                        fontWeight = FontWeight.Black, 
                        fontSize = 20.sp, // Made price larger and bolder
                        maxLines = 1,
                        softWrap = false
                    )
                    
                    Surface(
                        modifier = Modifier.size(36.dp),
                        shape = CircleShape,
                        color = LightBlue.copy(alpha = 0.5f),
                        onClick = { /* Add to Cart */ }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Default.Add, 
                                null, 
                                modifier = Modifier.size(20.dp),
                                tint = AccentBlue
                            )
                        }
                    }
                }
            }
        }
    }
}
