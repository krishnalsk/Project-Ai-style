package com.example.best3.ui.wishlist

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
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

@Preview(showBackground = true)
@Composable
fun SavedItemsScreenPreview() {
    StyleAiTheme {
        SavedItemsScreen(onBackClick = {}, onProductClick = {})
    }
}

data class SavedItem(
    val name: String,
    val price: String,
    val image: String,
    val brand: String = "Style AI Premium"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SavedItemsScreen(
    onBackClick: () -> Unit,
    onProductClick: (String) -> Unit
) {
    val savedItems = listOf(
        SavedItem("Azure Linen Shirt", "₹4,399", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"),
        SavedItem("Cotton Summer Shorts", "₹1,299", "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400"),
        SavedItem("Silk Blouse", "₹3,999", "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=400"),
        SavedItem("Bamboo Polo", "₹2,199", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400"),
        SavedItem("Merino Wool Sweater", "₹7,299", "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=400"),
        SavedItem("Linen Casual Pants", "₹2,899", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400")
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Saved Items", fontWeight = FontWeight.ExtraBold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    IconButton(onClick = { /* Edit list */ }) {
                        Icon(Icons.Default.Edit, null, tint = AccentBlue)
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
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.05f))))
        ) {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(24.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(savedItems) { item ->
                    SavedItemCard(item, onProductClick)
                }
            }
        }
    }
}

@Composable
fun SavedItemCard(item: SavedItem, onClick: (String) -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick(item.name) },
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            Box {
                AsyncImage(
                    model = item.image,
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp),
                    contentScale = ContentScale.Crop,
                    placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                )
                IconButton(
                    onClick = { /* Remove from saved */ },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .size(32.dp)
                        .background(White.copy(alpha = 0.8f), CircleShape)
                ) {
                    Icon(Icons.Default.Bookmark, null, tint = AccentBlue, modifier = Modifier.size(18.dp))
                }
            }
            Column(modifier = Modifier.padding(16.dp)) {
                Text(item.brand, color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text(
                    text = item.name,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 14.sp,
                    color = Color.Black,
                    maxLines = 1
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = item.price,
                    fontWeight = FontWeight.Black,
                    color = AccentBlue,
                    fontSize = 16.sp
                )
            }
        }
    }
}
