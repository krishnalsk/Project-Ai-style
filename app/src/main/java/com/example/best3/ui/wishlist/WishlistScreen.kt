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
    val name: String,
    val fabric: String,
    val price: String,
    val score: String,
    val image: String,
    val badge: String = "Skin Safe"
)

@Composable
fun WishlistScreen(
    onBackClick: () -> Unit,
    onProductClick: (String) -> Unit,
    onHomeClick: () -> Unit,
    onSearchClick: () -> Unit,
    onProfileClick: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    
    val items = listOf(
        WishlistItem("Merino Wool Sweatshirt", "Merino Wool • Temperature Control", "₹7,299", "98", "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Organic Cotton T-Shirt", "Organic Cotton • Hypoallergenic", "₹1,499", "99", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Bamboo Polo Shirt", "Bamboo Fiber • Sweat Absorption", "₹2,199", "96", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Linen Casual Shirt", "Pure Linen • Breathable & Cool", "₹2,899", "97", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Organic Cotton Joggers", "Soft Cotton • All-Day Comfort", "₹1,899", "98", "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Linen Pants", "Summer Friendly • Breathable", "₹2,499", "95", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Bamboo Trousers", "Anti-Irritation • Moisture Wicking", "₹2,799", "97", "https://images.unsplash.com/photo-1594932224010-70f90e549171?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Stretch Chinos", "Comfort Fit • Easy Movement", "₹2,299", "96", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Organic Cotton Tee", "Gentle on Sensitive Skin", "₹1,399", "99", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Bamboo Comfort Top", "Moisture Wicking • Lightweight", "₹1,899", "97", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80"),
        WishlistItem("Merino Wool Sweater", "Smart Temperature Control", "₹6,999", "99", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=500"),
        WishlistItem("Cotton Palazzo", "All-Day Comfort • Breathable", "₹1,999", "94", "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&q=80&w=500")
    )

    val recommendations = listOf(
        "Soft Silk Blouse" to "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=500",
        "Linen Summer Shorts" to "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=500",
        "Eco-Friendly Cotton Dress" to "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=500"
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = White,
                tonalElevation = 0.dp
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
                        text = "Saved Comfort Styles",
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
                Spacer(modifier = Modifier.width(12.dp))
                Surface(
                    onClick = { },
                    modifier = Modifier.size(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    color = SoftGray.copy(alpha = 0.5f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Tune, "Filter", tint = AccentBlue)
                    }
                }
            }

            // Wishlist Items
            if (items.isEmpty()) {
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
                        text = "Your wishlist is empty",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = Color.Gray)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Save styles you love for later",
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.LightGray)
                    )
                }
            } else {
                Column(modifier = Modifier.padding(24.dp)) {
                    WishlistCategoryHeader("Boys - Tops")
                    items.subList(0, 4).forEach { item ->
                        WishlistCard(item, onProductClick)
                        Spacer(modifier = Modifier.height(20.dp))
                    }
                    
                    WishlistCategoryHeader("Boys - Bottoms")
                    items.subList(4, 8).forEach { item ->
                        WishlistCard(item, onProductClick)
                        Spacer(modifier = Modifier.height(20.dp))
                    }

                    WishlistCategoryHeader("Girls - Tops & Bottoms")
                    items.subList(8, 12).forEach { item ->
                        WishlistCard(item, onProductClick)
                        Spacer(modifier = Modifier.height(20.dp))
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
                            modifier = Modifier.width(160.dp),
                            shape = RoundedCornerShape(24.dp),
                            colors = CardDefaults.cardColors(containerColor = White)
                        ) {
                            Column {
                                Box {
                                    AsyncImage(
                                        model = image,
                                        contentDescription = name,
                                        modifier = Modifier.height(180.dp).fillMaxWidth(),
                                        contentScale = ContentScale.Crop,
                                        placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
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
            color = Color(0xFF1A237E) // Dark blue matching reference
        )
    )
}

@Composable
fun WishlistCard(item: WishlistItem, onClick: (String) -> Unit) {
    Card(
        onClick = { onClick(item.name) },
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
                    modifier = Modifier.fillMaxWidth().height(220.dp),
                    contentScale = ContentScale.Crop,
                    placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                )
                IconButton(
                    onClick = { },
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
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AutoAwesome, "AI comfort score", tint = AccentBlue, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "${item.score}% Comfort", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = AccentBlue)
                    }
                }
            }
            
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.name,
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black, color = Color.Black),
                            maxLines = 1
                        )
                        Text(text = item.fabric, color = Color.Black, fontSize = 14.sp, fontWeight = FontWeight.Black)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = item.price,
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black, color = Color.Black),
                        maxLines = 1,
                        softWrap = false
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = Color.Black,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = item.badge,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            color = White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                    
                    Button(
                        onClick = { },
                        modifier = Modifier.height(44.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                    ) {
                        Icon(Icons.Default.ShoppingBag, "Add to cart", modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Add to Cart")
                    }
                }
            }
        }
    }
}
