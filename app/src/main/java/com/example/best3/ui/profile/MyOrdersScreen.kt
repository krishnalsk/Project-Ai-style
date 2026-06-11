package com.example.best3.ui.profile

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*

data class OrderItem(
    val id: String,
    val date: String,
    val status: String,
    val total: String,
    val items: List<Triple<String, String, String>> // Name, Image, Price
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyOrdersScreen(onBackClick: () -> Unit, onOrderClick: (String) -> Unit) {
    val orders = listOf(
        OrderItem(
            id = "#ST67890",
            date = "Today",
            status = "Processing",
            total = "₹10,999",
            items = listOf(
                Triple("Azure Linen Shirt", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", "₹4,399"),
                Triple("Organic Cotton Hoodie", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", "₹5,799")
            )
        ),
        OrderItem(
            id = "#ST12345",
            date = "22 Oct, 2023",
            status = "Delivered",
            total = "₹4,399",
            items = listOf(
                Triple("Azure Linen Shirt", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", "₹4,399")
            )
        )
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("My Orders", fontWeight = FontWeight.ExtraBold, color = Color.Black) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.05f)))),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(orders) { order ->
                OrderCard(order) { onOrderClick(order.id) }
            }
        }
    }
}

@Composable
fun OrderCard(order: OrderItem, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Order ${order.id}", fontWeight = FontWeight.ExtraBold, color = Color.Black)
                    Text(order.date, color = Color.Gray, fontSize = 12.sp)
                }
                Surface(
                    color = if (order.status == "Delivered") Color(0xFFE8F5E9) else LightBlue.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = order.status,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        color = if (order.status == "Delivered") Color(0xFF2E7D32) else AccentBlue,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                order.items.forEach { (_, image, _) ->
                    AsyncImage(
                        model = image,
                        contentDescription = null,
                        modifier = Modifier.size(60.dp).clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop,
                        placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Total: ${order.total}", fontWeight = FontWeight.ExtraBold, color = Color.Black, fontSize = 16.sp)
                TextButton(onClick = onClick) {
                    Text("Details", color = AccentBlue, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.ChevronRight, null, modifier = Modifier.size(16.dp))
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MyOrdersScreenPreview() {
    StyleAiTheme {
        MyOrdersScreen(onBackClick = {}, onOrderClick = {})
    }
}
