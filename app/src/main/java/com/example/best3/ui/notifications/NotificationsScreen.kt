package com.example.best3.ui.notifications

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun NotificationsScreenPreview() {
    StyleAiTheme {
        NotificationsScreen(onBackClick = {})
    }
}

data class NotificationItem(
    val id: String,
    val title: String,
    val body: String,
    val time: String,
    val category: String, // Orders, AI, Offers, Wishlist
    val isRead: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(onBackClick: () -> Unit) {
    var activeCategory by remember { mutableStateOf("All") }
    val categories = listOf("All", "Orders", "AI Styles", "Offers", "Account")

    val notifications = listOf(
        NotificationItem("1", "Order Shipped!", "Your order #ST67890 has been picked up by the courier.", "2m ago", "Orders"),
        NotificationItem("2", "AI Style Alert", "New bamboo summer collection matches your skin profile.", "1h ago", "AI Styles"),
        NotificationItem("3", "Special Offer", "Get 20% off on all organic cotton wear this weekend.", "3h ago", "Offers", true),
        NotificationItem("4", "Security Update", "Your profile was updated from a new device.", "Yesterday", "Account", true)
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Notification Center", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back")
                    }
                },
                actions = {
                    TextButton(onClick = {}) {
                        Text("Mark all read", color = AccentBlue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
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
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.1f))))
        ) {
            // Category Filter
            LazyRow(
                contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { category ->
                    FilterChip(
                        selected = activeCategory == category,
                        onClick = { activeCategory = category },
                        label = { Text(category) },
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 24.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (notifications.isEmpty()) {
                    item {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.NotificationsNone,
                                contentDescription = null,
                                tint = Color.LightGray,
                                modifier = Modifier.size(80.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "No notifications yet",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = Color.Gray)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "We'll let you know when something happens",
                                style = MaterialTheme.typography.bodyMedium.copy(color = Color.LightGray)
                            )
                        }
                    }
                } else {
                    items(notifications) { notification ->
                        NotificationCard(notification)
                    }
                }
                
                item {
                    Spacer(modifier = Modifier.height(32.dp))
                    Text(
                        "Manage notification preferences in Settings",
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        color = Color.Gray,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@Composable
fun NotificationCard(item: NotificationItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = if (item.isRead) White.copy(alpha = 0.6f) else White),
        border = if (item.isRead) null else BorderStroke(1.dp, LightBlue.copy(alpha = 0.5f)),
        elevation = CardDefaults.cardElevation(defaultElevation = if (item.isRead) 0.dp else 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(
                        color = when(item.category) {
                            "Orders" -> Color(0xFFE3F2FD)
                            "AI Styles" -> Color(0xFFF3E5F5)
                            "Offers" -> Color(0xFFFFF3E0)
                            else -> Color(0xFFE8F5E9)
                        },
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when(item.category) {
                        "Orders" -> Icons.Default.LocalShipping
                        "AI Styles" -> Icons.Default.AutoAwesome
                        "Offers" -> Icons.Default.LocalOffer
                        else -> Icons.Default.Person
                    },
                    contentDescription = item.category,
                    tint = when(item.category) {
                        "Orders" -> Color(0xFF1976D2)
                        "AI Styles" -> Color(0xFF7B1FA2)
                        "Offers" -> Color(0xFFF57C00)
                        else -> Color(0xFF388E3C)
                    },
                    modifier = Modifier.size(20.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(item.title, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = if (item.isRead) Color.Gray else Color.Black)
                    Text(item.time, fontSize = 11.sp, color = Color.Gray)
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(item.body, fontSize = 13.sp, color = Color.DarkGray, lineHeight = 18.sp)
            }
            
            if (!item.isRead) {
                Box(
                    modifier = Modifier
                        .padding(start = 8.dp, top = 4.dp)
                        .size(8.dp)
                        .background(AccentBlue, CircleShape)
                )
            }
        }
    }
}
