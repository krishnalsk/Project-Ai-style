package com.example.best3.ui.search

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Search
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
fun SearchScreenPreview() {
    StyleAiTheme {
        SearchScreen(
            onBackClick = {},
            onProductClick = {},
            onHomeClick = {},
            onWishlistClick = {},
            onProfileClick = {},
            onCategoryClick = {}
        )
    }
}

data class Product(
    val name: String,
    val fabric: String,
    val price: String,
    val score: String,
    val image: String,
    val tags: List<String> = listOf("AI Recommended", "Skin Safe")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onBackClick: () -> Unit,
    onProductClick: (String) -> Unit,
    onHomeClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onProfileClick: () -> Unit,
    onCategoryClick: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    val categories = listOf("Summer", "Winter", "Casual", "Formal", "GymWear", "EcoFriendly", "SensitiveSkin")
    
    val suggestions = listOf(
        "Best for Hot Weather" to "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
        "Dermatitis Safe Fabrics" to "https://images.unsplash.com/photo-1576991040578-838031599818?w=400",
        "Breathable Cotton Picks" to "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400",
        "Trending Global Styles" to "https://images.unsplash.com/photo-1445205170230-053b830c6050?w=400"
    )

    val products = listOf(
        Product("Cooling Linen Shirt", "100% Organic Linen", "₹4,399", "98", "https://images.unsplash.com/photoAN-1596755094514-f87e34085b2c?w=800"),
        Product("Organic Cotton Hoodie", "GOTS Certified Cotton", "₹5,799", "95", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"),
        Product("Premium Silk Blouse", "100% Mulberry Silk", "₹6,499", "99", "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800"),
        Product("Eco-Cotton Dress", "Recycled Cotton Blend", "₹4,199", "94", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800")
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
                    icon = { Icon(Icons.Default.Home, "Home") },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = true,
                    onClick = { },
                    icon = { Icon(Icons.Default.Search, "Search") },
                    label = { Text("Search") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = AccentBlue,
                        selectedTextColor = AccentBlue,
                        indicatorColor = LightBlue.copy(alpha = 0.3f)
                    )
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onWishlistClick,
                    icon = { Icon(Icons.Outlined.FavoriteBorder, "Wishlist") },
                    label = { Text("Wishlist") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onProfileClick,
                    icon = { Icon(Icons.Default.Person, "Profile") },
                    label = { Text("Profile") }
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.2f))))
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {
            // Top Section
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = "Find Your Comfort Style",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.Black
                    )
                )
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search breathable outfits...", color = Color.Gray) },
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        leadingIcon = { Icon(Icons.Outlined.Search, "Search", tint = AccentBlue) },
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.Transparent,
                            focusedBorderColor = AccentBlue,
                            unfocusedContainerColor = SoftGray.copy(alpha = 0.5f),
                            focusedContainerColor = White
                        )
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Surface(
                        onClick = { /* Filter */ },
                        modifier = Modifier.size(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        color = AccentBlue
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(Icons.Default.Tune, "Filter", tint = White)
                        }
                    }
                }
            }

            // Categories
            LazyRow(
                contentPadding = PaddingValues(horizontal = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { category ->
                    Surface(
                        onClick = { onCategoryClick(category) },
                        shape = CircleShape,
                        color = if (category == "SensitiveSkin") AccentBlue else White,
                        border = if (category == "SensitiveSkin") null else BorderStroke(1.dp, LightBlue)
                    ) {
                        Text(
                            text = when(category) {
                                "GymWear" -> "Gym Wear"
                                "EcoFriendly" -> "Eco-Friendly"
                                "SensitiveSkin" -> "Sensitive Skin"
                                else -> category
                            },
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
                            color = if (category == "SensitiveSkin") White else Color.DarkGray,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                    }
                }
            }

            // AI Smart Suggestions
            Column(modifier = Modifier.padding(top = 32.dp)) {
                Text(
                    text = "AI Smart Suggestions",
                    modifier = Modifier.padding(horizontal = 24.dp),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
                )
                Spacer(modifier = Modifier.height(16.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(suggestions) { (title, image) ->
                        Card(
                            modifier = Modifier.size(width = 240.dp, height = 140.dp),
                            shape = RoundedCornerShape(24.dp)
                        ) {
                            Box {
                                AsyncImage(
                                    model = image,
                                    contentDescription = title,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop,
                                    placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                                )
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.6f))))
                                )
                                Text(
                                    text = title,
                                    modifier = Modifier
                                        .align(Alignment.BottomStart)
                                        .padding(16.dp),
                                    color = White,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // Search Results
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = "Personalized Picks",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
                )
                Spacer(modifier = Modifier.height(16.dp))
                if (products.isEmpty()) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.SearchOff,
                            contentDescription = null,
                            tint = Color.LightGray,
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No results found",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = Color.Gray)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Try adjusting your search or filters",
                            style = MaterialTheme.typography.bodyMedium.copy(color = Color.LightGray)
                        )
                    }
                } else {
                    products.forEach { product ->
                        ProductCard(product, onProductClick)
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun ProductCard(product: Product, onClick: (String) -> Unit) {
    Card(
        onClick = { onClick(product.name) },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = product.image,
                contentDescription = product.name,
                modifier = Modifier
                    .size(100.dp)
                    .clip(RoundedCornerShape(16.dp)),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black),
                        modifier = Modifier.weight(1f),
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(
                        color = Color.Black,
                        shape = CircleShape
                    ) {
                        Text(
                            text = "${product.score}%",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            color = White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            maxLines = 1
                        )
                    }
                }
                Text(text = product.fabric, color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    product.tags.forEach { tag ->
                        Surface(
                            color = AccentBlue.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = tag,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                fontSize = 10.sp,
                                color = Color.Black, // Changed from AccentBlue to Black
                                fontWeight = FontWeight.Black
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.price,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Black,
                            color = Color.Black
                        ),
                        maxLines = 1,
                        softWrap = false
                    )
                    IconButton(
                        onClick = { },
                        modifier = Modifier
                            .size(32.dp)
                            .background(AccentBlue, CircleShape)
                    ) {
                        Icon(Icons.Default.Add, "Add to cart", tint = White, modifier = Modifier.size(20.dp))
                    }
                }
            }
        }
    }
}
