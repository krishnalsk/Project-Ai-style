package com.example.best3.ui.wishlist

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun WishlistScreenPreview() {
    StyleAiTheme {
        WishlistScreen(
            onBackClick = {},
            onProductClick = {},
            onHomeClick = {},
            onSearchClick = {},
            onProfileClick = {}
        )
    }
}

data class WishlistItem(
    val id: String = java.util.UUID.randomUUID().toString(),
    val name: String,
    val category: String,
    val fabric: String,
    val price: String,
    val score: String,
    val image: String,
    val badge: String = "Skin Safe"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishlistScreen(
    onBackClick: () -> Unit,
    onProductClick: (String) -> Unit,
    onHomeClick: () -> Unit,
    onSearchClick: () -> Unit,
    onProfileClick: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    
    val wishlistItems = remember {
        mutableStateListOf(
            WishlistItem(name = "Cooling Linen Shirt", category = "Tops", fabric = "100% Organic Linen", price = "₹4,399", score = "98", image = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Organic Cotton T-Shirt", category = "Tops", fabric = "Organic Cotton • Hypoallergenic", price = "₹1,499", score = "99", image = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Bamboo Polo Shirt", category = "Tops", fabric = "Bamboo Fiber • Sweat Absorption", price = "₹2,199", score = "96", image = "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Silk Satin Blouse", category = "Tops", fabric = "Mulberry Silk • Frictionless", price = "₹5,299", score = "99", image = "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format&fit=crop"),
            
            WishlistItem(name = "Linen Wide-Leg Pants", category = "Bottoms", fabric = "Pure Linen • Breathable & Cool", price = "₹2,499", score = "95", image = "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Bamboo Viscose Trousers", category = "Bottoms", fabric = "Anti-Irritation • Moisture Wicking", price = "₹2,799", score = "97", image = "https://images.unsplash.com/photo-1594932224010-70f90e549171?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Stretch Cotton Chinos", category = "Bottoms", fabric = "Comfort Fit • Easy Movement", price = "₹2,299", score = "96", image = "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Cotton Summer Shorts", category = "Bottoms", fabric = "GOTS Cotton • Lightweight", price = "₹1,899", score = "95", image = "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop"),
            
            WishlistItem(name = "Mulberry Silk Evening Dress", category = "Dresses & Outerwear", fabric = "Pure Silk • Elegant Flow", price = "₹6,999", score = "99", image = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Pastel Pink Wool Knit", category = "Dresses & Outerwear", fabric = "Smart Temperature Control", price = "₹3,499", score = "98", image = "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Classic Denim Jacket", category = "Dresses & Outerwear", fabric = "Cotton Twill • Smart Fabric", price = "₹4,299", score = "94", image = "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop"),
            WishlistItem(name = "Breathable Ethnic Kurta Set", category = "Dresses & Outerwear", fabric = "Pure Linen • Festive Soft", price = "₹4,599", score = "97", image = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop")
        )
    }

    val filteredItems = remember(searchQuery, wishlistItems.size) {
        if (searchQuery.isBlank()) {
            wishlistItems
        } else {
            wishlistItems.filter { 
                it.name.contains(searchQuery, ignoreCase = true) || 
                it.fabric.contains(searchQuery, ignoreCase = true) ||
                it.category.contains(searchQuery, ignoreCase = true)
            }
        }
    }

    val recommendations = listOf(
        "Lavender Knit Cardigan" to "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800",
        "Cooling Activewear Top" to "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
        "Organic Fleece Hoodie" to "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = false,
                    onClick = onHomeClick,
                    icon = { Icon(Icons.Outlined.Home, "Home") },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onSearchClick,
                    icon = { Icon(Icons.Outlined.Search, "Search") },
                    label = { Text("Search") }
                )
                NavigationBarItem(
                    selected = true,
                    onClick = { },
                    icon = { Icon(Icons.Filled.Favorite, "Wishlist") },
                    label = { Text("Wishlist") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = AccentBlue,
                        selectedTextColor = AccentBlue,
                        indicatorColor = LightBlue.copy(alpha = 0.3f)
                    )
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onProfileClick,
                    icon = { Icon(Icons.Outlined.Person, "Profile") },
                    label = { Text("Profile") }
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.1f))))
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "My Wishlist",
                            style = MaterialTheme.typography.headlineMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.Black
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(Icons.Filled.Favorite, "Wishlist", tint = AccentBlue, modifier = Modifier.size(24.dp))
                    }
                    Text(
                        text = "${wishlistItems.size} Saved Comfort Styles",
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.Gray)
                    )
                }
            }

            // Search & Filter
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search saved outfits...", color = Color.Gray) },
                    modifier = Modifier.weight(1f).height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    leadingIcon = { Icon(Icons.Default.Search, "Search", tint = AccentBlue) },
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor = Color.Transparent,
                        focusedBorderColor = AccentBlue,
                        unfocusedContainerColor = SoftGray.copy(alpha = 0.5f),
                        focusedContainerColor = White
                    )
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Wishlist Items
            if (filteredItems.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Outlined.FavoriteBorder,
                        contentDescription = null,
                        tint = Color.LightGray,
                        modifier = Modifier.size(80.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = if (searchQuery.isNotEmpty()) "No matching outfits found" else "Your wishlist is empty",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = Color.Gray)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Save styles you love for later",
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.LightGray)
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = onHomeClick,
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                    ) {
                        Text("Explore Products", fontWeight = FontWeight.Bold)
                    }
                }
            } else {
                Column(modifier = Modifier.padding(24.dp)) {
                    val categories = filteredItems.groupBy { it.category }
                    categories.forEach { (categoryName, categoryItems) ->
                        WishlistCategoryHeader(categoryName)
                        categoryItems.forEach { item ->
                            WishlistCard(
                                item = item,
                                onClick = { onProductClick(item.name) },
                                onRemove = { wishlistItems.remove(item) }
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                        }
                    }
                }
            }

            // AI Recommendations
            Column(modifier = Modifier.padding(bottom = 24.dp)) {
                Text(
                    text = "You May Also Like",
                    modifier = Modifier.padding(horizontal = 24.dp),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
                )
                Text(
                    text = "AI Recommended matching styles",
                    modifier = Modifier.padding(horizontal = 24.dp),
                    style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
                )
                Spacer(modifier = Modifier.height(16.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(recommendations) { (name, image) ->
                        Card(
                            onClick = { onProductClick(name) },
                            modifier = Modifier.width(160.dp),
                            shape = RoundedCornerShape(24.dp),
                            colors = CardDefaults.cardColors(containerColor = White)
                        ) {
                            Column {
                                Box {
                                    AsyncImage(
                                        model = image,
                                        contentDescription = name,
                                        modifier = Modifier.height(180.dp).fillMaxWidth().background(SoftGray),
                                        contentScale = ContentScale.Crop
                                    )
                                    Surface(
                                        modifier = Modifier.padding(8.dp).align(Alignment.TopStart),
                                        color = AccentBlue,
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text(
                                            text = "AI Pick",
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                            color = White,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                                Text(
                                    text = name,
                                    modifier = Modifier.padding(12.dp),
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun WishlistCategoryHeader(title: String) {
    Text(
        text = title,
        modifier = Modifier.padding(bottom = 16.dp),
        style = MaterialTheme.typography.titleMedium.copy(
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1A237E)
        )
    )
}

@Composable
fun WishlistCard(
    item: WishlistItem,
    onClick: () -> Unit,
    onRemove: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            Box {
                AsyncImage(
                    model = item.image,
                    contentDescription = item.name,
                    modifier = Modifier.fillMaxWidth().height(220.dp).background(SoftGray),
                    contentScale = ContentScale.Crop
                )
                IconButton(
                    onClick = onRemove,
                    modifier = Modifier.align(Alignment.TopEnd).padding(12.dp).background(White, CircleShape)
                ) {
                    Icon(Icons.Filled.Favorite, "Remove from wishlist", tint = Color.Red, modifier = Modifier.size(24.dp))
                }
                Surface(
                    modifier = Modifier.align(Alignment.BottomStart).padding(16.dp),
                    color = White.copy(alpha = 0.9f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Verified, "Skin Safe", tint = AccentBlue, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(item.badge, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AccentBlue)
                    }
                }
            }
            Column(modifier = Modifier.padding(16.dp)) {
                Text(item.name, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Color.Black)
                Spacer(modifier = Modifier.height(4.dp))
                Text(item.fabric, color = Color.Gray, fontSize = 13.sp)
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(item.price, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = AccentBlue)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, "Score", tint = Color(0xFFFFB300), modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${item.score}% Comfort", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                    }
                }
            }
        }
    }
}
