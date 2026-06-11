package com.example.best3.ui.home

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun CategoryScreenPreview() {
    StyleAiTheme {
        CategoryScreen(
            onBackClick = {},
            onProductClick = {},
            onAiStylistClick = {},
            onProfileClick = {},
            onSearchClick = {},
            onWishlistClick = {}
        )
    }
}

enum class StyleCategory(
    val title: String,
    val bannerText: String,
    val recommendationTitle: String,
    val recommendationSubtitle: String,
    val recommendationIcon: ImageVector,
    val themeGradient: List<Color>,
    val cardGradient: List<Color>,
    val accentColor: Color,
    val products: List<ProductData>
) {
    Summer(
        title = "Summer Comfort",
        bannerText = "Stay cool with breathable summer outfits",
        recommendationTitle = "34°C – Stay Cool & Comfortable",
        recommendationSubtitle = "Linen • Cotton • Bamboo Fabric",
        recommendationIcon = Icons.Default.WbSunny,
        themeGradient = listOf(White, Color(0xFFFFF9C4)), // Yellowish
        cardGradient = listOf(Color(0xFF4FC3F7), Color(0xFF81D4FA)),
        accentColor = Color(0xFF0288D1),
        products = listOf(
            ProductData("Cooling Linen Shirt", "Sweat Free • Breathable", "₹4,399", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop"),
            ProductData("Lightweight Cotton Tee", "UV Protection • Soft", "₹2,999", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop"),
            ProductData("Summer Relaxed Shorts", "Quick Dry • Comfort", "₹3,299", "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop")
        )
    ),
    Winter(
        title = "Winter Essentials",
        bannerText = "Cozy & skin-safe winter wear",
        recommendationTitle = "12°C – Warm & Skin Safe",
        recommendationSubtitle = "Wool Blend • Thermal Cotton • Fleece",
        recommendationIcon = Icons.Default.AcUnit,
        themeGradient = listOf(White, Color(0xFFE1F5FE)), // Blueish
        cardGradient = listOf(Color(0xFF455A64), Color(0xFF78909C)),
        accentColor = Color(0xFF263238),
        products = listOf(
            ProductData("Thermal Hoodie", "Warm Protection • Soft", "₹5,499", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"),
            ProductData("Soft Wool Jacket", "Skin Friendly • Premium", "₹9,999", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"),
            ProductData("Winter Comfort Pants", "Heat Retention • Soft", "₹4,599", "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop")
        )
    ),
    Casual(
        title = "Everyday Casual Style",
        bannerText = "Relaxed outfits for your daily routine",
        recommendationTitle = "Daily Comfort Selection",
        recommendationSubtitle = "Soft Cotton & Relaxed Fits",
        recommendationIcon = Icons.Default.Coffee,
        themeGradient = listOf(White, Color(0xFFF3E5F5)), // Purpleish
        cardGradient = listOf(Color(0xFFBA68C8), Color(0xFFCE93D8)),
        accentColor = Color(0xFF7B1FA2),
        products = listOf(
            ProductData("Relax Fit T-Shirt", "Daily Comfort • Soft", "₹2,499", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"),
            ProductData("Denim Casual Shirt", "Lightweight • Style", "₹3,799", "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop"),
            ProductData("Cotton Joggers", "Skin Safe • Breathable", "₹3,499", "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600&auto=format&fit=crop")
        )
    ),
    GymWear(
        title = "Active Comfort",
        bannerText = "Smart performance gear for workout",
        recommendationTitle = "Sweat-Free Performance",
        recommendationSubtitle = "Breathable Mesh • Anti-Irritation",
        recommendationIcon = Icons.Default.FitnessCenter,
        themeGradient = listOf(White, Color(0xFFE8EAF6)), // Sporty Blue
        cardGradient = listOf(Color(0xFF1A237E), Color(0xFF3949AB)),
        accentColor = Color(0xFF1A237E),
        products = listOf(
            ProductData("Cooling Activewear Tee", "Anti-Sweat • Mesh", "₹3,199", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"),
            ProductData("Dry-Fit Jacket", "Breathable • Lightweight", "₹6,299", "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop")
        )
    ),
    EcoFriendly(
        title = "Eco Comfort Collection",
        bannerText = "Sustainably sourced skin-safe fashion",
        recommendationTitle = "Earth-Friendly Picks",
        recommendationSubtitle = "Organic • Recycled • Biodegradable",
        recommendationIcon = Icons.Default.Eco,
        themeGradient = listOf(White, Color(0xFFE8F5E9)), // Greenish
        cardGradient = listOf(Color(0xFF4CAF50), Color(0xFF81C784)),
        accentColor = Color(0xFF2E7D32),
        products = listOf(
            ProductData("Organic Cotton Shirt", "Sustainable • Soft", "₹4,999", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop"),

            ProductData("Recycled Fabric Hoodie", "Carbon Neutral • Cozy", "₹6,099", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop")
        )
    ),
    SensitiveSkin(
        title = "Sensitive Skin Safe Wear",
        bannerText = "Healthcare-inspired fashion comfort",
        recommendationTitle = "Dermatologist Approved",
        recommendationSubtitle = "Hypoallergenic • Fragrance Free",
        recommendationIcon = Icons.Default.HealthAndSafety,
        themeGradient = listOf(White, Color(0xFFE0F2F1)), // Tealish
        cardGradient = listOf(Color(0xFF009688), Color(0xFF4DB6AC)),
        accentColor = Color(0xFF00796B),
        products = listOf(
            ProductData("Hypoallergenic T-Shirt", "100% Pure Cotton", "₹3,599", "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop"),
            ProductData("Anti-Irritation Hoodie", "Fragrance Free • Soft", "₹5,799", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"),
            ProductData("Pure Mulberry Silk Robe", "Protective Layer • Frictionless", "₹8,499", "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=800&auto=format&fit=crop")
        )
    ),
    Formal(
        title = "Premium Formal Wear",
        bannerText = "Elegant & comfortable professional attire",
        recommendationTitle = "Professional & Skin-Safe",
        recommendationSubtitle = "Silk Blend • Breathable Wool • Fine Cotton",
        recommendationIcon = Icons.Default.BusinessCenter,
        themeGradient = listOf(White, Color(0xFFF5F5F5)), // Light Grey
        cardGradient = listOf(Color(0xFF37474F), Color(0xFF546E7A)),
        accentColor = Color(0xFF263238),
        products = listOf(
            ProductData("Classic Silk Blend Shirt", "Premium Feel • Breathable", "₹5,999", "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=600&auto=format&fit=crop"),
            ProductData("Breathable Formal Trousers", "Stretch Comfort • Skin Safe", "₹4,599", "https://images.unsplash.com/photo-1594932224010-70f90e549171?q=80&w=600&auto=format&fit=crop"),
            ProductData("Lightweight Formal Blazer", "Soft Lining • Professional", "₹12,999", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop")
        )
    )
}

data class ProductData(
    val name: String,
    val label: String,
    val price: String,
    val imageUrl: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryScreen(
    initialCategory: StyleCategory = StyleCategory.Summer,
    onBackClick: () -> Unit,
    onProductClick: (String) -> Unit,
    onAiStylistClick: () -> Unit,
    onProfileClick: () -> Unit,
    onSearchClick: () -> Unit,
    onWishlistClick: () -> Unit
) {
    var selectedCategory by remember { mutableStateOf(initialCategory) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(icon = { Icon(Icons.Outlined.Home, null) }, label = { Text("Home") }, selected = false, onClick = onBackClick)
                NavigationBarItem(icon = { Icon(Icons.Outlined.Search, null) }, label = { Text("Search") }, selected = false, onClick = onSearchClick)
                NavigationBarItem(icon = { Icon(Icons.Outlined.FavoriteBorder, null) }, label = { Text("Wishlist") }, selected = false, onClick = onWishlistClick)
                NavigationBarItem(icon = { Icon(Icons.Outlined.Person, null) }, label = { Text("Profile") }, selected = false, onClick = onProfileClick)
            }
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onAiStylistClick,
                containerColor = selectedCategory.accentColor,
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
                .background(Brush.verticalGradient(selectedCategory.themeGradient))
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
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier.background(White.copy(alpha = 0.5f), CircleShape)
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                }
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(selectedCategory.accentColor.copy(alpha = 0.1f))
                        .border(1.dp, selectedCategory.accentColor.copy(alpha = 0.2f), CircleShape)
                        .clickable { onProfileClick() }
                ) {
                    Icon(
                        Icons.Default.Person,
                        null,
                        modifier = Modifier.align(Alignment.Center),
                        tint = selectedCategory.accentColor
                    )
                }
            }

            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                Text(
                    text = "Hello, Balamurali",
                    style = MaterialTheme.typography.bodyLarge.copy(color = Color.Black, fontWeight = FontWeight.ExtraBold)
                )
                Text(
                    text = selectedCategory.title,
                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
                )
                Text(
                    text = selectedCategory.bannerText,
                    style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray, fontWeight = FontWeight.Medium)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Recommendation Card (Banner)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                shape = RoundedCornerShape(24.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Brush.linearGradient(selectedCategory.cardGradient))
                        .padding(24.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = selectedCategory.recommendationTitle,
                                color = White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = selectedCategory.recommendationSubtitle,
                                color = White.copy(alpha = 0.9f),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        Surface(
                            modifier = Modifier.size(56.dp),
                            shape = CircleShape,
                            color = White.copy(alpha = 0.2f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = selectedCategory.recommendationIcon,
                                    contentDescription = null,
                                    tint = White,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Category Tabs
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(StyleCategory.values()) { category ->
                    val isSelected = selectedCategory == category
                    Surface(
                        onClick = { selectedCategory = category },
                        shape = RoundedCornerShape(16.dp),
                        color = if (isSelected) selectedCategory.accentColor else White,
                        tonalElevation = if (isSelected) 0.dp else 2.dp,
                        modifier = Modifier.padding(4.dp)
                    ) {
                        Text(
                            text = if (category == StyleCategory.GymWear) "Gym Wear" 
                                   else if (category == StyleCategory.EcoFriendly) "Eco-Friendly"
                                   else if (category == StyleCategory.SensitiveSkin) "Sensitive Skin"
                                   else category.name,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                            color = if (isSelected) White else Color.Gray,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Products Section
            Text(
                text = "Personalized for You",
                modifier = Modifier.padding(horizontal = 24.dp),
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                selectedCategory.products.forEach { product ->
                    CategoryProductItem(product, selectedCategory.accentColor) { onProductClick(product.name) }
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
            
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
fun CategoryProductItem(product: ProductData, accentColor: Color, onClick: () -> Unit) {
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
                    .clip(RoundedCornerShape(topStart = 24.dp, bottomStart = 24.dp)),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
            )
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = product.name,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 17.sp,
                    color = Color.Black,
                    maxLines = 1
                )
                Surface(
                    color = accentColor.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    Text(
                        text = product.label,
                        color = accentColor,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.weight(1f))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = product.price,
                        color = Color.Black,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp
                    )
                    IconButton(
                        onClick = { },
                        modifier = Modifier.size(36.dp).background(accentColor, CircleShape)
                    ) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = "Add",
                            tint = White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}
